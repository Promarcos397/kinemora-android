import React from 'react';
import { AppSettings, Movie } from '../../types';
import SubtitleSettings from './SubtitleSettings';
import SubtitlePreview from './SubtitlePreview';
import { IMG_PATH } from '../../constants';

interface SubtitleSectionProps {
    settings: AppSettings;
    updateSettings: (s: Partial<AppSettings>) => void; // Using AppSettings explicitly
    continueWatching: any[]; // Ideally strict type Movie[]
}

const SubtitleSection: React.FC<SubtitleSectionProps> = ({ settings, updateSettings, continueWatching }) => {

    // Fallback logic for preview background
    const previewBackdrop = continueWatching && continueWatching.length > 0
        ? `${IMG_PATH}${continueWatching[0].backdrop_path}`
        : "https://image.tmdb.org/t/p/original/mDeUmPeRp1tN2bY8n4Jp1Mv6i8H.jpg";

    return (
        <div className="space-y-8 animate-slideUp">

            {/* Live Preview - No Header */}
            <div className="w-full mb-6">
                <div className="h-56 md:h-72 w-full bg-black relative rounded-sm overflow-hidden border border-white/10">
                    <SubtitlePreview settings={settings} backdropUrl={previewBackdrop} />
                </div>
            </div>

            {/* Controls */}
            <div className="bg-[#141414] border border-white/5 rounded-sm overflow-hidden">
                <div className="p-6">
                    <SubtitleSettings settings={settings} updateSettings={updateSettings} />
                </div>
            </div>

        </div>
    );
};

export default SubtitleSection;
