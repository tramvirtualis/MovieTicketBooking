import React, { useState } from 'react';
import Header from '../components/Header.jsx';
import Footer from '../components/Footer.jsx';
import interstellar from '../assets/images/interstellar.jpg';
import inception from '../assets/images/inception.jpg';
import darkKnightRises from '../assets/images/the-dark-knight-rises.jpg';
import driveMyCar from '../assets/images/drive-my-car.jpg';
import { updateCustomerProfile } from '../services/customer.js';

const PROVINCES = [
  'Hồ Chí Minh', 'Hà Nội', 'Đà Nẵng', 'Cần Thơ', 'Hải Phòng', 'An Giang', 'Bà Rịa - Vũng Tàu',
  'Bắc Giang', 'Bắc Kạn', 'Bạc Liêu', 'Bắc Ninh', 'Bến Tre', 'Bình Định', 'Bình Dương',
  'Bình Phước', 'Bình Thuận', 'Cà Mau', 'Cao Bằng', 'Đắk Lắk', 'Đắk Nông', 'Điện Biên',
  'Đồng Nai', 'Đồng Tháp', 'Gia Lai', 'Hà Giang', 'Hà Nam', 'Hà Tĩnh', 'Hải Dương',
  'Hậu Giang', 'Hòa Bình', 'Hưng Yên', 'Khánh Hòa', 'Kiên Giang', 'Kon Tum', 'Lai Châu',
  'Lâm Đồng', 'Lạng Sơn', 'Lào Cai', 'Long An', 'Nam Định', 'Nghệ An', 'Ninh Bình',
  'Ninh Thuận', 'Phú Thọ', 'Phú Yên', 'Quảng Bình', 'Quảng Nam', 'Quảng Ngãi', 'Quảng Ninh',
  'Quảng Trị', 'Sóc Trăng', 'Sơn La', 'Tây Ninh', 'Thái Bình', 'Thái Nguyên', 'Thanh Hóa',
  'Thừa Thiên Huế', 'Tiền Giang', 'Trà Vinh', 'Tuyên Quang', 'Vĩnh Long', 'Vĩnh Phúc', 'Yên Bái'
];


const storedUser = JSON.parse(localStorage.getItem('user')) || {};

