import React from 'react';
import { X } from '@phosphor-icons/react';

interface CategoryOverlayProps {
    isOpen: boolean;
    onClose: () => void;
    categories: { id: string; label: string }[];
    activeCategory: string;
    onCategorySelect: (id: string) => void;
}

/**
 * Category Overlay - Centered vertical list
 * Black background with low opacity, X to close
 */
export default function CategoryOverlay({
    isOpen,
    onClose,
    categories,
    activeCategory,
    onCategorySelect
}: CategoryOverlayProps) {
    if (!isOpen) return null;

    const handleSelect = (id: string) => {
        onCategorySelect(id);
        onClose();
    };

    return (
        <div className="category-overlay">
            {/* Scrollable list */}
            <div className="category-overlay-list">
                {categories.map((cat) => (
                    <button
                        key={cat.id}
                        onClick={() => handleSelect(cat.id)}
                        className={`category-overlay-item ${activeCategory === cat.id ? 'active' : ''}`}
                    >
                        {cat.label}
                    </button>
                ))}
            </div>

            {/* Close button at bottom */}
            <button onClick={onClose} className="category-overlay-close">
                <X size={20} weight="bold" />
            </button>
        </div>
    );
}
