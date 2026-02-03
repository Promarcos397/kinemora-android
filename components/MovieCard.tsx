import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { SpeakerSlashIcon, SpeakerHighIcon, PlayIcon, CheckIcon, PlusIcon, ThumbsUpIcon, CaretDownIcon, BookOpenIcon } from '@phosphor-icons/react';
import { useYouTubePlayer } from '../hooks/useYouTubePlayer';
import YouTube from 'react-youtube';
import { Movie } from '../types';
import { useGlobalContext } from '../context/GlobalContext';
import { GENRES, LOGO_SIZE } from '../constants';
import { fetchTrailer, getMovieImages, prefetchStream } from '../services/api';

interface MovieCardProps {
  movie: Movie;
  onSelect: (movie: Movie, time?: number, videoId?: string) => void;
  isGrid?: boolean;
}

const MovieCard: React.FC<MovieCardProps> = ({ movie, onSelect, isGrid = false }) => {
  const { t } = useTranslation();
  const { myList, toggleList, getVideoState, updateVideoState, getEpisodeProgress } = useGlobalContext();
  const [isHovered, setIsHovered] = useState(false);
  const { trailerUrl, setTrailerUrl, isMuted, setIsMuted, playerRef } = useYouTubePlayer();
  const [logoUrl, setLogoUrl] = useState<string | null>(null);

  // 'center' | 'left' | 'right' - determines expansion direction
  const [hoverPosition, setHoverPosition] = useState<'center' | 'left' | 'right'>('center');

  const isAdded = myList.find(m => m.id === movie.id);
  const timerRef = useRef<any>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  // --- Dynamic Badge Logic ---
  const getBadgeInfo = () => {
    const dateStr = movie.release_date || movie.first_air_date;
    if (!dateStr) return null;

    const releaseDate = new Date(dateStr);
    const now = new Date();
    // Calculate difference in days
    const diffTime = releaseDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    // Future Release
    if (diffDays > 0) {
      return { text: t('badges.comingSoon'), type: "upcoming" };
    }

    // Released within last 60 days
    if (diffDays >= -60) {
      return {
        text: movie.media_type === 'tv' ? t('badges.newEpisodes') : t('badges.recentlyAdded'),
        type: "new"
      };
    }

    // High Rating (Top Rated)
    if (movie.vote_average >= 8.0) {
      return { text: t('badges.topRated'), type: "top" };
    }

    return null;
  };

  const badge = getBadgeInfo();

  // Fetch Logo on mount
  useEffect(() => {
    let isMounted = true;
    const fetchLogo = async () => {
      try {
        const mediaType = (movie.media_type || (movie.title ? 'movie' : 'tv')) as 'movie' | 'tv';
        const data = await getMovieImages(String(movie.id), mediaType);

        if (!isMounted) return;

        if (data && data.logos) {
          const logo = data.logos.find((l: any) => l.iso_639_1 === 'en' || l.iso_639_1 === null);
          if (logo) {
            setLogoUrl(`https://image.tmdb.org/t/p/${LOGO_SIZE}${logo.file_path}`);
          }
        }
      } catch (e) { }
    };

    fetchLogo();
    return () => { isMounted = false; };
  }, [movie.id, movie.media_type, movie.title]);




  // Prefetch stream on hover
  const handleMouseEnter = (e: React.MouseEvent) => {
    // Determine screen position for smart popup alignment
    if (cardRef.current) {
      const rect = cardRef.current.getBoundingClientRect();
      const buffer = 150;
      if (rect.left < buffer) setHoverPosition('left');
      else if (window.innerWidth - rect.right < buffer) setHoverPosition('right');
      else setHoverPosition('center');
    }

    // Set timer for hover effect (existing logic)
    timerRef.current = setTimeout(() => {
      setIsHovered(true);

      // Request stream prefetch when user dwells on the card
      const mediaType = (movie.media_type || (movie.title ? 'movie' : 'tv')) as 'movie' | 'tv';
      const releaseDate = movie.release_date || movie.first_air_date;
      const year = releaseDate ? new Date(releaseDate).getFullYear() : undefined;

      if (year) {
        console.log(`[MovieCard] Prefetching stream for: ${movie.title || movie.name}`);
        // For TV shows, we ideally want to prefetch the resume episode, but for hover, S1E1 is safe default
        // or we could check getEpisodeProgress/resumeContext logic here if cheap.
        // For now, defaulting to 1,1 is standard behavior for "first play".
        prefetchStream(
          movie.title || movie.name || '',
          year,
          String(movie.id),
          mediaType,
          1,
          1
        );
      }
    }, 500); // 500ms dwell time
  };

  const handleMouseLeave = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    setIsHovered(false);
    setTrailerUrl(null);
    setIsMuted(true);
  };


  const getGenreNames = () => {
    if (!movie.genre_ids) return [];
    return movie.genre_ids.map(id => t(`genres.${id}`, { defaultValue: GENRES[id] })).filter(Boolean).slice(0, 3);
  };

  // Dynamic Class Calculation
  const getPositionClasses = () => {
    switch (hoverPosition) {
      case 'left': return 'left-0 origin-left';
      case 'right': return 'right-0 origin-right';
      default: return 'left-1/2 -ml-[150px] md:-ml-[180px] origin-center';
    }
  };

  // Handler that saves state to context before opening modal
  const handleOpenModal = () => {
    const currentTime = playerRef.current?.getCurrentTime() || 0;
    if (trailerUrl) {
      updateVideoState(movie.id, currentTime, trailerUrl);
    }
    onSelect(movie, currentTime, trailerUrl);
  };

  const isBook = ['series', 'comic', 'manga', 'local'].includes(movie.media_type || '');

  // Pre-calculate Image Source safe for Comics
  const imageSrc = (movie.poster_path?.startsWith('http') || movie.backdrop_path?.startsWith('http') || movie.poster_path?.startsWith('comic://') || movie.backdrop_path?.startsWith('comic://'))
    ? (movie.backdrop_path || movie.poster_path)
    : `https://image.tmdb.org/t/p/w500${movie.backdrop_path || movie.poster_path}`;

  return (
    <div
      ref={cardRef}
      className={`relative transition-all duration-300 z-10 
        ${isGrid
          ? 'w-full aspect-video cursor-pointer hover:z-50'
          : 'flex-none w-[180px] h-[101px] md:w-[240px] md:h-[135px] cursor-pointer hover:z-[40]'
        }`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onClick={() => onSelect(movie)}
    >
      {/* Base Image */}
      <img
        src={imageSrc}
        className={`w-full h-full object-cover ${isBook ? 'object-[50%_30%]' : 'object-center'} ${isGrid ? 'rounded-sm' : 'rounded-sm'}`}
        alt={movie.name || movie.title}
        loading="lazy"
      />

      {/* Progress Bar for Continue Watching */}
      {(() => {
        let progress = 0;
        const mediaType = movie.media_type || (movie.title ? 'movie' : 'tv');

        if (mediaType === 'tv') {
          // Logic: Check if there's any progress on the last watched episode
          // We'd need to know *which* episode was last watched.
          // GlobalContext doesn't easily expose "last watched episode" for list rendering efficiently without checking all.
          // But we can check if *any* episode has progress? No.
          // Alternative: Use the "continueWatching" list progress if available?
          // Actually, the easiest way for TV is checking localStorage 'kinemora-last-watched-{id}' for S/E, then getEpisodeProgress.
          try {
            const saved = localStorage.getItem(`kinemora-last-watched-${movie.id}`);
            if (saved) {
              const { season, episode } = JSON.parse(saved);
              const epProgress = getEpisodeProgress(String(movie.id), season, episode);
              if (epProgress && epProgress.duration > 0) {
                progress = (epProgress.time / epProgress.duration) * 100;
              }
            }
          } catch (e) { }
        } else {
          const state = getVideoState(movie.id);
          if (state && state.duration > 0) {
            progress = (state.time / state.duration) * 100;
          }
        }

        // Show if started (>0%) and not fully finished/credits (<95%)
        if (progress > 0 && progress < 95) {
          return (
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-600/60 z-30">
              <div className="h-full bg-[#E50914]" style={{ width: `${progress}%` }} />
            </div>
          );
        }
        return null;
      })()}

      {/* Base Title Overlay (Show when not hovering OR if in grid mode) */}
      {!isHovered && (
        <>
          <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex items-end justify-center pb-2 px-2 opacity-100 transition-opacity duration-300">
            {logoUrl ? (
              <img src={logoUrl} alt={movie.title || movie.name} className="h-full max-h-8 w-auto object-contain drop-shadow-md" />
            ) : (
              <h3 className={`text-white font-leaner text-center tracking-wide leading-tight drop-shadow-md line-clamp-3 mb-2 w-full px-1 ${isBook ? 'text-2xl' : 'text-xl'}`}>
                {movie.title || movie.name}
              </h3>
            )}
          </div>

          {/* Dynamic Badges on Base Card - hide for comics */}
          {badge && !isBook && (
            <div className={`absolute top-2 left-2 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-sm shadow-sm 
                    ${badge.type === 'upcoming'
                ? 'bg-black/60 border border-white/40 backdrop-blur-sm' // Coming Soon Style
                : 'bg-[#E50914]' // New/Top Rated Style (Red)
              }`}>
              {badge.text}
            </div>
          )}

          {/* Comic Badge - low opacity black bg + white text + white outline */}
          {isBook && (
            <div className="absolute top-2 left-2 bg-black/50 border border-white/40 text-white px-2 py-0.5 text-[10px] font-medium uppercase backdrop-blur-sm">
              Comic
            </div>
          )}
        </>
      )}

      {/* Hover Popup - Active on all views */}
      {isHovered && (
        <div
          className={`absolute top-[-70px] md:top-[-100px] w-[300px] md:w-[360px] bg-[#141414] rounded-sm shadow-black/80 shadow-2xl z-[40] animate-scaleIn overflow-hidden ring-1 ring-zinc-800 ${getPositionClasses()}`}
          onClick={(e) => e.stopPropagation()} // Prevent click from bubbling to base card
        >
          {/* Media Container */}
          <div className="relative h-[170px] md:h-[200px] bg-[#141414] overflow-hidden" onClick={handleOpenModal}>
            {(trailerUrl && !isBook) ? (
              <div className="absolute top-[40%] left-1/2 w-[200%] h-[200%] -translate-x-1/2 -translate-y-1/2 pointer-events-none">
                <YouTube
                  videoId={trailerUrl}
                  opts={{
                    height: '100%',
                    width: '100%',
                    playerVars: {
                      autoplay: 1,
                      controls: 0,
                      modestbranding: 1,
                      loop: 1,
                      playlist: trailerUrl,
                      disablekb: 1,
                      fs: 0,
                      rel: 0,
                      iv_load_policy: 3,
                      cc_load_policy: 0,
                      // No start offset - seamless playback
                    }
                  }}
                  onReady={(e) => {
                    playerRef.current = e.target;
                    if (isMuted) {
                      e.target.mute();
                    } else {
                      e.target.unMute();
                    }

                    // Seamless sync from Context - only seek if same video
                    const savedState = getVideoState(movie.id);
                    if (savedState && savedState.time > 0 && savedState.videoId === trailerUrl) {
                      e.target.seekTo(savedState.time, true);
                    }
                  }}
                  onEnd={(e) => {
                    // Seamless loop from start
                    e.target.seekTo(0);
                    e.target.playVideo();
                  }}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <img
                src={imageSrc}
                className={`w-full h-full object-cover ${isBook ? 'object-[50%_30%]' : 'object-center'}`}
                alt="preview"
              />
            )}

            {/* Mute Button - Hide for books */}
            {trailerUrl && !isBook && (
              <button
                onClick={(e) => { e.stopPropagation(); setIsMuted(!isMuted); }}
                className="absolute bottom-4 right-4 w-8 h-8 rounded-full border border-white/30 bg-black/50 hover:bg-white/10 flex items-center justify-center transition"
              >
                {isMuted ? <SpeakerSlashIcon size={12} className="text-white" /> : <SpeakerHighIcon size={12} className="text-white" />}
              </button>
            )}

            <div className="absolute inset-x-0 bottom-0 h-10 bg-gradient-to-t from-[#141414] to-transparent" />

            <div className="absolute bottom-3 left-4 right-12 pointer-events-none">
              {logoUrl ? (
                <img src={logoUrl} alt="title logo" className="h-10 w-auto object-contain origin-bottom-left drop-shadow-md" />
              ) : (
                <h4 className="text-white font-leaner text-5xl line-clamp-2 drop-shadow-md tracking-wide text-center mb-2 leading-none">{movie.title || movie.name}</h4>
              )}
            </div>
          </div>

          {/* Info Section */}
          <div className="p-4 space-y-3 bg-[#141414]">
            {/* Action Buttons Row */}
            <div className="flex justify-between items-center">
              <div className="flex space-x-2">
                {/* Play/Read Button */}
                <button
                  onClick={handleOpenModal}
                  className="bg-white text-black rounded-full w-8 h-8 md:w-10 md:h-10 flex items-center justify-center hover:bg-neutral-200 transition"
                  title={isBook ? "Read Now" : "Play"}
                >
                  {isBook ? <BookOpenIcon size={24} weight="fill" /> : <PlayIcon size={30} weight="fill" className="ml-0.5" />}
                </button>
                {/* Add to List - Outline */}
                <button
                  onClick={(e) => { e.stopPropagation(); toggleList(movie); }}
                  className="border-2 border-gray-400 bg-[#2a2a2a]/60 rounded-full w-8 h-8 md:w-10 md:h-10 flex items-center justify-center text-gray-300 hover:border-white hover:text-white transition group"
                  title="Add to My List"
                >
                  <span className="text-lg md:text-xl group-hover:scale-100 flex items-center">{isAdded ? <CheckIcon size={20} /> : <PlusIcon size={20} />}</span>
                </button>
              </div>

              {/* More Info - Chevron Down */}
              <button
                onClick={handleOpenModal}
                className="border-2 border-gray-400 bg-[#2a2a2a]/60 rounded-full w-8 h-8 md:w-10 md:h-10 flex items-center justify-center hover:border-white transition text-gray-300 hover:text-white ml-auto"
                title="More Info"
              >
                <CaretDownIcon size={24} />
              </button>
            </div>

            {/* Metadata Row */}
            <div className="flex items-center flex-wrap gap-2 text-sm font-medium">
              {!isBook && <span className="text-[#46d369] font-bold">{t('common.match', { score: (movie.vote_average * 10).toFixed(0) })}</span>}

              {/* Age Rating */}
              {movie.adult ? (
                <span className="flex items-center justify-center w-6 h-6 rounded-full bg-[#E50914] text-white text-[10px] font-bold">
                  18
                </span>
              ) : (
                <span className="border border-gray-400 text-gray-400 px-1.5 py-[1px] text-xs uppercase">
                  13+
                </span>
              )}

              {/* Duration / Seasons / Type */}
              <span className="text-gray-400 text-xs">
                {isBook ? (movie.media_type === 'series' ? 'Series' : 'Comic') : (movie.media_type === 'tv' ? t('common.series') : t('common.movie'))}
              </span>

              {!isBook && <span className="border border-gray-500 text-gray-400 px-1 py-[0.5px] text-[9px] rounded-[2px] h-fit flex items-center">HD</span>}
            </div>

            {/* Genres Row */}
            <div className="flex flex-wrap items-center gap-x-2 text-xs font-medium text-white">
              {getGenreNames().map((genre, idx) => (
                <div key={idx} className="flex items-center">
                  <span className="text-gray-300 hover:text-white cursor-default">{genre}</span>
                  {idx < getGenreNames().length - 1 && <span className="text-gray-600 ml-2 text-[8px]">•</span>}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MovieCard;