// Map dữ liệu từ localStorage để khớp với cấu trúc backend
const initialUserData = {
  userId: storedUser.userId || "",
  name: storedUser.name || "",
  email: storedUser.email || "",
  phone: storedUser.phone || "",
  dob: storedUser.dob || "",
  joinDate: storedUser.joinDate || "",
  address: {
    description: storedUser.address?.description || "",
    province: storedUser.address?.province || ""
  },
  totalBookings: storedUser.totalBookings || 0,
  totalSpent: storedUser.totalSpent || 0,
  favoriteMovies: storedUser.favoriteMovies || 0,
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
    image: 'https://images.unsplash.com/photo-1511735111819-9a3f7709049c?q=80&w=1200&auto=format&fit=crop'
  },
  {
    id: 2,
    code: 'COMBO2025',
    title: 'Combo bắp nước miễn phí',
    description: 'Tặng combo bắp nước khi mua 2 vé',
    discount: 0,
    expiryDate: '2025-11-30',
    status: 'available',
    image: 'https://images.unsplash.com/photo-1512428559087-560fa5ceab42?q=80&w=1200&auto=format&fit=crop'
  },
  {
    id: 3,
    code: 'VIP100K',
    title: 'Giảm 100.000đ',
    description: 'Áp dụng cho đơn hàng từ 500.000đ',
    discount: 100000,
    expiryDate: '2025-10-15',
    status: 'expired',
    image: 'https://images.unsplash.com/photo-1524985069026-dd778a71c7b4?q=80&w=1200&auto=format&fit=crop'
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

export default function Profile() {
  const [userData, setUserData] = useState(initialUserData);
  const [activeTab, setActiveTab] = useState('overview');
  const [isEditing, setIsEditing] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  
  // State cho form edit - giữ nguyên tên field để dễ mapping với API
  const [editData, setEditData] = useState({
    name: initialUserData.name,
    email: initialUserData.email,
    phone: initialUserData.phone,
    dob: initialUserData.dob,
    addressDescription: initialUserData.address.description,
    addressProvince: initialUserData.address.province,
  });

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 5000);
  };

  const stats = [
    { label: 'Tổng số vé đã mua', value: userData.totalBookings, icon: 'ticket' },
    { label: 'Tổng chi tiêu', value: new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(userData.totalSpent), icon: 'money' },
    { label: 'Thành viên từ', value: userData.joinDate ? new Date(userData.joinDate).toLocaleDateString('vi-VN') : '-', icon: 'calendar' },
  ];

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

  const handleSaveChanges = async () => {
    try {
      // Gọi API với đúng payload format
      const updatedUser = await updateCustomerProfile(userData.userId, {
        name: editData.name,
        email: editData.email,
        phone: editData.phone,
        dob: editData.dob,
        addressDescription: editData.addressDescription,
        addressProvince: editData.addressProvince,
      });
  
      // Backend trả về Customer object với address
      // Format date nếu cần
      const formatDate = (date) => {
        if (!date) return "";
        if (typeof date === 'string') return date;
        // Nếu là LocalDate từ backend, format thành YYYY-MM-DD
        return date;
      };
  
      // Map dữ liệu từ backend response
      // Backend trả về Customer object với userId, name, email, phone, dob, address
      const updatedUserData = {
        userId: updatedUser.userId || userData.userId,
        name: updatedUser.name || editData.name || "",
        email: updatedUser.email || editData.email || "",
        phone: updatedUser.phone || editData.phone || "",
        dob: formatDate(updatedUser.dob) || editData.dob || "",
        joinDate: userData.joinDate || "", // Giữ nguyên joinDate cũ (không có trong response)
        address: {
          description: updatedUser.address?.description || editData.addressDescription || "",
          province: updatedUser.address?.province || editData.addressProvince || "",
        },
        totalBookings: userData.totalBookings || 0, // Giữ nguyên stats cũ (không có trong response)
        totalSpent: userData.totalSpent || 0,
        favoriteMovies: userData.favoriteMovies || 0,
      };
  
      // Cập nhật state và localStorage
      setUserData(updatedUserData);
      localStorage.setItem('user', JSON.stringify(updatedUserData));
      setIsEditing(false);
      
      showMessage('success', 'Cập nhật thông tin thành công!');
    } catch (err) {
      console.error('Lỗi cập nhật profile:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Có lỗi xảy ra khi cập nhật thông tin';
      showMessage('error', errorMessage);
      setIsEditing(false);
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
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline-block align-middle mr-1.5">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                      <polyline points="22,6 12,13 2,6"/>
                    </svg>
                    {userData.email}
                  </span>
                  <span>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline-block align-middle mr-1.5">
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
                        <div className="profile-stat-card__icon text-[#ffd159]">
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
                          {userData.dob ? new Date(userData.dob).toLocaleDateString('vi-VN') : '-'}
                        </span>
                      </div>
                      <div className="profile-info-item col-span-full">
                        <span className="profile-info-item__label">Địa chỉ</span>
                        <span className="profile-info-item__value">
                          {[userData.address?.description, userData.address?.province]
                            .filter(Boolean)
                            .join(', ') || '-'}
                        </span>
                      </div>
                    </div>
                    <button className="btn btn--primary mt-5" onClick={() => setIsEditing(true)}>
                      Chỉnh sửa thông tin
                    </button>
                  </div>

                  {/* Recent Bookings */}
                  <div className="profile-section">
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="profile-section__title">Đặt vé gần đây</h2>
                      <a href="/booking-history" className="profile-section__link">Xem tất cả</a>
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


              {activeTab === 'vouchers' && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                    <h2 className="profile-section__title">Voucher của tôi ({vouchers.length})</h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {vouchers.map((voucher) => {
                      const discountBadge = voucher.discount > 0 
                        ? `-${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(voucher.discount)}`
                        : 'FREE';
                      const isAvailable = voucher.status === 'available';
                      return (
                        <div 
                          key={voucher.id} 
                          className="group relative bg-gradient-to-br from-[#2d2627] to-[#1a1415] border border-[#4a3f41] rounded-2xl overflow-hidden hover:border-[#e83b41] transition-all duration-300 hover:shadow-xl hover:shadow-[#e83b41]/20 hover:-translate-y-1"
                        >
                          {/* Image Section */}
                          <div className="relative h-48 overflow-hidden">
                            <img
                              src={voucher.image || 'https://via.placeholder.com/1000x430?text=Voucher'}
                              alt={voucher.title}
                              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                            />
                            {/* Gradient Overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                            
                            {/* Discount Badge - Top Left */}
                            <div className="absolute top-3 left-3 bg-gradient-to-r from-[#e83b41] to-[#ff5258] text-white text-xs font-extrabold px-3 py-1.5 rounded-lg shadow-lg backdrop-blur-sm border border-white/20">
                              {discountBadge}
                            </div>
                            
                            {/* Status Badge - Top Right */}
                            <div className={`absolute top-3 right-3 px-3 py-1.5 rounded-lg text-xs font-bold uppercase shadow-lg backdrop-blur-sm border ${
                              isAvailable 
                                ? 'bg-[#4caf50] text-white border-white/20' 
                                : 'bg-[#9e9e9e] text-white border-white/20'
                            }`}>
                              {isAvailable ? 'Có thể dùng' : 'Đã hết hạn'}
                            </div>
                          </div>

                          {/* Content Section */}
                          <div className="p-5 flex flex-col min-h-[200px]">
                            {/* Title */}
                            <h3 className="text-lg font-bold text-white mb-3 line-clamp-2 leading-tight">
                              {voucher.title}
                            </h3>

                            {/* Code and Expiry Chips */}
                            <div className="flex flex-wrap gap-2 mb-3">
                              <span className="inline-flex items-center px-3 py-1.5 bg-[#4a3f41]/60 border border-[#4a3f41] rounded-lg text-xs font-semibold text-[#ffd159]">
                                Mã: {voucher.code}
                              </span>
                              <span className="inline-flex items-center px-3 py-1.5 bg-[#4a3f41]/60 border border-[#4a3f41] rounded-lg text-xs font-semibold text-[#ffd159]">
                                HSD: {new Date(voucher.expiryDate).toLocaleDateString('vi-VN')}
                              </span>
                            </div>

                            {/* Description */}
                            <p className="text-sm text-[#c9c4c5] line-clamp-2 mb-4 flex-1">
                              {voucher.description}
                            </p>

                            {/* Use Button - Centered */}
                            {isAvailable && (
                              <div className="mt-auto">
                                <button className="w-full bg-gradient-to-r from-[#e83b41] to-[#ff5258] hover:from-[#ff5258] hover:to-[#ff6b6b] text-white text-xs font-bold py-2.5 px-4 rounded-lg transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] shadow-md hover:shadow-lg uppercase tracking-wide">
                                  Sử dụng ngay
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>

      {/* Edit Profile Modal */}
      {isEditing && (
        <div className="movie-modal-overlay" onClick={() => {
          setIsEditing(false);
          // Reset form về giá trị hiện tại
          setEditData({
            name: userData.name,
            email: userData.email,
            phone: userData.phone,
            dob: userData.dob,
            addressDescription: userData.address.description,
            addressProvince: userData.address.province,
          });
        }}>
          <div className="movie-modal" onClick={(e) => e.stopPropagation()}>
            <div className="movie-modal__header">
              <h2>Chỉnh sửa thông tin cá nhân</h2>
              <button className="movie-modal__close" onClick={() => {
                setIsEditing(false);
                // Reset form về giá trị hiện tại
                setEditData({
                  name: userData.name,
                  email: userData.email,
                  phone: userData.phone,
                  dob: userData.dob,
                  addressDescription: userData.address.description,
                  addressProvince: userData.address.province,
                });
              }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
            <div className="movie-modal__content">
              <div className="movie-form">
                <div className="movie-form__group">
                  <label>Họ và tên <span className="required">*</span></label>
                  <input
                    type="text"
                    value={editData.name}
                    onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                    placeholder="Nhập họ và tên"
                  />
                </div>
                <div className="movie-form__row">
                  <div className="movie-form__group">
                    <label>Email <span className="required">*</span></label>
                    <input
                      type="email"
                      value={editData.email}
                      onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                      placeholder="Nhập email"
                    />
                  </div>
                  <div className="movie-form__group">
                    <label>Số điện thoại <span className="required">*</span></label>
                    <input
                      type="tel"
                      value={editData.phone}
                      onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                      placeholder="Nhập số điện thoại"
                    />
                  </div>
                </div>
                <div className="movie-form__group">
                  <label>Ngày sinh <span className="required">*</span></label>
                  <input
                    type="date"
                    value={editData.dob}
                    onChange={(e) => setEditData({ ...editData, dob: e.target.value })}
                  />
                </div>
                <div className="movie-form__group">
                  <label>Địa chỉ - Mô tả <span className="required">*</span></label>
                  <input
                    type="text"
                    value={editData.addressDescription}
                    onChange={(e) => setEditData({ ...editData, addressDescription: e.target.value })}
                    placeholder="Số nhà, đường, phường/xã, quận/huyện"
                  />
                </div>
                <div className="movie-form__group">
                  <label>Tỉnh/Thành phố <span className="required">*</span></label>
                  <select
                    value={editData.addressProvince}
                    onChange={(e) => setEditData({ ...editData, addressProvince: e.target.value })}
                  >
                    {PROVINCES.map(p => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
            <div className="movie-modal__footer">
              <button className="btn btn--ghost" onClick={() => {
                setIsEditing(false);
                // Reset form về giá trị hiện tại
                setEditData({
                  name: userData.name,
                  email: userData.email,
                  phone: userData.phone,
                  dob: userData.dob,
                  addressDescription: userData.address.description,
                  addressProvince: userData.address.province,
                });
              }}>
                Hủy
              </button>
              <button className="btn btn--primary" onClick={handleSaveChanges}>
                Lưu thay đổi
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Message Notification */}
      {message.text && (
        <div className={`fixed top-20 right-4 z-50 px-6 py-4 rounded-lg shadow-lg transition-all duration-300 ${
          message.type === 'success' 
            ? 'bg-green-500 text-white' 
            : 'bg-red-500 text-white'
        }`}>
          {message.text}
        </div>
      )}

      <Footer />
    </div>
  );
}