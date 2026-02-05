import React from 'react';
import { X, Gear, Globe, ClosedCaptioning, SpeakerHigh, Info } from '@phosphor-icons/react';

interface SettingsItem {
    id: string;
    label: string;
    icon: React.ElementType;
    onClick?: () => void;
}

interface MobileSettingsSheetProps {
    isOpen: boolean;
    onClose: () => void;
}

const SETTINGS_ITEMS: SettingsItem[] = [
    { id: 'account', label: 'Account', icon: Gear },
    { id: 'language', label: 'App Language', icon: Globe },
    { id: 'subtitles', label: 'Subtitles', icon: ClosedCaptioning },
    { id: 'audio', label: 'Audio', icon: SpeakerHigh },
    { id: 'about', label: 'About', icon: Info },
];

/**
 * Bottom sheet for settings
 * Opens from hamburger menu
 */
export default function MobileSettingsSheet({
    isOpen,
    onClose
}: MobileSettingsSheetProps) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100]">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60"
                onClick={onClose}
            />

            {/* Sheet */}
            <div className="absolute bottom-0 left-0 right-0 bg-[#1a1a1a] rounded-t-2xl animate-slideUp">
                {/* Handle */}
                <div className="flex justify-center pt-3 pb-2">
                    <div className="w-10 h-1 bg-gray-600 rounded-full" />
                </div>

                {/* Header */}
                <div className="flex items-center justify-between px-4 py-2 border-b border-white/10">
                    <span className="text-white font-semibold text-lg">Settings</span>
                    <button onClick={onClose} className="p-2">
                        <X size={20} weight="bold" className="text-white" />
                    </button>
                </div>

                {/* Settings items */}
                <div className="py-2 pb-8">
                    {SETTINGS_ITEMS.map((item) => {
                        const Icon = item.icon;
                        return (
                            <button
                                key={item.id}
                                onClick={item.onClick}
                                className="flex items-center gap-4 w-full px-4 py-3.5 active:bg-white/5"
                            >
                                <Icon size={24} className="text-white" />
                                <span className="text-white text-base">{item.label}</span>
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
