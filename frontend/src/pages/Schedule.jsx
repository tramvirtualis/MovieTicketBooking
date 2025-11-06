import React, { useMemo, useState } from 'react';
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
          <div className="container" style={{ display: 'grid', gap: '16px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
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

            <div style={{ display: 'grid', gap: '20px', marginTop: '8px' }}>
              {filtered.map((item, idx) => {
                const m = getMovie(item.movieId);
                const c = getCinema(item.cinemaId);
                return (
                  <div key={idx} className="card" style={{ display: 'grid', gridTemplateColumns: '160px 1fr', gap: '16px', padding: '12px' }}>
                    <a href={`#movie?title=${encodeURIComponent(m?.title || '')}`}>
                      <img src={m?.poster} alt={m?.title} style={{ width: '100%', height: '220px', objectFit: 'cover', borderRadius: '8px' }} />
                    </a>
                    <div>
                      <div className="card__title" style={{ fontSize: '18px' }}>{m?.title}</div>
                      <div className="card__meta" style={{ marginTop: '4px' }}>{c?.name}</div>
                      <div className="card__meta">{item.address}</div>
                      <div style={{ display: 'grid', gap: '8px', marginTop: '10px' }}>
                        {item.formats.map((f, i) => (
                          <div key={i}>
                            <div className="card__meta" style={{ marginBottom: '6px' }}>{f.label}</div>
                            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                              {f.times.map((t) => (
                                <a key={t} className="btn" href="#booking" style={{ padding: '8px 12px', background: '#2d2627', border: '1px solid #4a3f41', color: '#fff' }}>{t}</a>
                              ))}
                            </div>
                          </div>
                        ))}
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



