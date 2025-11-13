import React, { useMemo, useState } from 'react';
import Header from '../components/Header.jsx';
import Footer from '../components/Footer.jsx';
import interstellar from '../assets/images/interstellar.jpg';
import inception from '../assets/images/inception.jpg';
import darkKnightRises from '../assets/images/the-dark-knight-rises.jpg';
import driveMyCar from '../assets/images/drive-my-car.jpg';

const cinemaData = {
  'Quốc Thanh': {
    address: '271 Nguyễn Trãi, Phường Cầu Ông Lãnh, Thành Phố Hồ Chí Minh',
    nowShowing: [
      {
        id: 'inception',
        title: 'Inception',
        rating: 'T16',
        genre: 'Sci-Fi, Hành Động',
        duration: 147,
        origin: 'Mỹ',
        audio: 'Phụ Đề',
        poster: inception,
        description: 'Trong tương lai gần, một tay trộm hành tinh thức lenh, nơi Predator nợ nần – kẻ bị săn đuổi có cơ hội nhận lại tự do – tìm thấy một mục tiêu không ngờ tới là một bé gái bản lĩnh.',
        showtimes: {
          STANDARD: ['12:00', '15:00', '18:15', '20:10'],
          DELUXE: ['09:00']
        }
      },
      {
        id: 'interstellar',
        title: 'Interstellar',
        rating: 'T13',
        genre: 'Sci-Fi, Phiêu Lưu',
        duration: 169,
        origin: 'Mỹ',
        audio: 'Phụ Đề',
        poster: interstellar,
        description: 'Một nhóm nhà thám hiểm không gian đi qua một lỗ sâu đục để vượt qua những hạn chế về du hành không gian của con người và thực hiện một chuyến du hành xuyên thiên hà.',
        showtimes: {
          STANDARD: ['12:30', '23:10'],
          DELUXE: ['15:15']
        }
      },
      {
        id: 'dark-knight',
        title: 'The Dark Knight Rises',
        rating: 'T16',
        genre: 'Hành Động, Tội Phạm',
        duration: 164,
        origin: 'Mỹ',
        audio: 'Phụ Đề',
        poster: darkKnightRises,
        description: 'Tám năm sau sự kiện của The Dark Knight, Batman bị buộc phải quay trở lại từ lưu vong để bảo vệ Gotham City khỏi Bane, một kẻ khủng bố hung bạo.',
        showtimes: {
          STANDARD: ['08:20', '17:20', '20:40', '22:50']
        }
      }
    ],
    comingSoon: [
      {
        id: 'drive',
        title: 'Drive My Car',
        rating: 'T13',
        genre: 'Drama',
        duration: 179,
        origin: 'Nhật Bản',
        audio: 'Phụ Đề',
        poster: driveMyCar,
        releaseDate: '15/11/2025',
        description: 'Một đạo diễn sân khấu góa vợ chấp nhận một dự án ở Hiroshima, nơi anh gặp một người phụ nữ trẻ với quá khứ đầy bí ẩn.'
      }
    ]
  }
};

