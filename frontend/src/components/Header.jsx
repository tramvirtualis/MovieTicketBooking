import React, { useState, useRef, useEffect } from 'react';

const cinemas = [
  { name: 'Quốc Thanh', province: 'TP.HCM' },
  { name: 'Hai Bà Trưng', province: 'TP.HCM' },
  { name: 'Sinh Viên', province: 'TP.HCM' },
  { name: 'Satra Quận 6', province: 'TP.HCM' },
  { name: 'Huế', province: 'TP. Huế' },
  { name: 'Đà Lạt', province: 'Lâm Đồng' },
  { name: 'Mỹ Tho', province: 'Đồng Tháp' },
  { name: 'Lâm Đồng', province: 'Đức Trọng' },
  { name: 'Kiên Giang', province: 'An Giang' },
];

export default function Header() {
  const [showCinemaDropdown, setShowCinemaDropdown] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowCinemaDropdown(false);
      }
    };

    if (showCinemaDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showCinemaDropdown]);

  return (
    <header className="site-header">
      <div className="container nav">
        <a className="logo" href="#home">🎬 cinesmart</a>
        <nav className="menu">
          <a href="#booking">Đặt vé phim chiếu rạp</a>
          <a href="#schedule">Lịch chiếu phim</a>
          <div className="menu-dropdown" ref={dropdownRef} style={{ position: 'relative' }}>
            <button
              className="menu-link"
              onClick={() => setShowCinemaDropdown(!showCinemaDropdown)}
              style={{
                background: 'transparent',
                border: 'none',
                color: showCinemaDropdown ? '#ffd159' : '#e6e1e2',
                fontWeight: 600,
                cursor: 'pointer',
                padding: 0
              }}
            >
              Rạp
            </button>
            {showCinemaDropdown && (
              <div className="cinema-dropdown">
                {cinemas.map((cinema, idx) => (
                  <a
                    key={idx}
                    href={`#cinema?name=${encodeURIComponent(cinema.name)}&province=${encodeURIComponent(cinema.province)}`}
                    className="cinema-dropdown__item"
                    onClick={() => setShowCinemaDropdown(false)}
                  >
                    Cinestar {cinema.name} ({cinema.province})
                  </a>
                ))}
              </div>
            )}
          </div>
          <a href="#news">Tin tức</a>
          <a href="#community">Cộng đồng</a>
        </nav>
        <div className="actions">
          <a className="btn btn--ghost" href="#register">Đăng ký</a>
          <a className="btn btn--primary" href="#signin">Đăng nhập</a>
        </div>
      </div>
    </header>
  );
}


