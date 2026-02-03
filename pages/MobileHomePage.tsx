import React, { useState, useEffect } from 'react';
import { Movie } from '../types';
import { getPopularMovies, getTrendingAll, getTopRated } from '../services/api';
import MobileHero from '../components/MobileHero';
import MobileRow from '../components/MobileRow';
import MobileInfoModal from '../components/MobileInfoModal';
import FilterPills from '../components/FilterPills';
import { useGlobalContext } from '../context/GlobalContext';
import { useNavigate } from 'react-router-dom';

/**
 * Mobile Home Page - Netflix mobile style
 * Vertical hero, filter pills, touch-friendly rows
 */
export default function MobileHomePage() {
    const navigate = useNavigate();
    const { myList, toggleList } = useGlobalContext();

    const [heroMovie, setHeroMovie] = useState<Movie | null>(null);
    const [trending, setTrending] = useState<Movie[]>([]);
    const [popular, setPopular] = useState<Movie[]>([]);
    const [topRated, setTopRated] = useState<Movie[]>([]);
    const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
    const [activeFilter, setActiveFilter] = useState('all');
    const [loading, setLoading] = useState(true);

    const filters = [
        { id: 'all', label: 'All' },
        { id: 'series', label: 'Series' },
        { id: 'films', label: 'Films' },
    ];

    // Fetch data
    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const [trendingData, popularData, topRatedData] = await Promise.all([
                    getTrendingAll(),
                    getPopularMovies(),
                    getTopRated()
                ]);

                setTrending(trendingData.results || []);
                setPopular(popularData.results || []);
                setTopRated(topRatedData.results || []);

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
        if (activeFilter === 'all') return movies;
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

    const isInList = (movieId: number) => myList.some(m => m.id === movieId);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen bg-[#0a0a0a]">
                <div className="w-8 h-8 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="bg-[#0a0a0a] min-h-screen">
            {/* Filter pills */}
            <FilterPills
                filters={filters}
                activeFilter={activeFilter}
                onFilterChange={setActiveFilter}
            />

            {/* Hero */}
            {heroMovie && (
                <MobileHero
                    movie={heroMovie}
                    onPlay={() => handlePlay(heroMovie)}
                    onAddToList={() => toggleList(heroMovie)}
                    onOpen={() => setSelectedMovie(heroMovie)}
                />
            )}

            {/* Rows */}
            <div className="py-4 space-y-2">
                <MobileRow
                    title="Trending Now"
                    movies={filterMovies(trending)}
                    onMovieClick={setSelectedMovie}
                />
                <MobileRow
                    title="Popular on Kinemora"
                    movies={filterMovies(popular)}
                    onMovieClick={setSelectedMovie}
                />
                <MobileRow
                    title="Top Rated"
                    movies={filterMovies(topRated)}
                    onMovieClick={setSelectedMovie}
                />

                {/* Continue Watching (from myList) */}
                {myList.length > 0 && (
                    <MobileRow
                        title="Continue Watching"
                        movies={myList.slice(0, 10)}
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
        </div>
    );
}
