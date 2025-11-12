import React, { useState, useEffect } from 'react';
import Header from '../components/Header.jsx';
import Footer from '../components/Footer.jsx';

export default function Checkout() {
  const [cartData, setCartData] = useState(null);
  const [bookingData, setBookingData] = useState(null);
  
  // Sample customer data (would come from database/auth in real app)
  const customerInfo = {
    name: 'Nguyễn Văn A',
    phone: '0909000001',
    email: 'nguyenvana@example.com'
  };

  useEffect(() => {
    const savedCart = localStorage.getItem('checkoutCart');
    const savedBooking = localStorage.getItem('pendingBooking');
    
    if (savedCart) {
      setCartData(JSON.parse(savedCart));
    }
    if (savedBooking) {
      setBookingData(JSON.parse(savedBooking));
    }
    
    // Redirect back if no cart and no booking
    if (!savedCart && !savedBooking) {
      window.location.href = '#food-drinks';
    }
  }, []);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Here you would process the payment
    alert('Đặt hàng thành công!');
    localStorage.removeItem('checkoutCart');
    localStorage.removeItem('pendingBooking');
    window.location.href = '#orders';
  };

  const getTotalAmount = () => {
    const foodTotal = cartData?.totalAmount || 0;
    const ticketTotal = bookingData?.totalPrice || 0;
    return foodTotal + ticketTotal;
  };

  if (!cartData && !bookingData) {
    return (
      <div className="min-h-screen cinema-mood">
        <Header />
        <main className="main">
          <section className="section">
            <div className="container">
              <div style={{ textAlign: 'center', padding: '60px 20px', color: '#c9c4c5' }}>
                <p>Đang tải...</p>
              </div>
            </div>
          </section>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen cinema-mood">
      <Header />

      <main className="main">
        <section className="section">
          <div className="container">
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#ffd159' }}>
                <path d="M20 7h-4M4 7h4m0 0V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m-6 0v12m6-12v12M4 7v12"/>
              </svg>
              <h1 className="section__title" style={{ fontSize: 'clamp(28px, 4vw, 36px)', margin: 0, fontWeight: 800, letterSpacing: '-0.02em', fontFamily: 'system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif' }}>
                Thanh toán
              </h1>
            </div>

            <div className="checkout-container">
              <div className="checkout-main">
                {/* Customer Info */}
                <div className="checkout-section checkout-section--compact">
                  <h2 className="checkout-section__title checkout-section__title--small">Thông tin khách hàng</h2>
                  <div className="checkout-customer-info">
                    <div className="checkout-customer-info__item">
                      <span className="checkout-customer-info__label">Họ và tên:</span>
                      <span className="checkout-customer-info__value">{customerInfo.name}</span>
                    </div>
                    <div className="checkout-customer-info__item">
                      <span className="checkout-customer-info__label">Số điện thoại:</span>
                      <span className="checkout-customer-info__value">{customerInfo.phone}</span>
                    </div>
                    <div className="checkout-customer-info__item">
                      <span className="checkout-customer-info__label">Email:</span>
                      <span className="checkout-customer-info__value">{customerInfo.email}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Order Summary */}
              <div className="checkout-sidebar">
                <div className="checkout-summary">
                  <h2 className="checkout-summary__title">Đơn hàng</h2>
                  
                  {/* Cinema/Rạp info */}
                  <div className="checkout-summary__cinema">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: '8px' }}>
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                      <circle cx="12" cy="10" r="3"/>
                    </svg>
                    {bookingData?.cinemaName || (cartData?.cinema ? `Cinestar ${cartData.cinema.name} (${cartData.cinema.province})` : 'Chưa chọn rạp')}
                  </div>

                  <div className="checkout-summary__items">
                    {/* Movie Tickets */}
                    {bookingData && (
                      <>
                        <div style={{ marginTop: '16px', marginBottom: '8px', fontSize: '14px', fontWeight: 600, color: 'rgba(255,255,255,0.9)' }}>
                          Vé phim
                        </div>
                        <div className="checkout-summary-item">
                          <div className="checkout-summary-item__content" style={{ flex: 1 }}>
                            <div className="checkout-summary-item__name">{bookingData.movieTitle || 'Vé xem phim'}</div>
                            <div className="checkout-summary-item__meta">
                              {bookingData.room?.roomName} • {bookingData.room?.roomType}
                              {bookingData.showtime && (
                                <> • {new Date(bookingData.showtime.startTime).toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}</>
                              )}
                            </div>
                            <div className="checkout-summary-item__meta" style={{ marginTop: '4px' }}>
                              Ghế: {bookingData.seats?.join(', ')}
                            </div>
                          </div>
                          <div className="checkout-summary-item__total">
                            {formatPrice(bookingData.totalPrice || 0)}
                          </div>
                        </div>
                      </>
                    )}

                    {/* Food & Drinks */}
                    {cartData && cartData.items && cartData.items.length > 0 && (
                      <>
                        {bookingData && <div style={{ marginTop: '16px', marginBottom: '8px', fontSize: '14px', fontWeight: 600, color: 'rgba(255,255,255,0.9)' }}>
                          Đồ ăn nước uống
                        </div>}
                        {cartData.items.map((item) => (
                          <div key={item.id} className="checkout-summary-item">
                            <div className="checkout-summary-item__image">
                              <img src={item.image} alt={item.name} />
                            </div>
                            <div className="checkout-summary-item__content">
                              <div className="checkout-summary-item__name">{item.name}</div>
                              <div className="checkout-summary-item__meta">
                                {formatPrice(item.price)} x {item.quantity}
                              </div>
                            </div>
                            <div className="checkout-summary-item__total">
                              {formatPrice(item.price * item.quantity)}
                            </div>
                          </div>
                        ))}
                      </>
                    )}
                  </div>
                  
                  <div className="checkout-summary__total">
                    <div className="checkout-summary__total-row">
                      <span>Tổng cộng:</span>
                      <span className="checkout-summary__total-amount">{formatPrice(getTotalAmount())}</span>
                    </div>
                  </div>
                  <button 
                    className="btn btn--primary checkout-submit-btn" 
                    onClick={handleSubmit}
                  >
                    Xác nhận thanh toán
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

