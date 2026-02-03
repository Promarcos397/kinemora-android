import React from 'react';
import { TranslateIcon, SubtitlesIcon, PlayCircleIcon, BellIcon, ArrowLeftIcon, CaretRightIcon } from '@phosphor-icons/react';
import { useTranslation } from 'react-i18next';

export type SettingsView = 'menu' | 'appearance' | 'playback' | 'subtitle' | 'language' | 'notification';

interface SettingsMenuProps {
    onNavigate: (view: SettingsView) => void;
}

interface MenuItemProps {
    icon: React.ReactNode;
    label: string;
    subLabel: string;
    onClick: () => void;
}

const MenuItem: React.FC<MenuItemProps> = ({ icon, label, subLabel, onClick }) => (
    <div
        onClick={onClick}
        className="group flex items-center justify-between p-4 border border-white/10 rounded-sm hover:bg-white/5 cursor-pointer transition-all active:scale-[0.99]"
    >
        <div className="flex items-center space-x-4">
            <span className="text-white/60 group-hover:text-white transition-colors">{icon}</span>
            <div>
                <h3 className="text-base text-white group-hover:text-white">{label}</h3>
                <p className="text-xs text-white/50">{subLabel}</p>
            </div>
        </div>
        <CaretRightIcon size={20} className="text-white/40 group-hover:text-white/60" />
    </div>
);

const SettingsMenu: React.FC<SettingsMenuProps> = ({ onNavigate }) => {
    const { t } = useTranslation();

    return (
        <div className="max-w-2xl mx-auto py-12 px-4 animate-fadeIn">

            {/* Header */}
            <div className="flex items-center space-x-4 mb-2">
                <button onClick={() => window.history.back()} className="p-2 rounded-full hover:bg-white/10 transition-colors">
                    <ArrowLeftIcon size={24} className="text-white" />
                </button>
                <div className="flex-1 text-center pr-12"> {/* pr-12 balances the back button width */}
                    <h1 className="text-2xl font-bold text-white">{t('settings.title')}</h1>
                </div>
            </div>

            <div className="h-px w-full bg-white/10 mb-8" />

            {/* List */}
            <div className="space-y-4">

                <h2 className="text-lg font-bold text-white mb-4 px-1">{t('settings.preferences')}</h2>

                <MenuItem
                    icon={<TranslateIcon size={24} />}
                    label={t('settings.languages')}
                    subLabel={t('settings.languagesSub')}
                    onClick={() => onNavigate('language')}
                />

                <MenuItem
                    icon={<SubtitlesIcon size={24} />}
                    label={t('settings.subtitleAppearance')}
                    subLabel={t('settings.subtitleAppearanceSub')}
                    onClick={() => onNavigate('subtitle')}
                />

                <MenuItem
                    icon={<PlayCircleIcon size={24} />}
                    label={t('settings.playbackSettings')}
                    subLabel={t('settings.playbackSettingsSub')}
                    onClick={() => onNavigate('playback')}
                />

                <MenuItem
                    icon={<BellIcon size={24} />}
                    label={t('settings.notifications')}
                    subLabel={t('settings.notificationsSub')}
                    onClick={() => onNavigate('notification')}
                />

            </div>
        </div>
    );
};

export default SettingsMenu;
