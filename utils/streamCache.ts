/**
 * Stream Cache for Kinemora
 * 
 * Caches stream URLs with TTL to avoid re-fetching.
 * Also handles prefetching for next episodes.
 */

interface CachedStream {
    sources: Array<{ url: string; quality: string; isM3U8?: boolean }>;
    subtitles: Array<{ url: string; lang: string }>;
    provider: string;
    cachedAt: number;
}

interface CacheKey {
    title: string;
    type: 'movie' | 'tv';
    year?: number;
    season?: number;
    episode?: number;
}

const CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutes
const MAX_CACHE_SIZE = 20;

class StreamCache {
    private cache: Map<string, CachedStream> = new Map();
    private prefetchQueue: Set<string> = new Set();

    private generateKey(key: CacheKey): string {
        if (key.type === 'movie') {
            return `movie:${key.title}:${key.year || ''}`;
        }
        return `tv:${key.title}:${key.year || ''}:S${key.season}E${key.episode}`;
    }

    /**
     * Get cached stream if available and not expired
     */
    get(key: CacheKey): CachedStream | null {
        const cacheKey = this.generateKey(key);
        const cached = this.cache.get(cacheKey);

        if (!cached) return null;

        // Check expiration
        if (Date.now() - cached.cachedAt > CACHE_TTL_MS) {
            this.cache.delete(cacheKey);
            return null;
        }

        console.log(`[StreamCache] HIT for ${cacheKey}`);
        return cached;
    }

    /**
     * Store stream in cache
     */
    set(key: CacheKey, stream: Omit<CachedStream, 'cachedAt'>): void {
        const cacheKey = this.generateKey(key);

        // Enforce max size - remove oldest entries
        if (this.cache.size >= MAX_CACHE_SIZE) {
            const oldestKey = this.cache.keys().next().value;
            if (oldestKey) {
                this.cache.delete(oldestKey);
            }
        }

        this.cache.set(cacheKey, {
            ...stream,
            cachedAt: Date.now()
        });

        console.log(`[StreamCache] STORED ${cacheKey}`);
    }

    /**
     * Prefetch next episodes in background
     */
    async prefetchNextEpisodes(
        api: any,
        title: string,
        year: number | undefined,
        currentSeason: number,
        currentEpisode: number,
        totalEpisodes: number
    ): Promise<void> {
        const episodesToPrefetch: Array<{ season: number; episode: number }> = [];

        // Next 2 episodes in current season
        for (let i = 1; i <= 2; i++) {
            const nextEp = currentEpisode + i;
            if (nextEp <= totalEpisodes) {
                episodesToPrefetch.push({ season: currentSeason, episode: nextEp });
            }
        }

        // Prefetch in background
        for (const { season, episode } of episodesToPrefetch) {
            const key: CacheKey = { title, type: 'tv', year, season, episode };
            const cacheKey = this.generateKey(key);

            // Skip if already cached or in queue
            if (this.cache.has(cacheKey) || this.prefetchQueue.has(cacheKey)) {
                continue;
            }

            this.prefetchQueue.add(cacheKey);

            // Fetch in background (don't await)
            this.fetchAndCache(api, key).finally(() => {
                this.prefetchQueue.delete(cacheKey);
            });
        }
    }

    private async fetchAndCache(api: any, key: CacheKey): Promise<void> {
        try {
            console.log(`[StreamCache] Prefetching S${key.season}E${key.episode}...`);

            const result = await api.getStream(
                key.title,
                key.type,
                key.year,
                key.season,
                key.episode
            );

            if (result.success && result.sources?.length > 0) {
                this.set(key, {
                    sources: result.sources,
                    subtitles: result.subtitles || [],
                    provider: result.provider || 'unknown'
                });
                console.log(`[StreamCache] ✅ Prefetched S${key.season}E${key.episode}`);
            }
        } catch (err) {
            console.warn(`[StreamCache] Prefetch failed for S${key.season}E${key.episode}:`, err);
        }
    }

    /**
     * Clear all cache
     */
    clear(): void {
        this.cache.clear();
        this.prefetchQueue.clear();
    }

    /**
     * Get cache stats
     */
    stats(): { size: number; keys: string[] } {
        return {
            size: this.cache.size,
            keys: Array.from(this.cache.keys())
        };
    }
}

// Singleton instance
export const streamCache = new StreamCache();
export type { CacheKey, CachedStream };
