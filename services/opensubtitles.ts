/* eslint-disable no-console */
import { labelToLanguageCode } from "@p-stream/providers";

// Simplified type for now, matching kinemora's needs
export interface OpenSubtitleItem {
    id: string;
    language: string;
    display: string;
    url: string;
    type: string;
    opensubtitles: boolean;
}

export async function scrapeOpenSubtitlesCaptions(
    imdbId: string,
    season?: number,
    episode?: number,
): Promise<OpenSubtitleItem[]> {
    try {
        let data;

        // If the ID is purely numeric and doesn't start with 'tt', it might be a TMDB ID
        // But scraping logic expects IMDB ID (without 'tt' is fine, but needs to be the IMDB number).
        // Since we cannot easily convert here without API key/call, we assume the caller MUST pass IMDB ID.
        // However, looking at PStreamAdapter, it passes TMDB ID.
        // We will try to support `tmdbid-{id}` if the API supports it.
        // OpenSubtitles REST API documentation suggests `imdbid` or text search.
        // Some proxies support `tmdbid`.

        // Let's try to detect if it's a TMDB ID and use the correct prefix if known?
        // Actually, best fix is in the caller (PStreamAdapter) to pass the correct ID.
        // But I will also robustify URL construction here just in case.

        // Original: `imdbid-${imdbId.replace('tt', '')}`

        const url = `https://rest.opensubtitles.org/search/${season && episode ? `episode-${episode}/` : ""
            }imdbid-${imdbId.replace('tt', '')}${season && episode ? `/season-${season}` : ""}`;

        // ... (rest of function)
        // @ts-ignore
        if (window.electron && window.electron.request) {
            // @ts-ignore
            const response = await window.electron.request({ url, headers: { "X-User-Agent": "VLSub 0.10.2" } });
            if (!response.ok) throw new Error(`OpenSubtitles API returned ${response.status}`);
            data = JSON.parse(response.body);
        } else {
            const response = await fetch(url, {
                headers: {
                    "X-User-Agent": "VLSub 0.10.2",
                },
            });

            if (!response.ok) {
                throw new Error(`OpenSubtitles API returned ${response.status}`);
            }
            data = await response.json();
        }
        const openSubtitlesCaptions: OpenSubtitleItem[] = [];

        for (const caption of data) {
            const downloadUrl = caption.SubDownloadLink.replace(".gz", "").replace(
                "download/",
                "download/subencoding-utf8/",
            );
            const language = labelToLanguageCode(caption.LanguageName) || "";

            if (!downloadUrl || !language) continue;

            openSubtitlesCaptions.push({
                id: downloadUrl, // Using URL as ID for simple dedupe
                language,
                display: caption.LanguageName,
                url: downloadUrl,
                type: caption.SubFormat || "srt",
                opensubtitles: true,
            });
        }

        return openSubtitlesCaptions;
    } catch (error) {
        console.error("Error fetching OpenSubtitles:", error);
        return [];
    }
}
