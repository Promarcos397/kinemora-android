import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MagnifyingGlass, ArrowDown, List } from '@phosphor-icons/react';

interface MobilePageBarProps {
    userName?: string;
    showBackArrow?: boolean;
    title?: string;
}

/**
 * Netflix-style top bar from Figma
 * - Small Netflix N logo on left
 * - "For [Username]" greeting OR page title
 * - Search, download, menu icons on right
 */
export default function MobilePageBar({ userName = 'You', showBackArrow, title }: MobilePageBarProps) {
    const navigate = useNavigate();

    return (
        <header
            className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 py-3"
            style={{
                backgroundColor: 'rgba(0,0,0,0.9)',
                backdropFilter: 'blur(8px)'
            }}
        >
            {/* Left - Logo + Greeting */}
            <div className="flex items-center gap-3">
                {/* Netflix-style N logo */}
                <div className="w-6 h-6 flex items-center justify-center">
                    <svg viewBox="0 0 24 24" className="w-6 h-6">
                        <path
                            fill="#E50914"
                            d="M5.398 0v.006c3.028 8.556 5.37 15.175 8.348 23.596 2.344.058 4.85.398 4.854.398-2.8-7.924-5.923-16.747-8.487-24H5.398zm8.489 0v9.63L18.6 24H22V0h-4v9.63L13.887 0h-4z"
                        />
                    </svg>
                </div>

                {/* Title or For Username */}
                {title ? (
                    <span className="text-white font-medium text-base">{title}</span>
                ) : (
                    <span className="text-white font-medium text-base">For {userName}</span>
                )}
            </div>

            {/* Right - Icons */}
            <div className="flex items-center gap-5">
                <button onClick={() => navigate('/search')}>
                    <MagnifyingGlass size={22} weight="bold" className="text-white" />
                </button>
                <button>
                    <ArrowDown size={22} weight="bold" className="text-white" />
                </button>
                <button>
                    <List size={22} weight="bold" className="text-white" />
                </button>
            </div>
        </header>
    );
}
