import React, { useState } from 'react';
import Header from '../components/Header.jsx';
import Footer from '../components/Footer.jsx';
import interstellar from '../assets/images/interstellar.jpg';
import inception from '../assets/images/inception.jpg';
import darkKnightRises from '../assets/images/the-dark-knight-rises.jpg';
import driveMyCar from '../assets/images/drive-my-car.jpg';

// Sample booking data
const bookings = [
  {
    id: '1',
    movie: {
      title: 'Inception',
      poster: inception,
    },
    cinema: 'Cinestar Quốc Thanh (TPHCM)',
    date: '07/11/2025',
    time: '19:30',
    format: 'STANDARD',
    seats: ['A5', 'A6'],
    price: 120000,
    status: 'completed', // completed, upcoming, cancelled
    bookingDate: '05/11/2025',
  },
  {
    id: '2',
    movie: {
      title: 'Interstellar',
      poster: interstellar,
    },
    cinema: 'Cinestar Hai Bà Trưng (TPHCM)',
    date: '10/11/2025',
    time: '21:00',
    format: 'IMAX 2D',
    seats: ['E8', 'E9', 'E10'],
    price: 180000,
    status: 'upcoming',
    bookingDate: '06/11/2025',
  },
  {
    id: '3',
    movie: {
      title: 'The Dark Knight Rises',
      poster: darkKnightRises,
    },
    cinema: 'Cinestar Satra Quận 6 (TPHCM)',
    date: '03/11/2025',
    time: '20:10',
    format: 'STANDARD',
    seats: ['C12'],
    price: 120000,
    status: 'completed',
    bookingDate: '01/11/2025',
  },
  {
    id: '4',
    movie: {
      title: 'Drive My Car',
      poster: driveMyCar,
    },
    cinema: 'Cinestar Quốc Thanh (TPHCM)',
    date: '12/11/2025',
    time: '18:45',
    format: 'DELUXE',
    seats: ['F3', 'F4'],
    price: 150000,
    status: 'cancelled',
    bookingDate: '08/11/2025',
  },
];

