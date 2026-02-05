import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Movie } from '../types';
import { getTrendingAll, getPopularMovies, getTrendingTV, getTopRated } from '../services/api';
import { useGlobalContext } from '../context/GlobalContext';
import { Check } from '@phosphor-icons/react';

const MIN_SELECTIONS = 10;

/**
 * Netflix-style onboarding flow
 * - Shows 30 mixed movies/TV shows in a 3-column grid
 * - User selects at least 10 items
 * - Selections are stored and added to My List
 */
export default function MobileOnboarding() {
    const navigate = useNavigate();
    const { toggleList } = useGlobalContext();
    const [items, setItems] = useState<Movie[]>([]);
    const [selected, setSelected] = useState<Set<number>>(new Set());
    const [loading, setLoading] = useState(true);

    // Check if onboarding already completed
    useEffect(() => {
        const completed = localStorage.getItem('kinemora_onboarding_complete');
        if (completed === 'true') {
            navigate('/', { replace: true });
        }
    }, [navigate]);

    // Fetch 30 mixed items
    useEffect(() => {
        const loadItems = async () => {
            setLoading(true);
            try {
                const [trending, popular, tv, topRated] = await Promise.all([
                    getTrendingAll(),
                    getPopularMovies(),
                    getTrendingTV(),
                    getTopRated()
                ]);

                // Combine and shuffle
                const all = [
                    ...(trending?.results?.slice(0, 8) || []),
                    ...(popular?.results?.slice(0, 8) || []),
                    ...(tv?.results?.slice(0, 8) || []),
                    ...(topRated?.results?.slice(0, 6) || [])
                ];

                // Remove duplicates by ID
                const unique = all.filter((item, index, self) =>
                    index === self.findIndex(t => t.id === item.id)
                );

                // Shuffle
                const shuffled = unique.sort(() => Math.random() - 0.5).slice(0, 30);
                setItems(shuffled);
            } catch (error) {
                console.error('Error loading onboarding items:', error);
            }
            setLoading(false);
        };

        loadItems();
    }, []);

    const handleSelect = (id: number) => {
        setSelected(prev => {
            const next = new Set(prev);
            if (next.has(id)) {
                next.delete(id);
            } else {
                next.add(id);
            }
            return next;
        });
    };

    const handleComplete = () => {
        // Add selected items to My List
        const selectedItems = items.filter(item => selected.has(Number(item.id)));
        selectedItems.forEach(item => toggleList(item));

        // Store preferences
        localStorage.setItem('kinemora_onboarding_complete', 'true');
        localStorage.setItem('kinemora_preferences', JSON.stringify(
            selectedItems.map(item => ({
                id: item.id,
                title: item.title || item.name,
                genre_ids: item.genre_ids
            }))
        ));

        // Navigate to home
        navigate('/', { replace: true });
    };

    const canComplete = selected.size >= MIN_SELECTIONS;

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
                <div className="text-center">
                    <div className="w-12 h-12 bg-[#e50914] rounded flex items-center justify-center mx-auto mb-4">
                        <span className="text-white font-black text-2xl">K</span>
                    </div>
                    <p className="text-gray-400">Loading...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white">
            {/* Header */}
            <div className="sticky top-0 z-50 bg-[#0a0a0a] pt-8 pb-4 px-4">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-[#e50914] rounded flex items-center justify-center">
                        <span className="text-white font-black text-xl">K</span>
                    </div>
                    <h1 className="text-xl font-bold">Welcome to Kinemora</h1>
                </div>
                <p className="text-gray-400 text-sm">
                    Select at least {MIN_SELECTIONS} titles you like to personalize your experience
                </p>
                <div className="mt-3 flex items-center justify-between">
                    <span className="text-sm text-gray-500">
                        {selected.size} selected
                        {selected.size < MIN_SELECTIONS && (
                            <span className="text-gray-600"> (need {MIN_SELECTIONS - selected.size} more)</span>
                        )}
                    </span>
                    <button
                        onClick={handleComplete}
                        disabled={!canComplete}
                        className={`px-6 py-2 rounded font-semibold transition-all ${canComplete
                            ? 'bg-[#e50914] text-white active:bg-[#c4070f]'
                            : 'bg-gray-700 text-gray-500 cursor-not-allowed'
                            }`}
                    >
                        Continue
                    </button>
                </div>
            </div>

            {/* Grid */}
            <div className="px-4 pb-8">
                <div className="grid grid-cols-3 gap-2">
                    {items.map((item) => {
                        const isSelected = selected.has(Number(item.id));
                        return (
                            <div
                                key={item.id}
                                onClick={() => handleSelect(Number(item.id))}
                                className={`relative aspect-[2/3] rounded overflow-hidden cursor-pointer transition-all ${isSelected ? 'ring-2 ring-[#e50914]' : ''
                                    }`}
                            >
                                {item.poster_path ? (
                                    <img
                                        src={`https://image.tmdb.org/t/p/w300${item.poster_path}`}
                                        alt={item.title || item.name}
                                        className={`w-full h-full object-cover transition-all ${isSelected ? 'brightness-75' : ''
                                            }`}
                                        loading="lazy"
                                    />
                                ) : (
                                    <div className="w-full h-full bg-gray-800 flex items-center justify-center p-2">
                                        <span className="text-gray-500 text-xs text-center">
                                            {item.title || item.name}
                                        </span>
                                    </div>
                                )}

                                {/* Selected checkmark */}
                                {isSelected && (
                                    <div className="absolute top-2 right-2 w-6 h-6 bg-[#e50914] rounded-full flex items-center justify-center">
                                        <Check size={14} weight="bold" className="text-white" />
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
