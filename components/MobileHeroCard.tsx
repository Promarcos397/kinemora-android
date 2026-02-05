import React from 'react';
import { Play, Plus, Check } from '@phosphor-icons/react';
import { Movie } from '../types';

// Genre map for TMDB
const GENRE_MAP: { [key: number]: string } = {
    28: 'Action', 12: 'Adventure', 16: 'Animation', 35: 'Comedy',
    80: 'Crime', 99: 'Documentary', 18: 'Drama', 10751: 'Family',
    14: 'Fantasy', 36: 'History', 27: 'Horror', 10402: 'Music',
    9648: 'Mystery', 10749: 'Romance', 878: 'Sci-Fi', 10770: 'TV Movie',
    53: 'Thriller', 10752: 'War', 37: 'Western',
    10759: 'Action & Adventure', 10762: 'Kids', 10763: 'News',
    10764: 'Reality', 10765: 'Sci-Fi & Fantasy', 10766: 'Soap',
    10767: 'Talk', 10768: 'War & Politics'
};

interface MobileHeroCardProps {
    movie: Movie;
    isInList: boolean;
    onPlayClick: () => void;
    onListClick: () => void;
    onCardClick: () => void;
}

/**
 * Netflix-style hero card
 * - Large poster (50%+ screen)
 * - Title overlay at bottom
 * - Genre tags with bullet separator
 * - Play and My List buttons
 */
export default function MobileHeroCard({
    movie,
    isInList,
    onPlayClick,
    onListClick,
    onCardClick
}: MobileHeroCardProps) {

    // Generate tags from genres
    const getTags = (): string[] => {
        if (!movie.genre_ids || movie.genre_ids.length === 0) return [];
        return movie.genre_ids
            .slice(0, 4)
            .map(id => GENRE_MAP[id])
            .filter(Boolean);
    };

    const tags = getTags();
    const title = movie.title || movie.name || 'Unknown';
    const posterUrl = movie.poster_path
        ? `https://image.tmdb.org/t/p/w780${movie.poster_path}`
        : null;

    return (
        <div
            className="relative rounded-lg overflow-hidden mx-4 cursor-pointer"
            onClick={onCardClick}
        >
            {/* Poster */}
            {posterUrl ? (
                <img
                    src={posterUrl}
                    alt={title}
                    className="w-full aspect-[2/3] object-cover max-h-[55vh]"
                    loading="eager"
                />
            ) : (
                <div className="w-full aspect-[2/3] max-h-[55vh] bg-gray-800 flex items-center justify-center">
                    <span className="text-gray-500 text-xl">{title}</span>
                </div>
            )}

            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent" />

            {/* Content at bottom */}
            <div className="absolute bottom-0 left-0 right-0 p-4">
                {/* Title */}
                <h1 className="text-2xl font-bold text-white mb-2 drop-shadow-lg">
                    {title}
                </h1>

                {/* Tags - bullet separated */}
                {tags.length > 0 && (
                    <div className="text-sm text-gray-300 mb-4">
                        {tags.join(' • ')}
                    </div>
                )}

                {/* Buttons */}
                <div className="flex gap-3">
                    <button
                        onClick={(e) => { e.stopPropagation(); onPlayClick(); }}
                        className="flex-1 bg-white text-black py-2.5 px-4 rounded flex items-center justify-center gap-2 font-semibold active:bg-gray-200 transition-colors"
                    >
                        <Play weight="fill" size={20} />
                        Play
                    </button>
                    <button
                        onClick={(e) => { e.stopPropagation(); onListClick(); }}
                        className="flex-1 bg-[#333]/80 text-white py-2.5 px-4 rounded flex items-center justify-center gap-2 font-semibold border border-white/20 active:bg-[#444] transition-colors"
                    >
                        {isInList ? (
                            <><Check weight="bold" size={20} /> My List</>
                        ) : (
                            <><Plus weight="bold" size={20} /> My List</>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
