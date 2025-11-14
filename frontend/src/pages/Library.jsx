import React, { useState, useEffect } from 'react';
import Header from '../components/Header.jsx';
import Footer from '../components/Footer.jsx';

// Sample data - in real app, fetch from API/localStorage
const sampleFavoriteMovies = [
  {
    id: 1,
    title: 'Inception',
    poster: 'https://image.tmdb.org/t/p/w500/oYuLEt3zVCKq57qu2F8dT7NIa6f.jpg',
    genre: 'ACTION',
    year: 2010,
    addedDate: '2024-10-15',
    rating: null
  },
  {
    id: 2,
    title: 'Interstellar',
    poster: 'https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg',
    genre: 'SCI-FI',
    year: 2014,
    addedDate: '2024-09-20',
    rating: null
  },
  {
    id: 3,
    title: 'The Dark Knight',
    poster: 'https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg',
    genre: 'ACTION',
    year: 2008,
    addedDate: '2024-08-10',
    rating: 5,
    reviewDate: '2024-08-15',
    reviewText: 'Một kiệt tác điện ảnh không thể phủ nhận. Heath Ledger đã tạo nên một Joker đáng sợ và đầy ám ảnh, một trong những vai diễn phản diện xuất sắc nhất mọi thời đại. Christopher Nolan đã xây dựng một câu chuyện phức tạp, đầy kịch tính với những cảnh hành động mãn nhãn. Bộ phim không chỉ là một siêu anh hùng đơn thuần mà còn là một tác phẩm nghệ thuật về sự đối đầu giữa thiện và ác, về ranh giới mỏng manh giữa người hùng và kẻ phản diện.'
  },
  {
    id: 4,
    title: 'Drive My Car',
    poster: 'https://image.tmdb.org/t/p/w500/lXi2YKI3m30qtX9c9B5GPz8b3uaw.jpg',
    genre: 'DRAMA',
    year: 2021,
    addedDate: '2024-07-05',
    rating: 4,
    reviewDate: '2024-07-10',
    reviewText: 'Một bộ phim chậm rãi, sâu sắc và đầy cảm xúc. Đạo diễn Ryusuke Hamaguchi đã tạo nên một tác phẩm về sự mất mát, đau buồn và cách con người đối mặt với quá khứ. Diễn xuất xuất sắc, đặc biệt là từ Hidetoshi Nishijima. Bộ phim yêu cầu sự kiên nhẫn từ người xem nhưng phần thưởng là những khoảnh khắc chân thực và đầy ý nghĩa.'
  },
  {
    id: 5,
    title: 'Parasite',
    poster: 'https://image.tmdb.org/t/p/w500/7IiTTgloJzvGI1TAYymCfbfl3vT.jpg',
    genre: 'THRILLER',
    year: 2019,
    addedDate: '2024-06-12',
    rating: 5,
    reviewDate: '2024-06-20',
    reviewText: 'Bong Joon-ho đã tạo nên một bộ phim xuất sắc, kết hợp hoàn hảo giữa hài kịch, kịch tính và phê phán xã hội. Cách kể chuyện thông minh, kịch bản xuất sắc với những bước ngoặt bất ngờ. Bộ phim phản ánh sâu sắc về khoảng cách giàu nghèo và sự phân tầng xã hội. Một tác phẩm đáng xem nhiều lần để cảm nhận hết những tầng ý nghĩa.'
  }
];

