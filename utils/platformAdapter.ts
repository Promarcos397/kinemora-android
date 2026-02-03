/**
 * Platform Adapter for Kinemora
 * 
 * Provides a unified API that works on both Electron and Capacitor (Android/iOS).
 * Detects the current platform and routes calls appropriately.
 */

import { Capacitor } from '@capacitor/core';

export type Platform = 'electron' | 'capacitor' | 'web';

/**
 * Detect current platform
 */
export function getPlatform(): Platform {
    // Check for Electron
    if (typeof window !== 'undefined' && (window as any).electron) {
        return 'electron';
    }

    // Check for Capacitor
    if (Capacitor.isNativePlatform()) {
        return 'capacitor';
    }

    return 'web';
}

/**
 * Check if running on mobile (Android or iOS)
 */
export function isMobile(): boolean {
    return Capacitor.isNativePlatform();
}

/**
 * Check if running on Electron
 */
export function isElectron(): boolean {
    return typeof window !== 'undefined' && !!(window as any).electron;
}

/**
 * Get Consumet API
 * - On Electron: Uses IPC through window.electron.consumet
 * - On Capacitor: Uses direct HTTP to the Consumet API
 */
export function getConsumetAPI() {
    if (isElectron()) {
        return (window as any).electron?.consumet;
    }

    // Capacitor: Use direct HTTP API
    return {
        async getStream(title: string, type: 'movie' | 'tv', year?: number, season?: number, episode?: number) {
            const CONSUMET_URL = 'https://consumet-api-halv.onrender.com';

            try {
                // Search for the title
                const searchRes = await fetch(`${CONSUMET_URL}/movies/goku/${encodeURIComponent(title)}`);
                const searchData = await searchRes.json();

                if (!searchData.results?.length) {
                    return { success: false, error: 'No results found' };
                }

                // Find best match
                const targetYear = year;
                let match = searchData.results.find((r: any) => {
                    if (targetYear && r.releaseDate) {
                        return r.releaseDate.includes(String(targetYear));
                    }
                    return true;
                }) || searchData.results[0];

                // Get stream info
                let infoUrl = `${CONSUMET_URL}/movies/goku/info?id=${match.id}`;
                const infoRes = await fetch(infoUrl);
                const infoData = await infoRes.json();

                // Get episode ID for TV shows
                let episodeId = infoData.id;
                if (type === 'tv' && infoData.episodes) {
                    const ep = infoData.episodes.find((e: any) =>
                        e.season === season && e.number === episode
                    );
                    if (ep) episodeId = ep.id;
                }

                // Get stream sources
                const watchUrl = `${CONSUMET_URL}/movies/goku/watch?episodeId=${episodeId}&mediaId=${match.id}`;
                const watchRes = await fetch(watchUrl);
                const watchData = await watchRes.json();

                if (watchData.sources?.length) {
                    return {
                        success: true,
                        sources: watchData.sources,
                        subtitles: watchData.subtitles || [],
                        provider: 'goku'
                    };
                }

                return { success: false, error: 'No streams found' };
            } catch (err: any) {
                console.error('[PlatformAdapter] Consumet error:', err);
                return { success: false, error: err.message };
            }
        }
    };
}

/**
 * Get Cloud Library API
 * - On Electron: Uses IPC through window.electron.cloud
 * - On Capacitor: Makes direct HTTP calls (if applicable)
 */
export function getCloudAPI() {
    if (isElectron()) {
        return (window as any).electron?.cloud;
    }

    // For Capacitor: Cloud features may not be available
    // or would need a direct Supabase integration
    console.warn('[PlatformAdapter] Cloud API not available on Capacitor');
    return null;
}

export default {
    getPlatform,
    isMobile,
    isElectron,
    getConsumetAPI,
    getCloudAPI
};
