import React, { useState, useEffect } from 'react';

// Enums from database
const GENRES = ['ACTION', 'COMEDY', 'HORROR', 'DRAMA', 'ROMANCE', 'THRILLER', 'ANIMATION', 'FANTASY', 'SCI-FI', 'MUSICAL', 'FAMILY', 'DOCUMENTARY', 'ADVENTURE', 'SUPERHERO'];
const MOVIE_STATUSES = ['COMING_SOON', 'NOW_SHOWING', 'ENDED'];
const AGE_RATINGS = ['P', 'K', '13+', '16+', '18+'];
const SEAT_TYPES = ['NORMAL', 'VIP', 'COUPLE'];
const ROOM_TYPES = ['2D', '3D', 'DELUXE'];

// Generate seats for a room with realistic layout
function generateSeats(rows, cols) {
  const seats = [];
  const rowLetters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  
  // Calculate walkway positions (every 4-5 seats, and in the middle if cols > 10)
  const walkwayPositions = new Set();
  for (let col = 5; col <= cols; col += 5) {
    walkwayPositions.add(col);
  }
  // Add middle walkway if room is wide enough
  if (cols > 10) {
    const middle = Math.floor(cols / 2);
    walkwayPositions.add(middle);
    walkwayPositions.add(middle + 1);
  }
  
  for (let row = 0; row < rows; row++) {
    for (let col = 1; col <= cols; col++) {
      // Skip walkway columns
      if (walkwayPositions.has(col)) continue;
      
      // Determine seat type based on row position
      let seatType = 'NORMAL';
      if (row < Math.floor(rows * 0.15)) {
        // First ~15% rows are VIP
        seatType = 'VIP';
      } else if (row >= rows - 2 && cols > 12) {
        // Last 2 rows might have couple seats in wide rooms
        // Randomly assign some couple seats (about 20%)
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

// Sample cinema data
const initialCinemas = [
  {
    complexId: 1,
    name: 'Cinestar Quốc Thanh',
    address: '271 Nguyễn Trãi, Quận 1, TP.HCM',
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
    address: '135 Hai Bà Trưng, Quận 1, TP.HCM',
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

// Sample data
const stats = [
  { label: 'Tổng doanh thu', value: '125.450.000đ', icon: 'money', trend: '+12.5%', color: '#4caf50' },
  { label: 'Tổng vé bán', value: '2.456', icon: 'ticket', trend: '+8.2%', color: '#2196f3' },
  { label: 'Người dùng', value: '1.234', icon: 'users', trend: '+5.1%', color: '#ff9800' },
  { label: 'Phim đang chiếu', value: '24', icon: 'film', trend: '+3', color: '#e83b41' },
];

// Sample movies data
const initialMovies = [
  {
    movieId: 1,
    title: 'Inception',
    genre: 'ACTION',
    duration: 148,
    releaseDate: '2010-07-16',
    ageRating: '13+',
    actor: 'Leonardo DiCaprio, Marion Cotillard, Tom Hardy',
    director: 'Christopher Nolan',
    description: 'A skilled thief is given a chance at redemption if he can perform an impossible task: Inception, planting an idea in someone\'s mind.',
    trailerURL: 'https://www.youtube.com/watch?v=YoHD9XEInc0',
    poster: 'https://image.tmdb.org/t/p/w500/oYuLEt3zVCKq57qu2F8dT7NIa6f.jpg',
    status: 'NOW_SHOWING'
  },
  {
    movieId: 2,
    title: 'Interstellar',
    genre: 'SCI-FI',
    duration: 169,
    releaseDate: '2014-11-07',
    ageRating: '13+',
    actor: 'Matthew McConaughey, Anne Hathaway, Jessica Chastain',
    director: 'Christopher Nolan',
    description: 'A team of explorers travel through a wormhole in space in an attempt to ensure humanity\'s survival.',
    trailerURL: 'https://www.youtube.com/watch?v=zSWdZVtXT7E',
    poster: 'https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg',
    status: 'NOW_SHOWING'
  },
  {
    movieId: 3,
    title: 'The Dark Knight',
    genre: 'ACTION',
    duration: 152,
    releaseDate: '2008-07-18',
    ageRating: '16+',
    actor: 'Christian Bale, Heath Ledger, Aaron Eckhart',
    director: 'Christopher Nolan',
    description: 'Batman must accept one of the greatest psychological and physical tests of his ability to fight injustice.',
    trailerURL: 'https://www.youtube.com/watch?v=EXeTwQWrcwY',
    poster: 'https://image.tmdb.org/t/p/w500/qJ2tW6WMUDux911r6m7haRef0WH.jpg',
    status: 'NOW_SHOWING'
  },
  {
    movieId: 4,
    title: 'Drive My Car',
    genre: 'DRAMA',
    duration: 179,
    releaseDate: '2021-08-20',
    ageRating: '13+',
    actor: 'Hidetoshi Nishijima, Tōko Miura, Masaki Okada',
    director: 'Ryusuke Hamaguchi',
    description: 'A widowed actor who directs theatre productions embarks on a road trip with a young female chauffeur.',
    trailerURL: 'https://www.youtube.com/watch?v=6BPKPb_RTwI',
    poster: 'https://image.tmdb.org/t/p/w500/lXi2YKI3m30qtX9cB5GPz8b3uaw.jpg',
    status: 'NOW_SHOWING'
  },
  {
    movieId: 5,
    title: 'Wicked',
    genre: 'FANTASY',
    duration: 165,
    releaseDate: '2024-11-27',
    ageRating: '13+',
    actor: 'Cynthia Erivo, Ariana Grande, Jonathan Bailey',
    director: 'Jon M. Chu',
    description: 'The untold story of the witches of Oz.',
    trailerURL: 'https://www.youtube.com/watch?v=Y5BeTH2c3WA',
    poster: 'https://image.tmdb.org/t/p/w500/9azEue8jX6n8WcN6iYG3PaY5E9R.jpg',
    status: 'COMING_SOON'
  },
];

const recentBookings = [
  { id: 1, customer: 'Nguyễn Văn A', movie: 'Inception', cinema: 'Cinestar Quốc Thanh', amount: 120000, date: '07/11/2025 19:30' },
  { id: 2, customer: 'Trần Thị B', movie: 'Interstellar', cinema: 'Cinestar Hai Bà Trưng', amount: 180000, date: '08/11/2025 21:00' },
  { id: 3, customer: 'Lê Văn C', movie: 'The Dark Knight', cinema: 'Cinestar Satra Q6', amount: 120000, date: '09/11/2025 20:15' },
  { id: 4, customer: 'Phạm Thị D', movie: 'Drive My Car', cinema: 'Cinestar Quốc Thanh', amount: 150000, date: '10/11/2025 18:45' },
];

const topMovies = [
  { id: 1, title: 'Inception', bookings: 456, revenue: 54720000 },
  { id: 2, title: 'Interstellar', bookings: 389, revenue: 70020000 },
  { id: 3, title: 'The Dark Knight', bookings: 312, revenue: 37440000 },
  { id: 4, title: 'Drive My Car', bookings: 245, revenue: 36750000 },
];

// Cinema Management Component
function CinemaManagement({ cinemas: initialCinemasList, onCinemasChange }) {
  const [cinemas, setCinemas] = useState(initialCinemasList);
  const [selectedCinema, setSelectedCinema] = useState(null);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [showCinemaModal, setShowCinemaModal] = useState(false);
  const [showRoomModal, setShowRoomModal] = useState(false);
  const [editingCinema, setEditingCinema] = useState(null);
  const [editingRoom, setEditingRoom] = useState(null);
  const [selectedSeatType, setSelectedSeatType] = useState('NORMAL');
  const [cinemaFormData, setCinemaFormData] = useState({
    name: '',
    address: ''
  });
  const [roomFormData, setRoomFormData] = useState({
    roomName: '',
    roomType: '2D',
    rows: 10,
    cols: 12
  });

  useEffect(() => {
    if (onCinemasChange) {
      onCinemasChange(cinemas);
    }
  }, [cinemas, onCinemasChange]);

  // Handle cinema operations
  const handleAddCinema = () => {
    setEditingCinema(null);
    setCinemaFormData({ name: '', address: '' });
    setShowCinemaModal(true);
  };

  const handleEditCinema = (cinema) => {
    setEditingCinema(cinema);
    setCinemaFormData({ name: cinema.name, address: cinema.address });
    setShowCinemaModal(true);
  };

  const handleSaveCinema = () => {
    if (!cinemaFormData.name || !cinemaFormData.address) {
      alert('Vui lòng điền đầy đủ thông tin');
      return;
    }

    if (editingCinema) {
      setCinemas(cinemas.map(c =>
        c.complexId === editingCinema.complexId
          ? { ...c, ...cinemaFormData }
          : c
      ));
    } else {
      const newCinema = {
        complexId: Math.max(...cinemas.map(c => c.complexId), 0) + 1,
        ...cinemaFormData,
        rooms: []
      };
      setCinemas([...cinemas, newCinema]);
    }
    setShowCinemaModal(false);
    setEditingCinema(null);
  };

  const handleDeleteCinema = (complexId) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa rạp này? Tất cả phòng chiếu sẽ bị xóa.')) {
      setCinemas(cinemas.filter(c => c.complexId !== complexId));
      if (selectedCinema?.complexId === complexId) {
        setSelectedCinema(null);
        setSelectedRoom(null);
      }
    }
  };

  // Handle room operations
  const handleAddRoom = (cinema) => {
    setEditingRoom(null);
    setRoomFormData({ roomName: '', roomType: '2D', rows: 10, cols: 12 });
    setSelectedCinema(cinema);
    setShowRoomModal(true);
  };

  const handleEditRoom = (cinema, room) => {
    setEditingRoom(room);
    setSelectedCinema(cinema);
    setRoomFormData({
      roomName: room.roomName,
      roomType: room.roomType,
      rows: room.rows,
      cols: room.cols
    });
    setShowRoomModal(true);
  };

  const handleSaveRoom = () => {
    if (!roomFormData.roomName || !roomFormData.rows || !roomFormData.cols) {
      alert('Vui lòng điền đầy đủ thông tin');
      return;
    }

    const cinemaIndex = cinemas.findIndex(c => c.complexId === selectedCinema.complexId);
    if (cinemaIndex === -1) return;

    const updatedCinemas = [...cinemas];
    const cinema = { ...updatedCinemas[cinemaIndex] };

    if (editingRoom) {
      // Update existing room
      cinema.rooms = cinema.rooms.map(r =>
        r.roomId === editingRoom.roomId
          ? {
              ...r,
              roomName: roomFormData.roomName,
              roomType: roomFormData.roomType,
              rows: roomFormData.rows,
              cols: roomFormData.cols,
              // Keep existing seats if rows/cols unchanged, otherwise regenerate
              seats: r.rows === roomFormData.rows && r.cols === roomFormData.cols
                ? r.seats
                : generateSeats(roomFormData.rows, roomFormData.cols)
            }
          : r
      );
    } else {
      // Add new room
      const newRoom = {
        roomId: Math.max(...cinema.rooms.map(r => r.roomId), 0) + 1,
        roomName: roomFormData.roomName,
        roomType: roomFormData.roomType,
        rows: roomFormData.rows,
        cols: roomFormData.cols,
        seats: generateSeats(roomFormData.rows, roomFormData.cols)
      };
      cinema.rooms = [...cinema.rooms, newRoom];
    }

    updatedCinemas[cinemaIndex] = cinema;
    setCinemas(updatedCinemas);
    setShowRoomModal(false);
    setEditingRoom(null);
  };

  const handleDeleteRoom = (cinema, roomId) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa phòng chiếu này?')) {
      const cinemaIndex = cinemas.findIndex(c => c.complexId === cinema.complexId);
      if (cinemaIndex === -1) return;

      const updatedCinemas = [...cinemas];
      updatedCinemas[cinemaIndex] = {
        ...updatedCinemas[cinemaIndex],
        rooms: updatedCinemas[cinemaIndex].rooms.filter(r => r.roomId !== roomId)
      };
      setCinemas(updatedCinemas);
      if (selectedRoom?.roomId === roomId) {
        setSelectedRoom(null);
      }
    }
  };

  // Handle seat operations
  const handleSeatClick = (seatId) => {
    if (!selectedCinema || !selectedRoom) return;

    const cinemaIndex = cinemas.findIndex(c => c.complexId === selectedCinema.complexId);
    if (cinemaIndex === -1) return;

    const roomIndex = cinemas[cinemaIndex].rooms.findIndex(r => r.roomId === selectedRoom.roomId);
    if (roomIndex === -1) return;

    const updatedCinemas = [...cinemas];
    const updatedCinema = { ...updatedCinemas[cinemaIndex] };
    const updatedRooms = [...updatedCinema.rooms];
    const updatedRoom = { ...updatedRooms[roomIndex] };
    
    // Cycle through seat types: NORMAL -> VIP -> COUPLE -> NORMAL
    const currentSeat = updatedRoom.seats.find(s => s.seatId === seatId);
    if (currentSeat) {
      const currentIndex = SEAT_TYPES.indexOf(currentSeat.type);
      const nextIndex = (currentIndex + 1) % SEAT_TYPES.length;
      const newType = SEAT_TYPES[nextIndex];
      
      // Update seat
      updatedRoom.seats = updatedRoom.seats.map(s =>
        s.seatId === seatId ? { ...s, type: newType } : s
      );
      
      updatedRooms[roomIndex] = updatedRoom;
      updatedCinema.rooms = updatedRooms;
      updatedCinemas[cinemaIndex] = updatedCinema;
      
      setCinemas(updatedCinemas);
      
      // Update selectedRoom to reflect changes immediately
      setSelectedRoom(updatedRoom);
    }
  };

  // Get seat color based on type
  const getSeatColor = (type) => {
    const colorMap = {
      'NORMAL': '#4a90e2',
      'VIP': '#ffd159',
      'COUPLE': '#e83b41'
    };
    return colorMap[type] || '#4a90e2';
  };

  // Render seat layout
  const renderSeatLayout = (room) => {
    if (!room || !room.seats) return null;

    // Group seats by row
    const seatsByRow = {};
    room.seats.forEach(seat => {
      if (!seatsByRow[seat.row]) {
        seatsByRow[seat.row] = [];
      }
      seatsByRow[seat.row].push(seat);
    });

    // Sort rows
    const sortedRows = Object.keys(seatsByRow).sort();

    // Calculate walkway positions (same logic as generateSeats)
    const walkwayPositions = new Set();
    for (let col = 5; col <= room.cols; col += 5) {
      walkwayPositions.add(col);
    }
    if (room.cols > 10) {
      const middle = Math.floor(room.cols / 2);
      walkwayPositions.add(middle);
      walkwayPositions.add(middle + 1);
    }

    // Build row structure with gaps aligned to walkways
    const buildRowSeats = (rowSeats) => {
      const sortedSeats = [...rowSeats].sort((a, b) => a.column - b.column);
      if (sortedSeats.length === 0) return [];
      
      const result = [];
      let lastColumn = 0;
      
      sortedSeats.forEach((seat) => {
        // Check if there's a gap (walkway) between last column and current seat
        if (lastColumn > 0 && seat.column > lastColumn + 1) {
          // There's a gap - check if it contains walkways
          let hasWalkway = false;
          for (let col = lastColumn + 1; col < seat.column; col++) {
            if (walkwayPositions.has(col)) {
              hasWalkway = true;
              break;
            }
          }
          
          if (hasWalkway) {
            // Calculate gap width based on number of missing columns
            const gapColumns = seat.column - lastColumn - 1;
            const gapWidth = Math.max(32, gapColumns * 8); // Minimum 32px, or based on columns
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
                <div className="seat-layout__seats">
                  {rowItems.map((item, idx) => {
                    if (item.type === 'gap') {
                      return <div key={`gap-${idx}`} className="seat-layout__gap" style={{ width: `${item.width}px` }} />;
                    }
                    
                    const seat = item.seat;
                    const isCouple = seat.type === 'COUPLE';
                    
                    return (
                      <button
                        key={seat.seatId}
                        className={`seat-button ${isCouple ? 'seat-button--couple' : ''}`}
                        style={{
                          backgroundColor: getSeatColor(seat.type),
                          borderColor: seat.status ? getSeatColor(seat.type) : '#666',
                          width: isCouple ? '64px' : '44px'
                        }}
                        onClick={() => handleSeatClick(seat.seatId)}
                        title={`${seat.seatId} - ${seat.type === 'NORMAL' ? 'Thường' : seat.type === 'VIP' ? 'VIP' : 'Đôi'}`}
                      >
                        <span className="seat-button__number">{seat.column}</span>
                        <span className="seat-button__type">
                          {seat.type === 'COUPLE' ? '💑' : seat.type === 'VIP' ? '⭐' : seat.type.charAt(0)}
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
              <div className="seat-legend__color" style={{ backgroundColor: getSeatColor('NORMAL') }}>N</div>
              <span>Thường - Click để đổi</span>
            </div>
            <div className="seat-legend__item">
              <div className="seat-legend__color" style={{ backgroundColor: getSeatColor('VIP') }}>⭐</div>
              <span>VIP</span>
            </div>
            <div className="seat-legend__item">
              <div className="seat-legend__color" style={{ backgroundColor: getSeatColor('COUPLE'), width: '48px' }}>💑</div>
              <span>Đôi (Ghế đôi)</span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="cinema-management">
      <div className="cinema-management__header">
        <button className="btn btn--primary" onClick={handleAddCinema}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="5" x2="12" y2="19"/>
            <line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Thêm rạp mới
        </button>
      </div>

      <div className="cinema-management__content">
        {cinemas.length === 0 ? (
          <div className="cinema-empty-state">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
              <circle cx="12" cy="10" r="3"/>
            </svg>
            <p>Chưa có rạp nào. Nhấn "Thêm rạp mới" để bắt đầu.</p>
          </div>
        ) : (
          <div className="cinema-list">
            {cinemas.map(cinema => (
            <div key={cinema.complexId} className="cinema-card">
              <div className="cinema-card__header">
                <div className="cinema-card__info">
                  <h3 className="cinema-card__name">{cinema.name}</h3>
                  <p className="cinema-card__address">{cinema.address}</p>
                  <span className="cinema-card__rooms-count">{cinema.rooms.length} phòng chiếu</span>
                </div>
                <div className="cinema-card__actions">
                  <button
                    className="cinema-action-btn"
                    onClick={() => handleEditCinema(cinema)}
                    title="Chỉnh sửa"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                    </svg>
                  </button>
                  <button
                    className="cinema-action-btn cinema-action-btn--delete"
                    onClick={() => handleDeleteCinema(cinema.complexId)}
                    title="Xóa"
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="3 6 5 6 21 6"/>
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                    </svg>
                  </button>
                  <button
                    className="btn btn--ghost btn--small"
                    onClick={() => handleAddRoom(cinema)}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="12" y1="5" x2="12" y2="19"/>
                      <line x1="5" y1="12" x2="19" y2="12"/>
                    </svg>
                    Thêm phòng
                  </button>
                </div>
              </div>

              <div className="cinema-card__rooms">
                {cinema.rooms.length === 0 ? (
                  <p className="cinema-empty">Chưa có phòng chiếu. Nhấn "Thêm phòng" để tạo mới.</p>
                ) : (
                  cinema.rooms.map(room => (
                    <div key={room.roomId} className="room-card">
                      <div className="room-card__header">
                        <div className="room-card__info">
                          <h4 className="room-card__name">{room.roomName}</h4>
                          <span className="room-card__type">{room.roomType}</span>
                          <span className="room-card__size">{room.rows} hàng × {room.cols} cột</span>
                        </div>
                        <div className="room-card__actions">
                          <button
                            className="cinema-action-btn"
                            onClick={() => {
                              setSelectedRoom(room);
                              setSelectedCinema(cinema);
                            }}
                            title="Xem layout ghế"
                          >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <rect x="3" y="3" width="18" height="18" rx="2"/>
                              <path d="M9 9h6v6H9z"/>
                            </svg>
                          </button>
                          <button
                            className="cinema-action-btn"
                            onClick={() => handleEditRoom(cinema, room)}
                            title="Chỉnh sửa"
                          >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                            </svg>
                          </button>
                          <button
                            className="cinema-action-btn cinema-action-btn--delete"
                            onClick={() => handleDeleteRoom(cinema, room.roomId)}
                            title="Xóa"
                          >
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <polyline points="3 6 5 6 21 6"/>
                              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
            ))}
          </div>
        )}
      </div>

      {/* Seat Layout Modal */}
      {selectedRoom && (
        <div className="seat-layout-modal-overlay" onClick={() => setSelectedRoom(null)}>
          <div className="seat-layout-modal" onClick={(e) => e.stopPropagation()}>
            <div className="seat-layout-modal__header">
              <h2>{selectedRoom.roomName} - {selectedCinema?.name}</h2>
              <button className="seat-layout-modal__close" onClick={() => setSelectedRoom(null)}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
            <div className="seat-layout-modal__content">
              <p className="seat-layout-modal__hint">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/>
                  <path d="M12 16v-4M12 8h.01"/>
                </svg>
                Click vào ghế để thay đổi loại: Thường → VIP → Đôi → Thường
              </p>
              {renderSeatLayout(selectedRoom)}
            </div>
          </div>
        </div>
      )}

      {/* Cinema Modal */}
      {showCinemaModal && (
        <div className="movie-modal-overlay" onClick={() => setShowCinemaModal(false)}>
          <div className="movie-modal" onClick={(e) => e.stopPropagation()}>
            <div className="movie-modal__header">
              <h2>{editingCinema ? 'Chỉnh sửa rạp' : 'Thêm rạp mới'}</h2>
              <button className="movie-modal__close" onClick={() => setShowCinemaModal(false)}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
            <div className="movie-modal__content">
              <div className="movie-form">
                <div className="movie-form__group">
                  <label>Tên rạp <span className="required">*</span></label>
                  <input
                    type="text"
                    value={cinemaFormData.name}
                    onChange={(e) => setCinemaFormData({ ...cinemaFormData, name: e.target.value })}
                    placeholder="Nhập tên rạp"
                  />
                </div>
                <div className="movie-form__group">
                  <label>Địa chỉ <span className="required">*</span></label>
                  <input
                    type="text"
                    value={cinemaFormData.address}
                    onChange={(e) => setCinemaFormData({ ...cinemaFormData, address: e.target.value })}
                    placeholder="Nhập địa chỉ"
                  />
                </div>
              </div>
            </div>
            <div className="movie-modal__footer">
              <button className="btn btn--ghost" onClick={() => setShowCinemaModal(false)}>
                Hủy
              </button>
              <button className="btn btn--primary" onClick={handleSaveCinema}>
                {editingCinema ? 'Cập nhật' : 'Thêm rạp'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Room Modal */}
      {showRoomModal && (
        <div className="movie-modal-overlay" onClick={() => setShowRoomModal(false)}>
          <div className="movie-modal" onClick={(e) => e.stopPropagation()}>
            <div className="movie-modal__header">
              <h2>{editingRoom ? 'Chỉnh sửa phòng chiếu' : 'Thêm phòng chiếu'}</h2>
              <button className="movie-modal__close" onClick={() => setShowRoomModal(false)}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
            <div className="movie-modal__content">
              <div className="movie-form">
                <div className="movie-form__row">
                  <div className="movie-form__group">
                    <label>Tên phòng <span className="required">*</span></label>
                    <input
                      type="text"
                      value={roomFormData.roomName}
                      onChange={(e) => setRoomFormData({ ...roomFormData, roomName: e.target.value })}
                      placeholder="VD: Phòng 1"
                    />
                  </div>
                  <div className="movie-form__group">
                    <label>Loại phòng <span className="required">*</span></label>
                    <select
                      value={roomFormData.roomType}
                      onChange={(e) => setRoomFormData({ ...roomFormData, roomType: e.target.value })}
                    >
                      {ROOM_TYPES.map(type => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="movie-form__row">
                  <div className="movie-form__group">
                    <label>Số hàng <span className="required">*</span></label>
                    <input
                      type="number"
                      value={roomFormData.rows}
                      onChange={(e) => setRoomFormData({ ...roomFormData, rows: parseInt(e.target.value) || 0 })}
                      min="1"
                      max="26"
                    />
                  </div>
                  <div className="movie-form__group">
                    <label>Số cột <span className="required">*</span></label>
                    <input
                      type="number"
                      value={roomFormData.cols}
                      onChange={(e) => setRoomFormData({ ...roomFormData, cols: parseInt(e.target.value) || 0 })}
                      min="1"
                      max="30"
                    />
                  </div>
                </div>
                {editingRoom && (
                  <div className="movie-form__group">
                    <p className="movie-modal__warning">
                      ⚠️ Thay đổi số hàng/cột sẽ tạo lại toàn bộ layout ghế. Dữ liệu ghế hiện tại sẽ bị mất.
                    </p>
                  </div>
                )}
              </div>
            </div>
            <div className="movie-modal__footer">
              <button className="btn btn--ghost" onClick={() => setShowRoomModal(false)}>
                Hủy
              </button>
              <button className="btn btn--primary" onClick={handleSaveRoom}>
                {editingRoom ? 'Cập nhật' : 'Thêm phòng'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Movie Management Component
function MovieManagement({ movies: initialMoviesList, onMoviesChange }) {
  const [movies, setMovies] = useState(initialMoviesList);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterGenre, setFilterGenre] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'table'
  const [showModal, setShowModal] = useState(false);
  const [editingMovie, setEditingMovie] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    genre: '',
    duration: '',
    releaseDate: '',
    ageRating: '',
    actor: '',
    director: '',
    description: '',
    trailerURL: '',
    poster: '',
    posterFile: null,
    status: 'COMING_SOON'
  });
  const [posterPreview, setPosterPreview] = useState('');

  // Sync with parent movies when they change
  useEffect(() => {
    setMovies(initialMoviesList);
  }, [initialMoviesList]);

  // Update parent when movies change
  useEffect(() => {
    if (onMoviesChange) {
      onMoviesChange(movies);
    }
  }, [movies, onMoviesChange]);

  // Filter movies
  const filteredMovies = movies.filter(movie => {
    const matchesSearch = movie.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         movie.director.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         movie.actor.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesGenre = !filterGenre || movie.genre === filterGenre;
    const matchesStatus = !filterStatus || movie.status === filterStatus;
    return matchesSearch && matchesGenre && matchesStatus;
  });

  // Handle poster file upload
  const handlePosterUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Vui lòng chọn file hình ảnh');
        return;
      }
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Kích thước file không được vượt quá 5MB');
        return;
      }
      
      setFormData({ ...formData, posterFile: file, poster: '' });
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPosterPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Remove poster
  const handleRemovePoster = () => {
    setFormData({ ...formData, posterFile: null, poster: '' });
    setPosterPreview('');
  };

  // Open add movie modal
  const handleAddMovie = () => {
    setEditingMovie(null);
    setFormData({
      title: '',
      genre: '',
      duration: '',
      releaseDate: '',
      ageRating: '',
      actor: '',
      director: '',
      description: '',
      trailerURL: '',
      poster: '',
      posterFile: null,
      status: 'COMING_SOON'
    });
    setPosterPreview('');
    setShowModal(true);
  };

  // Open edit movie modal
  const handleEditMovie = (movie) => {
    setEditingMovie(movie);
    setFormData({
      title: movie.title,
      genre: movie.genre,
      duration: movie.duration.toString(),
      releaseDate: movie.releaseDate,
      ageRating: movie.ageRating,
      actor: movie.actor,
      director: movie.director,
      description: movie.description,
      trailerURL: movie.trailerURL,
      poster: movie.poster,
      posterFile: null,
      status: movie.status
    });
    setPosterPreview(movie.poster || '');
    setShowModal(true);
  };

  // Save movie
  const handleSaveMovie = () => {
    if (!formData.title || !formData.genre || !formData.duration || !formData.releaseDate) {
      alert('Vui lòng điền đầy đủ thông tin bắt buộc');
      return;
    }

    // Use poster file preview if uploaded, otherwise use URL
    const posterUrl = posterPreview || formData.poster;

    const movieData = {
      ...formData,
      duration: parseInt(formData.duration),
      poster: posterUrl,
      posterFile: undefined // Don't save file object
    };

    if (editingMovie) {
      // Update existing movie
      setMovies(movies.map(m => 
        m.movieId === editingMovie.movieId 
          ? { ...m, ...movieData }
          : m
      ));
    } else {
      // Add new movie
      const newMovie = {
        movieId: Math.max(...movies.map(m => m.movieId), 0) + 1,
        ...movieData
      };
      setMovies([...movies, newMovie]);
    }
    setShowModal(false);
    setEditingMovie(null);
    setPosterPreview('');
  };

  // Delete movie
  const handleDeleteMovie = (movieId) => {
    setMovies(movies.filter(m => m.movieId !== movieId));
    setDeleteConfirm(null);
  };

  // Format genre for display
  const formatGenre = (genre) => {
    return genre.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  // Format status for display
  const formatStatus = (status) => {
    const statusMap = {
      'COMING_SOON': 'Sắp chiếu',
      'NOW_SHOWING': 'Đang chiếu',
      'ENDED': 'Đã kết thúc'
    };
    return statusMap[status] || status;
  };

  // Get status badge color
  const getStatusColor = (status) => {
    const colorMap = {
      'COMING_SOON': '#ff9800',
      'NOW_SHOWING': '#4caf50',
      'ENDED': '#9e9e9e'
    };
    return colorMap[status] || '#9e9e9e';
  };

  return (
    <div className="movie-management">
      {/* Header with actions */}
      <div className="movie-management__header">
        <div className="movie-management__filters">
          <div className="movie-search">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/>
              <path d="m21 21-4.35-4.35"/>
            </svg>
            <input
              type="text"
              placeholder="Tìm kiếm phim, đạo diễn, diễn viên..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="movie-search__input"
            />
          </div>
          <select
            value={filterGenre}
            onChange={(e) => setFilterGenre(e.target.value)}
            className="movie-filter"
          >
            <option value="">Tất cả thể loại</option>
            {GENRES.map(genre => (
              <option key={genre} value={genre}>{formatGenre(genre)}</option>
            ))}
          </select>
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="movie-filter"
          >
            <option value="">Tất cả trạng thái</option>
            {MOVIE_STATUSES.map(status => (
              <option key={status} value={status}>{formatStatus(status)}</option>
            ))}
          </select>
        </div>
        <div className="movie-management__actions">
          <div className="view-mode-toggle">
            <button
              className={`view-mode-btn ${viewMode === 'grid' ? 'active' : ''}`}
              onClick={() => setViewMode('grid')}
              title="Xem dạng lưới"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="7" height="7"/>
                <rect x="14" y="3" width="7" height="7"/>
                <rect x="14" y="14" width="7" height="7"/>
                <rect x="3" y="14" width="7" height="7"/>
              </svg>
            </button>
            <button
              className={`view-mode-btn ${viewMode === 'table' ? 'active' : ''}`}
              onClick={() => setViewMode('table')}
              title="Xem dạng bảng"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v18m0 0h10a2 2 0 0 0 2-2V9M9 21H5a2 2 0 0 1-2-2V9m0 0h18"/>
              </svg>
            </button>
          </div>
          <button className="btn btn--primary" onClick={handleAddMovie}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19"/>
              <line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Thêm phim mới
          </button>
        </div>
      </div>

      {/* Movies count */}
      <div className="movie-management__info">
        <span className="movie-count">Tìm thấy {filteredMovies.length} phim</span>
      </div>

      {/* Movies list */}
      {viewMode === 'grid' ? (
        <div className="movie-grid">
          {filteredMovies.map(movie => (
            <div key={movie.movieId} className="movie-card">
              <div className="movie-card__poster">
                <img src={movie.poster || 'https://via.placeholder.com/300x450'} alt={movie.title} />
                <div className="movie-card__overlay">
                  <button
                    className="movie-card__action"
                    onClick={() => handleEditMovie(movie)}
                    title="Chỉnh sửa"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                    </svg>
                  </button>
                  <button
                    className="movie-card__action movie-card__action--delete"
                    onClick={() => setDeleteConfirm(movie)}
                    title="Xóa"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="3 6 5 6 21 6"/>
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                    </svg>
                  </button>
                </div>
                <div className="movie-card__status" style={{ backgroundColor: getStatusColor(movie.status) }}>
                  {formatStatus(movie.status)}
                </div>
              </div>
              <div className="movie-card__content">
                <h3 className="movie-card__title">{movie.title}</h3>
                <div className="movie-card__meta">
                  <span className="movie-card__genre">{formatGenre(movie.genre)}</span>
                  <span className="movie-card__rating">{movie.ageRating}</span>
                  <span className="movie-card__duration">{movie.duration} phút</span>
                </div>
                <div className="movie-card__director">Đạo diễn: {movie.director}</div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="admin-table">
          <table>
            <thead>
              <tr>
                <th>Poster</th>
                <th>Tên phim</th>
                <th>Thể loại</th>
                <th>Đạo diễn</th>
                <th>Thời lượng</th>
                <th>Ngày phát hành</th>
                <th>Trạng thái</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filteredMovies.map(movie => (
                <tr key={movie.movieId}>
                  <td>
                    <img src={movie.poster || 'https://via.placeholder.com/60x90'} alt={movie.title} className="movie-table-poster" />
                  </td>
                  <td>
                    <div className="movie-table-title">{movie.title}</div>
                    <div className="movie-table-rating">{movie.ageRating}</div>
                  </td>
                  <td>{formatGenre(movie.genre)}</td>
                  <td>{movie.director}</td>
                  <td>{movie.duration} phút</td>
                  <td>{new Date(movie.releaseDate).toLocaleDateString('vi-VN')}</td>
                  <td>
                    <span className="movie-status-badge" style={{ backgroundColor: getStatusColor(movie.status) }}>
                      {formatStatus(movie.status)}
                    </span>
                  </td>
                  <td>
                    <div className="movie-table-actions">
                      <button
                        className="movie-action-btn"
                        onClick={() => handleEditMovie(movie)}
                        title="Chỉnh sửa"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                        </svg>
                      </button>
                      <button
                        className="movie-action-btn movie-action-btn--delete"
                        onClick={() => setDeleteConfirm(movie)}
                        title="Xóa"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="3 6 5 6 21 6"/>
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Empty state */}
      {filteredMovies.length === 0 && (
        <div className="movie-empty">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <rect x="2" y="4" width="20" height="16" rx="2"/>
            <path d="M7 4v16M17 4v16M2 8h20M2 12h20M2 16h20"/>
          </svg>
          <p>Không tìm thấy phim nào</p>
        </div>
      )}

      {/* Add/Edit Movie Modal */}
      {showModal && (
        <div className="movie-modal-overlay" onClick={() => {
          setShowModal(false);
          setPosterPreview('');
        }}>
          <div className="movie-modal" onClick={(e) => e.stopPropagation()}>
            <div className="movie-modal__header">
              <h2>{editingMovie ? 'Chỉnh sửa phim' : 'Thêm phim mới'}</h2>
              <button className="movie-modal__close" onClick={() => {
                setShowModal(false);
                setPosterPreview('');
              }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
            <div className="movie-modal__content">
              <div className="movie-form">
                <div className="movie-form__row">
                  <div className="movie-form__group">
                    <label>Tên phim <span className="required">*</span></label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="Nhập tên phim"
                    />
                  </div>
                  <div className="movie-form__group">
                    <label>Thể loại <span className="required">*</span></label>
                    <select
                      value={formData.genre}
                      onChange={(e) => setFormData({ ...formData, genre: e.target.value })}
                    >
                      <option value="">Chọn thể loại</option>
                      {GENRES.map(genre => (
                        <option key={genre} value={genre}>{formatGenre(genre)}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="movie-form__row">
                  <div className="movie-form__group">
                    <label>Thời lượng (phút) <span className="required">*</span></label>
                    <input
                      type="number"
                      value={formData.duration}
                      onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                      placeholder="VD: 120"
                      min="1"
                    />
                  </div>
                  <div className="movie-form__group">
                    <label>Ngày phát hành <span className="required">*</span></label>
                    <input
                      type="date"
                      value={formData.releaseDate}
                      onChange={(e) => setFormData({ ...formData, releaseDate: e.target.value })}
                    />
                  </div>
                </div>
                <div className="movie-form__row">
                  <div className="movie-form__group">
                    <label>Độ tuổi <span className="required">*</span></label>
                    <select
                      value={formData.ageRating}
                      onChange={(e) => setFormData({ ...formData, ageRating: e.target.value })}
                    >
                      <option value="">Chọn độ tuổi</option>
                      {AGE_RATINGS.map(rating => (
                        <option key={rating} value={rating}>{rating}</option>
                      ))}
                    </select>
                  </div>
                  <div className="movie-form__group">
                    <label>Trạng thái <span className="required">*</span></label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    >
                      {MOVIE_STATUSES.map(status => (
                        <option key={status} value={status}>{formatStatus(status)}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="movie-form__group">
                  <label>Đạo diễn <span className="required">*</span></label>
                  <input
                    type="text"
                    value={formData.director}
                    onChange={(e) => setFormData({ ...formData, director: e.target.value })}
                    placeholder="Nhập tên đạo diễn"
                  />
                </div>
                <div className="movie-form__group">
                  <label>Diễn viên <span className="required">*</span></label>
                  <input
                    type="text"
                    value={formData.actor}
                    onChange={(e) => setFormData({ ...formData, actor: e.target.value })}
                    placeholder="Nhập tên diễn viên (phân cách bằng dấu phẩy)"
                  />
                </div>
                <div className="movie-form__group">
                  <label>Mô tả</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Nhập mô tả phim"
                    rows="4"
                  />
                </div>
                <div className="movie-form__group">
                  <label>Poster</label>
                  <div className="movie-poster-upload">
                    <div className="movie-poster-upload__options">
                      <label className="movie-poster-upload__btn">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handlePosterUpload}
                          style={{ display: 'none' }}
                        />
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                          <polyline points="17 8 12 3 7 8"/>
                          <line x1="12" y1="3" x2="12" y2="15"/>
                        </svg>
                        Upload từ máy
                      </label>
                      <span className="movie-poster-upload__or">hoặc</span>
                      <input
                        type="url"
                        value={formData.poster}
                        onChange={(e) => {
                          setFormData({ ...formData, poster: e.target.value, posterFile: null });
                          setPosterPreview(e.target.value);
                        }}
                        placeholder="Nhập URL poster"
                        className="movie-poster-upload__url"
                      />
                    </div>
                    {(posterPreview || formData.poster) && (
                      <div className="movie-poster-upload__preview">
                        <img 
                          src={posterPreview || formData.poster} 
                          alt="Poster preview" 
                          className="movie-form__poster-preview" 
                        />
                        <button
                          type="button"
                          className="movie-poster-upload__remove"
                          onClick={handleRemovePoster}
                          title="Xóa poster"
                        >
                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="18" y1="6" x2="6" y2="18"/>
                            <line x1="6" y1="6" x2="18" y2="18"/>
                          </svg>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                <div className="movie-form__group">
                  <label>URL Trailer (YouTube)</label>
                  <input
                    type="url"
                    value={formData.trailerURL}
                    onChange={(e) => setFormData({ ...formData, trailerURL: e.target.value })}
                    placeholder="https://www.youtube.com/watch?v=..."
                  />
                </div>
              </div>
            </div>
            <div className="movie-modal__footer">
              <button className="btn btn--ghost" onClick={() => {
                setShowModal(false);
                setPosterPreview('');
              }}>
                Hủy
              </button>
              <button className="btn btn--primary" onClick={handleSaveMovie}>
                {editingMovie ? 'Cập nhật' : 'Thêm phim'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="movie-modal-overlay" onClick={() => setDeleteConfirm(null)}>
          <div className="movie-modal movie-modal--confirm" onClick={(e) => e.stopPropagation()}>
            <div className="movie-modal__header">
              <h2>Xác nhận xóa phim</h2>
              <button className="movie-modal__close" onClick={() => setDeleteConfirm(null)}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
            <div className="movie-modal__content">
              <p>Bạn có chắc chắn muốn xóa phim <strong>{deleteConfirm.title}</strong>?</p>
              <p className="movie-modal__warning">Hành động này không thể hoàn tác.</p>
            </div>
            <div className="movie-modal__footer">
              <button className="btn btn--ghost" onClick={() => setDeleteConfirm(null)}>
                Hủy
              </button>
              <button
                className="btn btn--danger"
                onClick={() => handleDeleteMovie(deleteConfirm.movieId)}
              >
                Xóa phim
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminDashboard() {
  const [activeSection, setActiveSection] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [movies, setMovies] = useState(initialMovies);
  const [cinemas, setCinemas] = useState(initialCinemas);

  const getIcon = (iconName) => {
    switch (iconName) {
      case 'money':
        return (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="1" x2="12" y2="23"/>
            <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
          </svg>
        );
      case 'ticket':
        return (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2 9a3 3 0 0 1 3-3h14a3 3 0 0 1 3 3v6a3 3 0 0 1-3 3H5a3 3 0 0 1-3-3V9z"/>
            <path d="M6 9v6M18 9v6"/>
          </svg>
        );
      case 'users':
        return (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
            <circle cx="9" cy="7" r="4"/>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
          </svg>
        );
      case 'film':
        return (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="4" width="20" height="16" rx="2"/>
            <path d="M7 4v16M17 4v16M2 8h20M2 12h20M2 16h20"/>
          </svg>
        );
      default:
        return null;
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <aside className={`admin-sidebar ${sidebarOpen ? 'admin-sidebar--open' : 'admin-sidebar--closed'}`}>
        <div className="admin-sidebar__header">
          <div className="admin-sidebar__logo">
            <svg className="admin-logo__icon" width="32" height="32" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <linearGradient id="adminLogoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#e83b41" stopOpacity="1" />
                  <stop offset="50%" stopColor="#ff5258" stopOpacity="1" />
                  <stop offset="100%" stopColor="#ff6b6b" stopOpacity="1" />
                </linearGradient>
                <filter id="adminLogoGlow">
                  <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                  <feMerge>
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                  </feMerge>
                </filter>
              </defs>
              <circle cx="18" cy="18" r="17" fill="url(#adminLogoGradient)" filter="url(#adminLogoGlow)" opacity="0.9"/>
              <circle cx="18" cy="18" r="14" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5"/>
              <circle cx="18" cy="18" r="10" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="1"/>
              <rect x="8" y="8" width="20" height="20" rx="2" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5"/>
              <path d="M14 14L22 18L14 22V14Z" fill="rgba(255,255,255,0.95)"/>
              <circle cx="10" cy="10" r="1.5" fill="rgba(255,255,255,0.6)"/>
              <circle cx="26" cy="10" r="1.5" fill="rgba(255,255,255,0.6)"/>
              <circle cx="10" cy="26" r="1.5" fill="rgba(255,255,255,0.6)"/>
              <circle cx="26" cy="26" r="1.5" fill="rgba(255,255,255,0.6)"/>
            </svg>
            <span className="admin-logo__text">cinesmart</span>
          </div>
          <button 
            className="admin-sidebar__toggle"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-label="Toggle sidebar"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              {sidebarOpen ? (
                <>
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </>
              ) : (
                <>
                  <line x1="3" y1="12" x2="21" y2="12"/>
                  <line x1="3" y1="6" x2="21" y2="6"/>
                  <line x1="3" y1="18" x2="21" y2="18"/>
                </>
              )}
            </svg>
          </button>
        </div>
        <nav className="admin-sidebar__nav">
          <button
            className={`admin-nav-item ${activeSection === 'dashboard' ? 'admin-nav-item--active' : ''}`}
            onClick={() => setActiveSection('dashboard')}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="7" height="7"/>
              <rect x="14" y="3" width="7" height="7"/>
              <rect x="14" y="14" width="7" height="7"/>
              <rect x="3" y="14" width="7" height="7"/>
            </svg>
            <span>Dashboard</span>
          </button>
          <button
            className={`admin-nav-item ${activeSection === 'movies' ? 'admin-nav-item--active' : ''}`}
            onClick={() => setActiveSection('movies')}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="4" width="20" height="16" rx="2"/>
              <path d="M7 4v16M17 4v16M2 8h20M2 12h20M2 16h20"/>
            </svg>
            <span>Quản lý phim</span>
          </button>
          <button
            className={`admin-nav-item ${activeSection === 'cinemas' ? 'admin-nav-item--active' : ''}`}
            onClick={() => setActiveSection('cinemas')}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
              <circle cx="12" cy="10" r="3"/>
            </svg>
            <span>Quản lý rạp</span>
          </button>
          <button
            className={`admin-nav-item ${activeSection === 'bookings' ? 'admin-nav-item--active' : ''}`}
            onClick={() => setActiveSection('bookings')}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
            </svg>
            <span>Quản lý đặt vé</span>
          </button>
          <button
            className={`admin-nav-item ${activeSection === 'users' ? 'admin-nav-item--active' : ''}`}
            onClick={() => setActiveSection('users')}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
            <span>Quản lý người dùng</span>
          </button>
          <button
            className={`admin-nav-item ${activeSection === 'vouchers' ? 'admin-nav-item--active' : ''}`}
            onClick={() => setActiveSection('vouchers')}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
              <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
              <line x1="12" y1="22.08" x2="12" y2="12"/>
            </svg>
            <span>Quản lý voucher</span>
          </button>
          <button
            className={`admin-nav-item ${activeSection === 'reports' ? 'admin-nav-item--active' : ''}`}
            onClick={() => setActiveSection('reports')}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
              <line x1="16" y1="13" x2="8" y2="13"/>
              <line x1="16" y1="17" x2="8" y2="17"/>
              <polyline points="10 9 9 9 8 9"/>
            </svg>
            <span>Báo cáo</span>
          </button>
        </nav>
        <div className="admin-sidebar__footer">
          <a href="#home" className="admin-nav-item">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
              <polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
            <span>Về trang chủ</span>
          </a>
        </div>
      </aside>

      {/* Main Content */}
      <div className={`admin-main ${!sidebarOpen ? 'admin-main--sidebar-closed' : ''}`}>
        {/* Top Bar */}
        <header className="admin-header">
          <div className="admin-header__left">
            <h1 className="admin-header__title">
              {activeSection === 'dashboard' && 'Dashboard'}
              {activeSection === 'movies' && 'Quản lý phim'}
              {activeSection === 'cinemas' && 'Quản lý rạp'}
              {activeSection === 'bookings' && 'Quản lý đặt vé'}
              {activeSection === 'users' && 'Quản lý người dùng'}
              {activeSection === 'vouchers' && 'Quản lý voucher'}
              {activeSection === 'reports' && 'Báo cáo'}
            </h1>
          </div>
          <div className="admin-header__right">
            <div className="admin-header__user">
              <div className="admin-header__user-info">
                <div className="admin-header__user-name">Admin User</div>
                <div className="admin-header__user-role">Quản trị viên</div>
              </div>
              <div className="admin-header__user-avatar">
                <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="20" cy="20" r="20" fill="#4a3f41"/>
                  <circle cx="20" cy="15" r="8" fill="#e6e1e2"/>
                  <path d="M10 30c0-5.523 4.477-10 10-10s10 4.477 10 10" fill="#e6e1e2"/>
                </svg>
              </div>
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="admin-content">
          {activeSection === 'dashboard' && (
            <div>
              {/* Stats Grid */}
              <div className="admin-stats-grid">
                {stats.map((stat, idx) => (
                  <div key={idx} className="admin-stat-card">
                    <div className="admin-stat-card__icon" style={{ color: stat.color }}>
                      {getIcon(stat.icon)}
                    </div>
                    <div className="admin-stat-card__content">
                      <div className="admin-stat-card__value">{stat.value}</div>
                      <div className="admin-stat-card__label">{stat.label}</div>
                      <div className="admin-stat-card__trend" style={{ color: stat.color }}>
                        {stat.trend}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Recent Bookings & Top Movies */}
              <div className="admin-dashboard-grid">
                <div className="admin-card">
                  <div className="admin-card__header">
                    <h2 className="admin-card__title">Đặt vé gần đây</h2>
                    <button className="admin-card__action">Xem tất cả</button>
                  </div>
                  <div className="admin-card__content">
                    <div className="admin-table">
                      <table>
                        <thead>
                          <tr>
                            <th>Khách hàng</th>
                            <th>Phim</th>
                            <th>Rạp</th>
                            <th>Số tiền</th>
                            <th>Ngày</th>
                          </tr>
                        </thead>
                        <tbody>
                          {recentBookings.map((booking) => (
                            <tr key={booking.id}>
                              <td>{booking.customer}</td>
                              <td>{booking.movie}</td>
                              <td>{booking.cinema}</td>
                              <td>{formatPrice(booking.amount)}</td>
                              <td>{booking.date}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                <div className="admin-card">
                  <div className="admin-card__header">
                    <h2 className="admin-card__title">Phim bán chạy</h2>
                  </div>
                  <div className="admin-card__content">
                    <div className="admin-top-movies">
                      {topMovies.map((movie, idx) => (
                        <div key={movie.id} className="admin-top-movie-item">
                          <div className="admin-top-movie-item__rank">#{idx + 1}</div>
                          <div className="admin-top-movie-item__info">
                            <div className="admin-top-movie-item__title">{movie.title}</div>
                            <div className="admin-top-movie-item__meta">
                              {movie.bookings} vé • {formatPrice(movie.revenue)}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeSection === 'movies' && (
            <MovieManagement movies={movies} onMoviesChange={setMovies} />
          )}

          {activeSection === 'cinemas' && (
            <CinemaManagement cinemas={cinemas} onCinemasChange={setCinemas} />
          )}

          {activeSection === 'bookings' && (
            <div className="admin-card">
              <div className="admin-card__header">
                <h2 className="admin-card__title">Quản lý đặt vé</h2>
              </div>
              <div className="admin-card__content">
                <p style={{ color: '#c9c4c5', textAlign: 'center', padding: '40px' }}>
                  Tính năng quản lý đặt vé đang được phát triển...
                </p>
              </div>
            </div>
          )}

          {activeSection === 'users' && (
            <div className="admin-card">
              <div className="admin-card__header">
                <h2 className="admin-card__title">Quản lý người dùng</h2>
              </div>
              <div className="admin-card__content">
                <p style={{ color: '#c9c4c5', textAlign: 'center', padding: '40px' }}>
                  Tính năng quản lý người dùng đang được phát triển...
                </p>
              </div>
            </div>
          )}

          {activeSection === 'vouchers' && (
            <div className="admin-card">
              <div className="admin-card__header">
                <h2 className="admin-card__title">Quản lý voucher</h2>
                <button className="btn btn--primary">Tạo voucher mới</button>
              </div>
              <div className="admin-card__content">
                <p style={{ color: '#c9c4c5', textAlign: 'center', padding: '40px' }}>
                  Tính năng quản lý voucher đang được phát triển...
                </p>
              </div>
            </div>
          )}

          {activeSection === 'reports' && (
            <div className="admin-card">
              <div className="admin-card__header">
                <h2 className="admin-card__title">Báo cáo</h2>
              </div>
              <div className="admin-card__content">
                <p style={{ color: '#c9c4c5', textAlign: 'center', padding: '40px' }}>
                  Tính năng báo cáo đang được phát triển...
                </p>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

