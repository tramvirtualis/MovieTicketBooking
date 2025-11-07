import React, { useState } from 'react';
import Header from '../components/Header.jsx';
import Footer from '../components/Footer.jsx';
import interstellar from '../assets/images/interstellar.jpg';
import inception from '../assets/images/inception.jpg';
import darkKnightRises from '../assets/images/the-dark-knight-rises.jpg';
import driveMyCar from '../assets/images/drive-my-car.jpg';

// Sample user data
const userData = {
  name: 'Nguyễn Văn A',
  email: 'nguyenvana@example.com',
  phone: '0901234567',
  dob: '1995-05-15',
  joinDate: '2023-01-15',
  address: '123 Đường ABC, Phường XYZ, Quận 1, TP.HCM',
  totalBookings: 24,
  totalSpent: 2880000,
  favoriteMovies: 8,
};

const vouchers = [
  {
    id: 1,
    code: 'GIAM50K',
    title: 'Giảm 50.000đ',
    description: 'Áp dụng cho đơn hàng từ 200.000đ',
    discount: 50000,
    expiryDate: '2025-12-31',
    status: 'available',
  },
  {
    id: 2,
    code: 'COMBO2025',
    title: 'Combo bắp nước miễn phí',
    description: 'Tặng combo bắp nước khi mua 2 vé',
    discount: 0,
    expiryDate: '2025-11-30',
    status: 'available',
  },
  {
    id: 3,
    code: 'VIP100K',
    title: 'Giảm 100.000đ',
    description: 'Áp dụng cho đơn hàng từ 500.000đ',
    discount: 100000,
    expiryDate: '2025-10-15',
    status: 'expired',
  },
];

const favoriteMovies = [
  { id: 1, title: 'Inception', poster: inception, addedDate: '2024-10-15' },
  { id: 2, title: 'Interstellar', poster: interstellar, addedDate: '2024-09-20' },
  { id: 3, title: 'The Dark Knight Rises', poster: darkKnightRises, addedDate: '2024-08-10' },
  { id: 4, title: 'Drive My Car', poster: driveMyCar, addedDate: '2024-07-05' },
];

const recentBookings = [
  {
    id: 1,
    movie: 'Inception',
    cinema: 'Cinestar Quốc Thanh',
    date: '07/11/2025',
    status: 'completed',
  },
  {
    id: 2,
    movie: 'Interstellar',
    cinema: 'Cinestar Hai Bà Trưng',
    date: '10/11/2025',
    status: 'upcoming',
  },
];

const stats = [
  { label: 'Tổng số vé đã mua', value: userData.totalBookings, icon: 'ticket' },
  { label: 'Tổng chi tiêu', value: new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(userData.totalSpent), icon: 'money' },
  { label: 'Phim yêu thích', value: userData.favoriteMovies, icon: 'heart' },
  { label: 'Thành viên từ', value: new Date(userData.joinDate).toLocaleDateString('vi-VN'), icon: 'calendar' },
];

