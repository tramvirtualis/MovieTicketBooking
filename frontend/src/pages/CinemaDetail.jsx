import React, { useMemo, useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import Header from '../components/Header.jsx';
import Footer from '../components/Footer.jsx';
import { cinemaComplexService } from '../services/cinemaComplexService';
import scheduleService from '../services/scheduleService';
import { movieService } from '../services/movieService';
import { enumService } from '../services/enumService';

export default function CinemaDetail() {
  const { name } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const query = useMemo(() => {
    return Object.fromEntries(searchParams.entries());
  }, [searchParams]);

  const cinemaName = decodeURIComponent(name || query.name || '');
  const province = decodeURIComponent(query.province || '');
  
  const [cinema, setCinema] = useState(null);
  const [nowShowingMovies, setNowShowingMovies] = useState([]);
  const [comingSoonMovies, setComingSoonMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('now-showing');

  const openGoogleMap = (address) => {
    if (!address) return;
    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
    window.open(url, '_blank');
  };
  
  // Load cinema info and movies
  useEffect(() => {
    const loadData = async () => {
      if (!cinemaName) {
        setError('Không tìm thấy tên rạp');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        // 1. Load all cinemas to find the one matching name and province
        const cinemasResult = await cinemaComplexService.getAllCinemaComplexes();
        if (!cinemasResult.success || !cinemasResult.data) {
          throw new Error('Không thể tải danh sách rạp');
        }

        console.log('All cinemas:', cinemasResult.data);
        console.log('Looking for cinema:', cinemaName, 'in province:', province);

        const foundCinema = cinemasResult.data.find(
          c => c.name === cinemaName && 
          (province ? c.addressProvince === province : true)
        );

        console.log('Found cinema:', foundCinema);

        if (!foundCinema) {
          // Try to find by name only if province doesn't match
          const foundByName = cinemasResult.data.find(c => c.name === cinemaName);
          if (foundByName) {
            console.log('Found cinema by name only:', foundByName);
            setCinema(foundByName);
          } else {
            throw new Error(`Không tìm thấy rạp "${cinemaName}"`);
          }
        } else {
          setCinema(foundCinema);
        }

        // 2. Load all showtimes for this cinema complex
        const now = new Date();
        const nowShowingMovieIds = new Set();
        const allMovieIds = new Set();

        const currentCinema = foundCinema || cinemasResult.data.find(c => c.name === cinemaName);
        
        if (currentCinema && currentCinema.complexId) {
          try {
            // Get all showtimes for this cinema (using complexId as cinemaId)
            console.log('Fetching showtimes for cinemaId:', currentCinema.complexId);
            const showtimesResult = await scheduleService.getListings({
              cinemaId: currentCinema.complexId,
              date: undefined // Get all showtimes
            });

            console.log('Showtimes result type:', typeof showtimesResult);
            console.log('Showtimes result raw:', showtimesResult);

            // scheduleService.getListings returns data directly as array OR in a wrapper
            let listings = [];
            if (Array.isArray(showtimesResult)) {
              listings = showtimesResult;
            } else if (showtimesResult && showtimesResult.data && Array.isArray(showtimesResult.data)) {
              listings = showtimesResult.data;
            } else if (showtimesResult && typeof showtimesResult === 'object') {
              // Sometimes it might return an object with keys as movie IDs or dates
              listings = Object.values(showtimesResult).flat();
            }

            console.log('Processed listings count:', listings.length);
            if (listings.length > 0) {
                console.log('Sample listing:', listings[0]);
            }
            console.log('Found cinema complexId:', currentCinema.complexId);

            // Extract unique movie IDs from showtimes
            listings.forEach(listing => {
              // Check if this listing belongs to our cinema
              // Handle different data structures from backend
              const listingCinemaId = listing.cinemaId || listing.cinemaComplexId;
              const listingMovieId = listing.movieId || listing.movie?.movieId;
              
              if (listingCinemaId && Number(listingCinemaId) === Number(currentCinema.complexId) && listingMovieId) {
                allMovieIds.add(Number(listingMovieId));
                
                // Check if this showtime is in the future
                const startTime = listing.startTime || listing.startDateTime;
                if (startTime) {
                  const showtimeDate = new Date(startTime);
                  if (showtimeDate >= now) {
                    nowShowingMovieIds.add(Number(listingMovieId));
                  }
                }
              }
            });

            console.log('All movie IDs from showtimes:', Array.from(allMovieIds));
            console.log('Now showing movie IDs:', Array.from(nowShowingMovieIds));
          } catch (err) {
            console.error('Error loading showtimes:', err);
            console.error('Error details:', err.message, err.stack);
            // Continue even if showtimes fail to load
          }
        } else {
          console.warn('No cinema found or no complexId');
        }

        // 3. Load all public movies
        const moviesResult = await movieService.getPublicMovies();
        console.log('Movies result:', moviesResult);
        
        if (!moviesResult.success) {
          console.error('Failed to load movies:', moviesResult.error);
          throw new Error(moviesResult.error || 'Không thể tải danh sách phim');
        }

        const allMovies = moviesResult.data || [];
        console.log('All movies loaded:', allMovies.length);
        console.log('Sample movie:', allMovies[0]);

        // 4. Filter movies based on showtimes
        // Now showing: movies with future showtimes at this cinema
        const nowShowing = allMovies.filter(m => {
          if (!m || !m.movieId) return false;
          // Compare as numbers to be safe
          const hasFutureShowtime = nowShowingMovieIds.has(Number(m.movieId));
          return hasFutureShowtime;
        });

        console.log('Now showing movies count:', nowShowing.length);
        console.log('Now showing movies:', nowShowing.map(m => ({ id: m.movieId, title: m.title })));

        // Coming soon: movies that are in the cinema's movie list but don't have future showtimes
        // OR movies with release date in the future
        const comingSoon = allMovies.filter(m => {
          if (!m || !m.movieId) return false;
          const movieIdNum = Number(m.movieId);
          
          // Skip movies that are already in now showing
          if (nowShowingMovieIds.has(movieIdNum)) {
            return false;
          }
          
          // If movie has showtimes but all are in the past, and release date is in future
          if (allMovieIds.has(movieIdNum) && !nowShowingMovieIds.has(movieIdNum)) {
            const releaseDate = m.releaseDate ? new Date(m.releaseDate) : null;
            return releaseDate && releaseDate > now;
          }
          
          // If movie doesn't have any showtimes yet, check release date
          if (!allMovieIds.has(movieIdNum)) {
            const releaseDate = m.releaseDate ? new Date(m.releaseDate) : null;
            return releaseDate && releaseDate > now;
          }
          
          return false;
        });

        console.log('Coming soon movies count:', comingSoon.length);

        setNowShowingMovies(nowShowing);
        setComingSoonMovies(comingSoon);
      } catch (err) {
        console.error('Error loading cinema data:', err);
        setError(err.message || 'Có lỗi xảy ra khi tải dữ liệu');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [cinemaName, province]);

  const formatAgeRating = (ageRating) => {
    if (!ageRating) return 'P';
    // Use enumService to map age rating to display format (13+, 16+, 18+, P, K)
    const ratingStr = typeof ageRating === 'string' ? ageRating : ageRating.toString();
    return enumService.mapAgeRatingToDisplay(ratingStr) || 'P';
  };

  const formatGenres = (genres) => {
    if (!genres) return 'N/A';
    
    // Handle different formats: array, string, or object
    let genreArray = [];
    if (Array.isArray(genres)) {
      genreArray = genres.map(g => {
        const genreStr = typeof g === 'string' ? g : (g.value || g.name || g).toString();
        return genreStr.toUpperCase();
      });
    } else if (typeof genres === 'string') {
      // Handle comma-separated string or single value
      if (genres.includes(',')) {
        genreArray = genres.split(',').map(g => g.trim().toUpperCase());
      } else {
        genreArray = [genres.toUpperCase()];
      }
    } else {
      // Handle object
      const genreValue = (genres.value || genres.name || genres).toString().toUpperCase();
      genreArray = [genreValue];
    }
    
    // Map each genre to Vietnamese
    return genreArray.map(g => enumService.mapGenreToVietnamese(g)).join(', ');
  };

  const formatLanguage = (languages) => {
    if (!languages || !Array.isArray(languages) || languages.length === 0) return 'Phụ Đề';
    // Take first language and format it
    const lang = languages[0];
    const langStr = typeof lang === 'string' ? lang : lang.toString();
    return langStr.replace('LANGUAGE_', '');
  };

  if (loading) {
    return (
      <div className="min-h-screen cinema-mood">
        <Header />
        <div style={{ textAlign: 'center', padding: '100px 20px', color: '#c9c4c5' }}>
          Đang tải thông tin rạp...
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !cinema) {
    return (
      <div className="min-h-screen cinema-mood">
        <Header />
        <div style={{ textAlign: 'center', padding: '100px 20px', color: '#e83b41' }}>
          {error || 'Không tìm thấy rạp'}
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen cinema-mood">
      <Header />

      <div className="cinema-header">
        <div className="container">
          <h1 className="cinema-header__title">
            CINESMART {cinema.name?.toUpperCase() || ''} ({cinema.addressProvince || ''})
          </h1>

          <p className="cinema-header__address">
            {cinema.fullAddress || 
            (cinema.addressDescription && cinema.addressProvince 
              ? `${cinema.addressDescription}, ${cinema.addressProvince}`
              : cinema.addressDescription || cinema.addressProvince || '')}
          </p>

          {/* NÚT XEM ĐƯỜNG ĐI GOOGLE MAP */}
          <button
            onClick={() =>
              openGoogleMap(
                cinema.fullAddress || 
                (cinema.addressDescription && cinema.addressProvince 
                  ? `${cinema.addressDescription}, ${cinema.addressProvince}`
                  : cinema.addressDescription || cinema.addressProvince || '')
              )
            }
            className="mt-2 inline-flex items-center gap-2 text-sm text-[#ffd159] hover:text-white transition-colors duration-200"
          >
            <svg
              className="w-4 h-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
              <circle cx="12" cy="10" r="3"/>
            </svg>
            Xem đường đi
          </button>
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
                {nowShowingMovies.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '40px', color: '#c9c4c5' }}>
                    Không có phim nào đang chiếu
                  </div>
                ) : (
                  nowShowingMovies.map((movie) => (
                    <div key={movie.movieId} className="cinema-movie-card">
                      <div className="cinema-movie-card__poster">
                        <img 
                          src={movie.poster || 'https://via.placeholder.com/300x450?text=No+Poster'} 
                          alt={movie.title}
                          onError={(e) => {
                            e.target.src = 'https://via.placeholder.com/300x450?text=No+Poster';
                          }}
                        />
                      </div>
                      <div className="cinema-movie-card__content">
                        <div className="cinema-movie-card__header">
                          <h3 className="cinema-movie-card__title">
                            {movie.title} ({formatAgeRating(movie.ageRating)})
                          </h3>
                        </div>
                        <div className="cinema-movie-card__meta">
                          <span>{formatGenres(movie.genre)}</span>
                          <span>{movie.duration} phút</span>
                          <span>{movie.director || 'N/A'}</span>
                          <span>{formatLanguage(movie.languages)}</span>
                        </div>
                        <div className="cinema-movie-card__rating-desc">
                          {(() => {
                            const rating = formatAgeRating(movie.ageRating);
                            const ageNumber = rating && /^\d+/.test(rating) ? rating.replace(/[^0-9]/g, '') : null;
                            if (rating === 'P') {
                              return 'P: Phim dành cho mọi lứa tuổi';
                            } else if (ageNumber) {
                              return `${rating}: Phim dành cho khán giả từ đủ ${ageNumber} tuổi trở lên (${rating})`;
                            } else {
                              return `${rating}: Phim dành cho khán giả từ đủ ${rating} tuổi trở lên`;
                            }
                          })()}
                        </div>
                        {movie.description && (
                          <div className="cinema-movie-card__description" style={{ marginTop: '12px', color: '#c9c4c5', fontSize: '14px', lineHeight: '1.6' }}>
                            {movie.description}
                          </div>
                        )}
                        <div style={{ marginTop: '16px' }}>
                          <button 
                            onClick={() => navigate(`/movie/${movie.movieId}`)}
                            className="cinema-movie-card__more-link"
                            style={{ 
                              display: 'inline-block',
                              padding: '10px 20px',
                              backgroundColor: '#e83b41',
                              color: '#fff',
                              textDecoration: 'none',
                              border: 'none',
                              borderRadius: '4px',
                              fontWeight: 600,
                              fontSize: '14px',
                              cursor: 'pointer',
                              transition: 'background-color 0.3s'
                            }}
                            onMouseEnter={(e) => e.target.style.backgroundColor = '#c92e33'}
                            onMouseLeave={(e) => e.target.style.backgroundColor = '#e83b41'}
                          >
                            Đặt vé
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}

            {activeTab === 'coming-soon' && (
              <div className="cinema-movies">
                {comingSoonMovies.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '40px', color: '#c9c4c5' }}>
                    Không có phim nào sắp chiếu
                  </div>
                ) : (
                  comingSoonMovies.map((movie) => (
                    <div key={movie.movieId} className="cinema-movie-card">
                      <div className="cinema-movie-card__poster">
                        <img 
                          src={movie.poster || 'https://via.placeholder.com/300x450?text=No+Poster'} 
                          alt={movie.title}
                          onError={(e) => {
                            e.target.src = 'https://via.placeholder.com/300x450?text=No+Poster';
                          }}
                        />
                      </div>
                      <div className="cinema-movie-card__content">
                        <div className="cinema-movie-card__header">
                          <h3 className="cinema-movie-card__title">
                            {movie.title} ({formatAgeRating(movie.ageRating)})
                          </h3>
                        </div>
                        <div className="cinema-movie-card__meta">
                          <span>{formatGenres(movie.genre)}</span>
                          <span>{movie.duration} phút</span>
                          <span>{movie.director || 'N/A'}</span>
                          <span>{formatLanguage(movie.languages)}</span>
                        </div>
                        <div className="cinema-movie-card__rating-desc">
                          {formatAgeRating(movie.ageRating)}: Phim dành cho khán giả từ đủ {formatAgeRating(movie.ageRating).replace('T', '')} tuổi trở lên ({formatAgeRating(movie.ageRating).replace('T', '')}+)
                        </div>
                        {movie.releaseDate && (
                          <div style={{ marginTop: '12px', color: '#ffd159', fontWeight: 600 }}>
                            Khởi chiếu: {new Date(movie.releaseDate).toLocaleDateString('vi-VN', {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric'
                            })}
                          </div>
                        )}
                        {movie.description && (
                          <div className="cinema-movie-card__description" style={{ marginTop: '12px', color: '#c9c4c5', fontSize: '14px', lineHeight: '1.6' }}>
                            {movie.description}
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
