import React, { useState, useEffect } from 'react';
import { useEnums } from '../../hooks/useEnums';
import { enumService } from '../../services/enumService';
import { generateSeats } from './utils';

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

// Cinema Management Component
function CinemaManagement({ cinemas: initialCinemasList, onCinemasChange }) {
  const { enums } = useEnums();
  const [cinemas, setCinemas] = useState(initialCinemasList);
  
  // Map room types from backend (TYPE_2D) to display format (2D)
  const roomTypes = enums.roomTypes?.map(rt => enumService.mapRoomTypeToDisplay(rt)) || [];
  const seatTypes = enums.seatTypes || [];
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
    setCinemaFormData({ name: '', addressDescription: '', addressProvince: 'Hồ Chí Minh' });
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
      const currentIndex = seatTypes.indexOf(currentSeat.type);
      const nextIndex = (currentIndex + 1) % seatTypes.length;
      const newType = seatTypes[nextIndex];
      
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
          Thêm cụm rạp mới
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
                      {roomTypes.map(type => (
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

export default CinemaManagement;