export default function Profile() {
  const [activeTab, setActiveTab] = useState('overview');

  const getIcon = (iconName) => {
    switch (iconName) {
      case 'ticket':
        return (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2 9a3 3 0 0 1 3-3h14a3 3 0 0 1 3 3v6a3 3 0 0 1-3 3H5a3 3 0 0 1-3-3V9z"/>
            <path d="M6 9v6M18 9v6"/>
          </svg>
        );
      case 'money':
        return (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="1" x2="12" y2="23"/>
            <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
          </svg>
        );
      case 'heart':
        return (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
          </svg>
        );
      case 'calendar':
        return (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
            <line x1="16" y1="2" x2="16" y2="6"/>
            <line x1="8" y1="2" x2="8" y2="6"/>
            <line x1="3" y1="10" x2="21" y2="10"/>
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen cinema-mood">
      <Header />

      <main className="main">
        <section className="section">
          <div className="container">
            {/* Profile Header */}
            <div className="profile-header">
              <div className="profile-header__avatar">
                <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="60" cy="60" r="60" fill="#4a3f41"/>
                  <circle cx="60" cy="45" r="25" fill="#e6e1e2"/>
                  <path d="M30 90c0-16.569 13.431-30 30-30s30 13.431 30 30" fill="#e6e1e2"/>
                </svg>
                <button className="profile-header__edit-avatar" title="Đổi ảnh đại diện">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                  </svg>
                </button>
              </div>
              <div className="profile-header__info">
                <h1 className="profile-header__name">{userData.name}</h1>
                <div className="profile-header__meta">
                  <span>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '6px' }}>
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                      <polyline points="22,6 12,13 2,6"/>
                    </svg>
                    {userData.email}
                  </span>
                  <span>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '6px' }}>
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                    </svg>
                    {userData.phone}
                  </span>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="profile-tabs">
              <button
                className={`profile-tab ${activeTab === 'overview' ? 'profile-tab--active' : ''}`}
                onClick={() => setActiveTab('overview')}
              >
                Tổng quan
              </button>
              <button
                className={`profile-tab ${activeTab === 'favorites' ? 'profile-tab--active' : ''}`}
                onClick={() => setActiveTab('favorites')}
              >
                Phim yêu thích
              </button>
              <button
                className={`profile-tab ${activeTab === 'bookings' ? 'profile-tab--active' : ''}`}
                onClick={() => setActiveTab('bookings')}
              >
                Lịch sử đặt vé
              </button>
              <button
                className={`profile-tab ${activeTab === 'vouchers' ? 'profile-tab--active' : ''}`}
                onClick={() => setActiveTab('vouchers')}
              >
                Voucher
              </button>
            </div>

            {/* Tab Content */}
            <div className="profile-content">
              {activeTab === 'overview' && (
                <div>
                  {/* Stats Grid */}
                  <div className="profile-stats-grid">
                    {stats.map((stat, idx) => (
                      <div key={idx} className="profile-stat-card">
                        <div className="profile-stat-card__icon" style={{ color: '#ffd159' }}>
                          {getIcon(stat.icon)}
                        </div>
                        <div className="profile-stat-card__content">
                          <div className="profile-stat-card__value">{stat.value}</div>
                          <div className="profile-stat-card__label">{stat.label}</div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Personal Information */}
                  <div className="profile-section">
                    <h2 className="profile-section__title">Thông tin cá nhân</h2>
                    <div className="profile-info-grid">
                      <div className="profile-info-item">
                        <span className="profile-info-item__label">Họ và tên</span>
                        <span className="profile-info-item__value">{userData.name}</span>
                      </div>
                      <div className="profile-info-item">
                        <span className="profile-info-item__label">Email</span>
                        <span className="profile-info-item__value">{userData.email}</span>
                      </div>
                      <div className="profile-info-item">
                        <span className="profile-info-item__label">Số điện thoại</span>
                        <span className="profile-info-item__value">{userData.phone}</span>
                      </div>
                      <div className="profile-info-item">
                        <span className="profile-info-item__label">Ngày sinh</span>
                        <span className="profile-info-item__value">
                          {new Date(userData.dob).toLocaleDateString('vi-VN')}
                        </span>
                      </div>
                      <div className="profile-info-item">
                        <span className="profile-info-item__label">Địa chỉ</span>
                        <span className="profile-info-item__value">{userData.address}</span>
                      </div>
                      <div className="profile-info-item">
                        <span className="profile-info-item__label">Tham gia từ</span>
                        <span className="profile-info-item__value">
                          {new Date(userData.joinDate).toLocaleDateString('vi-VN')}
                        </span>
                      </div>
                    </div>
                    <button className="btn btn--primary" style={{ marginTop: '20px' }}>
                      Chỉnh sửa thông tin
                    </button>
                  </div>

                  {/* Recent Bookings */}
                  <div className="profile-section">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                      <h2 className="profile-section__title">Đặt vé gần đây</h2>
                      <a href="#booking-history" className="profile-section__link">Xem tất cả</a>
                    </div>
                    <div className="profile-bookings-list">
                      {recentBookings.map((booking) => (
                        <div key={booking.id} className="profile-booking-item">
                          <div>
                            <div className="profile-booking-item__title">{booking.movie}</div>
                            <div className="profile-booking-item__meta">
                              {booking.cinema} • {booking.date}
                            </div>
                          </div>
                          <span className={`booking-status booking-status--${booking.status}`}>
                            {booking.status === 'completed' ? 'Đã xem' : 'Sắp chiếu'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'favorites' && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                    <h2 className="profile-section__title">Phim yêu thích ({favoriteMovies.length})</h2>
                  </div>
                  <div className="profile-favorites-grid">
                    {favoriteMovies.map((movie) => (
                      <a
                        key={movie.id}
                        href={`#movie?title=${encodeURIComponent(movie.title)}`}
                        className="profile-favorite-card"
                      >
                        <div className="profile-favorite-card__poster">
                          <img src={movie.poster} alt={movie.title} />
                          <div className="profile-favorite-card__overlay">
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                            </svg>
                          </div>
                        </div>
                        <div className="profile-favorite-card__title">{movie.title}</div>
                        <div className="profile-favorite-card__date">
                          Thêm vào {new Date(movie.addedDate).toLocaleDateString('vi-VN')}
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'bookings' && (
                <div>
                  <div style={{ marginBottom: '24px' }}>
                    <a href="#booking-history" className="btn btn--primary">
                      Xem toàn bộ lịch sử đặt vé
                    </a>
                  </div>
                  <div className="profile-section">
                    <p style={{ color: '#c9c4c5', textAlign: 'center', padding: '40px 20px' }}>
                      Chuyển đến trang <a href="#booking-history" style={{ color: '#ffd159' }}>Lịch sử đặt vé</a> để xem chi tiết
                    </p>
                  </div>
                </div>
              )}

              {activeTab === 'vouchers' && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                    <h2 className="profile-section__title">Voucher của tôi ({vouchers.length})</h2>
                  </div>
                  <div className="profile-vouchers-grid">
                    {vouchers.map((voucher) => (
                      <div key={voucher.id} className={`profile-voucher-card ${voucher.status === 'expired' ? 'profile-voucher-card--expired' : ''}`}>
                        <div className="profile-voucher-card__header">
                          <div className="profile-voucher-card__code">{voucher.code}</div>
                          {voucher.status === 'expired' && (
                            <span className="profile-voucher-badge profile-voucher-badge--expired">Đã hết hạn</span>
                          )}
                          {voucher.status === 'available' && (
                            <span className="profile-voucher-badge profile-voucher-badge--available">Có thể dùng</span>
                          )}
                        </div>
                        <div className="profile-voucher-card__content">
                          <div className="profile-voucher-card__title">{voucher.title}</div>
                          <div className="profile-voucher-card__desc">{voucher.description}</div>
                          {voucher.discount > 0 && (
                            <div className="profile-voucher-card__discount">
                              Giảm {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(voucher.discount)}
                            </div>
                          )}
                          <div className="profile-voucher-card__expiry">
                            HSD: {new Date(voucher.expiryDate).toLocaleDateString('vi-VN')}
                          </div>
                        </div>
                        {voucher.status === 'available' && (
                          <button className="btn btn--primary" style={{ width: '100%', marginTop: '12px' }}>
                            Sử dụng ngay
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

