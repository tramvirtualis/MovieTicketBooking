import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Header from '../components/Header.jsx';
import HeroCarousel from '../components/HeroCarousel.jsx';
import Footer from '../components/Footer.jsx';
import { Section, CardsGrid, PromosGrid } from '../components/SectionGrid.jsx';
import VoiceSearchBar from '../components/VoiceSearchBar.jsx';
import { enumService } from '../services/enumService';
import { bannerService } from '../services/bannerService';
import { voucherService } from '../services/voucherService';
import interstellar from '../assets/images/interstellar.jpg';
import inception from '../assets/images/inception.jpg';
import darkKnightRises from '../assets/images/the-dark-knight-rises.jpg';
import driveMyCar from '../assets/images/drive-my-car.jpg';

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
  const [searchTerm, setSearchTerm] = useState('');

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

  // Fetch banners from backend
  useEffect(() => {
    const fetchBanners = async () => {
      try {
        setLoadingBanners(true);
        const result = await bannerService.getPublicBanners();
        if (result.success && result.data) {
          // Map banners to image URLs for HeroCarousel
          const bannerImages = result.data
            .filter(banner => banner.image) // Only include banners with images
            .map(banner => banner.image);
          
          // Fallback to default posters if no banners
          if (bannerImages.length > 0) {
            setBanners(bannerImages);
          } else {
            // Use default posters if no banners in database
            setBanners([interstellar, inception, darkKnightRises, driveMyCar]);
          }
        } else {
          // Fallback to default posters on error
          setBanners([interstellar, inception, darkKnightRises, driveMyCar]);
        }
      } catch (err) {
        console.error('Error fetching banners:', err);
        // Fallback to default posters on error
        setBanners([interstellar, inception, darkKnightRises, driveMyCar]);
      } finally {
        setLoadingBanners(false);
      }
    };

    fetchBanners();
  }, []);

  // Fetch public vouchers from backend
  useEffect(() => {
    const fetchVouchers = async () => {
      try {
        setLoadingPromos(true);
        const result = await voucherService.getPublicVouchers();
        if (result.success && result.data) {
          // Map vouchers to promo format
          const mappedPromos = result.data
            .filter(voucher => {
              // Only show active vouchers
              const now = new Date();
              const startDate = voucher.startDate ? new Date(voucher.startDate) : null;
              const endDate = voucher.endDate ? new Date(voucher.endDate) : null;
              
              if (startDate && endDate) {
                return now >= startDate && now <= endDate;
              }
              return true; // Include if dates are missing
            })
            .slice(0, 6) // Limit to 6 vouchers
            .map(voucher => ({
              title: voucher.name || voucher.code || 'Voucher',
              desc: voucher.description || `Mã: ${voucher.code || 'N/A'}`,
              image: voucher.image || 'https://images.unsplash.com/photo-1511735111819-9a3f7709049c?q=80&w=200&auto=format&fit=crop'
            }));
          
          setPromos(mappedPromos);
        } else {
          // Fallback to empty array on error
          setPromos([]);
        }
      } catch (err) {
        console.error('Error fetching vouchers:', err);
        setPromos([]);
      } finally {
        setLoadingPromos(false);
      }
    };

    fetchVouchers();
  }, []);

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

  // Handle search
  const handleSearch = (term) => {
    setSearchTerm(term);
  };

  // Filter movies based on search term
  const filteredNowShowing = useMemo(() => {
    if (!searchTerm.trim()) return nowShowing;
    const term = searchTerm.toLowerCase();
    return nowShowing.filter(movie => 
      movie.title.toLowerCase().includes(term) ||
      movie.genre.toLowerCase().includes(term)
    );
  }, [nowShowing, searchTerm]);

  const filteredComingSoon = useMemo(() => {
    if (!searchTerm.trim()) return comingSoon;
    const term = searchTerm.toLowerCase();
    return comingSoon.filter(movie => 
      movie.title.toLowerCase().includes(term) ||
      movie.genre.toLowerCase().includes(term)
    );
  }, [comingSoon, searchTerm]);

  return (
    <div className="min-h-screen cinema-mood">
      <Header />
      <HeroCarousel posters={banners.length > 0 ? banners : [interstellar, inception, darkKnightRises, driveMyCar]} />
      
      {/* Search Bar */}
      <div style={{
        padding: '32px 20px',
        background: 'linear-gradient(180deg, rgba(26, 20, 21, 0.95) 0%, rgba(26, 20, 21, 0.8) 100%)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
      }}>
        <VoiceSearchBar 
          onSearch={handleSearch}
          placeholder="Tìm kiếm phim theo tên hoặc thể loại..."
        />
        {searchTerm && (
          <div style={{
            textAlign: 'center',
            marginTop: '16px',
            color: '#e6e1e2',
            fontSize: '14px'
          }}>
            Kết quả tìm kiếm cho: <strong style={{ color: '#ffd159' }}>"{searchTerm}"</strong>
            <button
              onClick={() => {
                setSearchTerm('');
                handleSearch('');
              }}
              style={{
                marginLeft: '12px',
                background: 'transparent',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                borderRadius: '4px',
                padding: '4px 12px',
                color: '#e6e1e2',
                cursor: 'pointer',
                fontSize: '12px',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = 'rgba(232, 59, 65, 0.2)';
                e.target.style.borderColor = '#e83b41';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'transparent';
                e.target.style.borderColor = 'rgba(255, 255, 255, 0.3)';
              }}
            >
              Xóa
            </button>
          </div>
        )}
      </div>

      <main className="main">
        <Section id="now-showing" title="Phim Đang Chiếu">
          {loading ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#e6e1e2' }}>
              Đang tải phim...
            </div>
          ) : filteredNowShowing.length > 0 ? (
            <CardsGrid items={filteredNowShowing} isNowShowing={true} onPlayTrailer={handlePlayTrailer} />
          ) : searchTerm ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#e6e1e2' }}>
              Không tìm thấy phim đang chiếu nào phù hợp với "{searchTerm}"
            </div>
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
          ) : filteredComingSoon.length > 0 ? (
            <CardsGrid items={filteredComingSoon} isNowShowing={true} onPlayTrailer={handlePlayTrailer} />
          ) : searchTerm ? (
            <div style={{ padding: '40px', textAlign: 'center', color: '#e6e1e2' }}>
              Không tìm thấy phim sắp chiếu nào phù hợp với "{searchTerm}"
            </div>
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