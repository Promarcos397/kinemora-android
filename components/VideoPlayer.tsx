import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Movie, Episode } from '../types';
import { getSeasonDetails, getMovieDetails } from '../services/api';
import Hls from 'hls.js';

import { useGlobalContext } from '../context/GlobalContext';
import { useTitle } from '../context/TitleContext';
import { parseSubtitles, captionIsVisible, sanitize, CaptionCueType, makeQueId } from '../utils/captions';
import { streamCache } from '../utils/streamCache';
import { useTouchGestures } from '../hooks/useTouchGestures';

// Child Components
import VideoPlayerControls from './VideoPlayerControls';
import VideoPlayerSettings from './VideoPlayerSettings';
import { ArrowLeftIcon } from '@phosphor-icons/react';

interface VideoPlayerProps {
    movie: Movie;
    season?: number;
    episode?: number;
    onClose: () => void;
}

// Caption Rendering Component
const CaptionCue: React.FC<{ cue: CaptionCueType }> = ({ cue }) => {
    const { settings } = useGlobalContext();

    const parsedHtml = useMemo(() => {
        let textToUse = cue.content;
        const textWithNewlines = (textToUse || "")
            .replaceAll(/ i'/g, " I'")
            .replaceAll(/\r?\n/g, "<br />");

        return sanitize(textWithNewlines, {
            ALLOWED_TAGS: ["c", "b", "i", "u", "span", "ruby", "rt", "br"],
            ADD_TAGS: ["v", "lang"],
            ALLOWED_ATTR: ["title", "lang"],
        });
    }, [cue.content]);

    const getTextEffectStyles = () => {
        switch (settings.subtitleEdgeStyle) {
            case "raised":
                return { textShadow: "0 2px 0 rgba(0,0,0,0.8), 0 1.5px 1.5px rgba(0,0,0,0.9)" };
            case "depressed":
                return { textShadow: "0 -2px 0 rgba(0,0,0,0.8), 0 -1.5px 1.5px rgba(0,0,0,0.9)" };
            case "uniform":
                const thickness = 2;
                return {
                    textShadow: `
                        ${thickness}px 0 0 rgba(0,0,0,0.9),
                        -${thickness}px 0 0 rgba(0,0,0,0.9),
                        0 ${thickness}px 0 rgba(0,0,0,0.9),
                        0 -${thickness}px 0 rgba(0,0,0,0.9),
                        ${thickness}px ${thickness}px 0 rgba(0,0,0,0.9),
                        -${thickness}px -${thickness}px 0 rgba(0,0,0,0.9),
                        ${thickness}px -${thickness}px 0 rgba(0,0,0,0.9),
                        -${thickness}px ${thickness}px 0 rgba(0,0,0,0.9)
                    `
                };
            case "drop-shadow":
            default:
                return { textShadow: "2px 2px 4px rgba(0, 0, 0, 0.8)" };
        }
    };

    const windowBg = settings.subtitleBackground !== 'none'
        ? { backgroundColor: settings.subtitleWindowColor || 'rgba(8, 8, 8, 0.75)' }
        : {};

    // Map subtitle size setting to pixel values
    const sizeMap: Record<string, number> = {
        tiny: 16,
        small: 20,
        medium: 26,
        large: 32,
        huge: 40
    };
    const fontSize = sizeMap[settings.subtitleSize] || sizeMap.small;

    return (
        <span
            className="caption-text inline-block px-4 py-1 text-center leading-snug"
            style={{
                color: settings.subtitleColor || '#FFFFFF',
                fontSize: `${fontSize}px`,
                fontFamily: settings.subtitleFontFamily || 'inherit',
                ...getTextEffectStyles(),
                ...windowBg,
            }}
            dangerouslySetInnerHTML={{ __html: parsedHtml }}
        />
    );
};

// Get Consumet API
const getConsumetAPI = () => (window as any).electron?.consumet;

const VideoPlayer: React.FC<VideoPlayerProps> = ({ movie, season = 1, episode = 1, onClose }) => {
    const { settings, updateEpisodeProgress, getEpisodeProgress, updateVideoState, addToHistory, getVideoState } = useGlobalContext();
    const { setPageTitle } = useTitle();
    const videoRef = useRef<HTMLVideoElement>(null);
    const hlsRef = useRef<Hls | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const inactivityTimerRef = useRef<NodeJS.Timeout | null>(null);

    // Player State
    const [isPlaying, setIsPlaying] = useState(false);
    const [isBuffering, setIsBuffering] = useState(true);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [progress, setProgress] = useState(0);
    const [volume, setVolume] = useState(1);
    const [isMuted, setIsMuted] = useState(false);
    const [showUI, setShowUI] = useState(true);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('Finding stream...');
    const [streamUrl, setStreamUrl] = useState<string | null>(null);
    const [streamReferer, setStreamReferer] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    // TV Show state - PLAYBACK state
    const mediaType = movie.media_type || (movie.first_air_date ? 'tv' : 'movie');
    const [currentEpisode, setCurrentEpisode] = useState(episode);
    const [playingSeasonNumber, setPlayingSeasonNumber] = useState(season);
    const [seasonList, setSeasonList] = useState<number[]>([]);
    const [currentSeasonEpisodes, setCurrentSeasonEpisodes] = useState<Episode[]>([]);

    // TV Show state - EXPLORATION state (for browsing without triggering playback)
    const [exploredSeasonNumber, setExploredSeasonNumber] = useState(season);
    const [exploredSeasonEpisodes, setExploredSeasonEpisodes] = useState<Episode[]>([]);

    // Settings Panel - use correct panel types
    const [activePanel, setActivePanel] = useState<'none' | 'episodes' | 'seasons' | 'audioSubtitles' | 'quality'>('none');
    const [isPanelHovered, setIsPanelHovered] = useState(false);

    // Subtitles
    const [captions, setCaptions] = useState<{ id: string; label: string; url: string; lang: string }[]>([]);
    const [currentCaption, setCurrentCaption] = useState<string | null>(null);
    const [parsedCaptions, setParsedCaptions] = useState<CaptionCueType[]>([]);
    const [activeCues, setActiveCues] = useState<CaptionCueType[]>([]);

    // Quality levels from HLS
    const [qualityLevels, setQualityLevels] = useState<{ height: number; bitrate: number; level: number }[]>([]);
    const [currentQualityLevel, setCurrentQualityLevel] = useState<number>(-1); // -1 = auto

    // Mobile touch gesture state
    const [skipIndicator, setSkipIndicator] = useState<{ direction: 'left' | 'right' | null; visible: boolean }>({
        direction: null,
        visible: false
    });

    // Touch gesture handlers
    const showSkipIndicator = useCallback((direction: 'left' | 'right') => {
        setSkipIndicator({ direction, visible: true });
        setTimeout(() => setSkipIndicator({ direction: null, visible: false }), 500);
    }, []);

    const handleSkipBack = useCallback(() => {
        const video = videoRef.current;
        if (video) {
            video.currentTime = Math.max(0, video.currentTime - 10);
            showSkipIndicator('left');
        }
    }, [showSkipIndicator]);

    const handleSkipForward = useCallback(() => {
        const video = videoRef.current;
        if (video) {
            video.currentTime = Math.min(video.duration, video.currentTime + 10);
            showSkipIndicator('right');
        }
    }, [showSkipIndicator]);

    // Wire up touch gestures
    useTouchGestures(containerRef as React.RefObject<HTMLElement>, {
        onDoubleTapLeft: handleSkipBack,
        onDoubleTapRight: handleSkipForward,
        onDoubleTapCenter: () => {
            const video = videoRef.current;
            if (video) {
                video.paused ? video.play() : video.pause();
            }
        },
        onSingleTap: () => setShowUI(prev => !prev),
        onSwipeLeft: (distance) => {
            const video = videoRef.current;
            if (video) {
                const seekAmount = Math.min(30, distance / 10);
                video.currentTime = Math.max(0, video.currentTime - seekAmount);
            }
        },
        onSwipeRight: (distance) => {
            const video = videoRef.current;
            if (video) {
                const seekAmount = Math.min(30, distance / 10);
                video.currentTime = Math.min(video.duration, video.currentTime + seekAmount);
            }
        }
    });

    // Find active episode data
    const activeEpisodeData = useMemo(() => {
        if (mediaType !== 'tv' || !currentSeasonEpisodes.length) return null;
        return currentSeasonEpisodes.find(ep => ep.episode_number === currentEpisode);
    }, [mediaType, currentSeasonEpisodes, currentEpisode]);

    // --- Fetch Stream using Puppeteer ---
    // Definitions for title and release date
    const title = movie.title || movie.name || '';
    const formattedDate = movie.release_date || movie.first_air_date || '';

    // --- Fetch Stream using Consumet API with Smart Caching ---
    useEffect(() => {
        const fetchStream = async () => {
            const api = getConsumetAPI();
            if (!api) {
                setError('Consumet API not available. Are you running in Electron?');
                setIsBuffering(false);
                return;
            }

            setIsBuffering(true);
            setError(null);
            setLoadingMessage('Searching for stream...');

            // Get release year from air date
            const releaseYear = formattedDate ? parseInt(formattedDate.split('-')[0]) : undefined;

            // Build cache key
            const cacheKey = {
                title,
                type: (mediaType === 'tv' ? 'tv' : 'movie') as 'tv' | 'movie',
                year: releaseYear,
                season: playingSeasonNumber,
                episode: currentEpisode
            };

            // Check cache first
            const cached = streamCache.get(cacheKey);
            if (cached) {
                console.log(`[VideoPlayer] ⚡ Using cached stream for S${playingSeasonNumber}E${currentEpisode}`);
                applyStreamResult(cached.sources, cached.subtitles);
                return;
            }

            console.log(`[VideoPlayer] Fetching stream for ${mediaType}/${title} (${releaseYear})`);

            try {
                const result = await api.getStream(
                    title,
                    mediaType === 'tv' ? 'tv' : 'movie',
                    releaseYear,
                    playingSeasonNumber,
                    currentEpisode
                );

                if (result.success && result.sources && result.sources.length > 0) {
                    console.log(`[VideoPlayer] Stream found from ${result.provider}:`, result.sources);

                    // Cache for future use
                    streamCache.set(cacheKey, {
                        sources: result.sources,
                        subtitles: result.subtitles || [],
                        provider: result.provider || 'unknown'
                    });

                    applyStreamResult(result.sources, result.subtitles || []);

                    // Prefetch next episodes in background (TV only)
                    if (mediaType === 'tv' && currentSeasonEpisodes.length > 0) {
                        streamCache.prefetchNextEpisodes(
                            api,
                            title,
                            releaseYear,
                            playingSeasonNumber,
                            currentEpisode,
                            currentSeasonEpisodes.length
                        );
                    }
                } else {
                    console.error('[VideoPlayer] No stream found:', result.error);
                    setError(result.error || 'No stream found. Try another server?');
                    setIsBuffering(false);
                }
            } catch (err: any) {
                console.error('[VideoPlayer] Stream fetch error:', err);
                setError(err.message || 'Failed to fetch stream');
                setIsBuffering(false);
            }
        };

        // Helper to apply stream result (used by both cached and fresh fetches)
        const applyStreamResult = (sources: any[], subtitles: any[]) => {
            // Find HLS source (m3u8) or fallback to first
            const hlsSource = sources.find((s: any) => s.isM3U8) || sources[0];
            console.log('[VideoPlayer] Selected source:', hlsSource.url);

            setStreamUrl(hlsSource.url);
            setStreamReferer(null);
            setLoadingMessage('Loading video...');

            // Handle subtitles if present
            if (subtitles && subtitles.length > 0) {
                console.log('[VideoPlayer] Subtitles found:', subtitles.length);
                const mappedCaptions = subtitles.map((sub: any, index: number) => ({
                    id: `sub-${index}`,
                    label: sub.lang || `Subtitle ${index + 1}`,
                    url: sub.url,
                    lang: (sub.lang || 'en').toLowerCase()
                }));
                setCaptions(mappedCaptions);

                // Auto-select subtitle based on user's preferred language
                const preferredLang = settings.subtitleLanguage?.toLowerCase() || 'en';
                const matchingSub = mappedCaptions.find((s: any) =>
                    s.lang.toLowerCase().includes(preferredLang) ||
                    s.label.toLowerCase().includes(preferredLang)
                );
                if (matchingSub && settings.showSubtitles) {
                    console.log('[VideoPlayer] Auto-selected subtitle:', matchingSub.label);
                    setCurrentCaption(matchingSub.url);
                }
            }
        };

        fetchStream();

        // Cleanup on unmount
        return () => {
            if (hlsRef.current) {
                hlsRef.current.destroy();
                hlsRef.current = null;
            }
        };
    }, [movie.id, mediaType, playingSeasonNumber, currentEpisode]);

    // --- Subtitle Loading Effect ---
    useEffect(() => {
        if (!currentCaption) {
            setParsedCaptions([]);
            return;
        }

        const loadSubtitles = async () => {
            try {
                console.log('[VideoPlayer] Loading subtitle:', currentCaption);

                // Use main process proxy to bypass CORS
                const electron = (window as any).electron;
                let text = '';

                if (electron?.fetchSubtitle) {
                    const result = await electron.fetchSubtitle(currentCaption);
                    if (result.success) {
                        text = result.text;
                    } else {
                        console.error('[VideoPlayer] Subtitle proxy error:', result.error);
                        return;
                    }
                } else {
                    // Fallback to direct fetch (may fail due to CORS)
                    const response = await fetch(currentCaption);
                    text = await response.text();
                }

                if (text) {
                    const cues = parseSubtitles(text);
                    console.log(`[VideoPlayer] Parsed ${cues.length} cues`);
                    setParsedCaptions(cues);
                }
            } catch (err) {
                console.error('[VideoPlayer] Failed to load subtitles:', err);
                setParsedCaptions([]);
            }
        };

        loadSubtitles();
    }, [currentCaption]);

    // --- Initialize HLS.js when stream URL is available ---
    useEffect(() => {
        if (!streamUrl || !videoRef.current) return;

        const video = videoRef.current;

        // Destroy previous HLS instance
        if (hlsRef.current) {
            hlsRef.current.destroy();
            hlsRef.current = null;
        }

        // Check if HLS is supported
        if (Hls.isSupported()) {
            const hls = new Hls({
                xhrSetup: (xhr, url) => {
                    // Set referer header if available
                    if (streamReferer) {
                        xhr.setRequestHeader('Referer', streamReferer);
                    }
                }
            });

            hlsRef.current = hls;

            hls.loadSource(streamUrl);
            hls.attachMedia(video);

            hls.on(Hls.Events.MANIFEST_PARSED, () => {
                console.log('[VideoPlayer] HLS manifest parsed, starting playback');
                setIsBuffering(false);

                // Extract quality levels from HLS
                if (hls.levels && hls.levels.length > 0) {
                    const levels = hls.levels.map((level, index) => ({
                        height: level.height || 0,
                        bitrate: level.bitrate || 0,
                        level: index
                    })).sort((a, b) => b.height - a.height);
                    setQualityLevels(levels);
                    console.log('[VideoPlayer] Quality levels:', levels.map(l => `${l.height}p`));
                }

                // Resume from saved position
                if (mediaType === 'tv') {
                    const saved = getEpisodeProgress(movie.id, playingSeasonNumber, currentEpisode);
                    if (saved && saved.time > 10 && saved.time < (saved.duration - 30)) {
                        console.log('[VideoPlayer] Resuming TV from', saved.time);
                        video.currentTime = saved.time;
                    }
                } else {
                    const saved = getVideoState(movie.id);
                    if (saved && saved.time > 10) {
                        console.log('[VideoPlayer] Resuming Movie from', saved.time);
                        video.currentTime = saved.time;
                    }
                }

                video.play().catch(err => {
                    console.warn('[VideoPlayer] Autoplay blocked:', err);
                });
            });

            hls.on(Hls.Events.ERROR, (event, data) => {
                if (data.fatal) {
                    console.error('[VideoPlayer] HLS fatal error:', data);
                    setError(`Playback error: ${data.type}`);
                    hls.destroy();
                }
            });

        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
            // Native HLS support (Safari)
            video.src = streamUrl;
            video.addEventListener('loadedmetadata', () => {
                setIsBuffering(false);
                video.play();
            });
        } else {
            setError('HLS playback not supported in this browser');
        }

        return () => {
            if (hlsRef.current) {
                hlsRef.current.destroy();
                hlsRef.current = null;
            }
        };
    }, [streamUrl, streamReferer]);

    // --- Fetch TV Show Details ---
    useEffect(() => {
        const initialize = async () => {
            if (mediaType === 'tv') {
                try {
                    const details = await getMovieDetails(String(movie.id), 'tv');
                    if (details.seasons) {
                        const filteredSeasons = details.seasons.filter(
                            (s: any) => s.season_number > 0 && s.episode_count > 0
                        );
                        setSeasonList(filteredSeasons.map((s: any) => s.season_number));
                    }
                    const seasonData = await getSeasonDetails(String(movie.id), season);
                    if (seasonData?.episodes) {
                        setCurrentSeasonEpisodes(seasonData.episodes);
                    }
                } catch (error) {
                    console.error('[VideoPlayer] Error fetching TV details:', error);
                }
            }
        };
        initialize();
    }, [movie.id, mediaType, season]);

    // --- Video Event Handlers ---
    const lastSaveRef = useRef<number>(0);
    const handleTimeUpdate = useCallback(() => {
        const video = videoRef.current;
        if (!video) return;

        setCurrentTime(video.currentTime);
        setDuration(video.duration || 0);
        setProgress(video.duration > 0 ? (video.currentTime / video.duration) * 100 : 0);

        // Save progress & history every 5 seconds
        if (video.duration > 0) {
            const now = Date.now();
            if (now - lastSaveRef.current > 5000) {
                lastSaveRef.current = now;

                // Add to Continue Watching
                addToHistory(movie);

                if (mediaType === 'tv') {
                    updateEpisodeProgress(movie.id, playingSeasonNumber, currentEpisode, video.currentTime, video.duration);
                    // Also save for InfoModal resume compatibility
                    localStorage.setItem(`kinemora-last-watched-${movie.id}`, JSON.stringify({
                        season: playingSeasonNumber,
                        episode: currentEpisode
                    }));
                } else {
                    // Save Movie progress
                    updateVideoState(movie.id, video.currentTime, undefined, video.duration);
                }
            }
        }

        // Update active captions
        // Note: cue.start/end are in ms, captionIsVisible converts them to seconds
        // video.currentTime is already in seconds
        const active = parsedCaptions.filter(cue =>
            captionIsVisible(cue.start, cue.end, 0, video.currentTime)
        );
        setActiveCues(active);
    }, [parsedCaptions, mediaType, movie.id, playingSeasonNumber, currentEpisode, updateEpisodeProgress]);

    const togglePlay = useCallback(() => {
        const video = videoRef.current;
        if (!video) return;

        if (video.paused) {
            video.play();
            setIsPlaying(true);
        } else {
            video.pause();
            setIsPlaying(false);
        }
    }, []);

    const handleSeek = useCallback((time: number) => {
        const video = videoRef.current;
        if (video) {
            video.currentTime = time;
        }
    }, []);

    const handleVolumeChange = useCallback((newVolume: number) => {
        const video = videoRef.current;
        if (video) {
            video.volume = newVolume;
            setVolume(newVolume);
            setIsMuted(newVolume === 0);
        }
    }, []);

    const toggleMute = useCallback(() => {
        const video = videoRef.current;
        if (video) {
            video.muted = !video.muted;
            setIsMuted(video.muted);
        }
    }, []);

    const toggleFullscreen = useCallback(() => {
        if (!containerRef.current) return;
        if (!document.fullscreenElement) {
            containerRef.current.requestFullscreen();
            setIsFullscreen(true);
        } else {
            document.exitFullscreen();
            setIsFullscreen(false);
        }
    }, []);

    // --- Inactivity Timer ---
    const resetInactivityTimer = useCallback(() => {
        setShowUI(true);
        if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
        inactivityTimerRef.current = setTimeout(() => {
            if (activePanel === 'none' && !isPanelHovered) {
                setShowUI(false);
            }
        }, 3000);
    }, [activePanel, isPanelHovered]);

    useEffect(() => {
        resetInactivityTimer();
        return () => {
            if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
        };
    }, [resetInactivityTimer]);

    // --- Keyboard Shortcuts ---
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

            switch (e.key.toLowerCase()) {
                case ' ':
                case 'k':
                    e.preventDefault();
                    togglePlay();
                    break;
                case 'arrowleft':
                    e.preventDefault();
                    handleSeek(currentTime - 10);
                    break;
                case 'arrowright':
                    e.preventDefault();
                    handleSeek(currentTime + 10);
                    break;
                case 'arrowup':
                    e.preventDefault();
                    handleVolumeChange(Math.min(1, volume + 0.1));
                    break;
                case 'arrowdown':
                    e.preventDefault();
                    handleVolumeChange(Math.max(0, volume - 0.1));
                    break;
                case 'm':
                    toggleMute();
                    break;
                case 'f':
                    toggleFullscreen();
                    break;
                case 'escape':
                    if (activePanel !== 'none') {
                        setActivePanel('none');
                    } else {
                        onClose();
                    }
                    break;
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [togglePlay, handleSeek, handleVolumeChange, toggleMute, toggleFullscreen, currentTime, volume, activePanel, onClose]);

    // Episode navigation - SELECT = actually play
    const handleEpisodeSelect = useCallback((ep: Episode) => {
        // Update PLAYBACK state - this triggers stream fetch
        setPlayingSeasonNumber(exploredSeasonNumber);
        setCurrentSeasonEpisodes(exploredSeasonEpisodes);
        setCurrentEpisode(ep.episode_number);
        setActivePanel('none');

        // Update URL for deep linking (so refresh maintains episode)
        if (mediaType === 'tv') {
            const newUrl = `/watch/tv/${movie.id}?season=${exploredSeasonNumber}&episode=${ep.episode_number}`;
            window.history.replaceState(null, '', newUrl);
        }
    }, [exploredSeasonNumber, exploredSeasonEpisodes, mediaType, movie.id]);

    // Season EXPLORATION - just browse, don't trigger playback
    const handleSeasonExplore = useCallback(async (s: number) => {
        setExploredSeasonNumber(s);
        try {
            const seasonData = await getSeasonDetails(String(movie.id), s);
            if (seasonData?.episodes) {
                setExploredSeasonEpisodes(seasonData.episodes);
            }
        } catch (error) {
            console.error('[VideoPlayer] Error fetching season for exploration:', error);
        }
    }, [movie.id]);

    // Initialize exploration state when panel opens
    useEffect(() => {
        if (activePanel === 'episodes' || activePanel === 'seasons') {
            // Sync exploration to current playback season
            if (exploredSeasonEpisodes.length === 0) {
                // Try to copy from current playback episodes first
                if (currentSeasonEpisodes.length > 0) {
                    setExploredSeasonNumber(playingSeasonNumber);
                    setExploredSeasonEpisodes(currentSeasonEpisodes);
                } else {
                    // If no episodes loaded yet, fetch them
                    getSeasonDetails(String(movie.id), playingSeasonNumber).then(seasonData => {
                        if (seasonData?.episodes) {
                            setExploredSeasonNumber(playingSeasonNumber);
                            setExploredSeasonEpisodes(seasonData.episodes);
                            // Also update current season episodes for playback
                            setCurrentSeasonEpisodes(seasonData.episodes);
                        }
                    }).catch(err => console.error('[VideoPlayer] Failed to fetch episodes for explorer:', err));
                }
            }

            // Prefetch next episode when menu opens
            const api = getConsumetAPI();
            if (api && mediaType === 'tv') {
                const nextEp = currentEpisode + 1;
                const title = movie.title || movie.name || '';
                const year = (movie.release_date || movie.first_air_date || '').split('-')[0];
                api.prefetchStream(title, 'tv', year ? parseInt(year) : undefined, playingSeasonNumber, nextEp);
            }
        }
    }, [activePanel, playingSeasonNumber, currentSeasonEpisodes, exploredSeasonEpisodes.length, mediaType, currentEpisode, movie]);

    // Legacy handler kept for compatibility but now just explores
    const handleSeasonSelect = handleSeasonExplore;

    // Build title
    const displayTitle = useMemo(() => {
        if (mediaType === 'tv' && activeEpisodeData) {
            return `${movie.name || movie.title} | ${activeEpisodeData.name}`;
        }
        return movie.title || movie.name || '';
    }, [movie, mediaType, activeEpisodeData]);

    // Update app bar title when playing
    useEffect(() => {
        if (mediaType === 'tv' && activeEpisodeData) {
            setPageTitle(`${movie.name || movie.title} - S${playingSeasonNumber}E${currentEpisode}`);
        } else {
            setPageTitle(movie.title || movie.name || 'Now Playing');
        }
        return () => setPageTitle('Home'); // Reset on unmount
    }, [setPageTitle, movie, mediaType, playingSeasonNumber, currentEpisode, activeEpisodeData]);

    return (
        <div
            ref={containerRef}
            className={`fixed inset-0 z-[100] bg-black font-['Consolas'] text-white overflow-hidden select-none ${showUI ? '' : 'cursor-none'}`}
            onMouseMove={resetInactivityTimer}
            onClick={(e) => {
                // If clicking directly on the container (not a child element like settings panel)
                if (e.target === e.currentTarget || (e.target as HTMLElement).closest('.video-player-main-area')) {
                    if (activePanel !== 'none') {
                        // Close panel without toggling play
                        setActivePanel('none');
                    } else {
                        // Toggle play only when no panel is open
                        togglePlay();
                    }
                }
            }}
        >
            {/* Back Button */}
            <div className={`absolute top-6 left-6 z-50 transition-opacity duration-300 ${showUI ? 'opacity-100' : 'opacity-0'}`}>
                <button
                    onClick={(e) => { e.stopPropagation(); onClose(); }}
                    className="flex items-center justify-center w-14 h-14 rounded-full bg-transparent hover:bg-[#E50914] text-white transition-all duration-300 backdrop-blur-sm"
                >
                    <ArrowLeftIcon size={42} weight="bold" />
                </button>
            </div>

            {/* Native Video Element */}
            <video
                ref={videoRef}
                className="absolute inset-0 w-full h-full object-contain bg-black"
                onTimeUpdate={handleTimeUpdate}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                onWaiting={() => setIsBuffering(true)}
                onPlaying={() => setIsBuffering(false)}
                onEnded={() => {
                    if (mediaType === 'tv' && currentEpisode < currentSeasonEpisodes.length) {
                        const nextEp = currentSeasonEpisodes.find(e => e.episode_number === currentEpisode + 1);
                        if (nextEp) handleEpisodeSelect(nextEp);
                    }
                }}
                playsInline
            />

            {/* Caption Overlay */}
            {activeCues.length > 0 && (
                <div className="absolute bottom-32 left-0 right-0 flex flex-col items-center pointer-events-none z-40">
                    {activeCues.map((cue, idx) => (
                        <CaptionCue key={makeQueId(idx, cue.start, cue.end)} cue={cue} />
                    ))}
                </div>
            )}

            {/* Loading Spinner */}
            {isBuffering && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-30">
                    <div className="text-center">
                        <div className="w-16 h-16 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                        <p className="mt-4 text-white/80">{loadingMessage}</p>
                    </div>
                </div>
            )}

            {/* Error Display */}
            {error && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/80 z-30">
                    <div className="text-center max-w-md">
                        <p className="text-red-500 text-xl mb-4">Stream Error</p>
                        <p className="text-white/60">{error}</p>
                        <button
                            onClick={onClose}
                            className="mt-6 px-6 py-2 bg-red-600 hover:bg-red-700 rounded"
                        >
                            Go Back
                        </button>
                    </div>
                </div>
            )}

            {/* Video Controls */}
            <div className={`absolute bottom-0 left-0 right-0 z-50 transition-opacity duration-300 ${showUI ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                <VideoPlayerControls
                    isPlaying={isPlaying}
                    isMuted={isMuted}
                    progress={progress}
                    duration={duration}
                    currentTime={currentTime}
                    isBuffering={isBuffering}
                    showNextEp={mediaType === 'tv' && (
                        currentSeasonEpisodes.some(e => e.episode_number === currentEpisode + 1) ||
                        seasonList.includes(playingSeasonNumber + 1)
                    )}
                    title={displayTitle}
                    areSubtitlesOff={!currentCaption}
                    onPlayPause={togglePlay}
                    onSeek={handleSeek}
                    volume={volume}
                    onVolumeChange={handleVolumeChange}
                    onToggleMute={toggleMute}
                    onTimelineSeek={(pct) => {
                        const video = videoRef.current;
                        if (video && duration > 0) {
                            video.currentTime = (pct / 100) * duration;
                        }
                    }}
                    onNextEpisode={() => {
                        const nextEp = currentSeasonEpisodes.find(e => e.episode_number === currentEpisode + 1);
                        if (nextEp) {
                            handleEpisodeSelect(nextEp);
                        } else {
                            // Try next season
                            const nextSeason = playingSeasonNumber + 1;
                            if (seasonList.includes(nextSeason)) {
                                // Fetch first episode of next season
                                getSeasonDetails(String(movie.id), nextSeason).then(seasonData => {
                                    if (seasonData?.episodes?.length > 0) {
                                        const firstEp = seasonData.episodes[0].episode_number;
                                        setPlayingSeasonNumber(nextSeason);
                                        setCurrentSeasonEpisodes(seasonData.episodes);
                                        setCurrentEpisode(firstEp);
                                        // Update URL for deep linking
                                        window.history.replaceState(null, '', `/watch/tv/${movie.id}?season=${nextSeason}&episode=${firstEp}`);
                                    }
                                });
                            }
                        }
                    }}
                    onClose={onClose}
                    onToggleFullscreen={toggleFullscreen}
                    onSettingsClick={() => setActivePanel(activePanel === 'quality' ? 'none' : 'quality')}
                    onSubtitlesClick={() => setActivePanel(activePanel === 'audioSubtitles' ? 'none' : 'audioSubtitles')}
                    onSubtitlesHover={() => setIsPanelHovered(true)}
                    onSettingsHover={() => setIsPanelHovered(true)}
                    onEpisodesClick={mediaType === 'tv' ? () => setActivePanel(activePanel === 'episodes' ? 'none' : 'episodes') : undefined}
                    onEpisodesHover={mediaType === 'tv' ? () => setIsPanelHovered(true) : undefined}
                    showUI={showUI}
                />
            </div>

            {/* Settings Panel */}
            {activePanel !== 'none' && (
                <VideoPlayerSettings
                    activePanel={activePanel}
                    setActivePanel={setActivePanel}
                    captions={captions}
                    currentCaption={currentCaption}
                    onSubtitleChange={setCurrentCaption}
                    seasonList={seasonList}
                    selectedSeason={exploredSeasonNumber}
                    playingSeason={playingSeasonNumber}
                    showId={movie.id}
                    currentSeasonEpisodes={exploredSeasonEpisodes.length > 0 ? exploredSeasonEpisodes : currentSeasonEpisodes}
                    currentEpisode={currentEpisode}
                    onSeasonSelect={handleSeasonExplore}
                    onEpisodeSelect={handleEpisodeSelect}
                    onEpisodeExpand={(season, ep) => {
                        console.log(`[VideoPlayer] Prefetching S${season}E${ep} for faster playback`);
                        // Future: could prefetch stream info here
                    }}
                    qualities={qualityLevels}
                    currentQuality={currentQualityLevel}
                    onQualityChange={(level) => {
                        if (hlsRef.current) {
                            hlsRef.current.currentLevel = level;
                            setCurrentQualityLevel(level);
                            console.log('[VideoPlayer] Quality changed to level:', level);
                        }
                    }}
                    showTitle={displayTitle}
                    onPanelHover={() => setIsPanelHovered(true)}
                    onStartHide={() => setIsPanelHovered(false)}
                />
            )}
        </div>
    );
};

export default VideoPlayer;