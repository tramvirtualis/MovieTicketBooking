import React, { useState, useEffect } from 'react';
import { useEnums } from '../../hooks/useEnums';
import { enumService } from '../../services/enumService';
import { generateSeats } from './utils';
import cinemaComplexService from '../../services/cinemaComplexService';
import ConfirmDeleteModal from '../Common/ConfirmDeleteModal';

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
  const [cinemas, setCinemas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState(null);
  
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
  const [deleteConfirm, setDeleteConfirm] = useState(null);
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
  const [roomHasBookings, setRoomHasBookings] = useState(false);
  const [checkingBookings, setCheckingBookings] = useState(false);

  // Load cinema complexes from API
  useEffect(() => {
    const loadCinemaComplexes = async () => {
      setLoading(true);
      try {
        const result = await cinemaComplexService.getAllCinemaComplexes();
        if (result.success) {
          // Map backend data to frontend format
          let mappedCinemas = result.data.map(item => ({
            complexId: item.complexId,
            name: item.name,
            address: item.fullAddress || `${item.addressDescription}, ${item.addressProvince}`,
            rooms: [] // Rooms will be loaded separately
          }));
          
          // Load rooms for each cinema complex
          const { default: cinemaRoomService } = await import('../../services/cinemaRoomService');
          const roomsPromises = mappedCinemas.map(async (cinema) => {
            try {
              const roomsResult = await cinemaRoomService.getRoomsByComplexId(cinema.complexId);
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
              return cinema;
            } catch (error) {
              console.error(`Error loading rooms for cinema ${cinema.complexId}:`, error);
              return cinema;
            }
          });
          
          mappedCinemas = await Promise.all(roomsPromises);
          
          setCinemas(mappedCinemas);
          if (onCinemasChange) {
            onCinemasChange(mappedCinemas);
          }
        } else {
          showNotification(result.error || 'Không thể tải danh sách cụm rạp', 'error');
        }
      } catch (error) {
        showNotification('Có lỗi xảy ra khi tải danh sách cụm rạp', 'error');
      } finally {
        setLoading(false);
      }
    };

    loadCinemaComplexes();
  }, [onCinemasChange]);

  useEffect(() => {
    if (onCinemasChange && cinemas.length > 0) {
      onCinemasChange(cinemas);
    }
  }, [cinemas, onCinemasChange]);

  // Notification component
  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 3000);
  };

  // Handle cinema operations
  const handleAddCinema = () => {
    setEditingCinema(null);
    setCinemaFormData({ name: '', addressDescription: '', addressProvince: 'Hồ Chí Minh' });
    setShowCinemaModal(true);
  };

  const handleEditCinema = async (cinema) => {
    try {
      // Load full cinema data from API
      const result = await cinemaComplexService.getCinemaComplexById(cinema.complexId);
      if (result.success) {
        const cinemaData = result.data;
        setEditingCinema(cinema);
        setCinemaFormData({
          name: cinemaData.name,
          addressDescription: cinemaData.addressDescription || '',
          addressProvince: cinemaData.addressProvince || 'Hồ Chí Minh'
        });
        setShowCinemaModal(true);
      } else {
        showNotification(result.error || 'Không thể tải thông tin cụm rạp', 'error');
      }
    } catch (error) {
      showNotification('Có lỗi xảy ra khi tải thông tin cụm rạp', 'error');
    }
  };

  const handleSaveCinema = async () => {
    if (!cinemaFormData.name || !cinemaFormData.addressDescription || !cinemaFormData.addressProvince) {
      showNotification('Vui lòng điền đầy đủ thông tin', 'error');
      return;
    }

    setLoading(true);
    try {
      const cinemaComplexData = {
        name: cinemaFormData.name.trim(),
        addressDescription: cinemaFormData.addressDescription.trim(),
        addressProvince: cinemaFormData.addressProvince
      };

      if (editingCinema) {
        // Update existing cinema
        const result = await cinemaComplexService.updateCinemaComplex(editingCinema.complexId, cinemaComplexData);
        
        if (result.success) {
          // Reload cinemas from API with rooms
          const loadResult = await cinemaComplexService.getAllCinemaComplexes();
          if (loadResult.success) {
            // Map backend data to frontend format
            let mappedCinemas = loadResult.data.map(item => ({
              complexId: item.complexId,
              name: item.name,
              address: item.fullAddress || `${item.addressDescription}, ${item.addressProvince}`,
              rooms: [] // Rooms will be loaded separately
            }));
            
            // Load rooms for each cinema complex
            const { default: cinemaRoomService } = await import('../../services/cinemaRoomService');
            const roomsPromises = mappedCinemas.map(async (cinema) => {
              try {
                const roomsResult = await cinemaRoomService.getRoomsByComplexId(cinema.complexId);
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
                return cinema;
              } catch (error) {
                console.error(`Error loading rooms for cinema ${cinema.complexId}:`, error);
                return cinema;
              }
            });
            
            mappedCinemas = await Promise.all(roomsPromises);
            
            setCinemas(mappedCinemas);
            if (onCinemasChange) {
              onCinemasChange(mappedCinemas);
            }
          }
          showNotification('Cập nhật cụm rạp thành công', 'success');
          setShowCinemaModal(false);
          setEditingCinema(null);
        } else {
          showNotification(result.error || 'Cập nhật cụm rạp thất bại', 'error');
        }
      } else {
        // Create new cinema
        const result = await cinemaComplexService.createCinemaComplex(cinemaComplexData);
        
        if (result.success) {
          // Reload cinemas from API with rooms
          const loadResult = await cinemaComplexService.getAllCinemaComplexes();
          if (loadResult.success) {
            // Map backend data to frontend format
            let mappedCinemas = loadResult.data.map(item => ({
              complexId: item.complexId,
              name: item.name,
              address: item.fullAddress || `${item.addressDescription}, ${item.addressProvince}`,
              rooms: [] // Rooms will be loaded separately
            }));
            
            // Load rooms for each cinema complex
            const { default: cinemaRoomService } = await import('../../services/cinemaRoomService');
            const roomsPromises = mappedCinemas.map(async (cinema) => {
              try {
                const roomsResult = await cinemaRoomService.getRoomsByComplexId(cinema.complexId);
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
                return cinema;
              } catch (error) {
                console.error(`Error loading rooms for cinema ${cinema.complexId}:`, error);
                return cinema;
              }
            });
            
            mappedCinemas = await Promise.all(roomsPromises);
            
            setCinemas(mappedCinemas);
            if (onCinemasChange) {
              onCinemasChange(mappedCinemas);
            }
          }
          showNotification('Thêm cụm rạp thành công', 'success');
          setShowCinemaModal(false);
          setEditingCinema(null);
        } else {
          showNotification(result.error || 'Thêm cụm rạp thất bại', 'error');
        }
      }
    } catch (error) {
      showNotification('Có lỗi xảy ra khi lưu cụm rạp', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCinema = (complexId) => {
    const cinema = cinemas.find(c => c.complexId === complexId);
    setDeleteConfirm({ 
      type: 'cinema', 
      id: complexId, 
      name: cinema?.name || 'cụm rạp này',
      cinema: cinema
    });
  };

  const confirmDeleteCinema = async () => {
    if (!deleteConfirm || deleteConfirm.type !== 'cinema') return;

    setLoading(true);
    const complexId = deleteConfirm.id;
    try {
      const result = await cinemaComplexService.deleteCinemaComplex(complexId);
      
      if (result.success) {
        // Reload cinemas from API with rooms
        const loadResult = await cinemaComplexService.getAllCinemaComplexes();
        if (loadResult.success) {
          // Map backend data to frontend format
          let mappedCinemas = loadResult.data.map(item => ({
            complexId: item.complexId,
            name: item.name,
            address: item.fullAddress || `${item.addressDescription}, ${item.addressProvince}`,
            rooms: [] // Rooms will be loaded separately
          }));
          
          // Load rooms for each cinema complex
          const { default: cinemaRoomService } = await import('../../services/cinemaRoomService');
          const roomsPromises = mappedCinemas.map(async (cinema) => {
            try {
              const roomsResult = await cinemaRoomService.getRoomsByComplexId(cinema.complexId);
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
              return cinema;
            } catch (error) {
              console.error(`Error loading rooms for cinema ${cinema.complexId}:`, error);
              return cinema;
            }
          });
          
          mappedCinemas = await Promise.all(roomsPromises);
          
          setCinemas(mappedCinemas);
          if (onCinemasChange) {
            onCinemasChange(mappedCinemas);
          }
        }
        
        if (selectedCinema?.complexId === complexId) {
          setSelectedCinema(null);
          setSelectedRoom(null);
        }
        setDeleteConfirm(null);
        showNotification('Xóa cụm rạp thành công', 'success');
      } else {
        showNotification(result.error || 'Xóa cụm rạp thất bại', 'error');
      }
    } catch (error) {
      showNotification('Có lỗi xảy ra khi xóa cụm rạp', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Show loading state
  if (loading && cinemas.length === 0) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '400px',
        color: '#fff'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '48px',
            height: '48px',
            border: '4px solid rgba(232, 59, 65, 0.3)',
            borderTop: '4px solid #e83b41',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px'
          }}></div>
          <p>Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  // Handle room operations
  const handleAddRoom = (cinema) => {
    setEditingRoom(null);
    setRoomFormData({ roomName: '', roomType: '2D', rows: 10, cols: 12 });
    setSelectedCinema(cinema);
    setRoomHasBookings(false);
    setShowRoomModal(true);
  };

  const handleEditRoom = async (cinema, room) => {
    setEditingRoom(room);
    setSelectedCinema(cinema);
    setRoomFormData({
      roomName: room.roomName,
      roomType: room.roomType,
      rows: room.rows,
      cols: room.cols
    });
    
    // Kiểm tra xem phòng có đặt chỗ không
    setCheckingBookings(true);
    try {
      const { default: cinemaRoomService } = await import('../../services/cinemaRoomService');
      const result = await cinemaRoomService.checkRoomHasBookings(room.roomId);
      if (result.success) {
        setRoomHasBookings(result.hasBookings);
      } else {
        setRoomHasBookings(false);
      }
    } catch (error) {
      console.error('Error checking bookings:', error);
      setRoomHasBookings(false);
    } finally {
      setCheckingBookings(false);
    }
    
    setShowRoomModal(true);
  };

  const handleSaveRoom = async (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    if (!roomFormData.roomName || !roomFormData.rows || !roomFormData.cols) {
      showNotification('Vui lòng điền đầy đủ thông tin', 'error');
      return;
    }

    if (!selectedCinema) {
      showNotification('Vui lòng chọn cụm rạp', 'error');
      return;
    }

    // Prevent multiple calls
    if (loading) {
      return;
    }

    setLoading(true);
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
        const result = await cinemaRoomService.updateCinemaRoom(editingRoom.roomId, roomData);
        
        if (result.success) {
          // Reload rooms from API
          const roomsResult = await cinemaRoomService.getRoomsByComplexId(selectedCinema.complexId);
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
          showNotification('Cập nhật phòng chiếu thành công', 'success');
          setShowRoomModal(false);
          setEditingRoom(null);
        } else {
          showNotification(result.error || 'Cập nhật phòng chiếu thất bại', 'error');
        }
      } else {
        // Create new room
        const result = await cinemaRoomService.createCinemaRoom(roomData);
        
        if (result.success) {
          // Reload rooms from API
          const roomsResult = await cinemaRoomService.getRoomsByComplexId(selectedCinema.complexId);
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
          showNotification('Tạo phòng chiếu thành công', 'success');
          setShowRoomModal(false);
          setEditingRoom(null);
        } else {
          showNotification(result.error || 'Tạo phòng chiếu thất bại', 'error');
        }
      }
    } catch (error) {
      showNotification('Có lỗi xảy ra khi lưu phòng chiếu', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRoom = (cinema, roomId) => {
    const room = cinema.rooms.find(r => r.roomId === roomId);
    setDeleteConfirm({ 
      type: 'room', 
      id: roomId, 
      name: room?.roomName || 'phòng chiếu này',
      cinema: cinema
    });
  };

  const confirmDeleteRoom = async () => {
    if (!deleteConfirm || deleteConfirm.type !== 'room') return;

    setLoading(true);
    const roomId = deleteConfirm.id;
    const cinema = deleteConfirm.cinema;
    try {
      const { default: cinemaRoomService } = await import('../../services/cinemaRoomService');
      const result = await cinemaRoomService.deleteCinemaRoom(roomId);
      
      if (result.success) {
        // Reload rooms from API
        const roomsResult = await cinemaRoomService.getRoomsByComplexId(cinema.complexId);
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
        setDeleteConfirm(null);
        showNotification('Xóa phòng chiếu thành công', 'success');
      } else {
        showNotification(result.error || 'Xóa phòng chiếu thất bại', 'error');
      }
    } catch (error) {
      showNotification('Có lỗi xảy ra khi xóa phòng chiếu', 'error');
    } finally {
      setLoading(false);
    }
  };

  const confirmDelete = async () => {
    if (deleteConfirm?.type === 'cinema') {
      await confirmDeleteCinema();
    } else if (deleteConfirm?.type === 'room') {
      await confirmDeleteRoom();
    }
  };

  // Handle seat operations
  const handleSeatClick = async (seatId) => {
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
    if (!currentSeat || !currentSeat.seatId) return; // Không có seatId thì không thể lưu
    
    const currentIndex = seatTypes.indexOf(currentSeat.type);
    const nextIndex = (currentIndex + 1) % seatTypes.length;
    const newType = seatTypes[nextIndex];
    
    // Optimistic update: cập nhật UI trước
    updatedRoom.seats = updatedRoom.seats.map(s =>
      s.seatId === seatId ? { ...s, type: newType } : s
    );
    
    updatedRooms[roomIndex] = updatedRoom;
    updatedCinema.rooms = updatedRooms;
    updatedCinemas[cinemaIndex] = updatedCinema;
    
    setCinemas(updatedCinemas);
    setSelectedRoom(updatedRoom);
    
    // Gọi API để lưu vào database
    try {
      const { default: cinemaRoomService } = await import('../../services/cinemaRoomService');
      const result = await cinemaRoomService.updateSeatType(seatId, newType);
      
      if (!result.success) {
        // Nếu API thất bại, revert lại state
        const revertedCinemas = [...cinemas];
        const revertedCinema = { ...revertedCinemas[cinemaIndex] };
        const revertedRooms = [...revertedCinema.rooms];
        const revertedRoom = { ...revertedRooms[roomIndex] };
        revertedRoom.seats = revertedRoom.seats.map(s =>
          s.seatId === seatId ? { ...s, type: currentSeat.type } : s
        );
        revertedRooms[roomIndex] = revertedRoom;
        revertedCinema.rooms = revertedRooms;
        revertedCinemas[cinemaIndex] = revertedCinema;
        setCinemas(revertedCinemas);
        setSelectedRoom(revertedRoom);
        
        showNotification(result.error || 'Không thể cập nhật loại ghế', 'error');
      }
    } catch (error) {
      // Nếu có lỗi, revert lại state
      const revertedCinemas = [...cinemas];
      const revertedCinema = { ...revertedCinemas[cinemaIndex] };
      const revertedRooms = [...revertedCinema.rooms];
      const revertedRoom = { ...revertedRooms[roomIndex] };
      revertedRoom.seats = revertedRoom.seats.map(s =>
        s.seatId === seatId ? { ...s, type: currentSeat.type } : s
      );
      revertedRooms[roomIndex] = revertedRoom;
      revertedCinema.rooms = revertedRooms;
      revertedCinemas[cinemaIndex] = revertedCinema;
      setCinemas(revertedCinemas);
      setSelectedRoom(revertedRoom);
      
      showNotification('Có lỗi xảy ra khi cập nhật loại ghế', 'error');
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
                <div className="seat-layout__row-label" style={{
                  minWidth: '32px',
                  textAlign: 'center',
                  color: '#fff',
                  fontWeight: 600,
                  fontSize: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: '12px'
                }}>
                  {row}
                </div>
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
                        {seat.type !== 'NORMAL' && (
                          <span className="seat-button__type">
                            {seat.type === 'COUPLE' ? '💑' : seat.type === 'VIP' ? '⭐' : ''}
                          </span>
                        )}
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
    <>
      {/* Notification Toast */}
      {notification && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          zIndex: 10000,
          padding: '16px 20px',
          borderRadius: '12px',
          background: notification.type === 'success' 
            ? 'rgba(76, 175, 80, 0.95)' 
            : 'rgba(244, 67, 54, 0.95)',
          color: '#fff',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          minWidth: '300px',
          maxWidth: '500px',
          animation: 'slideInRight 0.3s ease-out',
          border: `1px solid ${notification.type === 'success' ? 'rgba(76, 175, 80, 1)' : 'rgba(244, 67, 54, 1)'}`
        }}>
          <div style={{
            width: '24px',
            height: '24px',
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            {notification.type === 'success' ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            )}
          </div>
          <span>{notification.message}</span>
        </div>
      )}
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
                      disabled={editingRoom && (roomHasBookings || checkingBookings)}
                      style={{
                        opacity: editingRoom && (roomHasBookings || checkingBookings) ? 0.6 : 1,
                        cursor: editingRoom && (roomHasBookings || checkingBookings) ? 'not-allowed' : 'text'
                      }}
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
                      disabled={editingRoom && (roomHasBookings || checkingBookings)}
                      style={{
                        opacity: editingRoom && (roomHasBookings || checkingBookings) ? 0.6 : 1,
                        cursor: editingRoom && (roomHasBookings || checkingBookings) ? 'not-allowed' : 'text'
                      }}
                    />
                  </div>
                </div>
                {editingRoom && (
                  <div className="movie-form__group">
                    {checkingBookings ? (
                      <p className="movie-modal__warning" style={{ color: '#ffd159' }}>
                        🔄 Đang kiểm tra đặt chỗ...
                      </p>
                    ) : roomHasBookings ? (
                      <p className="movie-modal__warning" style={{ color: '#e83b41' }}>
                        ⚠️ Phòng chiếu này đã có đặt chỗ. Không thể chỉnh sửa số hàng/cột.
                      </p>
                    ) : (
                      <p className="movie-modal__warning">
                        ⚠️ Thay đổi số hàng/cột sẽ xóa toàn bộ ghế hiện tại và tạo lại layout mới.
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
            <div className="movie-modal__footer">
              <button className="btn btn--ghost" onClick={() => setShowRoomModal(false)}>
                Hủy
              </button>
              <button 
                type="button"
                className="btn btn--primary" 
                onClick={handleSaveRoom}
                disabled={loading}
              >
                {loading ? 'Đang xử lý...' : (editingRoom ? 'Cập nhật' : 'Thêm phòng')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmDeleteModal
        isOpen={deleteConfirm !== null}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={confirmDelete}
        title={deleteConfirm?.name}
        message={
          deleteConfirm?.type === 'cinema' 
            ? `Bạn có chắc chắn muốn xóa cụm rạp "${deleteConfirm.name}"? Tất cả phòng chiếu sẽ bị xóa.`
            : deleteConfirm?.type === 'room'
            ? `Bạn có chắc chắn muốn xóa phòng chiếu "${deleteConfirm.name}"?`
            : ''
        }
        confirmText={deleteConfirm?.type === 'cinema' ? 'Xóa cụm rạp' : 'Xóa phòng chiếu'}
        isDeleting={loading}
      />
    </div>
  </>
  );
}

export default CinemaManagement;


