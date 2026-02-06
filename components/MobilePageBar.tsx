import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MagnifyingGlass, ArrowLeft } from '@phosphor-icons/react';

interface MobilePageBarProps {
    title: string;
    showBackArrow?: boolean;
    isFiltered?: boolean;  // When true, show filter mode (back arrow + title)
    onMenuClick?: () => void;
    scrollY?: number;  // For opacity transition
}

/**
 * Netflix-style page bar with scroll-based opacity
 */
export default function MobilePageBar({
    title,
    showBackArrow = false,
    isFiltered = false,
    onMenuClick,
    scrollY = 0
}: MobilePageBarProps) {
    const navigate = useNavigate();

    // Calculate opacity based on scroll position (0 at top, 1 at 200px)
    const opacity = Math.min(scrollY / 200, 1);

    return (
        <header
            className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 h-12"
            style={{
                backgroundColor: `rgba(10, 10, 10, ${opacity})`,
                transition: 'background-color 0.15s ease'
            }}
        >
            {/* Left side - Logo/Back + Title */}
            <div className="flex items-center gap-2">
                {showBackArrow || isFiltered ? (
                    <button onClick={() => navigate(-1)} className="p-1 -ml-1">
                        <ArrowLeft size={24} weight="bold" className="text-white" />
                    </button>
                ) : (
                    /* K Logo - Netflix style */
                    <div className="w-8 h-8 flex items-center justify-center">
                        <img
                            src="/resources/icon_k.svg"
                            alt="K"
                            className="w-7 h-7"
                            onError={(e) => {
                                // Fallback to styled text if SVG fails
                                e.currentTarget.style.display = 'none';
                                e.currentTarget.nextElementSibling?.classList.remove('hidden');
                            }}
                        />
                        <div
                            className="hidden w-7 h-7 rounded flex items-center justify-center"
                            style={{ backgroundColor: '#e50914' }}
                        >
                            <span className="text-white font-black text-sm">K</span>
                        </div>
                    </div>
                )}
                <span className="text-white font-semibold text-lg">{title}</span>
            </div>

            {/* Right side - Search icon only */}
            <div className="flex items-center gap-4">
                <button onClick={() => navigate('/search')} className="p-1">
                    <MagnifyingGlass size={24} weight="bold" className="text-white" />
                </button>
            </div>
        </header>
    );
}
