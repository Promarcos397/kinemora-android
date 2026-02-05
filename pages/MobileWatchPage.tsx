import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { getMovieDetails, getSeasonDetails } from '../services/api';
import {
    ArrowLeft, Play, Pause, SpeakerHigh, SpeakerSlash,
    ArrowCounterClockwise, ArrowClockwise, X, Flag, DownloadSimple,
    Scissors, Clock, MonitorPlay, Subtitles, SkipForward, Sun, Check
} from '@phosphor-icons/react';

interface Episode {
    id: number;
    name: string;
    episode_number: number;
    still_path: string | null;
    runtime: number;
    overview: string;
}

const SPEED_OPTIONS = [0.5, 0.75, 1, 1.25, 1.5, 2];

/**
 * Mobile Watch Page - Netflix-style video player
 * Full controls: brightness, seek, chapters, speed, episodes, subtitles
 */
export default function MobileWatchPage() {
    const { type, id } = useParams();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const videoRef = useRef<HTMLVideoElement>(null);

    // Video state
    const [isPlaying, setIsPlaying] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [progress, setProgress] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [showControls, setShowControls] = useState(true);
    const [brightness, setBrightness] = useState(100);
    const [playbackSpeed, setPlaybackSpeed] = useState(1);

    // Content state
    const [title, setTitle] = useState('');
    const [episodeTitle, setEpisodeTitle] = useState('');
    const [videoUrl, setVideoUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    // Overlays state
    const [showSpeedMenu, setShowSpeedMenu] = useState(false);
    const [showEpisodesPanel, setShowEpisodesPanel] = useState(false);
    const [showSubtitlesPanel, setShowSubtitlesPanel] = useState(false);
    const [episodes, setEpisodes] = useState<Episode[]>([]);
    const [currentSeason, setCurrentSeason] = useState(1);
    const [currentEpisode, setCurrentEpisode] = useState(1);
    const [numberOfSeasons, setNumberOfSeasons] = useState(1);

    const season = searchParams.get('season');
    const episode = searchParams.get('episode');

    // Fetch content details
    useEffect(() => {
        const fetchDetails = async () => {
            setLoading(true);
            try {
                if (type === 'tv' && id) {
                    const details = await getMovieDetails(Number(id), 'tv');
                    setTitle(details?.name || 'Unknown Show');
                    setNumberOfSeasons(details?.number_of_seasons || 1);

                    const seasonNum = parseInt(season || '1');
                    const episodeNum = parseInt(episode || '1');
                    setCurrentSeason(seasonNum);
                    setCurrentEpisode(episodeNum);
                    setEpisodeTitle(`S${seasonNum}:E${episodeNum}`);

                    // Fetch episode list
                    const seasonData = await getSeasonDetails(Number(id), seasonNum);
                    setEpisodes(seasonData?.episodes || []);
                } else if (type === 'movie' && id) {
                    const details = await getMovieDetails(Number(id), 'movie');
                    setTitle(details?.title || 'Unknown Movie');
                }

                // TODO: Replace with Consumet API for actual streaming
                // For now using a sample video for testing
                setVideoUrl(null);
            } catch (err) {
                console.error('Error loading content:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchDetails();
    }, [type, id, season, episode]);

    // Auto-hide controls
    useEffect(() => {
        if (!isPlaying || showSpeedMenu || showEpisodesPanel || showSubtitlesPanel) return;
        const timer = setTimeout(() => setShowControls(false), 3000);
        return () => clearTimeout(timer);
    }, [isPlaying, showControls, showSpeedMenu, showEpisodesPanel, showSubtitlesPanel]);

    // Video controls
    const togglePlay = () => {
        if (!videoRef.current) {
            setIsPlaying(!isPlaying);
            return;
        }
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

    const seekRelative = (seconds: number) => {
        if (!videoRef.current) return;
        videoRef.current.currentTime += seconds;
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

    const handleSpeedChange = (speed: number) => {
        setPlaybackSpeed(speed);
        if (videoRef.current) {
            videoRef.current.playbackRate = speed;
        }
        setShowSpeedMenu(false);
    };

    const handleEpisodeSelect = (episodeNum: number) => {
        navigate(`/watch/tv/${id}?season=${currentSeason}&episode=${episodeNum}`, { replace: true });
        setShowEpisodesPanel(false);
    };

    const handleNextEpisode = () => {
        const nextEp = currentEpisode + 1;
        if (episodes.length > 0 && nextEp <= episodes.length) {
            handleEpisodeSelect(nextEp);
        }
    };

    const formatTime = (seconds: number) => {
        const hrs = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        const secs = Math.floor(seconds % 60);
        if (hrs > 0) {
            return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        }
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const handleBack = () => navigate(-1);

    const closeAllOverlays = () => {
        setShowSpeedMenu(false);
        setShowEpisodesPanel(false);
        setShowSubtitlesPanel(false);
    };

    if (loading) {
        return (
            <div className="fixed inset-0 bg-black flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div
            className="fixed inset-0 bg-black text-white"
            onClick={() => {
                if (showSpeedMenu || showEpisodesPanel || showSubtitlesPanel) {
                    closeAllOverlays();
                } else {
                    setShowControls(!showControls);
                }
            }}
            style={{ filter: `brightness(${brightness}%)` }}
        >
            {/* Video element */}
            {videoUrl ? (
                <video
                    ref={videoRef}
                    src={videoUrl}
                    className="w-full h-full object-contain"
                    muted={isMuted}
                    playsInline
                    onTimeUpdate={handleTimeUpdate}
                    onLoadedMetadata={() => setDuration(videoRef.current?.duration || 0)}
                />
            ) : (
                <div className="w-full h-full flex items-center justify-center bg-black">
                    <div className="text-center">
                        <p className="text-gray-500 mb-4">Video source unavailable</p>
                        <p className="text-gray-600 text-sm">Consumet API integration needed</p>
                    </div>
                </div>
            )}

            {/* Controls overlay */}
            {showControls && (
                <div
                    className="absolute inset-0 bg-black/40 flex flex-col"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Top bar */}
                    <div className="flex items-center justify-between p-4">
                        <button onClick={handleBack} className="p-2">
                            <ArrowLeft size={24} weight="bold" />
                        </button>
                        <div className="flex-1 text-center">
                            <span className="text-sm font-medium">
                                {episodeTitle ? `${title} ${episodeTitle}` : title}
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <button onClick={toggleMute} className="p-2">
                                {isMuted ? <SpeakerSlash size={20} /> : <SpeakerHigh size={20} />}
                            </button>
                        </div>
                    </div>

                    {/* Brightness slider (left edge) */}
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 flex flex-col items-center gap-2">
                        <Sun size={20} className="text-white/60" />
                        <input
                            type="range"
                            min="20"
                            max="100"
                            value={brightness}
                            onChange={(e) => setBrightness(Number(e.target.value))}
                            className="w-24 h-1 -rotate-90 origin-center accent-white cursor-pointer"
                            style={{ marginTop: '48px', marginBottom: '48px' }}
                        />
                    </div>

                    {/* Center controls */}
                    <div className="flex-1 flex items-center justify-center gap-12">
                        <button onClick={() => seekRelative(-10)} className="p-3">
                            <div className="relative">
                                <ArrowCounterClockwise size={40} />
                                <span className="absolute inset-0 flex items-center justify-center text-xs font-bold">10</span>
                            </div>
                        </button>
                        <button onClick={togglePlay} className="p-3">
                            {isPlaying ? (
                                <Pause weight="fill" size={56} />
                            ) : (
                                <Play weight="fill" size={56} />
                            )}
                        </button>
                        <button onClick={() => seekRelative(10)} className="p-3">
                            <div className="relative">
                                <ArrowClockwise size={40} />
                                <span className="absolute inset-0 flex items-center justify-center text-xs font-bold">10</span>
                            </div>
                        </button>
                    </div>

                    {/* Bottom controls */}
                    <div className="p-4 space-y-3">
                        {/* Progress bar */}
                        <div
                            className="relative h-1 bg-white/30 rounded cursor-pointer"
                            onClick={handleSeek}
                        >
                            {/* Chapter markers (orange ticks) */}
                            {[0.1, 0.25, 0.5, 0.75, 0.9].map((pos, i) => (
                                <div
                                    key={i}
                                    className="absolute top-0 bottom-0 w-0.5 bg-orange-500"
                                    style={{ left: `${pos * 100}%` }}
                                />
                            ))}
                            {/* Progress fill */}
                            <div
                                className="absolute left-0 top-0 bottom-0 bg-red-600 rounded"
                                style={{ width: `${progress}%` }}
                            />
                            {/* Scrubber dot */}
                            <div
                                className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-red-600 rounded-full shadow-lg"
                                style={{ left: `calc(${progress}% - 8px)` }}
                            />
                        </div>

                        {/* Time display */}
                        <div className="flex justify-between text-sm text-white/80">
                            <span>{formatTime(currentTime)}</span>
                            <span>-{formatTime(duration - currentTime)}</span>
                        </div>

                        {/* Control buttons row */}
                        <div className="flex items-center justify-around pt-2">
                            <button className="flex flex-col items-center gap-1 text-white/80">
                                <Scissors size={20} />
                                <span className="text-xs">Clip</span>
                            </button>
                            <button
                                onClick={() => setShowSpeedMenu(true)}
                                className="flex flex-col items-center gap-1 text-white/80"
                            >
                                <Clock size={20} />
                                <span className="text-xs">Speed ({playbackSpeed}x)</span>
                            </button>
                            {type === 'tv' && (
                                <button
                                    onClick={() => setShowEpisodesPanel(true)}
                                    className="flex flex-col items-center gap-1 text-white/80"
                                >
                                    <MonitorPlay size={20} />
                                    <span className="text-xs">Episodes</span>
                                </button>
                            )}
                            <button
                                onClick={() => setShowSubtitlesPanel(true)}
                                className="flex flex-col items-center gap-1 text-white/80"
                            >
                                <Subtitles size={20} />
                                <span className="text-xs">Audio</span>
                            </button>
                            {type === 'tv' && (
                                <button
                                    onClick={handleNextEpisode}
                                    className="flex flex-col items-center gap-1 text-white/80"
                                >
                                    <SkipForward size={20} />
                                    <span className="text-xs">Next Ep.</span>
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Speed Menu Overlay */}
            {showSpeedMenu && (
                <div
                    className="absolute inset-0 bg-black/80 flex items-center justify-center z-50"
                    onClick={() => setShowSpeedMenu(false)}
                >
                    <div
                        className="bg-[#1a1a1a] rounded-lg py-2 min-w-[150px]"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="px-4 py-2 text-sm font-semibold border-b border-white/10">
                            Playback Speed
                        </div>
                        {SPEED_OPTIONS.map((speed) => (
                            <button
                                key={speed}
                                onClick={() => handleSpeedChange(speed)}
                                className={`w-full px-4 py-3 text-left flex items-center justify-between ${playbackSpeed === speed ? 'text-white' : 'text-gray-400'
                                    }`}
                            >
                                <span>{speed}x{speed === 1 ? ' (Normal)' : ''}</span>
                                {playbackSpeed === speed && <Check size={18} className="text-red-600" />}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Episodes Panel */}
            {showEpisodesPanel && (
                <div
                    className="absolute inset-0 bg-black/90 z-50"
                    onClick={() => setShowEpisodesPanel(false)}
                >
                    <div
                        className="absolute right-0 top-0 bottom-0 w-80 bg-[#141414] overflow-y-auto"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="sticky top-0 bg-[#141414] px-4 py-4 border-b border-white/10 flex items-center justify-between">
                            <h3 className="font-semibold">Season {currentSeason}</h3>
                            <button onClick={() => setShowEpisodesPanel(false)}>
                                <X size={20} />
                            </button>
                        </div>
                        <div className="space-y-3 p-4">
                            {episodes.map((ep) => (
                                <div
                                    key={ep.id}
                                    onClick={() => handleEpisodeSelect(ep.episode_number)}
                                    className={`cursor-pointer rounded-lg overflow-hidden ${currentEpisode === ep.episode_number ? 'ring-2 ring-red-600' : ''
                                        }`}
                                >
                                    <div className="relative aspect-video bg-gray-800">
                                        {ep.still_path ? (
                                            <img
                                                src={`https://image.tmdb.org/t/p/w300${ep.still_path}`}
                                                alt={ep.name}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : null}
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <div className="w-8 h-8 bg-black/60 rounded-full flex items-center justify-center">
                                                <Play weight="fill" size={14} className="ml-0.5" />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="p-2 bg-[#2a2a2a]">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm font-medium">{ep.episode_number}. {ep.name}</span>
                                            {ep.runtime && <span className="text-xs text-gray-500">{ep.runtime}m</span>}
                                        </div>
                                        <p className="text-xs text-gray-500 mt-1 line-clamp-2">{ep.overview}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Audio & Subtitles Panel */}
            {showSubtitlesPanel && (
                <div
                    className="absolute inset-0 bg-black/90 z-50"
                    onClick={() => setShowSubtitlesPanel(false)}
                >
                    <div
                        className="absolute right-0 top-0 bottom-0 w-80 bg-[#141414] overflow-y-auto"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="sticky top-0 bg-[#141414] px-4 py-4 border-b border-white/10 flex items-center justify-between">
                            <h3 className="font-semibold">Audio & Subtitles</h3>
                            <button onClick={() => setShowSubtitlesPanel(false)}>
                                <X size={20} />
                            </button>
                        </div>
                        <div className="p-4 space-y-4">
                            <div>
                                <h4 className="text-sm font-medium text-gray-400 mb-2">Audio</h4>
                                <button className="w-full py-2 px-3 bg-[#2a2a2a] rounded flex items-center justify-between">
                                    <span>English</span>
                                    <Check size={18} className="text-red-600" />
                                </button>
                            </div>
                            <div>
                                <h4 className="text-sm font-medium text-gray-400 mb-2">Subtitles</h4>
                                <div className="space-y-1">
                                    <button className="w-full py-2 px-3 bg-[#2a2a2a] rounded flex items-center justify-between">
                                        <span>Off</span>
                                    </button>
                                    <button className="w-full py-2 px-3 bg-[#2a2a2a] rounded flex items-center justify-between">
                                        <span>English</span>
                                        <Check size={18} className="text-red-600" />
                                    </button>
                                    <button className="w-full py-2 px-3 bg-[#2a2a2a] rounded flex items-center justify-between">
                                        <span>Spanish</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
