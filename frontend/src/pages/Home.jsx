import React, { useState } from 'react';
import Header from '../components/Header.jsx';
import HeroCarousel from '../components/HeroCarousel.jsx';
import Footer from '../components/Footer.jsx';
import { Section, CardsGrid, PromosGrid } from '../components/SectionGrid.jsx';
import interstellar from '../assets/images/interstellar.jpg';
import inception from '../assets/images/inception.jpg';
import darkKnightRises from '../assets/images/the-dark-knight-rises.jpg';
import driveMyCar from '../assets/images/drive-my-car.jpg';

const nowShowing = [
  { title: 'Interstellar', genre: 'Sci‑Fi', poster: interstellar, rating: 'T13', trailerId: 'zSWdZVtXT7E' },
  { title: 'Inception', genre: 'Action', poster: inception, rating: 'T16', trailerId: 'YoHD9XEInc0' },
  { title: 'The Dark Knight Rises', genre: 'Action', poster: darkKnightRises, rating: 'T16', trailerId: 'GokKUqLcvD8' },
  { title: 'Drive My Car', genre: 'Drama', poster: driveMyCar, rating: 'T13', trailerId: '6BPKPb_RTwI' }
];

const comingSoon = [
  { title: 'Wicked', genre: 'Fantasy', poster: 'https://image.tmdb.org/t/p/w500/9azEue8jX6n8WcN6iYG3PaY5E9R.jpg', rating: 'T13', trailerId: 'Y5BeTH2c3WA' },
  { title: 'Gladiator II', genre: 'Drama', poster: 'https://image.tmdb.org/t/p/w500/iADOJ8Zymht2JPMoy3R7xceZprc.jpg', rating: 'T16', trailerId: 'l5X9UpFzH4M' },
  { title: 'Moana 2', genre: 'Animation', poster: 'https://image.tmdb.org/t/p/w500/6KAnr4PjkY3S2wPqDq3PcTzu3rG.jpg', rating: 'P', trailerId: 'pS3v-dRthh0' },
  { title: 'Nosferatu', genre: 'Horror', poster: 'https://image.tmdb.org/t/p/w500/pQx6fJ5S9t8uKXuX4nHCqB6Sm9D.jpg', rating: 'T18', trailerId: '8hP9D6kZseM' },
  { title: 'Superman', genre: 'Superhero', poster: 'https://image.tmdb.org/t/p/w500/okA8m4cC5hW6RtWLpmjDoE7YQD6.jpg', rating: 'T13', trailerId: '82RAYOz8zCk' }
];

const promos = [
  { title: 'Mua 2 tặng 1 vé', desc: 'Áp dụng cuối tuần', image: 'https://images.unsplash.com/photo-1511735111819-9a3f7709049c?q=80&w=200&auto=format&fit=crop' },
  { title: 'Giảm 30% combo bắp nước', desc: 'Thành viên hạng Gold', image: 'https://images.unsplash.com/photo-1512428559087-560fa5ceab42?q=80&w=200&auto=format&fit=crop' }
];

export default function Home() {
  const [trailerModal, setTrailerModal] = useState({ isOpen: false, videoId: null });

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
          <CardsGrid items={nowShowing} isNowShowing={true} onPlayTrailer={handlePlayTrailer} />
        </Section>
        <Section id="coming-soon" title="Phim Sắp Chiếu" linkText="Xem tất cả">
          <CardsGrid items={comingSoon} isNowShowing={false} onPlayTrailer={handlePlayTrailer} />
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

