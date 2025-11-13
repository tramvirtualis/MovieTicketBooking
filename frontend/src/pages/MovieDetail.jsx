import React, { useMemo, useState } from 'react';
import Header from '../components/Header.jsx';
import Footer from '../components/Footer.jsx';
import BookingModal from '../components/BookingModal.jsx';

export default function MovieDetail() {
  const query = useMemo(() => {
    const h = window.location.hash || '';
    const qIndex = h.indexOf('?');
    const params = new URLSearchParams(qIndex >= 0 ? h.slice(qIndex + 1) : '');
    return Object.fromEntries(params.entries());
  }, []);

  const sample = {
    id: 'inception',
    title: 'Inception (T16)',
    duration: 147,
    genre: 'Sci‑Fi, Action',
    formats: ['2D', '3D'],
    language: 'Khác',
    rating: 'T16',
    status: query.status || 'NOW_SHOWING', // NOW_SHOWING, COMING_SOON, ENDED
    desc: 'Trong tương lai gần, một tay trộm hành tinh thức lenh, nơi Predator nợ nần – kẻ bị săn đuổi có cơ hội nhận lại tự do – tìm thấy một mục tiêu không ngờ tới là một bé gái bản lĩnh.',
    director: 'Christopher Nolan',
    cast: 'Leonardo DiCaprio, Joseph Gordon‑Levitt, Ellen Page',
    poster: query.poster || '',
    release: 'Thứ Sáu, 07/11/2025',
  };

  const [showBooking, setShowBooking] = useState(false);
  const [showTrailer, setShowTrailer] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [expandedReviews, setExpandedReviews] = useState(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const reviewsPerPage = 4;
  const [showAgeConfirmModal, setShowAgeConfirmModal] = useState(false);
  const [ageConfirmed, setAgeConfirmed] = useState(false);
  const [pendingBookingUrl, setPendingBookingUrl] = useState(null);

  const reviews = [
    {
      id: 1,
      userId: 'user1',
      userName: 'Nguyễn Văn A',
      avatar: 'https://ui-avatars.com/api/?name=Nguyen+Van+A&background=e83b41&color=fff&size=128',
      rating: 5,
      reviewText: 'Một kiệt tác điện ảnh không thể phủ nhận. Christopher Nolan đã tạo nên một tác phẩm xuất sắc với cốt truyện phức tạp, đầy kịch tính. Diễn xuất của Leonardo DiCaprio và toàn bộ dàn cast đều xuất sắc. Hiệu ứng hình ảnh và âm thanh đỉnh cao, tạo nên một trải nghiệm điện ảnh đáng nhớ.',
      reviewDate: '2024-11-05'
    },
    {
      id: 2,
      userId: 'user2',
      userName: 'Trần Thị B',
      avatar: 'https://ui-avatars.com/api/?name=Tran+Thi+B&background=7b61ff&color=fff&size=128',
      rating: 4,
      reviewText: 'Bộ phim hay nhưng hơi khó hiểu với những người mới xem lần đầu. Cần xem lại nhiều lần để hiểu hết các tầng ý nghĩa. Tuy nhiên, đây vẫn là một tác phẩm đáng xem.',
      reviewDate: '2024-11-03'
    },
    {
      id: 3,
      userId: 'user3',
      userName: 'Lê Văn C',
      avatar: 'https://ui-avatars.com/api/?name=Le+Van+C&background=ffd159&color=1a1415&size=128',
      rating: 5,
      reviewText: 'Tuyệt vời! Một trong những bộ phim hay nhất mà tôi từng xem. Cốt truyện độc đáo, kỹ thuật quay phim xuất sắc.',
      reviewDate: '2024-11-01'
    },
    {
      id: 4,
      userId: 'user4',
      userName: 'Phạm Thị D',
      avatar: 'https://ui-avatars.com/api/?name=Pham+Thi+D&background=4caf50&color=fff&size=128',
      rating: 3,
      reviewText: 'Phim ổn nhưng không quá xuất sắc như mọi người nói. Cốt truyện hơi rối, một số phần hơi dài dòng.',
      reviewDate: '2024-10-28'
    },
    {
      id: 5,
      userId: 'user5',
      userName: 'Hoàng Văn E',
      avatar: 'https://ui-avatars.com/api/?name=Hoang+Van+E&background=e83b41&color=fff&size=128',
      rating: 5,
      reviewText: 'Tuyệt vời! Một bộ phim đáng xem nhiều lần. Mỗi lần xem lại đều phát hiện thêm chi tiết mới. Nolan thực sự là bậc thầy.',
      reviewDate: '2024-10-25'
    },
    {
      id: 6,
      userId: 'user6',
      userName: 'Võ Thị F',
      avatar: 'https://ui-avatars.com/api/?name=Vo+Thi+F&background=7b61ff&color=fff&size=128',
      rating: 4,
      reviewText: 'Phim hay, cốt truyện thú vị. Tuy nhiên một số cảnh hơi khó hiểu, cần tập trung cao độ khi xem.',
      reviewDate: '2024-10-22'
    },
    {
      id: 7,
      userId: 'user7',
      userName: 'Đỗ Văn G',
      avatar: 'https://ui-avatars.com/api/?name=Do+Van+G&background=ffd159&color=1a1415&size=128',
      rating: 5,
      reviewText: 'Kiệt tác! Một trong những bộ phim hay nhất thập kỷ. Âm thanh và hình ảnh đỉnh cao, cốt truyện xuất sắc.',
      reviewDate: '2024-10-20'
    },
    {
      id: 8,
      userId: 'user8',
      userName: 'Bùi Thị H',
      avatar: 'https://ui-avatars.com/api/?name=Bui+Thi+H&background=4caf50&color=fff&size=128',
      rating: 4,
      reviewText: 'Phim tốt, đáng xem. Diễn xuất tốt, kỹ thuật quay phim ấn tượng.',
      reviewDate: '2024-10-18'
    }
  ];

  const averageRating = reviews.length > 0 
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : 0;
  const totalReviews = reviews.length;
  const totalPages = Math.ceil(reviews.length / reviewsPerPage);
  const startIndex = (currentPage - 1) * reviewsPerPage;
  const endIndex = startIndex + reviewsPerPage;
  const currentReviews = reviews.slice(startIndex, endIndex);

  const toggleReview = (reviewId) => {
    setExpandedReviews(prev => {
      const newSet = new Set(prev);
      if (newSet.has(reviewId)) {
        newSet.delete(reviewId);
      } else {
        newSet.add(reviewId);
      }
      return newSet;
    });
  };

  const isReviewExpanded = (reviewId) => {
    return expandedReviews.has(reviewId);
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

  const formatShortDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  // YouTube video ID của phim (thay bằng ID thực tế)
  const trailerYoutubeId = '8hP9D6kZseM';

  return (
    <div className="min-h-screen cinema-mood">
      <Header />

      <main className="main">
        <section className="section">
          <div className="container" style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '20px' }}>
            <div>
              <div className="card" style={{ overflow: 'hidden' }}>
                {sample.poster ? (
                  <img src={sample.poster} alt={sample.title} className="card__img" />
                ) : (
                  <div className="card__img" style={{ display: 'grid', placeItems: 'center', background: '#251e1f' }}>Không có poster</div>
                )}
              </div>
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px', flexWrap: 'wrap' }}>
                <h1 className="section__title" style={{ fontSize: 'clamp(24px, 3vw, 32px)', margin: 0, fontWeight: 900 }}>{sample.title}</h1>
                <span className="badge-rating" title="Độ tuổi khuyến nghị">{sample.rating}</span>
                {Array.isArray(sample.formats) && sample.formats.map((f) => (
                  <span key={f} className="badge-format" title="Định dạng">{f}</span>
                ))}
                <button
                  className={`favorite-btn ${isFavorite ? 'favorite-btn--active' : ''}`}
                  onClick={() => setIsFavorite(!isFavorite)}
                  aria-label={isFavorite ? 'Bỏ yêu thích' : 'Yêu thích'}
                  title={isFavorite ? 'Bỏ yêu thích' : 'Thêm vào yêu thích'}
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill={isFavorite ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                  </svg>
                </button>
              </div>

              {/* Movie Info Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginBottom: '20px' }}>
                <div className="movie-info-card">
                  <div className="movie-info-card__icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="2" y="4" width="20" height="16" rx="2"/>
                      <path d="M7 4v16M17 4v16M2 8h20M2 12h20M2 16h20"/>
                    </svg>
                  </div>
                  <div>
                    <div className="movie-info-card__label">Thể loại</div>
                    <div className="movie-info-card__value">{sample.genre}</div>
                  </div>
                </div>
                <div className="movie-info-card">
                  <div className="movie-info-card__icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10"/>
                      <polyline points="12 6 12 12 16 14"/>
                    </svg>
                  </div>
                  <div>
                    <div className="movie-info-card__label">Thời lượng</div>
                    <div className="movie-info-card__value">{sample.duration} phút</div>
                  </div>
                </div>
                <div className="movie-info-card">
                  <div className="movie-info-card__icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10"/>
                      <line x1="2" y1="12" x2="22" y2="12"/>
                      <line x1="12" y1="2" x2="12" y2="22"/>
                    </svg>
                  </div>
                  <div>
                    <div className="movie-info-card__label">Ngôn ngữ</div>
                    <div className="movie-info-card__value">{sample.language}</div>
                  </div>
                </div>
                <div className="movie-info-card">
                  <div className="movie-info-card__icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                      <line x1="16" y1="2" x2="16" y2="6"/>
                      <line x1="8" y1="2" x2="8" y2="6"/>
                      <line x1="3" y1="10" x2="21" y2="10"/>
                    </svg>
                  </div>
                  <div>
                    <div className="movie-info-card__label">Ngày khởi chiếu</div>
                    <div className="movie-info-card__value">{sample.release}</div>
                  </div>
                </div>
              </div>

              {/* Director & Cast Section */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                <div className="movie-detail-section">
                  <div className="movie-detail-section__header">
                    <span className="movie-detail-section__icon">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                        <line x1="9" y1="3" x2="9" y2="21"/>
                        <line x1="3" y1="9" x2="21" y2="9"/>
                      </svg>
                    </span>
                    <span className="movie-detail-section__title">Đạo diễn</span>
                  </div>
                  <div className="movie-detail-section__content">{sample.director}</div>
                </div>
                <div className="movie-detail-section">
                  <div className="movie-detail-section__header">
                    <span className="movie-detail-section__icon">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                        <circle cx="12" cy="7" r="4"/>
                      </svg>
                    </span>
                    <span className="movie-detail-section__title">Diễn viên</span>
                  </div>
                  <div className="movie-detail-section__content">{sample.cast}</div>
                </div>
              </div>

              {/* Synopsis Section */}
              <div className="movie-synopsis">
                <div className="movie-synopsis__header">
                  <span className="movie-synopsis__icon">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
                      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
                    </svg>
                  </span>
                  <span className="movie-synopsis__title">Nội dung</span>
                </div>
                <p className="movie-synopsis__text">{sample.desc}</p>
              </div>

              {/* Action Buttons */}
              <div style={{ marginTop: '24px', display: 'flex', gap: '12px' }}>
                {sample.status !== 'ENDED' && (
                  <button className="btn btn--primary" onClick={() => setShowBooking(true)} style={{ fontSize: '16px', padding: '14px 24px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M2 9a3 3 0 0 1 3-3h14a3 3 0 0 1 3 3v6a3 3 0 0 1-3 3H5a3 3 0 0 1-3-3V9z"/>
                      <path d="M6 9v6M18 9v6"/>
                    </svg>
                    Mua vé
                  </button>
                )}
                <button className="btn btn--ghost" onClick={() => setShowTrailer(true)} style={{ fontSize: '16px', padding: '14px 24px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polygon points="5 3 19 12 5 21 5 3"/>
                  </svg>
                  Xem Trailer
                </button>
              </div>
            </div>
          </div>
        </section>

        <section className="section">
          <div className="container">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#ffd159' }}>
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
                <h2 className="section__title" style={{ margin: 0 }}>Đánh giá</h2>
              </div>
              {totalReviews > 0 && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ display: 'flex', gap: '4px' }}>
                      {renderStars(Math.round(parseFloat(averageRating)))}
                    </div>
                    <span style={{ fontSize: '20px', fontWeight: 800, color: '#ffd159' }}>
                      {averageRating}
                    </span>
                  </div>
                  <span style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '14px' }}>
                    ({totalReviews} đánh giá)
                  </span>
                </div>
              )}
            </div>

            {reviews.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 20px', color: 'rgba(255, 255, 255, 0.6)' }}>
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ margin: '0 auto 16px', opacity: 0.4 }}>
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
                <p style={{ margin: 0, fontSize: '16px' }}>Chưa có đánh giá nào</p>
              </div>
            ) : (
              <>
                <div className="movie-reviews-list">
                  {currentReviews.map((review) => {
                    const isExpanded = isReviewExpanded(review.id);
                    const hasLongReview = shouldTruncate(review.reviewText);
                    const displayText = isExpanded || !hasLongReview 
                      ? review.reviewText 
                      : truncateText(review.reviewText);
                    
                    return (
                      <div key={review.id} className="movie-review-card">
                        <div className="movie-review-card__avatar">
                          <img src={review.avatar} alt={review.userName} />
                        </div>
                        <div className="movie-review-card__content">
                          <div className="movie-review-card__header">
                            <div className="movie-review-card__user-info">
                              <h4 className="movie-review-card__user-name">{review.userName}</h4>
                              <div className="movie-review-card__rating">
                                <div className="movie-review-card__stars">
                                  {renderStars(review.rating)}
                                </div>
                              </div>
                            </div>
                            <div className="movie-review-card__date">
                              {formatShortDate(review.reviewDate)}
                            </div>
                          </div>
                          <div className="movie-review-card__review">
                            <p className="movie-review-card__review-text">
                              {displayText}
                            </p>
                            {hasLongReview && (
                              <button
                                className="movie-review-card__expand"
                                onClick={() => toggleReview(review.id)}
                              >
                                <span>{isExpanded ? 'Thu gọn' : 'Mở rộng'}</span>
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
                        </div>
                      </div>
                    );
                  })}
                </div>
                {totalPages > 1 && (
                  <div className="movie-reviews-pagination">
                    <button
                      className="movie-reviews-pagination__btn"
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="15 18 9 12 15 6"></polyline>
                      </svg>
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        className={`movie-reviews-pagination__btn movie-reviews-pagination__btn--number ${currentPage === page ? 'movie-reviews-pagination__btn--active' : ''}`}
                        onClick={() => setCurrentPage(page)}
                      >
                        {page}
                      </button>
                    ))}
                    <button
                      className="movie-reviews-pagination__btn"
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="9 18 15 12 9 6"></polyline>
                      </svg>
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </section>
      </main>

      <BookingModal
        isOpen={showBooking}
        onClose={() => setShowBooking(false)}
        movieTitle={sample.title}
        onShowtimeClick={(bookingUrl) => {
          setPendingBookingUrl(bookingUrl);
          setAgeConfirmed(false);
          setShowAgeConfirmModal(true);
          setShowBooking(false); // Đóng modal chọn suất
        }}
        options={{
          movieId: sample.movieId || 1,
          cinemas: [
            { id: 'cns_q6', name: 'Cinestar Satra Quận 6 (TPHCM)', province: 'Hồ Chí Minh' },
            { id: 'cns_qt', name: 'Cinestar Quốc Thanh (TPHCM)', province: 'Hồ Chí Minh' },
            { id: 'cns_hbt', name: 'Cinestar Hai Bà Trưng (TPHCM)', province: 'Hồ Chí Minh' },
            { id: 'cns_hn1', name: 'Cinestar Hà Nội 1', province: 'Hà Nội' },
            { id: 'cns_hn2', name: 'Cinestar Hà Nội 2', province: 'Hà Nội' },
            { id: 'cns_dn', name: 'Cinestar Đà Nẵng', province: 'Đà Nẵng' },
          ],
          formats: ['STANDARD', 'IMAX 2D'],
          showtimes: {
            cns_q6: { STANDARD: ['19:30', '21:30'] },
            cns_qt: { STANDARD: ['22:10'] },
            cns_hbt: { STANDARD: ['20:10', '22:30'] },
            cns_hn1: { STANDARD: ['18:00', '20:30'] },
            cns_hn2: { STANDARD: ['19:00', '21:00'] },
            cns_dn: { STANDARD: ['17:30', '19:45'] }
          }
        }}
      />

      {/* Age Confirmation Modal */}
      {showAgeConfirmModal && (
        <div 
          className="modal-overlay" 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10000
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowAgeConfirmModal(false);
              setPendingBookingUrl(null);
              setAgeConfirmed(false);
            }
          }}
        >
          <div 
            className="modal-content"
            style={{
              backgroundColor: '#2d2627',
              borderRadius: '12px',
              padding: '32px',
              maxWidth: '500px',
              width: '90%',
              border: '1px solid #4a3f41'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 style={{ 
              margin: '0 0 24px', 
              fontSize: '24px', 
              fontWeight: 800, 
              color: '#fff',
              textAlign: 'center'
            }}>
              Xác nhận độ tuổi
            </h2>
            
            <div style={{ 
              marginBottom: '24px',
              padding: '20px',
              backgroundColor: '#1a1415',
              borderRadius: '8px',
              border: '1px solid #4a3f41'
            }}>
              <div style={{ 
                fontSize: '16px', 
                color: '#fff', 
                marginBottom: '12px',
                fontWeight: 600
              }}>
                Phim: {sample.title.replace(/\s*\(T\d+\)\s*/g, '')}
              </div>
              <div style={{ 
                fontSize: '14px', 
                color: '#c9c4c5',
                lineHeight: '1.6'
              }}>
                <strong style={{ color: '#ffd159' }}>{sample.rating}:</strong> Phim dành cho khán giả từ đủ {sample.rating.replace('T', '')} tuổi trở lên ({sample.rating.replace('T', '')}+)
              </div>
            </div>

            <div style={{ 
              marginBottom: '24px',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '12px'
            }}>
              <input
                type="checkbox"
                id="age-confirm-checkbox"
                checked={ageConfirmed}
                onChange={(e) => setAgeConfirmed(e.target.checked)}
                style={{
                  width: '20px',
                  height: '20px',
                  marginTop: '2px',
                  cursor: 'pointer',
                  accentColor: '#e83b41'
                }}
              />
              <label 
                htmlFor="age-confirm-checkbox"
                style={{
                  fontSize: '14px',
                  color: '#c9c4c5',
                  lineHeight: '1.6',
                  cursor: 'pointer',
                  flex: 1
                }}
              >
                Tôi xác nhận rằng tôi đã đủ {sample.rating.replace('T', '')} tuổi trở lên và đủ điều kiện để xem phim này.
              </label>
            </div>

            <div style={{ 
              display: 'flex',
              gap: '12px',
              justifyContent: 'flex-end'
            }}>
              <button
                className="btn btn--ghost"
                onClick={() => {
                  setShowAgeConfirmModal(false);
                  setPendingBookingUrl(null);
                  setAgeConfirmed(false);
                }}
                style={{
                  padding: '12px 24px',
                  fontSize: '14px',
                  fontWeight: 600
                }}
              >
                Hủy
              </button>
              <button
                className="btn btn--primary"
                onClick={() => {
                  if (ageConfirmed && pendingBookingUrl) {
                    window.location.href = pendingBookingUrl;
                  }
                }}
                disabled={!ageConfirmed}
                style={{
                  padding: '12px 24px',
                  fontSize: '14px',
                  fontWeight: 600,
                  opacity: ageConfirmed ? 1 : 0.5,
                  cursor: ageConfirmed ? 'pointer' : 'not-allowed'
                }}
              >
                Tiếp tục
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Trailer Overlay */}
      {showTrailer && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.95)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            padding: '20px'
          }}
          onClick={() => setShowTrailer(false)}
        >
          <div
            style={{
              position: 'relative',
              width: '100%',
              maxWidth: '1200px',
              aspectRatio: '16/9'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setShowTrailer(false)}
              style={{
                position: 'absolute',
                top: '-40px',
                right: '0',
                background: 'transparent',
                border: 'none',
                color: '#fff',
                fontSize: '32px',
                cursor: 'pointer',
                padding: '0',
                lineHeight: 1
              }}
            >
              ×
            </button>
            <iframe
              width="100%"
              height="100%"
              src={`https://www.youtube.com/embed/${trailerYoutubeId}?autoplay=1`}
              title="Movie Trailer"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              style={{ borderRadius: '8px' }}
            />
          </div>
        </div>
      )}
      <Footer />
    </div>
  );
}