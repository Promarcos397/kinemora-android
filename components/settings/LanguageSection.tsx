import React, { useState } from 'react';
import { GlobeIcon, SubtitlesIcon, FloppyDiskIcon } from '@phosphor-icons/react';
import { useTranslation } from 'react-i18next';
import { AppSettings } from '../../types';
import { DISPLAY_LANGUAGES, SUBTITLE_LANGUAGES } from '../../constants';

interface LanguageSectionProps {
    settings: AppSettings;
    updateSettings: (s: Partial<AppSettings>) => void;
}

const LanguageSection: React.FC<LanguageSectionProps> = ({ settings, updateSettings }) => {
    // Local state for pending changes
    const { t } = useTranslation();
    const [pendingDisplay, setPendingDisplay] = useState(settings.displayLanguage);
    const [pendingSubtitle, setPendingSubtitle] = useState(settings.subtitleLanguage);
    const [hasChanges, setHasChanges] = useState(false);

    const handleDisplayChange = (value: string) => {
        setPendingDisplay(value);
        setHasChanges(value !== settings.displayLanguage || pendingSubtitle !== settings.subtitleLanguage);
    };

    const handleSubtitleChange = (value: string) => {
        setPendingSubtitle(value);
        setHasChanges(pendingDisplay !== settings.displayLanguage || value !== settings.subtitleLanguage);
    };

    const handleSave = () => {
        // Save settings
        updateSettings({
            displayLanguage: pendingDisplay,
            subtitleLanguage: pendingSubtitle
        });

        // Refresh page to apply new language to all content
        window.location.reload();
    };

    return (
        <div className="space-y-8">
            {/* Display Language */}
            <div className="space-y-3">
                <div className="flex items-center gap-3">
                    <GlobeIcon size={20} className="text-white/60" />
                    <h3 className="text-base font-medium text-white">{t('settings.displayLanguage')}</h3>
                </div>
                <p className="text-sm text-white/50 pl-8">
                    {t('settings.displayLanguageDesc')}
                </p>
                <div className="pl-8">
                    <select
                        value={pendingDisplay}
                        onChange={(e) => handleDisplayChange(e.target.value)}
                        className="w-full max-w-xs bg-[#333] text-white border border-white/20 rounded px-3 py-2 focus:outline-none focus:border-white/40 transition cursor-pointer"
                    >
                        {DISPLAY_LANGUAGES.map((lang) => (
                            <option key={lang.code} value={lang.code}>
                                {lang.label}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="h-px w-full bg-white/10" />

            {/* Subtitle Language */}
            <div className="space-y-3">
                <div className="flex items-center gap-3">
                    <SubtitlesIcon size={20} className="text-white/60" />
                    <h3 className="text-base font-medium text-white">{t('settings.subtitleLanguage')}</h3>
                </div>
                <p className="text-sm text-white/50 pl-8">
                    {t('settings.subtitleLanguageDesc')}
                </p>
                <div className="pl-8">
                    <select
                        value={pendingSubtitle}
                        onChange={(e) => handleSubtitleChange(e.target.value)}
                        className="w-full max-w-xs bg-[#333] text-white border border-white/20 rounded px-3 py-2 focus:outline-none focus:border-white/40 transition cursor-pointer"
                    >
                        {SUBTITLE_LANGUAGES.map((lang) => (
                            <option key={lang.code} value={lang.code}>
                                {lang.label}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Save Button */}
            <div className="pt-4">
                <button
                    onClick={handleSave}
                    disabled={!hasChanges}
                    className={`flex items-center gap-2 px-6 py-2 rounded font-medium transition ${hasChanges
                        ? 'bg-white text-black hover:bg-white/90'
                        : 'bg-white/20 text-white/50 cursor-not-allowed'
                        }`}
                >
                    <FloppyDiskIcon size={18} />
                    {t('common.saveRefresh')}
                </button>
                {hasChanges && (
                    <p className="text-xs text-white/50 mt-2">
                        Page will refresh to apply language changes.
                    </p>
                )}
            </div>

            {/* Info Note */}
            <div className="bg-white/5 rounded p-4 mt-6">
                <p className="text-xs text-white/50">
                    <strong className="text-white/70">Note:</strong> {t('settings.languageNote')}
                </p>
            </div>
        </div>
    );
};

export default LanguageSection;
