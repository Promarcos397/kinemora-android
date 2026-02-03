import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { CaretLeftIcon, CaretRightIcon } from '@phosphor-icons/react';
import BookCard from './BookCard';
import { Movie } from '../types';

interface BookRowProps {
    title: string;
    type: 'manga' | 'comic' | 'local' | 'series' | 'cloud' | string;
    query?: string; // Query to search for (e.g., 'popular', 'trending')
    data?: Movie[]; // Optional static data
    onSelect: (book: Movie) => void;
}

const BookRow: React.FC<BookRowProps> = ({ title, type, query, data, onSelect }) => {
    const [books, setBooks] = useState<Movie[]>(data || []);
    const { t } = useTranslation();
    const listRef = React.useRef<HTMLDivElement>(null);
    const [showControls, setShowControls] = useState(false);
    const [isLoading, setIsLoading] = useState(!data);

    useEffect(() => {
        if (data) {
            setBooks(data);
            setIsLoading(false);
            return;
        }
        if (!query) return;

        const fetchBooks = async () => {
            setIsLoading(true);
            try {
                const api = (window as any).electron?.consumet?.books;
                if (api) {
                    const response = await api.search(query, type);
                    if (response && response.results) {
                        const mappedBooks: Movie[] = response.results.map((book: any) => ({
                            id: book.id,
                            title: book.title,
                            name: book.title,
                            poster_path: book.image, // Use absolute URL directly
                            backdrop_path: book.cover || book.image,
                            overview: book.description || '',
                            vote_average: book.rating || 0,
                            media_type: type,
                            release_date: book.releaseDate,
                            image_url: book.image
                        }));
                        setBooks(mappedBooks);
                    }
                }
            } catch (error) {
                console.error('Error fetching books:', error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchBooks();
    }, [query, type, data]);

    const handleScroll = (direction: 'left' | 'right') => {
        if (listRef.current) {
            const { scrollLeft, clientWidth } = listRef.current;
            const scrollTo = direction === 'left' ? scrollLeft - clientWidth : scrollLeft + clientWidth;
            listRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
        }
    };

    if (isLoading) {
        return (
            <div className="space-y-2 md:space-y-4 px-4 md:px-12 my-6">
                <div className="h-6 w-48 bg-gray-800 rounded animate-pulse" />
                <div className="flex gap-4 overflow-hidden">
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className="min-w-[160px] h-[240px] bg-gray-800 rounded animate-pulse" />
                    ))}
                </div>
            </div>
        );
    }

    if (!books.length) return null; // Hide if empty to avoid clutter, or show message if debugging

    return (
        <div
            className="space-y-2 md:space-y-4 px-4 md:px-12 group relative"
            onMouseEnter={() => setShowControls(true)}
            onMouseLeave={() => setShowControls(false)}
        >
            <h2 className="text-white text-md md:text-xl font-bold transition duration-200 hover:text-gray-300 cursor-pointer">
                {title}
            </h2>

            <div className="relative group/row">
                {/* Left Arrow */}
                <div
                    className={`absolute top-8 bottom-12 left-[-30px] w-12 bg-black/50 z-40 flex items-center justify-center cursor-pointer opacity-0 transition group-hover/row:opacity-100 hover:bg-black/70 rounded-r-md ${!showControls && 'hidden'}`}
                    onClick={() => handleScroll('left')}
                >
                    <CaretLeftIcon className="text-white w-8 h-8" />
                </div>

                {/* The List of Cards */}
                <div
                    ref={listRef}
                    className="flex items-center gap-2 md:gap-4 overflow-x-scroll scrollbar-hide scroll-smooth pb-12 pt-8 -my-8 px-1"
                >
                    {books.map((book) => (
                        <div key={book.id}>
                            <BookCard book={book} onSelect={onSelect} />
                        </div>
                    ))}
                </div>

                {/* Right Arrow */}
                <div
                    className={`absolute top-8 bottom-12 right-[-30px] w-12 bg-black/50 z-40 flex items-center justify-center cursor-pointer opacity-0 transition group-hover/row:opacity-100 hover:bg-black/70 rounded-l-md ${!showControls && 'hidden'}`}
                    onClick={() => handleScroll('right')}
                >
                    <CaretRightIcon className="text-white w-8 h-8" />
                </div>
            </div>
        </div>
    );
};

export default BookRow;
