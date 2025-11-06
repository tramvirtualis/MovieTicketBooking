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
        releaseDate: '15/11/2025'
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
  const [selectedDate, setSelectedDate] = useState('07/11/2025');

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
                      <div className="cinema-movie-card__showtimes">
                        <div className="cinema-movie-card__date-selector">
                          <span style={{ color: '#c9c4c5', fontSize: '13px' }}>Thứ Sáu, {selectedDate}</span>
                        </div>
                        {Object.entries(movie.showtimes).map(([format, times]) => (
                          <div key={format} className="cinema-movie-card__format">
                            <div className="cinema-movie-card__format-label">{format}</div>
                            <div className="cinema-movie-card__times">
                              {times.map((time) => (
                                <a key={time} href="#booking" className="cinema-time-btn">
                                  {time}
                                </a>
                              ))}
                            </div>
                          </div>
                        ))}
                        <a href="#schedule" className="cinema-movie-card__more-link">Xem thêm lịch chiếu</a>
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

