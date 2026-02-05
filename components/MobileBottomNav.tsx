import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { House, BookOpen, Fire, Heart } from '@phosphor-icons/react';

interface NavItem {
    path: string;
    label: string;
    icon: React.ElementType;
}

const NAV_ITEMS: NavItem[] = [
    { path: '/', label: 'Home', icon: House },
    { path: '/reads', label: 'Reads', icon: BookOpen },
    { path: '/new-hot', label: 'New & Hot', icon: Fire },
    { path: '/my-list', label: 'My List', icon: Heart },
];

/**
 * Netflix-style solid bottom navigation bar with 4 tabs
 * Background: #141414 (solid, not transparent)
 */
export default function MobileBottomNav() {
    const navigate = useNavigate();
    const location = useLocation();

    const isActive = (path: string) => {
        if (path === '/') {
            return location.pathname === '/' || location.pathname === '/home';
        }
        return location.pathname.startsWith(path);
    };

    return (
        <nav className="fixed bottom-0 left-0 right-0 h-14 bg-[#141414] flex items-center justify-around z-50 border-t border-white/10">
            {NAV_ITEMS.map((item) => {
                const active = isActive(item.path);
                const Icon = item.icon;

                return (
                    <button
                        key={item.path}
                        onClick={() => navigate(item.path)}
                        className="flex flex-col items-center justify-center gap-0.5 flex-1 py-1"
                    >
                        <Icon
                            size={24}
                            weight={active ? 'fill' : 'regular'}
                            className={active ? 'text-white' : 'text-gray-500'}
                        />
                        <span className={`text-[10px] ${active ? 'text-white' : 'text-gray-500'}`}>
                            {item.label}
                        </span>
                    </button>
                );
            })}
        </nav>
    );
}
