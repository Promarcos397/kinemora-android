import React from 'react';
import { X, CaretDown } from '@phosphor-icons/react';

export type FilterType = 'none' | 'series' | 'films';

interface MobileFilterPillsProps {
    activeFilter: FilterType;
    onFilterChange: (filter: FilterType) => void;
    onCategoryClick: () => void;
}

/**
 * Netflix-style filter pills
 */
export default function MobileFilterPills({
    activeFilter,
    onFilterChange,
    onCategoryClick
}: MobileFilterPillsProps) {

    const clearFilter = () => onFilterChange('none');

    return (
        <div className="flex items-center gap-2 px-4 py-3">
            {activeFilter !== 'none' && (
                <button
                    onClick={clearFilter}
                    className="w-8 h-8 rounded-full border border-white/40 flex items-center justify-center"
                >
                    <X size={14} weight="bold" className="text-white" />
                </button>
            )}
            <button
                onClick={() => onFilterChange(activeFilter === 'series' ? 'none' : 'series')}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${activeFilter === 'series'
                        ? 'bg-white text-black'
                        : 'bg-transparent border border-white/40 text-white'
                    }`}
            >
                Series
            </button>
            <button
                onClick={() => onFilterChange(activeFilter === 'films' ? 'none' : 'films')}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${activeFilter === 'films'
                        ? 'bg-white text-black'
                        : 'bg-transparent border border-white/40 text-white'
                    }`}
            >
                Films
            </button>
            <button
                onClick={onCategoryClick}
                className="px-4 py-1.5 rounded-full text-sm font-medium bg-transparent border border-white/40 text-white flex items-center gap-1"
            >
                All Categories
                <CaretDown size={12} weight="bold" />
            </button>
        </div>
    );
}
