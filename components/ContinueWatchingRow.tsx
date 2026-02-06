import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Movie } from '../types';
import { Info } from '@phosphor-icons/react';

interface ContinueWatchingRowProps {
    items: Movie[];
    onInfoClick: (movie: Movie) => void;
}

interface WatchProgress {
    movieId: number;
    progress: number; // 0-100
    timestamp: number;
}

/**
 * Netflix-style Continue Watching row
 * - Cards with top corners rounded, bottom corners blend into progress section
 * - Red filled / grayish unfilled progress bar
 * - Info button below progress bar
 */
export default function ContinueWatchingRow({ items, onInfoClick }: ContinueWatchingRowProps) {
    const navigate = useNavigate();

    // Get mock progress (in real app, this would come from localStorage/context)
    const getProgress = (movieId: number): number => {
        // Mock: return random progress between 10-90%
        return Math.floor(Math.random() * 80) + 10;
    };

    const handlePlay = (movie: Movie) => {
        const type = movie.media_type === 'tv' || movie.first_air_date ? 'tv' : 'movie';
        navigate(`/watch/${type}/${movie.id}`);
    };

    if (items.length === 0) return null;

    return (
        <div className="py-2">
            <h2 className="text-white text-base font-semibold px-4 mb-2">Continue Watching</h2>
            <div className="flex gap-2 overflow-x-auto px-4 scrollbar-hide">
                {items.map((item) => {
                    const progress = getProgress(Number(item.id));

                    return (
                        <div key={item.id} className="flex-shrink-0 w-32">
                            {/* Card with poster */}
                            <div
                                className="relative cursor-pointer"
                                onClick={() => handlePlay(item)}
                            >
                                {/* Poster - top corners rounded */}
                                <div
                                    className="aspect-[16/9] bg-gray-800 overflow-hidden"
                                    style={{ borderRadius: '6px 6px 0 0' }}
                                >
                                    {item.backdrop_path ? (
                                        <img
                                            src={`https://image.tmdb.org/t/p/w300${item.backdrop_path}`}
                                            alt={item.title || item.name}
                                            className="w-full h-full object-cover"
                                            loading="lazy"
                                        />
                                    ) : item.poster_path ? (
                                        <img
                                            src={`https://image.tmdb.org/t/p/w200${item.poster_path}`}
                                            alt={item.title || item.name}
                                            className="w-full h-full object-cover"
                                            loading="lazy"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-gray-500 text-xs">
                                            {item.title || item.name}
                                        </div>
                                    )}
                                </div>

                                {/* Progress bar section - blends with card */}
                                <div
                                    className="bg-[#2d2d2d] px-0"
                                    style={{ borderRadius: '0 0 6px 6px' }}
                                >
                                    {/* Progress bar */}
                                    <div className="h-1 bg-gray-600 relative">
                                        <div
                                            className="absolute top-0 left-0 h-full bg-red-600"
                                            style={{ width: `${progress}%` }}
                                        />
                                    </div>

                                    {/* Info button */}
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onInfoClick(item);
                                        }}
                                        className="w-full flex items-center justify-center gap-1 py-2 text-gray-400 hover:text-white transition-colors"
                                    >
                                        <Info size={14} weight="bold" />
                                        <span className="text-xs">Info</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