export default function BookingHistory() {
  const [filterStatus, setFilterStatus] = useState('all'); // all, completed, upcoming, cancelled

  const filteredBookings = bookings.filter((booking) => {
    if (filterStatus === 'all') return true;
    return booking.status === filterStatus;
  });

  const getStatusLabel = (status) => {
    switch (status) {
      case 'completed':
        return 'Đã xem';
      case 'upcoming':
        return 'Sắp chiếu';
      case 'cancelled':
        return 'Đã hủy';
      default:
        return status;
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'completed':
        return 'booking-status--completed';
      case 'upcoming':
        return 'booking-status--upcoming';
      case 'cancelled':
        return 'booking-status--cancelled';
      default:
        return '';
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  return (
    <div className="min-h-screen cinema-mood">
      <Header />

      <main className="main">
        <section className="section">
          <div className="container">
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#ffd159' }}>
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
                <path d="M8 7h8M8 11h8M8 15h4"/>
              </svg>
              <h1 className="section__title" style={{ fontSize: 'clamp(24px, 3vw, 32px)', margin: 0, fontWeight: 900 }}>
                Lịch sử đặt vé
              </h1>
            </div>

            {/* Filter Tabs */}
            <div style={{ display: 'flex', gap: '10px', marginBottom: '28px', flexWrap: 'wrap' }}>
              <button
                className={`booking-filter-tab ${filterStatus === 'all' ? 'booking-filter-tab--active' : ''}`}
                onClick={() => setFilterStatus('all')}
              >
                Tất cả
              </button>
              <button
                className={`booking-filter-tab ${filterStatus === 'completed' ? 'booking-filter-tab--active' : ''}`}
                onClick={() => setFilterStatus('completed')}
              >
                Đã xem
              </button>
              <button
                className={`booking-filter-tab ${filterStatus === 'upcoming' ? 'booking-filter-tab--active' : ''}`}
                onClick={() => setFilterStatus('upcoming')}
              >
                Sắp chiếu
              </button>
              <button
                className={`booking-filter-tab ${filterStatus === 'cancelled' ? 'booking-filter-tab--active' : ''}`}
                onClick={() => setFilterStatus('cancelled')}
              >
                Đã hủy
              </button>
            </div>

            {/* Bookings List */}
            {filteredBookings.length === 0 ? (
              <div style={{ 
                textAlign: 'center', 
                padding: '60px 20px',
                color: '#c9c4c5'
              }}>
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ margin: '0 auto 20px', opacity: 0.5 }}>
                  <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
                  <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
                </svg>
                <p style={{ fontSize: '16px', margin: 0 }}>Chưa có vé nào trong mục này</p>
              </div>
            ) : (
              <div style={{ display: 'grid', gap: '20px' }}>
                {filteredBookings.map((booking) => (
                  <div key={booking.id} className="booking-card">
                    <div className="booking-card__poster">
                      <img src={booking.movie.poster} alt={booking.movie.title} />
                    </div>
                    <div className="booking-card__content">
                      <div className="booking-card__header">
                        <div>
                          <h3 className="booking-card__title">
                            <a href={`#movie?title=${encodeURIComponent(booking.movie.title)}`}>
                              {booking.movie.title}
                            </a>
                          </h3>
                          <div className="booking-card__meta">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', verticalAlign: 'middle', marginRight: '6px' }}>
                              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                              <circle cx="12" cy="10" r="3"/>
                            </svg>
                            {booking.cinema}
                          </div>
                        </div>
                        <span className={`booking-status ${getStatusClass(booking.status)}`}>
                          {getStatusLabel(booking.status)}
                        </span>
                      </div>

                      <div className="booking-card__details">
                        <div className="booking-detail-item">
                          <span className="booking-detail-item__label">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                              <line x1="16" y1="2" x2="16" y2="6"/>
                              <line x1="8" y1="2" x2="8" y2="6"/>
                              <line x1="3" y1="10" x2="21" y2="10"/>
                            </svg>
                            Ngày chiếu
                          </span>
                          <span className="booking-detail-item__value">{booking.date}</span>
                        </div>
                        <div className="booking-detail-item">
                          <span className="booking-detail-item__label">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <circle cx="12" cy="12" r="10"/>
                              <polyline points="12 6 12 12 16 14"/>
                            </svg>
                            Giờ chiếu
                          </span>
                          <span className="booking-detail-item__value">{booking.time}</span>
                        </div>
                        <div className="booking-detail-item">
                          <span className="booking-detail-item__label">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <rect x="2" y="4" width="20" height="16" rx="2"/>
                              <path d="M7 4v16M17 4v16M2 8h20M2 12h20M2 16h20"/>
                            </svg>
                            Định dạng
                          </span>
                          <span className="booking-detail-item__value">{booking.format}</span>
                        </div>
                        <div className="booking-detail-item">
                          <span className="booking-detail-item__label">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                              <line x1="16" y1="2" x2="16" y2="6"/>
                              <line x1="8" y1="2" x2="8" y2="6"/>
                              <line x1="3" y1="10" x2="21" y2="10"/>
                            </svg>
                            Ghế
                          </span>
                          <span className="booking-detail-item__value">{booking.seats.join(', ')}</span>
                        </div>
                        <div className="booking-detail-item">
                          <span className="booking-detail-item__label">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <line x1="12" y1="1" x2="12" y2="23"/>
                              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                            </svg>
                            Tổng tiền
                          </span>
                          <span className="booking-detail-item__value booking-detail-item__value--price">
                            {formatPrice(booking.price)}
                          </span>
                        </div>
                        <div className="booking-detail-item">
                          <span className="booking-detail-item__label">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <circle cx="12" cy="12" r="10"/>
                              <polyline points="12 6 12 12 16 14"/>
                            </svg>
                            Ngày đặt
                          </span>
                          <span className="booking-detail-item__value">{booking.bookingDate}</span>
                        </div>
                      </div>

                      {booking.status === 'upcoming' && (
                        <div className="booking-card__actions" style={{ marginTop: '16px', display: 'flex', gap: '10px' }}>
                          <button className="btn btn--primary" style={{ fontSize: '14px', padding: '10px 20px' }}>
                            Xem lại vé
                          </button>
                          <button className="btn btn--ghost" style={{ fontSize: '14px', padding: '10px 20px' }}>
                            Hủy vé
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

