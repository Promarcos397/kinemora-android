
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeftIcon, TranslateIcon, BellIcon } from '@phosphor-icons/react';
import SettingsMenu, { SettingsView } from './SettingsMenu';
import SubtitleSection from './SubtitleSection';
import PlaybackSection from './PlaybackSection';
import LanguageSection from './LanguageSection';
import PlaceholderSection from './PlaceholderSection';
import { AppSettings } from '../../types';

interface SettingsLayoutProps {
    settings: AppSettings;
    updateSettings: (s: Partial<AppSettings>) => void;
    continueWatching: any[];
    onReset: () => void;
}

const SettingsLayout: React.FC<SettingsLayoutProps> = ({ settings, updateSettings, continueWatching, onReset }) => {
    const { section } = useParams<{ section: string }>();
    const navigate = useNavigate();
    const validViews: SettingsView[] = ['appearance', 'playback', 'subtitle', 'language', 'notification'];

    // Derive current view from URL param
    const currentView: SettingsView | 'menu' = (section && validViews.includes(section as SettingsView))
        ? (section as SettingsView)
        : 'menu';

    // Navigation Handler
    const handleNavigate = (view: SettingsView) => {
        navigate(`/settings/${view}`);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleBack = () => {
        navigate('/settings');
    };

    // Detail Component Renderer
    const renderDetail = () => {
        switch (currentView) {
            case 'subtitle':
                return (
                    <DetailWrapper title="Subtitle appearance" onBack={handleBack}>
                        <SubtitleSection
                            settings={settings}
                            updateSettings={updateSettings}
                            continueWatching={continueWatching}
                        />
                    </DetailWrapper>
                );
            case 'playback':
                return (
                    <DetailWrapper title="Playback settings" onBack={handleBack}>
                        <PlaybackSection
                            settings={settings}
                            updateSettings={updateSettings}
                        />
                    </DetailWrapper>
                );
            case 'language':
                return (
                    <DetailWrapper title="Languages" onBack={handleBack}>
                        <LanguageSection
                            settings={settings}
                            updateSettings={updateSettings}
                        />
                    </DetailWrapper>
                );

            case 'notification':
                return <DetailWrapper title="Notification settings" onBack={handleBack}><PlaceholderSection title="Adjust Notifications" message="Email and push notification preferences." icon={<BellIcon size={32} />} /></DetailWrapper>;
            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen w-full bg-[#141414] text-white pt-20 pb-20 font-['Consolas']">
            {currentView === 'menu' ? (
                <SettingsMenu onNavigate={handleNavigate} />
            ) : (
                renderDetail()
            )}
        </div>
    );
};

// Helper Wrapper for Detail Views
const DetailWrapper: React.FC<{ title: string; onBack: () => void; children: React.ReactNode }> = ({ title, onBack, children }) => (
    <div className="max-w-4xl mx-auto px-4 animate-slideUp">
        <div className="flex items-center space-x-4 mb-8 pt-4">
            <button onClick={onBack} className="p-2 rounded-full hover:bg-white/10 transition-colors">
                <ArrowLeftIcon size={24} className="text-white" />
            </button>
            <h1 className="text-2xl font-bold text-white">{title}</h1>
        </div>
        <div className="bg-black/20 rounded-sm p-0 md:p-6">
            {children}
        </div>
    </div>
);

export default SettingsLayout;
