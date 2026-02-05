import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, MagnifyingGlass, List } from '@phosphor-icons/react';

interface MobilePageBarProps {
    title: string;
    showBackButton?: boolean;
    showLogo?: boolean;
    onBackClick?: () => void;
    onMenuClick?: () => void;
}

/**
 * Netflix-style page bar with K logo, title, search, and hamburger menu
 */
export default function MobilePageBar({
    title,
    showBackButton = false,
    showLogo = true,
    onBackClick,
    onMenuClick
}: MobilePageBarProps) {
    const navigate = useNavigate();

    const handleBack = () => {
        if (onBackClick) {
            onBackClick();
        } else {
            navigate(-1);
        }
    };

    return (
        <div className="fixed top-0 left-0 right-0 h-12 bg-[#0a0a0a] flex items-center justify-between px-4 z-50">
            {/* Left side: Logo or Back arrow */}
            <div className="flex items-center gap-2">
                {showBackButton ? (
                    <button onClick={handleBack} className="p-1 -ml-1">
                        <ArrowLeft size={24} weight="bold" />
                    </button>
                ) : showLogo ? (
                    <div className="w-7 h-7 bg-[#e50914] rounded flex items-center justify-center">
                        <span className="text-white font-black text-lg leading-none">K</span>
                    </div>
                ) : null}

                {/* Page title */}
                <span className="text-white text-lg font-bold">{title}</span>
            </div>

            {/* Right side: Search and Menu */}
            <div className="flex items-center gap-1">
                <button
                    onClick={() => navigate('/search')}
                    className="p-2 text-white"
                >
                    <MagnifyingGlass size={22} weight="bold" />
                </button>
                <button
                    onClick={onMenuClick}
                    className="p-2 text-white"
                >
                    <List size={22} weight="bold" />
                </button>
            </div>
        </div>
    );
}
