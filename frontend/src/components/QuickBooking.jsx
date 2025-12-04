import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import scheduleService from '../services/scheduleService';
import { movieService } from '../services/movieService';
import { enumService } from '../services/enumService';
import showtimeService from '../services/showtimeService';
import ProgressiveImage from './ProgressiveImage.jsx';

const QuickBooking = () => {
  const navigate = useNavigate();
  
  // State cho các bước
  const [step, setStep] = useState(1); // 1: Chọn ngày, 2: Chọn cụm rạp, 3: Chọn phim, 4: Kết quả
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedCinemaId, setSelectedCinemaId] = useState(null);
  const [selectedMovieId, setSelectedMovieId] = useState(null);
  
  // State cho dữ liệu
  const [availableDates, setAvailableDates] = useState([]);
  const [availableCinemas, setAvailableCinemas] = useState([]);
  const [availableMovies, setAvailableMovies] = useState([]);
  const [showtimes, setShowtimes] = useState([]);
  
  // State cho loading và error
  const [loading, setLoading] = useState(false);
  const [loadingDates, setLoadingDates] = useState(true);
  const [error, setError] = useState(null);
  
  // State cho age confirmation modal
  const [showAgeConfirmModal, setShowAgeConfirmModal] = useState(false);
  const [ageConfirmed, setAgeConfirmed] = useState(false);
  const [pendingShowtime, setPendingShowtime] = useState(null);
  const [movieData, setMovieData] = useState(null);
  const [loadingMovie, setLoadingMovie] = useState(false);
  
  // Load danh sách các ngày có showtime khi component mount
  useEffect(() => {
    const loadAvailableDates = async () => {
      try {
        setLoadingDates(true);
        // Lấy tất cả showtimes (không filter date, movie, cinema)
        const listings = await scheduleService.getListings({});
        
        // Extract các ngày duy nhất từ showtimes
        const uniqueDates = new Set();
        if (Array.isArray(listings) && listings.length > 0) {
          listings.forEach(listing => {
            if (listing && listing.startTime) {
              // startTime có thể là string hoặc object, xử lý cả 2 trường hợp
              let dateStr;
              if (typeof listing.startTime === 'string') {
                dateStr = listing.startTime.split('T')[0]; // Extract YYYY-MM-DD từ ISO string
              } else if (listing.startTime && typeof listing.startTime === 'object' && listing.startTime.year) {
                // Nếu là object với các field year, month, day
                const month = listing.startTime.monthValue || listing.startTime.month;
                const day = listing.startTime.dayOfMonth || listing.startTime.day;
                dateStr = `${listing.startTime.year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
              }
              
              if (dateStr && /^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
                uniqueDates.add(dateStr);
              }
            }
          });
        }
        
        // Convert sang Date objects và sort
        const datesArray = Array.from(uniqueDates)
          .map(dateStr => {
            const date = new Date(dateStr + 'T00:00:00');
            date.setHours(0, 0, 0, 0);
            return date;
          })
          .filter(date => {
            // Chỉ lấy các ngày từ hôm nay trở đi
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            return date >= today;
          })
          .sort((a, b) => a - b) // Sort tăng dần
          .slice(0, 14); // Giới hạn tối đa 14 ngày
        
        setAvailableDates(datesArray);
      } catch (err) {
        console.error('Error loading available dates:', err);
        // Fallback: nếu có lỗi, vẫn hiển thị 8 ngày tiếp theo
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const fallbackDates = [];
        for (let i = 0; i < 8; i++) {
          const date = new Date(today);
          date.setDate(today.getDate() + i);
          fallbackDates.push(date);
        }
        setAvailableDates(fallbackDates);
      } finally {
        setLoadingDates(false);
      }
    };
    
    loadAvailableDates();
  }, []);
  
  // Format ngày hiển thị
  const formatDateDisplay = (date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const targetDate = new Date(date);
    targetDate.setHours(0, 0, 0, 0);
    
    const diffTime = targetDate - today;
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
    
    const dayNames = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
    const dayName = dayNames[targetDate.getDay()];
    const day = targetDate.getDate();
    const month = targetDate.getMonth() + 1;
    
    if (diffDays === 0) {
      return `Hôm nay - ${day}/${month}`;
    } else if (diffDays === 1) {
      return `Ngày mai - ${day}/${month}`;
    } else {
      return `${dayName} ${day}/${month}`;
    }
  };
  
  // Format ngày cho API (YYYY-MM-DD)
  const formatDateForAPI = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };
  
  // Bước 1: Chọn ngày
  const handleDateSelect = async (date) => {
    setSelectedDate(date);
    setLoading(true);
    setError(null);
    setSelectedCinemaId(null);
    setSelectedMovieId(null);
    setAvailableCinemas([]);
    setAvailableMovies([]);
    setShowtimes([]);
    
    try {
      const dateStr = formatDateForAPI(date);
      // Lấy các cụm rạp có showtime vào ngày này
      const options = await scheduleService.getOptions({ date: dateStr });
      
      if (options && options.cinemas && options.cinemas.length > 0) {
        setAvailableCinemas(options.cinemas);
        setStep(2);
      } else {
        setError('Không có cụm rạp nào có lịch chiếu vào ngày này');
      }
    } catch (err) {
      console.error('Error fetching cinemas:', err);
      setError('Không thể tải danh sách cụm rạp. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };
  
  // Bước 2: Chọn cụm rạp
  const handleCinemaSelect = async (cinemaId) => {
    setSelectedCinemaId(cinemaId);
    setLoading(true);
    setError(null);
    setSelectedMovieId(null);
    setAvailableMovies([]);
    setShowtimes([]);
    
    try {
      const dateStr = formatDateForAPI(selectedDate);
      // Lấy các phim có showtime tại cụm rạp này vào ngày đã chọn
      const options = await scheduleService.getOptions({ 
        date: dateStr,
        cinemaId: cinemaId
      });
      
      if (options && options.movies && options.movies.length > 0) {
        setAvailableMovies(options.movies);
        setStep(3);
      } else {
        setError('Không có phim nào chiếu tại cụm rạp này vào ngày đã chọn');
      }
    } catch (err) {
      console.error('Error fetching movies:', err);
      setError('Không thể tải danh sách phim. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };
  
  // Bước 3: Chọn phim
  const handleMovieSelect = async (movieId) => {
    setSelectedMovieId(movieId);
    setLoading(true);
    setError(null);
    setShowtimes([]);
    
    try {
      const dateStr = formatDateForAPI(selectedDate);
      // Lấy các showtime cụ thể
      const listings = await scheduleService.getListings({
        date: dateStr,
        cinemaId: selectedCinemaId,
        movieId: movieId
      });
      
      if (listings && listings.length > 0) {
        setShowtimes(listings);
        setStep(4);
      } else {
        setError('Không có suất chiếu nào phù hợp');
      }
    } catch (err) {
      console.error('Error fetching showtimes:', err);
      setError('Không thể tải danh sách suất chiếu. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };
  
  // Xử lý chọn showtime để đặt vé - hiển thị modal xác nhận độ tuổi trước (trừ khi là phim P)
  const handleShowtimeSelect = async (showtime) => {
    setPendingShowtime(showtime);
    setAgeConfirmed(false);
    setLoadingMovie(true);
    setError(null);
    
    try {
      // Lấy thông tin phim từ movieId trong showtime
      if (showtime.movieId) {
        const movieResult = await movieService.getPublicMovieById(showtime.movieId);
        if (movieResult.success && movieResult.data) {
          const movie = movieResult.data;
          setMovieData(movie);
          
          // Kiểm tra age rating - nếu là "P" (phim dành cho mọi lứa tuổi) thì không cần xác nhận
          const ageRating = movie.ageRating;
          const ratingDisplay = enumService.mapAgeRatingToDisplay(ageRating);
          
          if (ratingDisplay === 'P') {
            // Phim P - điều hướng trực tiếp, không cần xác nhận
            setLoadingMovie(false);
            navigate(`/book-ticket?showtimeId=${showtime.showtimeId}`);
            return;
          }
        } else {
          console.error('Failed to load movie data:', movieResult.error);
        }
      }
    } catch (err) {
      console.error('Error loading movie data:', err);
    } finally {
      setLoadingMovie(false);
    }
    
    // Nếu không phải phim P, hiển thị modal xác nhận
    setShowAgeConfirmModal(true);
  };
  
  // Xử lý sau khi xác nhận độ tuổi - điều hướng đến trang đặt vé
  const handleConfirmAgeAndContinue = () => {
    if (!ageConfirmed || !pendingShowtime) {
      alert('Vui lòng xác nhận độ tuổi để tiếp tục');
      return;
    }
    
    // Điều hướng đến trang đặt vé với showtimeId
    navigate(`/book-ticket?showtimeId=${pendingShowtime.showtimeId}`);
  };
  
  // Reset về bước đầu
  const handleReset = () => {
    setStep(1);
    setSelectedDate(null);
    setSelectedCinemaId(null);
    setSelectedMovieId(null);
    setAvailableCinemas([]);
    setAvailableMovies([]);
    setShowtimes([]);
    setError(null);
  };
  
  // Format thời gian hiển thị
  const formatTime = (dateTimeStr) => {
    const date = new Date(dateTimeStr);
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  };
  
  // Format formatLabel thành dạng thân thiện (ví dụ: "2D Lồng tiếng")
  const formatShowtimeLabel = (formatLabel) => {
    if (!formatLabel) return '';
    
    // formatLabel có thể là "TYPE_2D • VIETDUB" hoặc chỉ "TYPE_2D"
    const parts = formatLabel.split(' • ');
    let roomTypePart = parts[0] || '';
    let languagePart = parts[1] || '';
    
    // Map roomType: TYPE_2D -> 2D, TYPE_3D -> 3D, DELUXE -> DELUXE
    const roomType = showtimeService.mapRoomTypeFromBackend(roomTypePart);
    
    // Map language: VIETDUB -> Lồng tiếng, VIETSUB -> Phụ đề, etc.
    const language = languagePart ? showtimeService.mapLanguageFromBackend(languagePart) : '';
    
    // Kết hợp thành "2D Lồng tiếng" hoặc chỉ "2D" nếu không có language
    if (language) {
      return `${roomType} ${language}`;
    }
    return roomType;
  };
  
  const selectedCinema = availableCinemas.find(c => c.cinemaId === selectedCinemaId);
  const selectedMovie = availableMovies.find(m => m.movieId === selectedMovieId);
  
  return (
    <section className="section" id="quick-booking" style={{ marginBottom: '60px' }}>
      <div className="container">
        <div className="section__head">
          <h2 className="section__title">Đặt Vé Nhanh</h2>
        </div>
        
        <div className="quick-booking-wrapper">
          {/* Progress indicator */}
          <div className="quick-booking-progress">
            <div className={`progress-step ${step >= 1 ? 'active' : ''} ${step > 1 ? 'completed' : ''}`}>
              <div className="progress-step-number">1</div>
              <div className="progress-step-label">Chọn ngày</div>
            </div>
            <div className="progress-line"></div>
            <div className={`progress-step ${step >= 2 ? 'active' : ''} ${step > 2 ? 'completed' : ''}`}>
              <div className="progress-step-number">2</div>
              <div className="progress-step-label">Chọn cụm rạp</div>
            </div>
            <div className="progress-line"></div>
            <div className={`progress-step ${step >= 3 ? 'active' : ''} ${step > 3 ? 'completed' : ''}`}>
              <div className="progress-step-number">3</div>
              <div className="progress-step-label">Chọn phim</div>
            </div>
            <div className="progress-line"></div>
            <div className={`progress-step ${step >= 4 ? 'active' : ''}`}>
              <div className="progress-step-number">4</div>
              <div className="progress-step-label">Chọn suất chiếu</div>
            </div>
          </div>
          
          {/* Error message */}
          {error && (
            <div className="quick-booking-error">
              <p>{error}</p>
              <button onClick={handleReset} className="btn-reset">Thử lại</button>
            </div>
          )}
          
          {/* Loading indicator */}
          {loading && (
            <div className="quick-booking-loading">
              <div className="loading-spinner"></div>
              <p>Đang tải...</p>
            </div>
          )}
          
          {/* Step 1: Chọn ngày */}
          {step === 1 && !loading && (
            <div className="quick-booking-step">
              <h3 className="step-title">Chọn ngày xem phim</h3>
              {loadingDates ? (
                <div className="quick-booking-loading">
                  <div className="loading-spinner"></div>
                  <p>Đang tải danh sách ngày...</p>
                </div>
              ) : availableDates.length > 0 ? (
                <div className="date-grid">
                  {availableDates.map((date, idx) => (
                    <button
                      key={idx}
                      className={`date-card ${selectedDate && selectedDate.getTime() === date.getTime() ? 'selected' : ''}`}
                      onClick={() => handleDateSelect(date)}
                    >
                      <div className="date-card-content">
                        <div className="date-day">{formatDateDisplay(date).split(' - ')[0]}</div>
                        <div className="date-number">{date.getDate()}/{date.getMonth() + 1}</div>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="no-dates-available">
                  <p>Hiện tại không có suất chiếu nào. Vui lòng quay lại sau.</p>
                </div>
              )}
            </div>
          )}
          
          {/* Step 2: Chọn cụm rạp */}
          {step === 2 && !loading && (
            <div className="quick-booking-step">
              <div className="step-header">
                <button onClick={handleReset} className="btn-back">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M19 12H5M12 19l-7-7 7-7"/>
                  </svg>
                  Quay lại
                </button>
                <h3 className="step-title">Chọn cụm rạp - {formatDateDisplay(selectedDate)}</h3>
              </div>
              <div className="cinema-grid">
                {availableCinemas.map((cinema) => (
                  <button
                    key={cinema.cinemaId}
                    className={`cinema-card ${selectedCinemaId === cinema.cinemaId ? 'selected' : ''}`}
                    onClick={() => handleCinemaSelect(cinema.cinemaId)}
                  >
                    <div className="cinema-card-content">
                      <h4 className="cinema-name">{cinema.name}</h4>
                      {cinema.address && (
                        <p className="cinema-address">{cinema.address}</p>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
          
          {/* Step 3: Chọn phim */}
          {step === 3 && !loading && (
            <div className="quick-booking-step">
              <div className="step-header">
                <button onClick={() => setStep(2)} className="btn-back">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M19 12H5M12 19l-7-7 7-7"/>
                  </svg>
                  Quay lại
                </button>
                <h3 className="step-title">Chọn phim - {selectedCinema?.name}</h3>
              </div>
              <div className="movie-grid">
                {availableMovies.map((movie) => (
                  <button
                    key={movie.movieId}
                    className={`movie-card ${selectedMovieId === movie.movieId ? 'selected' : ''}`}
                    onClick={() => handleMovieSelect(movie.movieId)}
                  >
                    <div className="movie-card-poster">
                      <ProgressiveImage
                        src={movie.poster}
                        alt={movie.title}
                        className="movie-poster-img"
                      />
                    </div>
                    <div className="movie-card-body">
                      <h4 className="movie-title">{movie.title}</h4>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
          
          {/* Step 4: Chọn suất chiếu */}
          {step === 4 && !loading && (
            <div className="quick-booking-step">
              <div className="step-header">
                <button onClick={() => setStep(3)} className="btn-back">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M19 12H5M12 19l-7-7 7-7"/>
                  </svg>
                  Quay lại
                </button>
                <h3 className="step-title">
                  {selectedMovie?.title} - {selectedCinema?.name}
                </h3>
                <p className="step-subtitle">{formatDateDisplay(selectedDate)}</p>
              </div>
              <div className="showtimes-container">
                {showtimes.length > 0 ? (
                  <div className="showtimes-grid">
                    {showtimes.map((showtime) => (
                      <button
                        key={showtime.showtimeId}
                        className="showtime-card"
                        onClick={() => handleShowtimeSelect(showtime)}
                      >
                        <div className="showtime-time">{formatTime(showtime.startTime)}</div>
                        <div className="showtime-format">{formatShowtimeLabel(showtime.formatLabel)}</div>
                        <div className="showtime-room">{showtime.cinemaRoomName}</div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="no-showtimes">Không có suất chiếu nào</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
      
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
              setPendingShowtime(null);
              setAgeConfirmed(false);
              setMovieData(null);
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

            {loadingMovie ? (
              <div style={{ textAlign: 'center', padding: '40px', color: '#c9c4c5' }}>
                Đang tải thông tin phim...
              </div>
            ) : pendingShowtime && (() => {
              // Map age rating từ backend
              const ageRating = movieData?.ageRating;
              const rating = ageRating ? enumService.mapAgeRatingToDisplay(ageRating) : 'P';
              const ageNumber = rating.replace(/[^0-9]/g, '');
              const isK = rating === 'K';
              const isP = rating === 'P';

              return (
                <>
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
                      Phim: {movieData?.title || pendingShowtime.movieTitle || 'N/A'}
                    </div>
                    <div style={{
                      fontSize: '14px',
                      color: '#c9c4c5',
                      lineHeight: '1.6'
                    }}>
                      <strong style={{ color: '#ffd159' }}>{rating}:</strong> {
                        isP 
                          ? 'Phim dành cho mọi lứa tuổi'
                          : isK
                          ? 'Phim dành cho khán giả dưới 13 tuổi, cần có ba mẹ đi cùng'
                          : `Phim dành cho khán giả từ đủ ${ageNumber} tuổi trở lên (${ageNumber}+)`
                      }
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
                      {isP 
                        ? 'Tôi xác nhận rằng tôi đủ điều kiện để xem phim này.'
                        : isK
                        ? 'Tôi đã hiểu và đồng ý.'
                        : `Tôi xác nhận rằng tôi đã đủ ${ageNumber} tuổi trở lên và đủ điều kiện để xem phim này.`
                      }
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
                        setPendingShowtime(null);
                        setAgeConfirmed(false);
                        setMovieData(null);
                      }}
                      style={{
                        padding: '12px 24px',
                        fontSize: '14px',
                        fontWeight: 600,
                        background: 'transparent',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        color: '#c9c4c5',
                        borderRadius: '8px',
                        cursor: 'pointer'
                      }}
                    >
                      Hủy
                    </button>
                    <button
                      className="btn btn--primary"
                      onClick={handleConfirmAgeAndContinue}
                      style={{
                        padding: '12px 24px',
                        fontSize: '14px',
                        fontWeight: 600,
                        background: ageConfirmed ? '#e83b41' : 'rgba(232, 59, 65, 0.5)',
                        border: 'none',
                        color: '#fff',
                        borderRadius: '8px',
                        cursor: ageConfirmed ? 'pointer' : 'not-allowed',
                        opacity: ageConfirmed ? 1 : 0.5
                      }}
                    >
                      Tiếp tục
                    </button>
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      )}
      
      <style>{`
        .quick-booking-wrapper {
          background: linear-gradient(135deg, #2a2627 0%, #1a1415 100%);
          border-radius: 16px;
          padding: 40px;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .quick-booking-progress {
          display: flex;
          align-items: center;
          justify-content: center;
          margin-bottom: 40px;
          gap: 16px;
        }
        
        .progress-step {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 8px;
          opacity: 0.4;
          transition: opacity 0.3s ease;
        }
        
        .progress-step.active {
          opacity: 1;
        }
        
        .progress-step.completed .progress-step-number {
          background: #4caf50;
          color: white;
        }
        
        .progress-step-number {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.1);
          color: rgba(255, 255, 255, 0.6);
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          font-size: 16px;
          transition: all 0.3s ease;
        }
        
        .progress-step.active .progress-step-number {
          background: #e83b41;
          color: white;
        }
        
        .progress-step-label {
          font-size: 12px;
          color: rgba(255, 255, 255, 0.7);
          text-align: center;
          white-space: nowrap;
        }
        
        .progress-line {
          width: 60px;
          height: 2px;
          background: rgba(255, 255, 255, 0.1);
          margin: 0 8px;
        }
        
        .quick-booking-error {
          background: rgba(244, 67, 54, 0.1);
          border: 1px solid rgba(244, 67, 54, 0.3);
          border-radius: 8px;
          padding: 16px;
          margin-bottom: 24px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        
        .quick-booking-error p {
          color: #ff5252;
          margin: 0;
        }
        
        .btn-reset {
          background: #e83b41;
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 6px;
          cursor: pointer;
          font-size: 14px;
          transition: background 0.3s ease;
        }
        
        .btn-reset:hover {
          background: #ff5258;
        }
        
        .quick-booking-loading {
          text-align: center;
          padding: 60px 20px;
          color: rgba(255, 255, 255, 0.7);
        }
        
        .loading-spinner {
          width: 40px;
          height: 40px;
          border: 4px solid rgba(255, 255, 255, 0.1);
          border-top-color: #e83b41;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin: 0 auto 16px;
        }
        
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        
        .quick-booking-step {
          min-height: 400px;
        }
        
        .step-header {
          display: flex;
          align-items: center;
          gap: 16px;
          margin-bottom: 24px;
        }
        
        .btn-back {
          background: transparent;
          border: 1px solid rgba(255, 255, 255, 0.2);
          color: rgba(255, 255, 255, 0.8);
          padding: 8px 16px;
          border-radius: 8px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 14px;
          transition: all 0.3s ease;
        }
        
        .btn-back:hover {
          background: rgba(255, 255, 255, 0.1);
          border-color: rgba(255, 255, 255, 0.3);
        }
        
        .step-title {
          color: white;
          font-size: 24px;
          font-weight: bold;
          margin: 0;
        }
        
        .step-subtitle {
          color: rgba(255, 255, 255, 0.6);
          font-size: 16px;
          margin: 8px 0 0 0;
        }
        
        .date-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
          gap: 16px;
        }
        
        .date-card {
          background: rgba(255, 255, 255, 0.05);
          border: 2px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          padding: 20px;
          cursor: pointer;
          transition: all 0.3s ease;
          text-align: center;
        }
        
        .date-card:hover {
          background: rgba(255, 255, 255, 0.1);
          border-color: rgba(255, 255, 255, 0.3);
          transform: translateY(-2px);
        }
        
        .date-card.selected {
          background: rgba(232, 59, 65, 0.2);
          border-color: #e83b41;
        }
        
        .date-card-content {
          color: white;
        }
        
        .date-day {
          font-size: 14px;
          color: rgba(255, 255, 255, 0.7);
          margin-bottom: 8px;
        }
        
        .date-number {
          font-size: 20px;
          font-weight: bold;
        }
        
        .cinema-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 16px;
        }
        
        .cinema-card {
          background: rgba(255, 255, 255, 0.05);
          border: 2px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          padding: 20px;
          cursor: pointer;
          transition: all 0.3s ease;
          text-align: left;
        }
        
        .cinema-card:hover {
          background: rgba(255, 255, 255, 0.1);
          border-color: rgba(255, 255, 255, 0.3);
          transform: translateY(-2px);
        }
        
        .cinema-card.selected {
          background: rgba(232, 59, 65, 0.2);
          border-color: #e83b41;
        }
        
        .cinema-name {
          color: white;
          font-size: 18px;
          font-weight: bold;
          margin: 0 0 8px 0;
        }
        
        .cinema-address {
          color: rgba(255, 255, 255, 0.6);
          font-size: 14px;
          margin: 0;
        }
        
        .movie-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
          gap: 20px;
        }
        
        .movie-card {
          background: rgba(255, 255, 255, 0.05);
          border: 2px solid rgba(255, 255, 255, 0.1);
          border-radius: 12px;
          overflow: hidden;
          cursor: pointer;
          transition: all 0.3s ease;
          text-align: left;
        }
        
        .movie-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 24px rgba(232, 59, 65, 0.3);
        }
        
        .movie-card.selected {
          border-color: #e83b41;
          box-shadow: 0 0 0 3px rgba(232, 59, 65, 0.3);
        }
        
        .movie-card-poster {
          width: 100%;
          aspect-ratio: 2/3;
          overflow: hidden;
          background: rgba(255, 255, 255, 0.05);
        }
        
        .movie-poster-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        
        .movie-card-body {
          padding: 12px;
        }
        
        .movie-title {
          color: white;
          font-size: 14px;
          font-weight: bold;
          margin: 0;
          line-height: 1.4;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        
        .showtimes-container {
          margin-top: 24px;
        }
        
        .showtimes-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
          gap: 12px;
        }
        
        .showtime-card {
          background: rgba(255, 255, 255, 0.05);
          border: 2px solid rgba(255, 255, 255, 0.1);
          border-radius: 8px;
          padding: 16px;
          cursor: pointer;
          transition: all 0.3s ease;
          text-align: center;
        }
        
        .showtime-card:hover {
          background: rgba(232, 59, 65, 0.2);
          border-color: #e83b41;
          transform: translateY(-2px);
        }
        
        .showtime-time {
          color: white;
          font-size: 18px;
          font-weight: bold;
          margin-bottom: 4px;
        }
        
        .showtime-format {
          color: rgba(255, 255, 255, 0.7);
          font-size: 12px;
          margin-bottom: 4px;
        }
        
        .showtime-room {
          color: rgba(255, 255, 255, 0.5);
          font-size: 11px;
        }
        
        .no-showtimes {
          color: rgba(255, 255, 255, 0.6);
          text-align: center;
          padding: 40px;
          font-size: 16px;
        }
        
        .no-dates-available {
          text-align: center;
          padding: 60px 20px;
          color: rgba(255, 255, 255, 0.7);
          font-size: 16px;
        }
        
        .no-dates-available p {
          margin: 0;
        }
        
        @media (max-width: 768px) {
          .quick-booking-wrapper {
            padding: 24px;
          }
          
          .quick-booking-progress {
            gap: 8px;
          }
          
          .progress-step-number {
            width: 32px;
            height: 32px;
            font-size: 14px;
          }
          
          .progress-step-label {
            font-size: 10px;
          }
          
          .progress-line {
            width: 30px;
          }
          
          .date-grid {
            grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
          }
          
          .cinema-grid {
            grid-template-columns: 1fr;
          }
          
          .movie-grid {
            grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
          }
        }
      `}</style>
    </section>
  );
};

export default QuickBooking;

