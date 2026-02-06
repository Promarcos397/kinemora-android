import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MagnifyingGlass, List, ArrowLeft } from '@phosphor-icons/react';

interface MobilePageBarProps {
    title: string;
    showBackArrow?: boolean;
    onMenuClick?: () => void;
}

/**
 * Netflix-style page bar
 */
export default function MobilePageBar({ title, showBackArrow = false, onMenuClick }: MobilePageBarProps) {
    const navigate = useNavigate();

    return (
        <header className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 h-12 bg-[#0a0a0a]">
            <div className="flex items-center gap-2">
                {showBackArrow ? (
                    <button onClick={() => navigate(-1)} className="p-1">
                        <ArrowLeft size={22} weight="bold" className="text-white" />
                    </button>
                ) : (
                    <div className="w-7 h-7 rounded flex items-center justify-center bg-[#e50914]">
                        <span className="text-white font-black text-sm">K</span>
                    </div>
                )}
                <span className="text-white font-semibold text-lg">{title}</span>
            </div>
            <div className="flex items-center gap-4">
                <button onClick={() => navigate('/search')} className="p-1">
                    <MagnifyingGlass size={22} weight="bold" className="text-white" />
                </button>
                <button onClick={onMenuClick} className="p-1">
                    <List size={22} weight="bold" className="text-white" />
                </button>
            </div>
        </header>
    );
}
