import React, { useRef, useEffect } from 'react';
import { Episode } from '../types';
import { ArrowLeftIcon, XIcon, CaretDownIcon, PlayCircleIcon, CheckIcon } from '@phosphor-icons/react';
import { useTranslation } from 'react-i18next';
import { useGlobalContext } from '../context/GlobalContext';

interface PopupPanelProps {
    title: string;
    onBack?: () => void;
    onClose: () => void;
    children: React.ReactNode;
    headerContent?: React.ReactNode;
}

const MinimalPanel: React.FC<{
    onClose: () => void;
    onHover?: () => void;
    children: React.ReactNode;
}> = ({ onClose, onHover, children }) => (
    <div
        className="absolute bottom-24 right-4 w-auto min-w-[700px] max-w-[800px] max-h-[45vh] bg-[#262626] z-[110] flex flex-col font-['Consolas'] shadow-2xl rounded overflow-hidden animate-fadeIn"
        onMouseEnter={onHover}
        onMouseLeave={onClose}
    >
        <div className="flex-1 overflow-y-auto scrollbar-none">
            {children}
        </div>
    </div>
);

const SubtitleMenu: React.FC<{
    captions: Array<{ id: string; label: string; url: string; lang: string }>;
    currentCaption: string | null;
    onSubtitleChange: (url: string | null) => void;
}> = ({ captions, currentCaption, onSubtitleChange }) => {
    const { t } = useTranslation();

    // Keep one subtitle per language (by lang code)
    const uniqueCaptions = React.useMemo(() => {
        const seenLangs = new Set<string>();
        const result: typeof captions = [];

        // Sort: English first, then alphabetically by label
        const sorted = [...captions].sort((a, b) => {
            const aIsEnglish = a.lang === 'en' || a.label.toLowerCase().includes('english');
            const bIsEnglish = b.lang === 'en' || b.label.toLowerCase().includes('english');
            if (aIsEnglish && !bIsEnglish) return -1;
            if (!aIsEnglish && bIsEnglish) return 1;
            return a.label.localeCompare(b.label);
        });

        for (const cap of sorted) {
            // Use lang code for deduplication (keep first of each language)
            const langKey = cap.lang || cap.label;
            if (!seenLangs.has(langKey)) {
                seenLangs.add(langKey);
                result.push(cap);
            }
        }
        return result;
    }, [captions]);

    return (
        <div className="grid grid-cols-2 gap-x-2 py-3 px-2">
            {/* Off Option */}
            <div
                onClick={() => onSubtitleChange(null)}
                className="flex items-center px-3 py-2 cursor-pointer hover:bg-white/5 transition rounded"
            >
                <div className="w-5 mr-2 flex justify-center">
                    {currentCaption === null && <CheckIcon size={16} weight="bold" className="text-white" />}
                </div>
                <span className={`text-lg ${currentCaption === null ? 'text-white' : 'text-white/60'}`}>
                    {t('player.off')}
                </span>
            </div>

            {/* Subtitle Options */}
            {uniqueCaptions.map(cap => (
                <div
                    key={cap.id}
                    onClick={() => onSubtitleChange(cap.url)}
                    className="flex items-center px-3 py-2 cursor-pointer hover:bg-white/5 transition rounded"
                >
                    <div className="w-5 mr-2 flex justify-center">
                        {currentCaption === cap.url && <CheckIcon size={16} weight="bold" className="text-white" />}
                    </div>
                    <span className={`text-lg ${currentCaption === cap.url ? 'text-white' : 'text-white/60'}`}>
                        {cap.label}
                    </span>
                </div>
            ))}
        </div>
    );
};



