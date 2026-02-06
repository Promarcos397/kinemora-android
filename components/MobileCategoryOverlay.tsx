import React from 'react';
import { X } from '@phosphor-icons/react';

// Categories data - organized by type
const SERIES_CATEGORIES = [
    'Action & Adventure', 'Anime', 'British', 'Comedies', 'Crime',
    'Documentaries', 'Dramas', 'International', 'Kids', 'Korean',
    'Reality', 'Romance', 'Sci-Fi & Fantasy', 'Thrillers', 'True Crime'
];

const FILMS_CATEGORIES = [
    'Action', 'Animation', 'Comedy', 'Crime', 'Documentary',
    'Drama', 'Family', 'Fantasy', 'Horror', 'International',
    'Romance', 'Sci-Fi', 'Thrillers', 'War', 'Western'
];

const ALL_CATEGORIES = [
    ...new Set([...SERIES_CATEGORIES, ...FILMS_CATEGORIES])
].sort();

interface MobileCategoryOverlayProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (category: string) => void;
    filterType?: 'none' | 'series' | 'films';
    selectedCategory?: string;
}

/**
 * Netflix-style category overlay
 * - Shows relative categories based on current filter
 * - Bold white for selected, grayed-out for others
 * - No download options
 * - Scrollable with white X button
 */
export default function MobileCategoryOverlay({
    isOpen,
    onClose,
    onSelect,
    filterType = 'none',
    selectedCategory = ''
}: MobileCategoryOverlayProps) {
    if (!isOpen) return null;

    // Get categories based on current filter
    const getCategories = () => {
        switch (filterType) {
            case 'series':
                return ['All Categories', ...SERIES_CATEGORIES];
            case 'films':
                return ['All Categories', ...FILMS_CATEGORIES];
            default:
                return ['All Categories', ...ALL_CATEGORIES];
        }
    };

    const categories = getCategories();

    return (
        <div
            className="fixed inset-0 z-[100] flex flex-col"
            style={{ backgroundColor: 'rgba(0, 0, 0, 0.95)' }}
        >
            {/* Scrollable category list */}
            <div className="flex-1 overflow-y-auto py-16 px-4">
                <div className="flex flex-col items-center gap-5">
                    {categories.map((category) => {
                        const isSelected = category === selectedCategory ||
                            (category === 'All Categories' && !selectedCategory);

                        return (
                            <button
                                key={category}
                                onClick={() => {
                                    onSelect(category === 'All Categories' ? '' : category);
                                    onClose();
                                }}
                                className={`text-lg transition-colors ${isSelected
                                        ? 'text-white font-bold'
                                        : 'text-gray-400 font-normal hover:text-gray-200'
                                    }`}
                                style={{
                                    fontFamily: "'Netflix Sans', 'Helvetica Neue', Helvetica, Arial, sans-serif"
                                }}
                            >
                                {category}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Close button at bottom - white */}
            <div className="pb-8 flex justify-center">
                <button
                    onClick={onClose}
                    className="w-14 h-14 rounded-full border-2 border-white flex items-center justify-center bg-transparent active:scale-95 transition-transform"
                >
                    <X size={28} weight="bold" className="text-white" />
                </button>
            </div>
        </div>
    );
}

// Export categories for use in other components
export { SERIES_CATEGORIES, FILMS_CATEGORIES, ALL_CATEGORIES };
