import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Movie } from '../types';
import { X, Play, Plus, Check, ArrowLeft, MagnifyingGlass } from '@phosphor-icons/react';

interface MobileInfoModalProps {
    movie: Movie;
    isOpen: boolean;
    onClose: () => void;
    isInList: boolean;
    onToggleList: () => void;
}

// Age rating colors
const getAgeRatingStyle = (rating: number) => {
    if (rating >= 18) return { bg: '#dc2626', text: '18+' }; // Red
    if (rating >= 15) return { bg: '#db2777', text: '15+' }; // Hot pink
    if (rating >= 13) return { bg: '#f59e0b', text: '13+' }; // Amber
    if (rating >= 7) return { bg: '#22c55e', text: '7+' };  // Green
    return { bg: '#3b82f6', text: 'All' }; // Blue
};

/**
 * Netflix-style movie/show details modal
 * - Full screen with YouTube player
 * - Title, year, age rating (colored), seasons, HD badge
 * - Play button, My List button
 * - Summary, Starring
 * - Tabs: Episodes | More Like This
 */
export default function MobileInfoModal({
    movie,
    isOpen,
    onClose,
    isInList,
    onToggleList
}: MobileInfoModalProps) {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<'episodes' | 'more'>('episodes');

    if (!isOpen || !movie) return null;

    const title = movie.title || movie.name || 'Unknown';
    const year = movie.release_date?.split('-')[0] || movie.first_air_date?.split('-')[0] || '';
    const isTV = movie.media_type === 'tv' || !!movie.first_air_date;
    const rating = Math.floor(Math.random() * 4) + 1; // Mock: 1-4 mapped to age rating
    const ageRating = getAgeRatingStyle(rating === 4 ? 18 : rating === 3 ? 15 : rating === 2 ? 13 : 7);

    // Mock actors
    const actors = ['Actor One', 'Actor Two', 'Actor Three', 'Actor Four'];

    const handlePlay = () => {
        const type = isTV ? 'tv' : 'movie';
        navigate(`/watch/${type}/${movie.id}`);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[100] bg-[#0a0a0a] overflow-y-auto">
            {/* App bar - back + search */}
            <div className="sticky top-0 z-10 flex items-center justify-between px-4 h-12 bg-[#0a0a0a]">
                <button onClick={onClose} className="p-1 -ml-1">
                    <ArrowLeft size={24} weight="bold" className="text-white" />
                </button>
                <button onClick={() => navigate('/search')} className="p-1">
                    <MagnifyingGlass size={24} weight="bold" className="text-white" />
                </button>
            </div>

            {/* YouTube Player Preview (mock) */}
            <div className="relative aspect-video bg-gray-900">
                {movie.backdrop_path ? (
                    <img
                        src={`https://image.tmdb.org/t/p/w780${movie.backdrop_path}`}
                        alt={title}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-500">
                        Preview not available
                    </div>
                )}
                {/* Play overlay */}
                <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                    <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center">
                        <Play weight="fill" size={32} className="text-white ml-1" />
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="px-4 py-4 space-y-4">
                {/* Title */}
                <h1 className="text-xl font-bold text-white">{title}</h1>

                {/* Meta info: Year | Age Rating | Seasons | HD */}
                <div className="flex items-center gap-3 text-sm">
                    <span className="text-gray-400">{year}</span>

                    {/* Age rating circle */}
                    <div
                        className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold text-white"
                        style={{ backgroundColor: ageRating.bg }}
                    >
                        {ageRating.text.replace('+', '')}
                    </div>

                    {isTV && (
                        <span className="text-gray-400">3 Seasons</span>
                    )}

                    {/* HD badge */}
                    <span className="px-1.5 py-0.5 border border-gray-500 text-gray-400 text-[10px] font-medium rounded">
                        HD
                    </span>
                </div>

                {/* Play Button */}
                <button
                    onClick={handlePlay}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-md bg-white text-black font-bold text-base active:scale-[0.98] transition-transform"
                >
                    <Play weight="fill" size={20} />
                    Play
                </button>

                {/* My List Button */}
                <button
                    onClick={onToggleList}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-md font-semibold text-base text-white active:scale-[0.98] transition-transform"
                    style={{ backgroundColor: '#333' }}
                >
                    {isInList ? (
                        <Check weight="bold" size={20} />
                    ) : (
                        <Plus weight="bold" size={20} />
                    )}
                    My List
                </button>

                {/* Summary */}
                <p className="text-sm text-gray-300 leading-relaxed">
                    {movie.overview || 'No description available.'}
                </p>

                {/* Starring */}
                <p className="text-xs text-gray-500">
                    <span className="text-gray-400">Starring: </span>
                    {actors.join(', ')}
                </p>
            </div>

            {/* Tabs: Episodes | More Like This */}
            <div className="border-t border-gray-800">
                <div className="flex">
                    <button
                        onClick={() => setActiveTab('episodes')}
                        className={`flex-1 py-3 text-sm font-semibold relative ${activeTab === 'episodes' ? 'text-white' : 'text-gray-500'
                            }`}
                    >
                        Episodes
                        {activeTab === 'episodes' && (
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-1 bg-red-600 rounded-b" />
                        )}
                    </button>
                    <button
                        onClick={() => setActiveTab('more')}
                        className={`flex-1 py-3 text-sm font-semibold relative ${activeTab === 'more' ? 'text-white' : 'text-gray-500'
                            }`}
                    >
                        More Like This
                        {activeTab === 'more' && (
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-1 bg-red-600 rounded-b" />
                        )}
                    </button>
                </div>
            </div>

            {/* Tab Content */}
            <div className="px-4 py-4 pb-24">
                {activeTab === 'episodes' ? (
                    <EpisodesTab isTV={isTV} />
                ) : (
                    <MoreLikeThisTab />
                )}
            </div>
        </div>
    );
}

// Episodes Tab
function EpisodesTab({ isTV }: { isTV: boolean }) {
    if (!isTV) {
        return (
            <div className="text-center py-8 text-gray-500">
                This is a movie. No episodes available.
            </div>
        );
    }

    const mockEpisodes = [
        { num: 1, title: 'Pilot', duration: '45m', description: 'The story begins...' },
        { num: 2, title: 'The Discovery', duration: '42m', description: 'Things get complicated...' },
        { num: 3, title: 'Turning Point', duration: '48m', description: 'A shocking revelation...' },
    ];

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
                <span className="text-white font-semibold">Season 1</span>
                <span className="text-gray-500 text-sm">3 Episodes</span>
            </div>
            {mockEpisodes.map((ep) => (
                <div key={ep.num} className="flex gap-3">
                    <div className="w-28 h-16 bg-gray-800 rounded flex-shrink-0" />
                    <div className="flex-1">
                        <div className="flex items-center gap-2">
                            <span className="text-white font-medium">{ep.num}. {ep.title}</span>
                            <span className="text-gray-500 text-xs">{ep.duration}</span>
                        </div>
                        <p className="text-gray-500 text-xs mt-1">{ep.description}</p>
                    </div>
                </div>
            ))}
        </div>
    );
}

// More Like This Tab - 4x3 grid
function MoreLikeThisTab() {
    return (
        <div className="grid grid-cols-3 gap-2">
            {Array.from({ length: 12 }).map((_, i) => (
                <div key={i} className="aspect-[2/3] bg-gray-800 rounded-md" />
            ))}
        </div>
    );
}
