import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Movie } from '../types';
import { getTrendingAll, getPopularMovies } from '../services/api';
import { useGlobalContext } from '../context/GlobalContext';
import MobilePageBar from '../components/MobilePageBar';
import MobileBottomNav from '../components/MobileBottomNav';
import MobileSettingsSheet from '../components/MobileSettingsSheet';
import MobileInfoModal from '../components/MobileInfoModal';
import { Fire, CalendarBlank } from '@phosphor-icons/react';

/**
 * New & Hot page - shows trending and upcoming content
 */
export default function MobileNewHotPage() {
    const navigate = useNavigate();
    const { myList, toggleList } = useGlobalContext();
    const [activeTab, setActiveTab] = useState<'coming' | 'top10'>('coming');
    const [settingsSheetOpen, setSettingsSheetOpen] = useState(false);
    const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
    const [trending, setTrending] = useState<Movie[]>([]);
    const [popular, setPopular] = useState<Movie[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            try {
                const [trendingData, popularData] = await Promise.all([
                    getTrendingAll(),
                    getPopularMovies()
                ]);
                setTrending(trendingData?.results?.slice(0, 10) || []);
                setPopular(popularData?.results?.slice(0, 10) || []);
            } catch (error) {
                console.error('Error loading data:', error);
            }
            setLoading(false);
        };
        loadData();
    }, []);

    const isInList = (id: number) => myList.some(item => item.id === id);

    const items = activeTab === 'coming' ? trending : popular;

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white pb-16">
            {/* Page Bar */}
            <MobilePageBar
                title="New & Hot"
                onMenuClick={() => setSettingsSheetOpen(true)}
            />

            {/* Tabs */}
            <div className="fixed top-12 left-0 right-0 bg-[#0a0a0a] flex gap-4 px-4 py-3 z-40">
                <button
                    onClick={() => setActiveTab('coming')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${activeTab === 'coming'
                        ? 'bg-white text-black'
                        : 'bg-transparent border border-white/30 text-white'
                        }`}
                >
                    <CalendarBlank size={16} weight="bold" />
                    Coming Soon
                </button>
                <button
                    onClick={() => setActiveTab('top10')}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${activeTab === 'top10'
                        ? 'bg-white text-black'
                        : 'bg-transparent border border-white/30 text-white'
                        }`}
                >
                    <Fire size={16} weight="bold" />
                    Top 10
                </button>
            </div>

            {/* Content */}
            <div className="pt-28 px-4">
                {loading ? (
                    <div className="flex items-center justify-center h-[50vh]">
                        <span className="text-gray-500">Loading...</span>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {items.map((item, index) => (
                            <div
                                key={item.id}
                                className="flex gap-3 cursor-pointer"
                                onClick={() => setSelectedMovie(item)}
                            >
                                {/* Rank number for Top 10 */}
                                {activeTab === 'top10' && (
                                    <div className="w-8 flex-shrink-0 flex items-center justify-center">
                                        <span className="text-2xl font-bold text-gray-500">{index + 1}</span>
                                    </div>
                                )}

                                {/* Poster */}
                                <div className="w-28 aspect-[2/3] bg-gray-800 rounded overflow-hidden flex-shrink-0">
                                    {item.poster_path ? (
                                        <img
                                            src={`https://image.tmdb.org/t/p/w300${item.poster_path}`}
                                            alt={item.title || item.name}
                                            className="w-full h-full object-cover"
                                            loading="lazy"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-600 text-xs">
                                            {item.title || item.name}
                                        </div>
                                    )}
                                </div>

                                {/* Info */}
                                <div className="flex-1 py-1">
                                    <h3 className="text-white font-semibold text-base mb-1">
                                        {item.title || item.name}
                                    </h3>
                                    <p className="text-gray-500 text-xs line-clamp-3">
                                        {item.overview || 'No description available.'}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
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
