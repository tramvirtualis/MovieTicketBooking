import React, { useMemo, useState } from 'react';
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

  // YouTube video ID của phim (thay bằng ID thực tế)
  const trailerYoutubeId = '8hP9D6kZseM';

  return (
    <div className="min-h-screen cinema-mood">
      <header className="site-header">
        <div className="container nav">
          <a className="logo" href="#home">🎬 cinesmart</a>
          <nav className="menu">
            <a href="#booking">Đặt vé</a>
            <a href="#schedule">Lịch chiếu</a>
            <a href="#cinemas">Rạp</a>
          </nav>
          <div className="actions">
            <a className="btn btn--ghost" href="#register">Register</a>
            <a className="btn btn--primary" href="#signin">Sign In</a>
          </div>
        </div>
      </header>

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
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <h1 className="section__title" style={{ fontSize: '26px', margin: 0 }}>{sample.title}</h1>
                <span className="badge-rating" title="Độ tuổi khuyến nghị">{sample.rating}</span>
              </div>
              <ul style={{ listStyle: 'none', padding: 0, margin: '10px 0', display: 'grid', gap: '6px', color: '#ddd' }}>
                <li>• Thể loại: {sample.genre}</li>
                <li>• Thời lượng: {sample.duration} phút</li>
                <li>• Ngôn ngữ: {sample.language}</li>
                <li>• Dự kiến: {sample.release}</li>
                <li>• Đạo diễn: {sample.director}</li>
                <li>• Diễn viên: {sample.cast}</li>
              </ul>
              <p style={{ color: '#c9c4c5', maxWidth: '72ch' }}>{sample.desc}</p>
              <div style={{ marginTop: '10px', display: 'flex', gap: '10px' }}>
                <button className="btn btn--primary" onClick={() => setShowBooking(true)}>Mua vé</button>
                <button className="btn btn--ghost" onClick={() => setShowTrailer(true)}>Xem Trailer</button>
              </div>
            </div>
          </div>
        </section>

        <section className="section">
          <div className="container">
            <h2 className="section__title" style={{ marginBottom: '12px' }}>Lịch chiếu</h2>
            <div style={{ display: 'flex', gap: '10px', marginBottom: '14px' }}>
              {days.map((d, i) => (
                <button
                  key={i}
                  className="btn"
                  onClick={() => setDayIdx(i)}
                  style={{
                    background: i === dayIdx ? '#e83b41' : 'transparent',
                    color: i === dayIdx ? '#fff' : '#e6e1e2',
                    border: '1px solid rgba(255,255,255,0.25)'
                  }}
                >
                  <div style={{ fontWeight: 800 }}>{d.date}</div>
                  <div style={{ fontSize: '12px' }}>{d.label}</div>
                </button>
              ))}
            </div>

            <div style={{ display: 'grid', gap: '16px' }}>
              {cinemas.map((c, idx) => (
                <div key={idx} className="card" style={{ padding: '12px 14px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: '10px' }}>
                    <h3 className="card__title" style={{ fontSize: '16px' }}>{c.name}</h3>
                  </div>
                  <p className="card__meta" style={{ marginTop: '4px' }}>{c.address}</p>
                  <div style={{ display: 'grid', gap: '8px', marginTop: '8px' }}>
                    {c.formats.map((f, i) => (
                      <div key={i}>
                        <div className="card__meta" style={{ marginBottom: '6px' }}>{f.label}</div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                          {f.times.map((t) => (
                            <a key={t} className="btn" href="#booking" style={{ padding: '8px 12px', background: '#2d2627', border: '1px solid #4a3f41', color: '#fff' }}>{t}</a>
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
    </div>
  );
}