import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import Header from '../components/Header.jsx';
import Footer from '../components/Footer.jsx';
import interstellar from '../assets/images/interstellar.jpg';
import inception from '../assets/images/inception.jpg';
import darkKnightRises from '../assets/images/the-dark-knight-rises.jpg';
import driveMyCar from '../assets/images/drive-my-car.jpg';
import { updateCustomerProfile, uploadAvatar, getExpenseStatistics, getCurrentProfile, updateOldOrders } from '../services/customer.js';
import { customerVoucherService } from '../services/customerVoucherService';

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
  avatar: storedUser.avatar || null,
  totalBookings: storedUser.totalBookings || 0,
  totalSpent: storedUser.totalSpent || 0,
  favoriteMovies: storedUser.favoriteMovies || 0,
};

// Vouchers sẽ được load từ API

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
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [userData, setUserData] = useState(initialUserData);
  const [activeTab, setActiveTab] = useState('overview');
  const [isEditing, setIsEditing] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [vouchers, setVouchers] = useState([]);
  const [loadingVouchers, setLoadingVouchers] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [expenseStats, setExpenseStats] = useState({
    totalSpent: 0,
    totalTickets: 0,
    totalOrders: 0,
    thisMonthSpent: 0,
    lastMonthSpent: 0,
    lastThreeMonthsSpent: 0
  });
  const [loadingExpenseStats, setLoadingExpenseStats] = useState(false);

  // Load user profile from API
  useEffect(() => {
    const loadUserProfile = async () => {
      const token = localStorage.getItem('jwt');
      const storedUser = JSON.parse(localStorage.getItem('user')) || {};
      
      if (!token) {
        // Fallback to localStorage if no token
        if (storedUser.userId) {
          setUserData({
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
            avatar: storedUser.avatar || null,
            totalBookings: storedUser.totalBookings || 0,
            totalSpent: storedUser.totalSpent || 0,
            favoriteMovies: storedUser.favoriteMovies || 0,
          });
        }
        return;
      }

      try {
        const profile = await getCurrentProfile();
        console.log('Loaded profile from API:', profile);
        
        // Update userData
        setUserData({
          userId: profile.userId || "",
          name: profile.name || "",
          email: profile.email || "",
          phone: profile.phone || "",
          dob: profile.dob || "",
          joinDate: storedUser.joinDate || "",
          address: {
            description: profile.address?.description || "",
            province: profile.address?.province || ""
          },
          avatar: profile.avatar || null,
          totalBookings: storedUser.totalBookings || 0,
          totalSpent: storedUser.totalSpent || 0,
          favoriteMovies: storedUser.favoriteMovies || 0,
        });

        // Update localStorage với avatar mới
        storedUser.avatar = profile.avatar;
        storedUser.name = profile.name;
        storedUser.email = profile.email;
        storedUser.phone = profile.phone;
        storedUser.dob = profile.dob;
        if (profile.address) {
          storedUser.address = profile.address;
        }
        localStorage.setItem('user', JSON.stringify(storedUser));
        
        // Dispatch event để Header cập nhật avatar
        window.dispatchEvent(new Event('userUpdated'));
      } catch (error) {
        console.error('Error loading profile from API:', error);
        // Fallback to localStorage
        if (storedUser.userId) {
          setUserData({
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
            avatar: storedUser.avatar || null,
            totalBookings: storedUser.totalBookings || 0,
            totalSpent: storedUser.totalSpent || 0,
            favoriteMovies: storedUser.favoriteMovies || 0,
          });
        }
      }
    };

    loadUserProfile();
  }, []);

  // Read tab from URL query parameter on mount
  useEffect(() => {
    const tabFromUrl = searchParams.get('tab');
    if (tabFromUrl && ['overview', 'vouchers', 'expenses'].includes(tabFromUrl)) {
      setActiveTab(tabFromUrl);
    } else {
      // If no tab in URL, default to overview (but don't add ?tab=overview to URL)
      setActiveTab('overview');
    }
  }, []); // Only run on mount

  // Load vouchers from API
  useEffect(() => {
    const loadVouchers = async () => {
      const token = localStorage.getItem('jwt');
      if (!token) {
        setVouchers([]);
        return;
      }

      setLoadingVouchers(true);
      try {
        const result = await customerVoucherService.getUserVouchers();
        if (result.success) {
          setVouchers(result.data || []);
        } else {
          setVouchers([]);
        }
      } catch (error) {
        console.error('Error loading vouchers:', error);
        setVouchers([]);
      } finally {
        setLoadingVouchers(false);
      }
    };

    loadVouchers();
  }, []);

  // Load expense statistics when expenses tab is active
  useEffect(() => {
    const loadExpenseStatistics = async () => {
      const token = localStorage.getItem('jwt');
      if (!token) {
        console.error('No JWT token found');
        return;
      }
      
      if (activeTab !== 'expenses') {
        console.log('Not on expenses tab, skipping load. Active tab:', activeTab);
        return;
      }

      console.log('=== Starting to load expense statistics ===');
      setLoadingExpenseStats(true);
      
      try {
        // First, update old orders to set vnpPayDate
        console.log('Updating old orders first...');
        const updateResult = await updateOldOrders();
        console.log('Update old orders result:', updateResult);
        
        console.log('Calling getExpenseStatistics API...');
        const stats = await getExpenseStatistics();
        
        console.log('=== API Response ===');
        console.log('Full response:', stats);
        console.log('Response keys:', Object.keys(stats));
        console.log('totalSpent:', stats.totalSpent, 'Type:', typeof stats.totalSpent);
        console.log('totalTickets:', stats.totalTickets, 'Type:', typeof stats.totalTickets);
        console.log('totalOrders:', stats.totalOrders, 'Type:', typeof stats.totalOrders);
        
        const expenseData = {
          totalSpent: stats.totalSpent ? Number(stats.totalSpent) : 0,
          totalTickets: stats.totalTickets ? Number(stats.totalTickets) : 0,
          totalOrders: stats.totalOrders ? Number(stats.totalOrders) : 0,
          thisMonthSpent: stats.thisMonthSpent ? Number(stats.thisMonthSpent) : 0,
          lastMonthSpent: stats.lastMonthSpent ? Number(stats.lastMonthSpent) : 0,
          lastThreeMonthsSpent: stats.lastThreeMonthsSpent ? Number(stats.lastThreeMonthsSpent) : 0
        };
        
        console.log('=== Data to set in state ===');
        console.log('Expense data:', expenseData);
        
        setExpenseStats(expenseData);
        console.log('State updated successfully');
      } catch (error) {
        console.error('=== Error loading expense statistics ===');
        console.error('Error:', error);
        console.error('Error message:', error.message);
        console.error('Error response:', error.response);
        console.error('Error response data:', error.response?.data);
        console.error('Error response status:', error.response?.status);
        // Keep default values on error
      } finally {
        setLoadingExpenseStats(false);
        console.log('=== Finished loading expense statistics ===');
      }
    };

    loadExpenseStatistics();
  }, [activeTab]);

  // Handler to change tab and update URL
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === 'overview') {
      // Remove tab parameter for overview (default tab)
      const newSearchParams = new URLSearchParams(searchParams);
      newSearchParams.delete('tab');
      setSearchParams(newSearchParams, { replace: true });
    } else {
      // Update URL with tab parameter
      const newSearchParams = new URLSearchParams(searchParams);
      newSearchParams.set('tab', tab);
      setSearchParams(newSearchParams, { replace: true });
    }
  };
  
  const [editData, setEditData] = useState({
    name: initialUserData.name,
    email: initialUserData.email,
    phone: initialUserData.phone,
    dob: initialUserData.dob,
    addressDescription: initialUserData.address.description,
    addressProvince: initialUserData.address.province,
  });

  const [formMessage, setFormMessage] = useState({ type: '', text: '' });

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 5000);
  };

  const showFormMessage = (type, text) => {
    setFormMessage({ type, text });
    // Scroll to top of modal content
    setTimeout(() => {
      const modalContent = document.querySelector('.movie-modal__content');
      if (modalContent) {
        modalContent.scrollTop = 0;
      }
    }, 0);
  };

  // Handle avatar upload
  const handleAvatarUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      showMessage('error', 'Chỉ chấp nhận file ảnh');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      showMessage('error', 'Kích thước file không được vượt quá 5MB');
      return;
    }

    try {
      setUploadingAvatar(true);
      const avatarUrl = await uploadAvatar(userData.userId, file);
      
      // Update userData and localStorage
      const updatedUserData = { ...userData, avatar: avatarUrl };
      setUserData(updatedUserData);
      
      // Update localStorage
      const storedUser = JSON.parse(localStorage.getItem('user')) || {};
      storedUser.avatar = avatarUrl;
      localStorage.setItem('user', JSON.stringify(storedUser));
      
      // Dispatch event to update header avatar
      window.dispatchEvent(new Event('userUpdated'));
      
      showMessage('success', 'Cập nhật ảnh đại diện thành công');
    } catch (error) {
      showMessage('error', error.message || 'Có lỗi xảy ra khi upload ảnh');
    } finally {
      setUploadingAvatar(false);
      // Reset input
      e.target.value = '';
    }
  };


  const stats = [
    { label: 'Tổng số vé đã mua', value: userData.totalBookings, icon: 'ticket' },
    { label: 'Tổng chi tiêu', value: new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(userData.totalSpent), icon: 'money' },
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
      // Clear previous messages
      setFormMessage({ type: '', text: '' });

      // Validate: Tên không được để trống
      if (!editData.name.trim()) {
        showFormMessage('error', 'Vui lòng nhập họ và tên');
        return;
      }

      // Validate: Tuổi phải từ 13 trở lên
      if (editData.dob) {
        const birthDate = new Date(editData.dob);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
          age--;
        }
        
        if (age < 13) {
          showFormMessage('error', 'Bạn phải từ 13 tuổi trở lên');
          return;
        }
      }

      const updatedUser = await updateCustomerProfile(userData.userId, {
        name: editData.name,
        email: editData.email,
        phone: editData.phone,
        dob: editData.dob,
        addressDescription: editData.addressDescription,
        addressProvince: editData.addressProvince,
      });
  
      const formatDate = (date) => {
        if (!date) return "";
        if (typeof date === 'string') return date;
        return date;
      };
  
      // Map response data correctly
      const updatedUserData = {
        userId: updatedUser.userId || userData.userId,
        name: updatedUser.name || editData.name || "",
        email: updatedUser.email || editData.email || "",
        phone: updatedUser.phone || editData.phone || "",
        dob: formatDate(updatedUser.dob) || editData.dob || "",
        joinDate: userData.joinDate || "",
        avatar: updatedUser.avatar || userData.avatar || null,
        address: {
          description: (updatedUser.address && updatedUser.address.description) 
            ? updatedUser.address.description 
            : (editData.addressDescription || ""),
          province: (updatedUser.address && updatedUser.address.province) 
            ? updatedUser.address.province 
            : (editData.addressProvince || ""),
        },
        totalBookings: userData.totalBookings || 0,
        totalSpent: userData.totalSpent || 0,
        favoriteMovies: userData.favoriteMovies || 0,
      };
  
      setUserData(updatedUserData);
      localStorage.setItem('user', JSON.stringify(updatedUserData));
      
      // Show success message but don't close form
      showFormMessage('success', 'Cập nhật thông tin thành công!');
      
      // Auto close after 3 seconds
      setTimeout(() => {
        setIsEditing(false);
        setFormMessage({ type: '', text: '' });
      }, 3000);
    } catch (err) {
      console.error('Lỗi cập nhật profile:', err);
      let errorMessage = err.response?.data?.message || err.message || 'Có lỗi xảy ra khi cập nhật thông tin';
      
      // Xóa các prefix "email:", "dob:", "phone:" khỏi thông báo lỗi
      errorMessage = errorMessage
        .replace(/email:\s*/gi, '')
        .replace(/dob:\s*/gi, '')
        .replace(/phone:\s*/gi, '')
        .replace(/name:\s*/gi, '')
        .replace(/address:\s*/gi, '');
      
      // Show error message inside form, don't close form
      showFormMessage('error', errorMessage);
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
                {userData.avatar ? (
                  <img 
                    src={userData.avatar} 
                    alt="Avatar" 
                    className="profile-avatar-image"
                  />
                ) : (
                  <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="60" cy="60" r="60" fill="#4a3f41"/>
                    <circle cx="60" cy="45" r="25" fill="#e6e1e2"/>
                    <path d="M30 90c0-16.569 13.431-30 30-30s30 13.431 30 30" fill="#e6e1e2"/>
                  </svg>
                )}
                <div style={{ position: 'relative' }}>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarUpload}
                    disabled={uploadingAvatar}
                    style={{
                      position: 'absolute',
                      width: '40px',
                      height: '40px',
                      opacity: 0,
                      cursor: uploadingAvatar ? 'not-allowed' : 'pointer',
                      zIndex: 2
                    }}
                    id="avatar-upload"
                  />
                  <label
                    htmlFor="avatar-upload"
                    className="profile-header__edit-avatar"
                    title={uploadingAvatar ? 'Đang tải...' : 'Đổi ảnh đại diện'}
                    style={{
                      cursor: uploadingAvatar ? 'not-allowed' : 'pointer',
                      opacity: uploadingAvatar ? 0.6 : 1
                    }}
                  >
                    {uploadingAvatar ? (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10" strokeDasharray="31.416" strokeDashoffset="31.416">
                          <animate attributeName="stroke-dasharray" dur="2s" values="0 31.416;15.708 15.708;0 31.416;0 31.416" repeatCount="indefinite"/>
                          <animate attributeName="stroke-dashoffset" dur="2s" values="0;-15.708;-31.416;-31.416" repeatCount="indefinite"/>
                        </circle>
                      </svg>
                    ) : (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                      </svg>
                    )}
                  </label>
                </div>
              </div>
              <div className="profile-header__info">
                <h1 className="profile-header__name">{userData.name}</h1>
                <div className="profile-header__meta">
                  <span>{userData.email}</span>
                  <span>{userData.phone}</span>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="profile-tabs">
              <button
                className={`profile-tab ${activeTab === 'overview' ? 'profile-tab--active' : ''}`}
                onClick={() => handleTabChange('overview')}
              >
                Tổng quan
              </button>
              <button
                className={`profile-tab ${activeTab === 'vouchers' ? 'profile-tab--active' : ''}`}
                onClick={() => handleTabChange('vouchers')}
              >
                Voucher
              </button>
              <button
                className={`profile-tab ${activeTab === 'expenses' ? 'profile-tab--active' : ''}`}
                onClick={() => handleTabChange('expenses')}
              >
                Chi tiêu
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
                    {loadingVouchers ? (
                      <div className="col-span-full flex items-center justify-center py-12">
                        <div className="text-center">
                          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#e83b41] mb-4"></div>
                          <p className="text-[#c9c4c5]">Đang tải voucher...</p>
                        </div>
                      </div>
                    ) : vouchers.length === 0 ? (
                      <div className="col-span-full text-center py-12">
                        <svg className="w-16 h-16 mx-auto mb-4 text-[#4a3f41]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
                        </svg>
                        <p className="text-[#c9c4c5] text-lg">Bạn chưa có voucher nào</p>
                        <a href="/events" className="text-[#e83b41] hover:text-[#ff5258] mt-2 inline-block">
                          Khám phá voucher ngay →
                        </a>
                      </div>
                    ) : (
                      vouchers.map((voucher) => {
                        const discountBadge = voucher.discountType === 'PERCENT'
                          ? `-${voucher.discountPercent}%`
                          : voucher.discount > 0
                          ? `-${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(voucher.discount)}`
                          : 'FREE';
                        const isAvailable = voucher.status === 'available';
                        const statusText = voucher.status === 'upcoming' ? 'Sắp diễn ra' : voucher.status === 'available' ? 'Có thể dùng' : 'Đã hết hạn';
                        const statusColor = voucher.status === 'upcoming' ? 'bg-[#ff9800]' : voucher.status === 'available' ? 'bg-[#4caf50]' : 'bg-[#9e9e9e]';
                        
                        return (
                          <div 
                            key={voucher.voucherId || voucher.id} 
                            className="group relative bg-gradient-to-br from-[#2d2627] to-[#1a1415] border border-[#4a3f41] rounded-2xl overflow-hidden hover:border-[#e83b41] transition-all duration-300 hover:shadow-xl hover:shadow-[#e83b41]/20 hover:-translate-y-1"
                          >
                            {/* Image Section */}
                            <div className="relative h-48 overflow-hidden">
                              <img
                                src={voucher.image || 'https://via.placeholder.com/1000x430?text=Voucher'}
                                alt={voucher.title || voucher.name}
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                              
                              <div className="absolute top-3 left-3 bg-gradient-to-r from-[#e83b41] to-[#ff5258] text-white text-xs font-extrabold px-3 py-1.5 rounded-lg shadow-lg backdrop-blur-sm border border-white/20">
                                {discountBadge}
                              </div>
                              
                              <div className={`absolute top-3 right-3 px-3 py-1.5 rounded-lg text-xs font-bold uppercase shadow-lg backdrop-blur-sm border ${statusColor} text-white border-white/20`}>
                                {statusText}
                              </div>
                            </div>

                            {/* Content Section */}
                            <div className="p-5 flex flex-col min-h-[200px]">
                              <h3 className="text-lg font-bold text-white mb-3 line-clamp-2 leading-tight">
                                {voucher.title || voucher.name}
                              </h3>

                              <div className="flex flex-wrap gap-2 mb-3">
                                <span className="inline-flex items-center px-3 py-1.5 bg-[#4a3f41]/60 border border-[#4a3f41] rounded-lg text-xs font-semibold text-[#ffd159]">
                                  Mã: {voucher.code}
                                </span>
                                {voucher.expiryDate && (
                                  <span className="inline-flex items-center px-3 py-1.5 bg-[#4a3f41]/60 border border-[#4a3f41] rounded-lg text-xs font-semibold text-[#ffd159]">
                                    HSD: {new Date(voucher.expiryDate).toLocaleDateString('vi-VN')}
                                  </span>
                                )}
                              </div>

                              <p className="text-sm text-[#c9c4c5] line-clamp-2 mb-4 flex-1">
                                {voucher.description || 'Không có mô tả'}
                              </p>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'expenses' && (
                <div>
                  {loadingExpenseStats ? (
                    <div className="text-center py-[60px] px-5 text-[#c9c4c5]">
                      <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#ffd159] mb-5"></div>
                      <p className="text-base m-0">Đang tải thống kê chi tiêu...</p>
                    </div>
                  ) : (
                    <>
                      {/* Main Statistics - 3 columns */}
                      <div className="profile-stats-grid" style={{ marginBottom: '32px' }}>
                        {/* Tổng chi tiêu */}
                        <div className="profile-stat-card">
                          <div className="profile-stat-card__icon text-[#ffd159]">
                            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <line x1="12" y1="1" x2="12" y2="23"/>
                              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                            </svg>
                          </div>
                          <div className="profile-stat-card__content">
                            <div className="profile-stat-card__value">
                              {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(expenseStats.totalSpent)}
                            </div>
                            <div className="profile-stat-card__label">Tổng chi tiêu</div>
                          </div>
                        </div>

                        {/* Tổng số vé */}
                        <div className="profile-stat-card">
                          <div className="profile-stat-card__icon text-[#2196f3]">
                            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M2 9a3 3 0 0 1 3-3h14a3 3 0 0 1 3 3v6a3 3 0 0 1-3 3H5a3 3 0 0 1-3-3V9z"/>
                              <path d="M6 9v6M18 9v6"/>
                            </svg>
                          </div>
                          <div className="profile-stat-card__content">
                            <div className="profile-stat-card__value">{expenseStats.totalTickets}</div>
                            <div className="profile-stat-card__label">Tổng số vé đã mua</div>
                          </div>
                        </div>

                        {/* Tổng số đơn hàng */}
                        <div className="profile-stat-card">
                          <div className="profile-stat-card__icon text-[#4caf50]">
                            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
                              <rect x="8" y="2" width="8" height="4" rx="1" ry="1"/>
                              <path d="M9 12h6M9 16h6"/>
                            </svg>
                          </div>
                          <div className="profile-stat-card__content">
                            <div className="profile-stat-card__value">{expenseStats.totalOrders}</div>
                            <div className="profile-stat-card__label">Tổng số đơn hàng</div>
                          </div>
                        </div>
                      </div>

                      {/* Monthly Expenses */}
                      <div className="profile-section">
                        <h2 className="profile-section__title">Chi tiêu theo tháng</h2>
                        <div style={{ marginTop: '20px', padding: '20px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px' }}>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                            <div style={{ padding: '16px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)' }}>
                              <div style={{ fontSize: '13px', color: '#c9c4c5', marginBottom: '8px' }}>Tháng này</div>
                              <div style={{ fontSize: '20px', fontWeight: 700, color: '#fff' }}>
                                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(expenseStats.thisMonthSpent)}
                              </div>
                            </div>
                            <div style={{ padding: '16px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)' }}>
                              <div style={{ fontSize: '13px', color: '#c9c4c5', marginBottom: '8px' }}>Tháng trước</div>
                              <div style={{ fontSize: '20px', fontWeight: 700, color: '#fff' }}>
                                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(expenseStats.lastMonthSpent)}
                              </div>
                            </div>
                            <div style={{ padding: '16px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)' }}>
                              <div style={{ fontSize: '13px', color: '#c9c4c5', marginBottom: '8px' }}>3 tháng qua</div>
                              <div style={{ fontSize: '20px', fontWeight: 700, color: '#fff' }}>
                                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(expenseStats.lastThreeMonthsSpent)}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
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
          setFormMessage({ type: '', text: '' });
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
                setFormMessage({ type: '', text: '' });
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
              {/* Message inside form */}
              {formMessage.text && (
                <div className={`mb-4 px-4 py-3 rounded-lg font-semibold transition-all duration-300 ${
                  formMessage.type === 'success' 
                    ? 'bg-green-500/20 text-green-400 border border-green-500/50' 
                    : 'bg-red-500/20 text-red-400 border border-red-500/50'
                }`}>
                  {formMessage.text}
                </div>
              )}
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
                    <option value="">-- Chọn tỉnh/thành phố --</option>
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
                setFormMessage({ type: '', text: '' });
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