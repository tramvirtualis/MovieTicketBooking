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
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [user, setUser] = useState(null); // lưu thông tin user
  const dropdownRef = useRef(null);
  const userDropdownRef = useRef(null);

  useEffect(() => {
    // Lấy user từ localStorage khi load
    const storedUser = localStorage.getItem('user');
    if (storedUser) setUser(JSON.parse(storedUser));

    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowCinemaDropdown(false);
      }
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target)) {
        setShowUserDropdown(false);
      }
    };

    if (showCinemaDropdown || showUserDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showCinemaDropdown, showUserDropdown]);

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('jwt');
    setUser(null);
    window.location.href = '/';
  };

  return (
    <header className="site-header">
      <div className="container nav">
        <a className="logo" href="#home">
          <span className="logo__text">cinesmart</span>
        </a>
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
          <a href="#food-drinks">Đồ ăn nước uống</a>
          <a href="#events">Sự kiện và khuyến mãi</a>
        </nav>

        <div className="actions">
          {user ? (
            <div className="user-menu" ref={userDropdownRef} style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: '8px' }}>
              {/* Hiển thị username */}
              <span style={{ color: '#fff', fontWeight: 600 }}>{user.username}</span>

              {/* Avatar */}
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

              {/* Dropdown menu */}
              {showUserDropdown && (
                <div className="user-dropdown">
                  <a href="#profile" className="user-dropdown__item" onClick={() => setShowUserDropdown(false)}>
                    Trang cá nhân
                  </a>
                  <a href="#orders" className="user-dropdown__item" onClick={() => setShowUserDropdown(false)}>
                    Đơn hàng
                  </a>
                  <div className="user-dropdown__divider"></div>
                  <a href="#library" className="user-dropdown__item" onClick={() => setShowUserDropdown(false)}>
                    Thư viện phim
                  </a>
                  <a href="#booking-history" className="user-dropdown__item" onClick={() => setShowUserDropdown(false)}>
                    Lịch sử đặt vé
                  </a>
                  <div className="user-dropdown__divider"></div>
                  <button
                    className="user-dropdown__item user-dropdown__item--logout"
                    onClick={handleLogout}
                  >
                    Đăng xuất
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <a className="btn btn--ghost" href="#register">Đăng ký</a>
              <a className="btn btn--primary" href="#signin">Đăng nhập</a>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
