import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import NotificationBell from './NotificationBell';

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

export default function Header({ children }) {
  const navigate = useNavigate();
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
    navigate('/');
  };

  return (
    <header className="site-header">
      <div className="container nav">
        <Link className="logo" to="/">
          <svg className="logo__icon" width="32" height="32" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="logoGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#e83b41" stopOpacity="1" />
                <stop offset="50%" stopColor="#ff5258" stopOpacity="1" />
                <stop offset="100%" stopColor="#ff6b6b" stopOpacity="1" />
              </linearGradient>
              <filter id="logoGlow">
                <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                <feMerge>
                  <feMergeNode in="coloredBlur"/>
                  <feMergeNode in="SourceGraphic"/>
                </feMerge>
              </filter>
            </defs>
            <circle cx="18" cy="18" r="17" fill="url(#logoGradient)" filter="url(#logoGlow)" opacity="0.9"/>
            <circle cx="18" cy="18" r="14" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5"/>
            <circle cx="18" cy="18" r="10" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="1"/>
            <rect x="8" y="8" width="20" height="20" rx="2" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5"/>
            <path d="M14 14L22 18L14 22V14Z" fill="rgba(255,255,255,0.95)"/>
            <circle cx="10" cy="10" r="1.5" fill="rgba(255,255,255,0.6)"/>
            <circle cx="26" cy="10" r="1.5" fill="rgba(255,255,255,0.6)"/>
            <circle cx="10" cy="26" r="1.5" fill="rgba(255,255,255,0.6)"/>
            <circle cx="26" cy="26" r="1.5" fill="rgba(255,255,255,0.6)"/>
          </svg>
          <span className="logo__text">cinesmart</span>
        </Link>
        <nav className="menu">
          <Link to="/schedule">Lịch chiếu phim</Link>
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
                  <Link
                    key={idx}
                    to={`/cinema/${encodeURIComponent(cinema.name)}?province=${encodeURIComponent(cinema.province)}`}
                    className="cinema-dropdown__item"
                    onClick={() => setShowCinemaDropdown(false)}
                  >
                    Cinestar {cinema.name} ({cinema.province})
                  </Link>
                ))}
              </div>
            )}
          </div>
          <Link to="/food-drinks">Đồ ăn nước uống</Link>
          <Link to="/events">Sự kiện và khuyến mãi</Link>
        </nav>

        <div className="actions">
          {/* render optional header children */}
          {children}
          
          {/* Notification Bell - Always visible when user is logged in */}
          {user && <NotificationBell />}
          
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
                  <Link to="/profile" className="user-dropdown__item" onClick={() => setShowUserDropdown(false)}>
                    Trang cá nhân
                  </Link>
                  <Link to="/orders" className="user-dropdown__item" onClick={() => setShowUserDropdown(false)}>
                    Đơn hàng
                  </Link>
                  <div className="user-dropdown__divider"></div>
                  <Link to="/library" className="user-dropdown__item" onClick={() => setShowUserDropdown(false)}>
                    Thư viện phim
                  </Link>
                  <Link to="/booking-history" className="user-dropdown__item" onClick={() => setShowUserDropdown(false)}>
                    Lịch sử đặt vé
                  </Link>
                  <div className="user-dropdown__divider"></div>
                  <button
                    className="user-dropdown__item user-dropdown__item--logout"
                    onClick={handleLogout}
                    style={{
                      width: '100%',
                      textAlign: 'left',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer'
                    }}
                  >
                    Đăng xuất
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link className="btn btn--ghost" to="/register">Đăng ký</Link>
              <Link className="btn btn--primary" to="/signin">Đăng nhập</Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}