import React, { useMemo } from 'react';
import { Movie } from '../types';
import { Play, Plus, Check } from '@phosphor-icons/react';

interface MobileHeroCardProps {
    movie: Movie;
    isInList: boolean;
    onPlay: () => void;
    onToggleList: () => void;
    onCardClick: () => void;
}

// Genre ID to descriptive tags mapping
const GENRE_TAGS: Record<number, string> = {
    28: 'Action-Packed', 12: 'Adventurous', 16: 'Animated', 35: 'Witty',
    80: 'Gritty', 99: 'Insightful', 18: 'Emotional', 10751: 'Heartwarming',
    14: 'Imaginative', 36: 'Epic', 27: 'Chilling', 10402: 'Musical',
    9648: 'Suspenseful', 10749: 'Romantic', 878: 'Mind-Bending', 10770: 'Made-for-TV',
    53: 'Tense', 10752: 'Intense', 37: 'Classic',
    10759: 'Exciting', 10762: 'Family-Friendly', 10763: 'Current',
    10764: 'Unscripted', 10765: 'Sci-Fi', 10766: 'Dramatic',
    10767: 'Conversational', 10768: 'Political'
};

/**
 * Netflix-style hero card
 * - ~56vh height
 * - Slight rounded corners (more than movie cards)
 * - Thin white border with drop shadow
 * - Poster image, 3 tags separated by dots
 * - Play button (white bg, dark text, rounded-md)
 * - My List button (gray opacity, white text, rounded-md)
 * - Background gradient fading to dark
 */
export default function MobileHeroCard({
    movie,
    isInList,
    onPlay,
    onToggleList,
    onCardClick
}: MobileHeroCardProps) {

    // Get 3 descriptive tags from genre IDs
    const tags = useMemo(() => {
        if (!movie.genre_ids?.length) {
            return movie.media_type === 'tv' ? ['Binge-Worthy', 'Series', 'Streaming'] : ['Cinematic', 'Movie', 'Streaming'];
        }
        return movie.genre_ids
            .slice(0, 3)
            .map(id => GENRE_TAGS[id] || 'Exciting')
            .filter(Boolean);
    }, [movie.genre_ids, movie.media_type]);

    const title = movie.title || movie.name || 'Unknown';

    return (
        <div className="relative w-full px-3 pt-2" onClick={onCardClick}>
            {/* Card container with border and shadow */}
            <div
                className="relative w-full overflow-hidden cursor-pointer"
                style={{
                    height: '56vh',
                    borderRadius: '12px',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)'
                }}
            >
                {/* Poster Image */}
                <div className="absolute inset-0">
                    {movie.poster_path ? (
                        <img
                            src={`https://image.tmdb.org/t/p/w780${movie.poster_path}`}
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
                        <div className="w-full h-full bg-gray-900 flex items-center justify-center">
                            <span className="text-gray-500 text-xl">{title}</span>
                        </div>
                    )}
                </div>

                {/* Gradient overlay - fades to dark at bottom */}
                <div
                    className="absolute inset-0"
                    style={{
                        background: 'linear-gradient(to top, rgba(10,10,10,0.95) 0%, rgba(10,10,10,0.6) 30%, rgba(10,10,10,0.2) 50%, transparent 70%)'
                    }}
                />

                {/* Content at bottom */}
                <div
                    className="absolute bottom-0 left-0 right-0 p-4 space-y-3"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Tags with dot separators */}
                    <div className="flex items-center justify-center gap-2 text-sm text-gray-300">
                        {tags.map((tag, index) => (
                            <React.Fragment key={tag}>
                                {index > 0 && (
                                    <span className="text-gray-500">•</span>
                                )}
                                <span>{tag}</span>
                            </React.Fragment>
                        ))}
                    </div>

                    {/* Buttons */}
                    <div className="flex gap-3">
                        {/* Play Button - white bg, dark text */}
                        <button
                            onClick={(e) => { e.stopPropagation(); onPlay(); }}
                            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-md bg-white text-black font-bold text-base active:scale-95 transition-transform"
                        >
                            <Play weight="fill" size={20} />
                            Play
                        </button>

                        {/* My List Button - gray opacity, white text */}
                        <button
                            onClick={(e) => { e.stopPropagation(); onToggleList(); }}
                            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-md font-bold text-base text-white active:scale-95 transition-transform"
                            style={{
                                backgroundColor: 'rgba(80, 80, 80, 0.7)',
                            }}
                        >
                            {isInList ? (
                                <Check weight="bold" size={20} />
                            ) : (
                                <Plus weight="bold" size={20} />
                            )}
                            My List
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
