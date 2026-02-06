import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Movie } from '../types';
import { X, Play, Plus, Check, ShareNetwork, ThumbsUp, ThumbsDown } from '@phosphor-icons/react';

interface MobileInfoModalProps {
    movie: Movie;
    isOpen: boolean;
    onClose: () => void;
    isInList: boolean;
    onToggleList: () => void;
}

/**
 * Netflix-style info modal for movie/show details
 */
export default function MobileInfoModal({
    movie,
    isOpen,
    onClose,
    isInList,
    onToggleList
}: MobileInfoModalProps) {
    const navigate = useNavigate();

    if (!isOpen || !movie) return null;

    const title = movie.title || movie.name || 'Unknown';
    const year = movie.release_date?.split('-')[0] || movie.first_air_date?.split('-')[0] || '';
    const rating = movie.vote_average?.toFixed(1) || 'N/A';

    const handlePlay = () => {
        const type = movie.media_type === 'tv' || movie.first_air_date ? 'tv' : 'movie';
        navigate(`/watch/${type}/${movie.id}`);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[100] bg-black/80" onClick={onClose}>
            <div
                className="absolute bottom-0 left-0 right-0 bg-[#181818] rounded-t-xl max-h-[85vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Close button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-10 w-8 h-8 bg-[#181818] rounded-full flex items-center justify-center"
                >
                    <X size={20} className="text-white" />
                </button>

                {/* Backdrop image */}
                <div className="relative aspect-video">
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
                        <div className="w-full h-full bg-gray-800" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-[#181818] to-transparent" />
                </div>

                {/* Content */}
                <div className="px-4 pb-8 -mt-16 relative">
                    <h2 className="text-xl font-bold text-white mb-2">{title}</h2>

                    <div className="flex items-center gap-3 text-sm text-gray-400 mb-4">
                        <span className="text-green-500 font-medium">{rating}★</span>
                        <span>{year}</span>
                        {movie.media_type && (
                            <span className="px-1.5 py-0.5 border border-gray-500 text-xs">
                                {movie.media_type === 'tv' ? 'TV' : 'MOVIE'}
                            </span>
                        )}
                    </div>

                    {/* Play button */}
                    <button
                        onClick={handlePlay}
                        className="w-full flex items-center justify-center gap-2 py-2.5 rounded bg-white text-black font-semibold text-sm mb-4"
                    >
                        <Play weight="fill" size={18} />
                        Play
                    </button>

                    {/* Overview */}
                    <p className="text-sm text-gray-300 mb-4 line-clamp-4">{movie.overview}</p>

                    {/* Action buttons */}
                    <div className="flex items-center justify-around py-4 border-t border-gray-700">
                        <button
                            onClick={onToggleList}
                            className="flex flex-col items-center gap-1"
                        >
                            {isInList ? (
                                <Check size={24} className="text-white" />
                            ) : (
                                <Plus size={24} className="text-gray-400" />
                            )}
                            <span className="text-xs text-gray-400">My List</span>
                        </button>
                        <button className="flex flex-col items-center gap-1">
                            <ThumbsUp size={24} className="text-gray-400" />
                            <span className="text-xs text-gray-400">Rate</span>
                        </button>
                        <button className="flex flex-col items-center gap-1">
                            <ShareNetwork size={24} className="text-gray-400" />
                            <span className="text-xs text-gray-400">Share</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
