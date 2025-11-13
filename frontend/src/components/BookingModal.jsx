import React, { useMemo, useState, useEffect } from 'react';

export default function BookingModal({ isOpen, onClose, movieTitle, options, onShowtimeClick }) {
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

  const provinces = [
    'Hồ Chí Minh', 'Hà Nội', 'Đà Nẵng', 'Cần Thơ', 'Đồng Nai', 'Hải Phòng',
    'Quảng Ninh', 'Bà Rịa-Vũng Tàu', 'Bình Định', 'Bình Dương', 'Đắk Lắk',
    'Trà Vinh', 'Kiên Giang', 'Hậu Giang', 'Hà Tĩnh', 'Phú Yên', 'Khánh Hòa',
    'Kon Tum', 'Lạng Sơn', 'Nghệ An', 'Phú Thọ', 'Quảng Ngãi', 'Sơn La', 'Tây Ninh', 'Tiền Giang'
  ];

  const [date, setDate] = useState(dates[0]?.key || '');
  const [province, setProvince] = useState(provinces[0] || '');
  const [cinema, setCinema] = useState('');
  const [format, setFormat] = useState(options.formats?.[0] || 'STANDARD');

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
          <h3 className="section__title" style={{ margin: 0 }}>Chọn suất - {movieTitle}</h3>
          <button className="close" aria-label="Close" onClick={onClose}>×</button>
        </div>

        <div className="modal__filters">
          <div className="chip-row">
            {dates.map((d) => (
              <button key={d.key} className={`chip ${date===d.key? 'chip--active': ''}`} onClick={() => setDate(d.key)}>
                {d.label}
              </button>
            ))}
          </div>

          <div style={{ marginTop: '14px' }}>
            <span className="field__label" style={{ display: 'block', marginBottom: '8px' }}>Tỉnh/Thành phố</span>
            <div className="chip-row--wrap">
              {provinces.map((p) => (
                <button key={p} className={`chip ${province===p? 'chip--active': ''}`} onClick={() => setProvince(p)}>
                  {p}
                </button>
              ))}
            </div>
          </div>

          <div className="grid-3" style={{ marginTop: '14px' }}>
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
            {filteredCinemas.map((c) => {
              const show = options.showtimes?.[c.id]?.[format] || [];
              return (
                <div key={c.id} className="cinema-item">
                  <div className="cinema-item__head">
                    <div className="cinema-item__name">{c.name}</div>
                    <div className="cinema-item__format">{format}</div>
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


