import React, { useState, useEffect, useMemo } from 'react';
import Header from '../components/Header.jsx';
import Footer from '../components/Footer.jsx';

// Generate seats for a room
function generateSeats(rows, cols) {
  const seats = [];
  const rowLetters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  
  const walkwayPositions = new Set();
  for (let col = 5; col <= cols; col += 5) {
    walkwayPositions.add(col);
  }
  if (cols > 10) {
    const middle = Math.floor(cols / 2);
    walkwayPositions.add(middle);
    walkwayPositions.add(middle + 1);
  }
  
  for (let row = 0; row < rows; row++) {
    for (let col = 1; col <= cols; col++) {
      if (walkwayPositions.has(col)) continue;
      
      let seatType = 'NORMAL';
      if (row < Math.floor(rows * 0.15)) {
        seatType = 'VIP';
      } else if (row >= rows - 2 && cols > 12) {
        if (Math.random() < 0.2) {
          seatType = 'COUPLE';
        }
      }
      
      seats.push({
        seatId: `${rowLetters[row]}${col}`,
        row: rowLetters[row],
        column: col,
        type: seatType,
        status: true
      });
    }
  }
  
  return seats;
}

// Sample data - would come from API/database
const SEAT_TYPES = ['NORMAL', 'VIP', 'COUPLE'];
const ROOM_TYPES = ['2D', '3D', 'DELUXE'];

// Sample movies
const movies = [
  { movieId: 1, title: 'Inception', poster: 'https://image.tmdb.org/t/p/w500/oYuLEt3zVCKq57qu2F8dT7NIa6f.jpg', rating: 'T16' },
  { movieId: 2, title: 'Interstellar', poster: 'https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg', rating: 'T13' },
  { movieId: 3, title: 'The Dark Knight', poster: 'https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg', rating: 'T16' },
];

// Sample cinemas with rooms
const cinemas = [
  {
    complexId: 1,
    name: 'Cinestar Quốc Thanh',
    province: 'Hồ Chí Minh',
    rooms: [
      {
        roomId: 1,
        roomName: 'Phòng 1',
        roomType: '2D',
        rows: 10,
        cols: 12,
        seats: generateSeats(10, 12)
      },
      {
        roomId: 2,
        roomName: 'Phòng 2',
        roomType: '3D',
        rows: 8,
        cols: 14,
        seats: generateSeats(8, 14)
      }
    ]
  },
  {
    complexId: 2,
    name: 'Cinestar Hai Bà Trưng',
    province: 'Hồ Chí Minh',
    rooms: [
      {
        roomId: 3,
        roomName: 'Phòng 1',
        roomType: '2D',
        rows: 12,
        cols: 15,
        seats: generateSeats(12, 15)
      }
    ]
  }
];

// Sample showtimes
const showtimes = [
  { showtimeId: 1, movieId: 1, roomId: 1, startTime: '2025-11-15T19:30:00', endTime: '2025-11-15T22:00:00' },
  { showtimeId: 2, movieId: 1, roomId: 2, startTime: '2025-11-15T20:00:00', endTime: '2025-11-15T22:30:00' },
  { showtimeId: 3, movieId: 2, roomId: 3, startTime: '2025-11-15T21:00:00', endTime: '2025-11-15T23:50:00' },
];

// Sample prices
const prices = [
  { roomType: '2D', seatType: 'NORMAL', price: 90000 },
  { roomType: '2D', seatType: 'VIP', price: 120000 },
  { roomType: '2D', seatType: 'COUPLE', price: 200000 },
  { roomType: '3D', seatType: 'NORMAL', price: 120000 },
  { roomType: '3D', seatType: 'VIP', price: 150000 },
  { roomType: 'DELUXE', seatType: 'VIP', price: 180000 }
];

// Sample booked seats (from existing orders)
const bookedSeats = [
  { showtimeId: 1, seatId: 'A5' },
  { showtimeId: 1, seatId: 'A6' },
  { showtimeId: 1, seatId: 'E7' },
  { showtimeId: 1, seatId: 'E8' },
  { showtimeId: 2, seatId: 'B5' },
];

