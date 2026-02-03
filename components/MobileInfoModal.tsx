import React, { useState, useEffect } from 'react';
import { Movie, Episode } from '../types';
import { ArrowLeft, Play, DownloadSimple, Check, ThumbsUp, ShareNetwork, X, CaretDown } from '@phosphor-icons/react';
import { getSeasonDetails } from '../services/api';

interface MobileInfoModalProps {
    movie: Movie;
    isOpen: boolean;
    onClose: () => void;
    onPlay: (season?: number, episode?: number) => void;
    isInList: boolean;
    onToggleList: () => void;
}

/**
 * Full-screen mobile info modal like Netflix app
 * Scrollable, with episodes list for TV shows
 */
export default function MobileInfoModal({
    movie,
    isOpen,
    onClose,
    onPlay,
    isInList,
    onToggleList
}: MobileInfoModalProps) {
    const [activeTab, setActiveTab] = useState<'episodes' | 'similar'>('episodes');
    const [selectedSeason, setSelectedSeason] = useState(1);
    const [episodes, setEpisodes] = useState<Episode[]>([]);
    const [loading, setLoading] = useState(false);

    const isTV = movie.media_type === 'tv' || movie.first_air_date;
    const title = movie.title || movie.name || 'Unknown';
    const year = movie.release_date || movie.first_air_date
        ? new Date(movie.release_date || movie.first_air_date || '').getFullYear()
        : '';
    const rating = movie.vote_average?.toFixed(1);
    const backdropUrl = movie.backdrop_path
        ? `https://image.tmdb.org/t/p/w780${movie.backdrop_path}`
        : movie.poster_path
            ? `https://image.tmdb.org/t/p/w780${movie.poster_path}`
            : '/placeholder.jpg';

    // Fetch episodes for TV shows
    useEffect(() => {
        if (!isTV || !isOpen || !movie.id) return;

        setLoading(true);
        getSeasonDetails(movie.id, selectedSeason)
            .then((data) => {
                setEpisodes(data.episodes || []);
            })
            .catch(() => setEpisodes([]))
            .finally(() => setLoading(false));
    }, [isTV, isOpen, movie.id, selectedSeason]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-[#0a0a0a] z-50 overflow-y-auto">
            {/* Header with back button */}
            <div className="sticky top-0 z-10 flex items-center justify-between p-4 bg-gradient-to-b from-black/80 to-transparent">
                <button onClick={onClose} className="p-2">
                    <ArrowLeft size={24} />
                </button>
                <div className="flex gap-4">
                    <button className="p-2"><DownloadSimple size={24} /></button>
                </div>
            </div>

            {/* Backdrop image */}
            <div className="relative -mt-14">
                <img
                    src={backdropUrl}
                    alt={title}
                    className="w-full aspect-video object-cover"
                />
                <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[#0a0a0a] to-transparent" />
            </div>

            {/* Content */}
            <div className="px-4 -mt-8 relative z-10">
                {/* Title and metadata */}
                <h1 className="text-2xl font-bold">{title}</h1>
                <div className="flex items-center gap-2 mt-2 text-sm text-gray-400">
                    {year && <span>{year}</span>}
                    {movie.adult && (
                        <span className="px-1 border border-gray-500 text-xs">18+</span>
                    )}
                    {isTV && <span>{movie.number_of_seasons || 1} Seasons</span>}
                    <span className="px-1 border border-gray-500 text-xs">HD</span>
                </div>

                {/* Play button */}
                <button
                    onClick={() => onPlay(isTV ? selectedSeason : undefined, isTV ? 1 : undefined)}
                    className="btn-play-full mt-4"
                >
                    <Play weight="fill" size={20} />
                    Play{isTV ? ' S1:E1' : ''}
                </button>

                {/* Download button */}
                <button className="btn-download-full">
                    <DownloadSimple size={20} />
                    Download{isTV ? ' S1:E1' : ''}
                </button>

                {/* Description */}
                <p className="text-sm text-gray-300 mt-4 leading-relaxed">
                    {movie.overview || 'No description available.'}
                </p>

                {/* Cast/Creators (if available) */}
                {movie.credits?.cast && (
                    <p className="text-xs text-gray-500 mt-2">
                        <span className="text-gray-400">Starring:</span>{' '}
                        {movie.credits.cast.slice(0, 3).map(c => c.name).join(', ')}
                    </p>
                )}

                {/* Action icons */}
                <div className="action-icons">
                    <button onClick={onToggleList} className="action-icon">
                        {isInList ? <Check size={24} /> : <Plus size={24} />}
                        <span>My List</span>
                    </button>
                    <button className="action-icon">
                        <ThumbsUp size={24} />
                        <span>Rate</span>
                    </button>
                    <button className="action-icon">
                        <ShareNetwork size={24} />
                        <span>Share</span>
                    </button>
                </div>

                {/* Tabs for TV shows */}
                {isTV && (
                    <>
                        <div className="flex gap-6 border-b border-gray-800 mt-4">
                            <button
                                onClick={() => setActiveTab('episodes')}
                                className={`pb-2 text-sm font-medium ${activeTab === 'episodes' ? 'text-white border-b-2 border-red-600' : 'text-gray-400'}`}
                            >
                                Episodes
                            </button>
                            <button
                                onClick={() => setActiveTab('similar')}
                                className={`pb-2 text-sm font-medium ${activeTab === 'similar' ? 'text-white border-b-2 border-red-600' : 'text-gray-400'}`}
                            >
                                More like this
                            </button>
                        </div>

                        {/* Season selector */}
                        {activeTab === 'episodes' && (
                            <div className="mt-4 flex items-center justify-between">
                                <button className="season-dropdown">
                                    Season {selectedSeason}
                                    <CaretDown size={16} />
                                </button>
                            </div>
                        )}

                        {/* Episodes list */}
                        {activeTab === 'episodes' && (
                            <div className="mt-4 pb-20">
                                {loading ? (
                                    <div className="text-center py-8 text-gray-500">Loading...</div>
                                ) : episodes.length === 0 ? (
                                    <div className="text-center py-8 text-gray-500">No episodes found</div>
                                ) : (
                                    episodes.map((ep) => (
                                        <div
                                            key={ep.id}
                                            className="episode-item"
                                            onClick={() => onPlay(selectedSeason, ep.episode_number)}
                                        >
                                            <div className="episode-thumb relative">
                                                <img
                                                    src={ep.still_path
                                                        ? `https://image.tmdb.org/t/p/w300${ep.still_path}`
                                                        : backdropUrl}
                                                    alt={ep.name}
                                                    className="w-full h-full object-cover rounded"
                                                />
                                                <div className="episode-play-icon">
                                                    <Play weight="fill" size={14} />
                                                </div>
                                            </div>
                                            <div className="episode-info">
                                                <div className="episode-title">
                                                    {ep.episode_number}. {ep.name}
                                                </div>
                                                <div className="episode-duration">
                                                    {ep.runtime || 45}m
                                                </div>
                                                <div className="episode-desc line-clamp-2">
                                                    {ep.overview || 'No description.'}
                                                </div>
                                            </div>
                                            <button className="p-2 self-start">
                                                <DownloadSimple size={20} className="text-gray-400" />
                                            </button>
                                        </div>
                                    ))
                                )}
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
