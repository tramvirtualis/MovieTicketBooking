import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Header from '../components/Header.jsx';
import HeroCarousel from '../components/HeroCarousel.jsx';
import Footer from '../components/Footer.jsx';
import { Section, CardsGrid, PromosGrid } from '../components/SectionGrid.jsx';
import interstellar from '../assets/images/interstellar.jpg';
import inception from '../assets/images/inception.jpg';
import darkKnightRises from '../assets/images/the-dark-knight-rises.jpg';
import driveMyCar from '../assets/images/drive-my-car.jpg';

const promos = [
  { title: 'Mua 2 tặng 1 vé', desc: 'Áp dụng cuối tuần', image: 'https://images.unsplash.com/photo-1511735111819-9a3f7709049c?q=80&w=200&auto=format&fit=crop' },
  { title: 'Giảm 30% combo bắp nước', desc: 'Thành viên hạng Gold', image: 'https://images.unsplash.com/photo-1512428559087-560fa5ceab42?q=80&w=200&auto=format&fit=crop' }
];

// Helper function để map AgeRating từ backend sang format frontend
const mapAgeRating = (ageRating) => {
  const ratingMap = {
    'P': 'P',
    'K': 'K',
    'AGE_13_PLUS': 'T13',
    'AGE_16_PLUS': 'T16',
    'AGE_18_PLUS': 'T18'
  };
  return ratingMap[ageRating] || ageRating;
};

// Helper function để extract YouTube video ID từ URL
const extractYouTubeId = (url) => {
  if (!url) return null;
  
  // Nếu đã là ID thuần (11 ký tự)
  if (url.length === 11 && !url.includes('/') && !url.includes('?')) {
    return url;
  }
  
  // Extract từ các dạng URL khác nhau
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/,
    /^([a-zA-Z0-9_-]{11})$/
  ];
  
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }
  
  return null;
};

// Helper function để format movie data từ backend
const formatMovieData = (movie) => {
  return {
    movieId: movie.movieId,
    title: movie.title,
    genre: movie.genre && movie.genre.length > 0 ? movie.genre[0] : 'N/A',
    poster: movie.poster,
    rating: mapAgeRating(movie.ageRating),
    trailerId: extractYouTubeId(movie.trailerURL)
  };
};

export default function Home() {
  const [trailerModal, setTrailerModal] = useState({ isOpen: false, videoId: null });
  const [nowShowing, setNowShowing] = useState([]);
  const [comingSoon, setComingSoon] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch movies from backend
  useEffect(() => {
    const fetchMovies = async () => {
      try {
        setLoading(true);
        
        // Fetch phim đang chiếu và phim sắp chiếu song song
        const [nowShowingRes, comingSoonRes] = await Promise.all([
          axios.get('http://localhost:8080/api/public/movies/now-showing'),
          axios.get('http://localhost:8080/api/public/movies/coming-soon')
        ]);
        
        setNowShowing(nowShowingRes.data.map(formatMovieData));
        setComingSoon(comingSoonRes.data.map(formatMovieData));
      } catch (err) {
        console.error('Error fetching movies:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMovies();
  }, []);

  const handlePlayTrailer = (trailerId) => {
    if (trailerId) {
      setTrailerModal({ isOpen: true, videoId: trailerId });
    }
  };

  const closeTrailer = () => {
    setTrailerModal({ isOpen: false, videoId: null });
  };

  return (
    <div className="min-h-screen cinema-mood">
      <Header />
      <HeroCarousel posters={[interstellar, inception, darkKnightRises, driveMyCar]} />
      <main className="main">
        <Section id="now-showing" title="Phim Đang Chiếu" linkText="Xem tất cả">
          {loading ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#e6e1e2' }}>
              Đang tải phim...
            </div>
          ) : (
            <CardsGrid items={nowShowing} isNowShowing={true} onPlayTrailer={handlePlayTrailer} />
          )}
        </Section>
        <Section id="coming-soon" title="Phim Sắp Chiếu" linkText="Xem tất cả">
          {loading ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#e6e1e2' }}>
              Đang tải phim...
            </div>
          ) : (
            <CardsGrid items={comingSoon} isNowShowing={true} onPlayTrailer={handlePlayTrailer} />
          )}
        </Section>
        <Section id="promotions" title="Chương Trình Ưu Đãi">
          <PromosGrid items={promos} />
        </Section>
      </main>
      <Footer />

      {/* Trailer Modal */}
      {trailerModal.isOpen && (
        <div
          className="trailer-modal"
          onClick={closeTrailer}
        >
          <div
            className="trailer-modal__content"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="trailer-modal__close"
              onClick={closeTrailer}
              aria-label="Close trailer"
            >
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
            <iframe
              width="100%"
              height="100%"
              src={`https://www.youtube.com/embed/${trailerModal.videoId}?autoplay=1`}
              title="Movie Trailer"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        </div>
      )}
    </div>
  );
}