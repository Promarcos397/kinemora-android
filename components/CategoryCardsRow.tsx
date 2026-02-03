import React from 'react';

interface CategoryCardsRowProps {
    onCategoryClick: (category: string) => void;
}

/**
 * Category Cards Row - Gradient colored cards in horizontal scroll
 * "Only on Netflix", "Hollywood Films", etc.
 */
export default function CategoryCardsRow({ onCategoryClick }: CategoryCardsRowProps) {
    const categories = [
        { id: 'netflix', label: 'Only on Netflix', className: 'category-card-netflix' },
        { id: 'hollywood', label: 'Hollywood Films', className: 'category-card-hollywood' },
        { id: 'international', label: 'International Films', className: 'category-card-international' },
        { id: 'tv', label: 'TV Shows', className: 'category-card-tv' },
        { id: 'blockbuster', label: 'Blockbusters', className: 'category-card-blockbuster' },
        { id: 'action', label: 'Action & Adventure', className: 'category-card-action' },
    ];

    return (
        <div className="category-cards">
            {categories.map((cat) => (
                <button
                    key={cat.id}
                    onClick={() => onCategoryClick(cat.id)}
                    className={`category-card ${cat.className}`}
                >
                    {cat.label}
                </button>
            ))}
        </div>
    );
}
