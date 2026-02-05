import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Movie } from '../types';
import {
    getPopularMovies, getTrendingAll, getTopRated, getTrendingTV,
    getSeasonDetails, getMovieVideos
} from '../services/api';
import { useGlobalContext } from '../context/GlobalContext';
import {
    ArrowLeft, MagnifyingGlass, List, X, CaretDown,
    Play, Plus, Check, DownloadSimple
} from '@phosphor-icons/react';

interface MobileHomePageProps {
    initialFilter?: 'none' | 'series' | 'films' | 'reads' | 'new' | 'mylist';
}

// Genre map for TMDB
const GENRE_MAP: { [key: number]: string } = {
    28: 'Action', 12: 'Adventure', 16: 'Animation', 35: 'Comedy',
    80: 'Crime', 99: 'Documentary', 18: 'Drama', 10751: 'Family',
    14: 'Fantasy', 36: 'History', 27: 'Horror', 10402: 'Music',
    9648: 'Mystery', 10749: 'Romance', 878: 'Sci-Fi', 10770: 'TV Movie',
    53: 'Thriller', 10752: 'War', 37: 'Western',
    10759: 'Action & Adventure', 10762: 'Kids', 10763: 'News',
    10764: 'Reality', 10765: 'Sci-Fi & Fantasy', 10766: 'Soap',
    10767: 'Talk', 10768: 'War & Politics'
};

// Categories list for overlay
const CATEGORIES = [
    { id: 'home', label: 'Home' },
    { id: 'mylist', label: 'My List' },
    { id: 'action', label: 'Action' },
    { id: 'anime', label: 'Anime' },
    { id: 'comedy', label: 'Comedies' },
    { id: 'crime', label: 'Crime' },
    { id: 'documentary', label: 'Documentaries' },
    { id: 'drama', label: 'Dramas' },
    { id: 'fantasy', label: 'Fantasy' },
    { id: 'horror', label: 'Horror' },
    { id: 'romance', label: 'Romance' },
    { id: 'sci-fi', label: 'Sci-Fi' },
    { id: 'thriller', label: 'Thrillers' },
];

/**
 * Mobile Home Page - Complete Netflix-style redesign
 */
