import React, { useState, useEffect } from 'react';
import { BookOpenIcon, InfoIcon } from '@phosphor-icons/react';
import { Movie } from '../types';

interface BookHeroProps {
    onSelect: (book: Movie) => void;
}

// Static Hero Content (Solo Leveling) for a reliable premium look
const BookHero: React.FC<BookHeroProps> = ({ onSelect }) => {
    const [book, setBook] = useState<Movie | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchDailyHero = async () => {
            setIsLoading(true);
            try {
                const electron = (window as any).electron;
                if (electron?.cloud?.getLibrary) {
                    const res = await electron.cloud.getLibrary();
                    if (res.success && res.data.length > 0) {
                        // 1. Group issues by Series Title to find unique series
                        const seriesMap = new Map();

                        res.data.forEach((issue: any) => {
                            // Prefer series.title, fallback to issue title (cleaned), fallback to 'Unknown'
                            const seriesTitle = issue.series?.title || issue.title?.split('#')[0].trim() || 'Unknown';

                            // Only add if we have a cover!
                            if (issue.cover_google_id && !seriesMap.has(seriesTitle)) {
                                seriesMap.set(seriesTitle, issue);
                            }
                        });

                        const uniqueSeries = Array.from(seriesMap.values());

                        if (uniqueSeries.length > 0) {
                            // 2. Daily Rotation Logic
                            // Use date string to seed a random index so it's consistent for the whole day
                            const today = new Date().toDateString();
                            let hash = 0;
                            for (let i = 0; i < today.length; i++) {
                                hash = ((hash << 5) - hash) + today.charCodeAt(i);
                                hash |= 0;
                            }
                            const index = Math.abs(hash) % uniqueSeries.length;
                            const dailyPick = uniqueSeries[index];

                            const pickTitle = dailyPick.series?.title || dailyPick.title || 'Classic Comic';

                            const overViewText = dailyPick.series?.description || dailyPick.description || `Dive into the world of ${pickTitle}. Available in your Cloud Library.`;

                            setBook({
                                id: dailyPick.series_id || dailyPick.id,
                                title: pickTitle,
                                name: pickTitle,
                                overview: overViewText,
                                backdrop_path: `comic://image?id=${dailyPick.cover_google_id}`,
                                poster_path: `comic://image?id=${dailyPick.cover_google_id}`,
                                media_type: 'series',
                                vote_average: 9.8,
                                release_date: dailyPick.release_year?.toString() || 'Classic'
                            } as Movie);
                        }
                    }
                }
            } catch (error) {
                console.error("Failed to fetch Book Hero:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchDailyHero();
    }, []);

    if (isLoading || !book) {
        // Skeleton Loading State
        return (
            <div className="relative h-[50vh] md:h-[70vh] w-full bg-[#141414] mb-8 animate-pulse">
                <div className="absolute bottom-0 left-0 w-full p-12 space-y-6">
                    <div className="h-12 w-1/3 bg-gray-800 rounded"></div>
                    <div className="h-4 w-1/2 bg-gray-800 rounded"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="relative h-[50vh] md:h-[70vh] w-full bg-black mb-8 group">
            {/* Background Image */}
            <div className="absolute inset-0">
                <img
                    src={book.backdrop_path}
                    alt={book.title}
                    className="w-full h-full object-cover object-[50%_30%] opacity-70 mask-image-b"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-transparent to-black/30" />
                <div className="absolute inset-0 bg-gradient-to-r from-[#141414] via-[#141414]/40 to-transparent" />
            </div>

            {/* Content */}
            <div className="absolute bottom-0 left-0 w-full p-6 md:p-12 space-y-4 md:space-y-6 z-20 max-w-2xl">
                {/* Title */}
                <h1 className="text-4xl md:text-6xl text-white drop-shadow-2xl leading-tight line-clamp-2 font-bold font-leaner tracking-wide">
                    {book.title}
                </h1>

                {/* Metadata */}
                <div className="flex items-center space-x-3 text-sm md:text-base font-medium">
                    <span className="text-gray-300">{book.release_date}</span>
                    <span className="border border-gray-500 px-1.5 py-0.5 text-xs rounded text-gray-300 uppercase">{book.media_type}</span>
                </div>

                {/* Overview */}
                <p className="text-gray-200 text-sm md:text-lg line-clamp-3 md:line-clamp-4 drop-shadow-md">
                    {book.overview}
                </p>

                {/* Buttons */}
                <div className="flex items-center space-x-3 pt-2">
                    <button
                        onClick={() => onSelect(book)}
                        className="bg-white text-black px-6 md:px-8 py-2 md:py-3 rounded-[4px] font-bold text-base md:text-lg flex items-center hover:bg-gray-200 transition"
                    >
                        <BookOpenIcon size={24} weight="fill" className="mr-2" />
                        Read Now
                    </button>
                    <button
                        onClick={() => onSelect(book)}
                        className="bg-[rgba(109,109,110,0.7)] text-white px-6 md:px-8 py-2 md:py-3 rounded-[4px] font-bold text-base md:text-lg flex items-center hover:bg-[rgba(109,109,110,0.4)] transition"
                    >
                        <InfoIcon size={24} className="mr-2" />
                        More Info
                    </button>
                </div>
            </div>
        </div>
    );
};

export default BookHero;
