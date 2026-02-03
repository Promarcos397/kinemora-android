import React, { useEffect, useRef, useState, useCallback, forwardRef, useImperativeHandle } from 'react';

// Type for the VidSrc Electron API
interface VidSrcAPI {
    create: (url: string, bounds: { x: number; y: number; width: number; height: number }) => Promise<{ success: boolean; error?: string }>;
    destroy: () => Promise<{ success: boolean }>;
    resize: (bounds: { x: number; y: number; width: number; height: number }) => void;
    execute: (script: string) => Promise<{ success: boolean; result?: any; error?: string }>;
    findVideo: () => Promise<{ found: boolean; src?: string; frame?: string; error?: string }>;
    onLoaded: (callback: () => void) => () => void;
}

// Get the VidSrc API from window.electron (type assertion for safety)
const getVidsrcAPI = (): VidSrcAPI => (window as any).electron?.vidsrc;

export interface VidSrcEmbedProps {
    tmdbId: string;
    type: 'movie' | 'tv';
    season?: number;
    episode?: number;
    onReady?: () => void;
    onError?: (error: string) => void;
    onTimeUpdate?: (time: number, duration: number) => void;
    onPlay?: () => void;
    onPause?: () => void;
    onBuffering?: () => void;
    className?: string;
}

export interface VidSrcEmbedHandle {
    play: () => void;
    pause: () => void;
    seek: (time: number) => void;
    setVolume: (volume: number) => void;
    toggleMute: () => void;
}

// VidSrc domain fallback chain (from vidsrc.domains NEW DOMAINS list)
const VIDSRC_DOMAINS = [
    'vidsrc-embed.ru',
    'vidsrc-embed.su',
    'vidsrc-me.ru',
    'vidsrc-me.su',
    'vidsrcme.ru',
    'vidsrcme.su',
    'vsrc.su',
];

const VidSrcEmbed = forwardRef<VidSrcEmbedHandle, VidSrcEmbedProps>(({
    tmdbId,
    type,
    season,
    episode,
    onReady,
    onError,
    onTimeUpdate,
    onPlay,
    onPause,
    onBuffering,
    className = '',
}, ref) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const [currentDomainIndex, setCurrentDomainIndex] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [hasError, setHasError] = useState(false);

    // Build embed URL for current domain
    const buildEmbedUrl = useCallback((domainIndex: number) => {
        const domain = VIDSRC_DOMAINS[domainIndex];
        if (!domain) return null;

        if (type === 'movie') {
            return `https://${domain}/embed/movie/${tmdbId}`;
        } else {
            return `https://${domain}/embed/tv/${tmdbId}/${season || 1}/${episode || 1}`;
        }
    }, [tmdbId, type, season, episode]);

    // Expose control methods (limited with BrowserView)
    useImperativeHandle(ref, () => ({
        play: () => {
            getVidsrcAPI()?.execute(`
                document.querySelector('video')?.play();
            `);
        },
        pause: () => {
            getVidsrcAPI()?.execute(`
                document.querySelector('video')?.pause();
            `);
        },
        seek: (time: number) => {
            getVidsrcAPI()?.execute(`
                const v = document.querySelector('video');
                if (v) v.currentTime = ${time};
            `);
        },
        setVolume: (volume: number) => {
            getVidsrcAPI()?.execute(`
                const v = document.querySelector('video');
                if (v) v.volume = ${volume};
            `);
        },
        toggleMute: () => {
            getVidsrcAPI()?.execute(`
                const v = document.querySelector('video');
                if (v) v.muted = !v.muted;
            `);
        }
    }), []);

    // Create BrowserView on mount, destroy on unmount
    useEffect(() => {
        const url = buildEmbedUrl(currentDomainIndex);
        if (!url) {
            setHasError(true);
            onError?.('No valid VidSrc domain available');
            return;
        }

        console.log('[VidSrcEmbed] Creating BrowserView for:', url);
        setIsLoading(true);
        setHasError(false);

        // Calculate bounds based on container
        const updateBounds = () => {
            if (!containerRef.current) return { x: 0, y: 0, width: 800, height: 600 };
            const rect = containerRef.current.getBoundingClientRect();
            return {
                x: Math.round(rect.left),
                y: Math.round(rect.top),
                width: Math.round(rect.width),
                height: Math.round(rect.height)
            };
        };

        // Create BrowserView
        const api = getVidsrcAPI();
        if (!api) {
            console.error('[VidSrcEmbed] VidSrc API not available');
            setHasError(true);
            onError?.('VidSrc API not available - are you running in Electron?');
            return;
        }

        api.create(url, updateBounds()).then((result) => {
            if (!result.success) {
                console.error('[VidSrcEmbed] Failed to create BrowserView:', result.error);
                // Try next domain
                if (currentDomainIndex < VIDSRC_DOMAINS.length - 1) {
                    setCurrentDomainIndex(i => i + 1);
                } else {
                    setHasError(true);
                    onError?.('All VidSrc domains failed');
                }
            } else {
                setIsLoading(false);
                onReady?.();
            }
        });

        // Listen for load event
        const unsubscribe = api.onLoaded(() => {
            console.log('[VidSrcEmbed] BrowserView loaded');
            setIsLoading(false);
        });

        // Handle resize
        const resizeObserver = new ResizeObserver(() => {
            api.resize(updateBounds());
        });
        if (containerRef.current) {
            resizeObserver.observe(containerRef.current);
        }

        // Cleanup
        return () => {
            console.log('[VidSrcEmbed] Destroying BrowserView');
            unsubscribe();
            resizeObserver.disconnect();
            api.destroy();
        };
    }, [currentDomainIndex, buildEmbedUrl, onReady, onError]);

    // Re-create when episode changes
    useEffect(() => {
        // Reset to first domain when content changes
        setCurrentDomainIndex(0);
    }, [tmdbId, type, season, episode]);

    if (hasError) {
        return (
            <div className={`flex items-center justify-center bg-black text-white ${className}`}>
                <p>No stream available</p>
            </div>
        );
    }

    return (
        <div
            ref={containerRef}
            className={`relative bg-black w-full h-full ${className}`}
            style={{ minHeight: '100%' }}
        >
            {/* Loading overlay - BrowserView renders on top automatically */}
            {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-black z-10">
                    <div className="text-center">
                        <div className="w-12 h-12 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto" />
                        <p className="mt-4 text-white/60 text-sm">
                            Loading from {VIDSRC_DOMAINS[currentDomainIndex]}...
                        </p>
                    </div>
                </div>
            )}
            {/* BrowserView is managed by main process and renders on top of this container */}
        </div>
    );
});

VidSrcEmbed.displayName = 'VidSrcEmbed';

export default VidSrcEmbed;
