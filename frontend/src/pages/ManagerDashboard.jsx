import React, { useMemo, useState, useEffect } from 'react';

// Manager Dashboard focuses on cinemas within the manager's complexes only.
// It provides full-featured cinema management (rooms, interactive seat layout).

// Local copy of generateSeats to build demo data identical to admin
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

// Movies sample used when creating showtimes (id + duration)
const SAMPLE_MOVIES = [
  { movieId: 1, title: 'Inception', duration: 148, formats: ['2D','3D'], languages: ['VIETSUB','VIETNAMESE_DUB'] },
  { movieId: 2, title: 'Interstellar', duration: 169, formats: ['2D'], languages: ['VIETSUB'] },
  { movieId: 3, title: 'The Dark Knight', duration: 152, formats: ['2D'], languages: ['VIETSUB'] },
  { movieId: 4, title: 'Drive My Car', duration: 179, formats: ['2D'], languages: ['VIETSUB'] }
];

// Same sample with a couple of complexes; manager will be filtered against these IDs
const SAMPLE_CINEMAS = [
  {
    complexId: 1,
    name: 'Cinestar Quốc Thanh',
    address: '271 Nguyễn Trãi, Quận 1, TP.HCM',
    rooms: [
      { roomId: 1, roomName: 'Phòng 1', roomType: '2D', rows: 10, cols: 12, seats: generateSeats(10, 12), showtimes: [] },
      { roomId: 2, roomName: 'Phòng 2', roomType: '3D', rows: 8, cols: 14, seats: generateSeats(8, 14), showtimes: [] }
    ]
  },
  {
    complexId: 2,
    name: 'Cinestar Hai Bà Trưng',
    address: '135 Hai Bà Trưng, Quận 1, TP.HCM',
    rooms: [
      { roomId: 3, roomName: 'Phòng 1', roomType: '2D', rows: 12, cols: 15, seats: generateSeats(12, 15), showtimes: [] }
    ]
  },
  {
    complexId: 3,
    name: 'Cinestar Satra Q6',
    address: 'C6/27 Phạm Hùng, Bình Chánh, TP.HCM',
    rooms: [
      { roomId: 4, roomName: 'Phòng 1', roomType: 'DELUXE', rows: 9, cols: 16, seats: generateSeats(9, 16), showtimes: [] }
    ]
  }
];

