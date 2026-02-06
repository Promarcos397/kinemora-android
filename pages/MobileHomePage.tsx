import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Movie } from '../types';
import { Play } from '@phosphor-icons/react';
import {
    getTrendingAll,
    getPopularMovies,
    getTopRated,
    getTrendingTV
} from '../services/api';
import { useGlobalContext } from '../context/GlobalContext';

// Components
import MobilePageBar from '../components/MobilePageBar';
import MobileBottomNav from '../components/MobileBottomNav';
import MobileFilterPills, { FilterType } from '../components/MobileFilterPills';
import MobileCategoryOverlay from '../components/MobileCategoryOverlay';
import MobileHeroCard from '../components/MobileHeroCard';
import MobileInfoModal from '../components/MobileInfoModal';

interface MobileHomePageProps {
    initialFilter?: FilterType;
}

/**
 * Netflix Home Page from Figma Design
 * - Top bar with N logo + "For Username"
 * - Filter pills (TV Shows, Movies, Categories)
 * - Large hero card (3:4 poster)
 * - Continue Watching row (with progress bars)
 * - Content rows with horizontal scroll
 */
export default function MobileHomePage({ initialFilter = 'none' }: MobileHomePageProps) {
    const navigate = useNavigate();
    const { myList, toggleList, continueWatching } = useGlobalContext();

    // UI State
    const [activeFilter, setActiveFilter] = useState<FilterType>(initialFilter);
    const [categoryOverlayOpen, setCategoryOverlayOpen] = useState(false);
    const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);

    // Content State
    const [heroMovie, setHeroMovie] = useState<Movie | null>(null);
    const [trending, setTrending] = useState<Movie[]>([]);
    const [popular, setPopular] = useState<Movie[]>([]);
    const [topRated, setTopRated] = useState<Movie[]>([]);
    const [tvShows, setTvShows] = useState<Movie[]>([]);
    const [loading, setLoading] = useState(true);

    // Fetch content
    useEffect(() => {
        const loadContent = async () => {
            setLoading(true);
            try {
                const [trendingData, popularData, topRatedData, tvData] = await Promise.all([
                    getTrendingAll(),
                    getPopularMovies(),
                    getTopRated(),
                    getTrendingTV()
                ]);

                const trendingItems = trendingData?.results || [];
                const popularItems = popularData?.results || [];
                const topRatedItems = topRatedData?.results || [];
                const tvItems = tvData?.results || [];

                setTrending(trendingItems.slice(0, 15));
                setPopular(popularItems.slice(0, 15));
                setTopRated(topRatedItems.slice(0, 15));
                setTvShows(tvItems.slice(0, 15));

                // Set hero from trending
                if (trendingItems.length > 0) {
                    setHeroMovie(trendingItems[0]);
                }
            } catch (error) {
                console.error('Error loading content:', error);
            }
            setLoading(false);
        };

        loadContent();
    }, []);

    // Filter content
    const getFilteredRows = useCallback(() => {
        if (activeFilter === 'tv') {
            return [
                { title: 'Trending TV Shows', items: tvShows },
                { title: 'Popular Series', items: trending.filter(i => i.media_type === 'tv') },
            ];
        } else if (activeFilter === 'movies') {
            return [
                { title: 'Trending Movies', items: popular },
                { title: 'Top Rated Films', items: topRated },
            ];
        }
        return [
            { title: 'Trending Now', items: trending },
            { title: 'Popular on Kinemora', items: popular },
            { title: 'TV Shows', items: tvShows },
            { title: 'Top Rated', items: topRated },
        ];
    }, [activeFilter, trending, popular, topRated, tvShows]);

    // Helpers
    const isInList = (id: number) => myList.some(item => item.id === id);

    const handlePlay = (movie: Movie) => {
        const type = movie.media_type === 'tv' || movie.first_air_date ? 'tv' : 'movie';
        navigate(`/watch/${type}/${movie.id}`);
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#181818' }}>
                <div className="w-10 h-10 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen pb-20" style={{ backgroundColor: '#181818' }}>
            {/* Page Bar */}
            <MobilePageBar userName="You" />

            {/* Filter Pills - below page bar */}
            <div className="pt-14">
                <MobileFilterPills
                    activeFilter={activeFilter}
                    onFilterChange={setActiveFilter}
                    onCategoryClick={() => setCategoryOverlayOpen(true)}
                />
            </div>

            {/* Hero Card */}
            {heroMovie && (
                <div className="mt-2">
                    <MobileHeroCard
                        movie={heroMovie}
                        isInList={isInList(Number(heroMovie.id))}
                        onPlay={() => handlePlay(heroMovie)}
                        onToggleList={() => toggleList(heroMovie)}
                        onCardClick={() => setSelectedMovie(heroMovie)}
                    />
                </div>
            )}

            {/* Continue Watching Row (with progress bars) */}
            {continueWatching && continueWatching.length > 0 && (
                <div className="mt-6">
                    <h2 className="text-[15px] font-medium text-white px-4 mb-2">
                        Continue Watching for You
                    </h2>
                    <div className="flex gap-2 overflow-x-auto px-4 scrollbar-hide">
                        {continueWatching.map((item) => (
                            <div
                                key={item.id}
                                className="flex-shrink-0 w-32 cursor-pointer"
                                onClick={() => handlePlay(item)}
                            >
                                <div className="relative aspect-video bg-gray-800 rounded overflow-hidden">
                                    {item.backdrop_path && (
                                        <img
                                            src={`https://image.tmdb.org/t/p/w300${item.backdrop_path}`}
                                            alt={item.title || item.name}
                                            className="w-full h-full object-cover"
                                        />
                                    )}
                                    {/* Play icon overlay */}
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <div className="w-8 h-8 bg-black/60 rounded-full flex items-center justify-center border-2 border-white">
                                            <Play weight="fill" size={14} className="text-white ml-0.5" />
                                        </div>
                                    </div>
                                    {/* Progress bar */}
                                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-700">
                                        <div className="h-full bg-red-600" style={{ width: '45%' }} />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Content Rows */}
            <div className="space-y-6 mt-6">
                {getFilteredRows().map((row, index) => (
                    <ContentRow
                        key={index}
                        title={row.title}
                        items={row.items}
                        onItemClick={setSelectedMovie}
                    />
                ))}
            </div>

            {/* Bottom Navigation */}
            <MobileBottomNav />

            {/* Category Overlay */}
            <MobileCategoryOverlay
                isOpen={categoryOverlayOpen}
                onClose={() => setCategoryOverlayOpen(false)}
                onSelect={() => setCategoryOverlayOpen(false)}
            />

            {/* Info Modal */}
            {selectedMovie && (
                <MobileInfoModal
                    movie={selectedMovie}
                    isOpen={!!selectedMovie}
                    onClose={() => setSelectedMovie(null)}
                    isInList={isInList(Number(selectedMovie.id))}
                    onToggleList={() => toggleList(selectedMovie)}
                />
            )}
        </div>
    );
}

// Content Row Component
interface ContentRowProps {
    title: string;
    items: Movie[];
    onItemClick: (movie: Movie) => void;
}

function ContentRow({ title, items, onItemClick }: ContentRowProps) {
    if (items.length === 0) return null;

    return (
        <div>
            <h2 className="text-[15px] font-medium text-white px-4 mb-2">{title}</h2>
            <div className="flex gap-2 overflow-x-auto px-4 scrollbar-hide">
                {items.map((item) => (
                    <div
                        key={item.id}
                        className="flex-shrink-0 w-28 cursor-pointer"
                        onClick={() => onItemClick(item)}
                    >
                        <div className="aspect-[2/3] bg-gray-800 rounded overflow-hidden">
                            {item.poster_path ? (
                                <img
                                    src={`https://image.tmdb.org/t/p/w200${item.poster_path}`}
                                    alt={item.title || item.name}
                                    className="w-full h-full object-cover"
                                    loading="lazy"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-500 text-xs p-1 text-center">
                                    {item.title || item.name}
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
