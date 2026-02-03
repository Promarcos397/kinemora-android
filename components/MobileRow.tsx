import React, { useRef } from 'react';
import { Movie } from '../types';

interface MobileRowProps {
    title?: string;
    movies: Movie[];
    onMovieClick: (movie: Movie) => void;
    cardWidth?: number;
}

/**
 * Mobile horizontal row - touch-friendly, no arrows
 * Uses momentum scrolling with snap
 */
export default function MobileRow({
    title,
    movies,
    onMovieClick,
    cardWidth = 110
}: MobileRowProps) {
    const scrollRef = useRef<HTMLDivElement>(null);

    if (!movies || movies.length === 0) return null;

    return (
        <div className="mb-4">
            {/* Row title */}
            {title && (
                <h2 className="px-4 text-base font-semibold mb-2">{title}</h2>
            )}

            {/* Scrollable row - NO ARROWS */}
            <div
                ref={scrollRef}
                className="row-scroll px-4"
                style={{ scrollSnapType: 'x mandatory' }}
            >
                {movies.map((movie) => {
                    const posterUrl = movie.poster_path
                        ? `https://image.tmdb.org/t/p/w342${movie.poster_path}`
                        : '/placeholder.jpg';

                    return (
                        <button
                            key={movie.id}
                            onClick={() => onMovieClick(movie)}
                            className="flex-shrink-0"
                            style={{ width: cardWidth, scrollSnapAlign: 'start' }}
                        >
                            <img
                                src={posterUrl}
                                alt={movie.title || movie.name}
                                className="w-full aspect-[2/3] object-cover rounded"
                                loading="lazy"
                            />
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
