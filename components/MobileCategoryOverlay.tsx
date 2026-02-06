import React from 'react';
import { X } from '@phosphor-icons/react';

interface MobileCategoryOverlayProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (category: string) => void;
}

const CATEGORIES = [
    'Home',
    'My List',
    'Available for Download',
    'Action',
    'Anime',
    'Black Stories',
    'Blockbusters',
    'British',
    'Comedies',
    'Crime',
    'Critically Acclaimed',
    'Documentaries',
    'Dramas',
    'Fantasy',
    'Horror',
    'International',
    'Kids & Family',
    'LGBTQ+',
    'Music & Musicals',
    'Reality & Talk Shows',
    'Romance',
    'Sci-Fi',
    'Sports',
    'Stand-Up Comedy',
    'Thrillers',
    'True Crime',
];

/**
 * Netflix-style category overlay
 * - Full screen dark overlay with blur-through effect
 * - Centered list of categories
 * - White X button at bottom
 */
export default function MobileCategoryOverlay({
    isOpen,
    onClose,
    onSelect
}: MobileCategoryOverlayProps) {
    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-[100] flex flex-col"
            style={{ backgroundColor: 'rgba(0, 0, 0, 0.92)' }}
        >
            {/* Scrollable category list */}
            <div className="flex-1 overflow-y-auto py-16 px-4">
                <div className="flex flex-col items-center gap-4">
                    {CATEGORIES.map((category) => (
                        <button
                            key={category}
                            onClick={() => onSelect(category)}
                            className={`text-lg font-medium transition-colors ${category === 'Home' ? 'text-white' : 'text-gray-400 hover:text-white'
                                }`}
                        >
                            {category}
                        </button>
                    ))}
                </div>
            </div>

            {/* Close button at bottom */}
            <div className="pb-8 flex justify-center">
                <button
                    onClick={onClose}
                    className="w-12 h-12 rounded-full border-2 border-white/50 flex items-center justify-center"
                >
                    <X size={24} weight="bold" className="text-white" />
                </button>
            </div>
        </div>
    );
}