export default function CinemaDetail() {
  const query = useMemo(() => {
    const h = window.location.hash || '';
    const qIndex = h.indexOf('?');
    const params = new URLSearchParams(qIndex >= 0 ? h.slice(qIndex + 1) : '');
    return Object.fromEntries(params.entries());
  }, []);

  const cinemaName = query.name || 'Quốc Thanh';
  const province = query.province || 'TP.HCM';
  const cinema = cinemaData[cinemaName] || cinemaData['Quốc Thanh'];
  const [activeTab, setActiveTab] = useState('now-showing');

  return (
    <div className="min-h-screen cinema-mood">
      <Header />

      <div className="cinema-header">
        <div className="container">
          <h1 className="cinema-header__title">CINESTAR {cinemaName.toUpperCase()} ({province})</h1>
          <p className="cinema-header__address">{cinema.address}</p>
        </div>
      </div>

      <div className="cinema-nav">
        <div className="container">
          <button
            className={`cinema-nav__tab ${activeTab === 'now-showing' ? 'cinema-nav__tab--active' : ''}`}
            onClick={() => setActiveTab('now-showing')}
          >
            PHIM ĐANG CHIẾU
          </button>
          <button
            className={`cinema-nav__tab ${activeTab === 'coming-soon' ? 'cinema-nav__tab--active' : ''}`}
            onClick={() => setActiveTab('coming-soon')}
          >
            PHIM SẮP CHIẾU
          </button>
        </div>
      </div>

      <main className="main">
        <section className="section">
          <div className="container">
            <h2 className="section__title" style={{ textAlign: 'center', marginBottom: '24px' }}>
              {activeTab === 'now-showing' ? 'PHIM ĐANG CHIẾU' : 'PHIM SẮP CHIẾU'}
            </h2>

            {activeTab === 'now-showing' && (
              <div className="cinema-movies">
                {cinema.nowShowing.map((movie) => (
                  <div key={movie.id} className="cinema-movie-card">
                    <div className="cinema-movie-card__poster">
                      <img src={movie.poster} alt={movie.title} />
                    </div>
                    <div className="cinema-movie-card__content">
                      <div className="cinema-movie-card__header">
                        <h3 className="cinema-movie-card__title">{movie.title} ({movie.rating})</h3>
                      </div>
                      <div className="cinema-movie-card__meta">
                        <span>{movie.genre}</span>
                        <span>{movie.duration} phút</span>
                        <span>{movie.origin}</span>
                        <span>{movie.audio}</span>
                      </div>
                      <div className="cinema-movie-card__rating-desc">
                        {movie.rating}: Phim dành cho khán giả từ đủ {movie.rating.replace('T', '')} tuổi trở lên ({movie.rating.replace('T', '')}+)
                      </div>
                      {movie.description && (
                        <div className="cinema-movie-card__description" style={{ marginTop: '12px', color: '#c9c4c5', fontSize: '14px', lineHeight: '1.6' }}>
                          {movie.description}
                        </div>
                      )}
                      <div style={{ marginTop: '16px' }}>
                        <a 
                          href={`#movie?title=${encodeURIComponent(movie.title)}`} 
                          className="cinema-movie-card__more-link"
                          style={{ 
                            display: 'inline-block',
                            padding: '10px 20px',
                            backgroundColor: '#e83b41',
                            color: '#fff',
                            textDecoration: 'none',
                            borderRadius: '4px',
                            fontWeight: 600,
                            fontSize: '14px',
                            transition: 'background-color 0.3s'
                          }}
                          onMouseEnter={(e) => e.target.style.backgroundColor = '#c92e33'}
                          onMouseLeave={(e) => e.target.style.backgroundColor = '#e83b41'}
                        >
                          Đặt vé
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'coming-soon' && (
              <div className="cinema-movies">
                {cinema.comingSoon.map((movie) => (
                  <div key={movie.id} className="cinema-movie-card">
                    <div className="cinema-movie-card__poster">
                      <img src={movie.poster} alt={movie.title} />
                    </div>
                    <div className="cinema-movie-card__content">
                      <div className="cinema-movie-card__header">
                        <h3 className="cinema-movie-card__title">{movie.title} ({movie.rating})</h3>
                      </div>
                      <div className="cinema-movie-card__meta">
                        <span>{movie.genre}</span>
                        <span>{movie.duration} phút</span>
                        <span>{movie.origin}</span>
                        <span>{movie.audio}</span>
                      </div>
                      <div className="cinema-movie-card__rating-desc">
                        {movie.rating}: Phim dành cho khán giả từ đủ {movie.rating.replace('T', '')} tuổi trở lên ({movie.rating.replace('T', '')}+)
                      </div>
                      <div style={{ marginTop: '12px', color: '#ffd159', fontWeight: 600 }}>
                        Khởi chiếu: {movie.releaseDate}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

