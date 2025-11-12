import React, { useState, useEffect, useMemo } from 'react';

// Enums from database
const GENRES = ['ACTION', 'COMEDY', 'HORROR', 'DRAMA', 'ROMANCE', 'THRILLER', 'ANIMATION', 'FANTASY', 'SCI-FI', 'MUSICAL', 'FAMILY', 'DOCUMENTARY', 'ADVENTURE', 'SUPERHERO'];
const MOVIE_STATUSES = ['COMING_SOON', 'NOW_SHOWING', 'ENDED'];
const AGE_RATINGS = ['P', 'K', '13+', '16+', '18+'];
const SEAT_TYPES = ['NORMAL', 'VIP', 'COUPLE'];
const ROOM_TYPES = ['2D', '3D', 'DELUXE'];
const PROVINCES = [
  'Hồ Chí Minh', 'Hà Nội', 'Đà Nẵng', 'Cần Thơ', 'Hải Phòng', 'An Giang', 'Bà Rịa - Vũng Tàu',
  'Bắc Giang', 'Bắc Kạn', 'Bạc Liêu', 'Bắc Ninh', 'Bến Tre', 'Bình Định', 'Bình Dương',
  'Bình Phước', 'Bình Thuận', 'Cà Mau', 'Cao Bằng', 'Đắk Lắk', 'Đắk Nông', 'Điện Biên',
  'Đồng Nai', 'Đồng Tháp', 'Gia Lai', 'Hà Giang', 'Hà Nam', 'Hà Tĩnh', 'Hải Dương',
  'Hậu Giang', 'Hòa Bình', 'Hưng Yên', 'Khánh Hòa', 'Kiên Giang', 'Kon Tum', 'Lai Châu',
  'Lâm Đồng', 'Lạng Sơn', 'Lào Cai', 'Long An', 'Nam Định', 'Nghệ An', 'Ninh Bình',
  'Ninh Thuận', 'Phú Thọ', 'Phú Yên', 'Quảng Bình', 'Quảng Nam', 'Quảng Ngãi', 'Quảng Ninh',
  'Quảng Trị', 'Sóc Trăng', 'Sơn La', 'Tây Ninh', 'Thái Bình', 'Thái Nguyên', 'Thanh Hóa',
  'Thừa Thiên Huế', 'Tiền Giang', 'Trà Vinh', 'Tuyên Quang', 'Vĩnh Long', 'Vĩnh Phúc', 'Yên Bái'
];
// New enums for movie availability
const LANGUAGES = ['VIETSUB', 'VIETNAMESE', 'VIETDUB'];
const MOVIE_FORMATS = ['2D', '3D', 'DELUXE'];

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

// Sample bookings for booking management
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
    status: 'PAID', // PAID | CANCELED | REFUNDED
    paymentMethod: 'VNPAY' // VNPAY | MOMO | CASH
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
    bookingId: 1003,
    user: { name: 'Lê Văn C', email: 'c@example.com', phone: '0909000003' },
    movieId: 3,
    movieTitle: 'The Dark Knight',
    cinemaComplexId: 1,
    cinemaName: 'Cinestar Quốc Thanh',
    roomId: 2,
    roomName: 'Phòng 2',
    showtime: '2025-11-10T20:15:00',
    seats: ['A1', 'A2', 'A3'],
    pricePerSeat: 120000,
    totalAmount: 360000,
    status: 'REFUNDED',
    paymentMethod: 'CASH'
  }
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

// Sample vouchers data
const initialVouchers = [
  {
    voucherId: 1,
    code: 'WELCOME10',
    name: 'Chào mừng 10%',
    description: 'Giảm 10% cho đơn đầu tiên',
    discountType: 'PERCENT', // PERCENT | AMOUNT
    discountValue: 10,
    maxDiscount: 30000,
    minOrder: 100000,
    startDate: '2025-11-01',
    endDate: '2025-12-31',
    quantity: 1000,
    status: true,
    isPublic: true, // PUBLIC | PRIVATE
    assignedUserIds: [], // Array of userIds for private vouchers
    image: 'https://images.unsplash.com/photo-1493707553565-03c0f1a3c9a8?q=80&w=800&auto=format&fit=crop'
  },
  {
    voucherId: 2,
    code: 'CINE50K',
    name: 'Giảm 50.000đ',
    description: 'Áp dụng vé xem phim 2D',
    discountType: 'AMOUNT',
    discountValue: 50000,
    maxDiscount: 50000,
    minOrder: 120000,
    startDate: '2025-11-05',
    endDate: '2025-11-30',
    quantity: 300,
    status: true,
    isPublic: true,
    assignedUserIds: [],
    image: 'https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?q=80&w=800&auto=format&fit=crop'
  },
  {
    voucherId: 3,
    code: 'VIP100K',
    name: 'Voucher VIP 100K',
    description: 'Voucher riêng tư cho khách hàng VIP',
    discountType: 'AMOUNT',
    discountValue: 100000,
    maxDiscount: 100000,
    minOrder: 200000,
    startDate: '2025-11-01',
    endDate: '2025-12-31',
    quantity: 50,
    status: true,
    isPublic: false,
    assignedUserIds: [],
    image: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=800&auto=format&fit=crop'
  }
];

