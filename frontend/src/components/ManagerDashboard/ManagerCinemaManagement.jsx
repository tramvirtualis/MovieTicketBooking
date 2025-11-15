import React, { useState, useEffect } from 'react';
import { SEAT_TYPES, ROOM_TYPES, PROVINCES } from '../AdminDashboard/constants';
import { generateSeats, getSeatColor } from '../AdminDashboard/utils';
import { SAMPLE_MOVIES } from './sampleData';

// Full Cinema Management (copied and adapted from Admin) scoped for manager
function ManagerCinemaManagement({ cinemas: initialCinemasList, onCinemasChange, complexId }) {
  const [cinemas, setCinemas] = useState(initialCinemasList);
  const [selectedCinema, setSelectedCinema] = useState(initialCinemasList[0] || null);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [showRoomModal, setShowRoomModal] = useState(false);
  const [showShowtimeModal, setShowShowtimeModal] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);
  const [editingShowtime, setEditingShowtime] = useState(null);
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
  const [savingRoom, setSavingRoom] = useState(false);

  useEffect(() => {
    if (onCinemasChange) {
      onCinemasChange(cinemas);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cinemas]);

  useEffect(() => {
    console.log('ManagerCinemaManagement: initialCinemasList changed:', initialCinemasList);
    console.log('ManagerCinemaManagement: initialCinemasList length:', initialCinemasList?.length || 0);
    
    const loadRoomsForCinemas = async () => {
      if (!initialCinemasList || initialCinemasList.length === 0) {
        setCinemas([]);
        setSelectedCinema(null);
        return;
      }
      
      // Load rooms for each cinema complex
      const { default: cinemaRoomService } = await import('../../services/cinemaRoomService');
      const cinemasWithRooms = await Promise.all(
        initialCinemasList.map(async (cinema) => {
          try {
            const roomsResult = await cinemaRoomService.getRoomsByComplexIdManager(cinema.complexId);
            if (roomsResult.success && roomsResult.data) {
              return {
                ...cinema,
                rooms: roomsResult.data.map(room => ({
                  roomId: room.roomId,
                  roomName: room.roomName,
                  roomType: cinemaRoomService.mapRoomTypeFromBackend(room.roomType),
                  rows: room.rows,
                  cols: room.cols,
                  seats: (room.seats || []).map(seat => ({
                    seatId: seat.seatId,
                    type: seat.type,
                    row: seat.seatRow, // Map seatRow -> row
                    column: seat.seatColumn // Map seatColumn -> column
                  }))
                }))
              };
            }
            return { ...cinema, rooms: [] };
          } catch (error) {
            console.error(`Error loading rooms for cinema ${cinema.complexId}:`, error);
            return { ...cinema, rooms: [] };
          }
        })
      );
      
      setCinemas(cinemasWithRooms);
      if (cinemasWithRooms.length > 0) {
        console.log('ManagerCinemaManagement: Setting selectedCinema to:', cinemasWithRooms[0]);
        setSelectedCinema(cinemasWithRooms[0]);
      } else {
        console.log('ManagerCinemaManagement: No cinemas, setting selectedCinema to null');
        setSelectedCinema(null);
      }
    };
    
    loadRoomsForCinemas();
  }, [initialCinemasList]);


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

  const handleSaveRoom = async (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    if (!roomFormData.roomName || !roomFormData.rows || !roomFormData.cols) {
      alert('Vui lòng điền đầy đủ thông tin');
      return;
    }

    if (!selectedCinema) {
      alert('Vui lòng chọn cụm rạp');
      return;
    }

    // Prevent multiple calls
    if (savingRoom) {
      return;
    }

    setSavingRoom(true);
    try {
      const { default: cinemaRoomService } = await import('../../services/cinemaRoomService');
      
      const roomData = {
        roomName: roomFormData.roomName.trim(),
        roomType: roomFormData.roomType,
        cinemaComplexId: selectedCinema.complexId,
        rows: Number(roomFormData.rows),
        cols: Number(roomFormData.cols)
      };

      if (editingRoom) {
        // Update existing room
        const result = await cinemaRoomService.updateCinemaRoomManager(editingRoom.roomId, roomData);
        
        if (result.success) {
          // Reload rooms from API
          const roomsResult = await cinemaRoomService.getRoomsByComplexIdManager(selectedCinema.complexId);
          if (roomsResult.success) {
            const mappedRooms = roomsResult.data.map(room => ({
              roomId: room.roomId,
              roomName: room.roomName,
              roomType: cinemaRoomService.mapRoomTypeFromBackend(room.roomType),
              rows: room.rows,
              cols: room.cols,
              seats: (room.seats || []).map(seat => ({
                seatId: seat.seatId,
                type: seat.type,
                row: seat.seatRow, // Map seatRow -> row
                column: seat.seatColumn // Map seatColumn -> column
              }))
            }));
            
            const cinemaIndex = cinemas.findIndex(c => c.complexId === selectedCinema.complexId);
            if (cinemaIndex !== -1) {
              const updatedCinemas = [...cinemas];
              updatedCinemas[cinemaIndex] = {
                ...updatedCinemas[cinemaIndex],
                rooms: mappedRooms
              };
              setCinemas(updatedCinemas);
              if (onCinemasChange) {
                onCinemasChange(updatedCinemas);
              }
            }
          }
          alert('Cập nhật phòng chiếu thành công');
          setShowRoomModal(false);
          setEditingRoom(null);
        } else {
          alert(result.error || 'Cập nhật phòng chiếu thất bại');
        }
      } else {
        // Create new room
        const result = await cinemaRoomService.createCinemaRoomManager(roomData);
        
        if (result.success) {
          // Reload rooms from API
          const roomsResult = await cinemaRoomService.getRoomsByComplexIdManager(selectedCinema.complexId);
          if (roomsResult.success) {
            const mappedRooms = roomsResult.data.map(room => ({
              roomId: room.roomId,
              roomName: room.roomName,
              roomType: cinemaRoomService.mapRoomTypeFromBackend(room.roomType),
              rows: room.rows,
              cols: room.cols,
              seats: (room.seats || []).map(seat => ({
                seatId: seat.seatId,
                type: seat.type,
                row: seat.seatRow, // Map seatRow -> row
                column: seat.seatColumn // Map seatColumn -> column
              }))
            }));
            
            const cinemaIndex = cinemas.findIndex(c => c.complexId === selectedCinema.complexId);
            if (cinemaIndex !== -1) {
              const updatedCinemas = [...cinemas];
              updatedCinemas[cinemaIndex] = {
                ...updatedCinemas[cinemaIndex],
                rooms: mappedRooms
              };
              setCinemas(updatedCinemas);
              if (onCinemasChange) {
                onCinemasChange(updatedCinemas);
              }
            }
          }
          alert('Tạo phòng chiếu thành công');
          setShowRoomModal(false);
          setEditingRoom(null);
        } else {
          alert(result.error || 'Tạo phòng chiếu thất bại');
        }
      }
    } catch (error) {
      alert('Có lỗi xảy ra khi lưu phòng chiếu');
    } finally {
      setSavingRoom(false);
    }
  };

  const handleDeleteRoom = async (cinema, roomId) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa phòng chiếu này?')) {
      return;
    }

    try {
      const { default: cinemaRoomService } = await import('../../services/cinemaRoomService');
      const result = await cinemaRoomService.deleteCinemaRoomManager(roomId);
      
      if (result.success) {
        // Reload rooms from API
        const roomsResult = await cinemaRoomService.getRoomsByComplexIdManager(cinema.complexId);
        if (roomsResult.success) {
          const mappedRooms = roomsResult.data.map(room => ({
            roomId: room.roomId,
            roomName: room.roomName,
            roomType: cinemaRoomService.mapRoomTypeFromBackend(room.roomType),
            rows: room.rows,
            cols: room.cols,
            seats: room.seats || []
          }));
          
          const cinemaIndex = cinemas.findIndex(c => c.complexId === cinema.complexId);
          if (cinemaIndex !== -1) {
            const updatedCinemas = [...cinemas];
            updatedCinemas[cinemaIndex] = {
              ...updatedCinemas[cinemaIndex],
              rooms: mappedRooms
            };
            setCinemas(updatedCinemas);
            if (onCinemasChange) {
              onCinemasChange(updatedCinemas);
            }
          }
        }
        
        if (selectedRoom?.roomId === roomId) {
          setSelectedRoom(null);
        }
        alert('Xóa phòng chiếu thành công');
      } else {
        alert(result.error || 'Xóa phòng chiếu thất bại');
      }
    } catch (error) {
      alert('Có lỗi xảy ra khi xóa phòng chiếu');
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

  const renderSeatLayout = (room) => {
    if (!room || !room.rows || !room.cols) return null;

    // Create a map of seats by row and column for quick lookup
    const seatMap = new Map();
    if (room.seats && room.seats.length > 0) {
      room.seats.forEach(seat => {
        const key = `${seat.row}-${seat.column}`;
        seatMap.set(key, seat);
      });
    }

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
    const buildRowSeats = (rowChar) => {
      const result = [];
      let lastColumn = 0;
      
      // Generate all seats for this row
      for (let col = 1; col <= room.cols; col++) {
        const key = `${rowChar}-${col}`;
        const seat = seatMap.get(key);
        
        // Check if there's a gap (walkway) before this seat
        if (lastColumn > 0 && col > lastColumn + 1) {
          // There's a gap - check if it contains walkways
          let hasWalkway = false;
          for (let c = lastColumn + 1; c < col; c++) {
            if (walkwayPositions.has(c)) {
              hasWalkway = true;
              break;
            }
          }
          
          if (hasWalkway) {
            // Calculate gap width based on number of missing columns
            const gapColumns = col - lastColumn - 1;
            const gapWidth = Math.max(32, gapColumns * 8); // Minimum 32px, or based on columns
            result.push({ type: 'gap', width: gapWidth });
          }
        }
        
        // Add seat (or placeholder if seat doesn't exist)
        if (seat) {
          result.push({ type: 'seat', seat });
        } else {
          // Create a placeholder seat if it doesn't exist in data
          result.push({ 
            type: 'seat', 
            seat: {
              seatId: null,
              type: 'NORMAL',
              row: rowChar,
              column: col
            }
          });
        }
        
        lastColumn = col;
      }
      
      return result;
    };

    // Generate all rows from A to the last row based on room.rows
    const rows = [];
    for (let i = 0; i < room.rows; i++) {
      const rowChar = String.fromCharCode(65 + i); // A, B, C, ...
      rows.push(rowChar);
    }

    return (
      <div className="seat-layout">
        <div className="seat-layout__screen">
          <div className="seat-layout__screen-label">🎬 Màn hình 🎬</div>
        </div>
        <div className="seat-layout__grid">
          {rows.map(row => {
            const rowItems = buildRowSeats(row);
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
                        key={seat.seatId || `${seat.row}-${seat.column}`}
                        className={`seat-button ${isCouple ? 'seat-button--couple' : ''}`}
                        style={{
                          backgroundColor: getSeatColor(seat.type),
                          borderColor: seat.status ? getSeatColor(seat.type) : '#666',
                          width: isCouple ? '64px' : '44px',
                          opacity: seat.seatId ? 1 : 0.5 // Dim placeholder seats
                        }}
                        onClick={() => seat.seatId && handleSeatClick(seat.seatId)}
                        disabled={!seat.seatId}
                        title={seat.seatId ? `${seat.seatId} - ${seat.type === 'NORMAL' ? 'Thường' : seat.type === 'VIP' ? 'VIP' : 'Đôi'}` : `${seat.row}${seat.column} - Chưa có dữ liệu`}
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

  console.log('ManagerCinemaManagement: Rendering with cinemas:', cinemas);
  console.log('ManagerCinemaManagement: cinemas.length:', cinemas?.length || 0);
  console.log('ManagerCinemaManagement: selectedCinema:', selectedCinema);

  return (
    <div className="cinema-management">
      <div className="cinema-management__header" style={{ marginBottom: '32px' }}>
        <div>
          <h2 style={{ margin: 0, color: '#fff', fontSize: '28px', fontWeight: 700, marginBottom: '8px' }}>
            Quản lý cụm rạp
          </h2>
          <p style={{ margin: 0, color: '#c9c4c5', fontSize: '15px', lineHeight: 1.6 }}>
            {cinemas && cinemas.length > 0 
              ? `Bạn đang quản lý ${cinemas.length} cụm rạp${cinemas.length > 1 ? '' : ''}. Quản lý phòng chiếu và lịch chiếu của cụm rạp.`
              : 'Chưa có cụm rạp nào được gán cho bạn. Vui lòng liên hệ admin để được gán cụm rạp.'}
          </p>
        </div>
      </div>
      <div className="cinema-management__content">
        {!cinemas || cinemas.length === 0 ? (
          <div className="cinema-empty-state" style={{ 
            textAlign: 'center', 
            padding: '60px 20px',
            color: '#c9c4c5'
          }}>
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ marginBottom: '16px', opacity: 0.5 }}>
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
              <circle cx="12" cy="10" r="3"/>
            </svg>
            <p style={{ fontSize: '16px', marginBottom: '8px' }}>Chưa có cụm rạp nào được gán cho bạn</p>
            <p style={{ fontSize: '14px', opacity: 0.7 }}>Vui lòng liên hệ admin để được gán cụm rạp</p>
          </div>
        ) : (
          <div className="cinema-list">
            {cinemas.map(cinema => (
              <div key={cinema.complexId} className="cinema-card" style={{
                background: 'linear-gradient(135deg, rgba(25, 18, 45, 0.8) 0%, rgba(12, 8, 24, 0.9) 100%)',
                border: '1px solid rgba(123, 97, 255, 0.3)',
                borderRadius: '20px',
                padding: '32px',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
                transition: 'all 0.3s ease'
              }}>
                <div className="cinema-card__header" style={{ marginBottom: '24px', paddingBottom: '24px', borderBottom: '1px solid rgba(123, 97, 255, 0.2)' }}>
                  <div className="cinema-card__info" style={{ width: '100%' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                      <div style={{
                        width: '56px',
                        height: '56px',
                        borderRadius: '16px',
                        background: 'linear-gradient(135deg, rgba(123, 97, 255, 0.3) 0%, rgba(232, 59, 65, 0.3) 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        border: '1px solid rgba(123, 97, 255, 0.4)'
                      }}>
                        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: '#7b61ff' }}>
                          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                          <circle cx="12" cy="10" r="3"/>
                        </svg>
                      </div>
                      <div style={{ flex: 1 }}>
                        <h3 className="cinema-card__name" style={{ 
                          margin: 0, 
                          fontSize: '26px', 
                          fontWeight: 700, 
                          color: '#fff',
                          marginBottom: '8px'
                        }}>
                          {cinema.name || 'Chưa có tên'}
                        </h3>
                        <div className="cinema-card__details" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#c9c4c5', fontSize: '14px' }}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                              <circle cx="12" cy="10" r="3"/>
                            </svg>
                            <span>{cinema.address || 'Chưa có địa chỉ'}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginTop: '16px' }}>
                      <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px',
                        padding: '8px 16px',
                        background: 'rgba(123, 97, 255, 0.2)',
                        border: '1px solid rgba(123, 97, 255, 0.3)',
                        borderRadius: '12px',
                        fontSize: '13px',
                        fontWeight: 600,
                        color: '#7b61ff'
                      }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="3" y="4" width="18" height="18" rx="2"/>
                          <line x1="3" y1="10" x2="21" y2="10"/>
                        </svg>
                        <span>{cinema.rooms?.length || 0} phòng chiếu</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="cinema-card__rooms" style={{ marginTop: '24px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <h4 style={{ margin: 0, color: '#fff', fontSize: '20px', fontWeight: 600 }}>
                      Phòng chiếu
                    </h4>
                    <button 
                      className="btn btn--primary btn--small" 
                      onClick={() => handleAddRoom(cinema)}
                      style={{ display: 'flex', alignItems: 'center', gap: '8px' }}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="12" y1="5" x2="12" y2="19"/>
                        <line x1="5" y1="12" x2="19" y2="12"/>
                      </svg>
                      Thêm phòng
                    </button>
                  </div>
                  {cinema.rooms && cinema.rooms.length === 0 ? (
                    <div className="cinema-empty" style={{
                      textAlign: 'center',
                      padding: '48px 20px',
                      color: 'rgba(255, 255, 255, 0.5)',
                      fontSize: '14px',
                      background: 'rgba(10, 6, 20, 0.4)',
                      borderRadius: '12px',
                      border: '1px dashed rgba(123, 97, 255, 0.2)'
                    }}>
                      <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ marginBottom: '12px', opacity: 0.4, margin: '0 auto 12px' }}>
                        <rect x="3" y="4" width="18" height="18" rx="2"/>
                        <line x1="3" y1="10" x2="21" y2="10"/>
                      </svg>
                      <p style={{ margin: 0 }}>Chưa có phòng chiếu. Nhấn "Thêm phòng" để tạo mới.</p>
                    </div>
                  ) : (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
                      {cinema.rooms.map(room => (
                        <div key={room.roomId} className="room-card" style={{
                          background: 'rgba(10, 6, 20, 0.6)',
                          border: '1px solid rgba(123, 97, 255, 0.2)',
                          borderRadius: '16px',
                          padding: '20px',
                          transition: 'all 0.2s ease'
                        }}>
                          <div className="room-card__header">
                            <div className="room-card__info">
                              <h4 className="room-card__name" style={{ 
                                fontSize: '18px', 
                                fontWeight: 700, 
                                margin: '0 0 12px', 
                                color: '#fff' 
                              }}>
                                {room.roomName}
                              </h4>
                              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '16px' }}>
                                <span style={{
                                  display: 'inline-block',
                                  padding: '4px 12px',
                                  background: 'rgba(123, 97, 255, 0.2)',
                                  border: '1px solid rgba(123, 97, 255, 0.3)',
                                  borderRadius: '8px',
                                  fontSize: '12px',
                                  fontWeight: 600,
                                  color: '#7b61ff'
                                }}>
                                  {room.roomType}
                                </span>
                                <span style={{
                                  display: 'inline-block',
                                  padding: '4px 12px',
                                  background: 'rgba(232, 59, 65, 0.2)',
                                  border: '1px solid rgba(232, 59, 65, 0.3)',
                                  borderRadius: '8px',
                                  fontSize: '12px',
                                  fontWeight: 600,
                                  color: '#e83b41'
                                }}>
                                  {room.rows} × {room.cols}
                                </span>
                              </div>
                            </div>
                            <div className="room-card__actions" style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                              <button
                                className="btn btn--ghost btn--small"
                                onClick={() => openShowtimes(cinema, room)}
                                style={{ flex: 1, minWidth: '120px' }}
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
                      ))}
                    </div>
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
                    <p className="movie-modal__warning">⚠️ Thay đổi số hàng/cột sẽ tạo lại toàn bộ layout ghế.</p>
                  </div>
                )}
              </div>
            </div>
            <div className="movie-modal__footer">
              <button className="btn btn--ghost" onClick={() => setShowRoomModal(false)}>Hủy</button>
              <button 
                type="button"
                className="btn btn--primary" 
                onClick={handleSaveRoom}
                disabled={savingRoom}
              >
                {savingRoom ? 'Đang xử lý...' : (editingRoom ? 'Cập nhật' : 'Thêm phòng')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ManagerCinemaManagement;


