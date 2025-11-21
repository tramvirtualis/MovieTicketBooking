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

const formatRoomType = (format) => {
  if (!format) return '';
  // Convert TYPE_2D -> 2D, TYPE_3D -> 3D, DELUXE -> DELUXE
  if (format.startsWith('TYPE_')) {
    return format.replace('TYPE_', '');
  }
  return format;
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
    const movieGroups = new Map();
    const now = new Date();
    const minTime = new Date(now.getTime() + 30 * 60 * 1000); // 30 phút từ bây giờ

    listings.forEach((item) => {
      // Filter: chỉ hiển thị showtime chưa chiếu và còn hơn 30 phút nữa
      const showtimeDate = new Date(item.startTime);
      if (showtimeDate <= minTime) {
        return; // Bỏ qua showtime đã qua hoặc còn ít hơn 30 phút
      }

      const movieKey = item.movieId ?? `movie-${item.showtimeId}`;

      if (!movieGroups.has(movieKey)) {
        movieGroups.set(movieKey, {
          key: movieKey,
          movie: {
            id: item.movieId,
            title: item.movieTitle,
            poster: item.moviePoster,
          },
          cinemas: new Map(),
        });
      }

      const group = movieGroups.get(movieKey);
      const cinemaKey = item.cinemaId ?? `cinema-${item.showtimeId}`;

      if (!group.cinemas.has(cinemaKey)) {
        group.cinemas.set(cinemaKey, {
          id: item.cinemaId,
          name: item.cinemaName,
          address: item.cinemaAddress,
          showtimes: [],
        });
      }

      group.cinemas.get(cinemaKey).showtimes.push({
        id: item.showtimeId,
        label: formatTime(item.startTime),
        format: formatRoomType(item.formatLabel || 'STANDARD'),
        room: item.cinemaRoomName,
        startTime: item.startTime,
        cinemaId: item.cinemaId,
      });
    });

    // Convert to array and sort showtimes
    // Filter out cinemas with no valid showtimes
    return Array.from(movieGroups.values())
      .map((group) => ({
        ...group,
        cinemas: Array.from(group.cinemas.values())
          .map((cinema) => ({
            ...cinema,
            showtimes: cinema.showtimes.sort(
              (a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
            ),
          }))
          .filter((cinema) => cinema.showtimes.length > 0), // Chỉ giữ cinemas có showtimes hợp lệ
      }))
      .filter((group) => group.cinemas.length > 0); // Chỉ giữ movies có ít nhất 1 cinema với showtimes hợp lệ
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
          <div className="container">
            {/* Header Section */}
            <div className="mb-8">
              <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight mb-2 flex items-center gap-3">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[#ffd159]">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                  <line x1="16" y1="2" x2="16" y2="6"/>
                  <line x1="8" y1="2" x2="8" y2="6"/>
                  <line x1="3" y1="10" x2="21" y2="10"/>
                </svg>
                Lịch chiếu phim
              </h1>
              <p className="text-[#c9c4c5] text-sm">Tìm và đặt vé xem phim yêu thích của bạn</p>
            </div>

            {/* Filter Section */}
            <div className="bg-gradient-to-br from-[#2d2627] to-[#1a1415] border border-[#4a3f41] rounded-xl p-6 mb-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <label className="field">
                  <span className="field__label flex items-center gap-2 text-white mb-2">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[#ffd159]">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                      <line x1="16" y1="2" x2="16" y2="6"/>
                      <line x1="8" y1="2" x2="8" y2="6"/>
                      <line x1="3" y1="10" x2="21" y2="10"/>
                    </svg>
                    NGÀY
                  </span>
                  <input
                    className="field__input bg-[#1a1415] border-[#4a3f41] text-white focus:border-[#ffd159] focus:ring-1 focus:ring-[#ffd159]"
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                  />
                </label>

                <label className="field">
                  <span className="field__label flex items-center gap-2 text-white mb-2">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[#ffd159]">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                      <circle cx="12" cy="10" r="3"/>
                    </svg>
                    PHIM
                  </span>
                  <select 
                    className="field__input bg-[#1a1415] border-[#4a3f41] text-white focus:border-[#ffd159] focus:ring-1 focus:ring-[#ffd159]" 
                    value={movie} 
                    onChange={(e) => setMovie(e.target.value)}
                  >
                    <option value="">Chọn phim</option>
                    {movieOptions.map((m) => (
                      <option key={m.movieId} value={String(m.movieId)}>{m.title}</option>
                    ))}
                  </select>
                </label>

                <label className="field">
                  <span className="field__label flex items-center gap-2 text-white mb-2">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[#ffd159]">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                      <circle cx="12" cy="10" r="3"/>
                    </svg>
                    RẠP
                  </span>
                  <select 
                    className="field__input bg-[#1a1415] border-[#4a3f41] text-white focus:border-[#ffd159] focus:ring-1 focus:ring-[#ffd159]" 
                    value={cinema} 
                    onChange={(e) => setCinema(e.target.value)}
                  >
                    <option value="">Chọn rạp</option>
                    {cinemaOptions.map((c) => (
                      <option key={c.cinemaId} value={String(c.cinemaId)}>{c.name}</option>
                    ))}
                  </select>
                </label>
              </div>
            </div>

            {/* Content Section */}
            <div className="space-y-6">
              {error && (
                <div className="bg-gradient-to-br from-red-900/20 to-red-800/10 border border-red-500/30 rounded-xl p-4 text-red-400 flex items-center gap-3">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="12" y1="8" x2="12" y2="12"/>
                    <line x1="12" y1="16" x2="12.01" y2="16"/>
                  </svg>
                  {error}
                </div>
              )}

              {isLoading && (
                <div className="bg-gradient-to-br from-[#2d2627] to-[#1a1415] border border-[#4a3f41] rounded-xl p-12 text-center">
                  <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-[#ffd159] border-t-transparent mb-4"></div>
                  <p className="text-[#c9c4c5]">Đang tải dữ liệu...</p>
                </div>
              )}

              {!isLoading && !error && !hasData && (
                <div className="bg-gradient-to-br from-[#2d2627] to-[#1a1415] border border-[#4a3f41] rounded-xl p-12 text-center">
                  <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-[#4a3f41] mx-auto mb-4">
                    <circle cx="12" cy="12" r="10"/>
                    <line x1="12" y1="8" x2="12" y2="12"/>
                    <line x1="12" y1="16" x2="12.01" y2="16"/>
                  </svg>
                  <p className="text-[#c9c4c5] text-lg mb-2">Không tìm thấy lịch chiếu phù hợp</p>
                  <p className="text-[#7a6f71] text-sm">Vui lòng thử bộ lọc khác hoặc chọn ngày khác</p>
                </div>
              )}

              {!isLoading && !error && hasData && cards.map((card) => (
                <div 
                  key={card.key} 
                  className="bg-gradient-to-br from-[#2d2627] to-[#1a1415] border border-[#4a3f41] rounded-xl p-6 hover:border-[#ffd159]/50 transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  <div className="grid grid-cols-1 md:grid-cols-[180px_1fr] gap-6">
                    {/* Movie Poster */}
                    <Link 
                      to={card.movie.id ? `/movie/${card.movie.id}` : '#'}
                      className="group relative overflow-hidden rounded-lg"
                    >
                      <img
                        src={card.movie.poster || placeholderPoster}
                        alt={card.movie.title || 'Poster'}
                        className="w-full h-[260px] object-cover rounded-lg transition-transform duration-300 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg flex items-end justify-center pb-4">
                        <span className="text-white text-sm font-semibold">Xem chi tiết</span>
                      </div>
                    </Link>

                    {/* Movie Info */}
                    <div className="flex flex-col">
                      <Link 
                        to={card.movie.id ? `/movie/${card.movie.id}` : '#'}
                        className="group"
                      >
                        <h2 className="text-2xl font-bold text-white mb-4 group-hover:text-[#ffd159] transition-colors">
                          {card.movie.title || 'Đang cập nhật'}
                        </h2>
                      </Link>

                      {/* All Cinemas and Showtimes */}
                      <div className="space-y-4">
                        {card.cinemas.map((cinema) => (
                          <div key={cinema.id || cinema.name} className="pb-4 border-b border-[#4a3f41] last:border-0 last:pb-0">
                            {/* Cinema Info */}
                            <div className="flex items-start gap-2 mb-3">
                              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[#ffd159] flex-shrink-0 mt-0.5">
                                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                                <circle cx="12" cy="10" r="3"/>
                              </svg>
                              <div className="flex-1">
                                <div className="text-white font-semibold mb-1">{cinema.name || 'Rạp đang cập nhật'}</div>
                                <div className="text-[#c9c4c5] text-sm">{cinema.address}</div>
                              </div>
                            </div>

                            {/* Showtimes */}
                            {cinema.showtimes.length > 0 && (
                              <div className="flex flex-wrap gap-2">
                                {cinema.showtimes.map((showtime) => (
                                  <Link
                                    key={showtime.id}
                                    to={card.movie.id ? `/movie/${card.movie.id}` : '#'}
                                    className="schedule-showtime-btn"
                                    title={showtime.room ? `Phòng: ${showtime.room}` : undefined}
                                    onClick={(e) => {
                                      if (!card.movie.id) {
                                        e.preventDefault();
                                      }
                                    }}
                                  >
                                    <span className="schedule-showtime-btn__time">{showtime.label}</span>
                                    <span className="schedule-showtime-btn__format">• {showtime.format}</span>
                                  </Link>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>

                      {/* Book Button */}
                      <div className="mt-6 pt-4 border-t border-[#4a3f41]">
                        <Link
                          to={card.movie.id ? `/movie/${card.movie.id}` : '#'}
                          className="inline-flex items-center justify-center gap-2 px-8 py-3 bg-gradient-to-r from-[#e83b41] to-[#ff5258] hover:from-[#ff5258] hover:to-[#ff6b6b] text-white font-bold text-base rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105 active:scale-95"
                          onClick={(e) => {
                            if (!card.movie.id) {
                              e.preventDefault();
                            }
                          }}
                        >
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                            <path d="M2 9a3 3 0 0 1 3-3h14a3 3 0 0 1 3 3v6a3 3 0 0 1-3 3H5a3 3 0 0 1-3-3V9z"/>
                            <path d="M6 9v6M18 9v6"/>
                          </svg>
                          Đặt vé
                        </Link>
                      </div>
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
