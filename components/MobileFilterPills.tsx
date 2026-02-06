import React, { useState } from 'react';
import { X, CaretDown } from '@phosphor-icons/react';

export type FilterType = 'none' | 'series' | 'films';

interface MobileFilterPillsProps {
    activeFilter: FilterType;
    selectedCategory?: string;
    onFilterChange: (filter: FilterType) => void;
    onCategoryClick: () => void;
}

/**
 * Netflix-style filter pills
 * - Less rounded (rounded-lg instead of rounded-full)
 * - Press animation (scale down when selected)
 * - Low opacity background when selected
 */
export default function MobileFilterPills({
    activeFilter,
    selectedCategory,
    onFilterChange,
    onCategoryClick
}: MobileFilterPillsProps) {

    const clearFilter = () => onFilterChange('none');

    // Common pill styles
    const basePillStyle = "px-4 py-1.5 rounded-lg text-sm font-semibold transition-all duration-150 active:scale-95";
    const selectedPillStyle = "bg-white/20 text-white border border-white/50";
    const unselectedPillStyle = "bg-transparent border border-white/40 text-white";

    return (
        <div className="flex items-center gap-2 px-4 py-3 overflow-x-auto scrollbar-hide">
            {/* Clear button - only when filter active */}
            {activeFilter !== 'none' && (
                <button
                    onClick={clearFilter}
                    className="w-8 h-8 rounded-full border border-white/50 flex items-center justify-center flex-shrink-0 active:scale-95 transition-transform"
                >
                    <X size={14} weight="bold" className="text-white" />
                </button>
            )}

            {/* Series Pill */}
            <button
                onClick={() => onFilterChange(activeFilter === 'series' ? 'none' : 'series')}
                className={`${basePillStyle} ${activeFilter === 'series' ? selectedPillStyle : unselectedPillStyle
                    } ${activeFilter === 'series' ? 'scale-95' : 'scale-100'}`}
            >
                Series
            </button>

            {/* Films Pill */}
            <button
                onClick={() => onFilterChange(activeFilter === 'films' ? 'none' : 'films')}
                className={`${basePillStyle} ${activeFilter === 'films' ? selectedPillStyle : unselectedPillStyle
                    } ${activeFilter === 'films' ? 'scale-95' : 'scale-100'}`}
            >
                Films
            </button>

            {/* Selected Category Pill - only show if category selected and no type filter */}
            {selectedCategory && selectedCategory !== 'All' && (
                <button
                    onClick={onCategoryClick}
                    className={`${basePillStyle} ${selectedPillStyle} scale-95`}
                >
                    {selectedCategory}
                </button>
            )}

            {/* Categories Dropdown */}
            <button
                onClick={onCategoryClick}
                className={`${basePillStyle} ${unselectedPillStyle} flex items-center gap-1 flex-shrink-0`}
            >
                Categories
                <CaretDown size={12} weight="bold" />
            </button>
        </div>
    );
}
