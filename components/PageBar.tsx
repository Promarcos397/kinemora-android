import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { MagnifyingGlass, List, ArrowLeft } from '@phosphor-icons/react';

interface PageBarProps {
    title?: string;
    showBack?: boolean;
    showSearch?: boolean;
    showMenu?: boolean;
    onMenuClick?: () => void;
    onBackClick?: () => void;
}

/**
 * PageBar - Top navigation bar for all pages
 * Shows: K logo + page title + search + hamburger menu
 * Or: Back arrow + title (in modals/settings)
 */
export default function PageBar({
    title = 'Home',
    showBack = false,
    showSearch = true,
    showMenu = true,
    onMenuClick,
    onBackClick
}: PageBarProps) {
    const navigate = useNavigate();

    const handleBack = () => {
        if (onBackClick) {
            onBackClick();
        } else {
            navigate(-1);
        }
    };

    const handleSearch = () => {
        navigate('/search');
    };

    return (
        <div className="page-bar">
            {/* Left side: Logo or Back button */}
            <div className="page-bar-left">
                {showBack ? (
                    <button onClick={handleBack} className="page-bar-btn">
                        <ArrowLeft size={24} weight="bold" />
                    </button>
                ) : (
                    <div className="page-bar-logo">
                        <img
                            src="/resources/icon_k.svg"
                            alt="Kinemora"
                            className="w-8 h-8"
                            onError={(e) => {
                                // Fallback to text if SVG fails
                                (e.target as HTMLImageElement).style.display = 'none';
                            }}
                        />
                        <span className="page-bar-fallback-logo">K</span>
                    </div>
                )}

                {/* Page title */}
                <h1 className="page-bar-title">{title}</h1>
            </div>

            {/* Right side: Search + Menu */}
            <div className="page-bar-right">
                {showSearch && (
                    <button onClick={handleSearch} className="page-bar-btn">
                        <MagnifyingGlass size={24} />
                    </button>
                )}
                {showMenu && (
                    <button onClick={onMenuClick} className="page-bar-btn">
                        <List size={24} />
                    </button>
                )}
            </div>
        </div>
    );
}
