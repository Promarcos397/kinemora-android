import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Movie } from '../types';
import { searchMovies } from '../services/api';
import { ArrowLeft, MagnifyingGlass, X } from '@phosphor-icons/react';
import { useGlobalContext } from '../context/GlobalContext';
import MobileInfoModal from '../components/MobileInfoModal';

/**
 * Mobile search page with back arrow and grid results
 */
export default function MobileSearchPage() {
    const navigate = useNavigate();
    const { myList, toggleList } = useGlobalContext();
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<Movie[]>([]);
    const [loading, setLoading] = useState(false);
    const [searched, setSearched] = useState(false);
    const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);

    const handleSearch = async () => {
        if (!query.trim()) return;
        setLoading(true);
        setSearched(true);
        try {
            const data = await searchMovies(query);
            setResults(data || []);
        } catch (err) {
            console.error('Search error:', err);
            setResults([]);
        }
        setLoading(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    const isInList = (id: number) => myList.some(item => item.id === id);

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white">
            {/* Page Bar with search input */}
            <div className="fixed top-0 left-0 right-0 h-14 bg-[#0a0a0a] flex items-center gap-3 px-4 z-50">
                <button onClick={() => navigate(-1)} className="p-1">
                    <ArrowLeft size={24} weight="bold" />
                </button>

                <div className="flex-1 relative">
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Search movies, shows..."
                        className="w-full bg-[#2a2a2a] text-white px-4 py-2.5 rounded-lg text-sm outline-none placeholder:text-gray-500"
                        autoFocus
                    />
                    {query && (
                        <button
                            onClick={() => setQuery('')}
                            className="absolute right-3 top-1/2 -translate-y-1/2"
                        >
                            <X size={18} className="text-gray-400" />
                        </button>
                    )}
                </div>

                <button onClick={handleSearch} className="p-1">
                    <MagnifyingGlass size={24} weight="bold" />
                </button>
            </div>

            {/* Results */}
            <div className="pt-16 px-4 pb-8">
                {loading ? (
                    <div className="flex items-center justify-center h-[50vh]">
                        <span className="text-gray-500">Searching...</span>
                    </div>
                ) : searched && results.length === 0 ? (
                    <div className="flex items-center justify-center h-[50vh]">
                        <span className="text-gray-500">No results found</span>
                    </div>
                ) : (
                    <div className="grid grid-cols-3 gap-2">
                        {results.map((item) => (
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
                                    <div className="w-full h-full flex items-center justify-center text-gray-600 text-xs p-1 text-center">
                                        {item.title || item.name}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

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