// Sample users data
const initialUsers = [
  {
    userId: 1,
    username: 'admin',
    password: '******',
    email: 'admin@cinesmart.vn',
    phone: '0909000001',
    address: '01 Lê Lợi, Quận 1, Hồ Chí Minh',
    status: true,
    role: 'ADMIN'
  },
  {
    userId: 2,
    username: 'manager_qt',
    password: '******',
    email: 'manager.qt@cinesmart.vn',
    phone: '0909000002',
    address: '271 Nguyễn Trãi, Quận 1, Hồ Chí Minh',
    status: true,
    role: 'MANAGER',
    cinemaComplexId: 1
  },
  {
    userId: 3,
    username: 'user_a',
    password: '******',
    email: 'user.a@example.com',
    phone: '0909000003',
    address: 'Hai Bà Trưng, Quận 1, Hồ Chí Minh',
    status: true,
    role: 'USER'
  }
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
    addressDescription: '',
    addressProvince: 'Hồ Chí Minh'
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
    // Tách địa chỉ thành mô tả + tỉnh/thành
    const parts = (cinema.address || '').split(',');
    const province = parts.length > 0 ? parts[parts.length - 1].trim() : 'Hồ Chí Minh';
    const description = parts.slice(0, -1).join(',').trim();
    setCinemaFormData({ name: cinema.name, addressDescription: description, addressProvince: province || 'Hồ Chí Minh' });
    setShowCinemaModal(true);
  };

  const handleSaveCinema = () => {
    if (!cinemaFormData.name || !cinemaFormData.address) {
      // Backward-compat: nếu address cũ chưa có, dựng từ 2 trường mới
    }
    if (!cinemaFormData.name || !cinemaFormData.addressDescription || !cinemaFormData.addressProvince) {
      alert('Vui lòng điền đầy đủ thông tin');
      return;
    }
    const composedAddress = `${cinemaFormData.addressDescription}, ${cinemaFormData.addressProvince}`;

    if (editingCinema) {
      setCinemas(cinemas.map(c =>
        c.complexId === editingCinema.complexId
          ? { ...c, name: cinemaFormData.name, address: composedAddress }
          : c
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
                  {PROVINCES.map(p => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
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
    status: 'COMING_SOON',
    languages: [],
    formats: []
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
      status: 'COMING_SOON',
      languages: [],
      formats: []
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
      status: movie.status,
      languages: movie.languages || [],
      formats: movie.formats || []
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
                  {(movie.formats || []).slice(0,2).map(f => (
                    <span key={f} className="movie-card__rating">{f}</span>
                  ))}
                  {(movie.languages || []).slice(0,2).map(l => (
                    <span key={l} className="movie-card__rating">{l}</span>
                  ))}
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
                <th>Định dạng</th>
                <th>Ngôn ngữ</th>
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
                  <td>{(movie.formats || []).join(', ')}</td>
                  <td>{(movie.languages || []).join(', ')}</td>
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
              <div className="movie-form__row">
                <div className="movie-form__group">
                  <label>Định dạng</label>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {MOVIE_FORMATS.map(fmt => {
                      const active = formData.formats.includes(fmt);
                      return (
                        <button
                          type="button"
                          key={fmt}
                          className={`view-mode-btn ${active ? 'active' : ''}`}
                          onClick={() => {
                            const exists = formData.formats.includes(fmt);
                            setFormData({
                              ...formData,
                              formats: exists ? formData.formats.filter(f => f !== fmt) : [...formData.formats, fmt]
                            });
                          }}
                        >
                          {fmt}
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div className="movie-form__group">
                  <label>Ngôn ngữ</label>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {LANGUAGES.map(lang => {
                      const active = formData.languages.includes(lang);
                      return (
                        <button
                          type="button"
                          key={lang}
                          className={`view-mode-btn ${active ? 'active' : ''}`}
                          onClick={() => {
                            const exists = formData.languages.includes(lang);
                            setFormData({
                              ...formData,
                              languages: exists ? formData.languages.filter(l => l !== lang) : [...formData.languages, lang]
                            });
                          }}
                        >
                          {lang}
                        </button>
                      );
                    })}
                  </div>
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

// Voucher Assign Modal Component
function VoucherAssignModal({ user, vouchers, onClose, onSave }) {
  const [newSelectedIds, setNewSelectedIds] = useState([]);

  const privateVouchers = vouchers?.filter(v => v.isPublic === false) || [];
  const alreadyAssignedIds = vouchers?.filter(v => v.isPublic === false && v.assignedUserIds?.includes(user.userId)).map(v => v.voucherId) || [];

  const handleToggle = (voucherId) => {
    // Cannot uncheck already assigned vouchers
    if (alreadyAssignedIds.includes(voucherId)) {
      return;
    }
    setNewSelectedIds(prev => {
      if (prev.includes(voucherId)) {
        return prev.filter(id => id !== voucherId);
      } else {
        return [...prev, voucherId];
      }
    });
  };

  const handleSave = () => {
    const updatedVouchers = vouchers.map(v => {
      if (!v.isPublic) {
        const currentIds = v.assignedUserIds || [];
        const isAlreadyAssigned = alreadyAssignedIds.includes(v.voucherId);
        const isNewlySelected = newSelectedIds.includes(v.voucherId);
        
        if (isAlreadyAssigned) {
          // Keep already assigned vouchers
          return v;
        } else if (isNewlySelected) {
          // Add newly selected vouchers
          return { ...v, assignedUserIds: [...currentIds, user.userId] };
        } else {
          // Remove if it was previously selected but not saved yet (shouldn't happen, but just in case)
          return { ...v, assignedUserIds: currentIds.filter(id => id !== user.userId) };
        }
      }
      return v;
    });
    onSave(updatedVouchers);
  };

  return (
    <div className="movie-modal-overlay" onClick={onClose}>
      <div className="movie-modal" onClick={(e) => e.stopPropagation()}>
        <div className="movie-modal__header">
          <h2>Gán voucher riêng tư cho {user.username}</h2>
          <button className="movie-modal__close" onClick={onClose}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
        <div className="movie-modal__content">
          {privateVouchers.length > 0 ? (
            <div style={{ maxHeight: '400px', overflowY: 'auto', border: '1px solid rgba(255,255,255,0.2)', borderRadius: 8, padding: 12, background: 'rgba(20, 15, 16, 0.5)' }}>
              {privateVouchers.map(voucher => {
                const isAlreadyAssigned = alreadyAssignedIds.includes(voucher.voucherId);
                const isSelected = isAlreadyAssigned || newSelectedIds.includes(voucher.voucherId);
                return (
                  <label 
                    key={voucher.voucherId} 
                    style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      gap: 12, 
                      padding: '12px 0', 
                      cursor: isAlreadyAssigned ? 'not-allowed' : 'pointer',
                      borderBottom: '1px solid rgba(255,255,255,0.1)',
                      opacity: isAlreadyAssigned ? 0.7 : 1
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      disabled={isAlreadyAssigned}
                      onChange={() => handleToggle(voucher.voucherId)}
                    />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600, marginBottom: 4, display: 'flex', alignItems: 'center', gap: 8 }}>
                        {voucher.name}
                        {isAlreadyAssigned && (
                          <span style={{ fontSize: '10px', padding: '2px 6px', background: '#4caf50', borderRadius: 4, color: '#fff' }}>
                            Đã gán
                          </span>
                        )}
                      </div>
                      <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.7)' }}>
                        Mã: {voucher.code} • {voucher.discountType === 'PERCENT' ? `Giảm ${voucher.discountValue}%` : `Giảm ${new Intl.NumberFormat('vi-VN').format(voucher.discountValue)}đ`}
                      </div>
                    </div>
                  </label>
                );
              })}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: 'rgba(255,255,255,0.5)' }}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ marginBottom: 16, opacity: 0.5 }}>
                <path d="M20 7h-4V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v3H4a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z"/>
                <path d="M12 12v6M9 15h6"/>
              </svg>
              <p>Chưa có voucher riêng tư nào</p>
            </div>
          )}
        </div>
        <div className="movie-modal__footer">
          <button className="btn btn--ghost" onClick={onClose}>Hủy</button>
          <button className="btn btn--primary" onClick={handleSave} disabled={newSelectedIds.length === 0}>
            Lưu
          </button>
        </div>
      </div>
    </div>
  );
}

// User Management Component
function UserManagement({ users: initialUsersList, cinemas: cinemasList, vouchers: vouchersList, onUsersChange, onVouchersChange }) {
  const [users, setUsers] = useState(initialUsersList);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterProvince, setFilterProvince] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showVoucherModal, setShowVoucherModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [voucherAssigningUser, setVoucherAssigningUser] = useState(null);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    email: '',
    phone: '',
    addressDescription: '',
    addressProvince: 'Hồ Chí Minh',
    status: true,
    role: 'USER',
    cinemaComplexId: ''
  });

  useEffect(() => {
    if (onUsersChange) onUsersChange(users);
  }, [users, onUsersChange]);

  const formatRole = (r) => r === 'ADMIN' ? 'Admin' : r === 'MANAGER' ? 'Manager' : 'User';

  const filtered = users.filter(u => {
    const matchesSearch =
      u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.phone.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = !filterRole || u.role === filterRole;
    const matchesStatus = filterStatus === '' ? true : u.status === (filterStatus === 'true');
    const province = (u.address?.split(',').pop() || '').trim();
    const matchesProvince = !filterProvince || province === filterProvince;
    return matchesSearch && matchesRole && matchesStatus && matchesProvince;
  });

  const handleAdd = () => {
    setEditingUser(null);
    setFormData({
      username: '',
      password: '',
      email: '',
      phone: '',
      addressDescription: '',
      addressProvince: 'Hồ Chí Minh',
      status: true,
      role: 'USER',
      cinemaComplexId: ''
    });
    setShowModal(true);
  };

  const handleEdit = (user) => {
    setEditingUser(user);
    const parts = (user.address || '').split(',');
    const province = parts.length > 0 ? parts[parts.length - 1].trim() : 'Hồ Chí Minh';
    const description = parts.slice(0, -1).join(',').trim();
    setFormData({
      username: user.username,
      password: '',
      email: user.email,
      phone: user.phone,
      addressDescription: description,
      addressProvince: province || 'Hồ Chí Minh',
      status: !!user.status,
      role: user.role,
      cinemaComplexId: user.cinemaComplexId || ''
    });
    setShowModal(true);
  };

  const handleSave = () => {
    if (!formData.username || (!editingUser && !formData.password) || !formData.email || !formData.phone || !formData.addressDescription || !formData.addressProvince) {
      alert('Vui lòng điền đầy đủ thông tin bắt buộc');
      return;
    }
    if (formData.role === 'MANAGER' && !formData.cinemaComplexId) {
      alert('Manager cần gán vào một cụm rạp');
      return;
    }
    const address = `${formData.addressDescription}, ${formData.addressProvince}`;
    if (editingUser) {
      setUsers(users.map(u =>
        u.userId === editingUser.userId
          ? {
              ...u,
              username: formData.username,
              // Chỉ cập nhật mật khẩu nếu nhập mới
              password: formData.password ? '******' : u.password,
              email: formData.email,
              phone: formData.phone,
              address,
              status: formData.status,
              role: formData.role,
              cinemaComplexId: formData.role === 'MANAGER' ? Number(formData.cinemaComplexId) : undefined
            }
          : u
      ));
    } else {
      const newUser = {
        userId: Math.max(...users.map(u => u.userId), 0) + 1,
        username: formData.username,
        password: '******',
        email: formData.email,
        phone: formData.phone,
        address,
        status: formData.status,
        role: formData.role,
        cinemaComplexId: formData.role === 'MANAGER' ? Number(formData.cinemaComplexId) : undefined
      };
      setUsers([newUser, ...users]);
    }
    setShowModal(false);
    setEditingUser(null);
  };

  const handleDelete = (userId) => {
    if (window.confirm('Xóa người dùng này?')) {
      setUsers(users.filter(u => u.userId !== userId));
    }
  };

  return (
    <div className="admin-card">
      <div className="admin-card__header">
        <h2 className="admin-card__title">Quản lý người dùng</h2>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <input
            className="movie-search__input"
            style={{ minWidth: 240 }}
            placeholder="Tìm username, email, phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <select value={filterRole} onChange={(e) => setFilterRole(e.target.value)} className="movie-filter">
            <option value="">Tất cả vai trò</option>
            <option value="ADMIN">ADMIN</option>
            <option value="MANAGER">MANAGER</option>
            <option value="USER">USER</option>
          </select>
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="movie-filter">
            <option value="">Tất cả trạng thái</option>
            <option value="true">Hoạt động</option>
            <option value="false">Khóa</option>
          </select>
          <select value={filterProvince} onChange={(e) => setFilterProvince(e.target.value)} className="movie-filter">
            <option value="">Tất cả tỉnh/thành</option>
            {PROVINCES.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
          <button className="btn btn--primary" onClick={handleAdd}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Thêm người dùng
          </button>
        </div>
      </div>
      <div className="admin-card__content">
        <div className="admin-table">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Username</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Địa chỉ</th>
                <th>Vai trò</th>
                <th>Trạng thái</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(u => (
                <tr key={u.userId}>
                  <td>{u.userId}</td>
                  <td>{u.username}</td>
                  <td>{u.email}</td>
                  <td>{u.phone}</td>
                  <td>{u.address}</td>
                  <td>
                    {formatRole(u.role)}
                    {u.role === 'MANAGER' && u.cinemaComplexId ? (
                      <span style={{ marginLeft: 6, fontSize: 12, opacity: .85 }}>(Cụm #{u.cinemaComplexId})</span>
                    ) : null}
                  </td>
                  <td>
                    <span className="movie-status-badge" style={{ backgroundColor: u.status ? '#4caf50' : '#9e9e9e' }}>
                      {u.status ? 'Hoạt động' : 'Khóa'}
                    </span>
                  </td>
                  <td>
                    <div className="movie-table-actions">
                      <button className="movie-action-btn" onClick={() => handleEdit(u)} title="Chỉnh sửa">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                      </button>
                      <button className="movie-action-btn" onClick={() => { setVoucherAssigningUser(u); setShowVoucherModal(true); }} title="Gán voucher">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 7h-4V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v3H4a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z"/><path d="M12 12v6M9 15h6"/></svg>
                      </button>
                      <button className="movie-action-btn movie-action-btn--delete" onClick={() => handleDelete(u.userId)} title="Xóa">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="movie-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="movie-modal" onClick={(e) => e.stopPropagation()}>
            <div className="movie-modal__header">
              <h2>{editingUser ? 'Chỉnh sửa người dùng' : 'Thêm người dùng'}</h2>
              <button className="movie-modal__close" onClick={() => setShowModal(false)}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            <div className="movie-modal__content">
              <div className="movie-form">
                <div className="movie-form__row">
                  <div className="movie-form__group">
                    <label>Username <span className="required">*</span></label>
                    <input type="text" value={formData.username} onChange={(e) => setFormData({ ...formData, username: e.target.value })} />
                  </div>
                  <div className="movie-form__group">
                    <label>Mật khẩu {editingUser ? <span style={{ opacity: .7 }}>(để trống nếu không đổi)</span> : <span className="required">*</span>}</label>
                    <input type="password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} />
                  </div>
                </div>
                <div className="movie-form__row">
                  <div className="movie-form__group">
                    <label>Email <span className="required">*</span></label>
                    <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
                  </div>
                  <div className="movie-form__group">
                    <label>Phone <span className="required">*</span></label>
                    <input type="tel" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
                  </div>
                </div>
                <div className="movie-form__group">
                  <label>Địa chỉ - Mô tả <span className="required">*</span></label>
                  <input
                    type="text"
                    value={formData.addressDescription}
                    onChange={(e) => setFormData({ ...formData, addressDescription: e.target.value })}
                    placeholder="Số nhà, đường, phường/xã, quận/huyện"
                  />
                </div>
                <div className="movie-form__group">
                  <label>Tỉnh/Thành phố <span className="required">*</span></label>
                  <select
                    value={formData.addressProvince}
                    onChange={(e) => setFormData({ ...formData, addressProvince: e.target.value })}
                  >
                    {PROVINCES.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
                <div className="movie-form__row">
                  <div className="movie-form__group">
                    <label>Vai trò <span className="required">*</span></label>
                    <select
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    >
                      <option value="USER">USER</option>
                      <option value="MANAGER">MANAGER</option>
                      <option value="ADMIN">ADMIN</option>
                    </select>
                  </div>
                  {formData.role === 'MANAGER' && (
                    <div className="movie-form__group">
                      <label>Cụm rạp (Manager) <span className="required">*</span></label>
                      <select
                        value={formData.cinemaComplexId}
                        onChange={(e) => setFormData({ ...formData, cinemaComplexId: e.target.value })}
                      >
                        <option value="">Chọn cụm rạp</option>
                        {cinemasList.map(c => (
                          <option key={c.complexId} value={c.complexId}>
                            #{c.complexId} - {c.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
                <div className="movie-form__group">
                  <label>Trạng thái</label>
                  <label style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                    <input type="checkbox" checked={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.checked })} />
                    Hoạt động
                  </label>
                </div>
              </div>
            </div>
            <div className="movie-modal__footer">
              <button className="btn btn--ghost" onClick={() => setShowModal(false)}>Hủy</button>
              <button className="btn btn--primary" onClick={handleSave}>{editingUser ? 'Cập nhật' : 'Thêm người dùng'}</button>
            </div>
          </div>
        </div>
      )}

      {showVoucherModal && voucherAssigningUser && vouchersList && (
        <VoucherAssignModal
          user={voucherAssigningUser}
          vouchers={vouchersList}
          onClose={() => { setShowVoucherModal(false); setVoucherAssigningUser(null); }}
          onSave={(updatedVouchers) => {
            if (onVouchersChange) {
              onVouchersChange(updatedVouchers);
            }
            setShowVoucherModal(false);
            setVoucherAssigningUser(null);
          }}
        />
      )}
    </div>
  );
}

// Voucher Management Component
function VoucherManagement({ vouchers: initialVouchersList, users: usersList, onVouchersChange }) {
  const [vouchers, setVouchers] = useState(initialVouchersList);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterPublic, setFilterPublic] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingVoucher, setEditingVoucher] = useState(null);
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    description: '',
    discountType: 'PERCENT',
    discountValue: '',
    maxDiscount: '',
    minOrder: '',
    startDate: '',
    endDate: '',
    quantity: '',
    status: true,
    isPublic: true,
    assignedUserIds: [],
    image: '',
    imageFile: null
  });
  const [imagePreview, setImagePreview] = useState('');

  useEffect(() => {
    if (onVouchersChange) onVouchersChange(vouchers);
    // Save vouchers to localStorage for Events page
    try {
      localStorage.setItem('adminVouchers', JSON.stringify(vouchers));
    } catch (e) {
      console.error('Failed to save vouchers to localStorage', e);
    }
  }, [vouchers, onVouchersChange]);

  const filtered = vouchers.filter(v => {
    const matchesSearch =
      v.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === '' ? true : v.status === (filterStatus === 'true');
    const matchesType = !filterType || v.discountType === filterType;
    const matchesPublic = filterPublic === '' ? true : (filterPublic === 'true' ? v.isPublic : !v.isPublic);
    return matchesSearch && matchesStatus && matchesType && matchesPublic;
  });

  const handleAdd = () => {
    setEditingVoucher(null);
    setFormData({
      code: '',
      name: '',
      description: '',
      discountType: 'PERCENT',
      discountValue: '',
      maxDiscount: '',
      minOrder: '',
      startDate: '',
      endDate: '',
      quantity: '',
      status: true,
      isPublic: true,
      assignedUserIds: [],
      image: '',
      imageFile: null
    });
    setImagePreview('');
    setShowModal(true);
  };

  const handleEdit = (v) => {
    setEditingVoucher(v);
    setFormData({
      code: v.code,
      name: v.name,
      description: v.description,
      discountType: v.discountType,
      discountValue: v.discountValue.toString(),
      maxDiscount: v.maxDiscount.toString(),
      minOrder: v.minOrder.toString(),
      startDate: v.startDate,
      endDate: v.endDate,
      quantity: v.quantity.toString(),
      status: v.status,
      isPublic: v.isPublic !== undefined ? v.isPublic : true,
      assignedUserIds: v.assignedUserIds || [],
      image: v.image || '',
      imageFile: null
    });
    setImagePreview(v.image || '');
    setShowModal(true);
  };

  const handleSave = () => {
    if (!formData.code || !formData.name || !formData.discountValue || !formData.startDate || !formData.endDate) {
      alert('Vui lòng điền đầy đủ thông tin bắt buộc');
      return;
    }
    const payload = {
      code: formData.code.trim(),
      name: formData.name.trim(),
      description: formData.description.trim(),
      discountType: formData.discountType,
      discountValue: Number(formData.discountValue),
      maxDiscount: Number(formData.maxDiscount || 0),
      minOrder: Number(formData.minOrder || 0),
      startDate: formData.startDate,
      endDate: formData.endDate,
      quantity: Number(formData.quantity || 0),
      status: !!formData.status,
      isPublic: !!formData.isPublic,
      assignedUserIds: formData.isPublic ? [] : (editingVoucher ? (editingVoucher.assignedUserIds || []) : []),
      image: imagePreview || formData.image
    };
    if (editingVoucher) {
      setVouchers(vouchers.map(v => v.voucherId === editingVoucher.voucherId ? { ...v, ...payload } : v));
    } else {
      const newItem = { voucherId: Math.max(...vouchers.map(v => v.voucherId), 0) + 1, ...payload };
      setVouchers([newItem, ...vouchers]);
    }
    setShowModal(false);
    setEditingVoucher(null);
    setImagePreview('');
  };

  const handleDelete = (voucherId) => {
    if (window.confirm('Xóa voucher này?')) {
      setVouchers(vouchers.filter(v => v.voucherId !== voucherId));
    }
  };

  const onUploadImage = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert('Vui lòng chọn file hình ảnh');
      return;
    }
    if (file.size > 4 * 1024 * 1024) {
      alert('Kích thước ảnh tối đa 4MB');
      return;
    }
    setFormData(prev => ({ ...prev, imageFile: file, image: '' }));
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);
  };

  const discountBadge = (v) => {
    if (v.discountType === 'PERCENT') return `-${v.discountValue}%`;
    return `-${new Intl.NumberFormat('vi-VN').format(v.discountValue)}đ`;
  };

  return (
    <div className="admin-card">
      <div className="admin-card__header">
        <h2 className="admin-card__title">Quản lý voucher</h2>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <div className="movie-search">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
            <input className="movie-search__input" placeholder="Tìm mã hoặc tên voucher..." value={searchTerm} onChange={(e)=>setSearchTerm(e.target.value)} />
          </div>
          <select className="movie-filter" value={filterType} onChange={(e)=>setFilterType(e.target.value)}>
            <option value="">Tất cả loại giảm</option>
            <option value="PERCENT">Phần trăm</option>
            <option value="AMOUNT">Số tiền</option>
          </select>
          <select className="movie-filter" value={filterPublic} onChange={(e)=>setFilterPublic(e.target.value)}>
            <option value="">Tất cả loại</option>
            <option value="true">Công khai</option>
            <option value="false">Riêng tư</option>
          </select>
          <select className="movie-filter" value={filterStatus} onChange={(e)=>setFilterStatus(e.target.value)}>
            <option value="">Tất cả trạng thái</option>
            <option value="true">Hoạt động</option>
            <option value="false">Ngừng</option>
          </select>
          <button className="btn btn--primary" onClick={handleAdd}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Tạo voucher
          </button>
        </div>
      </div>
      <div className="admin-card__content">
        {filtered.length === 0 ? (
          <div className="movie-empty">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M7 4v16M17 4v16M2 8h20M2 12h20M2 16h20"/></svg>
            <p>Không có voucher nào</p>
          </div>
        ) : (
          <div className="movie-grid">
            {filtered.map(v => (
              <div key={v.voucherId} className="movie-card">
                <div
                  className="movie-card__poster"
                  style={{ width: '100%', height: '160px', overflow: 'hidden', position: 'relative', padding: 0 }}
                >
                  <img
                    src={v.image || 'https://via.placeholder.com/1000x430?text=Voucher'}
                    alt={v.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                  />
                  <div className="movie-card__overlay">
                    <button className="movie-card__action" onClick={() => handleEdit(v)} title="Chỉnh sửa">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                    </button>
                    <button className="movie-card__action movie-card__action--delete" onClick={() => handleDelete(v.voucherId)} title="Xóa">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                    </button>
                  </div>
                  <div className="movie-card__status" style={{ backgroundColor: v.status ? '#4caf50' : '#9e9e9e' }}>
                    {v.status ? 'Hoạt động' : 'Ngừng'}
                  </div>
                  <div className="movie-card__badge" style={{ position: 'absolute', top: 8, left: 8, background: '#e83b41', color: '#fff', padding: '4px 8px', borderRadius: 6, fontWeight: 800 }}>
                    {discountBadge(v)}
                  </div>
                </div>
                <div className="movie-card__content">
                  <h3 className="movie-card__title">{v.name}</h3>
                  {v.isPublic === false && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4, marginBottom: 8 }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: '#7b61ff' }}>
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                        <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                      </svg>
                      <span style={{ fontSize: '12px', color: '#7b61ff', fontWeight: 500 }}>Riêng tư</span>
                    </div>
                  )}
                  <div className="movie-card__meta">
                    <span className="movie-card__genre">Mã: {v.code}</span>
                    <span className="movie-card__rating">{new Date(v.startDate).toLocaleDateString('vi-VN')} — {new Date(v.endDate).toLocaleDateString('vi-VN')}</span>
                    <span className="movie-card__duration">SL: {v.quantity}</span>
                  </div>
                  <div className="movie-card__director">{v.description}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <div className="movie-modal-overlay" onClick={() => { setShowModal(false); setImagePreview(''); }}>
          <div className="movie-modal" onClick={(e) => e.stopPropagation()}>
            <div className="movie-modal__header">
              <h2>{editingVoucher ? 'Chỉnh sửa voucher' : 'Tạo voucher'}</h2>
              <button className="movie-modal__close" onClick={() => setShowModal(false)}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            <div className="movie-modal__content">
              <div className="movie-form">
                <div className="movie-form__row">
                  <div className="movie-form__group">
                    <label>Tên voucher <span className="required">*</span></label>
                    <input value={formData.name} onChange={(e)=>setFormData({ ...formData, name: e.target.value })} />
                  </div>
                  <div className="movie-form__group">
                    <label>Mã <span className="required">*</span></label>
                    <input value={formData.code} onChange={(e)=>setFormData({ ...formData, code: e.target.value.toUpperCase() })} />
                  </div>
                </div>
                <div className="movie-form__group">
                  <label>Mô tả</label>
                  <input value={formData.description} onChange={(e)=>setFormData({ ...formData, description: e.target.value })} />
                </div>
                <div className="movie-form__row">
                  <div className="movie-form__group">
                    <label>Loại giảm <span className="required">*</span></label>
                    <select value={formData.discountType} onChange={(e)=>setFormData({ ...formData, discountType: e.target.value })}>
                      <option value="PERCENT">Phần trăm (%)</option>
                      <option value="AMOUNT">Số tiền (đ)</option>
                    </select>
                  </div>
                  <div className="movie-form__group">
                    <label>Giá trị <span className="required">*</span></label>
                    <input type="number" value={formData.discountValue} onChange={(e)=>setFormData({ ...formData, discountValue: e.target.value })} min="0" />
                  </div>
                  <div className="movie-form__group">
                    <label>Giảm tối đa</label>
                    <input type="number" value={formData.maxDiscount} onChange={(e)=>setFormData({ ...formData, maxDiscount: e.target.value })} min="0" />
                  </div>
                </div>
                <div className="movie-form__row">
                  <div className="movie-form__group">
                    <label>Đơn tối thiểu</label>
                    <input type="number" value={formData.minOrder} onChange={(e)=>setFormData({ ...formData, minOrder: e.target.value })} min="0" />
                  </div>
                  <div className="movie-form__group">
                    <label>Số lượng</label>
                    <input type="number" value={formData.quantity} onChange={(e)=>setFormData({ ...formData, quantity: e.target.value })} min="0" />
                  </div>
                </div>
                <div className="movie-form__row">
                  <div className="movie-form__group">
                    <label>Ngày bắt đầu <span className="required">*</span></label>
                    <input type="date" value={formData.startDate} onChange={(e)=>setFormData({ ...formData, startDate: e.target.value })} />
                  </div>
                  <div className="movie-form__group">
                    <label>Ngày kết thúc <span className="required">*</span></label>
                    <input type="date" value={formData.endDate} onChange={(e)=>setFormData({ ...formData, endDate: e.target.value })} />
                  </div>
                </div>
                <div className="movie-form__group">
                  <label>Ảnh voucher</label>
                  <div className="movie-poster-upload">
                    <div className="movie-poster-upload__options">
                      <label className="movie-poster-upload__btn">
                        <input type="file" accept="image/*" onChange={onUploadImage} style={{ display: 'none' }} />
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                        Upload từ máy
                      </label>
                      <span className="movie-poster-upload__or">hoặc</span>
                      <input
                        type="url"
                        className="movie-poster-upload__url"
                        placeholder="Dán URL ảnh"
                        value={formData.image}
                        onChange={(e)=>{ setFormData({ ...formData, image: e.target.value, imageFile: null }); setImagePreview(e.target.value); }}
                      />
                    </div>
                    {(imagePreview || formData.image) && (
                      <div className="movie-poster-upload__preview" style={{ width: '100%', height: '180px' }}>
                        <img
                          src={imagePreview || formData.image}
                          alt="Voucher preview"
                          style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 8 }}
                        />
                      </div>
                    )}
                  </div>
                </div>
                <div className="movie-form__group">
                  <label>Loại voucher <span className="required">*</span></label>
                  <div style={{ display: 'flex', gap: 16 }}>
                    <label style={{ display: 'inline-flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                      <input 
                        type="radio" 
                        name="voucherType" 
                        checked={formData.isPublic} 
                        onChange={() => setFormData({ ...formData, isPublic: true })} 
                      />
                      Công khai (Hiển thị trên trang voucher)
                    </label>
                    <label style={{ display: 'inline-flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                      <input 
                        type="radio" 
                        name="voucherType" 
                        checked={!formData.isPublic} 
                        onChange={() => setFormData({ ...formData, isPublic: false })} 
                      />
                      Riêng tư (Gán cho người dùng ở trang quản lý người dùng)
                    </label>
                  </div>
                </div>
                <div className="movie-form__group">
                  <label>Trạng thái</label>
                  <label style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                    <input type="checkbox" checked={formData.status} onChange={(e)=>setFormData({ ...formData, status: e.target.checked })} />
                    Hoạt động
                  </label>
                </div>
              </div>
            </div>
            <div className="movie-modal__footer">
              <button className="btn btn--ghost" onClick={() => setShowModal(false)}>Hủy</button>
              <button className="btn btn--primary" onClick={handleSave}>{editingVoucher ? 'Cập nhật' : 'Tạo voucher'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Booking Management Component
function BookingManagement({ orders: initialOrders, cinemas: cinemasList, movies: moviesList, onOrdersChange }) {
  const [orders, setOrders] = useState(initialOrders);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCinema, setFilterCinema] = useState('');
  const [filterMovie, setFilterMovie] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [selected, setSelected] = useState(null);
  const [sortField, setSortField] = useState('showtime');
  const [sortDirection, setSortDirection] = useState('desc');

  useEffect(() => {
    if (onOrdersChange) onOrdersChange(orders);
  }, [orders, onOrdersChange]);

  const withinRange = (dt) => {
    const t = new Date(dt).getTime();
    if (dateFrom && t < new Date(dateFrom).getTime()) return false;
    if (dateTo && t > new Date(dateTo + 'T23:59:59').getTime()) return false;
    return true;
  };

  const isExpired = (o) => new Date(o.showtime).getTime() < Date.now();
  const derivedStatus = (o) => (isExpired(o) ? 'EXPIRED' : 'ACTIVE'); // Còn hạn / Hết hạn

  const filtered = orders.filter(o => {
    const matchesText =
      o.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.user.phone.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.movieTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.cinemaName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCinema = !filterCinema || String(o.cinemaComplexId) === String(filterCinema);
    const matchesMovie = !filterMovie || String(o.movieId) === String(filterMovie);
    const matchesStatus = !filterStatus || derivedStatus(o) === filterStatus;
    return matchesText && matchesCinema && matchesMovie && matchesStatus && withinRange(o.showtime);
  });

  const statusColor = (s) => ({ ACTIVE: '#4caf50', EXPIRED: '#9e9e9e' }[s] || '#9e9e9e');

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sorted = [...filtered].sort((a, b) => {
    let aVal, bVal;
    switch (sortField) {
      case 'bookingId':
        aVal = a.bookingId;
        bVal = b.bookingId;
        break;
      case 'customer':
        aVal = a.user.name.toLowerCase();
        bVal = b.user.name.toLowerCase();
        break;
      case 'movie':
        aVal = a.movieTitle.toLowerCase();
        bVal = b.movieTitle.toLowerCase();
        break;
      case 'showtime':
        aVal = new Date(a.showtime).getTime();
        bVal = new Date(b.showtime).getTime();
        break;
      case 'amount':
        aVal = a.totalAmount;
        bVal = b.totalAmount;
        break;
      case 'status':
        aVal = derivedStatus(a);
        bVal = derivedStatus(b);
        break;
      default:
        aVal = new Date(a.showtime).getTime();
        bVal = new Date(b.showtime).getTime();
    }
    
    if (typeof aVal === 'string') {
      return sortDirection === 'asc' 
        ? aVal.localeCompare(bVal)
        : bVal.localeCompare(aVal);
    } else {
      return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
    }
  });

  const SortIcon = ({ field }) => {
    if (sortField !== field) {
      return (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ opacity: 0.3, marginLeft: 4 }}>
          <path d="M8 9l4-4 4 4M16 15l-4 4-4-4"/>
        </svg>
      );
    }
    return sortDirection === 'asc' ? (
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginLeft: 4 }}>
        <path d="M8 9l4-4 4 4"/>
      </svg>
    ) : (
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginLeft: 4 }}>
        <path d="M16 15l-4 4-4-4"/>
      </svg>
    );
  };

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
            {cinemasList.map(c => <option key={c.complexId} value={c.complexId}>#{c.complexId} - {c.name}</option>)}
          </select>
          <select className="movie-filter" value={filterMovie} onChange={(e)=>setFilterMovie(e.target.value)}>
            <option value="">Tất cả phim</option>
            {moviesList.map(m => <option key={m.movieId} value={m.movieId}>{m.title}</option>)}
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
                      <div className="movie-table-title">{o.user.name}</div>
                      <div className="movie-table-rating">{o.user.phone}</div>
                    </td>
                    <td>
                      <div className="movie-table-title">{o.movieTitle}</div>
                      <div className="movie-table-rating">{o.cinemaName} • {o.roomName}</div>
                    </td>
                    <td>
                      <div className="movie-table-title">{new Date(o.showtime).toLocaleDateString('vi-VN')}</div>
                      <div className="movie-table-rating">{new Date(o.showtime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        {o.seats.map(s => (
                          <span
                            key={s}
                            className="badge-rating"
                            style={{
                              background: 'linear-gradient(180deg,#7b61ff,#4a1a5c)',
                              boxShadow: '0 1px 3px rgba(0,0,0,0.15)'
                            }}
                          >
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
                    <div className="movie-table-title">{selected.user.name}</div>
                    <div className="movie-table-rating">{selected.user.email} • {selected.user.phone}</div>
                    <div style={{ marginTop: 8 }}>{selected.movieTitle} • {selected.cinemaName} • {selected.roomName}</div>
                    <div>Suất: {new Date(selected.showtime).toLocaleString('vi-VN')}</div>
                  </div>
                </div>
                <div className="admin-card">
                  <div className="admin-card__header"><h3 className="admin-card__title">Ghế & Thanh toán</h3></div>
                  <div className="admin-card__content">
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 8 }}>
                      {selected.seats.map(s => (
                        <span
                          key={s}
                          className="badge-rating"
                          style={{ background: 'linear-gradient(180deg,#7b61ff,#4a1a5c)', boxShadow: '0 1px 3px rgba(0,0,0,0.15)' }}
                        >
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

// Price Management Component
function PriceManagement({ prices: initialPricesList, onPricesChange }) {
  const [prices, setPrices] = useState(initialPricesList || []);

  // Build an in-memory matrix for easy inline editing: key `${roomType}-${seatType}` -> price
  const matrix = useMemo(() => {
    const map = new Map();
    (prices || []).forEach(p => {
      if (p && p.roomType && p.seatType) {
        map.set(`${p.roomType}-${p.seatType}`, Number(p.price) || 0);
      }
    });
    return map;
  }, [prices]);

  const [draft, setDraft] = useState(() => {
    const obj = {};
    // Initialize all combinations with 0 if not in prices
    ROOM_TYPES.forEach(rt => {
      SEAT_TYPES.forEach(st => {
        const existing = (prices || []).find(p => p && p.roomType === rt && p.seatType === st);
        obj[`${rt}-${st}`] = existing ? Number(existing.price) || 0 : 0;
      });
    });
    return obj;
  });

  useEffect(() => {
    if (onPricesChange) onPricesChange(prices);
  }, [prices, onPricesChange]);

  useEffect(() => {
    // Sync draft when prices change externally - initialize all combinations
    const obj = {};
    ROOM_TYPES.forEach(rt => {
      SEAT_TYPES.forEach(st => {
        const existing = (prices || []).find(p => p && p.roomType === rt && p.seatType === st);
        obj[`${rt}-${st}`] = existing ? Number(existing.price) || 0 : 0;
      });
    });
    setDraft(obj);
  }, [prices]);

  const getPrice = (roomType, seatType) =>
    draft[`${roomType}-${seatType}`] ?? matrix.get(`${roomType}-${seatType}`) ?? 0;

  const setPrice = (roomType, seatType, value) => {
    setDraft(prev => ({
      ...prev,
      [`${roomType}-${seatType}`]: value
    }));
  };

  const applyQuickFillRow = (seatType, value) => {
    const num = Number(value) || 0;
    const next = { ...draft };
    ROOM_TYPES.forEach(rt => { next[`${rt}-${seatType}`] = num; });
    setDraft(next);
  };

  const applyQuickFillCol = (roomType, value) => {
    const num = Number(value) || 0;
    const next = { ...draft };
    SEAT_TYPES.forEach(st => { next[`${roomType}-${st}`] = num; });
    setDraft(next);
  };

  const handleReset = () => {
    const obj = {};
    (prices || []).forEach(p => { obj[`${p.roomType}-${p.seatType}`] = Number(p.price); });
    setDraft(obj);
  };

  const handleSaveAll = () => {
    // Convert draft matrix -> normalized array (unique pairs)
    const items = [];
    ROOM_TYPES.forEach(rt => {
      SEAT_TYPES.forEach(st => {
        const price = Number(getPrice(rt, st) || 0);
        if (price >= 0) {
          const exist = prices.find(p => p.roomType === rt && p.seatType === st);
          if (exist) {
            items.push({ ...exist, price });
          } else {
            items.push({
              id: Math.max(0, ...prices.map(p => p.id)) + items.length + 1,
              roomType: rt,
              seatType: st,
              price
            });
          }
        }
      });
    });
    setPrices(items);
  };

  const formatCurrency = (v) => new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(v);

  return (
    <div className="admin-card">
      <div className="admin-card__header">
        <h2 className="admin-card__title">Bảng giá</h2>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <button className="btn btn--ghost" onClick={handleReset}>Hoàn tác</button>
          <button className="btn btn--primary" onClick={handleSaveAll}>
            Lưu bảng giá
          </button>
        </div>
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
                    const val = getPrice(rt, st);
                    return (
                      <td key={`${rt}-${st}`} style={{ padding: '16px', textAlign: 'center', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                        <input
                          type="number"
                          min="0"
                          value={val}
                          onChange={(e)=>setPrice(rt, st, Number(e.target.value))}
                          style={{
                            width: '120px',
                            padding: '10px',
                            background: 'rgba(20, 15, 16, 0.8)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '8px',
                            color: '#fff',
                            fontSize: '14px',
                            textAlign: 'center'
                          }}
                        />
                        <div style={{ marginTop: '8px', fontSize: '12px', color: '#ffd159' }}>
                          {formatCurrency(val || 0)}
                        </div>
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

export default function AdminDashboard() {
  const [activeSection, setActiveSection] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [movies, setMovies] = useState(initialMovies);
  const [cinemas, setCinemas] = useState(initialCinemas);
  const [users, setUsers] = useState(initialUsers);
  const [vouchers, setVouchers] = useState(initialVouchers);
  const [orders, setOrders] = useState(initialBookingOrders);
  const [prices, setPrices] = useState(initialPrices);

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
            className={`admin-nav-item ${activeSection === 'prices' ? 'admin-nav-item--active' : ''}`}
            onClick={() => setActiveSection('prices')}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 1v22"/>
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H7"/>
            </svg>
            <span>Bảng giá</span>
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
            <BookingManagement orders={orders} cinemas={cinemas} movies={movies} onOrdersChange={setOrders} />
          )}

          {activeSection === 'users' && (
            <UserManagement users={users} cinemas={cinemas} vouchers={vouchers} onUsersChange={setUsers} onVouchersChange={setVouchers} />
          )}

          {activeSection === 'vouchers' && (
            <VoucherManagement vouchers={vouchers} users={users} onVouchersChange={setVouchers} />
          )}

              {activeSection === 'prices' && (
                <PriceManagement prices={prices} onPricesChange={setPrices} />
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

