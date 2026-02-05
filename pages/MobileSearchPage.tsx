import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Movie } from '../types';
import { searchMovies } from '../services/api';
import { ArrowLeft, MagnifyingGlass, X } from '@phosphor-icons/react';

/**
 * Mobile Search Page - Netflix-style search
 */
export default function MobileSearchPage() {
    const navigate = useNavigate();
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<Movie[]>([]);
    const [loading, setLoading] = useState(false);
    const [searched, setSearched] = useState(false);

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
        } finally {
            setLoading(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') handleSearch();
    };

    const handleMovieClick = (movie: Movie) => {
        const type = movie.media_type || (movie.title ? 'movie' : 'tv');
        navigate(`/watch/${type}/${movie.id}`);
    };

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white pb-20">
            {/* Search Bar */}
            <div className="fixed top-0 left-0 right-0 bg-[#0a0a0a] z-50 p-4">
                <div className="flex items-center gap-3">
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
                            className="w-full bg-[#1a1a1a] text-white px-4 py-3 pr-10 rounded-lg text-sm"
                            autoFocus
                        />
                        {query && (
                            <button
                                onClick={() => { setQuery(''); setResults([]); setSearched(false); }}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                            >
                                <X size={18} />
                            </button>
                        )}
                    </div>
                    <button onClick={handleSearch} className="p-1">
                        <MagnifyingGlass size={24} />
                    </button>
                </div>
            </div>

            {/* Results */}
            <div className="pt-20 px-4">
                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="w-8 h-8 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                    </div>
                ) : results.length > 0 ? (
                    <div className="grid grid-cols-3 gap-2">
                        {results.map((movie) => (
                            movie.poster_path && (
                                <button
                                    key={movie.id}
                                    onClick={() => handleMovieClick(movie)}
                                    className="aspect-[2/3] rounded overflow-hidden"
                                >
                                    <img
                                        src={`https://image.tmdb.org/t/p/w342${movie.poster_path}`}
                                        alt={movie.title || movie.name || ''}
                                        className="w-full h-full object-cover"
                                        loading="lazy"
                                    />
                                </button>
                            )
                        ))}
                    </div>
                ) : searched ? (
                    <div className="text-center text-gray-400 py-20">
                        <p className="text-lg mb-2">No results found</p>
                        <p className="text-sm">Try different keywords</p>
                    </div>
                ) : (
                    <div className="text-center text-gray-400 py-20">
                        <MagnifyingGlass size={48} className="mx-auto mb-4 opacity-50" />
                        <p>Search for movies and TV shows</p>
                    </div>
                )}
            </div>
        </div>
    );
}
