import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Movie } from '../types';
import { useGlobalContext } from '../context/GlobalContext';
import MobilePageBar from '../components/MobilePageBar';
import MobileBottomNav from '../components/MobileBottomNav';
import MobileSettingsSheet from '../components/MobileSettingsSheet';
import MobileInfoModal from '../components/MobileInfoModal';

// Mock comic/manga data - in real app would come from API
const MOCK_COMICS = [
    { id: 1, title: 'One Piece', poster_path: null, overview: 'A pirate adventure manga' },
    { id: 2, title: 'Naruto', poster_path: null, overview: 'A ninja adventure manga' },
    { id: 3, title: 'Attack on Titan', poster_path: null, overview: 'Humanity fights titans' },
    { id: 4, title: 'My Hero Academia', poster_path: null, overview: 'Superheroes in training' },
    { id: 5, title: 'Demon Slayer', poster_path: null, overview: 'A demon slaying adventure' },
    { id: 6, title: 'Jujutsu Kaisen', poster_path: null, overview: 'Curse fighting manga' },
];

/**
 * Reads page - for comics/manga content
 * Same layout as Home but for reading content
 */
export default function MobileReadsPage() {
    const navigate = useNavigate();
    const { myList, addToList, removeFromList } = useGlobalContext();
    const [settingsSheetOpen, setSettingsSheetOpen] = useState(false);
    const [selectedComic, setSelectedComic] = useState<any | null>(null);
    const [loading, setLoading] = useState(false);

    // In a real implementation, this would fetch from Consumet API for manga
    const comics = MOCK_COMICS;

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white pb-16">
            {/* Page Bar */}
            <MobilePageBar
                title="Reads"
                onMenuClick={() => setSettingsSheetOpen(true)}
            />

            {/* Content */}
            <div className="pt-14 px-4">
                {loading ? (
                    <div className="flex items-center justify-center h-[50vh]">
                        <span className="text-gray-500">Loading...</span>
                    </div>
                ) : (
                    <>
                        {/* Featured Section */}
                        <div className="py-4">
                            <h2 className="text-lg font-bold mb-3">Featured Comics</h2>
                            <div className="grid grid-cols-3 gap-2">
                                {comics.map((comic) => (
                                    <div
                                        key={comic.id}
                                        className="aspect-[2/3] bg-gradient-to-br from-purple-900 to-indigo-900 rounded overflow-hidden cursor-pointer flex items-center justify-center"
                                        onClick={() => setSelectedComic(comic)}
                                    >
                                        <span className="text-white text-xs font-medium text-center px-2">
                                            {comic.title}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Categories */}
                        <div className="py-4">
                            <h2 className="text-lg font-bold mb-3">Browse by Genre</h2>
                            <div className="flex gap-2 overflow-x-auto scrollbar-hide">
                                {['Action', 'Romance', 'Fantasy', 'Horror', 'Comedy', 'Drama'].map((genre) => (
                                    <button
                                        key={genre}
                                        className="px-4 py-2 bg-[#2a2a2a] rounded-full text-sm flex-shrink-0"
                                    >
                                        {genre}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Continue Reading */}
                        <div className="py-4">
                            <h2 className="text-lg font-bold mb-3">Continue Reading</h2>
                            <div className="text-gray-500 text-sm">
                                No reading history yet. Start reading to see your progress here.
                            </div>
                        </div>
                    </>
                )}
            </div>

            {/* Bottom Navigation */}
            <MobileBottomNav />

            {/* Settings Sheet */}
            <MobileSettingsSheet
                isOpen={settingsSheetOpen}
                onClose={() => setSettingsSheetOpen(false)}
            />
        </div>
    );
}
