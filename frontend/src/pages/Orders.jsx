import React, { useState, useEffect } from 'react';
import Header from '../components/Header.jsx';
import Footer from '../components/Footer.jsx';
import interstellar from '../assets/images/interstellar.jpg';
import inception from '../assets/images/inception.jpg';
import darkKnightRises from '../assets/images/the-dark-knight-rises.jpg';
import driveMyCar from '../assets/images/drive-my-car.jpg';

// Sample orders data
const orders = [
  {
    orderId: 'ORD-2025-001',
    orderDate: '2025-11-05',
    totalAmount: 240000,
    status: 'completed', // completed, pending, cancelled
    items: [
      {
        id: '1',
        movie: {
          title: 'Inception',
          poster: inception,
        },
        cinema: 'Cinestar Quốc Thanh (TPHCM)',
        showtime: {
          date: '07/11/2025',
          time: '19:30',
          format: 'STANDARD'
        },
        seats: ['A5', 'A6'],
        price: 120000,
      }
    ],
    paymentMethod: 'Thẻ tín dụng',
    bookingDate: '05/11/2025 14:30'
  },
  {
    orderId: 'ORD-2025-002',
    orderDate: '2025-11-06',
    totalAmount: 690000,
    status: 'pending',
    items: [
      {
        id: '2',
        movie: {
          title: 'Interstellar',
          poster: interstellar,
        },
        cinema: 'Cinestar Hai Bà Trưng (TPHCM)',
        showtime: {
          date: '10/11/2025',
          time: '21:00',
          format: 'IMAX 2D'
        },
        seats: ['E8', 'E9', 'E10'],
        price: 540000,
      }
    ],
    foodItems: [
      {
        id: 'f1',
        name: 'Bắp rang bơ',
        quantity: 2,
        price: 45000,
        image: 'https://images.unsplash.com/photo-1578849278619-e73505e9610f?w=400&h=300&fit=crop'
      },
      {
        id: 'd1',
        name: 'Coca Cola',
        quantity: 2,
        price: 30000,
        image: 'https://images.unsplash.com/photo-1554866585-cd94860890b7?w=400&h=300&fit=crop'
      }
    ],
    paymentMethod: 'Ví điện tử',
    bookingDate: '06/11/2025 10:15'
  },
  {
    orderId: 'ORD-2025-003',
    orderDate: '2025-11-01',
    totalAmount: 120000,
    status: 'completed',
    items: [
      {
        id: '3',
        movie: {
          title: 'The Dark Knight Rises',
          poster: darkKnightRises,
        },
        cinema: 'Cinestar Satra Quận 6 (TPHCM)',
        showtime: {
          date: '03/11/2025',
          time: '20:10',
          format: 'STANDARD'
        },
        seats: ['C12'],
        price: 120000,
      }
    ],
    paymentMethod: 'Tiền mặt',
    bookingDate: '01/11/2025 18:45'
  },
];

