import React, { useState, useEffect, useRef } from 'react';
import { Movie, Episode } from '../types';
import {
    ArrowLeft, MagnifyingGlass, Play, Pause, SpeakerHigh, SpeakerSlash,
    Plus, Check, CaretDown
} from '@phosphor-icons/react';
import { getSeasonDetails, getMovieVideos } from '../services/api';
import CategoryOverlay from './CategoryOverlay';

interface MobileInfoModalProps {
    movie: Movie;
    isOpen: boolean;
    onClose: () => void;
    onPlay: (season?: number, episode?: number) => void;
    isInList: boolean;
    onToggleList: () => void;
}

/**
 * Full Info Modal with custom trailer player, episodes list, tabs
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
    const [seasonOverlayOpen, setSeasonOverlayOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    // Video player state
    const videoRef = useRef<HTMLVideoElement>(null);
    const [trailerUrl, setTrailerUrl] = useState<string | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isMuted, setIsMuted] = useState(true);
    const [progress, setProgress] = useState(0);
    const [duration, setDuration] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);

    const isTV = movie.media_type === 'tv' || movie.first_air_date;
    const title = movie.title || movie.name || 'Unknown';
    const year = (movie.release_date || movie.first_air_date)
        ? new Date(movie.release_date || movie.first_air_date || '').getFullYear()
        : '';
    const rating = movie.vote_average;

    // Fetch trailer
    useEffect(() => {
        if (!isOpen || !movie.id) return;

        const fetchTrailer = async () => {
            try {
                const type = isTV ? 'tv' : 'movie';
                const videos = await getMovieVideos(movie.id, type);
                const trailer = videos.results?.find(
                    (v: { type: string; site: string }) => v.type === 'Trailer' && v.site === 'YouTube'
                );
                if (trailer) {
                    // For now, use a placeholder - real implementation would use a video service
                    setTrailerUrl(null); // We'll use poster as fallback
                }
            } catch (err) {
                console.error('Error fetching trailer:', err);
            }
        };

        fetchTrailer();
    }, [isOpen, movie.id, isTV]);

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

    // Video player controls
    const togglePlay = () => {
        if (!videoRef.current) return;
        if (isPlaying) {
            videoRef.current.pause();
        } else {
            videoRef.current.play();
        }
        setIsPlaying(!isPlaying);
    };

    const toggleMute = () => {
        if (!videoRef.current) return;
        videoRef.current.muted = !isMuted;
        setIsMuted(!isMuted);
    };

    const handleTimeUpdate = () => {
        if (!videoRef.current) return;
        setCurrentTime(videoRef.current.currentTime);
        setProgress((videoRef.current.currentTime / videoRef.current.duration) * 100);
    };

    const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!videoRef.current) return;
        const rect = e.currentTarget.getBoundingClientRect();
        const percent = (e.clientX - rect.left) / rect.width;
        videoRef.current.currentTime = percent * videoRef.current.duration;
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    // Generate season list for overlay
    const seasonCount = movie.number_of_seasons || 1;
    const seasons = Array.from({ length: seasonCount }, (_, i) => ({
        id: `${i + 1}`,
        label: `Season ${i + 1}`
    }));

    if (!isOpen) return null;

    const backdropUrl = movie.backdrop_path
        ? `https://image.tmdb.org/t/p/w1280${movie.backdrop_path}`
        : movie.poster_path
            ? `https://image.tmdb.org/t/p/w780${movie.poster_path}`
            : '/placeholder.jpg';

    return (
        <div className="info-modal">
            {/* Page Bar */}
            <div className="page-bar">
                <div className="page-bar-left">
                    <button onClick={onClose} className="page-bar-btn">
                        <ArrowLeft size={24} weight="bold" />
                    </button>
                </div>
                <div className="page-bar-right">
                    <button className="page-bar-btn" onClick={() => { /* Navigate to search */ }}>
                        <MagnifyingGlass size={24} />
                    </button>
                </div>
            </div>

            {/* Trailer Player */}
            <div className="info-modal-player">
                {trailerUrl ? (
                    <video
                        ref={videoRef}
                        src={trailerUrl}
                        poster={backdropUrl}
                        muted={isMuted}
                        playsInline
                        onTimeUpdate={handleTimeUpdate}
                        onLoadedMetadata={() => setDuration(videoRef.current?.duration || 0)}
                    />
                ) : (
                    // Fallback to backdrop image
                    <img src={backdropUrl} alt={title} className="w-full h-full object-cover" />
                )}

                {/* Player controls */}
                <div className="player-controls">
                    {/* Progress bar */}
                    <div className="player-progress" onClick={handleSeek}>
                        <div className="player-progress-fill" style={{ width: `${progress}%` }} />
                        <div className="player-progress-handle" style={{ left: `${progress}%` }} />
                    </div>

                    <div className="player-controls-row">
                        {/* Play/Pause */}
                        <button onClick={togglePlay} className="player-btn">
                            {isPlaying ? <Pause weight="fill" size={24} /> : <Play weight="fill" size={24} />}
                        </button>

                        {/* Timestamp */}
                        <span className="player-time">
                            {formatTime(currentTime)} / {formatTime(duration)}
                        </span>

                        {/* Mute (only show when paused) */}
                        {!isPlaying && trailerUrl && (
                            <button onClick={toggleMute} className="player-btn player-btn-mute">
                                {isMuted ? <SpeakerSlash size={16} /> : <SpeakerHigh size={16} />}
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="info-modal-content">
                {/* Title */}
                <h1 className="info-modal-title">{title}</h1>

                {/* Metadata */}
                <div className="info-modal-meta">
                    {year && <span>{year}</span>}
                    {rating && (
                        <span className="rating-badge">
                            {rating >= 8 ? '18+' : rating >= 7 ? '15' : '13'}
                        </span>
                    )}
                    <span className="hd-badge">HD</span>
                    {isTV && movie.number_of_seasons && (
                        <span>{movie.number_of_seasons} Seasons</span>
                    )}
                </div>

                {/* Buttons */}
                <div className="info-modal-buttons">
                    <button
                        onClick={() => onPlay(isTV ? selectedSeason : undefined, isTV ? 1 : undefined)}
                        className="btn-full btn-full-primary"
                    >
                        <Play weight="fill" size={20} />
                        Play
                    </button>
                    <button onClick={onToggleList} className="btn-full btn-full-secondary">
                        {isInList ? <Check weight="bold" size={20} /> : <Plus weight="bold" size={20} />}
                        My List
                    </button>
                </div>

                {/* Description */}
                <p className="info-modal-description">
                    {movie.overview || 'No description available.'}
                </p>

                {/* Starring */}
                {movie.credits?.cast && (
                    <p className="info-modal-starring">
                        <strong>Starring:</strong> {movie.credits.cast.slice(0, 3).map(c => c.name).join(', ')}
                    </p>
                )}

                {/* Tabs */}
                {isTV && (
                    <>
                        <div className="info-tabs">
                            <button
                                onClick={() => setActiveTab('episodes')}
                                className={`info-tab ${activeTab === 'episodes' ? 'active' : ''}`}
                            >
                                Episodes
                            </button>
                            <button
                                onClick={() => setActiveTab('similar')}
                                className={`info-tab ${activeTab === 'similar' ? 'active' : ''}`}
                            >
                                More Like This
                            </button>
                        </div>

                        {/* Episodes Tab */}
                        {activeTab === 'episodes' && (
                            <>
                                {/* Season toggle */}
                                <button
                                    onClick={() => setSeasonOverlayOpen(true)}
                                    className="season-toggle"
                                >
                                    Season {selectedSeason}
                                    <CaretDown size={16} />
                                </button>

                                {/* Episodes list */}
                                {loading ? (
                                    <div className="text-center py-8 text-gray-500">Loading...</div>
                                ) : episodes.length === 0 ? (
                                    <div className="text-center py-8 text-gray-500">No episodes found</div>
                                ) : (
                                    <div className="pb-20">
                                        {episodes.map((ep) => (
                                            <div
                                                key={ep.id}
                                                className="episode-item"
                                                onClick={() => onPlay(selectedSeason, ep.episode_number)}
                                            >
                                                {/* Thumbnail */}
                                                <div className="episode-thumb">
                                                    <img
                                                        src={ep.still_path
                                                            ? `https://image.tmdb.org/t/p/w300${ep.still_path}`
                                                            : backdropUrl}
                                                        alt={ep.name}
                                                    />
                                                    <div className="episode-play-icon">
                                                        <Play weight="fill" size={12} />
                                                    </div>
                                                </div>

                                                {/* Content */}
                                                <div className="episode-content">
                                                    <div className="episode-header">
                                                        <div>
                                                            <div className="episode-title">
                                                                {ep.episode_number}. {ep.name}
                                                            </div>
                                                            <div className="episode-duration">
                                                                {ep.runtime || 45}m
                                                            </div>
                                                        </div>
                                                        <button className="episode-watched">
                                                            <Check size={20} />
                                                        </button>
                                                    </div>
                                                    <p className="episode-description">
                                                        {ep.overview || 'No description.'}
                                                    </p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </>
                        )}

                        {/* More Like This Tab */}
                        {activeTab === 'similar' && (
                            <div className="similar-grid">
                                {/* TODO: Add similar content from TMDB recommendations */}
                                <div className="text-center py-8 text-gray-500 col-span-3">
                                    Similar content coming soon
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Season Overlay */}
            <CategoryOverlay
                isOpen={seasonOverlayOpen}
                onClose={() => setSeasonOverlayOpen(false)}
                categories={seasons}
                activeCategory={`${selectedSeason}`}
                onCategorySelect={(id) => setSelectedSeason(parseInt(id))}
            />
        </div>
    );
}
