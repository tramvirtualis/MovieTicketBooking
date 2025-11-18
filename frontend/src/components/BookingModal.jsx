import React, { useMemo, useState, useEffect } from 'react';

export default function BookingModal({ isOpen, onClose, movieTitle, options, onShowtimeClick, onFiltersChange }) {
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
    return today.toISOString().slice(0, 10);
  };
  
  const [date, setDate] = useState(''); // Default: Tất cả (empty = all dates)
  const [province, setProvince] = useState(''); // Default: Tất cả (empty = all provinces)
  const [cinema, setCinema] = useState(''); // Default: Tất cả (empty = all cinemas)
  const [format, setFormat] = useState('Tất cả');
  
  // Update date when dates array is ready
  useEffect(() => {
    if (dates.length > 0 && !date) {
      setDate(dates[0].key);
    }
  }, [dates]);
  
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
      setDate('');
      setFormat('Tất cả');
    }
  }, [isOpen]);
  
  // Notify parent when filters change or modal opens
  useEffect(() => {
    // Ensure we have all required values before calling onFiltersChange
    if (isOpen && onFiltersChange && options.movieId) {
      // If date is empty, pass null to get all dates
      const dateToUse = date && date.trim() !== '' ? date : null;
      // If province is empty, pass null to get all provinces
      const provinceToUse = (province && province.trim() !== '') ? province : null;
      
      // Call with null for "Tất cả" (all)
      onFiltersChange(options.movieId, provinceToUse, dateToUse);
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
    </div>
  );
}


