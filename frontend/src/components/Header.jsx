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
  const [showNewsDropdown, setShowNewsDropdown] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const dropdownRef = useRef(null);
  const newsDropdownRef = useRef(null);
  const userDropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowCinemaDropdown(false);
      }
      if (newsDropdownRef.current && !newsDropdownRef.current.contains(event.target)) {
        setShowNewsDropdown(false);
      }
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target)) {
        setShowUserDropdown(false);
      }
    };

    if (showCinemaDropdown || showNewsDropdown || showUserDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showCinemaDropdown, showNewsDropdown, showUserDropdown]);

  return (
    <header className="site-header">
      <div className="container nav">
        <a className="logo" href="#home">🎬 cinesmart</a>
        <nav className="menu">
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
          <div className="menu-dropdown" ref={newsDropdownRef} style={{ position: 'relative' }}>
            <button
              className="menu-link"
              onClick={() => setShowNewsDropdown(!showNewsDropdown)}
              style={{
                background: 'transparent',
                border: 'none',
                color: showNewsDropdown ? '#ffd159' : '#e6e1e2',
                fontWeight: 600,
                cursor: 'pointer',
                padding: 0
              }}
            >
              Tin tức
            </button>
            {showNewsDropdown && (
              <div className="cinema-dropdown">
                <a
                  href="#cinema-news"
                  className="cinema-dropdown__item"
                  onClick={() => setShowNewsDropdown(false)}
                >
                  Tin điện ảnh
                </a>
                <a
                  href="#movie-reviews"
                  className="cinema-dropdown__item"
                  onClick={() => setShowNewsDropdown(false)}
                >
                  Đánh giá phim
                </a>
              </div>
            )}
          </div>
          <a href="#events">Sự kiện và khuyến mãi</a>
        </nav>
        <div className="actions">
          <div className="user-menu" ref={userDropdownRef} style={{ position: 'relative' }}>
            <button
              className="user-avatar"
              onClick={() => setShowUserDropdown(!showUserDropdown)}
              aria-label="User menu"
            >
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="16" cy="16" r="16" fill="#4a3f41"/>
                <circle cx="16" cy="12" r="5" fill="#e6e1e2"/>
                <path d="M8 26c0-4.418 3.582-8 8-8s8 3.582 8 8" fill="#e6e1e2"/>
              </svg>
            </button>
            {showUserDropdown && (
              <div className="user-dropdown">
                <a href="#profile" className="user-dropdown__item" onClick={() => setShowUserDropdown(false)}>
                  Trang cá nhân
                </a>
                <a href="#account" className="user-dropdown__item" onClick={() => setShowUserDropdown(false)}>
                  Quản lý tài khoản
                </a>
                <div className="user-dropdown__divider"></div>
                <a href="#library" className="user-dropdown__item" onClick={() => setShowUserDropdown(false)}>
                  Thư viện phim
                </a>
                <a href="#booking-history" className="user-dropdown__item" onClick={() => setShowUserDropdown(false)}>
                  Lịch sử đặt vé
                </a>
                <div className="user-dropdown__divider"></div>
                <a href="#logout" className="user-dropdown__item user-dropdown__item--logout" onClick={() => setShowUserDropdown(false)}>
                  Đăng xuất
                </a>
              </div>
            )}
          </div>
          <a className="btn btn--ghost" href="#register">Đăng ký</a>
          <a className="btn btn--primary" href="#signin">Đăng nhập</a>
        </div>
      </div>
    </header>
  );
}


