import React, { useState, useEffect, useMemo } from 'react';
import showtimeService from '../../services/showtimeService';
import movieService from '../../services/movieService';
import { cinemaRoomService } from '../../services/cinemaRoomService';
import { addToCalendar } from '../../utils/calendarUtils';
import ConfirmDeleteModal from '../Common/ConfirmDeleteModal';
import '../../styles/components/showtime-timeline.css';
import ExcelJS from 'exceljs';

// Helper function to get Monday of the week for a given date
const getMondayOfWeek = (date) => {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
  return new Date(d.setDate(diff));
};

const truncateMovieTitle = (title, maxLength = 15) => {
  if (!title) return '';
  const trimmed = title.trim();
  if (trimmed.length <= maxLength) return trimmed;
  return `${trimmed.slice(0, maxLength).trim()}...`;
};

export default function ManagerShowtimeManagement({ complexId }) {
  const [rooms, setRooms] = useState([]);
  const [selectedRooms, setSelectedRooms] = useState([]); // Rooms to load showtimes for
  const [visibleRooms, setVisibleRooms] = useState(new Set()); // Rooms to display in grid
  const [showtimes, setShowtimes] = useState([]);
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingShowtimes, setLoadingShowtimes] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [notification, setNotification] = useState(null);
  const [filterMovie, setFilterMovie] = useState('');
  const [selectedMovie, setSelectedMovie] = useState(null); // Phim đang được chọn để tạo lịch
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [quickCreateData, setQuickCreateData] = useState(null); // Data cho quick create từ click vào ô
  const [dragOverCell, setDragOverCell] = useState(null); // Track cell đang drag over
  const [dragConflict, setDragConflict] = useState(null); // Track conflict khi drag
  const [minuteInput, setMinuteInput] = useState('00');
  // Always start from Monday of the current week
  const [currentDate, setCurrentDate] = useState(() => getMondayOfWeek(new Date()));
  const dateRange = 7; // Always 7 days (Monday to Sunday)
  const [selectedShowtime, setSelectedShowtime] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  const [createForm, setCreateForm] = useState({
    movieId: '',
    roomId: null, // Chỉ chọn 1 phòng
    startDate: '',
    startTime: '', // Time picker thay vì timeSlots
    language: '',
    format: '',
    minTime: null,
    maxTime: null
  });
  
  // Available options based on selected movie
  const [availableLanguages, setAvailableLanguages] = useState([]);
  const [availableFormats, setAvailableFormats] = useState([]);
  const [availableRooms, setAvailableRooms] = useState([]);

  useEffect(() => {
    if (createForm.startTime) {
      const minute = createForm.startTime.split(':')[1] || '00';
      setMinuteInput(minute);
    } else {
      setMinuteInput('00');
    }
  }, [createForm.startTime]);

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 3000);
  };

  // Load rooms
  useEffect(() => {
    const loadRooms = async () => {
      console.log('=== ManagerShowtimeManagement: Loading rooms ===');
      console.log('complexId:', complexId);
      if (!complexId) {
        console.log('No complexId, skipping room load');
        return;
      }
      try {
        setLoading(true);
        console.log('Calling getRoomsByComplexIdManager with:', complexId);
        const result = await cinemaRoomService.getRoomsByComplexIdManager(complexId);
        console.log('getRoomsByComplexId result:', result);
        if (result.success && result.data) {
          console.log('Rooms loaded:', result.data);
          setRooms(result.data);
          if (result.data.length > 0) {
            const roomIds = result.data.map(r => r.roomId);
            setSelectedRooms(roomIds); // Load showtimes for all rooms
            setVisibleRooms(new Set(roomIds)); // Display all rooms by default
          } else {
            console.log('No rooms found for complexId:', complexId);
          }
        } else {
          console.error('Failed to load rooms:', result.error);
          showNotification(result.error || 'Không thể tải danh sách phòng', 'error');
        }
      } catch (error) {
        console.error('Error loading rooms:', error);
        showNotification('Không thể tải danh sách phòng', 'error');
      } finally {
        setLoading(false);
      }
    };
    loadRooms();
  }, [complexId]);

  // Load movies
  useEffect(() => {
    const loadMovies = async () => {
      try {
        const result = await movieService.getAllMoviesManager();
        if (result.success && result.data) {
          setMovies(result.data);
        } else {
          console.error('Error loading movies:', result.error);
          showNotification(result.error || 'Không thể tải danh sách phim', 'error');
        }
      } catch (error) {
        console.error('Error loading movies:', error);
        showNotification('Không thể tải danh sách phim', 'error');
      }
    };
    loadMovies();
  }, []);

  // Load showtimes for selected rooms and date range
  useEffect(() => {
    const loadShowtimes = async () => {
      console.log('=== ManagerShowtimeManagement: Loading showtimes ===');
      console.log('selectedRooms:', selectedRooms);
      console.log('currentDate:', currentDate);
      if (selectedRooms.length === 0) {
        console.log('No selected rooms, skipping showtime load');
        setShowtimes([]);
        return;
      }
      try {
        setLoadingShowtimes(true);
        const allShowtimes = [];
        
        // Calculate date range (always Monday to Sunday, 7 days)
        const monday = getMondayOfWeek(currentDate);
        const startDate = new Date(monday);
        const endDate = new Date(monday);
        endDate.setDate(endDate.getDate() + 6); // Sunday (6 days after Monday)
        
        console.log('Loading showtimes from', startDate.toISOString().split('T')[0], 'to', endDate.toISOString().split('T')[0]);
        
        for (const roomId of selectedRooms) {
          console.log('Loading showtimes for roomId:', roomId);
          const result = await showtimeService.getShowtimesByRoomId(roomId);
          console.log('getShowtimesByRoomId result for roomId', roomId, ':', result);
          if (result.success && result.data) {
            console.log('Showtimes found for roomId', roomId, ':', result.data.length);
            const mappedShowtimes = result.data.map(st => {
              const startDateTime = new Date(st.startTime);
              const endDateTime = new Date(st.endTime);
              // Use local date format instead of UTC to avoid timezone issues
              const date = formatDateLocal(startDateTime);
              const showtimeDate = new Date(startDateTime.getFullYear(), startDateTime.getMonth(), startDateTime.getDate());
              
              // Include showtimes within date range
              if (showtimeDate < startDate || showtimeDate > endDate) {
                return null;
              }
              
              const startTime = startDateTime.toTimeString().slice(0, 5);
              const endTime = endDateTime.toTimeString().slice(0, 5);
              const movieId = st.movieVersion?.movie?.movieId || st.movieId;
              const language = showtimeService.mapLanguageFromBackend(st.language || st.movieVersion?.language);
              const format = showtimeService.mapRoomTypeFromBackend(st.roomType || st.movieVersion?.roomType || st.format);
              
              return {
                showtimeId: st.showtimeId,
                roomId: st.cinemaRoom?.roomId || roomId,
                roomName: st.cinemaRoom?.roomName || rooms.find(r => r.roomId === roomId)?.roomName || 'Phòng',
                movieId: movieId,
                movieTitle: st.movieVersion?.movie?.title || st.movieTitle,
                date: date,
                startTime: startTime,
                endTime: endTime,
                startDateTime: st.startTime,
                endDateTime: st.endTime,
                startHour: parseInt(startTime.split(':')[0]),
                startMinute: parseInt(startTime.split(':')[1]),
                endHour: parseInt(endTime.split(':')[0]),
                endMinute: parseInt(endTime.split(':')[1]),
                duration: (new Date(st.endTime) - new Date(st.startTime)) / (1000 * 60), // minutes
                language: language,
                format: format,
                cinemaName: st.cinemaRoom?.cinemaComplex?.name || '',
                cinemaAddress: st.cinemaRoom?.cinemaComplex?.fullAddress || ''
              };
            }).filter(Boolean);
            console.log('Mapped showtimes for roomId', roomId, ':', mappedShowtimes.length);
            allShowtimes.push(...mappedShowtimes);
          } else {
            console.log('No showtimes or error for roomId', roomId, ':', result.error);
          }
        }
        console.log('Total showtimes loaded:', allShowtimes.length);
        setShowtimes(allShowtimes);
      } catch (error) {
        console.error('Error loading showtimes:', error);
        showNotification('Không thể tải lịch chiếu', 'error');
        setShowtimes([]);
      } finally {
        setLoadingShowtimes(false);
      }
    };
    loadShowtimes();
  }, [selectedRooms, rooms, currentDate, dateRange]);

  // Helper function to compute end time
  const computeEndTime = (date, startTime, movieId) => {
    const movie = movies.find(m => m.movieId === Number(movieId));
    const duration = movie ? movie.duration : 0;
    if (!duration || !startTime) return '';
    const start = new Date(`${date}T${startTime}:00`);
    const end = new Date(start.getTime() + duration * 60000 + 15 * 60000); // +15 phút buffer
    return end.toTimeString().slice(0, 5);
  };

  // Helper function to check overlap
  const hasOverlap = (list, date, startTime, endTime, roomId = null) => {
    if (!startTime || !endTime) return [];
    const s = new Date(`${date}T${startTime}:00`).getTime();
    const e = new Date(`${date}T${endTime}:00`).getTime();
    const conflicts = (list || []).filter(st => {
      if (st.date !== date) return false;
      // Nếu có roomId, chỉ kiểm tra conflict trong cùng phòng
      if (roomId && st.roomId !== roomId) return false;
      if (!st.startTime || !st.endTime) return false;
      const ss = new Date(`${st.date}T${st.startTime}:00`).getTime();
      const ee = new Date(`${st.date}T${st.endTime}:00`).getTime();
      return Math.max(s, ss) < Math.min(e, ee);
    });
    return conflicts;
  };

  const updateMinuteValue = (value) => {
    let numeric = parseInt(value, 10);
    if (Number.isNaN(numeric)) numeric = 0;
    numeric = Math.max(0, Math.min(59, numeric));
    const formattedMinute = String(numeric).padStart(2, '0');
    setMinuteInput(formattedMinute);
    const hourPart = (createForm.minTime || createForm.startTime || '00:00').split(':')[0];
    if (hourPart) {
      setCreateForm(prev => ({ ...prev, startTime: `${hourPart}:${formattedMinute}` }));
    }
  };

  // Generate time slots (10:00 to 01:00 next day)
  const timeSlots = useMemo(() => {
    const slots = [];
    // 10:00 to 23:00
    for (let hour = 10; hour <= 23; hour++) {
      slots.push({ hour, minute: 0, label: `${String(hour).padStart(2, '0')}:00` });
    }
    // 00:00 to 01:00
    for (let hour = 0; hour <= 1; hour++) {
      slots.push({ hour, minute: 0, label: `${String(hour).padStart(2, '0')}:00` });
    }
    return slots;
  }, []);

  // Get showtimes that start at a specific hour for a room
  const getShowtimeStartingAt = (roomId, hour) => {
    return showtimes.find(st => {
      if (st.roomId !== roomId) return false;
      if (filterMovie && String(st.movieId) !== filterMovie) return false;
      return st.startHour === hour && st.startMinute === 0;
    });
  };

  // Calculate position and width for showtime block
  const getShowtimeBlockStyle = (showtime) => {
    // Convert to minutes from midnight
    let startMinutes = showtime.startHour * 60 + showtime.startMinute;
    let endMinutes = showtime.endHour * 60 + showtime.endMinute;
    
    // Handle next day (endHour < startHour or endHour is 0-1)
    if (showtime.endHour < showtime.startHour || (showtime.startHour >= 22 && showtime.endHour <= 1)) {
      if (showtime.endHour <= 1) {
        endMinutes = (showtime.endHour + 24) * 60 + showtime.endMinute;
      } else {
        endMinutes += 24 * 60;
      }
    }
    
    // Calculate relative to 10:00 (600 minutes)
    const baseMinutes = 10 * 60; // 10:00 = 600 minutes
    let relativeStart = startMinutes - baseMinutes;
    
    // Handle times before 10:00 (shouldn't happen but just in case)
    if (relativeStart < 0) {
      relativeStart += 24 * 60;
    }
    
    const duration = endMinutes - startMinutes;
    
    // Each hour = 60px, each minute = 1px
    const left = relativeStart;
    const width = Math.max(duration, 60); // Minimum 60px (1 hour)
    
    return {
      left: `${left}px`,
      width: `${width}px`,
      minWidth: `${Math.max(duration, 60)}px`
    };
  };

  // Get movie color
  const getMovieColor = (movieId) => {
    const colors = [
      '#4285f4', '#ea4335', '#fbbc04', '#34a853', '#ff6d00',
      '#9c27b0', '#00bcd4', '#ff9800', '#4caf50', '#e91e63',
      '#3f51b5', '#009688', '#ff5722', '#795548', '#607d8b'
    ];
    return colors[movieId % colors.length];
  };

  const navigateDate = (weeks) => {
    const newDate = new Date(currentDate);
    newDate.setDate(newDate.getDate() + (weeks * 7));
    // Ensure it's still Monday
    setCurrentDate(getMondayOfWeek(newDate));
  };

  const formatDateLabel = (date) => {
    const days = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
    const dayName = days[date.getDay()];
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    return `${dayName}, ${day}/${month}`;
  };

  // Format date to YYYY-MM-DD in local timezone (not UTC)
  const formatDateLocal = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Generate date range for columns (always Monday to Sunday, 7 days)
  const dateColumns = useMemo(() => {
    const dates = [];
    // Ensure currentDate is Monday
    const monday = getMondayOfWeek(currentDate);
    for (let i = 0; i < 7; i++) {
      const date = new Date(monday);
      date.setDate(monday.getDate() + i);
      dates.push(date);
    }
    return dates;
  }, [currentDate]);

  // Auto-fill form when quickCreateData changes
  useEffect(() => {
    if (quickCreateData && showCreateModal) {
      const movie = movies.find(m => m.movieId === quickCreateData.movieId);
      if (movie) {
        const extracted = movieService.extractFormatsAndLanguages(movie);
        const movieFormats = extracted.formats || [];
        const movieLanguages = extracted.languages || [];
        
        const displayFormats = movieFormats.map(f => {
          if (['2D', '3D', 'DELUXE'].includes(f)) return f;
          return movieService.mapRoomTypeFromBackend(f);
        });
        const displayLanguages = movieLanguages.map(l => {
          if (['Phụ đề', 'Lồng tiếng', 'Tiếng Việt', 'Thuyết minh'].includes(l)) return l;
          return showtimeService.mapLanguageFromBackend(l);
        });
        
        setAvailableFormats(displayFormats);
        setAvailableLanguages(displayLanguages);
        
        // Filter rooms based on movie formats
        const compatibleRooms = rooms.filter(room => {
          const roomFormat = cinemaRoomService.mapRoomTypeFromBackend(room.roomType);
          return displayFormats.includes(roomFormat);
        });
        setAvailableRooms(compatibleRooms);
        
        // Tính toán min và max time dựa trên slot đã chọn
        const slotHour = parseInt(quickCreateData.time.split(':')[0]);
        const minTime = `${String(slotHour).padStart(2, '0')}:00`;
        const maxTime = `${String(slotHour).padStart(2, '0')}:59`;
        
        setCreateForm({
          movieId: String(quickCreateData.movieId),
          roomId: quickCreateData.roomId || null,
          startDate: quickCreateData.date,
          startTime: quickCreateData.time, // Set default time
          language: displayLanguages[0] || '',
          format: displayFormats[0] || '',
          minTime: minTime, // Giới hạn tối thiểu
          maxTime: maxTime  // Giới hạn tối đa
        });
      }
    }
  }, [quickCreateData, showCreateModal, movies, rooms]);

  // Group showtimes by date
  const showtimesByDate = useMemo(() => {
    const grouped = {};
    dateColumns.forEach(date => {
      // Use local date format instead of UTC to avoid timezone issues
      const dateStr = formatDateLocal(date);
      grouped[dateStr] = showtimes.filter(st => st.date === dateStr);
    });
    return grouped;
  }, [showtimes, dateColumns]);

  const limitedHour = (createForm.minTime || createForm.startTime || '').split(':')[0] || '';

  const getExportRangeLabel = () => {
    if (!dateColumns || !dateColumns.length) {
      return new Date().toISOString().split('T')[0];
    }
    const start = formatDateLocal(dateColumns[0]);
    const end = formatDateLocal(dateColumns[dateColumns.length - 1]);
    return `${start}_${end}`;
  };

  const handleExportToExcel = async () => {
    if (!showtimes.length) {
      showNotification('Không có lịch chiếu để xuất', 'error');
      return;
    }
    
    try {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Lịch chiếu');
      
      // Define columns with appropriate widths
      worksheet.columns = [
        { header: '#', key: 'index', width: 6 },
        { header: 'Ngày', key: 'date', width: 11 },
        { header: 'Giờ bắt đầu', key: 'startTime', width: 13 },
        { header: 'Giờ kết thúc', key: 'endTime', width: 13 },
        { header: 'Phim', key: 'movieTitle', width: 25 },
        { header: 'Phòng chiếu', key: 'roomName', width: 13 },
        { header: 'Định dạng', key: 'format', width: 11 },
        { header: 'Ngôn ngữ', key: 'language', width: 12 }
      ];
      
      // Style header row
      worksheet.getRow(1).font = { bold: true, size: 11, color: { argb: 'FFFFFFFF' } };
      worksheet.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF4472C4' }
      };
      worksheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' };
      worksheet.getRow(1).height = 20;
      
      // Add data rows
      showtimes.forEach((st, index) => {
        const row = worksheet.addRow({
          index: index + 1,
          date: st.date,
          startTime: st.startTime,
          endTime: st.endTime,
          movieTitle: st.movieTitle || '',
          roomName: st.roomName || '',
          format: st.format || '',
          language: st.language || ''
        });
        
        // Style data rows
        row.alignment = { vertical: 'middle', horizontal: 'left' };
        row.height = 18;
        
        // Alternate row colors for better readability
        if (index % 2 === 0) {
          row.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFF2F2F2' }
          };
        }
        
        // Center align for index, date, and times
        row.getCell('index').alignment = { vertical: 'middle', horizontal: 'center' };
        row.getCell('date').alignment = { vertical: 'middle', horizontal: 'center' };
        row.getCell('startTime').alignment = { vertical: 'middle', horizontal: 'center' };
        row.getCell('endTime').alignment = { vertical: 'middle', horizontal: 'center' };
        row.getCell('format').alignment = { vertical: 'middle', horizontal: 'center' };
        row.getCell('language').alignment = { vertical: 'middle', horizontal: 'center' };
      });
      
      // Add borders to all cells
      worksheet.eachRow((row, rowNumber) => {
        row.eachCell((cell) => {
          cell.border = {
            top: { style: 'thin', color: { argb: 'FFD0D0D0' } },
            left: { style: 'thin', color: { argb: 'FFD0D0D0' } },
            bottom: { style: 'thin', color: { argb: 'FFD0D0D0' } },
            right: { style: 'thin', color: { argb: 'FFD0D0D0' } }
          };
        });
      });
      
      // Freeze header row
      worksheet.views = [{ state: 'frozen', ySplit: 1 }];
      
      // Generate buffer and download
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `showtimes_${getExportRangeLabel()}.xlsx`;
      link.click();
      URL.revokeObjectURL(url);
      
      showNotification('Xuất file Excel thành công', 'success');
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      showNotification('Có lỗi xảy ra khi xuất file Excel', 'error');
    }
  };

  if (loading) {
    return (
      <div className="showtime-timeline-loading">
        <div className="showtime-timeline-spinner"></div>
        <p>Đang tải dữ liệu...</p>
      </div>
    );
  }

  // Display all rooms, but show which ones are visible
  const displayedRooms = rooms;

  return (
    <div className="showtime-timeline-container">
      {/* Notification */}
      {notification && (
        <div className={`showtime-timeline-notification showtime-timeline-notification--${notification.type}`}>
          {notification.type === 'success' ? (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          ) : (
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="12"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
          )}
          {notification.message}
        </div>
      )}

      {/* Sidebar */}
      <div className={`showtime-timeline-sidebar ${sidebarOpen ? 'showtime-timeline-sidebar--open' : 'showtime-timeline-sidebar--closed'}`}>
        <div className="showtime-timeline-sidebar-header">
          <button 
            className="showtime-timeline-sidebar-toggle"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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
          {sidebarOpen && (
              <h3 className="showtime-timeline-sidebar-title">Phòng chiếu</h3>
          )}
        </div>

        {sidebarOpen && (
          <div className="showtime-timeline-sidebar-content">
            <div className="showtime-timeline-movies-grid">
              <label style={{ marginBottom: '8px', display: 'block', fontSize: '14px', fontWeight: '500' }}>
                Chọn phim để tạo lịch
              </label>
              <div className="showtime-timeline-movies-list">
                {movies.map(movie => {
                  const isSelected = selectedMovie?.movieId === movie.movieId;
                  const isFiltered = filterMovie && String(movie.movieId) === filterMovie;
                  return (
                    <div
                      key={movie.movieId}
                      className={`showtime-timeline-movie-card ${isSelected ? 'showtime-timeline-movie-card--selected' : ''} ${isFiltered ? 'showtime-timeline-movie-card--filtered' : ''}`}
                      draggable={true}
                      onDragStart={(e) => {
                        e.dataTransfer.setData('movieId', String(movie.movieId));
                        e.dataTransfer.setData('movieTitle', movie.title);
                        e.dataTransfer.effectAllowed = 'copy';
                      }}
                onClick={() => {
                        setSelectedMovie(movie);
                      }}
                      title={`Click để chọn phim: ${movie.title}`}
                    >
                      {movie.poster ? (
                        <img 
                          src={movie.poster} 
                          alt={movie.title}
                          className="showtime-timeline-movie-poster"
                          onError={(e) => {
                            e.target.style.display = 'none';
                          }}
                        />
                      ) : (
                        <div className="showtime-timeline-movie-poster-placeholder">
                          {movie.title.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div className="showtime-timeline-movie-info">
                        <div className="showtime-timeline-movie-title" title={movie.title}>
                          {movie.title}
                        </div>
                        {movie.duration && (
                          <div className="showtime-timeline-movie-duration">
                            {movie.duration} phút
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
        </div>

            <div className="showtime-timeline-filter" style={{ marginTop: '16px' }}>
              <label>Lọc hiển thị</label>
              <select
                value={filterMovie}
                onChange={(e) => {
                  setFilterMovie(e.target.value);
                  if (e.target.value) {
                    const movie = movies.find(m => String(m.movieId) === e.target.value);
                    setSelectedMovie(movie || null);
                  } else {
                    setSelectedMovie(null);
                  }
                }}
                className="showtime-timeline-filter-select"
              >
                <option value="">Tất cả phim</option>
                {movies.map(movie => (
                  <option key={movie.movieId} value={String(movie.movieId)}>
                    {movie.title}
                  </option>
                ))}
              </select>
            </div>

            <div className="showtime-timeline-rooms-list">
              {displayedRooms.map(room => {
                const roomShowtimes = showtimes.filter(st => {
                  // Count showtimes for this room, considering movie filter
                  if (st.roomId !== room.roomId) return false;
                  if (filterMovie && String(st.movieId) !== filterMovie) return false;
                  return true;
                });
                const isVisible = visibleRooms.has(room.roomId);
                return (
                  <div
                    key={room.roomId}
                    className={`showtime-timeline-room-item ${isVisible ? 'showtime-timeline-room-item--visible' : 'showtime-timeline-room-item--hidden'}`}
                    onClick={(e) => {
                      e.stopPropagation();
                      const newVisibleRooms = new Set(visibleRooms);
                      if (isVisible) {
                        newVisibleRooms.delete(room.roomId);
                      } else {
                        newVisibleRooms.add(room.roomId);
                      }
                      setVisibleRooms(newVisibleRooms);
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%' }}>
                      <input
                        type="checkbox"
                        checked={isVisible}
                        onChange={() => {}} // Handled by parent onClick
                        onClick={(e) => e.stopPropagation()}
                        style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: 'var(--accent, #e11b22)' }}
                      />
                      <div style={{ flex: 1 }}>
                        <div className="showtime-timeline-room-name">
                          {room.roomName}
                        </div>
                        <div className="showtime-timeline-room-type">
                          {room.roomType}
                        </div>
                        <div className="showtime-timeline-room-count">
                          {roomShowtimes.length} suất
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="showtime-timeline-main">
        {/* Top Bar */}
        <div className="showtime-timeline-topbar">
          <div className="showtime-timeline-date-controls">
            <button onClick={() => navigateDate(-1)} className="showtime-timeline-nav-btn" title="Tuần trước">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="15 18 9 12 15 6"/>
              </svg>
            </button>
            <div className="showtime-timeline-date-label">
              <div className="showtime-timeline-date-text">Tuần</div>
              <div className="showtime-timeline-date-value">
                {formatDateLabel(dateColumns[0])} - {formatDateLabel(dateColumns[6])}
              </div>
            </div>
            <button onClick={() => navigateDate(1)} className="showtime-timeline-nav-btn" title="Tuần sau">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="9 18 15 12 9 6"/>
              </svg>
            </button>
          </div>

          <div className="showtime-timeline-topbar-right">
            <div className="showtime-timeline-export-group">
              <button
                className="showtime-timeline-export-btn"
                onClick={handleExportToExcel}
                disabled={!showtimes.length}
                title="Xuất lịch ra file Excel"
              >
                Export Excel
              </button>
            </div>
          </div>
        </div>

        {/* Grid */}
        <div className="showtime-timeline-grid-container">
          <div className="showtime-timeline-grid showtime-timeline-grid-columns">
            {/* Date header row */}
            <div 
              className="showtime-timeline-date-header-row"
              style={{ '--date-columns': dateColumns.length }}
            >
              <div className="showtime-timeline-date-header-spacer"></div>
              {dateColumns.map((date, dateIndex) => (
                <div key={dateIndex} className="showtime-timeline-date-header-cell">
                  <div className="showtime-timeline-date-column-day">{formatDateLabel(date)}</div>
                </div>
              ))}
            </div>
            
            {/* Time rows (horizontal) with date columns (vertical) */}
            {timeSlots.map((slot, slotIndex) => {
              const dateColumnsCount = dateColumns.length;
              return (
                <div 
                  key={slotIndex} 
                  className="showtime-timeline-time-row"
                  style={{ '--date-columns': dateColumnsCount }}
                >
                  {/* Time label */}
                  <div className="showtime-timeline-time-label">
                    {slot.label}
                  </div>
                  
                  {/* Date columns (cells for each day) - rendered directly in grid */}
                  {dateColumns.map((date, dateIndex) => {
                    // Use local date format instead of UTC to avoid timezone issues
                    const dateStr = formatDateLocal(date);
                    const slotStartMinutes = slot.hour * 60 + slot.minute;
                    const slotEndMinutes = slotStartMinutes + 60;
                    
                    // Get showtimes that fall within this time slot and date
                    // Filter by visible rooms and movie filter
                    const cellShowtimes = (showtimesByDate[dateStr] || []).filter(st => {
                      // Filter by visible rooms
                      if (!visibleRooms.has(st.roomId)) return false;
                      // Filter by movie if selected
                      if (filterMovie && String(st.movieId) !== filterMovie) return false;
                      // Filter by time slot
                      const stStartMinutes = st.startHour * 60 + st.startMinute;
                      return stStartMinutes >= slotStartMinutes && stStartMinutes < slotEndMinutes;
                    });
                    
                    // Check for conflicts when dragging
                    const checkDragConflict = (movieId, date, time, roomId = null) => {
                      if (!movieId || !date || !time) return null;
                      const movie = movies.find(m => String(m.movieId) === String(movieId));
                      if (!movie) return null;
                      
                      const endTime = computeEndTime(date, time, movieId);
                      if (!endTime) return null;
                      
                      // Check conflicts for all visible rooms or specific room
                      const roomsToCheck = roomId ? [roomId] : Array.from(visibleRooms);
                      const allConflicts = [];
                      
                      for (const checkRoomId of roomsToCheck) {
                        const roomShowtimes = showtimes.filter(st => st.roomId === checkRoomId);
                        const conflicts = hasOverlap(roomShowtimes, date, time, endTime, checkRoomId);
                        if (conflicts.length > 0) {
                          allConflicts.push(...conflicts.map(c => ({ ...c, roomId: checkRoomId })));
                        }
                      }
                      
                      return allConflicts.length > 0 ? allConflicts : null;
                    };
                    
                    return (
                      <div 
                        key={dateIndex} 
                        className={`showtime-timeline-date-cell ${
                          dragOverCell === `${dateIndex}-${slotIndex}` && dragConflict 
                            ? 'showtime-timeline-date-cell--drag-conflict' 
                            : dragOverCell === `${dateIndex}-${slotIndex}` 
                              ? 'showtime-timeline-date-cell--drag-over' 
                              : ''
                        }`}
                        onDragOver={(e) => {
                          e.preventDefault();
                          const movieId = e.dataTransfer.getData('movieId');
                          const cellKey = `${dateIndex}-${slotIndex}`;
                          setDragOverCell(cellKey);
                          
                          // Check for conflicts
                          const conflicts = checkDragConflict(movieId, dateStr, slot.label);
                          if (conflicts && conflicts.length > 0) {
                            e.dataTransfer.dropEffect = 'none';
                            setDragConflict(conflicts);
                          } else {
                            e.dataTransfer.dropEffect = 'copy';
                            setDragConflict(null);
                          }
                        }}
                        onDragLeave={(e) => {
                          setDragOverCell(null);
                          setDragConflict(null);
                        }}
                        onDrop={(e) => {
                          e.preventDefault();
                          const movieId = e.dataTransfer.getData('movieId');
                          const movieTitle = e.dataTransfer.getData('movieTitle');
                          
                          setDragOverCell(null);
                          setDragConflict(null);
                          
                          // Check for conflicts before allowing drop
                          const conflicts = checkDragConflict(movieId, dateStr, slot.label);
                          if (conflicts && conflicts.length > 0) {
                            const conflictInfo = conflicts[0];
                            showNotification(
                              `⚠️ Không thể tạo lịch: Trùng với "${conflictInfo.movieTitle}" (${conflictInfo.startTime} - ${conflictInfo.endTime}) trong ${conflictInfo.roomName || 'phòng'}`,
                              'error'
                            );
                            return;
                          }
                          
                          if (movieId) {
                            const movie = movies.find(m => String(m.movieId) === movieId);
                            if (movie) {
                              setSelectedMovie(movie);
                              setQuickCreateData({
                                movieId: Number(movieId),
                                movieTitle: movieTitle,
                                date: dateStr,
                                time: slot.label,
                                roomId: null // Will be selected in modal
                              });
                              setShowCreateModal(true);
                            }
                          }
                        }}
                        onClick={(e) => {
                          // Only trigger if clicking on empty cell (not on existing showtime)
                          if (e.target === e.currentTarget || e.target.classList.contains('showtime-timeline-date-cell')) {
                            if (selectedMovie && cellShowtimes.length === 0) {
                              // Check for conflicts before opening modal
                              const endTime = computeEndTime(dateStr, slot.label, selectedMovie.movieId);
                              if (endTime) {
                                const roomsToCheck = Array.from(visibleRooms);
                                let hasConflict = false;
                                
                                for (const checkRoomId of roomsToCheck) {
                                  const roomShowtimes = showtimes.filter(st => st.roomId === checkRoomId);
                                  const conflicts = hasOverlap(roomShowtimes, dateStr, slot.label, endTime, checkRoomId);
                                  if (conflicts.length > 0) {
                                    hasConflict = true;
                                    const conflictInfo = conflicts[0];
                                    showNotification(
                                      `⚠️ Không thể tạo lịch: Trùng với "${conflictInfo.movieTitle}" (${conflictInfo.startTime} - ${conflictInfo.endTime}) trong ${conflictInfo.roomName || 'phòng'}`,
                                      'error'
                                    );
                                    break;
                                  }
                                }
                                
                                if (!hasConflict) {
                                  setQuickCreateData({
                                    movieId: selectedMovie.movieId,
                                    movieTitle: selectedMovie.title,
                                    date: dateStr,
                                    time: slot.label,
                                    roomId: null
                                  });
                                  setShowCreateModal(true);
                                }
                              }
                            }
                          }
                        }}
                        style={{ cursor: selectedMovie ? 'pointer' : 'default' }}
                        title={selectedMovie ? `Click để tạo lịch cho "${selectedMovie.title}" vào ${slot.label} ngày ${formatDateLabel(date)}` : ''}
                      >
                        {cellShowtimes.map(showtime => (
                          <div
                            key={showtime.showtimeId}
                            className="showtime-timeline-block-small"
                            style={{
                              backgroundColor: getMovieColor(showtime.movieId)
                            }}
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedShowtime(showtime);
                            }}
                            title={`${showtime.movieTitle} - ${showtime.roomName} - ${showtime.startTime}-${showtime.endTime}`}
                          >
                            <div className="showtime-timeline-block-small-title">
                              {truncateMovieTitle(showtime.movieTitle, 15)}
                            </div>
                            <div className="showtime-timeline-block-small-time">{showtime.startTime} - {showtime.endTime}</div>
                            <div className="showtime-timeline-block-small-room">{showtime.roomName}</div>
                          </div>
                        ))}
                        {cellShowtimes.length === 0 && selectedMovie && (
                          <div className="showtime-timeline-empty-cell-hint">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <line x1="12" y1="5" x2="12" y2="19"/>
                              <line x1="5" y1="12" x2="19" y2="12"/>
                            </svg>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Showtime Detail Modal */}
      {selectedShowtime && (
        <div className="showtime-timeline-modal" onClick={() => setSelectedShowtime(null)}>
          <div className="showtime-timeline-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="showtime-timeline-modal-header">
              <h3>{selectedShowtime.movieTitle}</h3>
              <button onClick={() => setSelectedShowtime(null)}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
            <div className="showtime-timeline-modal-body">
              <div className="showtime-timeline-modal-row">
                <span>Ngày:</span>
                <span>{new Date(selectedShowtime.date).toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
              </div>
              <div className="showtime-timeline-modal-row">
                <span>Giờ:</span>
                <span>{selectedShowtime.startTime} - {selectedShowtime.endTime}</span>
              </div>
              <div className="showtime-timeline-modal-row">
                <span>Phòng:</span>
                <span>{selectedShowtime.roomName}</span>
              </div>
              <div className="showtime-timeline-modal-row">
                <span>Định dạng:</span>
                <span>{selectedShowtime.format}</span>
              </div>
              <div className="showtime-timeline-modal-row">
                <span>Ngôn ngữ:</span>
                <span>{selectedShowtime.language}</span>
              </div>
            </div>
            <div className="showtime-timeline-modal-footer">
              <button
                className="showtime-timeline-modal-btn showtime-timeline-modal-btn--primary"
                onClick={() => {
                  addToCalendar({
                    movieTitle: selectedShowtime.movieTitle,
                    startTime: selectedShowtime.startDateTime,
                    endTime: selectedShowtime.endDateTime,
                    cinemaName: selectedShowtime.cinemaName,
                    cinemaAddress: selectedShowtime.cinemaAddress,
                    roomName: selectedShowtime.roomName,
                    format: selectedShowtime.format
                  }, 'google');
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                  <line x1="16" y1="2" x2="16" y2="6"/>
                  <line x1="8" y1="2" x2="8" y2="6"/>
                  <line x1="3" y1="10" x2="21" y2="10"/>
                </svg>
                Google Calendar
              </button>
              <button
                className="showtime-timeline-modal-btn"
                onClick={() => {
                  addToCalendar({
                    movieTitle: selectedShowtime.movieTitle,
                    startTime: selectedShowtime.startDateTime,
                    endTime: selectedShowtime.endDateTime,
                    cinemaName: selectedShowtime.cinemaName,
                    cinemaAddress: selectedShowtime.cinemaAddress,
                    roomName: selectedShowtime.roomName,
                    format: selectedShowtime.format
                  }, 'ics');
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                  <polyline points="7 10 12 15 17 10"/>
                  <line x1="12" y1="15" x2="12" y2="3"/>
                </svg>
                Tải .ics
              </button>
              <button
                className="showtime-timeline-modal-btn showtime-timeline-modal-btn--danger"
                onClick={() => {
                  setSelectedShowtime(null);
                  handleDeleteShowtime(selectedShowtime.showtimeId);
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="3 6 5 6 21 6"/>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                </svg>
                Xóa
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {deleteConfirm && (
        <ConfirmDeleteModal
          isOpen={!!deleteConfirm}
          onClose={() => setDeleteConfirm(null)}
          onConfirm={confirmDelete}
          itemName={deleteConfirm.name}
          itemType="lịch chiếu"
        />
      )}

      {/* Create Modal - Keep existing create modal */}
      {showCreateModal && (
        <div className="showtime-timeline-create-modal" onClick={() => !creating && (setShowCreateModal(false), setQuickCreateData(null))}>
          <div className="showtime-timeline-create-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="showtime-timeline-create-modal-header">
              <h3>Tạo lịch chiếu</h3>
              {!creating && (
                <button onClick={() => {
                  setShowCreateModal(false);
                  setQuickCreateData(null);
                  setCreateForm({
                    movieId: '',
                    roomId: null,
                    startDate: '',
                    startTime: '',
                    language: '',
                    format: '',
                    minTime: null,
                    maxTime: null
                  });
                }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18"/>
                    <line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                </button>
              )}
            </div>

            <div className="showtime-timeline-create-modal-body">
              {quickCreateData && (
                <div style={{ 
                  padding: '14px 16px', 
                  background: 'rgba(232, 59, 65, 0.15)', 
                  border: '1px solid rgba(232, 59, 65, 0.4)', 
                  borderRadius: '8px',
                  marginBottom: '20px',
                  fontSize: '14px',
                  color: '#f5f5f5'
                }}>
                  <strong style={{ color: '#fff', fontWeight: '600' }}>Tạo lịch cho:</strong>{' '}
                  <span style={{ color: '#fff' }}>{quickCreateData.movieTitle} - {quickCreateData.date} - {quickCreateData.time}</span>
                </div>
              )}
              
              <div className="showtime-timeline-create-form-group">
                <label>Chọn phim *</label>
                <select
                  value={quickCreateData?.movieId ? String(quickCreateData.movieId) : createForm.movieId}
                  onChange={(e) => {
                    const selectedMovieId = e.target.value;
                    const selectedMovie = movies.find(m => String(m.movieId) === selectedMovieId);
                    
                    if (selectedMovie) {
                      // Extract formats and languages from movie
                      const extracted = movieService.extractFormatsAndLanguages(selectedMovie);
                      const movieFormats = extracted.formats || [];
                      const movieLanguages = extracted.languages || [];
                      
                      // Map to display format
                      const displayFormats = movieFormats.map(f => {
                        // If already in display format, return as is, otherwise map
                        if (['2D', '3D', 'DELUXE'].includes(f)) return f;
                        return movieService.mapRoomTypeFromBackend(f);
                      });
                      const displayLanguages = movieLanguages.map(l => {
                        // If already in display format, return as is, otherwise map
                        if (['Phụ đề', 'Lồng tiếng', 'Tiếng Việt'].includes(l)) return l;
                        return showtimeService.mapLanguageFromBackend(l);
                      });
                      
                      setAvailableFormats(displayFormats);
                      setAvailableLanguages(displayLanguages);
                      
                      // Filter rooms based on movie formats (show all compatible rooms)
                      const compatibleRooms = rooms.filter(room => {
                        const roomFormat = cinemaRoomService.mapRoomTypeFromBackend(room.roomType);
                        return displayFormats.includes(roomFormat);
                      });
                      setAvailableRooms(compatibleRooms);
                      
                      // Reset form with first available options
                      setCreateForm({
                        ...createForm,
                        movieId: selectedMovieId,
                        format: displayFormats[0] || '',
                        language: displayLanguages[0] || '',
                        roomIds: [] // Reset room selection
                      });
                    } else {
                      // Reset if no movie selected
                      setAvailableFormats([]);
                      setAvailableLanguages([]);
                      setAvailableRooms([]);
                      setCreateForm({
                        ...createForm,
                        movieId: '',
                        format: '',
                        language: '',
                        roomIds: []
                      });
                    }
                  }}
                  disabled={creating}
                  className="showtime-timeline-create-select"
                >
                  <option value="">-- Chọn phim --</option>
                  {movies.length > 0 ? (
                    movies.map(movie => (
                      <option key={movie.movieId} value={String(movie.movieId)}>
                        {movie.title} {movie.duration ? `(${movie.duration} phút)` : ''}
                      </option>
                    ))
                  ) : (
                    <option value="" disabled>Đang tải danh sách phim...</option>
                  )}
                </select>
                {movies.length === 0 && (
                  <div style={{ fontSize: '12px', color: '#999', marginTop: '4px' }}>
                    Không có phim nào. Vui lòng thêm phim trước khi tạo lịch chiếu.
                  </div>
                )}
              </div>

              <div className="showtime-timeline-create-form-group">
                <label>Chọn phòng *</label>
                {!createForm.movieId ? (
                  <div style={{ 
                    padding: '12px', 
                    background: '#fff3cd', 
                    border: '1px solid #ffc107', 
                    borderRadius: '6px',
                    fontSize: '14px',
                    color: '#856404'
                  }}>
                    Vui lòng chọn phim trước
                  </div>
                ) : availableRooms.length > 0 ? (
                  <select
                    value={createForm.roomId || ''}
                          onChange={(e) => {
                      const selectedRoomId = e.target.value ? Number(e.target.value) : null;
                      const selectedRoom = rooms.find(r => r.roomId === selectedRoomId);
                      const roomFormat = selectedRoom ? cinemaRoomService.mapRoomTypeFromBackend(selectedRoom.roomType) : '';
                              setCreateForm({ 
                                ...createForm, 
                        roomId: selectedRoomId,
                                format: roomFormat
                              });
                          }}
                          disabled={creating}
                    className="showtime-timeline-create-select"
                  >
                    <option value="">-- Chọn phòng --</option>
                    {availableRooms.map(room => (
                      <option key={room.roomId} value={room.roomId}>
                        {room.roomName} ({cinemaRoomService.mapRoomTypeFromBackend(room.roomType)})
                      </option>
                    ))}
                  </select>
                ) : (
                  <div style={{ 
                    padding: '12px', 
                    background: '#f8d7da', 
                    border: '1px solid #dc3545', 
                    borderRadius: '6px',
                    fontSize: '14px',
                    color: '#721c24'
                  }}>
                    Không có phòng nào tương thích với định dạng của phim đã chọn.
                  </div>
                )}
              </div>

              <div className="showtime-timeline-create-form-row">
                <div className="showtime-timeline-create-form-group">
                  <label>Ngày *</label>
                  <input
                    type="date"
                    value={quickCreateData?.date || createForm.startDate}
                    onChange={(e) => setCreateForm({ ...createForm, startDate: e.target.value })}
                    disabled={creating || !!quickCreateData}
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
                <div className="showtime-timeline-create-form-group">
                  <label>Giờ bắt đầu *</label>
                  {createForm.minTime ? (
                    <div className="showtime-timeline-minute-picker">
                      <div className="showtime-timeline-hour-display">
                        {limitedHour || '--'}
                      </div>
                      <span className="showtime-timeline-minute-separator">:</span>
                  <input
                    type="number"
                        min="0"
                        max="59"
                        value={minuteInput}
                        onChange={(e) => updateMinuteValue(e.target.value)}
                        onBlur={(e) => updateMinuteValue(e.target.value)}
                        className="showtime-timeline-minute-input"
                    disabled={creating}
                  />
                      <span className="showtime-timeline-minute-label">phút</span>
                </div>
                  ) : (
                      <input
                      type="time"
                      value={createForm.startTime}
                      onChange={(e) => setCreateForm({ ...createForm, startTime: e.target.value })}
                        disabled={creating}
                      min="00:00"
                      max="23:59"
                      step="300"
                    />
                  )}
                  {createForm.minTime && createForm.maxTime && (
                    <div style={{ fontSize: '12px', color: '#999', marginTop: '4px' }}>
                      Giới hạn: {createForm.minTime} - {createForm.maxTime}
                    </div>
                  )}
                </div>
              </div>

              <div className="showtime-timeline-create-form-group">
                <label>Ngôn ngữ *</label>
                <select
                  value={createForm.language}
                  onChange={(e) => {
                    setCreateForm({ ...createForm, language: e.target.value });
                  }}
                  disabled={creating || !createForm.movieId || availableLanguages.length === 0}
                >
                  <option value="">-- Chọn ngôn ngữ --</option>
                  {availableLanguages.map(lang => (
                    <option key={lang} value={lang}>{lang}</option>
                  ))}
                </select>
                {!createForm.movieId && (
                  <div style={{ fontSize: '12px', color: '#999', marginTop: '4px' }}>
                    Vui lòng chọn phim trước
                  </div>
                )}
                {createForm.roomId && createForm.format && (
                  <div style={{ fontSize: '12px', color: '#1976d2', marginTop: '4px' }}>
                    Định dạng: <strong>{createForm.format}</strong> (tự động từ phòng đã chọn)
                  </div>
                )}
              </div>

              {createForm.movieId && createForm.roomId && createForm.startDate && createForm.startTime && (
                <div className="showtime-timeline-create-preview">
                  <p>Sẽ tạo: <strong>1</strong> lịch chiếu</p>
                  <p>Phim: {movies.find(m => String(m.movieId) === createForm.movieId)?.title} - {createForm.startDate} - {createForm.startTime}</p>
                </div>
              )}
            </div>

            <div className="showtime-timeline-create-modal-footer">
              <button onClick={() => {
                if (creating) return;
                setShowCreateModal(false);
                setQuickCreateData(null);
                setCreateForm({
                  movieId: '',
                  roomId: null,
                  startDate: '',
                  startTime: '',
                  language: '',
                  format: '',
                  minTime: null,
                  maxTime: null
                });
              }} disabled={creating}>
                Hủy
              </button>
              <button
                className="showtime-timeline-create-submit-btn"
                onClick={async () => {
                  // Validate form
                  if (!createForm.movieId || !createForm.roomId || !createForm.startDate || !createForm.startTime || !createForm.language) {
                    showNotification('Vui lòng điền đầy đủ thông tin', 'error');
                    return;
                  }

                  const selectedMovie = movies.find(m => m.movieId === Number(createForm.movieId));
                  if (!selectedMovie) {
                    showNotification('Phim không hợp lệ', 'error');
                    return;
                  }
                  
                  // Get format from selected room
                  const selectedRoom = rooms.find(r => r.roomId === createForm.roomId);
                  if (!selectedRoom) {
                    showNotification('Phòng không hợp lệ', 'error');
                    return;
                  }
                  const roomFormat = cinemaRoomService.mapRoomTypeFromBackend(selectedRoom.roomType);
                  
                  // Validate format and language match movie
                  const extracted = movieService.extractFormatsAndLanguages(selectedMovie);
                  const movieFormats = extracted.formats || [];
                  const movieLanguages = extracted.languages || [];
                  
                  const displayFormats = movieFormats.map(f => {
                    if (['2D', '3D', 'DELUXE'].includes(f)) return f;
                    return movieService.mapRoomTypeFromBackend(f);
                  });
                  const displayLanguages = movieLanguages.map(l => {
                    if (['Phụ đề', 'Lồng tiếng', 'Tiếng Việt', 'Thuyết minh'].includes(l)) return l;
                    return showtimeService.mapLanguageFromBackend(l);
                  });
                  
                  if (!displayFormats.includes(roomFormat)) {
                    showNotification('Định dạng phòng không khớp với phim đã chọn', 'error');
                    return;
                  }
                  
                  if (!displayLanguages.includes(createForm.language)) {
                    showNotification('Ngôn ngữ không khớp với phim đã chọn', 'error');
                    return;
                  }

                  // Check for conflicts before creating
                  const endTime = computeEndTime(createForm.startDate, createForm.startTime, createForm.movieId);
                  if (endTime) {
                    const roomShowtimes = showtimes.filter(st => st.roomId === createForm.roomId);
                    const conflicts = hasOverlap(roomShowtimes, createForm.startDate, createForm.startTime, endTime, createForm.roomId);
                    if (conflicts.length > 0) {
                      const conflictInfo = conflicts[0];
                      showNotification(
                        `⚠️ Không thể tạo lịch: Trùng với "${conflictInfo.movieTitle}" (${conflictInfo.startTime} - ${conflictInfo.endTime})`,
                        'error'
                      );
                      return;
                    }
                  }
                    
                  setCreating(true);
                  try {
                    const startDateTime = `${createForm.startDate}T${createForm.startTime}:00`;
                    const endTimeObj = new Date(`${createForm.startDate}T${createForm.startTime}:00`);
                    endTimeObj.setMinutes(endTimeObj.getMinutes() + selectedMovie.duration + 15);
                    const endDateTime = endTimeObj.toISOString().slice(0, 16).replace('T', 'T').substring(0, 16) + ':00';
                    
                    const result = await showtimeService.createShowtime({
                      cinemaRoomId: createForm.roomId,
                            movieId: Number(createForm.movieId),
                            language: createForm.language,
                      roomType: roomFormat,
                            startTime: startDateTime,
                            endTime: endDateTime
                          });

                        if (result.success) {
                    // Reload showtimes
                    const allShowtimes = [];
                    for (const roomId of selectedRooms) {
                      const result = await showtimeService.getShowtimesByRoomId(roomId);
                      if (result.success && result.data) {
                        const mappedShowtimes = result.data.map(st => {
                          const startDateTime = new Date(st.startTime);
                          const endDateTime = new Date(st.endTime);
                            const date = formatDateLocal(startDateTime);
                            const showtimeDate = new Date(startDateTime.getFullYear(), startDateTime.getMonth(), startDateTime.getDate());
                            const monday = getMondayOfWeek(currentDate);
                            const startDate = new Date(monday);
                            const endDate = new Date(monday);
                            endDate.setDate(endDate.getDate() + 6);
                            
                            if (showtimeDate < startDate || showtimeDate > endDate) {
                              return null;
                            }
                          
                          const startTime = startDateTime.toTimeString().slice(0, 5);
                          const endTime = endDateTime.toTimeString().slice(0, 5);
                          const movieId = st.movieVersion?.movie?.movieId || st.movieId;
                          const language = showtimeService.mapLanguageFromBackend(st.movieVersion?.language || st.language);
                          const format = showtimeService.mapRoomTypeFromBackend(st.movieVersion?.roomType || st.format);
                          
                          return {
                            showtimeId: st.showtimeId,
                            roomId: st.cinemaRoom?.roomId || roomId,
                            roomName: st.cinemaRoom?.roomName || rooms.find(r => r.roomId === roomId)?.roomName || 'Phòng',
                            movieId: movieId,
                            movieTitle: st.movieVersion?.movie?.title || st.movieTitle,
                            date: date,
                            startTime: startTime,
                            endTime: endTime,
                            startDateTime: st.startTime,
                            endDateTime: st.endTime,
                            startHour: parseInt(startTime.split(':')[0]),
                            startMinute: parseInt(startTime.split(':')[1]),
                            endHour: parseInt(endTime.split(':')[0]),
                            endMinute: parseInt(endTime.split(':')[1]),
                            duration: (new Date(st.endTime) - new Date(st.startTime)) / (1000 * 60),
                            language: language,
                            format: format,
                            cinemaName: st.cinemaRoom?.cinemaComplex?.name || '',
                            cinemaAddress: st.cinemaRoom?.cinemaComplex?.fullAddress || ''
                          };
                        }).filter(Boolean);
                        allShowtimes.push(...mappedShowtimes);
                      }
                    }
                    setShowtimes(allShowtimes);

                      showNotification('Đã tạo lịch chiếu thành công', 'success');
                      setShowCreateModal(false);
                      setQuickCreateData(null);
                      setSelectedMovie(null);
                      setFilterMovie('');
                      setCreateForm({
                        movieId: '',
                        roomId: null,
                        startDate: '',
                        startTime: '',
                        language: '',
                        format: '',
                        minTime: null,
                        maxTime: null
                      });
                    } else {
                      showNotification(result.error || 'Không thể tạo lịch chiếu. Có thể do trùng lịch hoặc lỗi hệ thống.', 'error');
                    }
                  } catch (error) {
                    console.error('Error creating showtime:', error);
                    showNotification('Có lỗi xảy ra khi tạo lịch chiếu', 'error');
                  } finally {
                    setCreating(false);
                  }
                }}
                disabled={creating || !createForm.movieId || !createForm.roomId || !createForm.startDate || !createForm.startTime || !createForm.language}
              >
                {creating ? 'Đang tạo...' : 'Tạo lịch'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  function handleDeleteShowtime(showtimeId) {
    const showtime = showtimes.find(st => st.showtimeId === showtimeId);
    setDeleteConfirm({
      type: 'showtime',
      id: showtimeId,
      name: showtime ? `${showtime.movieTitle} - ${showtime.date} ${showtime.startTime}` : 'lịch chiếu này'
    });
  }

  async function confirmDelete() {
    if (!deleteConfirm || deleteConfirm.type !== 'showtime') return;
    
    try {
      const result = await showtimeService.deleteShowtime(deleteConfirm.id);
      if (result.success) {
        setShowtimes(showtimes.filter(st => st.showtimeId !== deleteConfirm.id));
        showNotification('Xóa lịch chiếu thành công', 'success');
      } else {
        showNotification(result.error || 'Xóa lịch chiếu thất bại', 'error');
      }
    } catch (error) {
      console.error('Error deleting showtime:', error);
      showNotification('Có lỗi xảy ra khi xóa lịch chiếu', 'error');
    } finally {
      setDeleteConfirm(null);
    }
  }
}
