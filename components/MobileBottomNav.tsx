import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { House, MagnifyingGlass, Fire, ArrowDown, User } from '@phosphor-icons/react';

/**
 * Netflix-style bottom navigation from Figma
 * - 5 tabs: Home, Search, New & Hot, Downloads, My Netflix
 * - Icons with labels below
 * - Gray #808080 inactive, white active
 */
export default function MobileBottomNav() {
    const navigate = useNavigate();
    const location = useLocation();

    const tabs = [
        { id: 'home', label: 'Home', path: '/', icon: House },
        { id: 'search', label: 'Search', path: '/search', icon: MagnifyingGlass },
        { id: 'new-hot', label: 'New & Hot', path: '/new-hot', icon: Fire },
        { id: 'downloads', label: 'Downloads', path: '/downloads', icon: ArrowDown },
        { id: 'my-netflix', label: 'My Netflix', path: '/my-list', icon: User },
    ];

    const isActive = (path: string) => {
        if (path === '/') return location.pathname === '/' || location.pathname === '/home';
        return location.pathname.startsWith(path);
    };

    return (
        <nav
            className="fixed bottom-0 left-0 right-0 z-50"
            style={{ backgroundColor: '#000000' }}
        >
            {/* Top border */}
            <div className="absolute top-0 left-0 right-0 h-px bg-gray-800" />

            <div className="flex items-center justify-around py-2">
                {tabs.map((tab) => {
                    const active = isActive(tab.path);
                    const Icon = tab.icon;

                    return (
                        <button
                            key={tab.id}
                            onClick={() => navigate(tab.path)}
                            className="flex flex-col items-center gap-1 min-w-[56px]"
                        >
                            <Icon
                                size={20}
                                weight={active ? 'fill' : 'regular'}
                                className={active ? 'text-white' : 'text-gray-500'}
                            />
                            <span
                                className={`text-[9px] ${active ? 'text-white' : 'text-gray-500'}`}
                            >
                                {tab.label}
                            </span>
                        </button>
                    );
                })}
            </div>
        </nav>
    );
}
