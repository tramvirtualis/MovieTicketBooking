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

  // Get unique provinces from cinemas
  const provinces = useMemo(() => {
    const uniqueProvinces = new Set();
    (options.cinemas || []).forEach(c => {
      if (c.province) uniqueProvinces.add(c.province);
    });
    return Array.from(uniqueProvinces).sort();
  }, [options.cinemas]);

  const [date, setDate] = useState(dates[0]?.key || '');
  const [province, setProvince] = useState(provinces[0] || '');
  const [cinema, setCinema] = useState('');
  const [format, setFormat] = useState(options.formats?.[0] || 'Tất cả');
  
  // Update format when options.formats changes
  useEffect(() => {
    if (options.formats && options.formats.length > 0) {
      // If current format is not in the new formats list, switch to first available
      if (!options.formats.includes(format)) {
        setFormat(options.formats[0]);
      }
    }
  }, [options.formats]);
  
  // Notify parent when filters change or modal opens
  useEffect(() => {
    console.log('=== DEBUG: BookingModal useEffect ===');
    console.log('isOpen:', isOpen);
    console.log('onFiltersChange:', !!onFiltersChange);
    console.log('options.movieId:', options.movieId);
    console.log('date:', date);
    console.log('province:', province);
    
    if (isOpen && onFiltersChange && options.movieId && date) {
      console.log('Calling onFiltersChange with:', { 
        movieId: options.movieId, 
        province: province || null, 
        date 
      });
      onFiltersChange(options.movieId, province || null, date);
    }
  }, [province, date, options.movieId, onFiltersChange, isOpen]);
  
  // Reset province when modal opens
  useEffect(() => {
    if (isOpen && provinces.length > 0) {
      console.log('Setting province to:', provinces[0]);
      setProvince(provinces[0]);
    }
  }, [isOpen, provinces]);

  const filteredCinemas = useMemo(() => {
    return (options.cinemas || []).filter(c => c.province === province);
  }, [options.cinemas, province]);

  useEffect(() => {
    if (filteredCinemas.length > 0 && !filteredCinemas.find(c => c.id === cinema)) {
      setCinema(filteredCinemas[0].id);
    } else if (filteredCinemas.length === 0) {
      setCinema('');
    }
  }, [filteredCinemas, cinema]);

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
              <select className="field__input" value={cinema} onChange={(e)=>setCinema(e.target.value)} disabled={filteredCinemas.length === 0}>
                {filteredCinemas.length === 0 ? (
                  <option value="">Chưa có rạp</option>
                ) : (
                  filteredCinemas.map(c => <option key={c.id} value={c.id}>{c.name}</option>)
                )}
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
              <input className="field__input" type="date" value={date} onChange={(e)=>setDate(e.target.value)} />
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
              // If format is "Tất cả", show all showtimes from all formats
              // Otherwise, show only showtimes for the selected format
              let show = [];
              if (format === 'Tất cả') {
                // Get all showtimes from all formats for this cinema
                const allShowtimes = options.showtimes?.[c.id] || {};
                const allTimes = [];
                Object.keys(allShowtimes).forEach(fmt => {
                  if (allShowtimes[fmt] && Array.isArray(allShowtimes[fmt])) {
                    allTimes.push(...allShowtimes[fmt]);
                  }
                });
                // Remove duplicates and sort
                show = [...new Set(allTimes)].sort();
              } else {
                show = options.showtimes?.[c.id]?.[format] || [];
              }
              
              return (
                <div key={c.id} className="cinema-item">
                  <div className="cinema-item__head">
                    <div className="cinema-item__name">{c.name}</div>
                    <div className="cinema-item__format">{format === 'Tất cả' ? 'Tất cả định dạng' : format}</div>
                  </div>
                  <div className="cinema-item__times">
                    {show.length === 0 ? (
                      <span className="card__meta">Chưa có suất</span>
                    ) : (
                      show.map((t) => {
                        // Build booking URL with parameters
                        const bookingParams = new URLSearchParams({
                          movieId: options.movieId || '',
                          cinemaId: c.id,
                          showtime: t,
                          date: date,
                          format: format,
                          cinemaName: c.name
                        });
                        const bookingUrl = `#booking?${bookingParams.toString()}`;
                        return (
                          <button
                            key={t}
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
                            {t}
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


