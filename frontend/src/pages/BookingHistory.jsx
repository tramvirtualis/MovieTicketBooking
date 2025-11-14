import React, { useState } from 'react';
import Header from '../components/Header.jsx';
import Footer from '../components/Footer.jsx';
import { QRCodeSVG } from 'qrcode.react';
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
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [activeTab, setActiveTab] = useState('upcoming'); // 'upcoming' hoặc 'completed'

  // Filter bookings theo tab
  const filteredBookings = bookings.filter((booking) => {
    if (booking.status === 'cancelled') return false;
    if (activeTab === 'upcoming') {
      return booking.status === 'upcoming';
    } else {
      return booking.status === 'completed';
    }
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
            <div className="flex items-center gap-3 mb-6">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#ffd159]">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
                <path d="M8 7h8M8 11h8M8 15h4"/>
              </svg>
              <h1 className="section__title text-[clamp(28px,4vw,36px)] m-0 font-extrabold tracking-tight" style={{ fontFamily: 'Inter, system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif' }}>
                Vé của tôi
              </h1>
            </div>

            {/* Tabs */}
            <div className="flex gap-3 mb-6">
              <button
                className={`booking-filter-tab ${activeTab === 'upcoming' ? 'booking-filter-tab--active' : ''}`}
                onClick={() => setActiveTab('upcoming')}
              >
                Vé sắp chiếu
              </button>
              <button
                className={`booking-filter-tab ${activeTab === 'completed' ? 'booking-filter-tab--active' : ''}`}
                onClick={() => setActiveTab('completed')}
              >
                Vé đã xem
              </button>
            </div>

            {/* Bookings List */}
            {filteredBookings.length === 0 ? (
              <div className="text-center py-[60px] px-5 text-[#c9c4c5]">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mx-auto mb-5 opacity-50">
                  <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
                  <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
                </svg>
                <p className="text-base m-0">Chưa có vé nào trong mục này</p>
              </div>
            ) : (
              <div className="grid gap-5">
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
                        <div className="booking-card__actions mt-4 flex gap-2.5">
                          <button 
                            className="btn btn--primary" 
                            style={{ fontSize: '14px', padding: '10px 20px' }}
                            onClick={() => {
                              setSelectedBooking(booking);
                              setShowTicketModal(true);
                            }}
                          >
                            Xem lại vé
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

      {/* Ticket Modal */}
      {showTicketModal && selectedBooking && (
        <div 
          className="modal-overlay" 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(4px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10000,
            padding: '20px'
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setShowTicketModal(false);
              setSelectedBooking(null);
            }
          }}
        >
          <div 
            className="ticket-modal"
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              maxWidth: '600px',
              width: '100%',
              maxHeight: '90vh',
              overflow: 'auto',
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.1)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Ticket Header */}
            <div style={{
              background: 'linear-gradient(135deg, #e83b41 0%, #c92e33 100%)',
              padding: '24px',
              borderRadius: '16px 16px 0 0',
              color: '#fff',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '32px', fontWeight: 800, marginBottom: '8px' }}>
                VÉ XEM PHIM
              </div>
              <div style={{ fontSize: '14px', opacity: 0.9 }}>
                Cinesmart Cinema
              </div>
            </div>

            {/* Ticket Content */}
            <div style={{ padding: '24px' }}>
              {/* Movie Info */}
              <div style={{ marginBottom: '24px', textAlign: 'center' }}>
                <h2 style={{ 
                  fontSize: '24px', 
                  fontWeight: 800, 
                  color: '#1a1415',
                  margin: '0 0 8px'
                }}>
                  {selectedBooking.movie.title}
                </h2>
                <div style={{ fontSize: '14px', color: '#333', marginBottom: '16px', fontWeight: 500 }}>
                  {selectedBooking.cinema}
                </div>
              </div>

              {/* Ticket Details Grid */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '16px',
                marginBottom: '24px',
                padding: '20px',
                backgroundColor: '#fafafa',
                borderRadius: '12px',
                border: '1px solid #e0e0e0'
              }}>
                <div>
                  <div style={{ fontSize: '12px', color: '#555', marginBottom: '4px', fontWeight: 600 }}>Ngày chiếu</div>
                  <div style={{ fontSize: '16px', fontWeight: 700, color: '#000' }}>{selectedBooking.date}</div>
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: '#555', marginBottom: '4px', fontWeight: 600 }}>Giờ chiếu</div>
                  <div style={{ fontSize: '16px', fontWeight: 700, color: '#000' }}>{selectedBooking.time}</div>
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: '#555', marginBottom: '4px', fontWeight: 600 }}>Định dạng</div>
                  <div style={{ fontSize: '16px', fontWeight: 700, color: '#000' }}>{selectedBooking.format}</div>
                </div>
                <div>
                  <div style={{ fontSize: '12px', color: '#555', marginBottom: '4px', fontWeight: 600 }}>Ghế</div>
                  <div style={{ fontSize: '16px', fontWeight: 700, color: '#000' }}>{selectedBooking.seats.join(', ')}</div>
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <div style={{ fontSize: '12px', color: '#555', marginBottom: '4px', fontWeight: 600 }}>Tổng tiền</div>
                  <div style={{ fontSize: '20px', fontWeight: 800, color: '#e83b41' }}>
                    {formatPrice(selectedBooking.price)}
                  </div>
                </div>
              </div>

              {/* QR Code */}
              <div style={{
                textAlign: 'center',
                padding: '20px',
                backgroundColor: '#fff',
                border: '2px dashed #ddd',
                borderRadius: '12px',
                marginBottom: '24px'
              }}>
                <div style={{ fontSize: '14px', color: '#333', marginBottom: '12px', fontWeight: 600 }}>
                  Mã QR Code - Vui lòng quét tại rạp
                </div>
                <div style={{
                  display: 'inline-block',
                  padding: '16px',
                  backgroundColor: '#fff',
                  borderRadius: '8px',
                  border: '1px solid #eee'
                }}>
                  <QRCodeSVG
                    value={JSON.stringify({
                      bookingId: selectedBooking.id,
                      movie: selectedBooking.movie.title,
                      cinema: selectedBooking.cinema,
                      date: selectedBooking.date,
                      time: selectedBooking.time,
                      seats: selectedBooking.seats,
                      format: selectedBooking.format
                    })}
                    size={200}
                    level="H"
                    includeMargin={true}
                  />
                </div>
                <div style={{ fontSize: '12px', color: '#555', marginTop: '12px', fontWeight: 500 }}>
                  Booking ID: {selectedBooking.id}
                </div>
              </div>

              {/* Booking Info */}
              <div style={{
                padding: '16px',
                backgroundColor: '#f5f5f5',
                borderRadius: '8px',
                fontSize: '13px',
                color: '#333',
                textAlign: 'center',
                fontWeight: 500
              }}>
                <div style={{ marginBottom: '4px' }}>
                  Ngày đặt: {selectedBooking.bookingDate}
                </div>
                <div style={{ marginTop: '8px', fontSize: '12px', color: '#555' }}>
                  Vui lòng đến rạp trước giờ chiếu 15 phút
                </div>
              </div>
            </div>

            {/* Ticket Footer */}
            <div 
              className="ticket-modal__footer"
              style={{
                padding: '16px 24px',
                borderTop: '1px solid #eee',
                display: 'flex',
                justifyContent: 'center',
                gap: '12px'
              }}
            >
              <button
                className="btn btn--primary"
                onClick={() => {
                  // Print ticket
                  window.print();
                }}
                style={{
                  fontSize: '14px',
                  padding: '10px 24px',
                  fontWeight: 600
                }}
              >
                In vé
              </button>
              <button
                className="btn btn--ghost"
                onClick={() => {
                  setShowTicketModal(false);
                  setSelectedBooking(null);
                }}
                style={{
                  fontSize: '14px',
                  padding: '10px 24px',
                  fontWeight: 600
                }}
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}

