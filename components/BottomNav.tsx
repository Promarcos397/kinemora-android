import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { House, BookOpen, Fire, Heart } from '@phosphor-icons/react';

/**
 * Bottom Navigation Bar - Solid background (NOT transparent)
 * Tabs: Home, Reads, New & Hot, My List
 */
export default function BottomNav() {
    const location = useLocation();
    const navigate = useNavigate();

    const tabs = [
        { id: 'home', path: '/', icon: House, label: 'Home' },
        { id: 'reads', path: '/reads', icon: BookOpen, label: 'Reads' },
        { id: 'new', path: '/new-popular', icon: Fire, label: 'New & Hot' },
        { id: 'mylist', path: '/my-list', icon: Heart, label: 'My List' },
    ];

    const getActiveTab = () => {
        const path = location.pathname;
        if (path === '/') return 'home';
        if (path.startsWith('/reads') || path.startsWith('/reader')) return 'reads';
        if (path.startsWith('/new-popular')) return 'new';
        if (path.startsWith('/my-list')) return 'mylist';
        return 'home';
    };

    const activeTab = getActiveTab();

    // Don't show on certain pages
    const hideOn = ['/watch', '/read/', '/search', '/settings'];
    if (hideOn.some(p => location.pathname.startsWith(p))) {
        return null;
    }

    return (
        <nav className="bottom-nav">
            {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                    <button
                        key={tab.id}
                        onClick={() => navigate(tab.path)}
                        className={`bottom-nav-item ${isActive ? 'active' : ''}`}
                    >
                        <Icon weight={isActive ? 'fill' : 'regular'} />
                        <span>{tab.label}</span>
                    </button>
                );
            })}
        </nav>
    );
}
