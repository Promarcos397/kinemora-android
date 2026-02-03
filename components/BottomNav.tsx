import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { House, FilmStrip, Fire, BookOpen, User } from '@phosphor-icons/react';

interface BottomNavProps {
    className?: string;
}

/**
 * Mobile Bottom Navigation Bar (Netflix-style)
 * Replaces desktop top navbar on mobile
 */
export default function BottomNav({ className }: BottomNavProps) {
    const location = useLocation();
    const navigate = useNavigate();

    const tabs = [
        { id: 'home', path: '/', icon: House, label: 'Home' },
        { id: 'movies', path: '/movies', icon: FilmStrip, label: 'Movies' },
        { id: 'new', path: '/new-popular', icon: Fire, label: 'New & Hot' },
        { id: 'reads', path: '/reads', icon: BookOpen, label: 'Reads' },
        { id: 'mylist', path: '/my-list', icon: User, label: 'My List' },
    ];

    const getActiveTab = () => {
        const path = location.pathname;
        if (path === '/') return 'home';
        if (path.startsWith('/movies')) return 'movies';
        if (path.startsWith('/new-popular')) return 'new';
        if (path.startsWith('/reads') || path.startsWith('/reader')) return 'reads';
        if (path.startsWith('/my-list')) return 'mylist';
        return 'home';
    };

    const activeTab = getActiveTab();

    return (
        <nav className={`bottom-nav ${className || ''}`}>
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
