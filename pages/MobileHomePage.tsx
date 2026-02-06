import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Movie } from '../types';
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
import MobileSettingsSheet from '../components/MobileSettingsSheet';
import MobileHeroCard from '../components/MobileHeroCard';
import MobileInfoModal from '../components/MobileInfoModal';

interface MobileHomePageProps {
    initialFilter?: FilterType;
}

/**
 * Netflix-style Home Page
 * - Large hero card (65vh)
 * - Filter pills below page bar
 * - Content rows with horizontal scroll
 */
export default function MobileHomePage({ initialFilter = 'none' }: MobileHomePageProps) {
    const navigate = useNavigate();
    const { myList, toggleList } = useGlobalContext();

    // UI State
    const [activeFilter, setActiveFilter] = useState<FilterType>(initialFilter);
    const [categoryOverlayOpen, setCategoryOverlayOpen] = useState(false);
    const [settingsSheetOpen, setSettingsSheetOpen] = useState(false);
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

    // Filter content based on activeFilter
    const getFilteredContent = useCallback(() => {
        let allContent = [...trending, ...popular, ...topRated, ...tvShows];

        if (activeFilter === 'series') {
            allContent = allContent.filter(item =>
                item.media_type === 'tv' || item.first_air_date
            );
        } else if (activeFilter === 'films') {
            allContent = allContent.filter(item =>
                item.media_type === 'movie' || (!item.first_air_date && item.release_date)
            );
        }

        return allContent;
    }, [activeFilter, trending, popular, topRated, tvShows]);

    // Update hero when filter changes
    useEffect(() => {
        const filtered = getFilteredContent();
        if (filtered.length > 0 && activeFilter !== 'none') {
            setHeroMovie(filtered[0]);
        } else if (trending.length > 0 && activeFilter === 'none') {
            setHeroMovie(trending[0]);
        }
    }, [activeFilter, getFilteredContent, trending]);

    // Helpers
    const isInList = (id: number) => myList.some(item => item.id === id);

    const handlePlay = (movie: Movie) => {
        const type = movie.media_type === 'tv' || movie.first_air_date ? 'tv' : 'movie';
        navigate(`/watch/${type}/${movie.id}`);
    };

    const handleCategorySelect = (category: string) => {
        setCategoryOverlayOpen(false);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
                <div className="w-10 h-10 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white pb-24">
            {/* Page Bar */}
            <MobilePageBar
                title={activeFilter === 'series' ? 'Series' : activeFilter === 'films' ? 'Films' : 'Home'}
                onMenuClick={() => setSettingsSheetOpen(true)}
            />

            {/* Filter Pills - below page bar */}
            <div className="pt-12">
                <MobileFilterPills
                    activeFilter={activeFilter}
                    onFilterChange={setActiveFilter}
                    onCategoryClick={() => setCategoryOverlayOpen(true)}
                />
            </div>

            {/* Hero Card */}
            {heroMovie && (
                <MobileHeroCard
                    movie={heroMovie}
                    isInList={isInList(Number(heroMovie.id))}
                    onPlay={() => handlePlay(heroMovie)}
                    onToggleList={() => toggleList(heroMovie)}
                    onCardClick={() => setSelectedMovie(heroMovie)}
                />
            )}

            {/* Content Rows */}
            <div className="space-y-6 mt-4">
                <ContentRow
                    title="Trending Now"
                    items={trending}
                    onItemClick={setSelectedMovie}
                />

                <ContentRow
                    title="Popular on Kinemora"
                    items={popular}
                    onItemClick={setSelectedMovie}
                />

                {myList.length > 0 && (
                    <ContentRow
                        title={`Because you added ${myList[0]?.title || myList[0]?.name || 'to your list'}`}
                        items={topRated}
                        onItemClick={setSelectedMovie}
                    />
                )}

                <ContentRow
                    title="TV Shows"
                    items={tvShows}
                    onItemClick={setSelectedMovie}
                />

                <ContentRow
                    title="Top Rated"
                    items={topRated}
                    onItemClick={setSelectedMovie}
                />
            </div>

            {/* Bottom Navigation */}
            <MobileBottomNav />

            {/* Category Overlay */}
            <MobileCategoryOverlay
                isOpen={categoryOverlayOpen}
                onClose={() => setCategoryOverlayOpen(false)}
                onSelect={handleCategorySelect}
            />

            {/* Settings Sheet */}
            <MobileSettingsSheet
                isOpen={settingsSheetOpen}
                onClose={() => setSettingsSheetOpen(false)}
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
            <h2 className="text-base font-semibold text-white px-4 mb-2">{title}</h2>
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