export default function Orders() {
  const [filterStatus, setFilterStatus] = useState('all'); // all, completed, pending
  const [currentPage, setCurrentPage] = useState(1);
  const ordersPerPage = 5;

  const filteredOrders = orders.filter((order) => {
    if (filterStatus === 'all') return true;
    return order.status === filterStatus;
  });

  // Calculate pagination
  const totalPages = Math.ceil(filteredOrders.length / ordersPerPage);
  const startIndex = (currentPage - 1) * ordersPerPage;
  const endIndex = startIndex + ordersPerPage;
  const currentOrders = filteredOrders.slice(startIndex, endIndex);

  // Reset to page 1 when filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [filterStatus]);

  const getStatusLabel = (status) => {
    switch (status) {
      case 'completed':
        return 'Hoàn thành';
      case 'pending':
        return 'Đang xử lý';
      default:
        return status;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return '#4caf50';
      case 'pending':
        return '#ffd159';
      default:
        return '#9e9e9e';
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  return (
    <div className="min-h-screen cinema-mood">
      <Header />

      <main className="main">
        <section className="section">
          <div className="container">
            <div className="flex items-center gap-3 mb-6">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#ffd159]">
                <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
                <rect x="8" y="2" width="8" height="4" rx="1" ry="1"/>
                <path d="M9 12h6M9 16h6"/>
              </svg>
              <h1 className="section__title text-[clamp(28px,4vw,36px)] m-0 font-extrabold tracking-tight">
                Đơn hàng
              </h1>
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-2.5 mb-7 flex-wrap">
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
                Hoàn thành
              </button>
              <button
                className={`booking-filter-tab ${filterStatus === 'pending' ? 'booking-filter-tab--active' : ''}`}
                onClick={() => setFilterStatus('pending')}
              >
                Đang xử lý
              </button>
            </div>

            {/* Orders List */}
            {currentOrders.length === 0 ? (
              <div className="text-center py-[60px] px-5 text-[#c9c4c5]">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mx-auto mb-5 opacity-50">
                  <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
                  <rect x="8" y="2" width="8" height="4" rx="1" ry="1"/>
                </svg>
                <p className="text-base m-0">Chưa có đơn hàng nào trong mục này</p>
              </div>
            ) : (
              <>
                <div className="orders-list">
                  {currentOrders.map((order) => (
                  <div key={order.orderId} className="order-card">
                    <div className="order-card__header">
                      <div className="order-card__header-left">
                        <div className="order-card__id">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                            <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
                            <rect x="8" y="2" width="8" height="4" rx="1" ry="1"/>
                          </svg>
                          {order.orderId}
                        </div>
                        <div className="order-card__date">
                          {formatDate(order.orderDate)}
                        </div>
                      </div>
                      <div className="order-card__header-right">
                        <span 
                          className="order-status"
                          style={{ 
                            backgroundColor: getStatusColor(order.status) + '20',
                            color: getStatusColor(order.status),
                            border: `1px solid ${getStatusColor(order.status)}40`
                          }}
                        >
                          {getStatusLabel(order.status)}
                        </span>
                        <div className="order-card__total">
                          {formatPrice(order.totalAmount)}
                        </div>
                      </div>
                    </div>

                    <div className="order-card__items">
                      {/* Movie Items */}
                      {order.items && order.items.map((item) => (
                        <div key={item.id} className="order-item">
                          <div className="order-item__poster">
                            <img src={item.movie.poster} alt={item.movie.title} />
                          </div>
                          <div className="order-item__content">
                            <h3 className="order-item__title">
                              <a href={`#movie?title=${encodeURIComponent(item.movie.title)}`}>
                                {item.movie.title}
                              </a>
                            </h3>
                            <div className="order-item__details">
                              <div className="order-item__detail-row">
                                <span className="order-item__detail-label">
                                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                                    <circle cx="12" cy="10" r="3"/>
                                  </svg>
                                  Rạp
                                </span>
                                <span className="order-item__detail-value">{item.cinema}</span>
                              </div>
                              <div className="order-item__detail-row">
                                <span className="order-item__detail-label">
                                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                                    <line x1="16" y1="2" x2="16" y2="6"/>
                                    <line x1="8" y1="2" x2="8" y2="6"/>
                                    <line x1="3" y1="10" x2="21" y2="10"/>
                                  </svg>
                                  Suất chiếu
                                </span>
                                <span className="order-item__detail-value">
                                  {item.showtime.date} • {item.showtime.time} • {item.showtime.format}
                                </span>
                              </div>
                              <div className="order-item__detail-row">
                                <span className="order-item__detail-label">
                                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                                    <line x1="16" y1="2" x2="16" y2="6"/>
                                    <line x1="8" y1="2" x2="8" y2="6"/>
                                    <line x1="3" y1="10" x2="21" y2="10"/>
                                  </svg>
                                  Ghế
                                </span>
                                <span className="order-item__detail-value">{item.seats.join(', ')}</span>
                              </div>
                              <div className="order-item__detail-row">
                                <span className="order-item__detail-label">
                                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <line x1="12" y1="1" x2="12" y2="23"/>
                                    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                                  </svg>
                                  Giá
                                </span>
                                <span className="order-item__detail-value order-item__detail-value--price">
                                  {formatPrice(item.price)}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                      
                      {/* Food Items */}
                      {order.foodItems && order.foodItems.map((foodItem) => (
                        <div key={foodItem.id} className="order-item order-item--food">
                          <div className="order-item__poster">
                            <img src={foodItem.image} alt={foodItem.name} />
                          </div>
                          <div className="order-item__content">
                            <h3 className="order-item__title">
                              {foodItem.name}
                            </h3>
                            <div className="order-item__details">
                              <div className="order-item__detail-row">
                                <span className="order-item__detail-label">
                                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                                    <circle cx="12" cy="10" r="3"/>
                                  </svg>
                                  Số lượng
                                </span>
                                <span className="order-item__detail-value">x{foodItem.quantity}</span>
                              </div>
                              <div className="order-item__detail-row">
                                <span className="order-item__detail-label">
                                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <line x1="12" y1="1" x2="12" y2="23"/>
                                    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
                                  </svg>
                                  Giá
                                </span>
                                <span className="order-item__detail-value order-item__detail-value--price">
                                  {formatPrice(foodItem.price * foodItem.quantity)}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="order-card__footer">
                      <div className="order-card__footer-info">
                        <div className="order-card__footer-item">
                          <span className="order-card__footer-label">Thời gian đặt:</span>
                          <span className="order-card__footer-value">{order.bookingDate}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="movie-reviews-pagination mt-8 justify-center">
                    <button
                      className="movie-reviews-pagination__btn"
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="15 18 9 12 15 6"></polyline>
                      </svg>
                    </button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        className={`movie-reviews-pagination__btn movie-reviews-pagination__btn--number ${currentPage === page ? 'movie-reviews-pagination__btn--active' : ''}`}
                        onClick={() => setCurrentPage(page)}
                      >
                        {page}
                      </button>
                    ))}
                    <button
                      className="movie-reviews-pagination__btn"
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="9 18 15 12 9 6"></polyline>
                      </svg>
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

