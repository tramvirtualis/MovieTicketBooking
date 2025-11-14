import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header.jsx';
import Footer from '../components/Footer.jsx';

const movies = [
  { id: 'drive', title: 'Drive My Car', poster: '/src/assets/images/drive-my-car.jpg' },
  { id: 'inception', title: 'Inception', poster: '/src/assets/images/inception.jpg' },
  { id: 'interstellar', title: 'Interstellar', poster: '/src/assets/images/interstellar.jpg' },
];

const cinemas = [
  { id: 'cns_q6', name: 'Cinestar Satra Quận 6 (TPHCM)' },
  { id: 'cns_qt', name: 'Cinestar Quốc Thanh (TPHCM)' },
  { id: 'cns_hbt', name: 'Cinestar Hai Bà Trưng (TPHCM)' },
];

const listings = [
  {
    movieId: 'drive',
    cinemaId: 'cns_hbt',
    address: '135 Hai Bà Trưng, Quận 1, TPHCM',
    formats: [{ label: 'STANDARD', times: ['21:10'] }],
  },
  {
    movieId: 'inception',
    cinemaId: 'cns_q6',
    address: '1466 Võ Văn Kiệt, Quận 6, TPHCM',
    formats: [{ label: 'STANDARD', times: ['23:00', '23:30'] }],
  },
  {
    movieId: 'interstellar',
    cinemaId: 'cns_qt',
    address: '271 Nguyễn Trãi, Quận 1, TPHCM',
    formats: [{ label: 'STANDARD', times: ['22:10'] }],
  },
];

export default function Schedule() {
  const today = useMemo(() => new Date(), []);
  const [date, setDate] = useState(today.toISOString().substring(0, 10));
  const [movie, setMovie] = useState('');
  const [cinema, setCinema] = useState('');

  const filtered = listings.filter((l) => {
    const okMovie = movie ? l.movieId === movie : true;
    const okCinema = cinema ? l.cinemaId === cinema : true;
    return okMovie && okCinema; // date filter placeholder (extend when backend ready)
  });

  const getMovie = (id) => movies.find((m) => m.id === id);
  const getCinema = (id) => cinemas.find((c) => c.id === id);

  return (
    <div className="min-h-screen cinema-mood">
      <Header />

      <main className="main">
        <section className="section">
          <div className="container grid gap-4">
            <div className="grid grid-cols-3 gap-3">
              <label className="field">
                <span className="field__label">Ngày</span>
                <input className="field__input" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
              </label>
              <label className="field">
                <span className="field__label">Phim</span>
                <select className="field__input" value={movie} onChange={(e) => setMovie(e.target.value)}>
                  <option value="">Chọn phim</option>
                  {movies.map((m) => (
                    <option key={m.id} value={m.id}>{m.title}</option>
                  ))}
                </select>
              </label>
              <label className="field">
                <span className="field__label">Rạp</span>
                <select className="field__input" value={cinema} onChange={(e) => setCinema(e.target.value)}>
                  <option value="">Chọn rạp</option>
                  {cinemas.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </label>
            </div>

            <div className="grid gap-5 mt-2">
              {filtered.map((item, idx) => {
                const m = getMovie(item.movieId);
                const c = getCinema(item.cinemaId);
                return (
                  <div key={idx} className="card grid grid-cols-[160px_1fr] gap-4 p-3">
                    <Link to={`/movie/${m?.id || encodeURIComponent(m?.title || '')}`}>
                      <img src={m?.poster} alt={m?.title} className="w-full h-[220px] object-cover rounded-lg" />
                    </Link>
                    <div>
                      <div className="card__title text-lg">{m?.title}</div>
                      <div className="card__meta mt-1">{c?.name}</div>
                      <div className="card__meta">{item.address}</div>
                      <div className="mt-3">
                        <Link
                          to={`/movie/${m?.id || encodeURIComponent(m?.title || '')}?cinema=${encodeURIComponent(c?.id || '')}`}
                          className="inline-flex items-center justify-center px-6 py-2.5 bg-gradient-to-r from-[#e83b41] to-[#ff5258] hover:from-[#ff5258] hover:to-[#ff6b6b] text-white font-semibold text-sm rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105 active:scale-95"
                        >
                          Đặt vé
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}



