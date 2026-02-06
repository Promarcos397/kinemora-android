import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { House, BookOpen, Fire, Heart } from '@phosphor-icons/react';

/**
 * Netflix-style bottom navigation bar
 */
export default function MobileBottomNav() {
    const navigate = useNavigate();
    const location = useLocation();

    const tabs = [
        { id: 'home', label: 'Home', path: '/', icon: House },
        { id: 'reads', label: 'Reads', path: '/reads', icon: BookOpen },
        { id: 'new-hot', label: 'New & Hot', path: '/new-hot', icon: Fire },
        { id: 'my-list', label: 'My List', path: '/my-list', icon: Heart },
    ];

    const isActive = (path: string) => {
        if (path === '/') return location.pathname === '/' || location.pathname === '/home';
        return location.pathname.startsWith(path);
    };

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50 bg-[#121212]">
            <div className="absolute top-0 left-0 right-0 h-px bg-white/10" />
            <div className="flex items-center justify-around h-14 px-2">
                {tabs.map((tab) => {
                    const active = isActive(tab.path);
                    const Icon = tab.icon;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => navigate(tab.path)}
                            className="flex flex-col items-center justify-center gap-0.5 min-w-[64px] py-2"
                        >
                            <Icon
                                size={22}
                                weight={active ? 'fill' : 'regular'}
                                className={active ? 'text-white' : 'text-gray-400'}
                            />
                            <span className={`text-[10px] ${active ? 'text-white' : 'text-gray-400'}`}>
                                {tab.label}
                            </span>
                        </button>
                    );
                })}
            </div>
            <div className="h-[34px] flex items-center justify-center">
                <div className="w-32 h-1 bg-white/30 rounded-full" />
            </div>
        </nav>
    );
}
