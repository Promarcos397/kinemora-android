export const API_KEY = 'c477878444affbf19e4818802309df39';
export const BASE_URL = 'https://api.themoviedb.org/3';
export const IMG_PATH = 'https://image.tmdb.org/t/p/original';
export const LOGO_SIZE = 'w500';

// Helper to get current display language from localStorage
const getCurrentLanguage = (): string => {
  try {
    const settings = localStorage.getItem('kinemora-settings');
    if (settings) {
      const parsed = JSON.parse(settings);
      return parsed.displayLanguage || 'en-US';
    }
  } catch { }
  return 'en-US';
};

// Dynamic REQUESTS - language is read from localStorage each time
export const REQUESTS = {
  get fetchTrending() { return `${BASE_URL}/trending/all/week?api_key=${API_KEY}&language=${getCurrentLanguage()}`; },
  get fetchNetflixOriginals() { return `${BASE_URL}/discover/tv?api_key=${API_KEY}&with_networks=213&language=${getCurrentLanguage()}`; },
  get fetchTopRated() { return `${BASE_URL}/movie/top_rated?api_key=${API_KEY}&language=${getCurrentLanguage()}`; },
  get fetchPopular() { return `${BASE_URL}/movie/popular?api_key=${API_KEY}&language=${getCurrentLanguage()}`; },
  get fetchActionMovies() { return `${BASE_URL}/discover/movie?api_key=${API_KEY}&with_genres=28&language=${getCurrentLanguage()}`; },
  get fetchComedyMovies() { return `${BASE_URL}/discover/movie?api_key=${API_KEY}&with_genres=35&language=${getCurrentLanguage()}`; },
  get fetchHorrorMovies() { return `${BASE_URL}/discover/movie?api_key=${API_KEY}&with_genres=27&language=${getCurrentLanguage()}`; },
  get fetchRomanceMovies() { return `${BASE_URL}/discover/movie?api_key=${API_KEY}&with_genres=10749&language=${getCurrentLanguage()}`; },
  get fetchDocumentaries() { return `${BASE_URL}/discover/movie?api_key=${API_KEY}&with_genres=99&language=${getCurrentLanguage()}`; },
  get fetchSciFiMovies() { return `${BASE_URL}/discover/movie?api_key=${API_KEY}&with_genres=878&language=${getCurrentLanguage()}`; },

  // TV Specifics
  get fetchActionTV() { return `${BASE_URL}/discover/tv?api_key=${API_KEY}&with_genres=10759&language=${getCurrentLanguage()}`; },
  get fetchComedyTV() { return `${BASE_URL}/discover/tv?api_key=${API_KEY}&with_genres=35&language=${getCurrentLanguage()}`; },
  get fetchDramaTV() { return `${BASE_URL}/discover/tv?api_key=${API_KEY}&with_genres=18&language=${getCurrentLanguage()}`; },
  get fetchCrimeTV() { return `${BASE_URL}/discover/tv?api_key=${API_KEY}&with_genres=80&language=${getCurrentLanguage()}`; },
  get fetchRealityTV() { return `${BASE_URL}/discover/tv?api_key=${API_KEY}&with_genres=10764&language=${getCurrentLanguage()}`; },

  // New & Popular Specifics
  get fetchTrendingTV() { return `${BASE_URL}/trending/tv/day?api_key=${API_KEY}&language=${getCurrentLanguage()}`; },
  get fetchTrendingMovies() { return `${BASE_URL}/trending/movie/day?api_key=${API_KEY}&language=${getCurrentLanguage()}`; },
  get fetchUpcoming() { return `${BASE_URL}/movie/upcoming?api_key=${API_KEY}&language=${getCurrentLanguage()}&page=1`; },

  get searchMulti() { return `${BASE_URL}/search/multi?api_key=${API_KEY}&language=${getCurrentLanguage()}&include_adult=false`; },
};

export const GENRES: { [key: number]: string } = {
  28: "Action",
  12: "Adventure",
  16: "Animation",
  35: "Comedy",
  80: "Crime",
  99: "Documentary",
  18: "Drama",
  10751: "Family",
  14: "Fantasy",
  36: "History",
  27: "Horror",
  10402: "Music",
  9648: "Mystery",
  10749: "Romance",
  878: "Science Fiction",
  10770: "TV Movie",
  53: "Thriller",
  10752: "War",
  37: "Western",
  10759: "Action & Adventure",
  10762: "Kids",
  10763: "News",
  10764: "Reality",
  10765: "Sci-Fi & Fantasy",
  10766: "Soap",
  10767: "Talk",
  10768: "War & Politics",
};

// Language options for settings
export const DISPLAY_LANGUAGES = [
  { code: 'en-US', label: 'English (US)' },
  { code: 'en-GB', label: 'English (UK)' },
  { code: 'es-ES', label: 'Español (España)' },
  { code: 'es-MX', label: 'Español (México)' },
  { code: 'fr-FR', label: 'Français' },
  { code: 'de-DE', label: 'Deutsch' },
  { code: 'it-IT', label: 'Italiano' },
  { code: 'pt-BR', label: 'Português (Brasil)' },
  { code: 'pt-PT', label: 'Português (Portugal)' },
  { code: 'ja-JP', label: '日本語' },
  { code: 'ko-KR', label: '한국어' },
  { code: 'zh-CN', label: '中文 (简体)' },
  { code: 'zh-TW', label: '中文 (繁體)' },
  { code: 'ar-SA', label: 'العربية' },
  { code: 'hi-IN', label: 'हिन्दी' },
  { code: 'ru-RU', label: 'Русский' },
  { code: 'tr-TR', label: 'Türkçe' },
  { code: 'pl-PL', label: 'Polski' },
  { code: 'nl-NL', label: 'Nederlands' },
  { code: 'sv-SE', label: 'Svenska' },
];

export const SUBTITLE_LANGUAGES = [
  { code: 'en', label: 'English' },
  { code: 'es', label: 'Español' },
  { code: 'fr', label: 'Français' },
  { code: 'de', label: 'Deutsch' },
  { code: 'it', label: 'Italiano' },
  { code: 'pt', label: 'Português' },
  { code: 'ja', label: '日本語' },
  { code: 'ko', label: '한국어' },
  { code: 'zh', label: '中文' },
  { code: 'ar', label: 'العربية' },
  { code: 'hi', label: 'हिन्दी' },
  { code: 'ru', label: 'Русский' },
  { code: 'tr', label: 'Türkçe' },
  { code: 'pl', label: 'Polski' },
  { code: 'nl', label: 'Nederlands' },
];