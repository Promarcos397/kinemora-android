import React from 'react';
import { useTranslation } from 'react-i18next';
import { AppSettings } from '../../types';
import { SettingsToggle } from '../ui/SettingsUI';
import { PlayCircleIcon, QueueIcon } from '@phosphor-icons/react';

interface PlaybackSectionProps {
    settings: AppSettings;
    updateSettings: (s: Partial<AppSettings>) => void;
}

const PlaybackSection: React.FC<PlaybackSectionProps> = ({ settings, updateSettings }) => {
    const { t } = useTranslation();
    return (
        <div className="space-y-8 animate-fadeIn">
            <div className="bg-[#141414] border border-white/5 rounded-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-white/5 bg-white/[0.02]">
                    <h3 className="font-bold text-white text-lg">{t('playback.autoplayTitle')}</h3>
                </div>
                <div className="p-6 space-y-6">
                    <SettingsToggle
                        label={t('playback.autoplayPreviews')}
                        subLabel={t('playback.autoplayPreviewsDesc')}
                        checked={settings.autoplayPreviews}
                        onChange={() => updateSettings({ autoplayPreviews: !settings.autoplayPreviews })}
                        icon={<PlayCircleIcon size={24} />}
                    />

                    <SettingsToggle
                        label={t('playback.autoplayNext')}
                        subLabel={t('playback.autoplayNextDesc')}
                        checked={settings.autoplayNextEpisode}
                        onChange={() => updateSettings({ autoplayNextEpisode: !settings.autoplayNextEpisode })}
                        icon={<QueueIcon size={24} />}
                    />
                </div>
            </div>

            <div className="px-2">
                <p className="text-xs text-gray-500">{t('playback.dataNote')}</p>
            </div>
        </div>
    );
};

export default PlaybackSection;
