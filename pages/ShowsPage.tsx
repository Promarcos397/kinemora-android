import React from 'react';
import { useTranslation } from 'react-i18next';
import { REQUESTS } from '../constants';
import { Movie } from '../types';
import ShowsHeroCarousel from '../components/ShowsHeroCarousel';
import Row from '../components/Row';

interface PageProps {
    onSelectMovie: (movie: Movie, time?: number, videoId?: string) => void;
    onPlay: (movie: Movie) => void;
}

const ShowsPage: React.FC<PageProps> = ({ onSelectMovie, onPlay }) => {
    const { t } = useTranslation();
    return (
        <>
            <ShowsHeroCarousel
                fetchUrl={REQUESTS.fetchTrendingTV}
                onSelect={onSelectMovie}
                onPlay={onPlay}
            />
            <main className="relative z-10 pb-12 -mt-12 sm:-mt-20 md:-mt-32 space-y-6 md:space-y-10">
                <Row title={t('rows.netflixOriginals')} fetchUrl={REQUESTS.fetchNetflixOriginals} onSelect={onSelectMovie} />
                <Row title={t('rows.action')} fetchUrl={REQUESTS.fetchActionTV} onSelect={onSelectMovie} />
                <Row title={t('rows.trending')} fetchUrl={REQUESTS.fetchTrending} onSelect={onSelectMovie} />

                {/* Separated Genres */}
                <Row title={t('rows.reality')} fetchUrl={REQUESTS.fetchRealityTV} onSelect={onSelectMovie} />
                <Row title={t('rows.comedy')} fetchUrl={REQUESTS.fetchComedyTV} onSelect={onSelectMovie} />
                <Row title={t('rows.drama')} fetchUrl={REQUESTS.fetchDramaTV} onSelect={onSelectMovie} />
                <Row title={t('rows.documentaries')} fetchUrl={REQUESTS.fetchDocumentaries} onSelect={onSelectMovie} />
                <Row title={t('rows.crime')} fetchUrl={REQUESTS.fetchCrimeTV} onSelect={onSelectMovie} />
            </main>
        </>
    );
};

export default ShowsPage;