export default function MobileHomePage({ initialFilter = 'none' }: MobileHomePageProps) {
    const navigate = useNavigate();
    const { myList, toggleList, continueWatching } = useGlobalContext();

    // Data state
    const [heroMovie, setHeroMovie] = useState<Movie | null>(null);
    const [trending, setTrending] = useState<Movie[]>([]);
    const [popular, setPopular] = useState<Movie[]>([]);
    const [topRated, setTopRated] = useState<Movie[]>([]);
    const [trendingTV, setTrendingTV] = useState<Movie[]>([]);
    const [loading, setLoading] = useState(true);

    // UI state
    const [activeFilter, setActiveFilter] = useState<string>(initialFilter);
    const [categoryOverlayOpen, setCategoryOverlayOpen] = useState(false);
    const [activeCategory, setActiveCategory] = useState('home');
    const [settingsOpen, setSettingsOpen] = useState(false);
    const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);

    // Page title based on filter
    const pageTitle = useMemo(() => {
        switch (activeFilter) {
            case 'series': return 'Series';
            case 'films': return 'Films';
            case 'reads': return 'Reads';
            case 'new': return 'New & Hot';
            case 'mylist': return 'My List';
            default: return 'Home';
        }
    }, [activeFilter]);

    const showBackArrow = activeFilter !== 'none';

    // Fetch data
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const [trendingData, popularData, topRatedData, tvData] = await Promise.all([
                    getTrendingAll(),
                    getPopularMovies(),
                    getTopRated(),
                    getTrendingTV()
                ]);

                setTrending(trendingData.results || []);
                setPopular(popularData.results || []);
                setTopRated(topRatedData.results || []);
                setTrendingTV(tvData.results || []);

                // Set hero from trending
                if (trendingData.results?.length) {
                    setHeroMovie(trendingData.results[0]);
                }
            } catch (err) {
                console.error('Error fetching data:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // Filter movies by type
    const filterMovies = (movies: Movie[]) => {
        if (activeFilter === 'none' || activeFilter === 'home') return movies;
        if (activeFilter === 'series') return movies.filter(m => m.media_type === 'tv' || m.first_air_date);
        if (activeFilter === 'films') return movies.filter(m => m.media_type === 'movie' || (!m.first_air_date && m.release_date));
        if (activeFilter === 'mylist') return myList;
        return movies;
    };

    // Get tags for hero
    const getHeroTags = (movie: Movie) => {
        const tags: string[] = [];
        if (movie.genre_ids) {
            movie.genre_ids.slice(0, 4).forEach(id => {
                if (GENRE_MAP[id]) tags.push(GENRE_MAP[id]);
            });
        }
        return tags;
    };

    // Handlers
    const handlePlay = (movie: Movie) => {
        const type = movie.media_type || (movie.title ? 'movie' : 'tv');
        navigate(`/watch/${type}/${movie.id}`);
    };

    const handleBack = () => {
        setActiveFilter('none');
        navigate('/');
    };

    const clearFilter = () => {
        setActiveFilter('none');
    };

    const isInList = (movieId: number) => myList.some(m => m.id === movieId);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen bg-[#0a0a0a]">
                <div className="w-8 h-8 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white pb-20">
            {/* ========== PAGE BAR ========== */}
            <div className="fixed top-0 left-0 right-0 h-12 bg-[#0a0a0a] flex items-center justify-between px-4 z-50">
                <div className="flex items-center gap-3">
                    {showBackArrow ? (
                        <button onClick={handleBack} className="p-2 -ml-2">
                            <ArrowLeft size={24} weight="bold" />
                        </button>
                    ) : (
                        <div className="w-8 h-8 text-red-600 font-bold text-2xl">K</div>
                    )}
                    <span className="text-lg font-semibold">{pageTitle}</span>
                </div>
                <div className="flex items-center gap-2">
                    <button className="p-2">
                        <DownloadSimple size={22} />
                    </button>
                    <button onClick={() => navigate('/search')} className="p-2">
                        <MagnifyingGlass size={22} />
                    </button>
                </div>
            </div>

            {/* ========== FILTER PILLS ========== */}
            <div className="fixed top-12 left-0 right-0 bg-[#0a0a0a] flex items-center gap-2 px-4 py-2 z-40 overflow-x-auto">
                {/* X button to clear filter */}
                {activeFilter !== 'none' && (
                    <button
                        onClick={clearFilter}
                        className="w-8 h-8 rounded-full border border-white/40 flex items-center justify-center flex-shrink-0"
                    >
                        <X size={16} />
                    </button>
                )}

                {/* Series pill */}
                <button
                    onClick={() => setActiveFilter(activeFilter === 'series' ? 'none' : 'series')}
                    className={`px-4 py-1.5 rounded-full text-sm font-medium flex-shrink-0 transition-all ${activeFilter === 'series'
                            ? 'bg-white text-black'
                            : 'border border-white/40 text-white'
                        }`}
                >
                    Series
                </button>

                {/* Films pill */}
                <button
                    onClick={() => setActiveFilter(activeFilter === 'films' ? 'none' : 'films')}
                    className={`px-4 py-1.5 rounded-full text-sm font-medium flex-shrink-0 transition-all ${activeFilter === 'films'
                            ? 'bg-white text-black'
                            : 'border border-white/40 text-white'
                        }`}
                >
                    Films
                </button>

                {/* Categories dropdown */}
                <button
                    onClick={() => setCategoryOverlayOpen(true)}
                    className="px-4 py-1.5 rounded-full text-sm font-medium border border-white/40 flex items-center gap-1.5 flex-shrink-0"
                >
                    Categories
                    <CaretDown size={14} />
                </button>
            </div>

            {/* ========== HERO CARD ========== */}
            <div className="pt-24 px-4">
                {heroMovie && (
                    <div
                        className="relative rounded-lg overflow-hidden"
                        onClick={() => setSelectedMovie(heroMovie)}
                    >
                        {/* Poster */}
                        <img
                            src={`https://image.tmdb.org/t/p/w780${heroMovie.poster_path}`}
                            alt={heroMovie.title || heroMovie.name}
                            className="w-full aspect-[2/3] object-cover max-h-[60vh]"
                        />

                        {/* Gradient overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent" />

                        {/* Content */}
                        <div className="absolute bottom-0 left-0 right-0 p-4">
                            {/* Title */}
                            <h1 className="text-2xl font-bold mb-2">
                                {heroMovie.title || heroMovie.name}
                            </h1>

                            {/* Tags - bullet separated */}
                            <div className="text-sm text-gray-300 mb-4">
                                {getHeroTags(heroMovie).join(' • ')}
                            </div>

                            {/* Buttons */}
                            <div className="flex gap-3">
                                <button
                                    onClick={(e) => { e.stopPropagation(); handlePlay(heroMovie); }}
                                    className="flex-1 bg-white text-black py-2 px-4 rounded flex items-center justify-center gap-2 font-semibold"
                                >
                                    <Play weight="fill" size={18} />
                                    Play
                                </button>
                                <button
                                    onClick={(e) => { e.stopPropagation(); toggleList(heroMovie); }}
                                    className="flex-1 bg-[#333] text-white py-2 px-4 rounded flex items-center justify-center gap-2 font-semibold"
                                >
                                    {isInList(Number(heroMovie.id)) ? (
                                        <><Check weight="bold" size={18} /> My List</>
                                    ) : (
                                        <><Plus weight="bold" size={18} /> My List</>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* ========== CONTENT ROWS ========== */}
            <div className="mt-6 space-y-6">
                {/* Row: Trending */}
                <ContentRow
                    title="Trending Now"
                    movies={filterMovies(trending)}
                    onMovieClick={setSelectedMovie}
                />

                {/* Row: Only on Netflix / TV */}
                <ContentRow
                    title="Only on Netflix"
                    movies={filterMovies(trendingTV).slice(0, 10)}
                    onMovieClick={setSelectedMovie}
                />

                {/* Row: Popular */}
                <ContentRow
                    title="Popular on Kinemora"
                    movies={filterMovies(popular)}
                    onMovieClick={setSelectedMovie}
                />

                {/* Row: Top Rated */}
                <ContentRow
                    title="Top Rated"
                    movies={filterMovies(topRated)}
                    onMovieClick={setSelectedMovie}
                />

                {/* Row: From My List */}
                {myList.length > 0 && (
                    <ContentRow
                        title={`More like ${myList[0]?.title || myList[0]?.name}`}
                        movies={filterMovies(trending).slice(5, 15)}
                        onMovieClick={setSelectedMovie}
                    />
                )}
            </div>

            {/* ========== CATEGORY OVERLAY ========== */}
            {categoryOverlayOpen && (
                <div className="fixed inset-0 bg-black/90 z-[100] flex flex-col items-center justify-center">
                    {/* Title */}
                    <div className="absolute top-4 text-lg font-bold">{pageTitle}</div>

                    {/* Scrollable category list */}
                    <div className="max-h-[70vh] overflow-y-auto py-10">
                        {CATEGORIES.map((cat) => (
                            <button
                                key={cat.id}
                                onClick={() => {
                                    setActiveCategory(cat.id);
                                    setCategoryOverlayOpen(false);
                                }}
                                className={`block w-full py-3 text-center text-lg ${activeCategory === cat.id ? 'text-white font-bold' : 'text-gray-400'
                                    }`}
                            >
                                {cat.label}
                            </button>
                        ))}
                    </div>

                    {/* Close button */}
                    <button
                        onClick={() => setCategoryOverlayOpen(false)}
                        className="absolute bottom-8 w-12 h-12 bg-white text-black rounded-full flex items-center justify-center"
                    >
                        <X size={20} weight="bold" />
                    </button>
                </div>
            )}

            {/* ========== INFO MODAL ========== */}
            {selectedMovie && (
                <InfoModal
                    movie={selectedMovie}
                    onClose={() => setSelectedMovie(null)}
                    onPlay={() => handlePlay(selectedMovie)}
                    isInList={isInList(Number(selectedMovie.id))}
                    onToggleList={() => toggleList(selectedMovie)}
                />
            )}
        </div>
    );
}

// ========== CONTENT ROW COMPONENT ==========
function ContentRow({
    title,
    movies,
    onMovieClick
}: {
    title: string;
    movies: Movie[];
    onMovieClick: (m: Movie) => void;
}) {
    if (!movies || movies.length === 0) return null;

    return (
        <div>
            <h2 className="text-base font-semibold px-4 mb-2">{title}</h2>
            <div className="flex gap-2 px-4 overflow-x-auto pb-2">
                {movies.map((movie) => (
                    <button
                        key={movie.id}
                        onClick={() => onMovieClick(movie)}
                        className="flex-shrink-0 w-28"
                    >
                        <img
                            src={movie.poster_path
                                ? `https://image.tmdb.org/t/p/w342${movie.poster_path}`
                                : '/placeholder.jpg'}
                            alt={movie.title || movie.name || ''}
                            className="w-full aspect-[2/3] object-cover rounded"
                            loading="lazy"
                        />
                    </button>
                ))}
            </div>
        </div>
    );
}

// ========== INFO MODAL COMPONENT ==========
function InfoModal({
    movie,
    onClose,
    onPlay,
    isInList,
    onToggleList
}: {
    movie: Movie;
    onClose: () => void;
    onPlay: () => void;
    isInList: boolean;
    onToggleList: () => void;
}) {
    const [activeTab, setActiveTab] = useState<'episodes' | 'similar'>('episodes');
    const [selectedSeason, setSelectedSeason] = useState(1);
    const [episodes, setEpisodes] = useState<any[]>([]);
    const [seasonOverlayOpen, setSeasonOverlayOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    const isTV = movie.media_type === 'tv' || movie.first_air_date;
    const title = movie.title || movie.name || 'Unknown';
    const year = (movie.release_date || movie.first_air_date)
        ? new Date(movie.release_date || movie.first_air_date || '').getFullYear()
        : '';

    // Fetch episodes for TV shows
    useEffect(() => {
        if (!isTV || !movie.id) return;

        setLoading(true);
        getSeasonDetails(movie.id, selectedSeason)
            .then((data) => setEpisodes(data.episodes || []))
            .catch(() => setEpisodes([]))
            .finally(() => setLoading(false));
    }, [isTV, movie.id, selectedSeason]);

    const seasonCount = movie.number_of_seasons || 1;

    return (
        <div className="fixed inset-0 bg-[#0a0a0a] z-[100] overflow-y-auto">
            {/* Page Bar */}
            <div className="sticky top-0 h-12 bg-[#0a0a0a] flex items-center justify-between px-4 z-10">
                <button onClick={onClose} className="p-2 -ml-2">
                    <ArrowLeft size={24} weight="bold" />
                </button>
                <div className="flex items-center gap-2">
                    <button className="p-2"><DownloadSimple size={22} /></button>
                    <button className="p-2"><MagnifyingGlass size={22} /></button>
                </div>
            </div>

            {/* Red progress bar */}
            <div className="h-0.5 bg-gray-700">
                <div className="h-full w-1/3 bg-red-600" />
            </div>

            {/* Tabs */}
            {isTV && (
                <div className="flex gap-6 px-4 py-3 border-b border-gray-700">
                    <button
                        onClick={() => setActiveTab('episodes')}
                        className={`text-sm font-medium pb-1 ${activeTab === 'episodes' ? 'text-white border-b-2 border-red-600' : 'text-gray-400'
                            }`}
                    >
                        Episodes
                    </button>
                    <button
                        onClick={() => setActiveTab('similar')}
                        className={`text-sm font-medium pb-1 ${activeTab === 'similar' ? 'text-white border-b-2 border-red-600' : 'text-gray-400'
                            }`}
                    >
                        More like this
                    </button>
                </div>
            )}

            {/* Content */}
            <div className="px-4 py-4">
                {/* Season selector */}
                {isTV && activeTab === 'episodes' && (
                    <button
                        onClick={() => setSeasonOverlayOpen(true)}
                        className="bg-[#2a2a2a] text-white px-4 py-2 rounded mb-4 flex items-center gap-2 text-sm"
                    >
                        Season {selectedSeason}
                        <CaretDown size={14} />
                    </button>
                )}

                {/* Episodes list */}
                {isTV && activeTab === 'episodes' && (
                    <div className="space-y-4">
                        {loading ? (
                            <div className="text-center py-8 text-gray-500">Loading...</div>
                        ) : episodes.length === 0 ? (
                            <div className="text-center py-8 text-gray-500">No episodes found</div>
                        ) : (
                            episodes.map((ep) => (
                                <div key={ep.id} className="flex gap-3">
                                    {/* Thumbnail */}
                                    <div className="relative w-32 h-20 rounded overflow-hidden bg-[#1a1a1a] flex-shrink-0">
                                        <img
                                            src={ep.still_path
                                                ? `https://image.tmdb.org/t/p/w300${ep.still_path}`
                                                : `https://image.tmdb.org/t/p/w300${movie.backdrop_path}`}
                                            alt={ep.name}
                                            className="w-full h-full object-cover"
                                        />
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <div className="w-8 h-8 bg-black/60 rounded-full border-2 border-white flex items-center justify-center">
                                                <Play weight="fill" size={14} />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Info */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <div className="font-medium text-sm">
                                                    {ep.episode_number}. {ep.name}
                                                </div>
                                                <div className="text-xs text-gray-400">{ep.runtime || 45}m</div>
                                            </div>
                                            <button className="text-gray-400 p-1">
                                                <DownloadSimple size={20} />
                                            </button>
                                        </div>
                                        <p className="text-xs text-gray-400 mt-2 line-clamp-3">
                                            {ep.overview || 'No description available.'}
                                        </p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}

                {/* Movie info or Similar content */}
                {(!isTV || activeTab === 'similar') && (
                    <div className="text-center text-gray-500 py-8">
                        Similar content coming soon
                    </div>
                )}
            </div>

            {/* Season Overlay */}
            {seasonOverlayOpen && (
                <div className="fixed inset-0 bg-black/90 z-[110] flex flex-col items-center justify-center">
                    <div className="max-h-[70vh] overflow-y-auto py-10">
                        {Array.from({ length: seasonCount }, (_, i) => i + 1).map((num) => (
                            <button
                                key={num}
                                onClick={() => {
                                    setSelectedSeason(num);
                                    setSeasonOverlayOpen(false);
                                }}
                                className={`block w-full py-3 text-center text-lg ${selectedSeason === num ? 'text-white font-bold' : 'text-gray-400'
                                    }`}
                            >
                                Season {num}
                            </button>
                        ))}
                    </div>
                    <button
                        onClick={() => setSeasonOverlayOpen(false)}
                        className="absolute bottom-8 w-12 h-12 bg-white text-black rounded-full flex items-center justify-center"
                    >
                        <X size={20} weight="bold" />
                    </button>
                </div>
            )}
        </div>
    );
}
