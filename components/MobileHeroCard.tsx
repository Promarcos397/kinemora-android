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
 * Netflix-style hero card - 65vh height with gradient
 */
export default function MobileHeroCard({
    movie,
    isInList,
    onPlay,
    onToggleList,
    onCardClick
}: MobileHeroCardProps) {
    const genres = movie.genre_ids
        ? getGenreNames(movie.genre_ids).slice(0, 4).join(' • ')
        : movie.media_type === 'tv' ? 'TV Series' : 'Movie';

    const title = movie.title || movie.name || 'Unknown';

    return (
        <div className="relative w-full cursor-pointer" style={{ height: '65vh' }} onClick={onCardClick}>
            <div className="absolute inset-0">
                {movie.backdrop_path ? (
                    <img
                        src={`https://image.tmdb.org/t/p/w780${movie.backdrop_path}`}
                        alt={title}
                        className="w-full h-full object-cover"
                    />
                ) : movie.poster_path ? (
                    <img
                        src={`https://image.tmdb.org/t/p/w500${movie.poster_path}`}
                        alt={title}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="w-full h-full bg-gray-900 flex items-center justify-center">
                        <span className="text-gray-500">{title}</span>
                    </div>
                )}
            </div>
            <div
                className="absolute inset-0"
                style={{
                    background: 'linear-gradient(to top, #0a0a0a 0%, rgba(10,10,10,0.8) 20%, rgba(10,10,10,0.4) 40%, rgba(10,10,10,0.2) 60%, transparent 100%)'
                }}
            />
            <div className="absolute bottom-0 left-0 right-0 p-4 space-y-3" onClick={(e) => e.stopPropagation()}>
                <h1 className="text-2xl font-bold text-white drop-shadow-lg">{title}</h1>
                <p className="text-sm text-gray-300">{genres}</p>
                <div className="flex gap-2 pt-1">
                    <button
                        onClick={(e) => { e.stopPropagation(); onPlay(); }}
                        className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded bg-white text-black font-semibold text-sm"
                    >
                        <Play weight="fill" size={18} />
                        Play
                    </button>
                    <button
                        onClick={(e) => { e.stopPropagation(); onToggleList(); }}
                        className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded bg-gray-700/80 text-white font-medium text-sm border border-gray-600"
                    >
                        {isInList ? <Check size={18} /> : <Plus size={18} />}
                        My List
                    </button>
                </div>
            </div>
        </div>
    );
}

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
    return genreIds.map(id => genreMap[id] || 'Unknown').filter(Boolean);
}
