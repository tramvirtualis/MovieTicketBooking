import React, { useMemo, useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

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

// Full movies data for viewing
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
    status: 'NOW_SHOWING',
    languages: ['VIETSUB', 'VIETNAMESE_DUB'],
    formats: ['2D', '3D']
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
    status: 'NOW_SHOWING',
    languages: ['VIETSUB'],
    formats: ['2D']
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
    status: 'NOW_SHOWING',
    languages: ['VIETSUB'],
    formats: ['2D']
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
    status: 'NOW_SHOWING',
    languages: ['VIETSUB'],
    formats: ['2D']
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
    status: 'COMING_SOON',
    languages: ['VIETSUB'],
    formats: ['2D']
  },
];

// Sample bookings for booking management (will be filtered by managerComplexIds)
const initialBookingOrders = [
  {
    bookingId: 1001,
    user: { name: 'Nguyễn Văn A', email: 'a@example.com', phone: '0909000001' },
    movieId: 1,
    movieTitle: 'Inception',
    cinemaComplexId: 1,
    cinemaName: 'Cinestar Quốc Thanh',
    roomId: 1,
    roomName: 'Phòng 1',
    showtime: '2025-11-11T19:30:00',
    seats: ['E7', 'E8'],
    pricePerSeat: 120000,
    totalAmount: 240000,
    status: 'PAID',
    paymentMethod: 'VNPAY'
  },
  {
    bookingId: 1002,
    user: { name: 'Trần Thị B', email: 'b@example.com', phone: '0909000002' },
    movieId: 2,
    movieTitle: 'Interstellar',
    cinemaComplexId: 2,
    cinemaName: 'Cinestar Hai Bà Trưng',
    roomId: 3,
    roomName: 'Phòng 1',
    showtime: '2025-11-12T21:00:00',
    seats: ['B5'],
    pricePerSeat: 180000,
    totalAmount: 180000,
    status: 'PAID',
    paymentMethod: 'MOMO'
  },
  {
    bookingId: 1004,
    user: { name: 'Phạm Thị D', email: 'd@example.com', phone: '0909000004' },
    movieId: 4,
    movieTitle: 'Drive My Car',
    cinemaComplexId: 1,
    cinemaName: 'Cinestar Quốc Thanh',
    roomId: 1,
    roomName: 'Phòng 1',
    showtime: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    seats: ['F5', 'F6'],
    pricePerSeat: 120000,
    totalAmount: 240000,
    status: 'PAID',
    paymentMethod: 'VNPAY'
  },
  {
    bookingId: 1005,
    user: { name: 'Hoàng Văn E', email: 'e@example.com', phone: '0909000005' },
    movieId: 1,
    movieTitle: 'Inception',
    cinemaComplexId: 2,
    cinemaName: 'Cinestar Hai Bà Trưng',
    roomId: 3,
    roomName: 'Phòng 1',
    showtime: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    seats: ['C3', 'C4', 'C5'],
    pricePerSeat: 180000,
    totalAmount: 540000,
    status: 'PAID',
    paymentMethod: 'MOMO'
  },
];

