import React, { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { BookOpenIcon, InfoIcon, PlusIcon, CheckIcon } from '@phosphor-icons/react';
import { Movie } from '../types';
import { useGlobalContext } from '../context/GlobalContext';

interface BookCardProps {
    book: Movie;
    onSelect: (book: Movie) => void;
    isGrid?: boolean;
}

const BookCard: React.FC<BookCardProps> = ({ book, onSelect, isGrid = false }) => {
    const { t } = useTranslation();
    const { myList, toggleList } = useGlobalContext();
    const [isHovered, setIsHovered] = useState(false);
    const hoverTimerRef = useRef<any>(null);

    const isAdded = myList.find(m => m.id === book.id);

    // Add 400ms delay before triggering hover to prevent scroll interruption
    const handleMouseEnter = () => {
        hoverTimerRef.current = setTimeout(() => {
            setIsHovered(true);
        }, 400);
    };

    const handleMouseLeave = () => {
        if (hoverTimerRef.current) {
            clearTimeout(hoverTimerRef.current);
            hoverTimerRef.current = null;
        }
        setIsHovered(false);
    };

    return (
        <div
            className={`relative group transition-all duration-300 z-10 flex-none
                ${isGrid ? 'w-full' : 'w-[160px] md:w-[200px]'}
            `}
            style={{ aspectRatio: '2/3' }}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onClick={() => onSelect(book)}
        >
            {/* Main Container - Scales on Hover */}
            <div className={`
                absolute inset-0 transition-all duration-300 ease-in-out
                ${isHovered ? 'z-50 scale-110 shadow-xl ring-2 ring-gray-700' : 'z-10'}
                bg-[#181818] rounded-md overflow-hidden cursor-pointer
            `}>
                {/* Image */}
                <div className="relative w-full h-full">
                    <img
                        src={book.poster_path || book.backdrop_path || book.image_url}
                        alt={book.title || book.name}
                        className={`w-full h-full object-cover transition-opacity duration-300 ${isHovered ? 'opacity-40' : 'opacity-100'}`}
                        loading="lazy"
                    />
                </div>

                {/* Content Overlay - Visible on Hover */}
                <div className={`
                    absolute inset-0 flex flex-col justify-end p-4 
                    transition-opacity duration-300
                    ${isHovered ? 'opacity-100' : 'opacity-0'}
                `}>
                    {/* Title */}
                    <h3 className="text-white font-bold text-lg leading-tight mb-2 line-clamp-2 drop-shadow-md">
                        {book.title || book.name}
                    </h3>

                    {/* Metadata */}
                    <div className="flex items-center gap-2 mb-4 text-xs font-medium text-gray-300">
                        <span className="text-[#46d369]">98% Match</span>
                        <span className="border border-gray-500 px-1 rounded text-[10px]">HD</span>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between gap-2">
                        <button
                            onClick={(e) => { e.stopPropagation(); onSelect(book); }}
                            className="bg-white text-black rounded-full p-2 hover:bg-gray-200 transition flex-shrink-0"
                            title="Read Now"
                        >
                            <BookOpenIcon size={20} weight="fill" />
                        </button>

                        <button
                            onClick={(e) => { e.stopPropagation(); toggleList(book); }}
                            className="border-2 border-gray-500 rounded-full p-1.5 hover:border-white text-gray-300 hover:text-white transition flex-shrink-0"
                            title={isAdded ? "Remove from List" : "Add to List"}
                        >
                            {isAdded ? <CheckIcon size={18} /> : <PlusIcon size={18} />}
                        </button>

                        <button
                            onClick={(e) => { e.stopPropagation(); onSelect(book); }}
                            className="border-2 border-gray-500 rounded-full p-1.5 hover:border-white text-gray-300 hover:text-white transition flex-shrink-0 ml-auto"
                            title="More Info"
                        >
                            <InfoIcon size={18} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BookCard;
