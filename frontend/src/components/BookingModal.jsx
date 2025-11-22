import React, { useMemo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function BookingModal({ isOpen, onClose, movieTitle, options, onShowtimeClick, onFiltersChange }) {
  const navigate = useNavigate();
  const today = useMemo(() => new Date(), []);
  const dates = useMemo(() => {
    const arr = [];
    for (let i = 0; i < 14; i++) {
      const d = new Date(today);
      d.setDate(d.getDate() + i);
      arr.push({
        key: d.toISOString().slice(0,10),
        label: d.toLocaleDateString('vi-VN', { weekday: 'short', day: '2-digit', month: '2-digit' })
      });
    }
    return arr;
  }, [today]);

  // Get unique provinces from showtimes (chỉ hiển thị provinces có showtimes)
  const provinces = useMemo(() => {
    const uniqueProvinces = new Set();
    // Lấy provinces từ showtimes thực tế
    if (options.showtimes && Object.keys(options.showtimes).length > 0) {
      (options.cinemas || []).forEach(c => {
        // Chỉ thêm province nếu cinema này có showtimes
        if (c.province && options.showtimes[c.id]) {
          const hasShowtimes = Object.values(options.showtimes[c.id] || {}).some(
            times => Array.isArray(times) && times.length > 0
          );
          if (hasShowtimes) {
            uniqueProvinces.add(c.province);
          }
        }
      });
    }
    return Array.from(uniqueProvinces).sort();
  }, [options.cinemas, options.showtimes]);

  // Initialize date with today's date in YYYY-MM-DD format
  const getTodayDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };
  
  const [date, setDate] = useState(getTodayDate()); // Default: Hôm nay
  const [province, setProvince] = useState(''); // Default: Tất cả (empty = all provinces)
  const [cinema, setCinema] = useState(''); // Default: Tất cả (empty = all cinemas)
  const [format, setFormat] = useState('Tất cả');
  const [showLoginModal, setShowLoginModal] = useState(false);
  
  
  // Update format when options.formats changes
  useEffect(() => {
    if (options.formats && options.formats.length > 0) {
      // Always set to first format (should be "Tất cả" or first available format)
      setFormat(options.formats[0]);
    } else {
      setFormat('Tất cả');
    }
  }, [options.formats]);
  
  // Reset filters when modal opens - set to "Tất cả" (empty)
  useEffect(() => {
    if (isOpen) {
      // Reset to "Tất cả" (empty = all)
      setProvince('');
      setCinema('');
      // Keep date as today (don't reset it)
      setFormat('Tất cả');
    } else {
      // Close login modal when main modal closes
      setShowLoginModal(false);
    }
  }, [isOpen]);
  
  // Load showtimes when modal opens with today's date
  useEffect(() => {
    if (isOpen && onFiltersChange && options.movieId && date) {
      // Load with today's date and all provinces
      onFiltersChange(options.movieId, null, date);
    }
  }, [isOpen, options.movieId]);
  
  // Notify parent when filters change (province or date changes)
  useEffect(() => {
    // Ensure we have all required values before calling onFiltersChange
    if (isOpen && onFiltersChange && options.movieId) {
      // If province is empty, pass null to get all provinces
      const provinceToUse = (province && province.trim() !== '') ? province : null;
      
      // Call with current date and province filter
      onFiltersChange(options.movieId, provinceToUse, date);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [province, date, options.movieId, isOpen]);

  // Filter cinemas: chỉ hiển thị cinemas có showtimes
  const filteredCinemas = useMemo(() => {
    let cinemas = options.cinemas || [];
    
    // Filter by province nếu có chọn
    if (province && province.trim() !== '') {
      cinemas = cinemas.filter(c => c.province === province);
    }
    
    // Chỉ hiển thị cinemas có showtimes thực tế
    return cinemas.filter(c => {
      const cinemaShowtimes = options.showtimes?.[c.id];
      if (!cinemaShowtimes) return false;
      
      // Kiểm tra xem có showtime nào không
      const hasShowtimes = Object.values(cinemaShowtimes).some(
        times => Array.isArray(times) && times.length > 0
      );
      return hasShowtimes;
    });
  }, [options.cinemas, options.showtimes, province]);

  // Không tự động set cinema - để user chọn "Tất cả" hoặc chọn rạp cụ thể
  // useEffect này đã được xóa vì default là "Tất cả" (empty)

  if (!isOpen) return null;

  return (
    <div className="modal cinema-mood" role="dialog" aria-modal="true">
      <div className="modal__panel">
        <div className="modal__header">
          <h3 className="section__title m-0">Chọn suất - {movieTitle}</h3>
          <button className="close" aria-label="Close" onClick={onClose}>×</button>
        </div>

        <div className="modal__filters">
          <div className="mt-3.5">
            <span className="field__label block mb-2">Tỉnh/Thành phố</span>
            <div className="chip-row--wrap">
              <button 
                key="all" 
                className={`chip ${province === '' ? 'chip--active' : ''}`} 
                onClick={() => setProvince('')}
              >
                Tất cả
              </button>
              {provinces.map((p) => (
                <button key={p} className={`chip ${province===p? 'chip--active': ''}`} onClick={() => setProvince(p)}>
                  {p}
                </button>
              ))}
            </div>
          </div>

          <div className="grid-3 mt-3.5">
            <label className="field">
              <span className="field__label">Rạp</span>
              <select className="field__input" value={cinema} onChange={(e)=>setCinema(e.target.value)}>
                <option value="">Tất cả</option>
                {filteredCinemas.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </label>
            <label className="field">
              <span className="field__label">Định dạng</span>
              <select className="field__input" value={format} onChange={(e)=>setFormat(e.target.value)}>
                {options.formats?.map(f => <option key={f} value={f}>{f}</option>)}
              </select>
            </label>
            <label className="field">
              <span className="field__label">Ngày</span>
              <input 
                className="field__input" 
                type="date" 
                value={date} 
                onChange={(e)=>setDate(e.target.value)}
                placeholder="Tất cả"
              />
              {date && (
                <button 
                  type="button"
                  onClick={() => setDate('')}
                  style={{ 
                    marginLeft: '8px', 
                    padding: '4px 8px', 
                    background: '#4a3f41', 
                    border: '1px solid #6b5d5f', 
                    color: '#fff', 
                    cursor: 'pointer',
                    borderRadius: '4px',
                    fontSize: '12px'
                  }}
                >
                  Xóa
                </button>
              )}
            </label>
          </div>
        </div>

        <div className="modal__body">
          <div className="cinema-list">
            {filteredCinemas.length === 0 ? (
              <div style={{ padding: '40px', textAlign: 'center', color: '#c9c4c5' }}>
                <p>Chưa có rạp nào trong tỉnh/thành phố này</p>
              </div>
            ) : filteredCinemas.map((c) => {
              // Filter by cinema nếu có chọn
              if (cinema && cinema.trim() !== '' && c.id !== cinema) {
                return null;
              }
              
              // If format is "Tất cả", show all showtimes from all formats
              // Otherwise, show only showtimes for the selected format
              let show = [];
              if (format === 'Tất cả') {
                // Get all showtimes from all formats for this cinema
                const allShowtimes = options.showtimes?.[c.id] || {};
                const allTimes = [];
                Object.keys(allShowtimes).forEach(fmt => {
                  if (allShowtimes[fmt] && Array.isArray(allShowtimes[fmt])) {
                    allShowtimes[fmt].forEach(timeData => {
                      // Keep the full object with time and showtimeId
                      if (typeof timeData === 'string') {
                        allTimes.push({ time: timeData, showtimeId: null });
                      } else {
                        allTimes.push(timeData);
                      }
                    });
                  }
                });
                // Remove duplicates by time and sort
                const uniqueMap = new Map();
                allTimes.forEach(item => {
                  const timeStr = item.time;
                  if (!uniqueMap.has(timeStr)) {
                    uniqueMap.set(timeStr, item);
                  }
                });
                show = Array.from(uniqueMap.values()).sort((a, b) => a.time.localeCompare(b.time));
              } else {
                const formatShowtimes = options.showtimes?.[c.id]?.[format] || [];
                // Keep the full object structure
                show = formatShowtimes;
              }
              
              // Filter by date nếu có chọn
              if (date && date.trim() !== '') {
                // Note: Date filtering should be done at API level, but we can filter here too
                // For now, we'll show all showtimes and let API handle date filtering
              }
              
              if (show.length === 0) {
                return null; // Don't render cinema if no showtimes
              }
              
              return (
                <div key={c.id} className="cinema-item" style={{ display: show.length === 0 ? 'none' : 'block' }}>
                  <div className="cinema-item__head">
                    <div className="cinema-item__name">{c.name}</div>
                    <div className="cinema-item__format">{format === 'Tất cả' ? 'Tất cả định dạng' : format}</div>
                  </div>
                  <div className="cinema-item__times">
                    {show.length === 0 ? (
                      <span className="card__meta">Chưa có suất</span>
                    ) : (
                      show.map((timeData) => {
                        // timeData can be just a time string or an object with time and showtimeId
                        const timeStr = typeof timeData === 'string' ? timeData : timeData.time;
                        const showtimeId = typeof timeData === 'object' && timeData.showtimeId ? timeData.showtimeId : null;
                        
                        // Build booking URL with parameters
                        const bookingParams = new URLSearchParams({
                          movieId: options.movieId || '',
                          cinemaId: c.id,
                          showtime: timeStr,
                          date: date,
                          format: format,
                          cinemaName: c.name
                        });
                        
                        // Add showtimeId if available
                        if (showtimeId) {
                          bookingParams.append('showtimeId', showtimeId);
                        }
                        
                        const bookingUrl = `/booking?${bookingParams.toString()}`;
                        return (
                          <button
                            key={timeStr}
                            onClick={() => {
                              // Check if user is logged in
                              const token = localStorage.getItem('jwt');
                              if (!token) {
                                // Show login modal if not logged in
                                setShowLoginModal(true);
                                return;
                              }
                              
                              // If logged in, proceed with booking
                              if (onShowtimeClick) {
                                onShowtimeClick(bookingUrl);
                              } else {
                                window.location.href = bookingUrl;
                              }
                            }}
                            className="btn" 
                            style={{ padding: '8px 12px', background: '#2d2627', border: '1px solid #4a3f41', color: '#fff', cursor: 'pointer' }}
                          >
                            {timeStr}
                          </button>
                        );
                      })
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      
      {/* Login Required Modal */}
      {showLoginModal && (
        <div className="modal cinema-mood" role="dialog" aria-modal="true" style={{ zIndex: 10001 }}>
          <div className="modal__panel" style={{ maxWidth: '500px', width: '90%' }}>
            <div className="modal__header">
              <h3 className="section__title m-0">Yêu cầu đăng nhập</h3>
              <button 
                className="close" 
                aria-label="Close" 
                onClick={() => setShowLoginModal(false)}
              >
                ×
              </button>
            </div>
            <div className="modal__body" style={{ padding: '24px' }}>
              <p style={{ marginBottom: '24px', color: '#c9c4c5', fontSize: '16px', lineHeight: '1.6' }}>
                Bạn cần đăng nhập để đặt vé xem phim. Vui lòng đăng nhập để tiếp tục.
              </p>
              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button
                  className="btn btn--ghost"
                  onClick={() => setShowLoginModal(false)}
                  style={{ padding: '10px 20px' }}
                >
                  Hủy
                </button>
                <button
                  className="btn btn--primary"
                  onClick={() => {
                    setShowLoginModal(false);
                    navigate('/signin');
                  }}
                  style={{ padding: '10px 20px', background: '#e83b41', color: '#fff' }}
                >
                  Đăng nhập
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