const EpisodeExplorer: React.FC<{
    seasonList: number[];
    currentSeasonEpisodes: Episode[];
    selectedSeason: number;
    currentEpisode: number;
    playingSeason?: number;
    showId: number | string;  // Added for progress lookup
    onSeasonSelect: (season: number) => void;
    onEpisodeSelect: (ep: Episode) => void;
    onEpisodeExpand?: (season: number, episode: number) => void;  // Prefetch callback
    activePanel: 'seasons' | 'episodes' | string;
    setActivePanel: (panel: any) => void;
    showTitle?: string;
    onPanelHover?: () => void;
    onClose?: () => void;
}> = ({ seasonList, currentSeasonEpisodes, selectedSeason, currentEpisode, playingSeason, showId, onSeasonSelect, onEpisodeSelect, onEpisodeExpand, activePanel, setActivePanel, showTitle, onPanelHover, onClose }) => {
    const { t } = useTranslation();
    const { getEpisodeProgress } = useGlobalContext();
    const [previewSeason, setPreviewSeason] = React.useState(selectedSeason);
    const [expandedEpisodeId, setExpandedEpisodeId] = React.useState<number | null>(null);
    const episodesContainerRef = useRef<HTMLDivElement>(null);
    const currentEpisodeRef = useRef<HTMLDivElement>(null);

    // Format seconds to MM:SS
    const formatTime = (seconds: number): string => {
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    // Sync preview
    React.useEffect(() => {
        setPreviewSeason(selectedSeason);
    }, [selectedSeason, activePanel]);

    // Auto-expand playing episode when viewing that season
    React.useEffect(() => {
        if (playingSeason === selectedSeason) {
            const playingEp = currentSeasonEpisodes.find(ep => ep.episode_number === currentEpisode);
            if (playingEp) {
                setExpandedEpisodeId(playingEp.id);
            }
        }
    }, [selectedSeason, playingSeason, currentEpisode, currentSeasonEpisodes]);

    const handleSeasonClick = (s: number) => {
        setPreviewSeason(s);
        onSeasonSelect(s);
        setActivePanel('episodes');
    };

    // Auto-scroll to current episode when opening
    useEffect(() => {
        if (activePanel === 'episodes' && currentEpisodeRef.current && episodesContainerRef.current) {
            setTimeout(() => {
                currentEpisodeRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 100);
        }
    }, [activePanel, currentEpisode]);

    // Helper to get episode progress as percentage
    const getEpisodeProgressPercent = (season: number, epNumber: number): number => {
        const progress = getEpisodeProgress(showId, season, epNumber);
        if (progress && progress.duration > 0) {
            return Math.min((progress.time / progress.duration) * 100, 100);
        }
        return 0;
    };

    return (
        <div
            className="absolute bottom-24 right-2 w-auto min-w-[650px] max-w-[750px] min-h-[40vh] max-h-[70vh] bg-[#262626] z-[110] flex flex-col font-['Consolas'] shadow-2xl rounded overflow-hidden animate-fadeIn text-white"
            onMouseEnter={onPanelHover}
            onMouseLeave={onClose || (() => setActivePanel('none'))}
        >
            {activePanel === 'seasons' && (
                <div className="flex flex-col py-2 overflow-y-auto max-h-[60vh]">
                    {showTitle && (
                        <div className="px-4 py-4 border-b border-white/20">
                            <span className="text-white text-xl">{showTitle}</span>
                        </div>
                    )}
                    {seasonList.map(s => (
                        <div
                            key={s}
                            onClick={() => handleSeasonClick(s)}
                            className={`flex items-center px-4 py-5 cursor-pointer hover:bg-white/5 transition ${selectedSeason === s ? 'border-[3px] border-white/60' : ''}`}
                        >
                            <div className="w-6 mr-3 flex justify-center">
                                {selectedSeason === s && <CheckIcon size={16} weight="bold" className="text-white" />}
                            </div>
                            <span className={`text-lg font-['Consolas'] ${selectedSeason === s ? 'text-white' : 'text-white/60'}`}>
                                {t('player.season')} {s}
                            </span>
                        </div>
                    ))}
                </div>
            )}
            {activePanel === 'episodes' && (
                <div className="flex flex-col">
                    <div
                        className="flex items-center px-4 py-4 border-b border-white/10 cursor-pointer hover:bg-white/5 transition"
                        onClick={() => setActivePanel('seasons')}
                    >
                        <ArrowLeftIcon size={24} weight="bold" className="text-white mr-4" />
                        <span className="text-white text-xl font-['Consolas'] font-bold">{t('player.season')} {previewSeason}</span>
                    </div>

                    <div ref={episodesContainerRef} className="flex flex-col py-2 max-h-[60vh] overflow-y-auto scrollbar-none">
                        {currentSeasonEpisodes.map(ep => {
                            const isPlaying = currentEpisode === ep.episode_number && playingSeason === selectedSeason;
                            const isExpanded = expandedEpisodeId === ep.id;

                            return (
                                <div
                                    key={ep.id}
                                    ref={isPlaying ? currentEpisodeRef : null}
                                    className={`px-4 transition ${isExpanded ? 'bg-[#0f1112] pb-6 pt-4' : 'py-4 hover:bg-white/5'} ${isPlaying ? 'border-l-4 border-[#E50914]' : ''}`}
                                >
                                    {/* Header / Click Area - EXPAND ONLY */}
                                    <div
                                        className="flex items-center cursor-pointer group"
                                        onClick={() => {
                                            const newExpanded = isExpanded ? null : ep.id;
                                            setExpandedEpisodeId(newExpanded);
                                            if (newExpanded && onEpisodeExpand) {
                                                onEpisodeExpand(selectedSeason, ep.episode_number);
                                            }
                                        }}
                                    >
                                        <span className={`w-8 text-lg font-['Consolas'] font-normal ${isPlaying ? 'text-white font-bold' : 'text-white/70'}`}>
                                            {ep.episode_number}
                                        </span>
                                        <span className={`flex-1 text-lg font-['Consolas'] ${isPlaying ? 'text-white font-bold' : 'text-white font-bold'}`}>
                                            {ep.name}
                                        </span>
                                        {/* Resume time indicator */}
                                        {(() => {
                                            const progress = getEpisodeProgress(showId, selectedSeason, ep.episode_number);
                                            if (progress && progress.time > 10 && progress.time < (progress.duration - 30)) {
                                                return (
                                                    <span className="text-xs text-white/50 mr-3">
                                                        Resume {formatTime(progress.time)}
                                                    </span>
                                                );
                                            }
                                            return null;
                                        })()}
                                        <CaretDownIcon
                                            size={20}
                                            className={`text-white/50 transition-transform duration-300 ${isExpanded ? 'rotate-180' : 'rotate-0'}`}
                                        />
                                    </div>

                                    {/* Expanded Detail - PLAY BUTTON IS HERE */}
                                    {isExpanded && (
                                        <div className="flex mt-4 gap-5 ml-2 animate-fadeIn">
                                            {ep.still_path && (
                                                <div
                                                    className="relative group cursor-pointer flex-shrink-0"
                                                    onClick={(e) => {
                                                        e.stopPropagation(); // Ensure we don't trigger row click
                                                        onEpisodeSelect(ep);
                                                    }}
                                                >
                                                    <img
                                                        src={`https://image.tmdb.org/t/p/w300${ep.still_path}`}
                                                        alt={ep.name}
                                                        className="w-60 h-36 object-cover shadow-lg rounded border border-white/10"
                                                    />
                                                    <div className="absolute inset-0 bg-black/40 group-hover:bg-black/20 flex items-center justify-center transition-all">
                                                        <PlayCircleIcon size={48} weight="fill" className="text-white drop-shadow-lg transform group-hover:scale-110 transition-transform" />
                                                    </div>

                                                    {/* Progress Bar at bottom of thumbnail */}
                                                    {getEpisodeProgressPercent(selectedSeason, ep.episode_number) > 0 && (
                                                        <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
                                                            <div
                                                                className="h-full bg-[#E50914]"
                                                                style={{ width: `${getEpisodeProgressPercent(selectedSeason, ep.episode_number)}%` }}
                                                            />
                                                        </div>
                                                    )}
                                                </div>
                                            )}

                                            <div className="flex flex-col flex-1">
                                                <p className="text-base text-gray-300 line-clamp-4 leading-relaxed overflow-hidden text-ellipsis mb-2">
                                                    {ep.overview || t('player.noDescription')}
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
};

interface VideoPlayerSettingsProps {
    activePanel: 'none' | 'episodes' | 'seasons' | 'audioSubtitles' | 'quality';
    setActivePanel: (panel: 'none' | 'episodes' | 'seasons' | 'audioSubtitles' | 'quality') => void;
    seasonList: number[];
    currentSeasonEpisodes: Episode[];
    selectedSeason: number;
    currentEpisode: number;
    playingSeason?: number;
    showId: number | string;
    onSeasonSelect: (season: number) => void;
    onEpisodeSelect: (ep: Episode) => void;
    onEpisodeExpand?: (season: number, episode: number) => void;
    qualities: Array<{ height: number; bitrate: number; level: number }>;
    currentQuality: number;
    onQualityChange: (level: number) => void;
    captions: Array<{ id: string; label: string; url: string; lang: string }>;
    currentCaption: string | null;
    onSubtitleChange: (url: string | null) => void;
    showTitle?: string;
    onPanelHover?: () => void;
    onStartHide?: () => void;
}

const VideoPlayerSettings: React.FC<VideoPlayerSettingsProps> = ({
    activePanel,
    setActivePanel,
    seasonList,
    currentSeasonEpisodes,
    selectedSeason,
    currentEpisode,
    playingSeason,
    showId,
    onSeasonSelect,
    onEpisodeSelect,
    onEpisodeExpand,
    qualities,
    currentQuality,
    onQualityChange,
    captions,
    currentCaption,
    onSubtitleChange,
    showTitle,
    onPanelHover,
    onStartHide
}) => {

    if (activePanel === 'none') return null;

    // Use onStartHide for mouse leave if provided, otherwise fallback to immediate close (safety)
    const handleMouseLeave = onStartHide || (() => setActivePanel('none'));

    return (
        <>
            {/* Minimal Subtitles Panel */}
            {activePanel === 'audioSubtitles' && (
                <MinimalPanel onClose={handleMouseLeave} onHover={onPanelHover}>
                    <SubtitleMenu captions={captions} currentCaption={currentCaption} onSubtitleChange={onSubtitleChange} />
                </MinimalPanel>
            )}

            {/* Minimal Quality Panel */}
            {activePanel === 'quality' && (
                // Increased height by ~10% via min-h class or style?
                // MinimalPanel uses max-h. I'll pass a style or modify MinimalPanel.
                // Let's modify MinimalPanel to take className override or create a custom one here.
                <div
                    className="absolute bottom-24 right-4 w-auto min-w-[700px] max-w-[800px] max-h-[50vh] bg-[#262626] z-[110] flex flex-col font-['Consolas'] shadow-2xl rounded overflow-hidden animate-fadeIn"
                    onMouseEnter={onPanelHover}
                    onMouseLeave={handleMouseLeave}
                >
                    <div className="flex-1 overflow-y-auto scrollbar-none">
                        <div className="grid grid-cols-2 gap-3 p-2">
                            <button
                                onClick={() => onQualityChange(-1)}
                                className={`p-4 text-center rounded bg-[#222] hover:bg-[#333] transition ${currentQuality === -1 ? 'border-2 border-[#E50914] text-white' : 'text-white/60'}`}
                            >
                                Auto
                            </button>
                            {qualities.map((q, i) => (
                                <button
                                    key={i}
                                    onClick={() => onQualityChange(q.level)}
                                    className={`p-4 text-center rounded bg-[#222] hover:bg-[#333] transition ${currentQuality === q.level ? 'border-2 border-[#E50914] text-white' : 'text-white/60'}`}
                                >
                                    {q.height}p {q.height >= 1080 && 'HD'}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Netflix-Style Episode Explorer */}
            {(activePanel === 'seasons' || activePanel === 'episodes') && (
                <EpisodeExplorer
                    seasonList={seasonList}
                    currentSeasonEpisodes={currentSeasonEpisodes}
                    selectedSeason={selectedSeason}
                    currentEpisode={currentEpisode}
                    playingSeason={playingSeason}
                    showId={showId}
                    onSeasonSelect={onSeasonSelect}
                    onEpisodeSelect={(ep) => { onEpisodeSelect(ep); setActivePanel('none'); }}
                    onEpisodeExpand={onEpisodeExpand}
                    activePanel={activePanel}
                    setActivePanel={setActivePanel}
                    showTitle={showTitle}
                    onPanelHover={onPanelHover}
                    onClose={handleMouseLeave}
                />
            )}
        </>
    );
};

export default VideoPlayerSettings;
