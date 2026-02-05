import React from 'react';
import { X, CaretDown } from '@phosphor-icons/react';

export type FilterType = 'none' | 'series' | 'films';

interface MobileFilterPillsProps {
    activeFilter: FilterType;
    onFilterChange: (filter: FilterType) => void;
    onCategoryClick: () => void;
    onBackClick?: () => void;
    showBackButton?: boolean;
}

/**
 * Netflix-style filter pills: transparent with white outline, 90% rounded
 * - X button clears active filter
 * - Series/Films toggle between states
 * - All Categories opens overlay
 */
export default function MobileFilterPills({
    activeFilter,
    onFilterChange,
    onCategoryClick,
    onBackClick,
    showBackButton = false
}: MobileFilterPillsProps) {

    const handlePillClick = (filter: FilterType) => {
        if (activeFilter === filter) {
            onFilterChange('none');
        } else {
            onFilterChange(filter);
        }
    };

    const pillBaseStyles = "px-4 py-1.5 text-sm font-medium transition-all duration-200 flex-shrink-0";
    const pillInactiveStyles = "border border-white/40 text-white bg-transparent rounded-[20px]";
    const pillActiveStyles = "bg-white text-black border border-white rounded-[20px]";

    return (
        <div className="fixed top-12 left-0 right-0 bg-[#0a0a0a] flex items-center gap-2.5 px-4 py-2.5 z-40 overflow-x-auto scrollbar-hide">
            {/* X button to clear filter - only show when filter is active */}
            {(showBackButton || activeFilter !== 'none') && (
                <button
                    onClick={onBackClick || (() => onFilterChange('none'))}
                    className="w-8 h-8 rounded-full border border-white/40 flex items-center justify-center flex-shrink-0 bg-transparent"
                >
                    <X size={16} weight="bold" className="text-white" />
                </button>
            )}

            {/* Series pill */}
            <button
                onClick={() => handlePillClick('series')}
                className={`${pillBaseStyles} ${activeFilter === 'series' ? pillActiveStyles : pillInactiveStyles}`}
            >
                Series
            </button>

            {/* Films pill */}
            <button
                onClick={() => handlePillClick('films')}
                className={`${pillBaseStyles} ${activeFilter === 'films' ? pillActiveStyles : pillInactiveStyles}`}
            >
                Films
            </button>

            {/* All Categories dropdown */}
            <button
                onClick={onCategoryClick}
                className={`${pillBaseStyles} ${pillInactiveStyles} flex items-center gap-1.5`}
            >
                All Categories
                <CaretDown size={14} weight="bold" />
            </button>
        </div>
    );
}
