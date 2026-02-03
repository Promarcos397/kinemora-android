import React from 'react';
import { ArrowLeft, CaretDown } from '@phosphor-icons/react';

interface FilterPillsProps {
    showSeries?: boolean;
    showFilms?: boolean;
    showCategories?: boolean;
    activeFilter: 'none' | 'series' | 'films';
    showBack?: boolean;
    onFilterChange: (filter: 'none' | 'series' | 'films') => void;
    onCategoriesClick?: () => void;
    onBackClick?: () => void;
}

/**
 * Filter Pills - Transparent with outline, 90% rounded
 * NO "All" button - clicking opens overlay, back button to return
 */
export default function FilterPills({
    showSeries = true,
    showFilms = true,
    showCategories = true,
    activeFilter,
    showBack = false,
    onFilterChange,
    onCategoriesClick,
    onBackClick
}: FilterPillsProps) {
    return (
        <div className="filter-pills">
            {/* Back button when filter is active */}
            {showBack && (
                <button onClick={onBackClick} className="pills-back-btn">
                    <ArrowLeft size={20} weight="bold" />
                </button>
            )}

            {/* Series pill */}
            {showSeries && (
                <button
                    onClick={() => onFilterChange(activeFilter === 'series' ? 'none' : 'series')}
                    className={`filter-pill ${activeFilter === 'series' ? 'active' : ''}`}
                >
                    Series
                </button>
            )}

            {/* Films pill */}
            {showFilms && (
                <button
                    onClick={() => onFilterChange(activeFilter === 'films' ? 'none' : 'films')}
                    className={`filter-pill ${activeFilter === 'films' ? 'active' : ''}`}
                >
                    Films
                </button>
            )}

            {/* Categories dropdown */}
            {showCategories && (
                <button
                    onClick={onCategoriesClick}
                    className="filter-pill filter-pill-dropdown"
                >
                    Categories
                    <CaretDown size={14} />
                </button>
            )}
        </div>
    );
}