export default function Library() {
  const [activeTab, setActiveTab] = useState('favorites');
  const [expandedReviews, setExpandedReviews] = useState(new Set());
  const [favorites, setFavorites] = useState(() => {
    try {
      const stored = localStorage.getItem('favoriteMovies');
      return stored ? JSON.parse(stored) : sampleFavoriteMovies.filter(m => !m.rating);
    } catch {
      return sampleFavoriteMovies.filter(m => !m.rating);
    }
  });
  const [ratedMovies, setRatedMovies] = useState(() => {
    try {
      const stored = localStorage.getItem('ratedMovies');
      return stored ? JSON.parse(stored) : sampleFavoriteMovies.filter(m => m.rating);
    } catch {
      return sampleFavoriteMovies.filter(m => m.rating);
    }
  });

  useEffect(() => {
    // Sync with localStorage
    try {
      const storedFavs = localStorage.getItem('favoriteMovies');
      const storedRated = localStorage.getItem('ratedMovies');
      if (storedFavs) setFavorites(JSON.parse(storedFavs));
      if (storedRated) setRatedMovies(JSON.parse(storedRated));
    } catch (e) {
      console.error('Error loading library data:', e);
    }
  }, []);

  const handleRemoveFavorite = (movieId) => {
    const updated = favorites.filter(m => m.id !== movieId);
    setFavorites(updated);
    try {
      localStorage.setItem('favoriteMovies', JSON.stringify(updated));
    } catch (e) {
      console.error('Error saving favorites:', e);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  const formatShortDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const toggleReview = (movieId) => {
    setExpandedReviews(prev => {
      const newSet = new Set(prev);
      if (newSet.has(movieId)) {
        newSet.delete(movieId);
      } else {
        newSet.add(movieId);
      }
      return newSet;
    });
  };

  const isReviewExpanded = (movieId) => {
    return expandedReviews.has(movieId);
  };

  const shouldTruncate = (text, maxLength = 200) => {
    return text && text.length > maxLength;
  };

  const truncateText = (text, maxLength = 200) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  const renderStars = (rating) => {
    return Array.from({ length: 5 }, (_, i) => (
      <svg
        key={i}
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill={i < rating ? 'currentColor' : 'none'}
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ color: i < rating ? '#ffd159' : 'rgba(255, 255, 255, 0.3)' }}
      >
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
    ));
  };

  return (
    <div className="library-page">
      <Header />
      
      <div className="library-hero">
        <div className="container">
          <div className="library-hero__content">
            <h1 className="library-hero__title">Thư viện của tôi</h1>
            <p className="library-hero__subtitle">
              Nơi lưu trữ những bộ phim bạn yêu thích và đã đánh giá
            </p>
          </div>
        </div>
      </div>

      <div className="library-content">
        <div className="container">
          <div className="library-tabs">
            <button
              className={`library-tab ${activeTab === 'favorites' ? 'library-tab--active' : ''}`}
              onClick={() => setActiveTab('favorites')}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
              </svg>
              <span>Phim yêu thích ({favorites.length})</span>
            </button>
            <button
              className={`library-tab ${activeTab === 'rated' ? 'library-tab--active' : ''}`}
              onClick={() => setActiveTab('rated')}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
              <span>Đã đánh giá ({ratedMovies.length})</span>
            </button>
          </div>

          {activeTab === 'favorites' && (
            <div className="library-section">
              {favorites.length === 0 ? (
                <div className="library-empty">
                  <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                  </svg>
                  <h3>Chưa có phim yêu thích</h3>
                  <p>Khám phá và thêm những bộ phim bạn yêu thích vào thư viện</p>
                  <a href="/" className="btn btn--primary">Khám phá phim</a>
                </div>
              ) : (
                <div className="library-grid">
                  {favorites.map((movie) => (
                    <div key={movie.id} className="library-card library-card--favorite">
                      <a href={`#movie?title=${encodeURIComponent(movie.title)}`} className="library-card__link">
                        <div className="library-card__poster">
                          <img src={movie.poster} alt={movie.title} />
                          <div className="library-card__overlay">
                            <div className="library-card__icon">
                              <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                              </svg>
                            </div>
                          </div>
                          <div className="library-card__badge library-card__badge--favorite">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                            </svg>
                          </div>
                        </div>
                        <div className="library-card__content">
                          <h3 className="library-card__title">{movie.title}</h3>
                          <div className="library-card__meta">
                            <span>{movie.year}</span>
                            <span>•</span>
                            <span>{movie.genre}</span>
                          </div>
                        </div>
                      </a>
                      <button
                        className="library-card__remove"
                        onClick={(e) => {
                          e.preventDefault();
                          handleRemoveFavorite(movie.id);
                        }}
                        title="Xóa khỏi yêu thích"
                      >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <line x1="18" y1="6" x2="6" y2="18"/>
                          <line x1="6" y1="6" x2="18" y2="18"/>
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'rated' && (
            <div className="library-section">
              {ratedMovies.length === 0 ? (
                <div className="library-empty">
                  <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                  </svg>
                  <h3>Chưa có phim đã đánh giá</h3>
                  <p>Xem phim và đánh giá để xây dựng bộ sưu tập của bạn</p>
                  <a href="/" className="btn btn--primary">Khám phá phim</a>
                </div>
              ) : (
                <div className="library-reviews">
                  {ratedMovies.map((movie) => {
                    const isExpanded = isReviewExpanded(movie.id);
                    const hasLongReview = shouldTruncate(movie.reviewText);
                    const displayText = isExpanded || !hasLongReview 
                      ? movie.reviewText 
                      : truncateText(movie.reviewText);
                    
                    return (
                      <div key={movie.id} className="library-review-card">
                        <a href={`#movie?title=${encodeURIComponent(movie.title)}`} className="library-review-card__poster-link">
                          <div className="library-review-card__poster">
                            <img src={movie.poster} alt={movie.title} />
                          </div>
                        </a>
                        <div className="library-review-card__content">
                          <div className="library-review-card__header">
                            <div className="library-review-card__title-section">
                              <h3 className="library-review-card__title">{movie.title}</h3>
                              <div className="library-review-card__meta">
                                <span>{movie.year}</span>
                                <span>•</span>
                                <span>{movie.genre}</span>
                              </div>
                            </div>
                            <div className="library-review-card__date">
                              {movie.reviewDate ? formatShortDate(movie.reviewDate) : formatShortDate(movie.addedDate)}
                            </div>
                          </div>
                          <div className="library-review-card__rating-section">
                            <div className="library-review-card__stars">
                              {renderStars(movie.rating)}
                            </div>
                            <span className="library-review-card__rating-badge">Đã xem</span>
                          </div>
                          {movie.reviewText && (
                            <div className="library-review-card__review">
                              <p className="library-review-card__review-text">
                                {displayText}
                              </p>
                              {hasLongReview && (
                                <button
                                  className="library-review-card__expand"
                                  onClick={(e) => {
                                    e.preventDefault();
                                    toggleReview(movie.id);
                                  }}
                                >
                                  <span>{isExpanded ? 'THU GỌN' : 'MỞ RỘNG'}</span>
                                  <svg 
                                    width="16" 
                                    height="16" 
                                    viewBox="0 0 24 24" 
                                    fill="none" 
                                    stroke="currentColor" 
                                    strokeWidth="2"
                                    style={{ transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 300ms ease' }}
                                  >
                                    <polyline points="6 9 12 15 18 9"></polyline>
                                  </svg>
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}



