import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Movie } from '../types';
import { getSeasonDetails, getRecommendations, fetchTrailer } from '../services/api';
import {
    ArrowLeft, MagnifyingGlass, Play, Plus, Check,
    CaretDown, X, SpeakerHigh, SpeakerSlash
} from '@phosphor-icons/react';

// Genre map
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

interface Episode {
    id: number;
    name: string;
    episode_number: number;
    overview: string;
    still_path: string | null;
    runtime: number;
}

interface MobileInfoModalProps {
    movie: Movie;
    isOpen: boolean;
    onClose: () => void;
    isInList: boolean;
    onToggleList: () => void;
}

/**
 * Netflix-style info modal
 * - Back arrow + Search in page bar
 * - Trailer player with play/pause, mute, progress bar
 * - Title, tags, description
 * - Play and My List buttons
 * - Episodes/More Like This tabs
 * - Season selector overlay
 */
export default function MobileInfoModal({
    movie,
    isOpen,
    onClose,
    isInList,
    onToggleList
}: MobileInfoModalProps) {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<'episodes' | 'similar'>('episodes');
    const [selectedSeason, setSelectedSeason] = useState(1);
    const [seasonOverlayOpen, setSeasonOverlayOpen] = useState(false);
    const [episodes, setEpisodes] = useState<Episode[]>([]);
    const [similar, setSimilar] = useState<Movie[]>([]);
    const [trailerKey, setTrailerKey] = useState<string | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isMuted, setIsMuted] = useState(true);
    const [progress, setProgress] = useState(0);
    const [loadingEpisodes, setLoadingEpisodes] = useState(false);
    
    const isTVShow = movie.media_type === 'tv' || movie.first_air_date || movie.name;
    const title = movie.title || movie.name || 'Unknown';
    const year = (movie.release_date || movie.first_air_date || '').substring(0, 4);
    const numberOfSeasons = (movie as any).number_of_seasons || 5;

    // Get tags
    const getTags = (): string[] => {
        if (!movie.genre_ids || movie.genre_ids.length === 0) return [];
        return movie.genre_ids.slice(0, 4).map(id => GENRE_MAP[id]).filter(Boolean);
    };

    // Fetch trailer
    useEffect(() => {
        if (isOpen && movie.id) {
            const type = isTVShow ? 'tv' : 'movie';
            fetchTrailer(movie.id, type).then(key => {
                setTrailerKey(key);
            });
        }
    }, [isOpen, movie.id, isTVShow]);

    // Fetch episodes for TV shows
    useEffect(() => {
        if (isOpen && isTVShow && movie.id) {
            setLoadingEpisodes(true);
            getSeasonDetails(movie.id, selectedSeason).then(data => {
                setEpisodes(data?.episodes || []);
                setLoadingEpisodes(false);
            });
        }
    }, [isOpen, isTVShow, movie.id, selectedSeason]);

    // Fetch similar content
    useEffect(() => {
        if (isOpen && movie.id) {
            const type = isTVShow ? 'tv' : 'movie';
            getRecommendations(movie.id, type).then(data => {
                setSimilar(data?.slice(0, 12) || []);
            });
        }
    }, [isOpen, movie.id, isTVShow]);

    const handlePlay = () => {
        const type = isTVShow ? 'tv' : 'movie';
        navigate(`/watch/${type}/${movie.id}?season=${selectedSeason}&episode=1`);
        onClose();
    };

    const handleEpisodePlay = (episodeNum: number) => {
        navigate(`/watch/tv/${movie.id}?season=${selectedSeason}&episode=${episodeNum}`);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-[#0a0a0a] z-[90] overflow-y-auto">
            {/* Page Bar */}
            <div className="sticky top-0 h-12 bg-[#0a0a0a] flex items-center justify-between px-4 z-50">
                <button onClick={onClose} className="p-1 -ml-1">
                    <ArrowLeft size={24} weight="bold" className="text-white" />
                </button>
                <button onClick={() => navigate('/search')} className="p-2">
                    <MagnifyingGlass size={22} weight="bold" className="text-white" />
                </button>
            </div>

            {/* Trailer Player */}
            <div className="relative aspect-video bg-black">
                {trailerKey ? (
                    <iframe
                        src={`https://www.youtube.com/embed/${trailerKey}?autoplay=1&mute=${isMuted ? 1 : 0}&controls=0&modestbranding=1&rel=0`}
                        className="w-full h-full"
                        allow="autoplay; encrypted-media"
                        allowFullScreen
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <span className="text-gray-500">No trailer available</span>
                    </div>
                )}
                
                {/* Mute button */}
                <button 
                    onClick={() => setIsMuted(!isMuted)}
                    className="absolute bottom-4 right-4 w-8 h-8 bg-black/60 rounded-full flex items-center justify-center border border-white/30"
                >
                    {isMuted ? (
                        <SpeakerSlash size={16} className="text-white" />
                    ) : (
                        <SpeakerHigh size={16} className="text-white" />
                    )}
                </button>
            </div>

            {/* Content */}
            <div className="px-4 py-4">
                {/* Title */}
                <h1 className="text-2xl font-bold text-white mb-2">{title}</h1>

                {/* Tags row: year, rating, HD */}
                <div className="flex items-center gap-2 text-sm text-gray-400 mb-3">
                    {year && <span>{year}</span>}
                    <span className="px-1.5 py-0.5 border border-gray-500 text-xs rounded">16+</span>
                    <span className="px-1.5 py-0.5 border border-gray-500 text-xs rounded">HD</span>
                    {getTags().length > 0 && (
                        <span className="text-gray-400">{getTags().slice(0, 2).join(' • ')}</span>
                    )}
                </div>

                {/* Play Button - Full width */}
                <button 
                    onClick={handlePlay}
                    className="w-full bg-white text-black py-3 rounded flex items-center justify-center gap-2 font-semibold mb-3"
                >
                    <Play weight="fill" size={22} />
                    Play
                </button>

                {/* My List Button - Full width */}
                <button 
                    onClick={onToggleList}
                    className="w-full bg-[#2a2a2a] text-white py-3 rounded flex items-center justify-center gap-2 font-semibold mb-4 border border-white/10"
                >
                    {isInList ? (
                        <><Check weight="bold" size={22} /> My List</>
                    ) : (
                        <><Plus weight="bold" size={22} /> My List</>
                    )}
                </button>

                {/* Description */}
                <p className="text-gray-300 text-sm leading-relaxed mb-4">
                    {movie.overview || 'No description available.'}
                </p>

                {/* Starring - placeholder */}
                <p className="text-gray-500 text-sm mb-6">
                    Starring: Cast information
                </p>

                {/* Tabs */}
                <div className="flex gap-6 border-b border-white/10 mb-4">
                    {isTVShow && (
                        <button
                            onClick={() => setActiveTab('episodes')}
                            className={`pb-2 text-sm font-semibold ${
                                activeTab === 'episodes' 
                                    ? 'text-white border-b-2 border-[#e50914]' 
                                    : 'text-gray-500'
                            }`}
                        >
                            Episodes
                        </button>
                    )}
                    <button
                        onClick={() => setActiveTab('similar')}
                        className={`pb-2 text-sm font-semibold ${
                            activeTab === 'similar' 
                                ? 'text-white border-b-2 border-[#e50914]' 
                                : 'text-gray-500'
                        }`}
                    >
                        More like this
                    </button>
                </div>

                {/* Episodes Tab */}
                {activeTab === 'episodes' && isTVShow && (
                    <div>
                        {/* Season Selector */}
                        <button
                            onClick={() => setSeasonOverlayOpen(true)}
                            className="flex items-center gap-1.5 bg-[#2a2a2a] px-4 py-2 rounded mb-4"
                        >
                            <span className="text-white text-sm font-medium">Season {selectedSeason}</span>
                            <CaretDown size={14} className="text-white" />
                        </button>

                        {/* Episode List */}
                        {loadingEpisodes ? (
                            <div className="text-gray-500 text-center py-8">Loading episodes...</div>
                        ) : (
                            <div className="space-y-4">
                                {episodes.map((ep) => (
                                    <div key={ep.id} className="flex gap-3">
                                        {/* Thumbnail with play button */}
                                        <div 
                                            className="relative w-28 aspect-video bg-gray-800 rounded overflow-hidden flex-shrink-0 cursor-pointer"
                                            onClick={() => handleEpisodePlay(ep.episode_number)}
                                        >
                                            {ep.still_path ? (
                                                <img
                                                    src={`https://image.tmdb.org/t/p/w300${ep.still_path}`}
                                                    alt={ep.name}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div className="w-full h-full bg-gray-700" />
                                            )}
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <div className="w-8 h-8 bg-black/60 rounded-full flex items-center justify-center border border-white/50">
                                                    <Play weight="fill" size={14} className="text-white ml-0.5" />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Episode info */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-2">
                                                <div>
                                                    <h4 className="text-white text-sm font-medium">
                                                        {ep.episode_number}. {ep.name}
                                                    </h4>
                                                    {ep.runtime && (
                                                        <span className="text-gray-500 text-xs">{ep.runtime}m</span>
                                                    )}
                                                </div>
                                            </div>
                                            <p className="text-gray-500 text-xs mt-1 line-clamp-3">
                                                {ep.overview || 'No description available.'}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* More Like This Tab */}
                {activeTab === 'similar' && (
                    <div className="grid grid-cols-3 gap-2">
                        {similar.map((item) => (
                            <div 
                                key={item.id}
                                className="aspect-[2/3] bg-gray-800 rounded overflow-hidden cursor-pointer"
                                onClick={() => {
                                    // Could open another info modal or navigate
                                }}
                            >
                                {item.poster_path ? (
                                    <img
                                        src={`https://image.tmdb.org/t/p/w300${item.poster_path}`}
                                        alt={item.title || item.name}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center">
                                        <span className="text-gray-600 text-xs text-center px-1">
                                            {item.title || item.name}
                                        </span>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Bottom padding for scrolling */}
            <div className="h-20" />

            {/* Season Overlay */}
            {seasonOverlayOpen && (
                <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center">
                    <div 
                        className="absolute inset-0 bg-black/90"
                        onClick={() => setSeasonOverlayOpen(false)}
                    />
                    <div 
                        className="relative z-10 max-h-[60vh] overflow-y-auto py-4"
                        style={{
                            maskImage: 'linear-gradient(to bottom, transparent 0%, black 10%, black 90%, transparent 100%)',
                            WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 10%, black 90%, transparent 100%)'
                        }}
                    >
                        {Array.from({ length: numberOfSeasons }, (_, i) => i + 1).map(num => (
                            <button
                                key={num}
                                onClick={() => {
                                    setSelectedSeason(num);
                                    setSeasonOverlayOpen(false);
                                }}
                                className={`block w-full py-3 px-12 text-center text-lg ${
                                    selectedSeason === num 
                                        ? 'text-white font-bold text-xl' 
                                        : 'text-gray-500'
                                }`}
                            >
                                Season {num}
                            </button>
                        ))}
                    </div>
                    <button 
                        onClick={() => setSeasonOverlayOpen(false)}
                        className="absolute bottom-8 w-12 h-12 bg-white rounded-full flex items-center justify-center z-10"
                    >
                        <X size={24} weight="bold" className="text-black" />
                    </button>
                </div>
            )}
        </div>
    );
}
