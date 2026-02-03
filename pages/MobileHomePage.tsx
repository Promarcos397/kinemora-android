import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Movie } from '../types';
import { getPopularMovies, getTrendingAll, getTopRated, getTrendingTV } from '../services/api';
import { useGlobalContext } from '../context/GlobalContext';
import PageBar from '../components/PageBar';
import SettingsSheet from '../components/SettingsSheet';
import FilterPills from '../components/FilterPills';
import CategoryOverlay from '../components/CategoryOverlay';
import HeroCard from '../components/HeroCard';
import CategoryCardsRow from '../components/CategoryCardsRow';
import MobileRow from '../components/MobileRow';
import MobileInfoModal from '../components/MobileInfoModal';

/**
 * Mobile Home Page - Complete redesign
 * PageBar + FilterPills + HeroCard + CategoryCards + Content Rows
 */
export default function MobileHomePage() {
    const navigate = useNavigate();
    const { myList, toggleList, continueWatching } = useGlobalContext();

    // State
    const [heroMovie, setHeroMovie] = useState<Movie | null>(null);
    const [trending, setTrending] = useState<Movie[]>([]);
    const [popular, setPopular] = useState<Movie[]>([]);
    const [topRated, setTopRated] = useState<Movie[]>([]);
    const [trendingTV, setTrendingTV] = useState<Movie[]>([]);

    const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
    const [activeFilter, setActiveFilter] = useState<'none' | 'series' | 'films'>('none');
    const [categoryOverlayOpen, setCategoryOverlayOpen] = useState(false);
    const [activeCategory, setActiveCategory] = useState('all');
    const [settingsOpen, setSettingsOpen] = useState(false);
    const [loading, setLoading] = useState(true);

    // Categories for overlay
    const categories = [
        { id: 'all', label: 'All' },
        { id: 'action', label: 'Action' },
        { id: 'comedy', label: 'Comedy' },
        { id: 'drama', label: 'Drama' },
        { id: 'horror', label: 'Horror' },
        { id: 'romance', label: 'Romance' },
        { id: 'sci-fi', label: 'Sci-Fi' },
        { id: 'thriller', label: 'Thriller' },
        { id: 'documentary', label: 'Documentary' },
        { id: 'animation', label: 'Animation' },
        { id: 'family', label: 'Family' },
        { id: 'fantasy', label: 'Fantasy' },
    ];

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
        if (activeFilter === 'none') return movies;
        if (activeFilter === 'series') return movies.filter(m => m.media_type === 'tv' || m.first_air_date);
        if (activeFilter === 'films') return movies.filter(m => m.media_type === 'movie' || m.release_date);
        return movies;
    };

    const handlePlay = (movie: Movie, season?: number, episode?: number) => {
        const type = movie.media_type || (movie.title ? 'movie' : 'tv');
        let url = `/watch/${type}/${movie.id}`;
        if (season && episode) {
            url += `?season=${season}&episode=${episode}`;
        }
        navigate(url);
        setSelectedMovie(null);
    };

    const handleCategoryCardClick = (categoryId: string) => {
        // Navigate to filtered content or set filter
        console.log('Category clicked:', categoryId);
        // TODO: Implement category-specific content loading
    };

    const isInList = (movieId: number) => myList.some(m => m.id === movieId);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen bg-[var(--bg-primary)]">
                <div className="w-8 h-8 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[var(--bg-primary)]">
            {/* Page Bar */}
            <PageBar
                title="Home"
                onMenuClick={() => setSettingsOpen(true)}
            />

            {/* Filter Pills */}
            <FilterPills
                activeFilter={activeFilter}
                showBack={activeFilter !== 'none'}
                onFilterChange={setActiveFilter}
                onCategoriesClick={() => setCategoryOverlayOpen(true)}
                onBackClick={() => setActiveFilter('none')}
            />

            {/* Hero Card */}
            {heroMovie && (
                <HeroCard
                    movie={heroMovie}
                    isInList={isInList(Number(heroMovie.id))}
                    onPlay={() => handlePlay(heroMovie)}
                    onToggleList={() => toggleList(heroMovie)}
                    onPress={() => setSelectedMovie(heroMovie)}
                />
            )}

            {/* Category Cards Row */}
            <CategoryCardsRow onCategoryClick={handleCategoryCardClick} />

            {/* Content Rows */}
            <div className="py-4 space-y-4">
                {/* Continue Watching */}
                {continueWatching.length > 0 && (
                    <MobileRow
                        title="Continue Watching"
                        movies={continueWatching.slice(0, 10)}
                        onMovieClick={setSelectedMovie}
                    />
                )}

                {/* Trending Now */}
                <MobileRow
                    title="Trending Now"
                    movies={filterMovies(trending)}
                    onMovieClick={setSelectedMovie}
                />

                {/* Only on Netflix (using trending TV as proxy) */}
                <MobileRow
                    title="Only on Netflix"
                    movies={filterMovies(trendingTV).slice(0, 10)}
                    onMovieClick={setSelectedMovie}
                />

                {/* Popular */}
                <MobileRow
                    title="Popular on Kinemora"
                    movies={filterMovies(popular)}
                    onMovieClick={setSelectedMovie}
                />

                {/* Top Rated */}
                <MobileRow
                    title="Top Rated"
                    movies={filterMovies(topRated)}
                    onMovieClick={setSelectedMovie}
                />

                {/* My List Recommendations */}
                {myList.length > 0 && (
                    <MobileRow
                        title={`More like ${myList[0]?.title || myList[0]?.name || 'Your Favorites'}`}
                        movies={filterMovies(trending).slice(5, 15)}
                        onMovieClick={setSelectedMovie}
                    />
                )}
            </div>

            {/* Info Modal */}
            {selectedMovie && (
                <MobileInfoModal
                    movie={selectedMovie}
                    isOpen={!!selectedMovie}
                    onClose={() => setSelectedMovie(null)}
                    onPlay={(s, e) => handlePlay(selectedMovie, s, e)}
                    isInList={isInList(Number(selectedMovie.id))}
                    onToggleList={() => toggleList(selectedMovie)}
                />
            )}

            {/* Category Overlay */}
            <CategoryOverlay
                isOpen={categoryOverlayOpen}
                onClose={() => setCategoryOverlayOpen(false)}
                categories={categories}
                activeCategory={activeCategory}
                onCategorySelect={(id) => setActiveCategory(id)}
            />

            {/* Settings Sheet */}
            <SettingsSheet
                isOpen={settingsOpen}
                onClose={() => setSettingsOpen(false)}
            />
        </div>
    );
}
