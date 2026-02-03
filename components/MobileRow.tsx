import React from 'react';
import { Movie } from '../types';

interface MobileRowProps {
    title: string;
    movies: Movie[];
    onMovieClick: (movie: Movie) => void;
}

/**
 * Mobile Row - Horizontal scrolling content row with poster cards
 * Touch-friendly, no arrows, momentum scrolling
 */
export default function MobileRow({ title, movies, onMovieClick }: MobileRowProps) {
    if (!movies || movies.length === 0) return null;

    return (
        <div className="content-section">
            <h2 className="content-section-title">{title}</h2>
            <div className="content-row">
                {movies.map((movie) => {
                    const posterUrl = movie.poster_path
                        ? `https://image.tmdb.org/t/p/w342${movie.poster_path}`
                        : '/placeholder.jpg';

                    return (
                        <button
                            key={movie.id}
                            onClick={() => onMovieClick(movie)}
                            className="poster-card"
                        >
                            <img
                                src={posterUrl}
                                alt={movie.title || movie.name || 'Movie'}
                                loading="lazy"
                            />
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
