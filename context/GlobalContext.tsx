import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { Movie, AppSettings } from '../types';
import { setApiLanguage } from '../services/api';

interface VideoState {
  time: number;
  duration?: number;
  videoId?: string;
}

// Extended state for TV episode tracking
interface EpisodeProgress {
  time: number;
  duration: number;
  season: number;
  episode: number;
  updatedAt: number;
}

interface GlobalContextType {
  myList: Movie[];
  continueWatching: Movie[];
  settings: AppSettings;
  toggleList: (movie: Movie) => void;
  addToHistory: (movie: Movie) => void;
  updateSettings: (newSettings: Partial<AppSettings>) => void;
  videoStates: { [key: string]: VideoState };
  updateVideoState: (movieId: number | string, time: number, videoId?: string, duration?: number) => void;
  getVideoState: (movieId: number | string) => VideoState | undefined;
  clearVideoState: (movieId: number | string) => void;
  // Episode-specific progress tracking
  updateEpisodeProgress: (showId: number | string, season: number, episode: number, time: number, duration: number) => void;
  getEpisodeProgress: (showId: number | string, season: number, episode: number) => EpisodeProgress | undefined;
  getLastWatchedEpisode: (showId: number | string) => { season: number; episode: number; time: number } | undefined;
}

const GlobalContext = createContext<GlobalContextType | undefined>(undefined);

export const DEFAULT_SETTINGS: AppSettings = {
  autoplayPreviews: true,
  autoplayNextEpisode: true,
  showSubtitles: true,
  subtitleSize: 'small',
  subtitleColor: 'white',
  subtitleBackground: 'none', // Default Window OFF
  subtitleOpacity: 75,
  subtitleBlur: 0,
  subtitleFontFamily: 'monospace', // Consolas default
  subtitleEdgeStyle: 'drop-shadow', // Drop shadow effect
  subtitleWindowColor: 'black',
  displayLanguage: 'en-US',  // Default TMDB content language
  subtitleLanguage: 'en',    // Default subtitle language
};

export const GlobalProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // My List State
  const [myList, setMyList] = useState<Movie[]>(() => {
    try {
      const saved = localStorage.getItem('kinemora-list');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Continue Watching History State
  const [continueWatching, setContinueWatching] = useState<Movie[]>(() => {
    try {
      const saved = localStorage.getItem('kinemora-history');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Settings State
  const [settings, setSettings] = useState<AppSettings>(() => {
    try {
      const saved = localStorage.getItem('kinemora-settings');
      // Merge with defaults to ensure new fields (opacity/blur) exist if loading old localstorage
      return saved ? { ...DEFAULT_SETTINGS, ...JSON.parse(saved) } : DEFAULT_SETTINGS;
    } catch {
      return DEFAULT_SETTINGS;
    }
  });

  // Video Sync State (Persisted) - Stores movie progress
  const [videoStates, setVideoStates] = useState<{ [key: string]: VideoState }>(() => {
    try {
      const saved = localStorage.getItem('kinemora-video-states');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // Episode Progress State (Persisted) - keyed by "showId-SxEy"
  const [episodeProgress, setEpisodeProgress] = useState<{ [key: string]: EpisodeProgress }>(() => {
    try {
      const saved = localStorage.getItem('kinemora-episode-progress');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // Persist My List
  useEffect(() => {
    localStorage.setItem('kinemora-list', JSON.stringify(myList));
  }, [myList]);

  // Persist History
  useEffect(() => {
    localStorage.setItem('kinemora-history', JSON.stringify(continueWatching));
  }, [continueWatching]);

  // Persist Settings
  useEffect(() => {
    localStorage.setItem('kinemora-settings', JSON.stringify(settings));
  }, [settings]);

  // Persist Episode Progress
  useEffect(() => {
    localStorage.setItem('kinemora-episode-progress', JSON.stringify(episodeProgress));
  }, [episodeProgress]);

  // Persist Video States (Movies)
  useEffect(() => {
    localStorage.setItem('kinemora-video-states', JSON.stringify(videoStates));
  }, [videoStates]);

  // Sync API language with settings
  useEffect(() => {
    setApiLanguage(settings.displayLanguage);
  }, [settings.displayLanguage]);

  const toggleList = useCallback((movie: Movie) => {
    setMyList((prev) => {
      const exists = prev.find((m) => m.id === movie.id);
      if (exists) {
        return prev.filter((m) => m.id !== movie.id);
      }
      return [...prev, movie];
    });
  }, []);

  const addToHistory = useCallback((movie: Movie) => {
    setContinueWatching((prev) => {
      // Prevent redundant updates if the movie is already at the top
      if (prev.length > 0 && prev[0].id === movie.id) {
        return prev;
      }
      // Remove if exists to bubble it to the top
      const filtered = prev.filter((m) => m.id !== movie.id);
      // Add to front, limit to 20 items
      return [movie, ...filtered].slice(0, 20);
    });
  }, []);

  const updateSettings = useCallback((newSettings: Partial<AppSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  }, []);

  // Updated function to store both time and videoId
  // Updated function to store both time and videoId, and now duration
  const updateVideoState = useCallback((movieId: number | string, time: number, videoId?: string, duration?: number) => {
    setVideoStates(prev => ({
      ...prev,
      [movieId]: {
        time,
        videoId: videoId || prev[movieId]?.videoId,
        duration: duration || prev[movieId]?.duration
      }
    }));
  }, []);

  const getVideoState = useCallback((movieId: number | string): VideoState | undefined => {
    return videoStates[movieId];
  }, [videoStates]);

  const clearVideoState = useCallback((movieId: number | string) => {
    setVideoStates(prev => {
      const next = { ...prev };
      delete next[movieId];
      return next;
    });
  }, []);

  // Episode progress functions
  const updateEpisodeProgress = useCallback((showId: number | string, season: number, episode: number, time: number, duration: number) => {
    const key = `${showId}-S${season}E${episode}`;
    setEpisodeProgress(prev => ({
      ...prev,
      [key]: { time, duration, season, episode, updatedAt: Date.now() }
    }));
  }, []);

  const getEpisodeProgress = useCallback((showId: number | string, season: number, episode: number): EpisodeProgress | undefined => {
    const key = `${showId}-S${season}E${episode}`;
    return episodeProgress[key];
  }, [episodeProgress]);

  const getLastWatchedEpisode = useCallback((showId: number | string): { season: number; episode: number; time: number } | undefined => {
    // Find the most recently watched episode for this show
    const showPrefix = `${showId}-S`;
    let latest: { season: number; episode: number; time: number; updatedAt: number } | undefined;

    for (const [key, value] of Object.entries(episodeProgress)) {
      if (key.startsWith(showPrefix)) {
        if (!latest || value.updatedAt > latest.updatedAt) {
          latest = { season: value.season, episode: value.episode, time: value.time, updatedAt: value.updatedAt };
        }
      }
    }

    return latest ? { season: latest.season, episode: latest.episode, time: latest.time } : undefined;
  }, [episodeProgress]);

  return (
    <GlobalContext.Provider value={{
      myList,
      continueWatching,
      settings,
      toggleList,
      addToHistory,
      updateSettings,
      videoStates,
      updateVideoState,
      getVideoState,
      clearVideoState,
      updateEpisodeProgress,
      getEpisodeProgress,
      getLastWatchedEpisode
    }}>
      {children}
    </GlobalContext.Provider>
  );
};

export const useGlobalContext = () => {
  const context = useContext(GlobalContext);
  if (!context) {
    throw new Error('useGlobalContext must be used within a GlobalProvider');
  }
  return context;
};
