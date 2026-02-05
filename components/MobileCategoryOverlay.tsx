import React, { useEffect, useRef } from 'react';
import { X } from '@phosphor-icons/react';

interface Category {
    id: string;
    label: string;
}

const CATEGORIES: Category[] = [
    { id: 'home', label: 'Home' },
    { id: 'mylist', label: 'My List' },
    { id: 'download', label: 'Available for Download' },
    { id: 'action', label: 'Action' },
    { id: 'anime', label: 'Anime' },
    { id: 'comedy', label: 'Comedies' },
    { id: 'crime', label: 'Crime' },
    { id: 'documentaries', label: 'Documentaries' },
    { id: 'drama', label: 'Dramas' },
    { id: 'fantasy', label: 'Fantasy' },
    { id: 'horror', label: 'Horror' },
    { id: 'international', label: 'International' },
    { id: 'kids', label: 'Kids & Family' },
    { id: 'mystery', label: 'Mystery' },
    { id: 'romance', label: 'Romance' },
    { id: 'scifi', label: 'Sci-Fi' },
    { id: 'thriller', label: 'Thrillers' },
];

interface MobileCategoryOverlayProps {
    isOpen: boolean;
    currentCategory: string;
    onSelect: (categoryId: string) => void;
    onClose: () => void;
}

/**
 * Netflix-style category overlay
 * - Black background with low opacity
 * - Centered scrollable vertical list
 * - Current category highlighted white, others gray
 * - White X button at bottom to close
 */
export default function MobileCategoryOverlay({
    isOpen,
    currentCategory,
    onSelect,
    onClose
}: MobileCategoryOverlayProps) {
    const listRef = useRef<HTMLDivElement>(null);

    // Prevent body scroll when overlay is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center animate-fadeIn">
            {/* Semi-transparent black background */}
            <div
                className="absolute inset-0 bg-black/90"
                onClick={onClose}
            />

            {/* Scrollable category list */}
            <div
                ref={listRef}
                className="relative z-10 max-h-[70vh] overflow-y-auto py-4 w-full"
                style={{
                    maskImage: 'linear-gradient(to bottom, transparent 0%, black 10%, black 90%, transparent 100%)',
                    WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 10%, black 90%, transparent 100%)'
                }}
            >
                {CATEGORIES.map((cat) => {
                    const isActive = currentCategory === cat.id;
                    return (
                        <button
                            key={cat.id}
                            onClick={() => {
                                onSelect(cat.id);
                                onClose();
                            }}
                            className={`block w-full py-3 text-center text-lg transition-all ${isActive
                                    ? 'text-white font-bold text-xl'
                                    : 'text-gray-500 font-normal'
                                }`}
                        >
                            {cat.label}
                        </button>
                    );
                })}
            </div>

            {/* Close button at bottom */}
            <button
                onClick={onClose}
                className="absolute bottom-8 w-12 h-12 bg-white rounded-full flex items-center justify-center z-10 shadow-lg"
            >
                <X size={24} weight="bold" className="text-black" />
            </button>
        </div>
    );
}
