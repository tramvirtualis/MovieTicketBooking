import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header.jsx';
import Footer from '../components/Footer.jsx';
import scheduleService from '../services/scheduleService.js';

const formatTime = (value) => {
  if (!value) return '--:--';
  return new Date(value).toLocaleTimeString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
};

export default function Schedule() {
  const [date, setDate] = useState('');
  const [movie, setMovie] = useState('');
  const [cinema, setCinema] = useState('');
  const [options, setOptions] = useState({ movies: [], cinemas: [] });
  const [listings, setListings] = useState([]);
  const [optionsLoading, setOptionsLoading] = useState(false);
  const [listingsLoading, setListingsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let mounted = true;

    const fetchOptions = async () => {
      setOptionsLoading(true);
      try {
        const data = await scheduleService.getOptions({ date: date || undefined });
        if (!mounted) return;

        const movies = data?.movies || [];
        const cinemas = data?.cinemas || [];
        setOptions({ movies, cinemas });

        if (movie && !movies.some((m) => String(m.movieId) === movie)) {
          setMovie('');
        }
        if (cinema && !cinemas.some((c) => String(c.cinemaId) === cinema)) {
          setCinema('');
        }
      } catch (err) {
        if (mounted) {
          setError(err.message || 'Không thể tải dữ liệu.');
        }
      } finally {
        if (mounted) {
          setOptionsLoading(false);
        }
      }
    };

    fetchOptions();
    return () => {
      mounted = false;
    };
  }, [date]);

  useEffect(() => {
    let mounted = true;
    const movieId = movie ? Number(movie) : undefined;
    const cinemaId = cinema ? Number(cinema) : undefined;

    const fetchListings = async () => {
      setListingsLoading(true);
      setError('');
      try {
        const data = await scheduleService.getListings({
          date: date || undefined,
          movieId,
          cinemaId,
        });
        if (!mounted) return;
        setListings(Array.isArray(data) ? data : []);
      } catch (err) {
        if (mounted) {
          setError(err.message || 'Không thể tải lịch chiếu.');
          setListings([]);
        }
      } finally {
        if (mounted) {
          setListingsLoading(false);
        }
      }
    };

    fetchListings();
    return () => {
      mounted = false;
    };
  }, [date, movie, cinema]);

  const cards = useMemo(() => {
    const groups = new Map();

    listings.forEach((item) => {
      const movieKey = item.movieId ?? `movie-${item.showtimeId}`;
      const cinemaKey = item.cinemaId ?? `cinema-${item.showtimeId}`;
      const key = `${movieKey}-${cinemaKey}`;

      if (!groups.has(key)) {
        groups.set(key, {
          key,
          movie: {
            id: item.movieId,
            title: item.movieTitle,
            poster: item.moviePoster,
          },
          cinema: {
            id: item.cinemaId,
            name: item.cinemaName,
            address: item.cinemaAddress,
          },
          showtimes: [],
        });
      }

      groups.get(key).showtimes.push({
        id: item.showtimeId,
        label: formatTime(item.startTime),
        format: item.formatLabel || 'STANDARD',
        room: item.cinemaRoomName,
        startTime: item.startTime,
      });
    });

    return Array.from(groups.values()).map((group) => ({
      ...group,
      showtimes: group.showtimes.sort(
        (a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
      ),
    }));
  }, [listings]);

  const movieOptions = options.movies || [];
  const cinemaOptions = options.cinemas || [];
  const isLoading = optionsLoading || listingsLoading;
  const hasData = cards.length > 0;
  const placeholderPoster = '/src/assets/images/drive-my-car.jpg';

  return (
    <div className="min-h-screen cinema-mood">
      <Header />

      <main className="main">
        <section className="section">
          <div className="container grid gap-4">
            <div className="grid grid-cols-3 gap-3">
              <label className="field">
                <span className="field__label">Ngày</span>
                <input
                  className="field__input"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </label>

              <label className="field">
                <span className="field__label">Phim</span>
                <select className="field__input" value={movie} onChange={(e) => setMovie(e.target.value)}>
                  <option value="">Chọn phim</option>
                  {movieOptions.map((m) => (
                    <option key={m.movieId} value={String(m.movieId)}>{m.title}</option>
                  ))}
                </select>
              </label>

              <label className="field">
                <span className="field__label">Rạp</span>
                <select className="field__input" value={cinema} onChange={(e) => setCinema(e.target.value)}>
                  <option value="">Chọn rạp</option>
                  {cinemaOptions.map((c) => (
                    <option key={c.cinemaId} value={String(c.cinemaId)}>{c.name}</option>
                  ))}
                </select>
              </label>
            </div>

            <div className="grid gap-5 mt-2">
              {error && (
                <div className="card p-4 text-red-600 bg-red-50 border border-red-200 rounded-lg">
                  {error}
                </div>
              )}

              {isLoading && (
                <div className="card p-4 text-center text-gray-500">Đang tải dữ liệu...</div>
              )}

              {!isLoading && !error && !hasData && (
                <div className="card p-4 text-center text-gray-500">
                  Không tìm thấy lịch chiếu phù hợp. Vui lòng thử bộ lọc khác.
                </div>
              )}

              {!isLoading && !error && hasData && cards.map((card) => (
                <div key={card.key} className="card grid grid-cols-[160px_1fr] gap-4 p-3">
                  <Link to={card.movie.id ? `/movie/${card.movie.id}` : '#'}>
                    <img
                      src={card.movie.poster || placeholderPoster}
                      alt={card.movie.title || 'Poster'}
                      className="w-full h-[220px] object-cover rounded-lg"
                    />
                  </Link>

                  <div>
                    <div className="card__title text-lg">{card.movie.title || 'Đang cập nhật'}</div>
                    <div className="card__meta mt-1">{card.cinema.name || 'Rạp đang cập nhật'}</div>
                    <div className="card__meta">{card.cinema.address}</div>

                    <div className="mt-3 flex flex-wrap gap-2">
                      {card.showtimes.map((showtime) => (
                        <span
                          key={showtime.id}
                          className="px-2.5 py-1.5 bg-yellow-500 text-white rounded-md text-sm font-semibold shadow-sm hover:bg-yellow-600 transition-all"
                          title={showtime.room ? `Phòng: ${showtime.room}` : undefined}
                        >
                          {showtime.label} · {showtime.format}
                        </span>
                      ))}
                    </div>

                    <div className="mt-4">
                      <Link
                        to={
                          card.movie.id
                            ? `/movie/${card.movie.id}?cinema=${encodeURIComponent(card.cinema.id || '')}`
                            : '#'
                        }
                        className="inline-flex items-center justify-center px-6 py-2.5 bg-gradient-to-r from-[#e83b41] to-[#ff5258] hover:from-[#ff5258] hover:to-[#ff6b6b] text-white font-semibold text-sm rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 disabled:opacity-60"
                        onClick={(e) => {
                          if (!card.movie.id) {
                            e.preventDefault();
                          }
                        }}
                      >
                        Đặt vé
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>

          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
