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
    language: 'Khác',
    rating: 'T16',
    desc: 'Trong tương lai gần, một tay trộm hành tinh thức lenh, nơi Predator nợ nần – kẻ bị săn đuổi có cơ hội nhận lại tự do – tìm thấy một mục tiêu không ngờ tới là một bé gái bản lĩnh.',
    director: 'Christopher Nolan',
    cast: 'Leonardo DiCaprio, Joseph Gordon‑Levitt, Ellen Page',
    poster: query.poster || '',
    release: 'Thứ Sáu, 07/11/2025',
  };

  const [dayIdx, setDayIdx] = useState(0);
  const days = [
    { label: 'Thứ Sáu', date: '07/11' },
    { label: 'Thứ Bảy', date: '08/11' },
  ];

  const cinemas = [
    {
      name: 'Cinestar Satra Quận 6 (TPHCM)',
      address: 'Tầng 6, TTTM Satra Vs Văn Kiệt, 1466 Võ Văn Kiệt, Phường 1, Quận 6, TPHCM',
      formats: [
        { label: 'Standard', times: ['09:15', '12:10', '21:05'] },
      ],
    },
    {
      name: 'Cinestar Quốc Thanh (TPHCM)',
      address: '271 Nguyễn Trãi, Phường Nguyễn Cư Trinh, Quận 1, Thành Phố Hồ Chí Minh',
      formats: [
        { label: 'Standard', times: ['11:45', '14:45', '19:30', '21:40'] },
        { label: 'Deluxe', times: ['09:00'] },
      ],
    },
  ];

  const [showBooking, setShowBooking] = useState(false);
  const [showTrailer, setShowTrailer] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

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
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                <h1 className="section__title" style={{ fontSize: 'clamp(24px, 3vw, 32px)', margin: 0, fontWeight: 900 }}>{sample.title}</h1>
                <span className="badge-rating" title="Độ tuổi khuyến nghị">{sample.rating}</span>
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
                    <div className="movie-info-card__label">Dự kiến</div>
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
                <button className="btn btn--primary" onClick={() => setShowBooking(true)} style={{ fontSize: '16px', padding: '14px 24px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M2 9a3 3 0 0 1 3-3h14a3 3 0 0 1 3 3v6a3 3 0 0 1-3 3H5a3 3 0 0 1-3-3V9z"/>
                    <path d="M6 9v6M18 9v6"/>
                  </svg>
                  Mua vé
                </button>
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#ffd159' }}>
                <rect x="2" y="4" width="20" height="16" rx="2"/>
                <path d="M7 4v16M17 4v16M2 8h20M2 12h20M2 16h20"/>
              </svg>
              <h2 className="section__title" style={{ margin: 0 }}>Lịch chiếu</h2>
            </div>
            
            <div style={{ display: 'flex', gap: '10px', marginBottom: '24px', flexWrap: 'wrap' }}>
              {days.map((d, i) => (
                <button
                  key={i}
                  className={`schedule-date-btn ${i === dayIdx ? 'schedule-date-btn--active' : ''}`}
                  onClick={() => setDayIdx(i)}
                >
                  <div className="schedule-date-btn__date">{d.date}</div>
                  <div className="schedule-date-btn__day">{d.label}</div>
                </button>
              ))}
            </div>

            <div style={{ display: 'grid', gap: '20px' }}>
              {cinemas.map((c, idx) => (
                <div key={idx} className="cinema-schedule-card">
                  <div className="cinema-schedule-card__header">
                    <div>
                      <h3 className="cinema-schedule-card__title">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '6px' }}>
                          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                          <circle cx="12" cy="10" r="3"/>
                        </svg>
                        {c.name}
                      </h3>
                      <p className="cinema-schedule-card__address">{c.address}</p>
                    </div>
                  </div>
                  <div className="cinema-schedule-card__formats">
                    {c.formats.map((f, i) => (
                      <div key={i} className="cinema-schedule-card__format">
                        <div className="cinema-schedule-card__format-label">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '6px' }}>
                            <rect x="2" y="4" width="20" height="16" rx="2"/>
                            <path d="M7 4v16M17 4v16M2 8h20M2 12h20M2 16h20"/>
                          </svg>
                          {f.label}
                        </div>
                        <div className="cinema-schedule-card__times">
                          {f.times.map((t) => (
                            <a key={t} href="#booking" className="showtime-btn">{t}</a>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <BookingModal
        isOpen={showBooking}
        onClose={() => setShowBooking(false)}
        movieTitle={sample.title}
        options={{
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