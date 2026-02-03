import React from 'react';
import { useTranslation } from 'react-i18next';
import { REQUESTS } from '../constants';
import { Movie } from '../types';
import HeroCarousel from '../components/HeroCarousel';
import Row from '../components/Row';

interface PageProps {
  onSelectMovie: (movie: Movie, time?: number, videoId?: string) => void;
  onPlay: (movie: Movie) => void;
  seekTime?: number;
}

const MoviesPage: React.FC<PageProps> = ({ onSelectMovie, onPlay, seekTime }) => {
  const { t } = useTranslation();
  return (
    <>
      <HeroCarousel key="movies" onSelect={onSelectMovie} onPlay={onPlay} fetchUrl={REQUESTS.fetchTopRated} seekTime={seekTime} />
      {/* Removed overflow-hidden */}
      <main className="relative z-10 pb-12 -mt-12 sm:-mt-20 md:-mt-32 space-y-6 md:space-y-10">
        <Row title={t('rows.topRated')} fetchUrl={REQUESTS.fetchTopRated} onSelect={onSelectMovie} />
        <Row title={t('rows.action')} fetchUrl={REQUESTS.fetchActionMovies} onSelect={onSelectMovie} />
        <Row title={t('rows.trending')} fetchUrl={REQUESTS.fetchTrending} onSelect={onSelectMovie} />

        {/* Separated Genres */}
        <Row title={t('rows.sciFi')} fetchUrl={REQUESTS.fetchSciFiMovies} onSelect={onSelectMovie} />
        <Row title={t('rows.comedy')} fetchUrl={REQUESTS.fetchComedyMovies} onSelect={onSelectMovie} />
        <Row title={t('rows.romance')} fetchUrl={REQUESTS.fetchRomanceMovies} onSelect={onSelectMovie} />
        <Row title={t('rows.horror')} fetchUrl={REQUESTS.fetchHorrorMovies} onSelect={onSelectMovie} />
      </main>
    </>
  );
};

export default MoviesPage;