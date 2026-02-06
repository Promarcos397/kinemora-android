import React from 'react';

interface RecommendedGridProps {
    onCategoryClick: (category: string) => void;
}

// Gradient categories with colors
const RECOMMENDED_ITEMS = [
    { label: 'Hollywood Films', gradient: 'linear-gradient(135deg, #ffb347 0%, #ff6961 100%)' },
    { label: 'Binge-Worthy', gradient: 'linear-gradient(135deg, #00b4d8 0%, #023e8a 100%)' },
    { label: 'International', gradient: 'linear-gradient(135deg, #9d4edd 0%, #240046 100%)' },
    { label: 'Only on Kinemora', gradient: 'linear-gradient(135deg, #e63946 0%, #6a040f 100%)' },
    { label: 'Award Winners', gradient: 'linear-gradient(135deg, #ffd700 0%, #b8860b 100%)' },
    { label: '90 Minute Films', gradient: 'linear-gradient(135deg, #06d6a0 0%, #118ab2 100%)' },
    { label: 'Critically Acclaimed', gradient: 'linear-gradient(135deg, #ff758f 0%, #9b5de5 100%)' },
    { label: 'Feel-Good', gradient: 'linear-gradient(135deg, #f77f00 0%, #d62828 100%)' },
];

/**
 * Netflix-style recommended grid
 * - 2 rows x 4 columns
 * - Gradient colored buttons
 * - Subtle calm colors
 */
export default function RecommendedGrid({ onCategoryClick }: RecommendedGridProps) {
    return (
        <div className="px-4 py-4">
            <h3 className="text-white/90 text-sm font-medium mb-3">Recommended for you</h3>
            <div className="grid grid-cols-4 gap-2">
                {RECOMMENDED_ITEMS.map((item) => (
                    <button
                        key={item.label}
                        onClick={() => onCategoryClick(item.label)}
                        className="aspect-[1.2/1] rounded-md flex items-center justify-center p-2 text-center active:scale-95 transition-transform"
                        style={{ background: item.gradient }}
                    >
                        <span className="text-white text-[10px] font-semibold leading-tight">
                            {item.label}
                        </span>
                    </button>
                ))}
            </div>
        </div>
    );
}
