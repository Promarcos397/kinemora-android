import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Movie } from '../types';
import { useGlobalContext } from '../context/GlobalContext';
import MobilePageBar from '../components/MobilePageBar';
import MobileBottomNav from '../components/MobileBottomNav';
import MobileSettingsSheet from '../components/MobileSettingsSheet';
import MobileInfoModal from '../components/MobileInfoModal';
import { Plus, Check } from '@phosphor-icons/react';

/**
 * My List page - shows user's saved content
 */
export default function MobileMyListPage() {
    const navigate = useNavigate();
    const { myList, toggleList } = useGlobalContext();
    const [settingsSheetOpen, setSettingsSheetOpen] = useState(false);
    const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);

    const isInList = (id: number) => myList.some(item => item.id === id);

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white pb-16">
            {/* Page Bar */}
            <MobilePageBar
                title="My List"
                onMenuClick={() => setSettingsSheetOpen(true)}
            />

            {/* Content */}
            <div className="pt-14 px-4">
                {myList.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-[60vh] text-gray-500">
                        <Plus size={48} className="mb-4" />
                        <p className="text-center">Your list is empty</p>
                        <p className="text-center text-sm mt-2">
                            Add movies and shows to keep track of what you want to watch
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-3 gap-2 pt-4">
                        {myList.map((item) => (
                            <div
                                key={item.id}
                                className="aspect-[2/3] bg-gray-800 rounded overflow-hidden cursor-pointer relative"
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
                                    <div className="w-full h-full flex items-center justify-center text-gray-600 text-xs p-1 text-center">
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
