import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Gear, Globe, Subtitles, Info, Bell, User } from '@phosphor-icons/react';

/**
 * Mobile Settings Page
 */
export default function MobileSettingsPage() {
    const navigate = useNavigate();

    const settingsItems = [
        { icon: User, label: 'Account', path: '/settings/account' },
        { icon: Bell, label: 'Notifications', path: '/settings/notifications' },
        { icon: Globe, label: 'Language', path: '/settings/language' },
        { icon: Subtitles, label: 'Subtitles', path: '/settings/subtitles' },
        { icon: Gear, label: 'Playback', path: '/settings/playback' },
        { icon: Info, label: 'About', path: '/settings/about' },
    ];

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white">
            {/* Page Bar */}
            <div className="flex items-center gap-3 p-4 border-b border-white/10">
                <button onClick={() => navigate(-1)} className="p-2 -ml-2">
                    <ArrowLeft size={24} weight="bold" />
                </button>
                <span className="text-lg font-semibold">Settings</span>
            </div>

            {/* Settings List */}
            <div className="p-4 space-y-1">
                {settingsItems.map((item) => {
                    const Icon = item.icon;
                    return (
                        <button
                            key={item.path}
                            onClick={() => navigate(item.path)}
                            className="w-full flex items-center gap-4 p-4 rounded-lg hover:bg-white/5 transition"
                        >
                            <Icon size={24} className="text-gray-400" />
                            <span className="text-base">{item.label}</span>
                        </button>
                    );
                })}
            </div>

            {/* App Info */}
            <div className="absolute bottom-8 left-0 right-0 text-center text-gray-500 text-sm">
                <p>Kinemora v2.0</p>
                <p className="text-xs mt-1">Built with ❤️</p>
            </div>
        </div>
    );
}
