import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { Movie } from './types';
import useSearch from './hooks/useSearch';
import { useTitle } from './context/TitleContext';
import { useGlobalContext } from './context/GlobalContext';
import { prefetchStream } from './services/api';

// Components
import Layout from './components/Layout';
import InfoModal from './components/InfoModal';
import BookDetailsModal from './components/BookDetailsModal';
import WatchPage from './pages/WatchPage';
import TitleBar from './components/TitleBar';

// Pages
import HomePage from './pages/HomePage';
import ShowsPage from './pages/ShowsPage';
import MoviesPage from './pages/MoviesPage';
import NewPopularPage from './pages/NewPopularPage';
import MyListPage from './pages/MyListPage';
import ReadsPage from './pages/ReadsPage';
import ReaderPage from './pages/ReaderPage';
import SearchResultsPage from './pages/SearchResultsPage';
import SettingsPage from './pages/SettingsPage';

const App: React.FC = () => {
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [selectedBook, setSelectedBook] = useState<Movie | null>(null);
  const { query, setQuery, results, isLoading, mode, setMode } = useSearch();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { setPageTitle } = useTitle();
  const { updateVideoState } = useGlobalContext();

  // Sync search query from URL on mount
  useEffect(() => {
    const urlQuery = searchParams.get('q');
    if (urlQuery && !query) {
      setQuery(urlQuery);
    }
  }, []);

  // Prefetch last played on mount
  useEffect(() => {
    try {
      const last = localStorage.getItem('kinemora-last-played');
      if (last) {
        const data = JSON.parse(last);
        if (data.id && data.title && data.year) {
          prefetchStream(data.title, data.year, String(data.id), data.type, data.season, data.episode);
          console.log('[App] Prefetching last played:', data.title);
        }
      }
    } catch (e) { }
  }, []);



  // Update page title based on route
  useEffect(() => {
    const path = location.pathname;

    // Don't update title for watch page (WatchPage handles its own title)
    if (path.startsWith('/watch')) return;
    if (path.startsWith('/read')) return;

    if (query) {
      setPageTitle(`Search: ${query}`);
    } else if (path === '/') {
      setPageTitle('Home');
    } else if (path === '/tv') {
      setPageTitle('Shows');
    } else if (path === '/movies') {
      setPageTitle('Movies');
    } else if (path === '/reads') {
      setPageTitle('Reads');
    } else if (path === '/new') {
      setPageTitle('New & Popular');
    } else if (path === '/list') {
      setPageTitle('My List');
    } else if (path.startsWith('/settings')) {
      setPageTitle('Settings');
    } else {
      setPageTitle('');
    }
  }, [location.pathname, query, setPageTitle]);

  /* State for Video Sync */
  const [heroSeekTime, setHeroSeekTime] = useState(0);
  const [infoInitialTime, setInfoInitialTime] = useState(0);
  const [infoVideoId, setInfoVideoId] = useState<string | undefined>(undefined);

  // Scroll to top on route change
  useEffect(() => {
    if (!location.pathname.startsWith('/watch') && !location.pathname.startsWith('/read')) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [location.pathname]);

  // Navigation handlers
  const handleSelectMovie = (movie: Movie, time?: number, videoId?: string) => {
    // Fix: Divert Book/Comic types to the correct handler (e.g. from My List)
    if (['series', 'comic', 'manga', 'local'].includes(movie.media_type || '')) {
      handleSelectBook(movie);
      return;
    }

    setInfoInitialTime(time || 0);
    setInfoVideoId(videoId);
    setSelectedMovie(movie);
  };

  const handleCloseModal = (finalTime?: number) => {
    setSelectedMovie(null);
    setInfoVideoId(undefined);
    if (finalTime && finalTime > 0) {
      setHeroSeekTime(finalTime);
      if (selectedMovie) {
        updateVideoState(selectedMovie.id, finalTime);
      }
    }
  };

  const handlePlay = (movie: Movie, season?: number, episode?: number) => {
    // Navigate to watch page
    const type = movie.media_type || (movie.title ? 'movie' : 'tv');
    let url = `/watch/${type}/${movie.id}`;
    if (season && episode) {
      url += `?season=${season}&episode=${episode}`;
    }

    // Save last played for preloading on next app start
    const releaseDate = movie.release_date || movie.first_air_date;
    const year = releaseDate ? new Date(releaseDate).getFullYear() : undefined;
    localStorage.setItem('kinemora-last-played', JSON.stringify({
      id: movie.id,
      title: movie.title || movie.name,
      type,
      year,
      season: season || 1,
      episode: episode || 1,
      timestamp: Date.now()
    }));

    navigate(url);
    setSelectedMovie(null);
  };

  // Prefetch last played on app start
  useEffect(() => {
    const lastPlayed = localStorage.getItem('kinemora-last-played');
    if (lastPlayed) {
      try {
        const { title, type, year, season, episode, timestamp } = JSON.parse(lastPlayed);
        // Only prefetch if played within last 7 days
        if (Date.now() - timestamp < 7 * 24 * 60 * 60 * 1000) {
          const api = (window as any).electron?.consumet;
          if (api?.prefetchStream) {
            console.log('[App] Prefetching last played:', title);
            api.prefetchStream(title, type, year, season, episode);
          }
        }
      } catch (e) { /* ignore */ }
    }
  }, []);

  // Books
  const handleSelectBook = (book: Movie) => {
    if (book.media_type === 'local') {
      navigate(`/read/local/${book.id}/1`); // Direct to reader
    } else {
      setSelectedBook(book);
    }
  };

  const handleRead = (book: Movie, chapterId: string) => {
    // Route to appropriate reader based on media_type
    // 'series' = cloud comics from Supabase, 'local' = local CBZ, others = Consumet
    const type = book.media_type === 'local' ? 'local'
      : book.media_type === 'series' ? 'series'
        : (book.media_type === 'comic' ? 'comic' : 'manga');
    navigate(`/read/${type}/${book.id}/${chapterId}`);
    setSelectedBook(null);
  }

  // Determine active tab for Layout based on path
  const getActiveTab = () => {
    const path = location.pathname;
    if (path === '/') return 'home';
    if (path === '/tv') return 'tv';
    if (path === '/movies') return 'movies';
    if (path === '/reads') return 'reads';
    if (path === '/new') return 'new';
    if (path === '/list') return 'list';
    if (path.startsWith('/settings')) return 'settings';
    return 'home';
  };

  const activeTab = getActiveTab();
  const isWatching = location.pathname.startsWith('/watch') || location.pathname.startsWith('/read/');

  const handleTabChange = (tab: string) => {
    setQuery('');
    if (tab === 'home') navigate('/');
    else navigate(`/${tab}`);
  };

  // Update URL when search query changes
  const handleSearchChange = (newQuery: string) => {
    setQuery(newQuery);
    // Note: We don't update URL on every keystroke to avoid history spam
    // Deep linking is read on page load
  };

  // Don't render layout for watch page
  if (isWatching) {
    return (
      <>
        <TitleBar isOverlay={true} />
        <Routes>
          <Route path="/watch/:type/:id" element={<WatchPage />} />
          <Route path="/read/:type/:id/:chapterId" element={<ReaderPage />} />
        </Routes>
      </>
    );
  }

  return (
    <div className={`pt-8 ${(selectedMovie || selectedBook) ? 'overflow-hidden h-screen' : ''}`}>
      <TitleBar isOverlay={false} />
      <Layout
        searchQuery={query}
        setSearchQuery={handleSearchChange}
        activeTab={activeTab}
        setActiveTab={handleTabChange}
        showFooter={!query}
      >
        {/* Search Results Overlay Override */}
        {query.trim().length > 0 ? (
          <SearchResultsPage
            query={query}
            results={results}
            onSelectMovie={handleSelectMovie}
            onPlay={handlePlay}
            isLoading={isLoading}
            mode={mode}
            setMode={setMode}
          />
        ) : (
          <Routes>
            <Route path="/" element={<HomePage onSelectMovie={handleSelectMovie} onPlay={handlePlay} seekTime={heroSeekTime} />} />
            <Route path="/tv" element={<ShowsPage onSelectMovie={handleSelectMovie} onPlay={handlePlay} />} />
            <Route path="/movies" element={<MoviesPage onSelectMovie={handleSelectMovie} onPlay={handlePlay} seekTime={heroSeekTime} />} />
            <Route path="/reads" element={<ReadsPage onSelectBook={handleSelectBook} onRead={handleRead} />} />
            <Route path="/new" element={<NewPopularPage onSelectMovie={handleSelectMovie} />} />
            <Route path="/list" element={<MyListPage onSelectMovie={handleSelectMovie} />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/settings/:section" element={<SettingsPage />} />
          </Routes>
        )}
      </Layout>

      <InfoModal
        movie={selectedMovie}
        initialTime={infoInitialTime}
        onClose={handleCloseModal}
        onPlay={handlePlay}
        trailerId={infoVideoId}
      />

      <BookDetailsModal
        book={selectedBook}
        onClose={() => setSelectedBook(null)}
        onRead={handleRead}
      />
    </div>
  );
}

export default App;
