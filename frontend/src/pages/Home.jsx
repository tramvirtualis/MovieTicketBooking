import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Header from '../components/Header.jsx';
import HeroCarousel from '../components/HeroCarousel.jsx';
import Footer from '../components/Footer.jsx';
import FloatingQuickBooking from '../components/FloatingQuickBooking.jsx';
import { Section, CardsGrid, PromosGrid } from '../components/SectionGrid.jsx';
import { enumService } from '../services/enumService';
import { bannerService } from '../services/bannerService';
import { voucherService } from '../services/voucherService';
import { API_BASE_URL } from '../config/api';
import interstellar from '../assets/images/interstellar.jpg';
import inception from '../assets/images/inception.jpg';
import darkKnightRises from '../assets/images/the-dark-knight-rises.jpg';
import driveMyCar from '../assets/images/drive-my-car.jpg';

// Helper function để map AgeRating từ backend sang format frontend (13+, 16+, 18+, P, K)
const mapAgeRating = (ageRating) => {
  // Use enumService to map age rating to display format
  return enumService.mapAgeRatingToDisplay(ageRating) || 'P';
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
  // Map genre to Vietnamese
  let genreDisplay = 'N/A';
  if (movie.genre && movie.genre.length > 0) {
    genreDisplay = movie.genre.map(g => enumService.mapGenreToVietnamese(g)).join(', ');
  }
  
  return {
    movieId: movie.movieId,
    title: movie.title,
    genre: genreDisplay,
    poster: movie.poster,
    rating: mapAgeRating(movie.ageRating),
    trailerId: extractYouTubeId(movie.trailerURL)
  };
};

export default function Home() {
  const navigate = useNavigate();
  const [trailerModal, setTrailerModal] = useState({ isOpen: false, videoId: null });
  const [nowShowing, setNowShowing] = useState([]);
  const [comingSoon, setComingSoon] = useState([]);
  const [banners, setBanners] = useState([]);
  const [promos, setPromos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingBanners, setLoadingBanners] = useState(true);
  const [loadingPromos, setLoadingPromos] = useState(true);

  // Kiểm tra role - chặn admin và manager vào trang chủ
  useEffect(() => {
    const checkRole = () => {
      try {
        const userStr = localStorage.getItem('user');
        if (userStr) {
          const user = JSON.parse(userStr);
          const role = (user.role || '').toString().toUpperCase().trim();
          
          // Nếu là ADMIN hoặc MANAGER, redirect về dashboard tương ứng
          if (role === 'ADMIN') {
            navigate('/admin', { replace: true });
          } else if (role === 'MANAGER') {
            navigate('/manager', { replace: true });
          }
          // CUSTOMER hoặc chưa đăng nhập được phép truy cập
        }
      } catch (e) {
        console.error('Error checking role:', e);
        // Nếu có lỗi, vẫn cho phép truy cập (không block)
      }
    };
    
    checkRole();
  }, [navigate]);

  // Fetch all data in parallel for faster loading
  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setLoading(true);
        setLoadingBanners(true);
        setLoadingPromos(true);
        
        // Fetch all data in parallel
        const [bannersResult, vouchersResult, nowShowingRes, comingSoonRes] = await Promise.all([
          bannerService.getPublicBanners().catch(err => {
            console.error('Error fetching banners:', err);
            return { success: false, data: null };
          }),
          voucherService.getPublicVouchers().catch(err => {
            console.error('Error fetching vouchers:', err);
            return { success: false, data: null };
          }),
          axios.get(`${API_BASE_URL}/public/movies/now-showing`).catch(err => {
            console.error('Error fetching now showing movies:', err);
            return { data: [] };
          }),
          axios.get(`${API_BASE_URL}/public/movies/coming-soon`).catch(err => {
            console.error('Error fetching coming soon movies:', err);
            return { data: [] };
          })
        ]);
        
        // Process banners
        if (bannersResult.success && bannersResult.data) {
          const bannerImages = bannersResult.data
            .filter(banner => banner.image)
            .map(banner => banner.image);
          
          if (bannerImages.length > 0) {
            setBanners(bannerImages);
          } else {
            setBanners([interstellar, inception, darkKnightRises, driveMyCar]);
          }
        } else {
          setBanners([interstellar, inception, darkKnightRises, driveMyCar]);
        }
        setLoadingBanners(false);
        
        // Process vouchers
        if (vouchersResult.success && vouchersResult.data) {
          const now = new Date();
          const mappedPromos = vouchersResult.data
            .filter(voucher => {
              const startDate = voucher.startDate ? new Date(voucher.startDate) : null;
              const endDate = voucher.endDate ? new Date(voucher.endDate) : null;
              
              if (startDate && endDate) {
                return now >= startDate && now <= endDate;
              }
              return true;
            })
            .slice(0, 6)
            .map(voucher => ({
              title: voucher.name || voucher.code || 'Voucher',
              desc: voucher.description || `Mã: ${voucher.code || 'N/A'}`,
              image: voucher.image || 'https://images.unsplash.com/photo-1511735111819-9a3f7709049c?q=80&w=200&auto=format&fit=crop'
            }));
          
          setPromos(mappedPromos);
        } else {
          setPromos([]);
        }
        setLoadingPromos(false);
        
        // Process movies
        setNowShowing((nowShowingRes.data || []).map(formatMovieData));
        setComingSoon((comingSoonRes.data || []).map(formatMovieData));
        setLoading(false);
      } catch (err) {
        console.error('Error fetching data:', err);
        setLoading(false);
        setLoadingBanners(false);
        setLoadingPromos(false);
        // Set fallback values
        setBanners([interstellar, inception, darkKnightRises, driveMyCar]);
        setPromos([]);
      }
    };

    fetchAllData();
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
      <FloatingQuickBooking />
      <HeroCarousel posters={banners.length > 0 ? banners : [interstellar, inception, darkKnightRises, driveMyCar]} />
      
      <main className="main">
        <Section id="now-showing" title="Phim Đang Chiếu">
          {loading ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#e6e1e2' }}>
              Đang tải phim...
            </div>
          ) : nowShowing.length > 0 ? (
            <CardsGrid items={nowShowing} isNowShowing={true} onPlayTrailer={handlePlayTrailer} />
          ) : (
            <div style={{ padding: '40px', textAlign: 'center', color: '#e6e1e2' }}>
              Hiện chưa có phim đang chiếu
            </div>
          )}
        </Section>
        <Section id="coming-soon" title="Phim Sắp Chiếu">
          {loading ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#e6e1e2' }}>
              Đang tải phim...
            </div>
          ) : comingSoon.length > 0 ? (
            <CardsGrid items={comingSoon} isNowShowing={false} onPlayTrailer={handlePlayTrailer} />
          ) : (
            <div style={{ padding: '40px', textAlign: 'center', color: '#e6e1e2' }}>
              Hiện chưa có phim sắp chiếu
            </div>
          )}
        </Section>
        <Section id="promotions" title="Chương Trình Ưu Đãi">
          {loadingPromos ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#e6e1e2' }}>
              Đang tải chương trình ưu đãi...
            </div>
          ) : promos.length > 0 ? (
            <PromosGrid items={promos} />
          ) : (
            <div style={{ padding: '40px', textAlign: 'center', color: '#e6e1e2' }}>
              Hiện chưa có chương trình ưu đãi nào
            </div>
          )}
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