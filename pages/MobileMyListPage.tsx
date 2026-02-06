import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGlobalContext } from '../context/GlobalContext';
import { Movie } from '../types';

// Components
import MobilePageBar from '../components/MobilePageBar';
import MobileBottomNav from '../components/MobileBottomNav';
import MobileSettingsSheet from '../components/MobileSettingsSheet';
import MobileInfoModal from '../components/MobileInfoModal';

/**
 * Netflix-style My List page
 * - 3-column grid of posters
 * - Clean minimal layout
 */
export default function MobileMyListPage() {
    const navigate = useNavigate();
    const { myList, toggleList } = useGlobalContext();
    const [settingsSheetOpen, setSettingsSheetOpen] = useState(false);
    const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);

    const isInList = (id: number) => myList.some(item => item.id === id);

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white pb-24">
            {/* Page Bar */}
            <MobilePageBar
                title="My List"
                onMenuClick={() => setSettingsSheetOpen(true)}
            />

            {/* Content */}
            <div className="pt-16 px-2">
                {myList.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-24 text-center">
                        <p className="text-gray-400 text-lg mb-2">Your list is empty</p>
                        <p className="text-gray-500 text-sm">
                            Tap + on any title to add it here
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-3 gap-2 py-4">
                        {myList.map((item) => (
                            <div
                                key={item.id}
                                className="aspect-[2/3] bg-gray-800 rounded overflow-hidden cursor-pointer"
                                onClick={() => setSelectedMovie(item)}
                            >
                                {item.poster_path ? (
                                    <img
                                        src={`https://image.tmdb.org/t/p/w300${item.poster_path}`}
                                        alt={item.title || item.name}
                                        className="w-full h-full object-cover"
                                        loading="lazy"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center p-2 text-center text-gray-500 text-xs">
                                        {item.title || item.name}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Bottom Navigation */}
            <MobileBottomNav />

            {/* Settings Sheet */}
            <MobileSettingsSheet
                isOpen={settingsSheetOpen}
                onClose={() => setSettingsSheetOpen(false)}
            />

            {/* Info Modal */}
            {selectedMovie && (
                <MobileInfoModal
                    movie={selectedMovie}
                    isOpen={!!selectedMovie}
                    onClose={() => setSelectedMovie(null)}
                    isInList={isInList(Number(selectedMovie.id))}
                    onToggleList={() => toggleList(selectedMovie)}
                />
            )}
        </div>
    );
}
