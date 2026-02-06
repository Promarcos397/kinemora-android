import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Movie } from '../types';
import { X, Play, ArrowDown, Plus, Check, ThumbsUp, ShareNetwork } from '@phosphor-icons/react';
import { getMovieDetails } from '../services/api';

interface MobileInfoModalProps {
    movie: Movie;
    isOpen: boolean;
    onClose: () => void;
    isInList: boolean;
    onToggleList: () => void;
}

/**
 * Netflix-style Details modal from Figma
 * - Full backdrop image with gradient
 * - Close X button top right
 * - Title, year, duration, rating
 * - Play and Download buttons
 * - Description text
 * - More Like This section
 */
export default function MobileInfoModal({
    movie,
    isOpen,
    onClose,
    isInList,
    onToggleList
}: MobileInfoModalProps) {
    const navigate = useNavigate();
    const [details, setDetails] = useState<any>(null);

    useEffect(() => {
        if (isOpen && movie) {
            const type = movie.media_type === 'tv' || movie.first_air_date ? 'tv' : 'movie';
            getMovieDetails(Number(movie.id), type).then(setDetails);
        }
    }, [isOpen, movie]);

    if (!isOpen) return null;

    const title = movie.title || movie.name || 'Unknown';
    const year = movie.release_date?.split('-')[0] || movie.first_air_date?.split('-')[0] || '';
    const rating = movie.vote_average?.toFixed(1) || '0';
    const runtime = details?.runtime || details?.episode_run_time?.[0] || 0;
    const overview = movie.overview || 'No description available.';

    const handlePlay = () => {
        const type = movie.media_type === 'tv' || movie.first_air_date ? 'tv' : 'movie';
        navigate(`/watch/${type}/${movie.id}`);
        onClose();
    };

    return (
        <div
            className="fixed inset-0 z-[100] overflow-y-auto"
            style={{ backgroundColor: '#181818' }}
        >
            {/* Backdrop Image */}
            <div className="relative w-full aspect-[3/4]">
                {(movie.poster_path || movie.backdrop_path) && (
                    <img
                        src={`https://image.tmdb.org/t/p/w500${movie.poster_path || movie.backdrop_path}`}
                        alt={title}
                        className="w-full h-full object-cover"
                    />
                )}

                {/* Gradient overlay */}
                <div
                    className="absolute inset-0"
                    style={{
                        background: 'linear-gradient(to top, #181818 0%, rgba(24,24,24,0.95) 20%, rgba(24,24,24,0.6) 40%, transparent 70%)'
                    }}
                />

                {/* Close button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 w-8 h-8 rounded-full bg-black/60 flex items-center justify-center"
                >
                    <X size={18} weight="bold" className="text-white" />
                </button>

                {/* Content overlay */}
                <div className="absolute bottom-0 left-0 right-0 p-4 space-y-3">
                    {/* Title */}
                    <h1 className="text-2xl font-bold text-white">{title}</h1>

                    {/* Metadata row */}
                    <div className="flex items-center gap-3 text-sm">
                        {year && <span className="text-green-500 font-medium">{year}</span>}
                        {runtime > 0 && <span className="text-gray-400">{runtime}m</span>}
                        <span className="text-gray-400">⭐ {rating}</span>
                    </div>

                    {/* Buttons */}
                    <div className="flex gap-2">
                        {/* Play Button */}
                        <button
                            onClick={handlePlay}
                            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-md bg-white text-black font-semibold text-sm"
                        >
                            <Play weight="fill" size={18} />
                            Play
                        </button>

                        {/* Download Button */}
                        <button
                            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-md bg-gray-700 text-white font-medium text-sm"
                        >
                            <ArrowDown size={18} />
                            Download
                        </button>
                    </div>
                </div>
            </div>

            {/* Description */}
            <div className="px-4 py-4">
                <p className="text-sm text-gray-300 leading-relaxed">
                    {overview}
                </p>
            </div>

            {/* Action buttons row */}
            <div className="flex justify-around px-4 py-4 border-t border-gray-800">
                <button
                    onClick={onToggleList}
                    className="flex flex-col items-center gap-1 text-gray-400"
                >
                    {isInList ? <Check size={24} /> : <Plus size={24} />}
                    <span className="text-xs">My List</span>
                </button>
                <button className="flex flex-col items-center gap-1 text-gray-400">
                    <ThumbsUp size={24} />
                    <span className="text-xs">Rate</span>
                </button>
                <button className="flex flex-col items-center gap-1 text-gray-400">
                    <ShareNetwork size={24} />
                    <span className="text-xs">Share</span>
                </button>
            </div>

            {/* More Like This section */}
            {details?.recommendations?.results?.length > 0 && (
                <div className="px-4 py-4">
                    <h2 className="text-[15px] font-medium text-white mb-3">More Like This</h2>
                    <div className="grid grid-cols-3 gap-2">
                        {details.recommendations.results.slice(0, 9).map((item: any) => (
                            <div
                                key={item.id}
                                className="aspect-[2/3] bg-gray-800 rounded overflow-hidden"
                            >
                                {item.poster_path && (
                                    <img
                                        src={`https://image.tmdb.org/t/p/w200${item.poster_path}`}
                                        alt={item.title || item.name}
                                        className="w-full h-full object-cover"
                                        loading="lazy"
                                    />
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Bottom padding for safe area */}
            <div className="h-20" />
        </div>
    );
}
