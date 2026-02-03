import React, { useRef, useEffect, useState } from 'react';
import YouTube from 'react-youtube';
import { Movie } from '../types';
import { IMG_PATH } from '../constants';
import { applyYouTubeQuality } from '../hooks/useNetworkQuality';

interface HeroCarouselBackgroundProps {
    movie: Movie;
    showVideo: boolean;
    trailerQueue: string[];
    isVideoReady: boolean;
    setIsVideoReady: (ready: boolean) => void;
    setTrailerQueue: React.Dispatch<React.SetStateAction<string[]>>;
    setShowVideo: (show: boolean) => void;
    isMuted: boolean;
    videoDimensions: { width: string | number, height: string | number };
    playerRef: any;
    isHovered: boolean;
    onSyncCheck?: (videoId: string) => number | undefined;
    onVideoEnd?: () => void;
    youtubeQuality?: 'hd720' | 'hd1080' | 'default';
    replayCount?: number;
}

const HeroCarouselBackground: React.FC<HeroCarouselBackgroundProps> = ({
    movie,
    showVideo,
    trailerQueue,
    isVideoReady,
    setIsVideoReady,
    setTrailerQueue,
    setShowVideo,
    isMuted,
    videoDimensions,
    playerRef,
    isHovered,
    onSyncCheck,
    onVideoEnd,
    youtubeQuality = 'hd1080',
    replayCount = 0
}) => {
    const progressIntervalRef = useRef<any>(null);

    // State for hidden video approach
    const [isVideoHidden, setIsVideoHidden] = useState(false);
    const hasTriggeredHideRef = useRef(false);
    const hasStartedAudioFadeRef = useRef(false);
    const waitingForLoopRef = useRef(false);
    const lastTimeRef = useRef(0);

    // Smart video end detection - hide video visually but keep player running
    useEffect(() => {
        console.log('[HeroCarousel] Effect triggered - showVideo:', showVideo, 'isVideoReady:', isVideoReady, 'videoId:', trailerQueue[0]);

        // Only reset when showVideo becomes TRUE (replay/new video), not when FALSE
        if (showVideo) {
            hasTriggeredHideRef.current = false;
            hasStartedAudioFadeRef.current = false;
            waitingForLoopRef.current = false;
            lastTimeRef.current = 0;
            setIsVideoHidden(false);
        }

        if (showVideo && isVideoReady && playerRef.current) {
            // Clear any existing interval
            if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);

            // Check progress every 200ms
            progressIntervalRef.current = setInterval(() => {
                try {
                    const player = playerRef.current;
                    if (!player) return;

                    const currentTime = player.getCurrentTime();
                    const duration = player.getDuration();

                    // Phase 0: Start audio fade early (7 seconds before end)
                    if (duration > 0 && currentTime >= duration - 7 && !hasStartedAudioFadeRef.current) {
                        hasStartedAudioFadeRef.current = true;
                        // Start fading audio early (over 1000ms)
                        try {
                            let vol = player.getVolume();
                            const fadeInterval = setInterval(() => {
                                vol -= 5; // Slower fade (5% every 50ms = 1000ms total)
                                if (vol <= 0) {
                                    player.setVolume(0);
                                    clearInterval(fadeInterval);
                                } else {
                                    player.setVolume(vol);
                                }
                            }, 50);
                        } catch (e) { }
                    }

                    // Phase 1: Hide video visually (5 seconds before end - more buffer for YouTube overlay)
                    if (duration > 0 && currentTime >= duration - 5 && !hasTriggeredHideRef.current) {
                        console.log('[HeroCarousel] Near end - hiding video at', currentTime, '/', duration);
                        hasTriggeredHideRef.current = true;
                        waitingForLoopRef.current = true;
                        lastTimeRef.current = currentTime;

                        // CRITICAL: Direct DOM hide - synchronous, no React wait!
                        const videoLayer = document.getElementById('hero-video-layer');
                        if (videoLayer) {
                            videoLayer.style.display = 'none';
                            videoLayer.style.visibility = 'hidden';
                            videoLayer.style.opacity = '0';
                        }

                        // PAUSE the video immediately so YouTube can't show recommendations
                        try {
                            player.pauseVideo();
                        } catch (e) { }

                        // React state update (for proper cleanup later)
                        setIsVideoHidden(true);

                        // Trigger the end callback (shows replay button)
                        if (onVideoEnd) onVideoEnd();
                    }

                    // Phase 2: Detect loop restart and pause
                    if (waitingForLoopRef.current && currentTime < lastTimeRef.current - 10) {
                        // Video has looped (time jumped back)
                        console.log('[HeroCarousel] Video looped, pausing at', currentTime);
                        waitingForLoopRef.current = false;

                        // Wait a moment then pause
                        setTimeout(() => {
                            try {
                                player.pauseVideo();
                            } catch (e) { }
                        }, 500);
                    }

                    lastTimeRef.current = currentTime;
                } catch (e) {
                    console.error('[HeroCarousel] Progress check error:', e);
                }
            }, 200);
        }

        return () => {
            if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
        };
    }, [showVideo, isVideoReady, trailerQueue[0]]);

    return (
        <>
            {/* Background Image */}
            <div className={`absolute inset-0 transition-opacity duration-700 ease-in-out z-0 ${showVideo && isVideoReady && !isVideoHidden ? "opacity-0" : "opacity-100"}`}>
                <img
                    src={`${IMG_PATH}${movie.backdrop_path}`}
                    className={`w-full h-full object-cover ${['series', 'comic', 'manga', 'local'].includes(movie.media_type || '') ? 'object-[50%_30%]' : 'object-center'}`}
                    alt="backdrop"
                />
            </div>

            {/* Background Video Layer - INSTANTLY hidden when isVideoHidden to prevent YouTube overlay */}
            <div
                id="hero-video-layer"
                className={`absolute inset-0 z-0 ${isVideoHidden ? 'invisible' : (showVideo && isVideoReady ? 'opacity-100' : 'opacity-0 transition-opacity duration-500')}`}
                style={isVideoHidden ? { visibility: 'hidden', display: 'none' } : {}}
            >
                {showVideo && trailerQueue.length > 0 && (
                    <div
                        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[42%] pointer-events-none z-0 opacity-60"
                        style={{ width: videoDimensions.width, height: videoDimensions.height }}
                    >
                        <YouTube
                            key={`youtube-${trailerQueue[0]}-${replayCount}`}
                            videoId={trailerQueue[0]}
                            className="w-full h-full object-cover"
                            onReady={(e) => {
                                console.log('[HeroCarousel] YouTube onReady - videoId:', trailerQueue[0], 'playlist should be:', trailerQueue[0]);
                                playerRef.current = e.target;
                                setIsVideoReady(true);
                                if (isMuted) e.target.mute();
                                else e.target.unMute();

                                // Apply network-based quality
                                applyYouTubeQuality(e.target, youtubeQuality);

                                // Seamless sync: seek to saved time if same video
                                const savedTime = onSyncCheck?.(trailerQueue[0]);
                                if (savedTime && savedTime > 0) {
                                    e.target.seekTo(savedTime, true);
                                }

                                if (!isHovered) {
                                    e.target.pauseVideo();
                                    e.target.setVolume(0);
                                } else {
                                    e.target.setVolume(100);
                                }
                            }}
                            onEnd={(e) => {
                                // Fallback: If YouTube's loop:1 doesn't work, manually loop
                                console.log('[HeroCarousel] onEnd fired - manual loop fallback');
                                try {
                                    e.target.seekTo(0, true);
                                    e.target.playVideo();
                                } catch (err) {
                                    console.error('[HeroCarousel] Manual loop failed:', err);
                                }
                            }}
                            onStateChange={(e) => {
                                if (e.data === 1) setIsVideoReady(true);
                            }}
                            onError={(e) => {
                                setTrailerQueue(prev => prev.slice(1));
                                if (trailerQueue.length <= 1) setShowVideo(false);
                            }}
                            opts={{
                                width: '100%',
                                height: '100%',
                                playerVars: {
                                    autoplay: 1,
                                    controls: 0,
                                    disablekb: 1,
                                    loop: 1,
                                    playlist: trailerQueue[0],
                                    modestbranding: 1,
                                    rel: 0,
                                    iv_load_policy: 3,
                                    fs: 0,
                                    cc_load_policy: 1,
                                    cc_lang_pref: 'en',
                                    hl: 'en',
                                }
                            }}
                        />
                    </div>
                )}
            </div>

            {/* Minimal Gradients - Very subtle for hero brightness */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/5 via-transparent to-transparent z-10 pointer-events-none" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#141414]/60 via-transparent to-transparent z-10 pointer-events-none" />
            <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-[#141414] to-transparent z-10 pointer-events-none" />
        </>
    );
};

export default HeroCarouselBackground;
