import React from 'react';
import { PlayIcon, InfoIcon } from '@phosphor-icons/react';
import { useTranslation } from 'react-i18next';
import { Movie } from '../types';

interface HeroCarouselContentProps {
    movie: Movie;
    logoUrl: string | null;
    isVideoReady: boolean;
    onPlay: (movie: Movie) => void;
    onSelect: (movie: Movie, time?: number, videoId?: string) => void;
    trailerVideoId?: string;
    currentTime?: number;
    hasVideoEnded?: boolean;
}

const HeroCarouselContent: React.FC<HeroCarouselContentProps> = ({
    movie,
    logoUrl,
    isVideoReady,
    onPlay,
    onSelect,
    trailerVideoId,
    currentTime = 0,
    hasVideoEnded = false
}) => {
    const { t } = useTranslation();
    return (
        <div className={`absolute top-0 left-0 w-full h-full flex flex-col justify-center z-20 pb-12 sm:pb-0 
          pl-6 md:pl-14 lg:pl-20 pr-4 md:pr-12 pointer-events-none transition-opacity duration-700`}
        >
            <div className="mt-16 sm:mt-0 max-w-[90%] sm:max-w-lg md:max-w-2xl lg:max-w-3xl space-y-4 md:space-y-6 pointer-events-auto">

                {/* Logo/Title - Resets position when video ended */}
                <div className={`h-16 sm:h-24 md:h-32 flex items-end mb-2 origin-bottom-left transition-all duration-700 ${isVideoReady && !hasVideoEnded ? 'scale-75 origin-bottom-left translate-y-24' : ''}`}>
                    {logoUrl ? (
                        <img src={logoUrl} alt="title logo" className="h-full object-contain drop-shadow-2xl" />
                    ) : (
                        <h1 className="text-3xl sm:text-5xl md:text-6xl font-black font-leaner drop-shadow-xl leading-none text-white tracking-wide">
                            {movie?.name || movie?.title || ''}
                        </h1>
                    )}
                </div>

                {/* Description - Shows when video is not ready or has ended */}
                <p
                    className={`text-sm md:text-base text-gray-100 line-clamp-3 drop-shadow-md font-normal leading-relaxed text-shadow-sm max-w-lg transition-opacity duration-700 ${isVideoReady && !hasVideoEnded ? 'opacity-0' : 'opacity-100'} ${['ar', 'he'].includes(t('lang', { defaultValue: 'en' }).split('-')[0]) ? 'text-right' : ''}`}
                    dir={['ar', 'he'].includes(useTranslation().i18n.language.split('-')[0]) ? "rtl" : "ltr"}
                >
                    {movie?.overview}
                </p>

                {/* Buttons - Resets position when video ended */}
                <div className={`flex items-center space-x-3 pt-2 transition-transform duration-700 ${isVideoReady && !hasVideoEnded ? 'translate-y-8' : ''}`}>
                    <button
                        onClick={() => onPlay(movie)}
                        className="flex items-center justify-center bg-white text-black px-5 md:px-7 h-10 md:h-12 rounded-[4px] font-bold hover:bg-white/90 transition transform hover:scale-105 active:scale-95 text-sm md:text-base"
                    >
                        <PlayIcon weight="fill" className="w-5 h-5 md:w-7 md:h-7 mr-1 md:mr-2 text-black" />
                        {t('hero.play')}
                    </button>
                    <button
                        onClick={() => onSelect(movie, currentTime, trailerVideoId)}
                        className="flex items-center justify-center bg-gray-500/70 text-white px-6 md:px-9 h-10 md:h-12 rounded-[4px] font-bold hover:bg-gray-500/50 backdrop-blur-md transition transform hover:scale-105 active:scale-95 text-sm md:text-base"
                    >
                        <InfoIcon weight="regular" className="mr-2 text-2xl md:text-3xl" />
                        {t('hero.moreInfo')}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default HeroCarouselContent;

