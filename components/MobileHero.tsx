import React from 'react';
import { Movie } from '../types';
import { Play, Plus } from '@phosphor-icons/react';

interface MobileHeroProps {
    movie: Movie;
    onPlay: () => void;
    onAddToList: () => void;
    onOpen: () => void;
}

/**
 * Mobile Hero - Vertical poster-based hero like Netflix mobile
 * Uses poster image, no trailer, thin buttons
 */
export default function MobileHero({ movie, onPlay, onAddToList, onOpen }: MobileHeroProps) {
    const posterUrl = movie.poster_path
        ? `https://image.tmdb.org/t/p/w780${movie.poster_path}`
        : '/placeholder.jpg';

    const title = movie.title || movie.name || 'Unknown';

    // Generate content tags
    const tags: string[] = [];
    if (movie.vote_average) tags.push(`${movie.vote_average.toFixed(1)}★`);
    if (movie.release_date) tags.push(new Date(movie.release_date).getFullYear().toString());
    if (movie.media_type === 'tv') tags.push('Series');
    if (movie.media_type === 'movie') tags.push('Film');

    return (
        <div className="mobile-hero" onClick={onOpen}>
            {/* Poster background */}
            <img
                src={posterUrl}
                alt={title}
                className="absolute inset-0 w-full h-full object-cover"
            />

            {/* Gradient overlay */}
            <div className="mobile-hero-gradient" />

            {/* Content */}
            <div className="relative z-10 flex flex-col gap-3">
                {/* Title */}
                <h1 className="text-3xl font-bold drop-shadow-lg">{title}</h1>

                {/* Tags */}
                <div className="content-tags">
                    {tags.map((tag, i) => (
                        <span key={i}>{tag}</span>
                    ))}
                </div>

                {/* Buttons */}
                <div className="flex gap-2 mt-2">
                    <button
                        onClick={(e) => { e.stopPropagation(); onPlay(); }}
                        className="btn-primary flex-1"
                    >
                        <Play weight="fill" size={18} />
                        Play
                    </button>
                    <button
                        onClick={(e) => { e.stopPropagation(); onAddToList(); }}
                        className="btn-secondary flex-1"
                    >
                        <Plus weight="bold" size={18} />
                        My List
                    </button>
                </div>
            </div>
        </div>
    );
}