// Full Cinema Management (copied and adapted from Admin) scoped for manager
function ManagerCinemaManagement({ cinemas: initialCinemasList, onCinemasChange }) {
  const [cinemas, setCinemas] = useState(initialCinemasList);
  const [selectedCinema, setSelectedCinema] = useState(initialCinemasList[0] || null);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [showCinemaModal, setShowCinemaModal] = useState(false);
  const [showRoomModal, setShowRoomModal] = useState(false);
  const [showShowtimeModal, setShowShowtimeModal] = useState(false);
  const [editingCinema, setEditingCinema] = useState(null);
  const [editingRoom, setEditingRoom] = useState(null);
  const [editingShowtime, setEditingShowtime] = useState(null);
  const [cinemaFormData, setCinemaFormData] = useState({
    name: '',
    addressDescription: '',
    addressProvince: 'Hồ Chí Minh'
  });
  const [roomFormData, setRoomFormData] = useState({
    roomName: '',
    roomType: '2D',
    rows: 10,
    cols: 12
  });
  const [showtimeForm, setShowtimeForm] = useState({
    movieId: '',
    date: '',
    startTime: '',
    price: 120000,
    language: 'Phụ đề',
    format: '2D'
  });

  useEffect(() => {
    onCinemasChange && onCinemasChange(cinemas);
  }, [cinemas, onCinemasChange]);

  useEffect(() => {
    setCinemas(initialCinemasList);
    if (initialCinemasList?.length) {
      setSelectedCinema(initialCinemasList[0]);
    }
  }, [initialCinemasList]);

  const handleAddCinema = () => {
    setEditingCinema(null);
    setCinemaFormData({ name: '', address: '' });
    setShowCinemaModal(true);
  };

  const handleEditCinema = (cinema) => {
    setEditingCinema(cinema);
    const parts = (cinema.address || '').split(',');
    const province = parts.length > 0 ? parts[parts.length - 1].trim() : 'Hồ Chí Minh';
    const description = parts.slice(0, -1).join(',').trim();
    setCinemaFormData({ name: cinema.name, addressDescription: description, addressProvince: province || 'Hồ Chí Minh' });
    setShowCinemaModal(true);
  };

  const handleSaveCinema = () => {
    if (!cinemaFormData.name || !cinemaFormData.address) {
      // backward compat no-op
    }
    if (!cinemaFormData.name || !cinemaFormData.addressDescription || !cinemaFormData.addressProvince) {
      alert('Vui lòng điền đầy đủ thông tin');
      return;
    }
    const composedAddress = `${cinemaFormData.addressDescription}, ${cinemaFormData.addressProvince}`;
    if (editingCinema) {
      setCinemas(cinemas.map(c =>
        c.complexId === editingCinema.complexId ? { ...c, ...cinemaFormData } : c
      ));
      setCinemas(prev => prev.map(c =>
        c.complexId === editingCinema.complexId ? { ...c, name: cinemaFormData.name, address: composedAddress } : c
      ));
    } else {
      const newCinema = {
        complexId: Math.max(...cinemas.map(c => c.complexId), 0) + 1,
        name: cinemaFormData.name,
        address: composedAddress,
        rooms: []
      };
      setCinemas([...cinemas, newCinema]);
    }
    setShowCinemaModal(false);
    setEditingCinema(null);
  };

  const handleDeleteCinema = (complexId) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa rạp này? Tất cả phòng chiếu sẽ bị xóa.')) {
      const updated = cinemas.filter(c => c.complexId !== complexId);
      setCinemas(updated);
      if (selectedCinema?.complexId === complexId) {
        setSelectedCinema(updated[0] || null);
        setSelectedRoom(null);
      }
    }
  };

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

  const openShowtimes = (cinema, room) => {
    setSelectedCinema(cinema);
    setSelectedRoom(room);
    setEditingShowtime(null);
    setShowtimeForm({
      movieId: '',
      date: new Date().toISOString().slice(0,10),
      startTime: '',
      price: 120000,
      language: 'Phụ đề',
      format: room.roomType || '2D'
    });
    setShowShowtimeModal(true);
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
      cinema.rooms = cinema.rooms.map(r =>
        r.roomId === editingRoom.roomId
          ? {
              ...r,
              roomName: roomFormData.roomName,
              roomType: roomFormData.roomType,
              rows: roomFormData.rows,
              cols: roomFormData.cols,
              seats: r.rows === roomFormData.rows && r.cols === roomFormData.cols
                ? r.seats
                : generateSeats(roomFormData.rows, roomFormData.cols)
            }
          : r
      );
    } else {
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

  // Showtime management
  const computeEndTime = (date, startTime, movieId) => {
    const movie = SAMPLE_MOVIES.find(m => m.movieId === Number(movieId));
    const duration = movie ? movie.duration : 0;
    const start = new Date(`${date}T${startTime}:00`);
    const end = new Date(start.getTime() + duration * 60000 + 15 * 60000);
    return end.toTimeString().slice(0,5);
  };

  const hasOverlap = (list, date, startTime, endTime, editingId) => {
    const s = new Date(`${date}T${startTime}:00`).getTime();
    const e = new Date(`${date}T${endTime}:00`).getTime();
    return (list || []).some(st => {
      if (editingId && st.showtimeId === editingId) return false;
      if (st.date !== date) return false;
      const ss = new Date(`${st.date}T${st.startTime}:00`).getTime();
      const ee = new Date(`${st.date}T${st.endTime}:00`).getTime();
      return Math.max(s, ss) < Math.min(e, ee);
    });
  };

  const handleSaveShowtime = () => {
    if (!selectedCinema || !selectedRoom) return;
    if (!showtimeForm.movieId || !showtimeForm.date || !showtimeForm.startTime) {
      alert('Vui lòng chọn phim, ngày và giờ bắt đầu');
      return;
    }
    const endTime = computeEndTime(showtimeForm.date, showtimeForm.startTime, showtimeForm.movieId);
    const cinemaIndex = cinemas.findIndex(c => c.complexId === selectedCinema.complexId);
    const roomIndex = cinemas[cinemaIndex].rooms.findIndex(r => r.roomId === selectedRoom.roomId);
    const updated = [...cinemas];
    const room = { ...updated[cinemaIndex].rooms[roomIndex] };
    const current = room.showtimes || [];
    if (hasOverlap(current, showtimeForm.date, showtimeForm.startTime, endTime, editingShowtime?.showtimeId)) {
      alert('Khung giờ trùng với lịch chiếu hiện có (đã tính buffer 15 phút).');
      return;
    }
    if (editingShowtime) {
      room.showtimes = current.map(st =>
        st.showtimeId === editingShowtime.showtimeId
          ? { ...st, ...showtimeForm, movieId: Number(showtimeForm.movieId), endTime }
          : st
      );
    } else {
      const nextId = Math.max(0, ...current.map(s => s.showtimeId || 0)) + 1;
      room.showtimes = [
        ...current,
        {
          showtimeId: nextId,
          roomId: room.roomId,
          cinemaId: selectedCinema.complexId,
          movieId: Number(showtimeForm.movieId),
          date: showtimeForm.date,
          startTime: showtimeForm.startTime,
          endTime,
          price: Number(showtimeForm.price) || 0,
          language: showtimeForm.language,
          format: showtimeForm.format
        }
      ];
    }
    updated[cinemaIndex].rooms[roomIndex] = room;
    setCinemas(updated);
    setSelectedRoom(room);
    setEditingShowtime(null);
    setShowtimeForm({
      movieId: '',
      date: showtimeForm.date,
      startTime: '',
      price: 120000,
      language: 'Phụ đề',
      format: room.roomType || '2D'
    });
  };

  const handleEditShowtime = (st) => {
    setEditingShowtime(st);
    setShowtimeForm({
      movieId: String(st.movieId),
      date: st.date,
      startTime: st.startTime,
      price: st.price,
      language: st.language || 'Phụ đề',
      format: st.format || (selectedRoom?.roomType || '2D')
    });
  };

  const handleDeleteShowtime = (stId) => {
    if (!selectedCinema || !selectedRoom) return;
    if (!window.confirm('Xóa lịch chiếu này?')) return;
    const cinemaIndex = cinemas.findIndex(c => c.complexId === selectedCinema.complexId);
    const roomIndex = cinemas[cinemaIndex].rooms.findIndex(r => r.roomId === selectedRoom.roomId);
    const updated = [...cinemas];
    const room = { ...updated[cinemaIndex].rooms[roomIndex] };
    room.showtimes = (room.showtimes || []).filter(s => s.showtimeId !== stId);
    updated[cinemaIndex].rooms[roomIndex] = room;
    setCinemas(updated);
    setSelectedRoom(room);
    if (editingShowtime?.showtimeId === stId) setEditingShowtime(null);
  };

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
    const SEAT_TYPES = ['NORMAL', 'VIP', 'COUPLE'];
    const currentSeat = updatedRoom.seats.find(s => s.seatId === seatId);
    if (currentSeat) {
      const currentIndex = SEAT_TYPES.indexOf(currentSeat.type);
      const nextIndex = (currentIndex + 1) % SEAT_TYPES.length;
      const newType = SEAT_TYPES[nextIndex];
      updatedRoom.seats = updatedRoom.seats.map(s =>
        s.seatId === seatId ? { ...s, type: newType } : s
      );
      updatedRooms[roomIndex] = updatedRoom;
      updatedCinema.rooms = updatedRooms;
      updatedCinemas[cinemaIndex] = updatedCinema;
      setCinemas(updatedCinemas);
      setSelectedRoom(updatedRoom);
    }
  };

  const getSeatColor = (type) => {
    const colorMap = { 'NORMAL': '#4a90e2', 'VIP': '#ffd159', 'COUPLE': '#e83b41' };
    return colorMap[type] || '#4a90e2';
  };

  const renderSeatLayout = (room) => {
    if (!room || !room.seats) return null;
    const seatsByRow = {};
    room.seats.forEach(seat => {
      if (!seatsByRow[seat.row]) seatsByRow[seat.row] = [];
      seatsByRow[seat.row].push(seat);
    });
    const sortedRows = Object.keys(seatsByRow).sort();
    const walkwayPositions = new Set();
    for (let col = 5; col <= room.cols; col += 5) walkwayPositions.add(col);
    if (room.cols > 10) {
      const middle = Math.floor(room.cols / 2);
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
            if (walkwayPositions.has(col)) { hasWalkway = true; break; }
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
                    <button className="cinema-action-btn" onClick={() => handleEditCinema(cinema)} title="Chỉnh sửa">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                      </svg>
                    </button>
                    <button className="cinema-action-btn cinema-action-btn--delete" onClick={() => handleDeleteCinema(cinema.complexId)} title="Xóa">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="3 6 5 6 21 6"/>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                      </svg>
                    </button>
                    <button className="btn btn--ghost btn--small" onClick={() => handleAddRoom(cinema)}>
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
                              className="btn btn--ghost btn--small"
                              onClick={() => openShowtimes(cinema, room)}
                            >
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <rect x="3" y="4" width="18" height="18" rx="2"/>
                                <line x1="3" y1="10" x2="21" y2="10"/>
                                <line x1="8" y1="2" x2="8" y2="6"/>
                                <line x1="16" y1="2" x2="16" y2="6"/>
                              </svg>
                              Lịch chiếu
                            </button>
                            <button
                              className="cinema-action-btn"
                              onClick={() => { setSelectedRoom(room); setSelectedCinema(cinema); }}
                              title="Xem layout ghế"
                            >
                              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <rect x="3" y="3" width="18" height="18" rx="2"/>
                                <path d="M9 9h6v6H9z"/>
                              </svg>
                            </button>
                            <button className="cinema-action-btn" onClick={() => handleEditRoom(cinema, room)} title="Chỉnh sửa">
                              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                              </svg>
                            </button>
                            <button className="cinema-action-btn cinema-action-btn--delete" onClick={() => handleDeleteRoom(cinema, room.roomId)} title="Xóa">
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

      {/* Showtime Modal */}
      {showShowtimeModal && selectedRoom && (
        <div className="movie-modal-overlay" onClick={() => setShowShowtimeModal(false)}>
          <div className="movie-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '920px' }}>
            <div className="movie-modal__header">
              <h2>Lịch chiếu - {selectedRoom.roomName} • {selectedCinema?.name}</h2>
              <button className="movie-modal__close" onClick={() => setShowShowtimeModal(false)}>
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
                    <label>Phim <span className="required">*</span></label>
                    <select
                      value={showtimeForm.movieId}
                      onChange={(e) => setShowtimeForm({ ...showtimeForm, movieId: e.target.value })}
                    >
                      <option value="">Chọn phim</option>
                      {SAMPLE_MOVIES.map(m => (
                        <option key={m.movieId} value={m.movieId}>
                          {m.title} • {m.duration} phút
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="movie-form__group">
                    <label>Ngày <span className="required">*</span></label>
                    <input
                      type="date"
                      value={showtimeForm.date}
                      onChange={(e) => setShowtimeForm({ ...showtimeForm, date: e.target.value })}
                    />
                  </div>
                  <div className="movie-form__group">
                    <label>Giờ bắt đầu <span className="required">*</span></label>
                    <input
                      type="time"
                      value={showtimeForm.startTime}
                      onChange={(e) => setShowtimeForm({ ...showtimeForm, startTime: e.target.value })}
                    />
                  </div>
                </div>
                <div className="movie-form__row">
                  <div className="movie-form__group">
                    <label>Giá vé</label>
                    <input
                      type="number"
                      value={showtimeForm.price}
                      onChange={(e) => setShowtimeForm({ ...showtimeForm, price: parseInt(e.target.value) || 0 })}
                      min="0"
                      step="1000"
                    />
                  </div>
                  <div className="movie-form__group">
                    <label>Ngôn ngữ</label>
                    <select
                      value={showtimeForm.language}
                      onChange={(e) => setShowtimeForm({ ...showtimeForm, language: e.target.value })}
                    >
                      {(() => {
                        const mv = SAMPLE_MOVIES.find(m => String(m.movieId) === String(showtimeForm.movieId));
                        const langs = mv?.languages || ['VIETSUB','VIETNAMESE_DUB','VIETNAMESE'];
                        return langs.map(l => <option key={l} value={l}>{l}</option>);
                      })()}
                    </select>
                  </div>
                  <div className="movie-form__group">
                    <label>Định dạng</label>
                    <select
                      value={showtimeForm.format}
                      onChange={(e) => setShowtimeForm({ ...showtimeForm, format: e.target.value })}
                    >
                      {(() => {
                        const mv = SAMPLE_MOVIES.find(m => String(m.movieId) === String(showtimeForm.movieId));
                        const fmts = mv?.formats || ['2D','3D','DELUXE'];
                        return fmts.map(f => <option key={f} value={f}>{f}</option>);
                      })()}
                    </select>
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                  {editingShowtime && (
                    <button className="btn btn--ghost" onClick={() => { setEditingShowtime(null); }}>
                      Hủy sửa
                    </button>
                  )}
                  <button className="btn btn--primary" onClick={handleSaveShowtime}>
                    {editingShowtime ? 'Lưu thay đổi' : 'Thêm lịch chiếu'}
                  </button>
                </div>
              </div>

              <div className="admin-table" style={{ marginTop: '16px' }}>
                <table>
                  <thead>
                    <tr>
                      <th>Phim</th>
                      <th>Ngày</th>
                      <th>Bắt đầu</th>
                      <th>Kết thúc</th>
                      <th>Ngôn ngữ</th>
                      <th>Định dạng</th>
                      <th>Giá</th>
                      <th>Thao tác</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(selectedRoom.showtimes || []).length === 0 ? (
                      <tr>
                        <td colSpan="8" style={{ textAlign: 'center', color: '#c9c4c5' }}>
                          Chưa có lịch chiếu cho phòng này
                        </td>
                      </tr>
                    ) : (
                      (selectedRoom.showtimes || [])
                        .slice()
                        .sort((a, b) => (a.date + a.startTime).localeCompare(b.date + b.startTime))
                        .map(st => {
                          const mv = SAMPLE_MOVIES.find(m => m.movieId === st.movieId);
                          return (
                            <tr key={st.showtimeId}>
                              <td>{mv ? mv.title : `#${st.movieId}`}</td>
                              <td>{st.date}</td>
                              <td>{st.startTime}</td>
                              <td>{st.endTime}</td>
                              <td>{st.language}</td>
                              <td>{st.format}</td>
                              <td>{new Intl.NumberFormat('vi-VN').format(st.price)}đ</td>
                              <td>
                                <div className="movie-table-actions">
                                  <button className="movie-action-btn" onClick={() => handleEditShowtime(st)} title="Sửa">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                                    </svg>
                                  </button>
                                  <button className="movie-action-btn movie-action-btn--delete" onClick={() => handleDeleteShowtime(st.showtimeId)} title="Xóa">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                      <polyline points="3 6 5 6 21 6"/>
                                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                                    </svg>
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })
                    )}
                  </tbody>
                </table>
              </div>
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
                  <label>Địa chỉ - Mô tả <span className="required">*</span></label>
                  <input
                    type="text"
                    value={cinemaFormData.addressDescription}
                    onChange={(e) => setCinemaFormData({ ...cinemaFormData, addressDescription: e.target.value })}
                    placeholder="Số nhà, đường, phường/xã, quận/huyện"
                  />
                </div>
                <div className="movie-form__group">
                  <label>Tỉnh/Thành phố <span className="required">*</span></label>
                  <select
                    value={cinemaFormData.addressProvince}
                    onChange={(e) => setCinemaFormData({ ...cinemaFormData, addressProvince: e.target.value })}
                  >
                    {['Hồ Chí Minh','Hà Nội','Đà Nẵng','Cần Thơ','Hải Phòng','An Giang','Bà Rịa - Vũng Tàu','Bắc Giang','Bắc Kạn','Bạc Liêu','Bắc Ninh','Bến Tre','Bình Định','Bình Dương','Bình Phước','Bình Thuận','Cà Mau','Cao Bằng','Đắk Lắk','Đắk Nông','Điện Biên','Đồng Nai','Đồng Tháp','Gia Lai','Hà Giang','Hà Nam','Hà Tĩnh','Hải Dương','Hậu Giang','Hòa Bình','Hưng Yên','Khánh Hòa','Kiên Giang','Kon Tum','Lai Châu','Lâm Đồng','Lạng Sơn','Lào Cai','Long An','Nam Định','Nghệ An','Ninh Bình','Ninh Thuận','Phú Thọ','Phú Yên','Quảng Bình','Quảng Nam','Quảng Ngãi','Quảng Ninh','Quảng Trị','Sóc Trăng','Sơn La','Tây Ninh','Thái Bình','Thái Nguyên','Thanh Hóa','Thừa Thiên Huế','Tiền Giang','Trà Vinh','Tuyên Quang','Vĩnh Long','Vĩnh Phúc','Yên Bái'].map(p => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
            <div className="movie-modal__footer">
              <button className="btn btn--ghost" onClick={() => setShowCinemaModal(false)}>Hủy</button>
              <button className="btn btn--primary" onClick={handleSaveCinema}>{editingCinema ? 'Cập nhật' : 'Thêm rạp'}</button>
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
                      {['2D','3D','DELUXE'].map(type => (
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
                    <p className="movie-modal__warning">⚠️ Thay đổi số hàng/cột sẽ tạo lại toàn bộ layout ghế.</p>
                  </div>
                )}
              </div>
            </div>
            <div className="movie-modal__footer">
              <button className="btn btn--ghost" onClick={() => setShowRoomModal(false)}>Hủy</button>
              <button className="btn btn--primary" onClick={handleSaveRoom}>{editingRoom ? 'Cập nhật' : 'Thêm phòng'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ManagerDashboard() {
  // Determine which complexes the manager controls.
  // Priority: URL search param ?complexIds=1,2 then localStorage, else [1]
  const urlParams = new URLSearchParams(window.location.search);
  const fromQuery = urlParams.get('complexIds');
  const fallback = (typeof window !== 'undefined' && window.localStorage.getItem('managerComplexIds')) || '';
  const parsedIds = (fromQuery || fallback)
    .split(',')
    .map(s => parseInt(s.trim(), 10))
    .filter(n => Number.isFinite(n));
  const managerComplexIds = parsedIds.length > 0 ? parsedIds : [1];

  const scopedCinemas = useMemo(
    () => SAMPLE_CINEMAS.filter(c => managerComplexIds.includes(c.complexId)),
    [managerComplexIds]
  );

  // Minimal in-component state; we only expose cinemas section for managers
  const [activeSection, setActiveSection] = useState('cinemas');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [cinemas, setCinemas] = useState(scopedCinemas);

  return (
    <div className="admin-layout">
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
            className={`admin-nav-item ${activeSection === 'cinemas' ? 'admin-nav-item--active' : ''}`}
            onClick={() => setActiveSection('cinemas')}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
              <circle cx="12" cy="10" r="3"/>
            </svg>
            <span>Quản lý cụm rạp</span>
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

      <div className={`admin-main ${!sidebarOpen ? 'admin-main--sidebar-closed' : ''}`}>
        <header className="admin-header">
          <div className="admin-header__left">
            <h1 className="admin-header__title">Manager</h1>
          </div>
          <div className="admin-header__right">
            <div className="admin-header__user">
              <div className="admin-header__user-info">
                <div className="admin-header__user-name">Manager User</div>
                <div className="admin-header__user-role">Quản lý cụm rạp</div>
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

        <main className="admin-content">
          {activeSection === 'cinemas' && (
            <ManagerCinemaManagement cinemas={cinemas} onCinemasChange={setCinemas} />
          )}
        </main>
      </div>
    </div>
  );
}


