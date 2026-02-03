import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeftIcon, CaretLeftIcon, CaretRightIcon, RowsIcon, ColumnsIcon } from '@phosphor-icons/react';

interface Page {
    img: string;
    page: number;
    loaded?: boolean;
    error?: boolean;
}

type ReadingMode = 'vertical' | 'horizontal';

const ReaderPage: React.FC = () => {
    const { type, id, chapterId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const { t } = useTranslation();

    // Core State
    const [pages, setPages] = useState<Page[]>([]);
    const [loading, setLoading] = useState(true);
    const [downloadProgress, setDownloadProgress] = useState(0);
    const [showControls, setShowControls] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [readingMode, setReadingMode] = useState<ReadingMode>('vertical');
    const [bookTitle, setBookTitle] = useState('');

    // Refs
    const controlsTimeout = useRef<NodeJS.Timeout | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const pageRefs = useRef<(HTMLImageElement | null)[]>([]);
    const hasRestoredPage = useRef(false);

    // Progress key for this specific issue
    const progressKey = `kinemora-reader-progress-${id}-${chapterId}`;

    // Load saved reading mode preference
    useEffect(() => {
        const savedMode = localStorage.getItem('kinemora-reader-mode') as ReadingMode;
        if (savedMode) setReadingMode(savedMode);
    }, []);

    // Fetch pages
    useEffect(() => {
        const fetchData = async () => {
            if (!chapterId || !id) return;
            setLoading(true);
            setDownloadProgress(0);
            hasRestoredPage.current = false;

            try {
                // Cloud Series / Local Reader
                if (type === 'local' || type === 'cloud' || type === 'series') {
                    let path = '';

                    if (type === 'cloud' || type === 'series') {
                        setDownloadProgress(10);
                        const streamRes = await (window as any).electron.cloud.stream(chapterId);
                        if (!streamRes.success) {
                            alert('Download Failed: ' + streamRes.error);
                            setLoading(false);
                            return;
                        }
                        path = streamRes.path;
                        setDownloadProgress(60);
                    } else {
                        path = decodeURIComponent(id || '');
                    }

                    setDownloadProgress(70);
                    const result = await (window as any).electron.local.getPages(path);
                    if (result && result.success) {
                        const pageData = result.pages.map((p: any, i: number) => ({
                            img: p.url,
                            page: i + 1,
                            loaded: false,
                            error: false
                        }));
                        setPages(pageData);
                        setDownloadProgress(100);
                    }
                    setLoading(false);
                    return;
                }

                // Consumet API fallback
                const api = (window as any).electron?.consumet?.books;
                if (api) {
                    const pageData = await api.getPages(chapterId, type || 'manga');
                    if (pageData && Array.isArray(pageData)) {
                        setPages(pageData.map((p: any, i: number) => ({ ...p, page: i + 1, loaded: false, error: false })));
                    } else if (pageData && pageData.images) {
                        setPages(pageData.images.map((p: any, i: number) => ({ ...p, page: i + 1, loaded: false, error: false })));
                    }
                }
            } catch (error) {
                console.error('Failed to load reader data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [chapterId, id, type]);

    // Restore saved page position after pages load
    useEffect(() => {
        if (pages.length > 0 && !hasRestoredPage.current) {
            hasRestoredPage.current = true;

            const savedProgress = localStorage.getItem(progressKey);
            if (savedProgress) {
                try {
                    const { page } = JSON.parse(savedProgress);
                    if (page && page > 1 && page <= pages.length) {
                        setCurrentPage(page);
                        // Scroll to saved page in vertical mode
                        if (readingMode === 'vertical') {
                            setTimeout(() => {
                                pageRefs.current[page - 1]?.scrollIntoView({ behavior: 'auto', block: 'start' });
                            }, 100);
                        }
                    }
                } catch (e) { /* ignore */ }
            }

            // Also save that we started reading this chapter
            localStorage.setItem(`kinemora-book-progress-${id}`, JSON.stringify({
                chapterId: chapterId,
                timestamp: Date.now()
            }));
        }
    }, [pages.length, progressKey, id, chapterId, readingMode]);

    // Save current page position periodically
    useEffect(() => {
        if (pages.length > 0 && currentPage > 0) {
            localStorage.setItem(progressKey, JSON.stringify({
                page: currentPage,
                total: pages.length,
                timestamp: Date.now()
            }));
        }
    }, [currentPage, pages.length, progressKey]);

    // Scroll tracking for vertical mode
    useEffect(() => {
        if (readingMode !== 'vertical' || !containerRef.current || pages.length === 0) return;

        const handleScroll = () => {
            const container = containerRef.current;
            if (!container) return;

            const containerHeight = container.clientHeight;
            const containerRect = container.getBoundingClientRect();

            // Find which page is most visible
            for (let i = 0; i < pageRefs.current.length; i++) {
                const img = pageRefs.current[i];
                if (img) {
                    const rect = img.getBoundingClientRect();
                    if (rect.top <= containerRect.top + containerHeight / 2 && rect.bottom >= containerRect.top + containerHeight / 2) {
                        setCurrentPage(i + 1);
                        break;
                    }
                }
            }
        };

        const container = containerRef.current;
        container.addEventListener('scroll', handleScroll, { passive: true });
        return () => container.removeEventListener('scroll', handleScroll);
    }, [readingMode, pages.length]);

    // Keyboard Navigation
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                handleBack();
            } else if (readingMode === 'horizontal') {
                if (e.key === 'ArrowRight' || e.key === ' ') {
                    e.preventDefault();
                    goToPage(Math.min(currentPage + 1, pages.length));
                } else if (e.key === 'ArrowLeft') {
                    e.preventDefault();
                    goToPage(Math.max(currentPage - 1, 1));
                }
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [readingMode, currentPage, pages.length]);

    // Preload adjacent pages
    useEffect(() => {
        if (pages.length === 0) return;

        for (let i = currentPage; i <= Math.min(currentPage + 3, pages.length); i++) {
            const img = new Image();
            img.src = pages[i - 1]?.img || '';
        }
    }, [currentPage, pages]);

    // Mouse movement to show/hide controls
    const handleMouseMove = useCallback(() => {
        setShowControls(true);
        if (controlsTimeout.current) clearTimeout(controlsTimeout.current);
        controlsTimeout.current = setTimeout(() => setShowControls(false), 3000);
    }, []);

    // Smart back navigation
    const handleBack = useCallback(() => {
        // Check if we came from a specific route
        const state = location.state as { from?: string } | null;

        if (state?.from) {
            navigate(state.from);
        } else if (type === 'series') {
            // For cloud comics, go back to reads page
            navigate('/reads');
        } else if (type === 'local') {
            navigate('/reads');
        } else {
            // Generic back
            navigate(-1);
        }
    }, [navigate, location.state, type]);

    const goToPage = useCallback((page: number) => {
        const clampedPage = Math.max(1, Math.min(page, pages.length));
        setCurrentPage(clampedPage);

        if (readingMode === 'vertical' && pageRefs.current[clampedPage - 1]) {
            pageRefs.current[clampedPage - 1]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }, [readingMode, pages.length]);

    const toggleReadingMode = useCallback(() => {
        const newMode = readingMode === 'vertical' ? 'horizontal' : 'vertical';
        setReadingMode(newMode);
        localStorage.setItem('kinemora-reader-mode', newMode);
    }, [readingMode]);

    // Handle image load/error
    const handleImageLoad = useCallback((index: number) => {
        setPages(prev => prev.map((p, i) => i === index ? { ...p, loaded: true } : p));
    }, []);

    const handleImageError = useCallback((index: number) => {
        setPages(prev => prev.map((p, i) => i === index ? { ...p, error: true } : p));
    }, []);

    const retryImage = useCallback((index: number) => {
        setPages(prev => prev.map((p, i) => i === index ? { ...p, error: false, loaded: false } : p));
    }, []);

    // Progress percentage
    const progressPercent = pages.length > 0 ? (currentPage / pages.length) * 100 : 0;

    return (
        <div
            className="fixed inset-0 bg-[#0a0a0a] z-[200] flex flex-col"
            onMouseMove={handleMouseMove}
        >
            {/* Header Controls */}
            <div className={`absolute top-0 left-0 right-0 h-14 bg-gradient-to-b from-black via-black/80 to-transparent z-50 flex items-center px-4 transition-all duration-300 ${showControls ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4 pointer-events-none'}`}>
                <button onClick={handleBack} className="text-white hover:text-gray-300 p-2 rounded-full hover:bg-white/10 transition">
                    <ArrowLeftIcon size={22} />
                </button>

                <div className="ml-3 flex items-center gap-2 text-sm">
                    <span className="text-white/90 font-medium">{currentPage}</span>
                    <span className="text-white/40">/</span>
                    <span className="text-white/60">{pages.length}</span>
                </div>

                <div className="flex-1" />

                {/* Reading Mode Toggle */}
                <button
                    onClick={toggleReadingMode}
                    className="text-white/80 hover:text-white p-2 rounded-full hover:bg-white/10 transition"
                    title={readingMode === 'vertical' ? 'Page Mode' : 'Scroll Mode'}
                >
                    {readingMode === 'vertical' ? <ColumnsIcon size={22} /> : <RowsIcon size={22} />}
                </button>
            </div>

            {/* Reading Canvas */}
            {loading ? (
                /* Loading State */
                <div className="flex-1 flex items-center justify-center">
                    <div className="flex flex-col items-center gap-4">
                        <div className="w-12 h-12 border-3 border-white/20 border-t-white rounded-full animate-spin" />
                        <div className="text-white/50 text-sm">
                            {downloadProgress > 0 && downloadProgress < 100
                                ? `Downloading... ${downloadProgress}%`
                                : 'Loading...'}
                        </div>
                    </div>
                </div>
            ) : readingMode === 'vertical' ? (
                /* Vertical (Scroll) Mode */
                <div
                    ref={containerRef}
                    className="flex-1 overflow-y-auto scrollbar-hide"
                >
                    <div className="max-w-[900px] mx-auto pt-14 pb-20">
                        {pages.map((page, index) => (
                            <div key={index} className="relative">
                                {/* Skeleton */}
                                {!page.loaded && !page.error && (
                                    <div className="bg-zinc-900/50 animate-pulse flex items-center justify-center min-h-[500px]">
                                        <span className="text-white/20 text-sm">{index + 1}</span>
                                    </div>
                                )}

                                {/* Error */}
                                {page.error && (
                                    <div className="bg-zinc-900 flex flex-col items-center justify-center min-h-[400px] gap-3">
                                        <span className="text-white/40 text-sm">Failed to load</span>
                                        <button
                                            onClick={() => retryImage(index)}
                                            className="px-4 py-1.5 bg-white/10 hover:bg-white/20 rounded text-white text-xs transition"
                                        >
                                            Retry
                                        </button>
                                    </div>
                                )}

                                {/* Image */}
                                {!page.error && (
                                    <img
                                        ref={(el) => { pageRefs.current[index] = el; }}
                                        src={page.img}
                                        className={`w-full h-auto block transition-opacity duration-200 ${page.loaded ? 'opacity-100' : 'opacity-0 absolute inset-0'}`}
                                        alt={`${index + 1}`}
                                        loading="lazy"
                                        onLoad={() => handleImageLoad(index)}
                                        onError={() => handleImageError(index)}
                                    />
                                )}
                            </div>
                        ))}

                        {/* End */}
                        <div className="py-12 text-center">
                            <div className="text-white/30 mb-4">End</div>
                            <button onClick={handleBack} className="px-6 py-2 bg-white/10 hover:bg-white/15 text-white text-sm rounded transition">
                                Back
                            </button>
                        </div>
                    </div>
                </div>
            ) : (
                /* Horizontal (Page) Mode */
                <div className="flex-1 flex items-center justify-center relative select-none">
                    {/* Left Arrow */}
                    <button
                        onClick={() => goToPage(currentPage - 1)}
                        disabled={currentPage <= 1}
                        className={`absolute left-4 z-10 p-3 rounded-full bg-black/60 hover:bg-black/80 transition ${currentPage <= 1 ? 'opacity-20' : 'text-white'}`}
                    >
                        <CaretLeftIcon size={28} weight="bold" />
                    </button>

                    {/* Page */}
                    <div className="max-w-[900px] max-h-[calc(100vh-120px)] flex items-center justify-center px-16">
                        {pages[currentPage - 1] && (
                            <div className="relative">
                                {!pages[currentPage - 1].loaded && !pages[currentPage - 1].error && (
                                    <div className="bg-zinc-900/50 animate-pulse flex items-center justify-center min-w-[300px] min-h-[450px] rounded">
                                        <span className="text-white/20">{currentPage}</span>
                                    </div>
                                )}

                                {pages[currentPage - 1].error ? (
                                    <div className="bg-zinc-900 flex flex-col items-center justify-center min-w-[300px] min-h-[450px] gap-3 rounded">
                                        <span className="text-white/40 text-sm">Failed</span>
                                        <button
                                            onClick={() => retryImage(currentPage - 1)}
                                            className="px-4 py-1.5 bg-white/10 hover:bg-white/20 rounded text-white text-xs transition"
                                        >
                                            Retry
                                        </button>
                                    </div>
                                ) : (
                                    <img
                                        src={pages[currentPage - 1].img}
                                        className={`max-h-[calc(100vh-120px)] max-w-full object-contain rounded shadow-xl transition-opacity duration-200 ${pages[currentPage - 1].loaded ? 'opacity-100' : 'opacity-0'}`}
                                        alt={`${currentPage}`}
                                        onLoad={() => handleImageLoad(currentPage - 1)}
                                        onError={() => handleImageError(currentPage - 1)}
                                    />
                                )}
                            </div>
                        )}
                    </div>

                    {/* Right Arrow */}
                    <button
                        onClick={() => goToPage(currentPage + 1)}
                        disabled={currentPage >= pages.length}
                        className={`absolute right-4 z-10 p-3 rounded-full bg-black/60 hover:bg-black/80 transition ${currentPage >= pages.length ? 'opacity-20' : 'text-white'}`}
                    >
                        <CaretRightIcon size={28} weight="bold" />
                    </button>

                    {/* Click zones */}
                    <div className="absolute left-0 top-0 bottom-0 w-1/3 cursor-pointer" onClick={() => goToPage(currentPage - 1)} />
                    <div className="absolute right-0 top-0 bottom-0 w-1/3 cursor-pointer" onClick={() => goToPage(currentPage + 1)} />
                </div>
            )}

            {/* Bottom Controls - Single unified bar */}
            <div className={`absolute bottom-0 left-0 right-0 h-14 bg-gradient-to-t from-black via-black/80 to-transparent z-50 flex items-center px-4 transition-all duration-300 ${showControls ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}>
                <span className="text-white/50 text-xs w-8">{currentPage}</span>
                <div className="flex-1 mx-3 relative">
                    {/* Progress track */}
                    <div className="h-1 bg-white/20 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-[#E50914] transition-all duration-150 rounded-full"
                            style={{ width: `${progressPercent}%` }}
                        />
                    </div>
                    {/* Slider overlay */}
                    <input
                        type="range"
                        min={1}
                        max={pages.length || 1}
                        value={currentPage}
                        onChange={(e) => goToPage(parseInt(e.target.value))}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                </div>
                <span className="text-white/50 text-xs w-8 text-right">{pages.length}</span>
            </div>
        </div>
    );
};

export default ReaderPage;
