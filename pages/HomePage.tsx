import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { REQUESTS } from '../constants';
import { Movie } from '../types';
import HeroCarousel from '../components/HeroCarousel';
import Row from '../components/Row';
import { useGlobalContext } from '../context/GlobalContext';
import { getRecommendations } from '../services/api';

interface PageProps {
  onSelectMovie: (movie: Movie, time?: number, videoId?: string) => void;
  onPlay: (movie: Movie) => void;
  seekTime?: number;
}

const HomePage: React.FC<PageProps> = ({ onSelectMovie, onPlay, seekTime }) => {
  const { myList, continueWatching } = useGlobalContext();
  const { t } = useTranslation();
  const [recommendationMovie, setRecommendationMovie] = useState<Movie | null>(null);
  const [recommendations, setRecommendations] = useState<Movie[]>([]);
  const [cloudHero, setCloudHero] = useState<Movie | undefined>(undefined);

  // Pick a random movie from 'My List' and fetch recommendations for it
  useEffect(() => {
    if (myList.length > 0) {
      const randomMovie = myList[Math.floor(Math.random() * myList.length)];
      setRecommendationMovie(randomMovie);

      const fetchRecs = async () => {
        const type = (randomMovie.media_type || (randomMovie.title ? 'movie' : 'tv')) as 'movie' | 'tv';
        const recs = await getRecommendations(randomMovie.id, type);
        setRecommendations(recs);
      };
      fetchRecs();
    }
  }, [myList.length]);

  return (
    <>
      {/* Cloud Hero takes precedence if available */}
      <HeroCarousel
        key="home"
        onSelect={onSelectMovie}
        onPlay={onPlay}
        fetchUrl={REQUESTS.fetchPopular}
        seekTime={seekTime}
      />
      {/* Main Content */}
      <main className="relative z-10 pb-12 -mt-12 sm:-mt-20 md:-mt-32 space-y-6 md:space-y-10">

        {/* Continue Watching Row - Pinned to top if exists */}
        {continueWatching.length > 0 && (
          <Row title={t('rows.continueWatching')} data={continueWatching} onSelect={onSelectMovie} />
        )}

        {myList.length > 0 && <Row title={t('rows.myList')} data={myList} onSelect={onSelectMovie} />}

        {/* Dynamic Recommendation Row */}
        {recommendationMovie && recommendations.length > 0 && (
          <Row
            title={`${t('rows.recommended')} (${recommendationMovie.title || recommendationMovie.name})`}
            data={recommendations}
            onSelect={onSelectMovie}
          />
        )}

        <Row title={t('rows.trending')} fetchUrl={REQUESTS.fetchTrending} onSelect={onSelectMovie} />
        <Row title={t('rows.action')} fetchUrl={REQUESTS.fetchActionMovies} onSelect={onSelectMovie} />
        <Row title={t('rows.netflixOriginals')} fetchUrl={REQUESTS.fetchNetflixOriginals} onSelect={onSelectMovie} />

        {/* Separated Genres */}
        <Row title={t('rows.romance')} fetchUrl={REQUESTS.fetchRomanceMovies} onSelect={onSelectMovie} />
        <Row title={t('rows.comedy')} fetchUrl={REQUESTS.fetchComedyMovies} onSelect={onSelectMovie} />
        <Row title={t('rows.sciFi')} fetchUrl={REQUESTS.fetchSciFiMovies} onSelect={onSelectMovie} />
        <Row title={t('rows.documentaries')} fetchUrl={REQUESTS.fetchDocumentaries} onSelect={onSelectMovie} />
        <Row title={t('rows.horror')} fetchUrl={REQUESTS.fetchHorrorMovies} onSelect={onSelectMovie} />
      </main>
    </>
  );
};

export default HomePage;