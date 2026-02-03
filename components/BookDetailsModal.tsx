import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { XIcon, BookOpenIcon, CheckIcon, PlusIcon } from '@phosphor-icons/react';
import { Movie } from '../types';
import { useGlobalContext } from '../context/GlobalContext';

interface BookDetailsModalProps {
    book: Movie | null;
    onClose: () => void;
    onRead: (book: Movie, chapterId: string) => void;
}

interface Chapter {
    id: string;
    title: string;
    chapterNumber: string;
    volumeNumber?: string;
    releaseDate?: string;
    coverUrl?: string;
    pages?: number;
    lang?: string;
}

const BookDetailsModal: React.FC<BookDetailsModalProps> = ({ book, onClose, onRead }) => {
    const { t } = useTranslation();
    const { myList, toggleList } = useGlobalContext();
    const [chapters, setChapters] = useState<Chapter[]>([]);
    const [loading, setLoading] = useState(false);
    const [desc, setDesc] = useState<string>('');
    const modalRef = React.useRef<HTMLDivElement>(null);

    // Determines media type safely
    const mediaType = book?.media_type || 'manga';

    useEffect(() => {
        if (book) {
            setChapters([]);
            setLoading(true);
            setDesc(book.overview || ''); // Fallback to provided overview

            const fetchInfo = async () => {
                try {
                    // NEW: Series Mode (Cloud)
                    if (mediaType === 'series') {
                        const cacheKey = `kinemora-issues-cache-${book.id}`;

                        // 1. Try Cache First (instant load - stale-while-revalidate)
                        const cached = localStorage.getItem(cacheKey);
                        let shouldRefresh = true;

                        if (cached) {
                            try {
                                const { data, timestamp } = JSON.parse(cached);
                                // Show cached data immediately
                                setChapters(data);
                                setLoading(false);

                                // Only skip refresh if cache is fresh (< 10 min)
                                if (Date.now() - timestamp < 10 * 60 * 1000) {
                                    shouldRefresh = false;
                                }
                            } catch (e) { /* Invalid cache, continue */ }
                        }

                        // 2. Refresh in background if needed
                        const electron = (window as any).electron;
                        if (shouldRefresh && electron?.cloud?.getIssues) {
                            const res = await electron.cloud.getIssues(book.id);
                            if (res.success) {
                                const cloudChapters = res.data.map((issue: any) => ({
                                    id: issue.google_file_id || issue.id,
                                    title: issue.story_arc || issue.title || `Issue #${issue.issue_number}`,
                                    chapterNumber: issue.issue_number.toString(),
                                    releaseDate: issue.release_year?.toString(),
                                    coverUrl: issue.cover_google_id ? `comic://image?id=${issue.cover_google_id}` : null,
                                    pages: 0,
                                    lang: 'EN'
                                }));
                                setChapters(cloudChapters);

                                // Preload first 5 cover images for faster display
                                cloudChapters.slice(0, 5).forEach((ch: any) => {
                                    if (ch.coverUrl) {
                                        const img = new Image();
                                        img.src = ch.coverUrl;
                                    }
                                });

                                // Save fresh data to cache
                                localStorage.setItem(cacheKey, JSON.stringify({
                                    data: cloudChapters,
                                    timestamp: Date.now()
                                }));
                            }
                        }
                        setLoading(false);
                        return;
                    }

                    const api = (window as any).electron?.consumet?.books;
                    if (api) {
                        const type = mediaType === 'comic' ? 'comic' : 'manga'; // Legacy types
                        const data = await api.getInfo(book.id, type);
                        if (data) {
                            if (data.chapters) setChapters(data.chapters);
                            if (data.description && typeof data.description === 'string') setDesc(data.description);
                            else if (data.description?.en) setDesc(data.description.en);
                        }
                    }
                } catch (error) {
                    console.error('Failed to fetch book details:', error);
                } finally {
                    setLoading(false);
                }
            };

            fetchInfo();
        }
    }, [book, mediaType]);

    if (!book) return null;

    const isAdded = myList.find(m => m.id === book.id);
    const handleClose = () => onClose();

    const handleReadClick = (chapterId?: string) => {
        // Resume logic: Find last read chapter from localStorage, else first chapter
        let targetChapterId = chapterId;

        if (!targetChapterId) {
            // Try to find last read
            const lastRead = localStorage.getItem(`kinemora-book-progress-${book.id}`);
            if (lastRead) {
                const parsed = JSON.parse(lastRead);
                if (parsed.chapterId) targetChapterId = parsed.chapterId;
            }
        }

        // Default to first chapter (reversed logic usually for manga descending? Consumet usually returns Descending)
        // We want the "First" chapter structurally (e.g. Ch 1).
        // If list is Descending (Ch 100 ... Ch 1), we want last index.
        // Assuming Consumet returns Desc chapters.
        if (!targetChapterId && chapters.length > 0) {
            // Find Chapter 1 or the last item in array
            targetChapterId = chapters[chapters.length - 1].id;
        }

        if (targetChapterId) {
            onRead(book, targetChapterId);
        }
    };

    return (
        <div
            className="fixed inset-0 z-[100] bg-black/60 flex justify-center overflow-y-auto backdrop-blur-sm scrollbar-hide animate-fadeIn"
            onClick={handleClose}
        >
            <div
                ref={modalRef}
                className="relative w-full max-w-[850px] bg-[#181818] rounded-sm shadow-2xl mt-24 mb-8 overflow-hidden animate-slideUp h-fit mx-4 ring-1 ring-white/10"
                onClick={(e) => e.stopPropagation()}
            >
                <button
                    onClick={handleClose}
                    className="absolute top-4 right-4 z-50 bg-[#181818] p-1.5 rounded-full hover:bg-[#2a2a2a] transition flex items-center justify-center border border-transparent hover:border-white/20"
                >
                    <XIcon size={24} className="text-white" />
                </button>

                {/* Hero Section */}
                <div className="relative h-[250px] sm:h-[350px] w-full bg-black group overflow-hidden">
                    <img
                        src={book.backdrop_path || book.poster_path}
                        className="w-full h-full object-cover object-[50%_30%] opacity-60"
                        alt={book.name || book.title}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#181818] via-transparent to-transparent z-10" />

                    <div className="absolute bottom-0 left-0 w-full p-6 md:p-12 space-y-4 md:space-y-6 z-20">
                        <h2 className="text-3xl sm:text-4xl md:text-5xl text-white drop-shadow-xl leading-none font-bold font-leaner tracking-wide">
                            {book.name || book.title}
                        </h2>

                        <div className="flex items-center space-x-3">
                            <button
                                onClick={() => handleReadClick()}
                                className="bg-white text-black px-6 sm:px-8 h-10 sm:h-12 rounded-[4px] font-bold text-base sm:text-lg flex items-center hover:bg-gray-200 transition"
                            >
                                <BookOpenIcon size={24} weight="fill" className="mr-2" />
                                {t('reads.read')}
                            </button>
                            <button
                                onClick={() => toggleList(book)}
                                className="border-2 border-gray-500 bg-[#2a2a2a]/60 text-gray-300 rounded-full w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center hover:border-white hover:text-white transition"
                            >
                                {isAdded ? <CheckIcon size={24} /> : <PlusIcon size={24} />}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="px-6 md:px-12 pb-12 bg-[#181818]">
                    <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr] gap-x-8 gap-y-6">
                        <div className="space-y-4">
                            <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-white font-medium text-sm md:text-base mt-2">
                                {chapters.length > 0 && (
                                    <span className="text-[#46d369] font-bold">{chapters.length} Comics</span>
                                )}
                                {/* Show release year from book or first issue */}
                                {(book.release_date || chapters[0]?.releaseDate) && (
                                    <span className="text-gray-400 font-light">{book.release_date || chapters[0]?.releaseDate}</span>
                                )}
                            </div>
                            <p className="text-gray-300 text-sm md:text-base leading-relaxed pt-2 max-w-prose">
                                {desc || book.overview}
                            </p>
                        </div>
                    </div>

                    {/* Comics - Matching TV Episodes Style Exactly */}
                    <div className="mt-10">
                        <div className="flex items-center justify-between mb-4 border-b border-gray-700 pb-2">
                            <h3 className="text-xl md:text-2xl font-bold text-white">Comics</h3>
                        </div>

                        <div className="space-y-4 max-h-[400px] overflow-y-auto scrollbar-hide pr-2">
                            {loading ? (
                                <div className="flex justify-center py-10"><div className="w-8 h-8 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div></div>
                            ) : chapters.length > 0 ? (
                                chapters.map((chapter) => (
                                    <div
                                        key={chapter.id}
                                        onClick={() => handleReadClick(chapter.id)}
                                        className="flex items-center group cursor-pointer p-4 rounded-sm hover:bg-[#333] transition border-b border-gray-800 last:border-0"
                                    >
                                        {/* Issue Number */}
                                        <div className="text-gray-400 text-xl font-medium w-8 text-center flex-shrink-0 mr-4">
                                            {chapter.chapterNumber}
                                        </div>

                                        {/* Thumbnail (Portrait for comics) */}
                                        <div className="relative w-20 h-28 md:w-24 md:h-32 bg-gray-800 flex-shrink-0 rounded overflow-hidden mr-4">
                                            {chapter.coverUrl ? (
                                                <img src={chapter.coverUrl} className="w-full h-full object-cover" alt={chapter.title} />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-gray-600">#{chapter.chapterNumber}</div>
                                            )}
                                            <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition" />
                                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                                                <div className="bg-white/90 rounded-full p-1 shadow-lg">
                                                    <BookOpenIcon size={16} weight="fill" className="text-black" />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Details */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between mb-1">
                                                <h4 className="text-white font-bold text-sm md:text-base truncate pr-4">
                                                    {chapter.title || `Issue #${chapter.chapterNumber}`}
                                                </h4>
                                                <span className="text-gray-400 text-xs whitespace-nowrap">
                                                    {chapter.releaseDate || ''}
                                                </span>
                                            </div>
                                            <p className="text-gray-400 text-xs md:text-sm line-clamp-2 leading-relaxed">
                                                Issue #{chapter.chapterNumber}
                                            </p>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-gray-500 text-center py-6">{t('reads.noChapters')}</div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BookDetailsModal;
