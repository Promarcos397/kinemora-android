import React, { useState, useEffect } from 'react';
import { Movie } from '../types';
import { getPopularMovies, getTrendingTV, getTopRated } from '../services/api';
import { useGlobalContext } from '../context/GlobalContext';
import { Check } from '@phosphor-icons/react';

interface OnboardingSelectionProps {
    onComplete: () => void;
}

/**
 * First-time onboarding - Select 10+ movies/shows from a grid of 30
 * Selected items are added to My List and used for recommendations
 */
export default function OnboardingSelection({ onComplete }: OnboardingSelectionProps) {
    const { toggleList } = useGlobalContext();
    const [items, setItems] = useState<Movie[]>([]);
    const [selected, setSelected] = useState<Set<number>>(new Set());
    const [loading, setLoading] = useState(true);

    const MIN_SELECTION = 10;

    // Fetch 30 mixed items
    useEffect(() => {
        const fetchItems = async () => {
            setLoading(true);
            try {
                const [movies, tv, topRated] = await Promise.all([
                    getPopularMovies(),
                    getTrendingTV(),
                    getTopRated()
                ]);

                // Mix 10 from each source for variety
                const mixed: Movie[] = [
                    ...(movies.results?.slice(0, 10) || []),
                    ...(tv.results?.slice(0, 10) || []),
                    ...(topRated.results?.slice(0, 10) || [])
                ];

                // Shuffle
                const shuffled = mixed.sort(() => Math.random() - 0.5);
                setItems(shuffled.slice(0, 30));
            } catch (err) {
                console.error('Error fetching onboarding items:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchItems();
    }, []);

    const toggleSelection = (id: number) => {
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
        // Add all selected items to My List
        items.filter(item => selected.has(item.id)).forEach(item => {
            toggleList(item);
        });

        // Mark onboarding as complete
        localStorage.setItem('kinemora-onboarding-complete', 'true');
        onComplete();
    };

    const canComplete = selected.size >= MIN_SELECTION;

    if (loading) {
        return (
            <div className="fixed inset-0 bg-[var(--bg-primary)] flex items-center justify-center z-50">
                <div className="w-8 h-8 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-[var(--bg-primary)] z-50 overflow-y-auto">
            {/* Header */}
            <div className="sticky top-0 bg-[var(--bg-primary)] p-4 pb-2 z-10">
                <h1 className="text-2xl font-bold text-center mb-2">Welcome to Kinemora</h1>
                <p className="text-gray-400 text-center text-sm">
                    Select at least {MIN_SELECTION} titles you like to personalize your experience
                </p>
                <p className="text-center text-sm mt-2">
                    <span className={canComplete ? 'text-green-500' : 'text-gray-500'}>
                        {selected.size} / {MIN_SELECTION} selected
                    </span>
                </p>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-3 gap-2 p-4">
                {items.map((item) => {
                    const isSelected = selected.has(item.id);
                    const posterUrl = item.poster_path
                        ? `https://image.tmdb.org/t/p/w342${item.poster_path}`
                        : '/placeholder.jpg';

                    return (
                        <button
                            key={item.id}
                            onClick={() => toggleSelection(item.id)}
                            className={`relative aspect-[2/3] rounded-lg overflow-hidden ${isSelected ? 'ring-2 ring-red-600' : ''
                                }`}
                        >
                            <img
                                src={posterUrl}
                                alt={item.title || item.name}
                                className="w-full h-full object-cover"
                            />

                            {/* Selection overlay */}
                            {isSelected && (
                                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                                    <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center">
                                        <Check size={24} weight="bold" />
                                    </div>
                                </div>
                            )}
                        </button>
                    );
                })}
            </div>

            {/* Bottom button */}
            <div className="sticky bottom-0 p-4 bg-gradient-to-t from-[var(--bg-primary)] to-transparent pt-8">
                <button
                    onClick={handleComplete}
                    disabled={!canComplete}
                    className={`w-full py-4 rounded-lg font-bold text-lg transition-all ${canComplete
                            ? 'bg-red-600 text-white'
                            : 'bg-gray-700 text-gray-400 cursor-not-allowed'
                        }`}
                >
                    {canComplete ? "Let's Go!" : `Select ${MIN_SELECTION - selected.size} more`}
                </button>
            </div>
        </div>
    );
}
