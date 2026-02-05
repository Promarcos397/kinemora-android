import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { getMovieDetails, getSeasonDetails } from '../services/api';
import {
    ArrowLeft, Play, Pause, SpeakerHigh, SpeakerSlash,
    ArrowCounterClockwise, ArrowClockwise, X, Flag, DownloadSimple,
    Scissors, Clock, MonitorPlay, Subtitles, SkipForward, Sun
} from '@phosphor-icons/react';

/**
 * Mobile Watch Page - Netflix-style video player
 * Landscape layout with full controls
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

    // Content state
    const [title, setTitle] = useState('');
    const [episodeTitle, setEpisodeTitle] = useState('');
    const [videoUrl, setVideoUrl] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

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
                    if (season && episode) {
                        setEpisodeTitle(`S${season}:E${episode} "Episode ${episode}"`);
                    }
                } else if (type === 'movie' && id) {
                    const details = await getMovieDetails(Number(id), 'movie');
                    setTitle(details?.title || 'Unknown Movie');
                }

                // TODO: Get actual video URL from streaming service
                // For now, we'll show the player UI without video
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
        if (!isPlaying) return;

        const timer = setTimeout(() => setShowControls(false), 3000);
        return () => clearTimeout(timer);
    }, [isPlaying, showControls]);

    // Video controls
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
            onClick={() => setShowControls(!showControls)}
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
                    <p className="text-gray-500">Video source unavailable</p>
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
                                {episodeTitle || title}
                            </span>
                        </div>
                        <div className="flex items-center gap-2">
                            <button className="p-2"><Flag size={20} /></button>
                            <button className="p-2"><DownloadSimple size={20} /></button>
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
                            className="w-24 h-1 -rotate-90 origin-center bg-white/30 rounded"
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
                    <div className="p-4 space-y-4">
                        {/* Progress bar */}
                        <div
                            className="relative h-1 bg-white/30 rounded cursor-pointer"
                            onClick={handleSeek}
                        >
                            {/* Buffer indicators (orange ticks) */}
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
                                className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-red-600 rounded-full"
                                style={{ left: `${progress}%`, marginLeft: '-8px' }}
                            />
                        </div>

                        {/* Time display */}
                        <div className="flex justify-end">
                            <span className="text-sm text-white/80">{formatTime(duration - currentTime)}</span>
                        </div>

                        {/* Control buttons row */}
                        <div className="flex items-center justify-around">
                            <button className="flex flex-col items-center gap-1 text-white/80">
                                <Scissors size={20} />
                                <span className="text-xs">Clip</span>
                            </button>
                            <button className="flex flex-col items-center gap-1 text-white/80">
                                <Clock size={20} />
                                <span className="text-xs">Speed (1x)</span>
                            </button>
                            <button className="flex flex-col items-center gap-1 text-white/80">
                                <MonitorPlay size={20} />
                                <span className="text-xs">Episodes</span>
                            </button>
                            <button className="flex flex-col items-center gap-1 text-white/80">
                                <Subtitles size={20} />
                                <span className="text-xs">Audio & Subtitles</span>
                            </button>
                            <button className="flex flex-col items-center gap-1 text-white/80">
                                <SkipForward size={20} />
                                <span className="text-xs">Next Ep.</span>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