export default function BookTicket() {
  const [, forceUpdate] = useState({});

  // Listen for hash changes to re-read URL params
  useEffect(() => {
    const handleHashChange = () => {
      forceUpdate({});
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Read parameters from URL
  const hash = window.location.hash;
  const urlParams = new URLSearchParams(hash.includes('?') ? hash.split('?')[1] : '');
  const movieIdFromUrl = urlParams.get('movieId');
  const cinemaIdFromUrl = urlParams.get('cinemaId');
  const showtimeFromUrl = urlParams.get('showtime');
  const dateFromUrl = urlParams.get('date');
  const formatFromUrl = urlParams.get('format');
  const cinemaNameFromUrl = urlParams.get('cinemaName');

  const [selectedMovie, setSelectedMovie] = useState(movieIdFromUrl || '');
  const [selectedCinema, setSelectedCinema] = useState(cinemaIdFromUrl || '');
  const [selectedShowtime, setSelectedShowtime] = useState(null);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [customerInfo, setCustomerInfo] = useState({
    name: 'Nguyễn Văn A',
    phone: '0909000001',
    email: 'nguyenvana@example.com'
  });
  const [paymentMethod, setPaymentMethod] = useState('vnpay');
  const [step, setStep] = useState(movieIdFromUrl && cinemaIdFromUrl && showtimeFromUrl ? 2 : 1); // Start at step 2 if params exist
  const [showAgeConfirmModal, setShowAgeConfirmModal] = useState(false);
  const [ageConfirmed, setAgeConfirmed] = useState(false);
  const [pendingShowtime, setPendingShowtime] = useState(null);

  // Update state when URL params change
  useEffect(() => {
    if (movieIdFromUrl) setSelectedMovie(movieIdFromUrl);
    if (cinemaIdFromUrl) setSelectedCinema(cinemaIdFromUrl);
    if (movieIdFromUrl && cinemaIdFromUrl && showtimeFromUrl) {
      setStep(2);
    }
  }, [movieIdFromUrl, cinemaIdFromUrl, showtimeFromUrl]);

  // Initialize showtime from URL params
  useEffect(() => {
    if (movieIdFromUrl && cinemaIdFromUrl && showtimeFromUrl && dateFromUrl && !selectedShowtime) {
      // Find matching cinema - try by ID first, then by name
      let cinema = cinemas.find(c => String(c.complexId) === cinemaIdFromUrl);
      
      // If not found by ID, try by name (cinemaId might be a string like 'cns_q6')
      if (!cinema && cinemaNameFromUrl) {
        // Try to match by name (decode URL encoding)
        const decodedName = decodeURIComponent(cinemaNameFromUrl);
        cinema = cinemas.find(c => {
          const cName = c.name.toLowerCase();
          const decoded = decodedName.toLowerCase();
          return cName.includes(decoded) || 
                 decoded.includes(cName) ||
                 cName.includes(cinemaNameFromUrl.toLowerCase()) ||
                 cinemaNameFromUrl.toLowerCase().includes(cName);
        });
      }
      
      // If still not found, use first cinema as fallback
      if (!cinema && cinemas.length > 0) {
        cinema = cinemas[0];
      }
      
      if (cinema && cinema.rooms.length > 0) {
        // Use first room as default (in real app, this would match the actual room from showtime)
        const room = cinema.rooms[0];
        if (room) {
          const [hours, minutes] = showtimeFromUrl.split(':');
          const showtimeDate = new Date(dateFromUrl);
          showtimeDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);
          
          const mockShowtime = {
            showtimeId: Date.now(), // Temporary ID
            movieId: Number(movieIdFromUrl),
            roomId: room.roomId,
            startTime: showtimeDate.toISOString(),
            endTime: new Date(showtimeDate.getTime() + 2 * 60 * 60 * 1000).toISOString() // +2 hours
          };
          // Directly set showtime since age confirmation was already done on MovieDetail page
          setSelectedShowtime(mockShowtime);
          // Also update selected cinema and movie
          setSelectedCinema(String(cinema.complexId));
          setSelectedMovie(movieIdFromUrl);
        }
      }
    }
  }, [movieIdFromUrl, cinemaIdFromUrl, showtimeFromUrl, dateFromUrl, cinemaNameFromUrl, selectedShowtime]);

  // Get available showtimes for selected movie and cinema
  const availableShowtimes = useMemo(() => {
    if (!selectedMovie || !selectedCinema) return [];
    const cinema = cinemas.find(c => c.complexId === Number(selectedCinema));
    if (!cinema) return [];
    
    return showtimes.filter(st => 
      st.movieId === Number(selectedMovie) && 
      cinema.rooms.some(r => r.roomId === st.roomId)
    );
  }, [selectedMovie, selectedCinema]);

  // Get room for selected showtime
  const selectedRoom = useMemo(() => {
    if (!selectedShowtime) return null;
    const cinema = cinemas.find(c => c.rooms.some(r => r.roomId === selectedShowtime.roomId));
    if (!cinema) return null;
    return cinema.rooms.find(r => r.roomId === selectedShowtime.roomId);
  }, [selectedShowtime]);

  // Get booked seats for selected showtime
  const bookedSeatsForShowtime = useMemo(() => {
    if (!selectedShowtime) return new Set();
    return new Set(
      bookedSeats
        .filter(bs => bs.showtimeId === selectedShowtime.showtimeId)
        .map(bs => bs.seatId)
    );
  }, [selectedShowtime]);

  // Calculate total price
  const totalPrice = useMemo(() => {
    if (!selectedRoom || selectedSeats.length === 0) return 0;
    return selectedSeats.reduce((total, seatId) => {
      const seat = selectedRoom.seats.find(s => s.seatId === seatId);
      if (!seat) return total;
      const priceEntry = prices.find(
        p => p.roomType === selectedRoom.roomType && p.seatType === seat.type
      );
      return total + (priceEntry?.price || 0);
    }, 0);
  }, [selectedRoom, selectedSeats]);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  const getSeatColor = (type, isBooked, isSelected) => {
    if (isBooked) return '#666666';
    if (isSelected) return '#4caf50';
    const colorMap = {
      'NORMAL': '#4a90e2',
      'VIP': '#ffd159',
      'COUPLE': '#e83b41'
    };
    return colorMap[type] || '#4a90e2';
  };

  const handleSeatClick = (seatId) => {
    if (bookedSeatsForShowtime.has(seatId)) return; // Can't select booked seats
    
    setSelectedSeats(prev => {
      if (prev.includes(seatId)) {
        return prev.filter(id => id !== seatId);
      } else {
        return [...prev, seatId];
      }
    });
  };

  const renderSeatLayout = () => {
    if (!selectedRoom) return null;

    const seatsByRow = {};
    selectedRoom.seats.forEach(seat => {
      if (!seatsByRow[seat.row]) {
        seatsByRow[seat.row] = [];
      }
      seatsByRow[seat.row].push(seat);
    });

    const sortedRows = Object.keys(seatsByRow).sort();

    const walkwayPositions = new Set();
    for (let col = 5; col <= selectedRoom.cols; col += 5) {
      walkwayPositions.add(col);
    }
    if (selectedRoom.cols > 10) {
      const middle = Math.floor(selectedRoom.cols / 2);
      walkwayPositions.add(middle);
      walkwayPositions.add(middle + 1);
    }

    const buildRowSeats = (rowSeats) => {
      const sortedSeats = [...rowSeats].sort((a, b) => a.column - b.column);
      if (sortedSeats.length === 0) return [];
      
      const result = [];
      let lastColumn = 0;
      
      sortedSeats.forEach((seat) => {
        if (lastColumn > 0 && seat.column > lastColumn + 1) {
          let hasWalkway = false;
          for (let col = lastColumn + 1; col < seat.column; col++) {
            if (walkwayPositions.has(col)) {
              hasWalkway = true;
              break;
            }
          }
          
          if (hasWalkway) {
            const gapColumns = seat.column - lastColumn - 1;
            const gapWidth = Math.max(32, gapColumns * 8);
            result.push({ type: 'gap', width: gapWidth });
          }
        }
        
        result.push({ type: 'seat', seat });
        lastColumn = seat.column;
      });
      
      return result;
    };

    return (
      <div className="seat-layout">
        <div className="seat-layout__screen">
          <div className="seat-layout__screen-label">🎬 Màn hình 🎬</div>
        </div>

        <div className="seat-layout__grid">
          {sortedRows.map(row => {
            const rowItems = buildRowSeats(seatsByRow[row]);
            return (
              <div key={row} className="seat-layout__row">
                <div className="seat-layout__row-label">{row}</div>
                <div className="seat-layout__seats">
                  {rowItems.map((item, idx) => {
                    if (item.type === 'gap') {
                      return <div key={`gap-${idx}`} className="seat-layout__gap" style={{ width: `${item.width}px` }} />;
                    }
                    
                    const seat = item.seat;
                    const isCouple = seat.type === 'COUPLE';
                    const isBooked = bookedSeatsForShowtime.has(seat.seatId);
                    const isSelected = selectedSeats.includes(seat.seatId);
                    
                    return (
                      <button
                        key={seat.seatId}
                        className={`seat-button ${isCouple ? 'seat-button--couple' : ''} ${isBooked ? 'seat-button--booked' : ''} ${isSelected ? 'seat-button--selected' : ''}`}
                        style={{
                          backgroundColor: getSeatColor(seat.type, isBooked, isSelected),
                          borderColor: isBooked ? '#666' : (isSelected ? '#4caf50' : getSeatColor(seat.type, false, false)),
                          width: isCouple ? '64px' : '44px',
                          cursor: isBooked ? 'not-allowed' : 'pointer',
                          opacity: isBooked ? 0.5 : 1
                        }}
                        onClick={() => handleSeatClick(seat.seatId)}
                        disabled={isBooked}
                        title={`${seat.seatId} - ${seat.type === 'NORMAL' ? 'Thường' : seat.type === 'VIP' ? 'VIP' : 'Đôi'}${isBooked ? ' (Đã đặt)' : ''}`}
                      >
                        <span className="seat-button__number">{seat.column}</span>
                        <span className="seat-button__type">
                          {seat.type === 'COUPLE' ? '💑' : seat.type === 'VIP' ? '⭐' : ''}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
        
        <div className="seat-layout__legend">
          <div className="seat-legend">
            <div className="seat-legend__item">
              <div className="seat-legend__color" style={{ backgroundColor: '#4a90e2' }}>N</div>
              <span>Thường</span>
            </div>
            <div className="seat-legend__item">
              <div className="seat-legend__color" style={{ backgroundColor: '#ffd159' }}>⭐</div>
              <span>VIP</span>
            </div>
            <div className="seat-legend__item">
              <div className="seat-legend__color" style={{ backgroundColor: '#e83b41', width: '48px' }}>💑</div>
              <span>Đôi</span>
            </div>
            <div className="seat-legend__item">
              <div className="seat-legend__color" style={{ backgroundColor: '#666666' }}>X</div>
              <span>Đã đặt</span>
            </div>
            <div className="seat-legend__item">
              <div className="seat-legend__color" style={{ backgroundColor: '#4caf50', border: '2px solid #fff' }}>✓</div>
              <span>Đã chọn</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const handleConfirm = () => {
    if (selectedSeats.length === 0) {
      alert('Vui lòng chọn ít nhất một ghế');
      return;
    }
    alert('Đặt vé thành công!');
    // Here you would save to database
    window.location.href = '#orders';
  };

  return (
    <div className="min-h-screen cinema-mood">
      <Header />

      <main className="main">
        <section className="section">
          <div className="container">
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#ffd159' }}>
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
                <path d="M8 7h8M8 11h8M8 15h4"/>
              </svg>
              <h1 className="section__title" style={{ fontSize: 'clamp(28px, 4vw, 36px)', margin: 0, fontWeight: 800, letterSpacing: '-0.02em', fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif' }}>
                Đặt vé phim
              </h1>
            </div>

            {/* Step 1: Select Movie, Cinema, Showtime */}
            {step === 1 && (
              <div className="book-ticket-step">
                <div className="book-ticket-form">
                  <div className="book-ticket-form__group">
                    <label>Chọn phim *</label>
                    <select
                      value={selectedMovie}
                      onChange={(e) => {
                        setSelectedMovie(e.target.value);
                        setSelectedCinema('');
                        setSelectedShowtime(null);
                      }}
                      className="book-ticket-form__input"
                    >
                      <option value="">-- Chọn phim --</option>
                      {movies.map(m => (
                        <option key={m.movieId} value={m.movieId}>{m.title}</option>
                      ))}
                    </select>
                  </div>

                  {selectedMovie && (
                    <div className="book-ticket-form__group">
                      <label>Chọn rạp *</label>
                      <select
                        value={selectedCinema}
                        onChange={(e) => {
                          setSelectedCinema(e.target.value);
                          setSelectedShowtime(null);
                        }}
                        className="book-ticket-form__input"
                      >
                        <option value="">-- Chọn rạp --</option>
                        {cinemas.map(c => (
                          <option key={c.complexId} value={c.complexId}>
                            {c.name} ({c.province})
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {selectedCinema && availableShowtimes.length > 0 && (
                    <div className="book-ticket-form__group">
                      <label>Chọn suất chiếu *</label>
                      <div className="book-ticket-showtimes">
                        {availableShowtimes.map(st => {
                          const cinema = cinemas.find(c => c.complexId === Number(selectedCinema));
                          const room = cinema?.rooms.find(r => r.roomId === st.roomId);
                          return (
                            <button
                              key={st.showtimeId}
                              className={`book-ticket-showtime-btn ${selectedShowtime?.showtimeId === st.showtimeId ? 'book-ticket-showtime-btn--active' : ''}`}
                              onClick={() => {
                                setPendingShowtime(st);
                                setAgeConfirmed(false);
                                setShowAgeConfirmModal(true);
                              }}
                            >
                              <div className="book-ticket-showtime-btn__time">
                                {new Date(st.startTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                              </div>
                              <div className="book-ticket-showtime-btn__room">
                                {room?.roomName} • {room?.roomType}
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Step 2: Select Seats */}
            {step === 2 && (
              <>
                {selectedRoom && selectedShowtime ? (
                  <div className="book-ticket-step">
                    <div className="book-ticket-seat-selection">
                      <div className="book-ticket-seat-selection__header">
                        <div>
                          <h2 style={{ margin: '0 0 8px', fontSize: '20px', fontWeight: 800, color: '#fff' }}>
                            {movies.find(m => m.movieId === Number(selectedMovie || movieIdFromUrl))?.title || 'Đặt vé phim'}
                          </h2>
                          <div style={{ fontSize: '14px', color: 'rgba(255,255,255,0.7)' }}>
                            {cinemas.find(c => c.complexId === Number(selectedCinema || cinemaIdFromUrl))?.name || cinemaNameFromUrl} • {selectedRoom.roomName} • {selectedRoom.roomType}
                          </div>
                          <div style={{ fontSize: '14px', color: 'rgba(255,255,255,0.7)', marginTop: '4px' }}>
                            {selectedShowtime.startTime ? new Date(selectedShowtime.startTime).toLocaleString('vi-VN') : `${dateFromUrl} ${showtimeFromUrl}`}
                          </div>
                        </div>
                        {!movieIdFromUrl && (
                          <button
                            className="btn btn--ghost"
                            onClick={() => {
                              setStep(1);
                              setSelectedSeats([]);
                            }}
                          >
                            Quay lại
                          </button>
                        )}
                      </div>

                      <div className="book-ticket-seat-selection__layout">
                        {renderSeatLayout()}
                      </div>

                      {selectedSeats.length > 0 && (
                        <div className="book-ticket-seat-selection__summary">
                          <div className="book-ticket-seat-selection__selected">
                            <span>Ghế đã chọn:</span>
                            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                              {selectedSeats.map(seatId => {
                                const seat = selectedRoom.seats.find(s => s.seatId === seatId);
                                const priceEntry = prices.find(
                                  p => p.roomType === selectedRoom.roomType && p.seatType === seat?.type
                                );
                                return (
                                  <div key={seatId} className="book-ticket-seat-badge">
                                    <span>{seatId}</span>
                                    <span style={{ marginLeft: '8px', color: '#ffd159' }}>
                                      {formatPrice(priceEntry?.price || 0)}
                                    </span>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                          <div className="book-ticket-seat-selection__total">
                            <span>Tổng cộng:</span>
                            <span style={{ fontSize: '24px', fontWeight: 800, color: '#ffd159' }}>
                              {formatPrice(totalPrice)}
                            </span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'center', marginTop: '16px' }}>
                            <button
                              className="btn btn--primary"
                              onClick={() => {
                                // Save booking info to localStorage
                                const bookingInfo = {
                                  movieId: selectedMovie || movieIdFromUrl,
                                  cinemaId: selectedCinema || cinemaIdFromUrl,
                                  cinemaName: cinemas.find(c => c.complexId === Number(selectedCinema || cinemaIdFromUrl))?.name || cinemaNameFromUrl,
                                  showtime: selectedShowtime,
                                  room: selectedRoom,
                                  seats: selectedSeats,
                                  totalPrice: totalPrice,
                                  movieTitle: movies.find(m => m.movieId === Number(selectedMovie || movieIdFromUrl))?.title
                                };
                                localStorage.setItem('pendingBooking', JSON.stringify(bookingInfo));
                                // Navigate to food and drinks page
                                window.location.href = '#order-food';
                              }}
                              style={{ padding: '14px 32px', minWidth: '200px' }}
                            >
                              Tiếp tục
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="book-ticket-step">
                    <div style={{ textAlign: 'center', padding: '40px', color: 'rgba(255,255,255,0.7)' }}>
                      <p>Đang tải thông tin suất chiếu...</p>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* Step 3: Confirm & Payment */}
            {step === 3 && (
              <div className="book-ticket-step">
                <div className="book-ticket-confirm">
                  <div className="book-ticket-confirm__header">
                    <h2 style={{ margin: '0 0 8px', fontSize: '20px', fontWeight: 800, color: '#fff' }}>
                      Xác nhận đặt vé
                    </h2>
                    <button
                      className="btn btn--ghost"
                      onClick={() => setStep(2)}
                    >
                      Quay lại
                    </button>
                  </div>

                  <div className="book-ticket-confirm__content">
                    <div className="book-ticket-confirm__info">
                      <div className="book-ticket-confirm__section">
                        <h3>Thông tin phim</h3>
                        <div className="book-ticket-confirm__movie">
                          <img
                            src={movies.find(m => m.movieId === Number(selectedMovie))?.poster}
                            alt="Movie poster"
                            style={{ width: '80px', height: '120px', borderRadius: '8px', objectFit: 'cover' }}
                          />
                          <div>
                            <div style={{ fontWeight: 700, fontSize: '18px', marginBottom: '8px' }}>
                              {movies.find(m => m.movieId === Number(selectedMovie))?.title}
                            </div>
                            <div style={{ fontSize: '14px', color: 'rgba(255,255,255,0.7)' }}>
                              {cinemas.find(c => c.complexId === Number(selectedCinema))?.name}
                            </div>
                            <div style={{ fontSize: '14px', color: 'rgba(255,255,255,0.7)' }}>
                              {selectedRoom?.roomName} • {selectedRoom?.roomType}
                            </div>
                            <div style={{ fontSize: '14px', color: 'rgba(255,255,255,0.7)' }}>
                              {new Date(selectedShowtime.startTime).toLocaleString('vi-VN')}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="book-ticket-confirm__section">
                        <h3>Ghế đã chọn</h3>
                        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                          {selectedSeats.map(seatId => {
                            const seat = selectedRoom.seats.find(s => s.seatId === seatId);
                            const priceEntry = prices.find(
                              p => p.roomType === selectedRoom.roomType && p.seatType === seat?.type
                            );
                            return (
                              <div key={seatId} className="book-ticket-seat-badge">
                                <span>{seatId}</span>
                                <span style={{ marginLeft: '8px', color: '#ffd159' }}>
                                  {formatPrice(priceEntry?.price || 0)}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      <div className="book-ticket-confirm__section checkout-section--compact">
                        <h3 className="checkout-section__title--small">Thông tin khách hàng</h3>
                        <div className="checkout-customer-info">
                          <div className="checkout-customer-info__item">
                            <span className="checkout-customer-info__label">Họ và tên:</span>
                            <span className="checkout-customer-info__value">{customerInfo.name}</span>
                          </div>
                          <div className="checkout-customer-info__item">
                            <span className="checkout-customer-info__label">Số điện thoại:</span>
                            <span className="checkout-customer-info__value">{customerInfo.phone}</span>
                          </div>
                          <div className="checkout-customer-info__item">
                            <span className="checkout-customer-info__label">Email:</span>
                            <span className="checkout-customer-info__value">{customerInfo.email}</span>
                          </div>
                        </div>
                      </div>

                      <div className="book-ticket-confirm__section">
                        <h3>Phương thức thanh toán</h3>
                        <div className="checkout-payment-methods">
                          <label className="checkout-payment-method">
                            <input
                              type="radio"
                              name="payment"
                              value="vnpay"
                              checked={paymentMethod === 'vnpay'}
                              onChange={(e) => setPaymentMethod(e.target.value)}
                            />
                            <div className="checkout-payment-method__content">
                              <span>VNPay</span>
                            </div>
                          </label>
                          <label className="checkout-payment-method">
                            <input
                              type="radio"
                              name="payment"
                              value="momo"
                              checked={paymentMethod === 'momo'}
                              onChange={(e) => setPaymentMethod(e.target.value)}
                            />
                            <div className="checkout-payment-method__content">
                              <span>MoMo</span>
                            </div>
                          </label>
                          <label className="checkout-payment-method">
                            <input
                              type="radio"
                              name="payment"
                              value="cash"
                              checked={paymentMethod === 'cash'}
                              onChange={(e) => setPaymentMethod(e.target.value)}
                            />
                            <div className="checkout-payment-method__content">
                              <span>Tiền mặt</span>
                            </div>
                          </label>
                        </div>
                      </div>
                    </div>

                    <div className="book-ticket-confirm__sidebar">
                      <div className="book-ticket-confirm__total">
                        <div style={{ fontSize: '14px', color: 'rgba(255,255,255,0.7)', marginBottom: '8px' }}>
                          Tổng cộng
                        </div>
                        <div style={{ fontSize: '32px', fontWeight: 800, color: '#ffd159' }}>
                          {formatPrice(totalPrice)}
                        </div>
                        <button
                          className="btn btn--primary checkout-submit-btn"
                          onClick={handleConfirm}
                        >
                          Xác nhận thanh toán
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>
      </main>

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
            
            {pendingShowtime && (() => {
              const movie = movies.find(m => m.movieId === Number(selectedMovie || movieIdFromUrl));
              const rating = movie?.rating || 'T16';
              const ageNumber = rating.replace('T', '');
              
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
                      Phim: {movie?.title || 'N/A'}
                    </div>
                    <div style={{ 
                      fontSize: '14px', 
                      color: '#c9c4c5',
                      lineHeight: '1.6'
                    }}>
                      <strong style={{ color: '#ffd159' }}>{rating}:</strong> Phim dành cho khán giả từ đủ {ageNumber} tuổi trở lên ({ageNumber}+)
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
                      Tôi xác nhận rằng tôi đã đủ {ageNumber} tuổi trở lên và đủ điều kiện để xem phim này.
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
                        setHasShownAgeModal(false); // Reset để có thể hiển thị lại modal nếu cần
                      }}
                      style={{
                        padding: '12px 24px',
                        fontSize: '14px',
                        fontWeight: 600
                      }}
                    >
                      Hủy
                    </button>
                    <button
                      className="btn btn--primary"
                      onClick={() => {
                        if (ageConfirmed && pendingShowtime) {
                          setSelectedShowtime(pendingShowtime);
                          setSelectedSeats([]);
                          setStep(2);
                          setShowAgeConfirmModal(false);
                          setPendingShowtime(null);
                          setAgeConfirmed(false);
                        }
                      }}
                      disabled={!ageConfirmed}
                      style={{
                        padding: '12px 24px',
                        fontSize: '14px',
                        fontWeight: 600,
                        opacity: ageConfirmed ? 1 : 0.5,
                        cursor: ageConfirmed ? 'pointer' : 'not-allowed'
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

      <Footer />
    </div>
  );
}

