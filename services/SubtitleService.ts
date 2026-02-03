
// Helper for language codes (can be expanded)
const langMap: Record<string, string> = {
    'English': 'en',
    'Spanish': 'es',
    'French': 'fr',
    'German': 'de',
    'Italian': 'it',
    'Portuguese': 'pt',
    'Russian': 'ru',
    'Japanese': 'ja',
    'Korean': 'ko',
    'Chinese': 'zh',
    'Arabic': 'ar',
    'Turkish': 'tr',
    'Dutch': 'nl',
    'Polish': 'pl',
    'Swedish': 'sv',
    'Danish': 'da',
    'Finnish': 'fi',
    'Norwegian': 'no',
    'Hungarian': 'hu',
    'Greek': 'el',
    'Hebrew': 'he',
    'Czech': 'cs',
    'Romanian': 'ro',
    'Thai': 'th',
    'Vietnamese': 'vi',
    'Indonesian': 'id'
};

function labelToLanguageCode(label: string): string {
    // Basic mapping or try to parse
    const normalized = label.split(' ')[0]; // "English (US)" -> "English"
    return langMap[normalized] || 'en'; // Default to en if unknown or keep raw? 
    // Actually, returning 'en' for unknown might be bad.
    // Let's attempt to match common names.
}

export interface SubtitleTrack {
    url: string;
    lang: string;
    label: string;
}

export const SubtitleService = {
    getOpenSubtitles: async (imdbId: string, season?: number, episode?: number): Promise<SubtitleTrack[]> => {
        try {
            if (!imdbId) return [];

            // Clean ID (remove 'tt')
            const cleanId = imdbId.replace('tt', '');

            // Construct URL
            let url = '';
            if (season && episode) {
                url = `https://rest.opensubtitles.org/search/episode-${episode}/imdbid-${cleanId}/season-${season}`;
            } else {
                url = `https://rest.opensubtitles.org/search/imdbid-${cleanId}`;
            }

            console.log(`[SubtitleService] Fetching OpenSubtitles for ${imdbId}...`, url);

            // Use Electron IPC if available
            // @ts-ignore
            let data: any = null;

            // @ts-ignore
            if (window.electron && window.electron.request) {
                // @ts-ignore
                const response = await window.electron.request({
                    url,
                    headers: { "X-User-Agent": "VLSub 0.10.2" }
                });

                if (!response.ok) {
                    console.warn(`[SubtitleService] OpenSubtitles IPC API returned ${response.status}`);
                    return [];
                }

                // Parse body if string, otherwise use as is
                data = typeof response.body === 'string' ? JSON.parse(response.body) : response.body;
            } else {
                // Browser Fallback
                const response = await fetch(url, { headers: { "X-User-Agent": "VLSub 0.10.2" } });
                if (!response.ok) return [];
                data = await response.json();
            }

            console.log('[SubtitleService] Raw response:', data);
            const captions: SubtitleTrack[] = [];

            if (Array.isArray(data)) {
                for (const caption of data) {
                    let downloadUrl = caption.SubDownloadLink;
                    if (downloadUrl) {
                        downloadUrl = downloadUrl.replace(".gz", "").replace("download/", "download/subencoding-utf8/");

                        const label = caption.LanguageName || 'Unknown';
                        const lang = caption.ISO639 || labelToLanguageCode(label);

                        captions.push({
                            url: downloadUrl,
                            label: label,
                            lang: lang
                        });
                    }
                }
            }

            console.log(`[SubtitleService] Found ${captions.length} subtitles.`);
            return captions;

        } catch (error) {
            console.error("[SubtitleService] Error fetching OpenSubtitles:", error);
            return [];
        }
    }
};
