import React from 'react';
import { useTranslation } from 'react-i18next';
import { AppSettings } from '../../types';
import { SettingsToggle, SettingsSlider, SettingsSelectGroup } from '../ui/SettingsUI';

interface SubtitleSettingsProps {
    settings: AppSettings;
    updateSettings: (s: Partial<AppSettings>) => void;
}

const SubtitleSettings: React.FC<SubtitleSettingsProps> = ({ settings, updateSettings }) => {
    const { t } = useTranslation();
    return (
        <div className="space-y-12 animate-fadeIn">

            {/* Master Toggle */}
            <SettingsToggle
                label={t('subtitles.show')}
                checked={settings.showSubtitles}
                onChange={() => updateSettings({ showSubtitles: !settings.showSubtitles })}
                icon="subtitles"
            />

            <div className={`space-y-12 transition-all duration-300 ${settings.showSubtitles ? 'opacity-100' : 'opacity-40 pointer-events-none grayscale'}`}>

                {/* 1. Typography Section */}
                <div className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                        <SettingsSelectGroup
                            label={t('subtitles.fontFamily')}
                            selectedId={settings.subtitleFontFamily}
                            onChange={(val) => updateSettings({ subtitleFontFamily: val })}
                            options={[
                                { id: 'monospace', label: t('subtitles.fonts.monospace') },
                                { id: 'typewriter', label: t('subtitles.fonts.typewriter') },
                                { id: 'print', label: t('subtitles.fonts.print') },
                                { id: 'block', label: t('subtitles.fonts.block') },
                                { id: 'casual', label: t('subtitles.fonts.casual') },
                                { id: 'cursive', label: t('subtitles.fonts.cursive') },
                                { id: 'small-caps', label: t('subtitles.fonts.smallCaps') },
                            ]}
                        />

                        <SettingsSelectGroup
                            label={t('subtitles.edgeEffect')}
                            selectedId={settings.subtitleEdgeStyle}
                            onChange={(val) => updateSettings({ subtitleEdgeStyle: val })}
                            options={[
                                { id: 'none', label: t('subtitles.edges.none') },
                                { id: 'raised', label: t('subtitles.edges.raised') },
                                { id: 'depressed', label: t('subtitles.edges.depressed') },
                                { id: 'uniform', label: t('subtitles.edges.uniform') },
                                { id: 'drop-shadow', label: t('subtitles.edges.dropShadow') },
                            ]}
                        />

                        <SettingsSelectGroup
                            label={t('subtitles.textSize')}
                            selectedId={settings.subtitleSize}
                            onChange={(val) => updateSettings({ subtitleSize: val })}
                            options={[
                                { id: 'tiny', label: t('subtitles.sizes.tiny') },
                                { id: 'small', label: t('subtitles.sizes.small') },
                                { id: 'medium', label: t('subtitles.sizes.medium') },
                                { id: 'large', label: t('subtitles.sizes.large') },
                                { id: 'huge', label: t('subtitles.sizes.huge') },
                            ]}
                        />

                        <SettingsSelectGroup
                            label={t('subtitles.textColor')}
                            type="color"
                            selectedId={settings.subtitleColor}
                            onChange={(val) => updateSettings({ subtitleColor: val })}
                            options={[
                                { id: 'white', value: '#FFFFFF' },   // Pure White
                                { id: 'yellow', value: '#FFF000' },  // Vibrant Yellow
                                { id: 'cyan', value: '#00FFFF' },    // Vibrant Cyan
                                { id: 'green', value: '#00FF00' },   // Vibrant Green
                                { id: 'red', value: '#FF0000' },     // Vibrant Red
                                { id: 'blue', value: '#0000FF' },    // Vibrant Blue
                                { id: 'black', value: '#000000' },   // Pure Black
                            ]}
                        />
                    </div>
                </div>

                {/* 2. Window / Background Section */}
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <h3 className="text-white/60 text-xs uppercase tracking-wider">{t('subtitles.windowBackground')}</h3>
                        <SettingsToggle
                            label=""
                            checked={settings.subtitleBackground === 'box'}
                            onChange={() => updateSettings({ subtitleBackground: settings.subtitleBackground === 'box' ? 'none' : 'box' })}
                            icon=""
                        />
                    </div>

                    {settings.subtitleBackground === 'box' && (
                        <div className="animate-fadeIn space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
                                <SettingsSlider
                                    label={t('subtitles.opacity')}
                                    value={settings.subtitleOpacity}
                                    min={0} max={100} unit="%"
                                    onChange={(val) => updateSettings({ subtitleOpacity: val })}
                                />
                                <SettingsSlider
                                    label={t('subtitles.blur')}
                                    value={settings.subtitleBlur}
                                    min={0} max={20} unit="px"
                                    onChange={(val) => updateSettings({ subtitleBlur: val })}
                                />
                            </div>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
};

export default SubtitleSettings;
