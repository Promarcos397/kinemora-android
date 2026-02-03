import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { Movie } from './types';
import { useGlobalContext } from './context/GlobalContext';

// Mobile Components
import BottomNav from './components/BottomNav';
import MobileInfoModal from './components/MobileInfoModal';
import BookDetailsModal from './components/BookDetailsModal';

// Pages
import MobileHomePage from './pages/MobileHomePage';
import MoviesPage from './pages/MoviesPage';
import NewPopularPage from './pages/NewPopularPage';
import MyListPage from './pages/MyListPage';
import ReadsPage from './pages/ReadsPage';
import ReaderPage from './pages/ReaderPage';
import WatchPage from './pages/WatchPage';
import SettingsPage from './pages/SettingsPage';

/**
 * Mobile App - Netflix-style mobile UI
 * - No desktop navbar, uses bottom nav
 * - Near-black theme (#0a0a0a)
 * - Touch-friendly, no hover effects
 * - Full-screen modals
 */
const App: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { myList, toggleMyList, updateVideoState } = useGlobalContext();

  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [selectedBook, setSelectedBook] = useState<Movie | null>(null);

  // Prefetch last played on mount
  useEffect(() => {
    try {
      const last = localStorage.getItem('kinemora-last-played');
      if (last) {
        const data = JSON.parse(last);
        console.log('[App] Found last played:', data.title);
      }
    } catch (e) { }
  }, []);

  // Handlers
  const handleSelectMovie = (movie: Movie) => {
    if (['series', 'comic', 'manga', 'local'].includes(movie.media_type || '')) {
      handleSelectBook(movie);
      return;
    }
    setSelectedMovie(movie);
  };

  const handlePlay = (movie: Movie, season?: number, episode?: number) => {
    const type = movie.media_type || (movie.title ? 'movie' : 'tv');
    let url = `/watch/${type}/${movie.id}`;
    if (season && episode) {
      url += `?season=${season}&episode=${episode}`;
    }

    // Save for next session
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

  const handleSelectBook = (book: Movie) => {
    if (book.media_type === 'local') {
      navigate(`/read/local/${book.id}/1`);
    } else {
      setSelectedBook(book);
    }
  };

  const handleRead = (book: Movie, chapterId: string) => {
    const type = book.media_type === 'local' ? 'local'
      : book.media_type === 'series' ? 'series'
        : (book.media_type === 'comic' ? 'comic' : 'manga');
    navigate(`/read/${type}/${book.id}/${chapterId}`);
    setSelectedBook(null);
  };

  const isFullscreen = location.pathname.startsWith('/watch') || location.pathname.startsWith('/read/');
  const isInList = (movieId: number) => myList.some(m => m.id === movieId);

  // Full-screen views (no bottom nav)
  if (isFullscreen) {
    return (
      <div className="bg-[#0a0a0a] min-h-screen">
        <Routes>
          <Route path="/watch/:type/:id" element={<WatchPage />} />
          <Route path="/read/:type/:id/:chapterId" element={<ReaderPage />} />
        </Routes>
      </div>
    );
  }

  return (
    <div className="bg-[#0a0a0a] min-h-screen pb-16">
      {/* Main content */}
      <Routes>
        <Route path="/" element={<MobileHomePage />} />
        <Route
          path="/movies"
          element={
            <MoviesPage
              onSelectMovie={handleSelectMovie}
              onPlay={handlePlay}
              seekTime={0}
            />
          }
        />
        <Route
          path="/new-popular"
          element={<NewPopularPage onSelectMovie={handleSelectMovie} />}
        />
        <Route
          path="/reads"
          element={<ReadsPage onSelectBook={handleSelectBook} onRead={handleRead} />}
        />
        <Route
          path="/my-list"
          element={<MyListPage onSelectMovie={handleSelectMovie} />}
        />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/settings/:section" element={<SettingsPage />} />
      </Routes>

      {/* Bottom Navigation */}
      <BottomNav />

      {/* Modals */}
      {selectedMovie && (
        <MobileInfoModal
          movie={selectedMovie}
          isOpen={!!selectedMovie}
          onClose={() => setSelectedMovie(null)}
          onPlay={(s, e) => handlePlay(selectedMovie, s, e)}
          isInList={isInList(selectedMovie.id)}
          onToggleList={() => toggleMyList(selectedMovie)}
        />
      )}

      <BookDetailsModal
        book={selectedBook}
        onClose={() => setSelectedBook(null)}
        onRead={handleRead}
      />
    </div>
  );
};

export default App;
