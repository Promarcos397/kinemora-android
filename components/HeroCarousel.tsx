import React, { useState, useEffect, useRef } from 'react';
import { SpeakerSlashIcon, SpeakerHighIcon, ArrowCounterClockwise } from '@phosphor-icons/react';
import { useYouTubePlayer } from '../hooks/useYouTubePlayer';
import { useGlobalContext } from '../context/GlobalContext';
import { useNetworkQuality } from '../hooks/useNetworkQuality';
import axios from 'axios';
import HeroCarouselBackground from './HeroCarouselBackground';
import HeroCarouselContent from './HeroCarouselContent';
import { Movie, TMDBResponse } from '../types';
import { REQUESTS, LOGO_SIZE } from '../constants';
import { getMovieImages } from '../services/api';
import { searchTrailersWithFallback } from '../services/YouTubeService';

interface HeroCarouselProps {
  onSelect: (movie: Movie, time?: number, videoId?: string) => void;
  onPlay: (movie: Movie) => void;
  fetchUrl?: string;
  seekTime?: number; // Command to seek
  heroMovie?: Movie; // Optional: Override with explicit movie (e.g. Cloud Series)
}

const HeroCarousel: React.FC<HeroCarouselProps> = ({ onSelect, onPlay, fetchUrl, seekTime, heroMovie }) => {
  const { getVideoState, updateVideoState } = useGlobalContext();
  const networkQuality = useNetworkQuality();
  const [movie, setMovie] = useState<Movie | null>(null);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [isHovered, setIsHovered] = useState(false);

  // ... (Smart Video State omitted for brevity, referencing lines 29-41 in original if needed, but I am replacing top block)
  // Wait, I should not delete lines 29-41. I will only replace the top part and the useEffect.

  // Smart Video State
  const [trailerQueue, setTrailerQueue] = useState<string[]>([]);
  const [showVideo, setShowVideo] = useState(false);
  const [isVideoReady, setIsVideoReady] = useState(false);
  const [hasVideoEnded, setHasVideoEnded] = useState(false);
  const [replayCount, setReplayCount] = useState(0); // Forces fresh YouTube mount on replay
  const { isMuted, setIsMuted, playerRef } = useYouTubePlayer(false);
  const [videoDimensions, setVideoDimensions] = useState<{ width: string | number, height: string | number }>({ width: '120%', height: '120%' });

  // playerRef handled by hook
  const videoTimerRef = useRef<any>(null);
  const fadeIntervalRef = useRef<any>(null);

  // Daily Consistent Selection - same movie all day, changes at midnight
  const getDailyIndex = (results: Movie[], pageType: string): number => {
    const seed = new Date().toDateString() + "_" + pageType;
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
      hash = ((hash << 5) - hash) + seed.charCodeAt(i);
      hash |= 0; // Convert to 32bit integer
    }
    return Math.abs(hash) % results.length;
  };

  // Derive page type from fetchUrl
  const getPageType = (url: string): string => {
    if (url.includes('tv')) return 'tv';
    if (url.includes('movie')) return 'movie';
    return 'home';
  };

  // Fetch One Movie (Daily Consistent) OR Use Provided Hero Movie
  useEffect(() => {
    async function fetchData() {
      setLoading(true);

      // 1. Explicit Override (Cloud Library)
      if (heroMovie) {
        setMovie(heroMovie);
        setLoading(false);
        return;
      }

      // 2. Fetch from TMDB
      try {
        const url = fetchUrl || REQUESTS.fetchNetflixOriginals;
        const request = await axios.get<TMDBResponse>(url);
        const validResults = (request?.data?.results || []).filter(m => m.backdrop_path);

        if (validResults.length > 0) {
          // Use date-seeded index for daily consistent selection
          const pageType = getPageType(url);
          const dailyIndex = getDailyIndex(validResults, pageType);
          const selectedMovie = validResults[dailyIndex];
          setMovie(selectedMovie);

          // Prefetch stream for hero movie (user likely to click play)
          const api = (window as any).electron?.consumet;
          if (api?.prefetchStream && selectedMovie) {
            const mediaType = selectedMovie.media_type || (selectedMovie.title ? 'movie' : 'tv');
            const releaseDate = selectedMovie.release_date || selectedMovie.first_air_date;
            const year = releaseDate ? new Date(releaseDate).getFullYear() : undefined;
            console.log('[HeroCarousel] Prefetching stream for:', selectedMovie.title || selectedMovie.name);
            api.prefetchStream(selectedMovie.title || selectedMovie.name, mediaType, year, 1, 1);
          }
        }
        setLoading(false);
      } catch (error) {
        console.error("Failed to fetch hero content", error);
        setLoading(false);
      }
    }
    fetchData();
  }, [fetchUrl, heroMovie]);

  // Audio Fading Logic
  const fadeAudioIn = () => {
    try {
      const player = playerRef.current;
      if (!player || isMuted || typeof player.getVolume !== 'function') return;

      if (fadeIntervalRef.current) clearInterval(fadeIntervalRef.current);

      let vol = player.getVolume();
      if (vol > 100) vol = 100;

      fadeIntervalRef.current = setInterval(() => {
        try {
          if (vol < 100) {
            vol += 5;
            player.setVolume(vol);
          } else {
            clearInterval(fadeIntervalRef.current);
          }
        } catch (e) { clearInterval(fadeIntervalRef.current); }
      }, 20);
    } catch (e) { }
  };

  const fadeAudioOut = (callback?: () => void) => {
    try {
      const player = playerRef.current;
      if (!player || typeof player.getVolume !== 'function') {
        if (callback) callback();
        return;
      }

      if (fadeIntervalRef.current) clearInterval(fadeIntervalRef.current);

      let vol = player.getVolume();

      fadeIntervalRef.current = setInterval(() => {
        try {
          if (vol > 0) {
            vol -= 5;
            player.setVolume(vol);
          } else {
            clearInterval(fadeIntervalRef.current);
            if (callback) callback();
          }
        } catch (e) { clearInterval(fadeIntervalRef.current); if (callback) callback(); }
      }, 20);
    } catch (e) { if (callback) callback(); }
  };

  // Handle Resize for "Cover" Effect (No Black Bars)
  useEffect(() => {
    const handleResize = () => {
      const container = document.getElementById('hero-container');
      if (container) {
        const { clientWidth, clientHeight } = container;
        const targetAspect = 16 / 9; // YouTube aspect ratio
        const containerAspect = clientWidth / clientHeight;

        const ZOOM_FACTOR = 1.35; // Zoom to push Title Bar & Logo off-screen

        if (containerAspect > targetAspect) {
          // Container is wider than video (Panoramic) -> Match Width, Crop Vertical
          setVideoDimensions({ width: clientWidth * ZOOM_FACTOR, height: (clientWidth / targetAspect) * ZOOM_FACTOR });
        } else {
          // Container is taller than video (Portrait/Box) -> Match Height, Crop Horizontal
          setVideoDimensions({ width: (clientHeight * targetAspect) * ZOOM_FACTOR, height: clientHeight * ZOOM_FACTOR });
        }
      }
    };

    window.addEventListener('resize', handleResize);
    const timer = setTimeout(handleResize, 100); // Initial check
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(timer);
    };
  }, []);

  // Scroll Listener
  const [isOutOfView, setIsOutOfView] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Pause if scrolled down more than 400px
      const scrolled = window.scrollY > 400;
      setIsOutOfView(scrolled);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Re-detect hover after alt-tab (focus/visibility change)
  useEffect(() => {
    const heroContainer = document.getElementById('hero-container');

    const recheckHover = () => {
      if (!heroContainer) return;

      // Get mouse position from last known position or check if element is hovered
      const rect = heroContainer.getBoundingClientRect();
      const mouseX = (window as any).__lastMouseX ?? -1;
      const mouseY = (window as any).__lastMouseY ?? -1;

      const isMouseInside =
        mouseX >= rect.left &&
        mouseX <= rect.right &&
        mouseY >= rect.top &&
        mouseY <= rect.bottom;

      setIsHovered(isMouseInside);
    };

    // Track mouse position globally
    const trackMouse = (e: MouseEvent) => {
      (window as any).__lastMouseX = e.clientX;
      (window as any).__lastMouseY = e.clientY;
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        recheckHover();
      }
    };

    const handleFocus = () => {
      recheckHover();
    };

    window.addEventListener('mousemove', trackMouse);
    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('mousemove', trackMouse);
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  // Handle Play/Pause based on Scroll & Hover with Audio Fade
  useEffect(() => {
    if (playerRef.current && isVideoReady && showVideo) {
      // Play if: Visible (not scrolled out) AND Hovered
      const shouldPlay = !isOutOfView && isHovered;

      if (shouldPlay) {
        // Play sequence
        try {
          playerRef.current.playVideo();
          if (!isMuted) fadeAudioIn();
        } catch (e) { }
      } else {
        // Pause sequence with Fade
        if (!isMuted) {
          fadeAudioOut(() => {
            try { playerRef.current.pauseVideo(); } catch (e) { }
          });
        } else {
          try { playerRef.current.pauseVideo(); } catch (e) { }
        }
      }
    }
  }, [isOutOfView, isVideoReady, showVideo, isHovered, isMuted]);

  // Sync mute state


  // Handle Seek Command (Resume from InfoModal)
  useEffect(() => {
    if (seekTime && seekTime > 0 && playerRef.current) {
      try {
        playerRef.current.seekTo(seekTime, true);
        playerRef.current.playVideo();
      } catch (e) { }
    }
  }, [seekTime]);

  // Handle Movie Assets (Logo & Video)
  useEffect(() => {
    if (!movie) return;

    setLogoUrl(null);
    setShowVideo(false);
    setIsVideoReady(false);
    setTrailerQueue([]);
    clearTimeout(videoTimerRef.current);

    const fetchAssets = async () => {
      try {
        const mediaType = (movie.media_type || (movie.title ? 'movie' : 'tv')) as 'movie' | 'tv';

        // Fetch Logo
        try {
          const imageData = await getMovieImages(movie.id, mediaType);
          if (imageData && imageData.logos) {
            const logo = imageData.logos.find((l: any) => l.iso_639_1 === 'en' || l.iso_639_1 === null);
            if (logo) {
              setLogoUrl(`https://image.tmdb.org/t/p/${LOGO_SIZE}${logo.file_path}`);
            }
          }
        } catch (e) { }

        // Start Video Loading Timer
        videoTimerRef.current = setTimeout(async () => {
          if (window.scrollY < 100) {
            try {
              // Search YouTube with smart fallback queries
              const title = movie.title || movie.name;
              if (title) {
                // Extract year from release_date or first_air_date
                const releaseDate = movie.release_date || movie.first_air_date;
                const year = releaseDate ? releaseDate.split('-')[0] : undefined;

                // Get production company if available (often in movie data)
                const company = (movie as any).production_companies?.[0]?.name;

                const keys = await searchTrailersWithFallback({
                  title,
                  year,
                  company,
                  type: mediaType
                }, 5);

                console.log('[HeroCarousel] YouTube trailers:', keys.length, 'for', title, year ? `(${year})` : '');

                if (keys && keys.length > 0) {
                  setTrailerQueue(keys);
                  setShowVideo(true);
                }
              }
            } catch (e) { }
          }
        }, 1000);

      } catch (e) { }
    };
    fetchAssets();

    return () => clearTimeout(videoTimerRef.current);
  }, [movie]);

  if (loading) {
    return (
      <div className="relative h-[55vh] sm:h-[70vh] md:h-[85vh] w-full bg-[#141414] overflow-hidden">
        <div className="absolute inset-0 bg-[#1f1f1f] animate-pulse" />
      </div>
    );
  }

  if (!movie) return null;

  return (
    <div
      id="hero-container"
      className="relative h-[55vh] sm:h-[70vh] md:h-[85vh] w-full overflow-hidden group bg-black"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={(e) => {
        // Prevent pause if moving to App Bar (Top < 60px) or Scroll Bar (Right > width-20px)
        if (e.clientY < 60 || e.clientX > window.innerWidth - 20) return;
        setIsHovered(false);
      }}
    >
      <HeroCarouselBackground
        movie={movie}
        showVideo={showVideo}
        trailerQueue={trailerQueue}
        isVideoReady={isVideoReady}
        setIsVideoReady={setIsVideoReady}
        setTrailerQueue={setTrailerQueue}
        setShowVideo={setShowVideo}
        isMuted={isMuted}
        videoDimensions={videoDimensions}
        playerRef={playerRef}
        isHovered={isHovered}
        replayCount={replayCount}
        onSyncCheck={(videoId) => {
          const state = getVideoState(movie.id);
          return state?.videoId === videoId ? state.time : undefined;
        }}
        onVideoEnd={() => {
          // Hide video and show image with replay button
          setHasVideoEnded(true);
          setShowVideo(false);
          setIsVideoReady(false);
        }}
        youtubeQuality={networkQuality.quality}
      />

      <HeroCarouselContent
        movie={movie}
        logoUrl={logoUrl}
        isVideoReady={isVideoReady}
        onPlay={onPlay}
        onSelect={(m, time, videoId) => {
          // Save to context for bidirectional sync
          if (time !== undefined && videoId) {
            updateVideoState(m.id, time, videoId);
          }
          onSelect(m, time, videoId);
        }}
        trailerVideoId={trailerQueue[0]}
        currentTime={playerRef.current?.getCurrentTime() || 0}
        hasVideoEnded={hasVideoEnded}
      />

      {/* Controls (Mute/Replay & Rating) - Bottom Right */}
      <div className="absolute right-0 bottom-1/3 flex items-center space-x-4 z-30 pointer-events-auto pr-0">

        {/* Mute Button - Shows when video is playing */}
        {showVideo && isVideoReady && !hasVideoEnded && (
          <button
            onClick={() => setIsMuted(!isMuted)}
            className="w-8 h-8 md:w-10 md:h-10 border border-white rounded-full flex items-center justify-center bg-white/20 hover:bg-white/30 transition backdrop-blur-md group"
          >
            {isMuted ? <SpeakerSlashIcon size={20} className="text-white group-hover:scale-110 transition-transform" /> : <SpeakerHighIcon size={20} className="text-white group-hover:scale-110 transition-transform" />}
          </button>
        )}

        {/* Replay Button - Shows when video has ended (same style as mute) */}
        {hasVideoEnded && (
          <button
            onClick={() => {
              setReplayCount(c => c + 1); // Force fresh YouTube mount
              setHasVideoEnded(false);
              setShowVideo(true);
              setIsVideoReady(false);
            }}
            className="w-8 h-8 md:w-10 md:h-10 border border-white rounded-full flex items-center justify-center bg-white/20 hover:bg-white/30 transition backdrop-blur-md group"
            title="Replay Trailer"
          >
            <ArrowCounterClockwise size={20} className="text-white group-hover:scale-110 transition-transform" />
          </button>
        )}

        {/* PG Rating */}
        <div className="bg-gray-500/30 border-l-2 border-white pl-2 pr-4 py-1 backdrop-blur-md">
          <span className="text-white font-medium text-xs md:text-sm uppercase">
            {movie.adult ? '18+' : '13+'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default HeroCarousel;