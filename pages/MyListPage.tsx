import React, { useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useGlobalContext } from '../context/GlobalContext';
import { Movie } from '../types';
import MovieCard from '../components/MovieCard';
import { CaretDownIcon, PlaylistIcon } from '@phosphor-icons/react';

interface PageProps {
  onSelectMovie: (movie: Movie) => void;
}

type FilterType = 'all' | 'movie' | 'tv' | 'comic';
type SortType = 'date_added' | 'title' | 'rating' | 'release_date';

const MyListPage: React.FC<PageProps> = ({ onSelectMovie }) => {
  const { myList } = useGlobalContext();
  const { t } = useTranslation();
  const [filter, setFilter] = useState<FilterType>('all');
  const [sort, setSort] = useState<SortType>('date_added');

  const processedList = useMemo(() => {
    // Create a shallow copy to sort/filter
    let list = [...myList];

    // 1. Filter
    if (filter !== 'all') {
      list = list.filter(m => {
        const type = m.media_type || (m.title ? 'movie' : 'tv');

        // Group all book types under 'comic'
        if (filter === 'comic') {
          return ['series', 'comic', 'manga', 'local'].includes(type);
        }

        return type === filter;
      });
    }

    // 2. Sort
    switch (sort) {
      case 'title':
        list.sort((a, b) => {
          const titleA = a.title || a.name || '';
          const titleB = b.title || b.name || '';
          return titleA.localeCompare(titleB);
        });
        break;
      case 'rating':
        list.sort((a, b) => b.vote_average - a.vote_average);
        break;
      case 'release_date':
        list.sort((a, b) => {
          const dateA = new Date(a.release_date || a.first_air_date || 0).getTime();
          const dateB = new Date(b.release_date || b.first_air_date || 0).getTime();
          return dateB - dateA;
        });
        break;
      case 'date_added':
      default:
        list.reverse();
        break;
    }

    return list;
  }, [myList, filter, sort]);

  return (
    <div className="pt-24 px-6 md:px-14 lg:px-20 pb-12 min-h-screen">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <h2 className="text-2xl md:text-3xl font-bold text-white">{t('nav.myList')}</h2>

        {myList.length > 0 && (
          <div className="flex flex-wrap items-center gap-4 text-sm animate-fadeIn">
            {/* Filter Group */}
            <div className="flex bg-[#222] rounded p-1 border border-white/10">
              {(['all', 'movie', 'tv', 'comic'] as FilterType[]).map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-3 md:px-4 py-1.5 rounded transition capitalize text-xs md:text-sm ${filter === f ? 'bg-white text-black font-bold' : 'text-gray-400 hover:text-white'}`}
                >
                  {f === 'all' ? t('list.all') : f === 'movie' ? t('list.movies') : f === 'tv' ? t('list.shows') : 'Reads'}
                </button>
              ))}
            </div>

            {/* Sort Dropdown */}
            <div className="relative group">
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as SortType)}
                className="appearance-none bg-[#222] border border-white/10 text-white pl-3 md:pl-4 pr-8 md:pr-10 py-1.5 md:py-2 rounded focus:outline-none cursor-pointer hover:bg-[#333] transition text-xs md:text-sm"
              >
                <option value="date_added">{t('sort.dateAdded')}</option>
                <option value="release_date">{t('sort.releaseDate')}</option>
                <option value="rating">{t('sort.rating')}</option>
                <option value="title">{t('sort.title')}</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                <CaretDownIcon size={16} className="text-gray-400" />
              </div>
            </div>
          </div>
        )}
      </div>

      {myList.length > 0 ? (
        processedList.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-6 gap-y-10 animate-fadeIn">
            {processedList.map(movie => (
              <div key={movie.id} className="relative group">
                <MovieCard movie={movie} onSelect={onSelectMovie} isGrid={true} />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-gray-400 mt-20 text-center animate-fadeIn">
            <p>{t('list.noMatches')}</p>
            <button
              onClick={() => { setFilter('all'); setSort('date_added'); }}
              className="mt-4 text-white underline hover:text-gray-300"
            >
              {t('list.reset')}
            </button>
          </div>
        )
      ) : (
        <div className="flex flex-col items-center justify-center mt-32 text-gray-500 animate-fadeIn">
          <div className="w-20 h-20 rounded-full bg-[#222] flex items-center justify-center mb-6 border border-white/5">
            <PlaylistIcon size={40} className="text-gray-600" />
          </div>
          <p className="text-xl font-medium text-gray-300">{t('list.empty')}</p>
          <p className="text-sm mt-2 max-w-md text-center">{t('list.emptyDesc')}</p>
        </div>
      )}
    </div>
  );
};

export default MyListPage;