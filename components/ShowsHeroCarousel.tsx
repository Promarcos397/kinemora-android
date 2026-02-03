import React, { useState, useEffect, useRef } from 'react';
import { CaretLeft, CaretRight, Play, Info } from '@phosphor-icons/react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { Movie, TMDBResponse } from '../types';
import { IMG_PATH, LOGO_SIZE } from '../constants';
import { getMovieImages } from '../services/api';

interface ShowsHeroCarouselProps {
    fetchUrl: string;
    onSelect: (movie: Movie) => void;
    onPlay: (movie: Movie) => void;
}

const ShowsHeroCarousel: React.FC<ShowsHeroCarouselProps> = ({ fetchUrl, onSelect, onPlay }) => {
    const { t, i18n } = useTranslation();
    const isRTL = ['ar', 'he'].includes(i18n.language.split('-')[0]);
    const [shows, setShows] = useState<Movie[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [logoUrls, setLogoUrls] = useState<{ [key: number]: string }>({});
    const [loading, setLoading] = useState(true);
    const [isTransitioning, setIsTransitioning] = useState(false);
    const slideshowRef = useRef<NodeJS.Timeout | null>(null);

    // Fetch shows
    useEffect(() => {
        const fetchShows = async () => {
            try {
                const response = await axios.get<TMDBResponse>(fetchUrl);
                // Get first 6 shows
                const sixShows = response.data.results.slice(0, 6);
                setShows(sixShows);

                // Fetch logos for each show
                sixShows.forEach(async (show) => {
                    try {
                        const mediaType = show.media_type || (show.first_air_date ? 'tv' : 'movie');
                        const imageData = await getMovieImages(show.id, mediaType as 'movie' | 'tv');
                        if (imageData?.logos) {
                            const logo = imageData.logos.find((l: any) => l.iso_639_1 === 'en' || l.iso_639_1 === null);
                            if (logo) {
                                setLogoUrls(prev => ({
                                    ...prev,
                                    [show.id]: `https://image.tmdb.org/t/p/${LOGO_SIZE}${logo.file_path}`
                                }));
                            }
                        }
                    } catch (e) { }
                });

                // Daily consistent starting index
                const today = new Date();
                const dailySeed = today.getFullYear() * 10000 + (today.getMonth() + 1) * 100 + today.getDate();
                setCurrentIndex(dailySeed % 6);

                setLoading(false);
            } catch (e) {
                console.error('[ShowsHeroCarousel] Fetch failed:', e);
                setLoading(false);
            }
        };
        fetchShows();
    }, [fetchUrl]);

    // Auto-slideshow every 8 seconds
    useEffect(() => {
        if (shows.length === 0) return;

        slideshowRef.current = setInterval(() => {
            setIsTransitioning(true);
            setTimeout(() => {
                setCurrentIndex((prev) => (prev + 1) % shows.length);
                setIsTransitioning(false);
            }, 500); // Fade out duration
        }, 8000);

        return () => {
            if (slideshowRef.current) clearInterval(slideshowRef.current);
        };
    }, [shows.length]);

    const goToSlide = (index: number) => {
        if (slideshowRef.current) clearInterval(slideshowRef.current);
        setIsTransitioning(true);
        setTimeout(() => {
            setCurrentIndex(index);
            setIsTransitioning(false);
        }, 300);
    };

    const goNext = () => {
        if (slideshowRef.current) clearInterval(slideshowRef.current);
        setIsTransitioning(true);
        setTimeout(() => {
            setCurrentIndex((prev) => (prev + 1) % shows.length);
            setIsTransitioning(false);
        }, 300);
    };

    const goPrev = () => {
        if (slideshowRef.current) clearInterval(slideshowRef.current);
        setIsTransitioning(true);
        setTimeout(() => {
            setCurrentIndex((prev) => (prev - 1 + shows.length) % shows.length);
            setIsTransitioning(false);
        }, 300);
    };

    if (loading || shows.length === 0) {
        return (
            <div className="relative w-full h-[70vh] md:h-[85vh] lg:h-[90vh] bg-black/50 animate-pulse" />
        );
    }

    const currentShow = shows[currentIndex];

    return (
        <div className="relative w-full h-[70vh] md:h-[85vh] lg:h-[90vh] overflow-hidden">
            {/* Background Image - Bigger with fade */}
            <div className="absolute inset-0 z-0">
                <img
                    src={`${IMG_PATH}${currentShow.backdrop_path}`}
                    alt={currentShow.name || currentShow.title}
                    className={`w-full h-[120%] object-cover object-top transition-opacity duration-500 ${isTransitioning ? 'opacity-0' : 'opacity-100'
                        }`}
                    style={{ marginTop: '-3%' }}
                />
                {/* Bottom fade to app background */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-transparent to-transparent" />
                {/* Left side gradient for text readability */}
                <div className="absolute inset-0 bg-gradient-to-r from-[#141414]/60 via-transparent to-transparent" />
            </div>

            {/* Content */}
            <div className={`absolute bottom-[28%] left-8 md:left-16 z-20 max-w-xl transition-opacity duration-500 ${isTransitioning ? 'opacity-0' : 'opacity-100'
                }`}>
                {/* Logo or Title */}
                {logoUrls[currentShow.id] ? (
                    <img
                        src={logoUrls[currentShow.id]}
                        alt={currentShow.name || currentShow.title}
                        className="max-w-[280px] md:max-w-[380px] lg:max-w-[450px] max-h-[100px] md:max-h-[130px] object-contain mb-4"
                    />
                ) : (
                    <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold text-white mb-4 drop-shadow-lg">
                        {currentShow.name || currentShow.title}
                    </h1>
                )}

                {/* Overview */}
                <p className={`text-white/80 text-sm md:text-base line-clamp-3 mb-6 max-w-lg ${isRTL ? 'text-right' : ''}`} dir={isRTL ? 'rtl' : 'ltr'}>
                    {currentShow.overview}
                </p>

                {/* Buttons */}
                <div className="flex items-center space-x-3">
                    <button
                        onClick={() => onPlay(currentShow)}
                        className="flex items-center space-x-2 bg-white text-black px-6 py-2 rounded font-semibold hover:bg-white/80 transition"
                    >
                        <Play weight="fill" size={20} />
                        <span>{t('hero.play')}</span>
                    </button>
                    <button
                        onClick={() => onSelect(currentShow)}
                        className="flex items-center space-x-2 bg-gray-500/70 text-white px-6 py-2 rounded font-semibold hover:bg-gray-500/90 transition backdrop-blur-sm"
                    >
                        <Info weight="bold" size={20} />
                        <span>{t('hero.moreInfo')}</span>
                    </button>
                </div>
            </div>

            {/* Navigation Arrows */}
            <button
                onClick={goPrev}
                className="absolute left-4 top-1/2 -translate-y-1/2 z-30 w-10 h-10 flex items-center justify-center bg-black/40 hover:bg-black/60 rounded-full transition backdrop-blur-sm"
            >
                <CaretLeft size={24} className="text-white" />
            </button>
            <button
                onClick={goNext}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-30 w-10 h-10 flex items-center justify-center bg-black/40 hover:bg-black/60 rounded-full transition backdrop-blur-sm"
            >
                <CaretRight size={24} className="text-white" />
            </button>

            {/* Slide Indicators - Horizontal thin lines */}
            <div className="absolute bottom-24 left-1/2 -translate-x-1/2 z-30 flex items-center space-x-1.5">
                {shows.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => goToSlide(index)}
                        className={`h-[2px] rounded-full transition-all duration-300 ${index === currentIndex
                            ? 'w-8 bg-white'
                            : 'w-4 bg-white/30 hover:bg-white/50'
                            }`}
                    />
                ))}
            </div>

            {/* Rating Badge */}
            <div className="absolute right-0 bottom-[28%] z-30 bg-gray-500/30 border-l-2 border-white pl-2 pr-4 py-1 backdrop-blur-md">
                <span className="text-white font-medium text-xs md:text-sm uppercase">
                    {currentShow.adult ? '18+' : '13+'}
                </span>
            </div>
        </div>
    );
};

export default ShowsHeroCarousel;
