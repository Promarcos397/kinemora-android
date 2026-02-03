import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { CaretRightIcon, CaretLeftIcon } from '@phosphor-icons/react';
import { Movie, RowProps } from '../types';
import MovieCard from './MovieCard';
import { fetchData } from '../services/api';

const Row: React.FC<RowProps> = ({ title, fetchUrl, data, onSelect }) => {
  const { t } = useTranslation();
  const [movies, setMovies] = useState<Movie[]>(data || []);
  const [initialLoad, setInitialLoad] = useState(!data && !!fetchUrl);
  const [isFetching, setIsFetching] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const rowRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  // Initial Data Load
  useEffect(() => {
    if (data) {
      setMovies(data);
      setInitialLoad(false);
      return;
    }

    if (fetchUrl) {
      // Reset state for new URL
      setMovies([]);
      setPage(1);
      setHasMore(true);
      setInitialLoad(true);

      const loadRowData = async () => {
        try {
          const results = await fetchData(fetchUrl);
          setMovies(results);
        } catch (error) {
          console.error("Error loading row data:", error);
        } finally {
          setInitialLoad(false);
        }
      };
      loadRowData();
    }
  }, [fetchUrl, data]);

  // Load More Function
  const loadMore = async () => {
    if (isFetching || !hasMore || !fetchUrl) return;

    setIsFetching(true);
    const nextPage = page + 1;

    // Construct URL with next page
    let url = fetchUrl;
    if (url.includes('page=')) {
      url = url.replace(/page=\d+/, `page=${nextPage}`);
    } else {
      const separator = url.includes('?') ? '&' : '?';
      url = `${url}${separator}page=${nextPage}`;
    }

    try {
      const newMovies = await fetchData(url);

      if (newMovies && newMovies.length > 0) {
        setMovies(prev => {
          const existingIds = new Set(prev.map(m => m.id));
          const uniqueNew = newMovies.filter(m => !existingIds.has(m.id));

          if (uniqueNew.length === 0) {
            setHasMore(false);
            return prev;
          }
          return [...prev, ...uniqueNew];
        });
        setPage(nextPage);
      } else {
        setHasMore(false);
      }
    } catch (error) {
      console.error("Error loading more pages:", error);
      setHasMore(false); // Stop trying on error
    } finally {
      setIsFetching(false);
    }
  };

  const handleScroll = () => {
    if (rowRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = rowRef.current;
      // Trigger load when within 1.5 screens of the end
      if (scrollLeft + clientWidth >= scrollWidth - (clientWidth * 1.5)) {
        loadMore();
      }
    }
  };

  const scroll = (direction: 'left' | 'right') => {
    if (rowRef.current) {
      const { clientWidth } = rowRef.current;
      const scrollAmount = clientWidth * 0.75;

      if (direction === 'left') {
        rowRef.current.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
      } else {
        rowRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
      }
    }
  };

  // Only hide if initial load is done and no movies found
  if (!initialLoad && movies.length === 0) return null;

  return (
    <div
      className="group relative my-4 md:my-6 space-y-2 z-10 hover:z-50 transition-all duration-300"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <h2 className="px-6 md:px-14 lg:px-20 text-lg sm:text-xl md:text-2xl font-bold text-[#e5e5e5] hover:text-white transition cursor-pointer flex items-center group/title w-fit tracking-wide">
        {title}
        <span className="text-xs text-cyan-500 ml-2 opacity-0 group-hover/title:opacity-100 transition-opacity duration-300 flex items-center font-semibold">
          {t('rows.exploreAll')} <CaretRightIcon size={14} className="ml-1" />
        </span>
      </h2>

      <div className="relative group/row">
        {/* Hover Hit Box */}
        <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-[101px] md:h-[135px] z-0 pointer-events-auto bg-transparent" />

        {/* Left Button */}
        <div
          className={`absolute top-1/2 -translate-y-1/2 left-0 z-50 h-[101px] md:h-[135px] w-10 md:w-16 lg:w-20 bg-black/50 hover:bg-black/70 cursor-pointer flex items-center justify-center transition-all duration-300 rounded-r-md pointer-events-none ${initialLoad ? 'opacity-0' : 'opacity-0 group-hover/row:opacity-100 group-hover/row:pointer-events-auto'}`}
          onClick={() => scroll('left')}
        >
          <CaretLeftIcon size={48} className="text-white hover:scale-125 transition drop-shadow-lg" />
        </div>

        {/* Scroll Container */}
        <div
          ref={rowRef}
          onScroll={handleScroll}
          className="flex overflow-x-scroll scrollbar-hide space-x-2 py-32 -my-32 px-6 md:px-14 lg:px-20 w-full pointer-events-auto relative z-10 scroll-smooth"
        >
          {initialLoad
            ? Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="relative flex-none w-[180px] h-[101px] md:w-[240px] md:h-[135px] bg-[#222] rounded-sm overflow-hidden border border-white/5 pointer-events-auto">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full animate-[shimmer_1.5s_infinite]" />
                <div className="absolute bottom-3 left-3 right-3 space-y-2 opacity-50">
                  <div className="h-2 bg-gray-600 rounded w-3/4"></div>
                  <div className="h-2 bg-gray-600 rounded w-1/2"></div>
                </div>
              </div>
            ))
            : movies.map((movie) => (movie.backdrop_path || movie.poster_path) && (
              <div key={movie.id} className="pointer-events-auto">
                <MovieCard movie={movie} onSelect={onSelect} />
              </div>
            ))
          }
          {/* Small loading indicator at the end */}
          {isFetching && !initialLoad && (
            <div className="flex-none w-[100px] flex items-center justify-center">
              <div className="w-6 h-6 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}
        </div>

        {/* Right Button */}
        <div
          className={`absolute top-1/2 -translate-y-1/2 right-0 z-50 h-[101px] md:h-[135px] w-10 md:w-16 lg:w-20 bg-black/50 hover:bg-black/70 cursor-pointer flex items-center justify-center transition-all duration-300 rounded-l-md pointer-events-none ${initialLoad ? 'opacity-0' : 'opacity-0 group-hover/row:opacity-100 group-hover/row:pointer-events-auto'}`}
          onClick={() => scroll('right')}
        >
          <CaretRightIcon size={48} className="text-white hover:scale-125 transition drop-shadow-lg" />
        </div>
      </div>
    </div>
  );
};

export default Row;