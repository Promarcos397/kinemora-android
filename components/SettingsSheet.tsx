import React from 'react';
import { X, Gear, Globe, Subtitles, Info } from '@phosphor-icons/react';
import { useNavigate } from 'react-router-dom';

interface SettingsSheetProps {
    isOpen: boolean;
    onClose: () => void;
}

/**
 * Settings Bottom Sheet - Opens from hamburger menu
 * Slides up from bottom with animation
 */
export default function SettingsSheet({ isOpen, onClose }: SettingsSheetProps) {
    const navigate = useNavigate();

    if (!isOpen) return null;

    const menuItems = [
        { icon: Gear, label: 'Settings', path: '/settings' },
        { icon: Globe, label: 'Language', path: '/settings/language' },
        { icon: Subtitles, label: 'Subtitles', path: '/settings/subtitles' },
        { icon: Info, label: 'About', path: '/settings/about' },
    ];

    const handleItemClick = (path: string) => {
        onClose();
        navigate(path);
    };

    return (
        <>
            {/* Backdrop */}
            <div
                className="settings-sheet-backdrop"
                onClick={onClose}
            />

            {/* Sheet */}
            <div className="settings-sheet">
                <div className="settings-sheet-handle" />

                <div className="settings-sheet-content">
                    {menuItems.map((item) => {
                        const Icon = item.icon;
                        return (
                            <button
                                key={item.path}
                                onClick={() => handleItemClick(item.path)}
                                className="settings-sheet-item"
                            >
                                <Icon size={24} />
                                <span>{item.label}</span>
                            </button>
                        );
                    })}
                </div>

                {/* Close button */}
                <button onClick={onClose} className="settings-sheet-close">
                    <X size={20} weight="bold" />
                </button>
            </div>
        </>
    );
}
