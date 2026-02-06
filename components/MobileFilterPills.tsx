import React from 'react';
import { CaretDown } from '@phosphor-icons/react';

export type FilterType = 'none' | 'tv' | 'movies';

interface MobileFilterPillsProps {
    activeFilter: FilterType;
    onFilterChange: (filter: FilterType) => void;
    onCategoryClick: () => void;
}

/**
 * Netflix-style filter pills from Figma
 * - TV Shows, Movies as toggle pills
 * - Categories dropdown
 * - Light border, transparent background
 */
export default function MobileFilterPills({
    activeFilter,
    onFilterChange,
    onCategoryClick
}: MobileFilterPillsProps) {

    return (
        <div className="flex items-center gap-2 px-4 py-2">
            {/* TV Shows Pill */}
            <button
                onClick={() => onFilterChange(activeFilter === 'tv' ? 'none' : 'tv')}
                className={`px-3 py-1 rounded-full text-[13px] transition-all border ${activeFilter === 'tv'
                        ? 'bg-white text-black border-white'
                        : 'bg-transparent text-white border-gray-600'
                    }`}
            >
                TV Shows
            </button>

            {/* Movies Pill */}
            <button
                onClick={() => onFilterChange(activeFilter === 'movies' ? 'none' : 'movies')}
                className={`px-3 py-1 rounded-full text-[13px] transition-all border ${activeFilter === 'movies'
                        ? 'bg-white text-black border-white'
                        : 'bg-transparent text-white border-gray-600'
                    }`}
            >
                Movies
            </button>

            {/* Categories Dropdown */}
            <button
                onClick={onCategoryClick}
                className="px-3 py-1 rounded-full text-[13px] bg-transparent text-white border border-gray-600 flex items-center gap-1"
            >
                Categories
                <CaretDown size={12} weight="bold" />
            </button>
        </div>
    );
}
