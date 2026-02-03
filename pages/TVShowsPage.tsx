import React, { useState } from 'react';
import { REQUESTS } from '../constants';
import { Movie } from '../types';
import HeroCarousel from '../components/HeroCarousel';
import Row from '../components/Row';

interface PageProps {
  onSelectMovie: (movie: Movie, time?: number, videoId?: string) => void;
  onPlay: (movie: Movie) => void;
  seekTime?: number;
}

const TVShowsPage: React.FC<PageProps> = ({ onSelectMovie, onPlay, seekTime }) => {
  return (
    <>
      <HeroCarousel key="tv" onSelect={onSelectMovie} onPlay={onPlay} fetchUrl={REQUESTS.fetchTrendingTV} seekTime={seekTime} />
      {/* Removed overflow-hidden */}
      <main className="relative z-10 pb-12 -mt-12 sm:-mt-20 md:-mt-32 space-y-6 md:space-y-10">
        <Row title="Netflix Originals" fetchUrl={REQUESTS.fetchNetflixOriginals} onSelect={onSelectMovie} />
        <Row title="Action & Adventure TV" fetchUrl={REQUESTS.fetchActionTV} onSelect={onSelectMovie} />
        <Row title="Trending TV Shows" fetchUrl={REQUESTS.fetchTrending} onSelect={onSelectMovie} />

        {/* Separated Genres */}
        <Row title="Reality TV" fetchUrl={REQUESTS.fetchRealityTV} onSelect={onSelectMovie} />
        <Row title="TV Comedies" fetchUrl={REQUESTS.fetchComedyTV} onSelect={onSelectMovie} />
        <Row title="TV Dramas" fetchUrl={REQUESTS.fetchDramaTV} onSelect={onSelectMovie} />
        <Row title="Documentaries" fetchUrl={REQUESTS.fetchDocumentaries} onSelect={onSelectMovie} />
        <Row title="Crime TV Shows" fetchUrl={REQUESTS.fetchCrimeTV} onSelect={onSelectMovie} />
      </main>
    </>
  );
};

export default TVShowsPage;