// Sample price table: price by RoomType x SeatType
const initialPrices = [
  { id: 1, roomType: '2D', seatType: 'NORMAL', price: 90000 },
  { id: 2, roomType: '2D', seatType: 'VIP', price: 120000 },
  { id: 3, roomType: '2D', seatType: 'COUPLE', price: 200000 },
  { id: 4, roomType: '3D', seatType: 'NORMAL', price: 120000 },
  { id: 5, roomType: '3D', seatType: 'VIP', price: 150000 },
  { id: 6, roomType: 'DELUXE', seatType: 'VIP', price: 180000 }
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
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', padding: '16px', borderTop: '1px solid #2a2729' }}>
              <button className="btn btn--ghost" onClick={() => setSelectedRoom(null)}>
                Đóng
              </button>
              <button className="btn btn--primary" onClick={() => setSelectedRoom(null)}>
                Lưu thay đổi
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Showtime Modal */}
      {showShowtimeModal && selectedRoom && (
        <div className="movie-modal-overlay" onClick={() => { setShowShowtimeModal(false); setSelectedRoom(null); }}>
          <div className="movie-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '920px' }}>
            <div className="movie-modal__header">
              <h2>Lịch chiếu - {selectedRoom.roomName} • {selectedCinema?.name}</h2>
              <button className="movie-modal__close" onClick={() => { setShowShowtimeModal(false); setSelectedRoom(null); }}>
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

// Manager Dashboard View Component (read-only stats)
function ManagerDashboardView({ orders, movies, cinemas, managerComplexIds }) {
  const scopedOrders = useMemo(() => {
    return (orders || []).filter(order => managerComplexIds.includes(order.cinemaComplexId));
  }, [orders, managerComplexIds]);

  const stats = useMemo(() => {
    const totalRevenue = scopedOrders
      .filter(o => o.status === 'PAID')
      .reduce((sum, order) => sum + (order.totalAmount || 0), 0);
    const totalTickets = scopedOrders
      .filter(o => o.status === 'PAID')
      .reduce((sum, order) => sum + (order.seats?.length || 0), 0);
    const activeMovies = (movies || []).filter(m => m.status === 'NOW_SHOWING').length;
    const totalBookings = scopedOrders.length;

    return [
      { label: 'Tổng doanh thu', value: new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(totalRevenue), icon: 'money', color: '#4caf50' },
      { label: 'Tổng vé bán', value: totalTickets.toString(), icon: 'ticket', color: '#2196f3' },
      { label: 'Phim đang chiếu', value: activeMovies.toString(), icon: 'film', color: '#ff9800' },
      { label: 'Tổng đơn đặt', value: totalBookings.toString(), icon: 'bookings', color: '#e83b41' },
    ];
  }, [scopedOrders, movies]);

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
      case 'film':
        return (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="4" width="20" height="16" rx="2"/>
            <path d="M7 4v16M17 4v16M2 8h20M2 12h20M2 16h20"/>
          </svg>
        );
      case 'bookings':
        return (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
            <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
          </svg>
        );
      default:
        return null;
    }
  };

  const recentBookings = useMemo(() => {
    return scopedOrders
      .filter(o => o.status === 'PAID')
      .slice(0, 5)
      .map(order => ({
        id: order.bookingId,
        customer: order.user?.name || 'Unknown',
        movie: order.movieTitle,
        cinema: order.cinemaName,
        amount: order.totalAmount,
        date: new Date(order.showtime).toLocaleString('vi-VN')
      }));
  }, [scopedOrders]);

  return (
    <div>
      <div className="admin-stats-grid">
        {stats.map((stat, idx) => (
          <div key={idx} className="admin-stat-card">
            <div className="admin-stat-card__icon" style={{ color: stat.color }}>
              {getIcon(stat.icon)}
            </div>
            <div className="admin-stat-card__content">
              <div className="admin-stat-card__value">{stat.value}</div>
              <div className="admin-stat-card__label">{stat.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="admin-dashboard-grid">
        <div className="admin-card">
          <div className="admin-card__header">
            <h2 className="admin-card__title">Đặt vé gần đây</h2>
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
                  {recentBookings.length > 0 ? (
                    recentBookings.map((booking) => (
                      <tr key={booking.id}>
                        <td>{booking.customer}</td>
                        <td>{booking.movie}</td>
                        <td>{booking.cinema}</td>
                        <td>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(booking.amount)}</td>
                        <td>{booking.date}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="5" style={{ textAlign: 'center', color: '#c9c4c5', padding: '20px' }}>
                        Không có dữ liệu
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Manager Movie View Component (read-only)
function ManagerMovieView({ movies }) {
  return (
    <div className="admin-card">
      <div className="admin-card__header">
        <h2 className="admin-card__title">Danh sách phim</h2>
      </div>
      <div className="admin-card__content">
        <div className="admin-table">
          <table>
            <thead>
              <tr>
                <th>Poster</th>
                <th>Tên phim</th>
                <th>Thể loại</th>
                <th>Thời lượng</th>
                <th>Độ tuổi</th>
                <th>Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {(movies || []).map((movie) => (
                <tr key={movie.movieId}>
                  <td>
                    <img src={movie.poster} alt={movie.title} style={{ width: '60px', height: '90px', objectFit: 'cover', borderRadius: '4px' }} />
                  </td>
                  <td>{movie.title}</td>
                  <td>{movie.genre}</td>
                  <td>{movie.duration} phút</td>
                  <td>{movie.ageRating}</td>
                  <td>
                    <span className="movie-status-badge" style={{ 
                      backgroundColor: movie.status === 'NOW_SHOWING' ? '#4caf50' : movie.status === 'COMING_SOON' ? '#ff9800' : '#9e9e9e'
                    }}>
                      {movie.status === 'NOW_SHOWING' ? 'Đang chiếu' : movie.status === 'COMING_SOON' ? 'Sắp chiếu' : 'Đã kết thúc'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// Manager Price View Component (read-only)
function ManagerPriceView({ prices }) {
  const ROOM_TYPES = ['2D', '3D', 'DELUXE'];
  const SEAT_TYPES = ['NORMAL', 'VIP', 'COUPLE'];

  const formatCurrency = (v) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(v);

  return (
    <div className="admin-card">
      <div className="admin-card__header">
        <h2 className="admin-card__title">Bảng giá</h2>
      </div>
      <div className="admin-card__content">
        <div className="admin-table" style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={{ padding: '16px', textAlign: 'left', borderBottom: '2px solid rgba(255,255,255,0.1)' }}>
                  Loại ghế / Loại phòng
                </th>
                {ROOM_TYPES.map(rt => (
                  <th key={rt} style={{ padding: '16px', textAlign: 'center', borderBottom: '2px solid rgba(255,255,255,0.1)' }}>
                    {rt}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {SEAT_TYPES.map(st => (
                <tr key={st}>
                  <td style={{ padding: '16px', fontWeight: '600', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                    {st}
                  </td>
                  {ROOM_TYPES.map(rt => {
                    const price = (prices || []).find(p => p.roomType === rt && p.seatType === st);
                    return (
                      <td key={`${rt}-${st}`} style={{ padding: '16px', textAlign: 'center', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                        {price ? formatCurrency(price.price) : '-'}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// Manager Booking Management Component (filtered by managerComplexIds)
function ManagerBookingManagement({ orders: initialOrders, cinemas, movies, managerComplexIds }) {
  const [orders] = useState(initialOrders);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCinema, setFilterCinema] = useState('');
  const [filterMovie, setFilterMovie] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [sortField, setSortField] = useState('bookingId');
  const [sortOrder, setSortOrder] = useState('asc');
  const [selected, setSelected] = useState(null);

  const scopedCinemas = useMemo(() => {
    return (cinemas || []).filter(c => managerComplexIds.includes(c.complexId));
  }, [cinemas, managerComplexIds]);

  const filteredOrders = useMemo(() => {
    return (orders || []).filter(order => {
      if (!managerComplexIds.includes(order.cinemaComplexId)) return false;
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        const matches = 
          (order.user?.name || '').toLowerCase().includes(term) ||
          (order.user?.phone || '').includes(term) ||
          (order.movieTitle || '').toLowerCase().includes(term) ||
          (order.cinemaName || '').toLowerCase().includes(term);
        if (!matches) return false;
      }
      if (filterCinema && order.cinemaComplexId !== Number(filterCinema)) return false;
      if (filterMovie && order.movieId !== Number(filterMovie)) return false;
      if (filterStatus) {
        const orderDate = new Date(order.showtime);
        const now = new Date();
        const isActive = orderDate > now && order.status === 'PAID';
        if (filterStatus === 'ACTIVE' && !isActive) return false;
        if (filterStatus === 'EXPIRED' && isActive) return false;
      }
      if (dateFrom) {
        const from = new Date(dateFrom);
        from.setHours(0, 0, 0, 0);
        if (new Date(order.showtime) < from) return false;
      }
      if (dateTo) {
        const to = new Date(dateTo);
        to.setHours(23, 59, 59, 999);
        if (new Date(order.showtime) > to) return false;
      }
      return true;
    });
  }, [orders, searchTerm, filterCinema, filterMovie, filterStatus, dateFrom, dateTo, managerComplexIds]);

  const sorted = useMemo(() => {
    const sortedList = [...filteredOrders];
    sortedList.sort((a, b) => {
      let aVal, bVal;
      switch (sortField) {
        case 'bookingId': aVal = a.bookingId; bVal = b.bookingId; break;
        case 'customer': aVal = a.user?.name || ''; bVal = b.user?.name || ''; break;
        case 'movie': aVal = a.movieTitle || ''; bVal = b.movieTitle || ''; break;
        case 'showtime': aVal = new Date(a.showtime).getTime(); bVal = new Date(b.showtime).getTime(); break;
        case 'amount': aVal = a.totalAmount || 0; bVal = b.totalAmount || 0; break;
        case 'status': 
          const aDate = new Date(a.showtime);
          const bDate = new Date(b.showtime);
          const now = new Date();
          aVal = aDate > now && a.status === 'PAID' ? 'ACTIVE' : 'EXPIRED';
          bVal = bDate > now && b.status === 'PAID' ? 'ACTIVE' : 'EXPIRED';
          break;
        default: return 0;
      }
      if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
    return sortedList;
  }, [filteredOrders, sortField, sortOrder]);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const SortIcon = ({ field }) => {
    if (sortField !== field) return <span style={{ opacity: 0.3 }}>↕</span>;
    return sortOrder === 'asc' ? '↑' : '↓';
  };

  const derivedStatus = (order) => {
    const orderDate = new Date(order.showtime);
    const now = new Date();
    return orderDate > now && order.status === 'PAID' ? 'ACTIVE' : 'EXPIRED';
  };

  const statusColor = (status) => status === 'ACTIVE' ? '#4caf50' : '#9e9e9e';

  return (
    <div className="admin-card">
      <div className="admin-card__header">
        <h2 className="admin-card__title">Quản lý đặt vé</h2>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <div className="movie-search">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
            <input className="movie-search__input" placeholder="Tìm tên KH, sđt, phim, rạp..." value={searchTerm} onChange={(e)=>setSearchTerm(e.target.value)} />
          </div>
          <select className="movie-filter" value={filterCinema} onChange={(e)=>setFilterCinema(e.target.value)}>
            <option value="">Tất cả rạp</option>
            {scopedCinemas.map(c => <option key={c.complexId} value={c.complexId}>#{c.complexId} - {c.name}</option>)}
          </select>
          <select className="movie-filter" value={filterMovie} onChange={(e)=>setFilterMovie(e.target.value)}>
            <option value="">Tất cả phim</option>
            {(movies || []).map(m => <option key={m.movieId} value={m.movieId}>{m.title}</option>)}
          </select>
          <select className="movie-filter" value={filterStatus} onChange={(e)=>setFilterStatus(e.target.value)}>
            <option value="">Tất cả trạng thái</option>
            <option value="ACTIVE">Còn hạn</option>
            <option value="EXPIRED">Hết hạn</option>
          </select>
          <input type="date" className="movie-filter" value={dateFrom} onChange={(e)=>setDateFrom(e.target.value)} />
          <input type="date" className="movie-filter" value={dateTo} onChange={(e)=>setDateTo(e.target.value)} />
        </div>
      </div>

      <div className="admin-card__content">
        {sorted.length === 0 ? (
          <div className="movie-empty">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
            <p>Không có đơn đặt vé</p>
          </div>
        ) : (
          <div className="admin-table">
            <table>
              <thead>
                <tr>
                  <th style={{ cursor: 'pointer', userSelect: 'none' }} onClick={() => handleSort('bookingId')}>
                    Mã <SortIcon field="bookingId" />
                  </th>
                  <th style={{ cursor: 'pointer', userSelect: 'none' }} onClick={() => handleSort('customer')}>
                    Khách hàng <SortIcon field="customer" />
                  </th>
                  <th style={{ cursor: 'pointer', userSelect: 'none' }} onClick={() => handleSort('movie')}>
                    Phim / Rạp / Phòng <SortIcon field="movie" />
                  </th>
                  <th style={{ cursor: 'pointer', userSelect: 'none' }} onClick={() => handleSort('showtime')}>
                    Suất <SortIcon field="showtime" />
                  </th>
                  <th>Ghế</th>
                  <th style={{ cursor: 'pointer', userSelect: 'none' }} onClick={() => handleSort('amount')}>
                    Thanh toán <SortIcon field="amount" />
                  </th>
                  <th style={{ cursor: 'pointer', userSelect: 'none' }} onClick={() => handleSort('status')}>
                    Trạng thái <SortIcon field="status" />
                  </th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {sorted.map(o => (
                  <tr key={o.bookingId}>
                    <td>#{o.bookingId}</td>
                    <td>
                      <div className="movie-table-title">{o.user?.name || 'Unknown'}</div>
                      <div className="movie-table-rating">{o.user?.email} • {o.user?.phone}</div>
                    </td>
                    <td>
                      <div className="movie-table-title">{o.movieTitle}</div>
                      <div className="movie-table-rating">{o.cinemaName} • {o.roomName}</div>
                    </td>
                    <td>{new Date(o.showtime).toLocaleString('vi-VN')}</td>
                    <td>
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        {o.seats.map(s => (
                          <span key={s} className="badge-rating" style={{ background: 'linear-gradient(180deg,#7b61ff,#4a1a5c)', boxShadow: '0 1px 3px rgba(0,0,0,0.15)' }}>
                            {s}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td>
                      <div className="movie-table-title">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(o.totalAmount)}</div>
                      <div className="movie-table-rating">{o.paymentMethod}</div>
                    </td>
                    <td>
                      <span className="movie-status-badge" style={{ backgroundColor: statusColor(derivedStatus(o)) }}>
                        {derivedStatus(o) === 'ACTIVE' ? 'Còn hạn' : 'Hết hạn'}
                      </span>
                    </td>
                    <td>
                      <div className="movie-table-actions">
                        <button className="movie-action-btn" title="Chi tiết" onClick={()=>setSelected(o)}>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12" y2="8"/></svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selected && (
        <div className="movie-modal-overlay" onClick={()=>setSelected(null)}>
          <div className="movie-modal" onClick={(e)=>e.stopPropagation()}>
            <div className="movie-modal__header">
              <h2>Chi tiết đơn #{selected.bookingId}</h2>
              <button className="movie-modal__close" onClick={()=>setSelected(null)}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            <div className="movie-modal__content">
              <div className="admin-dashboard-grid">
                <div className="admin-card">
                  <div className="admin-card__header"><h3 className="admin-card__title">Thông tin</h3></div>
                  <div className="admin-card__content">
                    <div className="movie-table-title">{selected.user?.name}</div>
                    <div className="movie-table-rating">{selected.user?.email} • {selected.user?.phone}</div>
                    <div style={{ marginTop: 8 }}>{selected.movieTitle} • {selected.cinemaName} • {selected.roomName}</div>
                    <div>Suất: {new Date(selected.showtime).toLocaleString('vi-VN')}</div>
                  </div>
                </div>
                <div className="admin-card">
                  <div className="admin-card__header"><h3 className="admin-card__title">Ghế & Thanh toán</h3></div>
                  <div className="admin-card__content">
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 8 }}>
                      {selected.seats.map(s => (
                        <span key={s} className="badge-rating" style={{ background: 'linear-gradient(180deg,#7b61ff,#4a1a5c)', boxShadow: '0 1px 3px rgba(0,0,0,0.15)' }}>
                          {s}
                        </span>
                      ))}
                    </div>
                    <div>Giá vé: {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(selected.pricePerSeat)} / ghế</div>
                    <div>Tổng: <strong>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(selected.totalAmount)}</strong> • {selected.paymentMethod}</div>
                    <div style={{ marginTop: 8 }}>
                      Trạng thái:{' '}
                      <span className="movie-status-badge" style={{ backgroundColor: statusColor(derivedStatus(selected)) }}>
                        {derivedStatus(selected) === 'ACTIVE' ? 'Còn hạn' : 'Hết hạn'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="movie-modal__footer">
              <button className="btn btn--ghost" onClick={()=>setSelected(null)}>Đóng</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Manager Reports Component (filtered by managerComplexIds)
function ManagerReports({ orders, movies, cinemas, managerComplexIds }) {
  const [timeRange, setTimeRange] = useState('30');
  const [selectedCinema, setSelectedCinema] = useState('all');
  const [selectedMovie, setSelectedMovie] = useState('all');

  const scopedCinemas = useMemo(() => {
    return (cinemas || []).filter(c => managerComplexIds.includes(c.complexId));
  }, [cinemas, managerComplexIds]);

  const scopedOrders = useMemo(() => {
    return (orders || []).filter(order => managerComplexIds.includes(order.cinemaComplexId));
  }, [orders, managerComplexIds]);

  const dateRange = useMemo(() => {
    const endDate = new Date();
    const startDate = new Date();
    switch (timeRange) {
      case '7':
        startDate.setDate(endDate.getDate() - 7);
        break;
      case '30':
        startDate.setDate(endDate.getDate() - 30);
        break;
      case '90':
        startDate.setDate(endDate.getDate() - 90);
        break;
      default:
        startDate.setFullYear(2020);
    }
    return { startDate, endDate };
  }, [timeRange]);

  const filteredOrders = useMemo(() => {
    return scopedOrders.filter(order => {
      if (order.status !== 'PAID') return false;
      const orderDate = new Date(order.showtime);
      if (orderDate < dateRange.startDate || orderDate > dateRange.endDate) return false;
      if (selectedCinema !== 'all' && order.cinemaComplexId !== Number(selectedCinema)) return false;
      if (selectedMovie !== 'all' && order.movieId !== Number(selectedMovie)) return false;
      return true;
    });
  }, [scopedOrders, dateRange, selectedCinema, selectedMovie]);

  const summaryStats = useMemo(() => {
    const totalRevenue = filteredOrders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
    const totalTickets = filteredOrders.reduce((sum, order) => sum + (order.seats?.length || 0), 0);
    const activeMovies = (movies || []).filter(m => m.status === 'NOW_SHOWING').length;
    const totalBookings = filteredOrders.length;

    return {
      totalRevenue,
      totalTickets,
      activeMovies,
      totalBookings
    };
  }, [filteredOrders, movies]);

  const revenueByMovie = useMemo(() => {
    const movieRevenue = {};
    filteredOrders.forEach(order => {
      const movieId = order.movieId;
      const movieTitle = order.movieTitle || movies.find(m => m.movieId === movieId)?.title || 'Unknown';
      if (!movieRevenue[movieId]) {
        movieRevenue[movieId] = { movieId, title: movieTitle, revenue: 0, tickets: 0 };
      }
      movieRevenue[movieId].revenue += order.totalAmount || 0;
      movieRevenue[movieId].tickets += order.seats?.length || 0;
    });
    return Object.values(movieRevenue).sort((a, b) => b.revenue - a.revenue);
  }, [filteredOrders, movies]);

  const revenueByCinema = useMemo(() => {
    const cinemaRevenue = {};
    filteredOrders.forEach(order => {
      const cinemaId = order.cinemaComplexId;
      const cinemaName = order.cinemaName || scopedCinemas.find(c => c.complexId === cinemaId)?.name || 'Unknown';
      if (!cinemaRevenue[cinemaId]) {
        cinemaRevenue[cinemaId] = { cinemaId, name: cinemaName, revenue: 0, tickets: 0 };
      }
      cinemaRevenue[cinemaId].revenue += order.totalAmount || 0;
      cinemaRevenue[cinemaId].tickets += order.seats?.length || 0;
    });
    return Object.values(cinemaRevenue).sort((a, b) => b.revenue - a.revenue);
  }, [filteredOrders, scopedCinemas]);

  const dailyRevenue = useMemo(() => {
    const daily = {};
    const days = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      const dateStr = date.toISOString().split('T')[0];
      daily[dateStr] = 0;
      days.push({
        date: dateStr,
        displayDate: date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' }),
        revenue: 0
      });
    }
    filteredOrders.forEach(order => {
      const orderDate = new Date(order.showtime);
      orderDate.setHours(0, 0, 0, 0);
      const dateStr = orderDate.toISOString().split('T')[0];
      if (daily[dateStr] !== undefined) {
        daily[dateStr] += order.totalAmount || 0;
      }
    });
    return days.map(d => ({ ...d, revenue: daily[d.date] || 0 }));
  }, [filteredOrders]);

  const top5Movies = useMemo(() => {
    return revenueByMovie
      .sort((a, b) => b.tickets - a.tickets)
      .slice(0, 5)
      .map((movie, idx) => ({ ...movie, rank: idx + 1 }));
  }, [revenueByMovie]);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat('vi-VN').format(num);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div className="admin-card">
        <div className="admin-card__header">
          <h2 className="admin-card__title">Bộ lọc</h2>
        </div>
        <div className="admin-card__content">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#c9c4c5' }}>
                Khoảng thời gian
              </label>
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  background: 'rgba(20, 15, 16, 0.8)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px',
                  color: '#fff',
                  fontSize: '14px'
                }}
              >
                <option value="7">7 ngày qua</option>
                <option value="30">30 ngày qua</option>
                <option value="90">90 ngày qua</option>
                <option value="all">Tất cả</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#c9c4c5' }}>
                Rạp
              </label>
              <select
                value={selectedCinema}
                onChange={(e) => setSelectedCinema(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  background: 'rgba(20, 15, 16, 0.8)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px',
                  color: '#fff',
                  fontSize: '14px'
                }}
              >
                <option value="all">Tất cả rạp</option>
                {scopedCinemas.map(c => (
                  <option key={c.complexId} value={c.complexId}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#c9c4c5' }}>
                Phim
              </label>
              <select
                value={selectedMovie}
                onChange={(e) => setSelectedMovie(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  background: 'rgba(20, 15, 16, 0.8)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px',
                  color: '#fff',
                  fontSize: '14px'
                }}
              >
                <option value="all">Tất cả phim</option>
                {(movies || []).map(m => (
                  <option key={m.movieId} value={m.movieId}>{m.title}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
        <div className="admin-stat-card">
          <div className="admin-stat-card__icon" style={{ color: '#4caf50' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="1" x2="12" y2="23"/>
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
            </svg>
          </div>
          <div className="admin-stat-card__content">
            <div className="admin-stat-card__value">{formatPrice(summaryStats.totalRevenue)}</div>
            <div className="admin-stat-card__label">Tổng doanh thu</div>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-card__icon" style={{ color: '#2196f3' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M2 9a3 3 0 0 1 3-3h14a3 3 0 0 1 3 3v6a3 3 0 0 1-3 3H5a3 3 0 0 1-3-3V9z"/>
              <path d="M6 9v6M18 9v6"/>
            </svg>
          </div>
          <div className="admin-stat-card__content">
            <div className="admin-stat-card__value">{formatNumber(summaryStats.totalTickets)}</div>
            <div className="admin-stat-card__label">Tổng vé bán</div>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-card__icon" style={{ color: '#ff9800' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="4" width="20" height="16" rx="2"/>
              <path d="M7 4v16M17 4v16M2 8h20M2 12h20M2 16h20"/>
            </svg>
          </div>
          <div className="admin-stat-card__content">
            <div className="admin-stat-card__value">{summaryStats.activeMovies}</div>
            <div className="admin-stat-card__label">Phim đang chiếu</div>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-card__icon" style={{ color: '#e83b41' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
            </svg>
          </div>
          <div className="admin-stat-card__content">
            <div className="admin-stat-card__value">{formatNumber(summaryStats.totalBookings)}</div>
            <div className="admin-stat-card__label">Tổng đơn đặt</div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))', gap: '24px' }}>
        <div className="admin-card">
          <div className="admin-card__header">
            <h2 className="admin-card__title">Doanh thu theo phim</h2>
          </div>
          <div className="admin-card__content">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={revenueByMovie.slice(0, 10)}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis 
                  dataKey="title" 
                  angle={-45}
                  textAnchor="end"
                  height={100}
                  stroke="#c9c4c5"
                  fontSize={12}
                />
                <YAxis 
                  stroke="#c9c4c5"
                  fontSize={12}
                  tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#2d2627', 
                    border: '1px solid #4a3f41',
                    borderRadius: '8px',
                    color: '#fff'
                  }}
                  formatter={(value) => formatPrice(value)}
                />
                <Legend />
                <Bar dataKey="revenue" fill="#e83b41" name="Doanh thu" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="admin-card">
          <div className="admin-card__header">
            <h2 className="admin-card__title">Doanh thu theo rạp</h2>
          </div>
          <div className="admin-card__content">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={revenueByCinema}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis 
                  dataKey="name" 
                  angle={-45}
                  textAnchor="end"
                  height={100}
                  stroke="#c9c4c5"
                  fontSize={12}
                />
                <YAxis 
                  stroke="#c9c4c5"
                  fontSize={12}
                  tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#2d2627', 
                    border: '1px solid #4a3f41',
                    borderRadius: '8px',
                    color: '#fff'
                  }}
                  formatter={(value) => formatPrice(value)}
                />
                <Legend />
                <Bar dataKey="revenue" fill="#4caf50" name="Doanh thu" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="admin-card" style={{ gridColumn: '1 / -1' }}>
          <div className="admin-card__header">
            <h2 className="admin-card__title">Doanh thu theo ngày (30 ngày qua)</h2>
          </div>
          <div className="admin-card__content">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={dailyRevenue}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis 
                  dataKey="displayDate" 
                  stroke="#c9c4c5"
                  fontSize={12}
                />
                <YAxis 
                  stroke="#c9c4c5"
                  fontSize={12}
                  tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#2d2627', 
                    border: '1px solid #4a3f41',
                    borderRadius: '8px',
                    color: '#fff'
                  }}
                  formatter={(value) => formatPrice(value)}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#ffd159" 
                  strokeWidth={2}
                  name="Doanh thu"
                  dot={{ fill: '#ffd159', r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="admin-card">
        <div className="admin-card__header">
          <h2 className="admin-card__title">Top 5 phim bán chạy</h2>
        </div>
        <div className="admin-card__content">
          <div className="admin-table">
            <table>
              <thead>
                <tr>
                  <th>Hạng</th>
                  <th>Phim</th>
                  <th>Số vé</th>
                  <th>Doanh thu</th>
                </tr>
              </thead>
              <tbody>
                {top5Movies.map((movie) => (
                  <tr key={movie.movieId}>
                    <td>
                      <span style={{
                        display: 'inline-block',
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        background: movie.rank === 1 ? '#ffd700' : movie.rank === 2 ? '#c0c0c0' : movie.rank === 3 ? '#cd7f32' : 'rgba(255,255,255,0.1)',
                        color: '#fff',
                        textAlign: 'center',
                        lineHeight: '24px',
                        fontSize: '12px',
                        fontWeight: 700
                      }}>
                        {movie.rank}
                      </span>
                    </td>
                    <td>{movie.title}</td>
                    <td>{formatNumber(movie.tickets)}</td>
                    <td style={{ color: '#4caf50', fontWeight: 600 }}>{formatPrice(movie.revenue)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
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

  // State management
  const [activeSection, setActiveSection] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [cinemas, setCinemas] = useState(scopedCinemas);
  const [movies] = useState(initialMovies);
  const [orders] = useState(initialBookingOrders);
  const [prices] = useState(initialPrices);

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
            <span>Danh sách phim</span>
          </button>
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

      <div className={`admin-main ${!sidebarOpen ? 'admin-main--sidebar-closed' : ''}`}>
        <header className="admin-header">
          <div className="admin-header__left">
            <h1 className="admin-header__title">
              {activeSection === 'dashboard' && 'Dashboard'}
              {activeSection === 'movies' && 'Danh sách phim'}
              {activeSection === 'cinemas' && 'Quản lý cụm rạp'}
              {activeSection === 'bookings' && 'Quản lý đặt vé'}
              {activeSection === 'reports' && 'Báo cáo'}
            </h1>
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
            <button
              onClick={() => {
                localStorage.removeItem('jwt');
                window.location.href = '/signin';
              }}
              style={{
                padding: '10px 16px',
                borderRadius: '8px',
                background: 'rgba(232, 59, 65, 0.1)',
                border: '1px solid rgba(232, 59, 65, 0.3)',
                color: '#e83b41',
                cursor: 'pointer',
                fontSize: '14px',
                fontWeight: 500,
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.2s',
                marginLeft: '16px'
              }}
              onMouseOver={(e) => {
                e.target.style.background = 'rgba(232, 59, 65, 0.2)';
                e.target.style.borderColor = 'rgba(232, 59, 65, 0.5)';
              }}
              onMouseOut={(e) => {
                e.target.style.background = 'rgba(232, 59, 65, 0.1)';
                e.target.style.borderColor = 'rgba(232, 59, 65, 0.3)';
              }}
              title="Đăng xuất"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                <polyline points="16 17 21 12 16 7"/>
                <line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
              Đăng xuất
            </button>
          </div>
        </header>

        <main className="admin-content">
          {activeSection === 'dashboard' && (
            <ManagerDashboardView 
              orders={orders}
              movies={movies}
              cinemas={cinemas}
              managerComplexIds={managerComplexIds}
            />
          )}

          {activeSection === 'movies' && (
            <ManagerMovieView movies={movies} />
          )}

          {activeSection === 'cinemas' && (
            <ManagerCinemaManagement cinemas={cinemas} onCinemasChange={setCinemas} />
          )}

          {activeSection === 'bookings' && (
            <ManagerBookingManagement 
              orders={orders}
              cinemas={cinemas}
              movies={movies}
              managerComplexIds={managerComplexIds}
            />
          )}

          {activeSection === 'reports' && (
            <ManagerReports 
              orders={orders}
              movies={movies}
              cinemas={cinemas}
              managerComplexIds={managerComplexIds}
            />
          )}
        </main>
      </div>
    </div>
  );
}


