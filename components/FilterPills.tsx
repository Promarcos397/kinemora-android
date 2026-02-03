import React from 'react';

interface FilterPillsProps {
    filters: { id: string; label: string }[];
    activeFilter: string;
    onFilterChange: (id: string) => void;
}

/**
 * Horizontal filter pills like Netflix (Series, Films, Categories)
 */
export default function FilterPills({ filters, activeFilter, onFilterChange }: FilterPillsProps) {
    return (
        <div className="filter-pills">
            {filters.map((filter) => (
                <button
                    key={filter.id}
                    onClick={() => onFilterChange(filter.id)}
                    className={`filter-pill ${activeFilter === filter.id ? 'active' : ''}`}
                >
                    {filter.label}
                </button>
            ))}
        </div>
    );
}
