import React, { useMemo } from 'react';
import { Movie } from '../types';
import { Play, Plus, Check } from '@phosphor-icons/react';

interface HeroCardProps {
    movie: Movie;
    isInList: boolean;
    onPlay: () => void;
    onToggleList: () => void;
    onPress: () => void;
}

/**
 * Hero Card - Big poster card (50%+ of screen)
 * Shows poster image, title, tags, Play + My List buttons
 * Background could reflect poster colors (TODO: color extraction)
 */
export default function HeroCard({
    movie,
    isInList,
    onPlay,
    onToggleList,
    onPress
}: HeroCardProps) {
    const posterUrl = movie.poster_path
        ? `https://image.tmdb.org/t/p/w780${movie.poster_path}`
        : '/placeholder.jpg';

    const title = movie.title || movie.name || 'Unknown';

    // Generate tags from TMDB data
    const tags = useMemo(() => {
        const t: string[] = [];

        // Add genres if available
        if (movie.genre_ids) {
            const genreMap: { [key: number]: string } = {
                28: 'Action', 12: 'Adventure', 16: 'Animation', 35: 'Comedy',
                80: 'Crime', 99: 'Documentary', 18: 'Drama', 10751: 'Family',
                14: 'Fantasy', 36: 'History', 27: 'Horror', 10402: 'Music',
                9648: 'Mystery', 10749: 'Romance', 878: 'Sci-Fi', 10770: 'TV Movie',
                53: 'Thriller', 10752: 'War', 37: 'Western',
                10759: 'Action & Adventure', 10762: 'Kids', 10763: 'News',
                10764: 'Reality', 10765: 'Sci-Fi & Fantasy', 10766: 'Soap',
                10767: 'Talk', 10768: 'War & Politics'
            };
            movie.genre_ids.slice(0, 3).forEach(id => {
                if (genreMap[id]) t.push(genreMap[id]);
            });
        }

        // Add media type
        if (movie.media_type === 'tv') t.push('TV Series');
        else if (movie.media_type === 'movie') t.push('Film');

        // Add year
        const date = movie.release_date || movie.first_air_date;
        if (date) t.push(new Date(date).getFullYear().toString());

        return t;
    }, [movie]);

    return (
        <div className="hero-card" onClick={onPress}>
            {/* Poster image */}
            <img
                src={posterUrl}
                alt={title}
                className="hero-card-image"
                loading="eager"
            />

            {/* Gradient overlay */}
            <div className="hero-card-gradient" />

            {/* Content */}
            <div className="hero-card-content">
                <h1 className="hero-card-title">{title}</h1>

                {/* Tags */}
                <div className="hero-card-tags">
                    {tags.map((tag, i) => (
                        <span key={i} className="hero-card-tag">{tag}</span>
                    ))}
                </div>

                {/* Buttons */}
                <div className="hero-card-buttons">
                    <button
                        onClick={(e) => { e.stopPropagation(); onPlay(); }}
                        className="btn-play"
                    >
                        <Play weight="fill" size={18} />
                        Play
                    </button>
                    <button
                        onClick={(e) => { e.stopPropagation(); onToggleList(); }}
                        className="btn-list"
                    >
                        {isInList ? <Check weight="bold" size={18} /> : <Plus weight="bold" size={18} />}
                        My List
                    </button>
                </div>
            </div>
        </div>
    );
}
