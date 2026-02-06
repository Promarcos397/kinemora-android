import React from 'react';
import { Movie } from '../types';
import { Play, Plus, Check } from '@phosphor-icons/react';

interface MobileHeroCardProps {
    movie: Movie;
    isInList: boolean;
    onPlay: () => void;
    onToggleList: () => void;
    onCardClick: () => void;
}

/**
 * Netflix-style hero card from Figma
 * - Large poster taking ~55% of screen
 * - Gradient overlay at bottom
 * - Title text (large), genre tags (small gray)
 * - Play (white) and My List (outline) buttons
 */
export default function MobileHeroCard({
    movie,
    isInList,
    onPlay,
    onToggleList,
    onCardClick
}: MobileHeroCardProps) {
    const title = movie.title || movie.name || 'Unknown';
    const genres = getGenreNames(movie.genre_ids || []).slice(0, 3).join(' • ');

    return (
        <div
            className="relative w-full mx-4 rounded-lg overflow-hidden cursor-pointer"
            style={{ width: 'calc(100% - 32px)' }}
            onClick={onCardClick}
        >
            {/* Poster Image - Aspect ratio ~3:4 */}
            <div className="relative aspect-[3/4]">
                {movie.poster_path ? (
                    <img
                        src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                        alt={title}
                        className="w-full h-full object-cover"
                    />
                ) : movie.backdrop_path ? (
                    <img
                        src={`https://image.tmdb.org/t/p/w780${movie.backdrop_path}`}
                        alt={title}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="w-full h-full bg-gray-800 flex items-center justify-center">
                        <span className="text-gray-500">{title}</span>
                    </div>
                )}

                {/* Gradient Overlay */}
                <div
                    className="absolute inset-0"
                    style={{
                        background: 'linear-gradient(to top, #181818 0%, rgba(24,24,24,0.9) 15%, rgba(24,24,24,0.5) 30%, transparent 50%)'
                    }}
                />

                {/* Content at bottom */}
                <div
                    className="absolute bottom-0 left-0 right-0 p-4 space-y-3"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Title - Large */}
                    <h1 className="text-xl font-bold text-white leading-tight">
                        {title}
                    </h1>

                    {/* Genre tags */}
                    {genres && (
                        <p className="text-xs text-gray-400">
                            {genres}
                        </p>
                    )}

                    {/* Buttons */}
                    <div className="flex gap-2">
                        {/* Play Button - White filled */}
                        <button
                            onClick={(e) => { e.stopPropagation(); onPlay(); }}
                            className="flex-1 flex items-center justify-center gap-2 py-2 rounded-md bg-white text-black font-semibold text-sm"
                        >
                            <Play weight="fill" size={18} />
                            Play
                        </button>

                        {/* My List Button - Border outline */}
                        <button
                            onClick={(e) => { e.stopPropagation(); onToggleList(); }}
                            className="flex-1 flex items-center justify-center gap-2 py-2 rounded-md bg-transparent text-white font-medium text-sm border border-gray-500"
                        >
                            {isInList ? (
                                <>
                                    <Check size={18} />
                                    My List
                                </>
                            ) : (
                                <>
                                    <Plus size={18} />
                                    My List
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Genre ID to name mapping
function getGenreNames(genreIds: number[]): string[] {
    const genreMap: Record<number, string> = {
        28: 'Action', 12: 'Adventure', 16: 'Animation', 35: 'Comedy',
        80: 'Crime', 99: 'Documentary', 18: 'Drama', 10751: 'Family',
        14: 'Fantasy', 36: 'History', 27: 'Horror', 10402: 'Music',
        9648: 'Mystery', 10749: 'Romance', 878: 'Sci-Fi', 10770: 'TV Movie',
        53: 'Thriller', 10752: 'War', 37: 'Western',
        10759: 'Action & Adventure', 10762: 'Kids', 10763: 'News',
        10764: 'Reality', 10765: 'Sci-Fi & Fantasy', 10766: 'Soap',
        10767: 'Talk', 10768: 'War & Politics'
    };
    return genreIds.map(id => genreMap[id] || '').filter(Boolean);
}
