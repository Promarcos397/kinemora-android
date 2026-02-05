import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Movie } from '../types';
import { getPopularMovies, getTrendingAll, getTopRated, getTrendingTV } from '../services/api';
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
 * Netflix-style mobile home page
 * Integrates all core components: PageBar, BottomNav, FilterPills, HeroCard, etc.
 */
export default function MobileHomePage({ initialFilter = 'none' }: MobileHomePageProps) {
    const navigate = useNavigate();
    const { myList, toggleList } = useGlobalContext();

    // UI State
    const [activeFilter, setActiveFilter] = useState<FilterType>(initialFilter);
    const [selectedCategory, setSelectedCategory] = useState('home');
    const [categoryOverlayOpen, setCategoryOverlayOpen] = useState(false);
    const [settingsSheetOpen, setSettingsSheetOpen] = useState(false);
    const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);

    // Data State
    const [heroMovie, setHeroMovie] = useState<Movie | null>(null);
    const [trending, setTrending] = useState<Movie[]>([]);
    const [popular, setPopular] = useState<Movie[]>([]);
    const [topRated, setTopRated] = useState<Movie[]>([]);
    const [tvShows, setTvShows] = useState<Movie[]>([]);
    const [loading, setLoading] = useState(true);

    // Get page title based on filter
    const getPageTitle = (): string => {
        switch (activeFilter) {
            case 'series': return 'Series';
            case 'films': return 'Films';
            default: return 'Home';
        }
    };

    // Load data
    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            try {
                const [trendingData, popularData, topRatedData, tvData] = await Promise.all([
                    getTrendingAll(),
                    getPopularMovies(),
                    getTopRated(),
                    getTrendingTV()
                ]);

                const trendingResults = trendingData?.results || [];
                const popularResults = popularData?.results || [];
                const topRatedResults = topRatedData?.results || [];
                const tvResults = tvData?.results || [];

                setTrending(trendingResults);
                setPopular(popularResults);
                setTopRated(topRatedResults);
                setTvShows(tvResults);

                // Set hero movie from trending
                if (trendingResults.length > 0) {
                    setHeroMovie(trendingResults[0]);
                }
            } catch (error) {
                console.error('Error loading data:', error);
            }
            setLoading(false);
        };

        loadData();
    }, []);

    // Filter content based on active filter
    const getFilteredContent = useCallback(() => {
        let allContent = [...trending, ...popular, ...topRated, ...tvShows];

        if (activeFilter === 'series') {
            allContent = allContent.filter(item =>
                item.media_type === 'tv' || item.first_air_date || item.name
            );
        } else if (activeFilter === 'films') {
            allContent = allContent.filter(item =>
                item.media_type === 'movie' || (item.release_date && !item.first_air_date)
            );
        }

        return allContent;
    }, [activeFilter, trending, popular, topRated, tvShows]);

    // Update hero when filter changes
    useEffect(() => {
        const filtered = getFilteredContent();
        if (filtered.length > 0) {
            setHeroMovie(filtered[0]);
        }
    }, [activeFilter, getFilteredContent]);

    // My List helpers
    const isInList = (id: number) => myList.some(item => item.id === id);

    // Handle play
    const handlePlay = (movie: Movie) => {
        const type = movie.media_type === 'tv' || movie.first_air_date ? 'tv' : 'movie';
        navigate(`/watch/${type}/${movie.id}`);
    };

    // Handle filter back
    const handleFilterBack = () => {
        setActiveFilter('none');
    };

    // Content rows based on My List for personalization
    const getPersonalizedRows = () => {
        const rows: { title: string; items: Movie[] }[] = [];

        // Trending Now
        if (trending.length > 0) {
            rows.push({ title: 'Trending Now', items: trending.slice(0, 10) });
        }

        // Based on My List (if items exist)
        if (myList.length > 0) {
            const firstListItem = myList[0];
            const moreLikeTitle = firstListItem.title || firstListItem.name || 'Your List';
            rows.push({
                title: `More Like ${moreLikeTitle}`,
                items: popular.slice(0, 10)
            });
        }

        // Popular on Kinemora
        if (popular.length > 0) {
            rows.push({ title: 'Popular on Kinemora', items: popular.slice(0, 10) });
        }

        // Top Rated
        if (topRated.length > 0) {
            rows.push({ title: 'Top Rated', items: topRated.slice(0, 10) });
        }

        // TV Shows (if not filtering to films only)
        if (activeFilter !== 'films' && tvShows.length > 0) {
            rows.push({ title: 'TV Shows', items: tvShows.slice(0, 10) });
        }

        return rows;
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
                <div className="text-white">Loading...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white pb-16">
            {/* Page Bar */}
            <MobilePageBar
                title={getPageTitle()}
                showBackButton={activeFilter !== 'none'}
                showLogo={activeFilter === 'none'}
                onBackClick={handleFilterBack}
                onMenuClick={() => setSettingsSheetOpen(true)}
            />

            {/* Filter Pills */}
            <MobileFilterPills
                activeFilter={activeFilter}
                onFilterChange={setActiveFilter}
                onCategoryClick={() => setCategoryOverlayOpen(true)}
                showBackButton={activeFilter !== 'none'}
                onBackClick={handleFilterBack}
            />

            {/* Main Content (with top padding for fixed bars) */}
            <div className="pt-24">
                {/* Hero Card */}
                {heroMovie && (
                    <MobileHeroCard
                        movie={heroMovie}
                        isInList={isInList(Number(heroMovie.id))}
                        onPlayClick={() => handlePlay(heroMovie)}
                        onListClick={() => toggleList(heroMovie)}
                        onCardClick={() => setSelectedMovie(heroMovie)}
                    />
                )}

                {/* Content Rows */}
                <div className="mt-6 space-y-6">
                    {getPersonalizedRows().map((row, index) => (
                        <div key={index}>
                            <h2 className="text-lg font-bold px-4 mb-2">{row.title}</h2>
                            <div className="flex gap-2 overflow-x-auto px-4 scrollbar-hide">
                                {row.items.map((item) => (
                                    <div
                                        key={item.id}
                                        className="flex-shrink-0 w-28 cursor-pointer"
                                        onClick={() => setSelectedMovie(item)}
                                    >
                                        <div className="aspect-[2/3] bg-gray-800 rounded overflow-hidden">
                                            {item.poster_path ? (
                                                <img
                                                    src={`https://image.tmdb.org/t/p/w300${item.poster_path}`}
                                                    alt={item.title || item.name}
                                                    className="w-full h-full object-cover"
                                                    loading="lazy"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-gray-600 text-xs p-1 text-center">
                                                    {item.title || item.name}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Bottom Navigation */}
            <MobileBottomNav />

            {/* Category Overlay */}
            <MobileCategoryOverlay
                isOpen={categoryOverlayOpen}
                currentCategory={selectedCategory}
                onSelect={setSelectedCategory}
                onClose={() => setCategoryOverlayOpen(false)}
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
