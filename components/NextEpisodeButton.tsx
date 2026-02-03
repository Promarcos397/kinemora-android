import React from 'react';
import { CaretRight, ArrowCounterClockwise } from '@phosphor-icons/react';
import { useTranslation } from 'react-i18next';

interface NextEpisodeButtonProps {
    show: boolean;
    isNextSeason?: boolean;
    onNext: () => void;
    onReplay: () => void;
    bottomOffsetClass?: string;
}

const NextEpisodeButton: React.FC<NextEpisodeButtonProps> = ({
    show,
    isNextSeason,
    onNext,
    onReplay,
    bottomOffsetClass = "bottom-12" // Default offset, can be adjusted based on controls visibility
}) => {
    const { t } = useTranslation();

    return (
        <div
            className={`absolute right-12 transition-all duration-300 z-[60] flex items-center gap-3 ${show ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'} ${bottomOffsetClass}`}
        >
            {/* Replay Button */}
            <button
                onClick={(e) => { e.stopPropagation(); onReplay(); }}
                className="h-10 px-6 bg-[#202020]/90 hover:bg-[#303030] text-white font-bold rounded flex items-center justify-center transition-transform hover:scale-105 backdrop-blur-sm"
            >
                <ArrowCounterClockwise size={20} weight="bold" className="mr-2" />
                <span>{t('player.replay', 'Replay')}</span>
            </button>

            {/* Next Episode Button */}
            <button
                onClick={(e) => { e.stopPropagation(); onNext(); }}
                className="h-10 px-6 bg-white hover:bg-gray-200 text-black font-bold rounded flex items-center justify-center transition-transform hover:scale-105 shadow-lg"
            >
                <CaretRight size={20} weight="bold" className="mr-2" />
                <span>
                    {isNextSeason
                        ? t('player.nextSeason', 'Next Season')
                        : t('player.nextEpisode', 'Next Episode')
                    }
                </span>
            </button>
        </div>
    );
};

export default NextEpisodeButton;
