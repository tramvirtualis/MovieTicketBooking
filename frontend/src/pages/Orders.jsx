import React, { useState, useEffect } from 'react';
import Header from '../components/Header.jsx';
import Footer from '../components/Footer.jsx';
import TicketModal from '../components/TicketModal.jsx';
import { getMyOrders } from '../services/customer';
import { useNavigate } from 'react-router-dom';

export default function Orders() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [showTicketModal, setShowTicketModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const ordersPerPage = 5;

  // Load orders from API
  useEffect(() => {
    const loadOrders = async () => {
      const token = localStorage.getItem('jwt');
      if (!token) {
        navigate('/login');
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const ordersData = await getMyOrders();
        
        // Map backend data to frontend format
        const mappedOrders = ordersData.map(order => {
          // Group tickets by showtime (same movie, same showtime = same item)
          const itemsByShowtime = {};
          order.items.forEach(item => {
            const key = `${item.movieId}-${item.showtimeStart}`;
            if (!itemsByShowtime[key]) {
              itemsByShowtime[key] = {
                id: item.ticketId.toString(),
                movie: {
                  movieId: item.movieId,
                  id: item.movieId,
                  title: item.movieTitle,
                  poster: item.moviePoster || 'https://via.placeholder.com/300x450?text=No+Poster'
                },
                cinema: item.cinemaComplexName + (item.cinemaAddress ? ` (${item.cinemaAddress})` : ''),
                showtime: {
                  showtimeId: item.showtimeId, // Lưu showtimeId để tạo booking ID
                  date: new Date(item.showtimeStart).toLocaleDateString('vi-VN', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric'
                  }),
                  time: new Date(item.showtimeStart).toLocaleTimeString('vi-VN', {
                    hour: '2-digit',
                    minute: '2-digit',
                    hour12: false
                  }),
                  format: item.roomType || 'STANDARD',
                  start: item.showtimeStart, // Lưu lại startTime để check weekend
                  startTime: item.showtimeStart // Lưu lại startTime để tạo booking ID
                },
                seats: [],
                price: 0,
                basePrice: 0
              };
            }
            itemsByShowtime[key].seats.push(item.seatId);
            itemsByShowtime[key].price += Number(item.price);
            itemsByShowtime[key].basePrice += Number(item.basePrice || item.price);
          });

          // Map combos to foodItems
          const foodItems = order.combos ? order.combos.map(combo => ({
            id: `f${combo.comboId}`,
            name: combo.comboName,
            quantity: combo.quantity,
            price: Number(combo.price),
            image: combo.comboImage || 'https://via.placeholder.com/300x300?text=Food'
          })) : [];

          // Tính tổng tiền gốc (trước khi áp voucher)
          const originalTotal = Object.values(itemsByShowtime).reduce((sum, item) => sum + item.price, 0) +
                                foodItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

          return {
            orderId: `ORD-${order.orderId}`,
            orderDate: order.orderDate,
            totalAmount: Number(order.totalAmount),
            originalTotal: originalTotal, // Tổng tiền gốc (trước voucher)
            voucherCode: order.voucherCode || null, // Mã voucher nếu có
            status: 'completed', // You can add status field to Order entity later
            items: Object.values(itemsByShowtime),
            foodItems: foodItems.length > 0 ? foodItems : undefined,
            paymentMethod: order.paymentMethod || 'Chưa xác định',
            bookingDate: new Date(order.orderDate).toLocaleString('vi-VN', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit'
            })
          };
        });

        setOrders(mappedOrders);
      } catch (err) {
        console.error('Error loading orders:', err);
        setError(err.message || 'Không thể tải danh sách đơn hàng');
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
  }, [navigate]);

  // Calculate pagination
  const totalPages = Math.ceil(orders.length / ordersPerPage);
  const startIndex = (currentPage - 1) * ordersPerPage;
  const endIndex = startIndex + ordersPerPage;
  const currentOrders = orders.slice(startIndex, endIndex);

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
              <h1 className="section__title text-[clamp(28px,4vw,36px)] m-0 font-extrabold tracking-tight" style={{ fontFamily: 'Inter, system-ui, -apple-system, "Segoe UI", Roboto, Arial, sans-serif' }}>
                Đơn hàng
              </h1>
            </div>

            {/* Loading */}
            {loading && (
              <div className="text-center py-[60px] px-5 text-[#c9c4c5]">
                <p className="text-base m-0">Đang tải danh sách đơn hàng...</p>
              </div>
            )}

            {/* Error */}
            {error && !loading && (
              <div className="text-center py-[60px] px-5 text-[#f44336]">
                <p className="text-base m-0">{error}</p>
              </div>
            )}

            {/* Orders List */}
            {!loading && !error && currentOrders.length === 0 && (
              <div className="text-center py-[60px] px-5 text-[#c9c4c5]">
                <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mx-auto mb-5 opacity-50">
                  <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
                  <rect x="8" y="2" width="8" height="4" rx="1" ry="1"/>
                </svg>
                <p className="text-base m-0">Chưa có đơn hàng nào trong mục này</p>
              </div>
            )}

            {!loading && !error && currentOrders.length > 0 && (
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
                        <div className="order-card__total" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                          {order.voucherCode && order.originalTotal && order.originalTotal > order.totalAmount ? (
                            <>
                              <span style={{ 
                                textDecoration: 'line-through', 
                                fontSize: '14px', 
                                color: '#c9c4c5',
                                fontWeight: 500
                              }}>
                                {formatPrice(order.originalTotal)}
                              </span>
                              <span style={{ 
                                color: '#ffd159', 
                                fontSize: '20px',
                                fontWeight: 700
                              }}>
                                {formatPrice(order.totalAmount)}
                              </span>
                            </>
                          ) : (
                            <span style={{ 
                              color: '#ffd159', 
                              fontSize: '20px',
                              fontWeight: 700
                            }}>
                              {formatPrice(order.totalAmount)}
                            </span>
                          )}
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
                              <a 
                                href={`/movie/${item.movie.movieId || item.movie.id}`}
                                onClick={(e) => {
                                  e.preventDefault();
                                  navigate(`/movie/${item.movie.movieId || item.movie.id}`);
                                }}
                                style={{ color: '#ffd159', textDecoration: 'none' }}
                              >
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
                                  {(() => {
                                    const showtimeDate = new Date(item.showtime.start);
                                    const dayOfWeek = showtimeDate.getDay();
                                    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
                                    
                                    return (
                                      <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px', flexWrap: 'wrap' }}>
                                        {isWeekend && (
                                          <span style={{ textDecoration: 'line-through', fontSize: '12px', color: '#c9c4c5' }}>
                                            {formatPrice(item.basePrice)}
                                          </span>
                                        )}
                                        <span>{formatPrice(item.price)}</span>
                                        {isWeekend && (
                                          <span style={{ fontSize: '11px', color: '#4caf50', fontWeight: 600 }}>
                                            +30%
                                          </span>
                                        )}
                                      </div>
                                    );
                                  })()}
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
                      <div className="order-card__footer-actions" style={{ marginTop: '12px' }}>
                        <button
                          className="btn btn--primary"
                          style={{ fontSize: '14px', padding: '10px 20px' }}
                          onClick={() => {
                            setSelectedOrder(order);
                            setShowTicketModal(true);
                          }}
                        >
                          Xem lại vé
                        </button>
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

      {/* Ticket Modal */}
      <TicketModal
        order={selectedOrder}
        isOpen={showTicketModal}
        onClose={() => {
          setShowTicketModal(false);
          setSelectedOrder(null);
        }}
      />

      <Footer />
    </div>
  );
}

