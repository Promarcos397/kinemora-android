import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Movie } from '../types';
import { getTrendingAll, getTopRated, getPopularMovies } from '../services/api';
import { useGlobalContext } from '../context/GlobalContext';
import { Calendar, Fire, Play, Plus, Check } from '@phosphor-icons/react';

// Components
import MobilePageBar from '../components/MobilePageBar';
import MobileBottomNav from '../components/MobileBottomNav';
import MobileSettingsSheet from '../components/MobileSettingsSheet';
import MobileInfoModal from '../components/MobileInfoModal';

type TabType = 'coming-soon' | 'top-10';

/**
 * Netflix-style New & Hot page
 * - Two tabs: Coming Soon and Top 10
 * - Horizontal card layout with poster + info
 */
export default function MobileNewHotPage() {
    const navigate = useNavigate();
    const { myList, toggleList } = useGlobalContext();
    const [activeTab, setActiveTab] = useState<TabType>('coming-soon');
    const [comingSoon, setComingSoon] = useState<Movie[]>([]);
    const [top10, setTop10] = useState<Movie[]>([]);
    const [loading, setLoading] = useState(true);
    const [settingsSheetOpen, setSettingsSheetOpen] = useState(false);
    const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);

    useEffect(() => {
        const loadContent = async () => {
            setLoading(true);
            try {
                const [trending, topRated, popular] = await Promise.all([
                    getTrendingAll(),
                    getTopRated(),
                    getPopularMovies()
                ]);

                setComingSoon(trending?.results?.slice(0, 10) || []);
                setTop10(topRated?.results?.slice(0, 10) || []);
            } catch (error) {
                console.error('Error loading content:', error);
            }
            setLoading(false);
        };

        loadContent();
    }, []);

    const isInList = (id: number) => myList.some(item => item.id === id);

    const content = activeTab === 'coming-soon' ? comingSoon : top10;

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
                title="New & Hot"
                onMenuClick={() => setSettingsSheetOpen(true)}
            />

            {/* Tabs */}
            <div className="pt-12 px-4 py-3 flex gap-2">
                <button
                    onClick={() => setActiveTab('coming-soon')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${activeTab === 'coming-soon'
                            ? 'bg-white text-black'
                            : 'bg-transparent border border-white/40 text-white'
                        }`}
                >
                    <Calendar size={16} />
                    Coming Soon
                </button>
                <button
                    onClick={() => setActiveTab('top-10')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${activeTab === 'top-10'
                            ? 'bg-white text-black'
                            : 'bg-transparent border border-white/40 text-white'
                        }`}
                >
                    <Fire size={16} />
                    Top 10
                </button>
            </div>

            {/* Content List */}
            <div className="px-4 space-y-4 py-2">
                {content.map((item, index) => (
                    <div
                        key={item.id}
                        className="flex gap-3 cursor-pointer"
                        onClick={() => setSelectedMovie(item)}
                    >
                        {/* Poster */}
                        <div className="w-24 flex-shrink-0">
                            <div className="aspect-[2/3] bg-gray-800 rounded overflow-hidden relative">
                                {item.poster_path ? (
                                    <img
                                        src={`https://image.tmdb.org/t/p/w200${item.poster_path}`}
                                        alt={item.title || item.name}
                                        className="w-full h-full object-cover"
                                        loading="lazy"
                                    />
                                ) : null}
                                {/* Top 10 badge */}
                                {activeTab === 'top-10' && (
                                    <div className="absolute top-1 left-1 bg-red-600 text-white text-xs font-bold px-1.5 py-0.5 rounded">
                                        TOP 10
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Info */}
                        <div className="flex-1 py-1">
                            <h3 className="font-semibold text-white text-base line-clamp-1">
                                {item.title || item.name}
                            </h3>
                            <p className="text-gray-400 text-sm line-clamp-3 mt-1">
                                {item.overview}
                            </p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Bottom Navigation */}
            <MobileBottomNav />

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
