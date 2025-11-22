import React, { useState, useMemo, useEffect } from 'react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { getAllOrdersManager } from '../../services/customer';

// Manager Reports Component (for single cinema complex)
function ManagerReports({ orders: initialOrders, movies, cinemas, managerComplexIds }) {
  const [timeRange, setTimeRange] = useState('30');
  const [selectedMovie, setSelectedMovie] = useState('all');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Load orders from backend
  useEffect(() => {
    const loadOrders = async () => {
      setLoading(true);
      try {
        const ordersData = await getAllOrdersManager();
        console.log('ManagerReports: Loaded orders from backend:', ordersData);
        
        // Map backend format to frontend format (same as ManagerBookingManagement)
        const mappedOrders = [];
        ordersData.forEach(order => {
          if (order.items && order.items.length > 0) {
            // Group tickets by showtime to create booking records
            const ticketsByShowtime = {};
            order.items.forEach(item => {
              const key = `${item.showtimeStart}_${item.cinemaComplexId}_${item.roomId}`;
              if (!ticketsByShowtime[key]) {
                ticketsByShowtime[key] = [];
              }
              ticketsByShowtime[key].push(item);
            });
            
            // Create a booking record for each showtime group
            Object.values(ticketsByShowtime).forEach(ticketGroup => {
              const firstTicket = ticketGroup[0];
              const seats = ticketGroup.map(t => t.seatId);
              const totalTicketPrice = ticketGroup.reduce((sum, t) => sum + (parseFloat(t.price) || 0), 0);
              
              // Calculate total including combos
              const comboTotal = order.combos ? order.combos.reduce((sum, c) => sum + (parseFloat(c.price) * (c.quantity || 1) || 0), 0) : 0;
              const totalAmount = totalTicketPrice + comboTotal;
              
              mappedOrders.push({
                bookingId: order.orderId,
                user: {
                  name: order.userName || 'N/A',
                  email: order.userEmail || '',
                  phone: order.userPhone || ''
                },
                movieId: firstTicket.movieId,
                movieTitle: firstTicket.movieTitle,
                cinemaComplexId: firstTicket.cinemaComplexId,
                cinemaName: firstTicket.cinemaComplexName,
                roomId: firstTicket.roomId,
                roomName: firstTicket.roomName,
                theaterName: firstTicket.roomName, // For revenueByTheater
                theaterId: firstTicket.roomId, // For revenueByTheater
                showtime: firstTicket.showtimeStart,
                seats: seats,
                pricePerSeat: ticketGroup.length > 0 ? parseFloat(ticketGroup[0].price) || 0 : 0,
                totalAmount: parseFloat(order.totalAmount) || totalAmount,
                status: 'PAID', // All orders in DB are successful
                paymentMethod: order.paymentMethod || 'UNKNOWN'
              });
            });
          }
        });
        
        console.log('ManagerReports: Mapped orders:', mappedOrders);
        setOrders(mappedOrders);
      } catch (err) {
        console.error('ManagerReports: Error loading orders:', err);
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };
    
    loadOrders();
  }, []);

  // Manager chỉ quản lý 1 rạp duy nhất
  const managedCinema = useMemo(() => {
    return (cinemas || []).find(c => managerComplexIds.includes(c.complexId));
  }, [cinemas, managerComplexIds]);

  const scopedOrders = useMemo(() => {
    if (!orders || orders.length === 0) {
      return [];
    }
    
    // Handle type mismatch (string vs number) similar to ManagerBookingManagement
    if (!managerComplexIds || managerComplexIds.length === 0) {
      console.warn('ManagerReports: managerComplexIds is empty, showing all orders');
      return orders;
    }
    
    return orders.filter(order => {
      const orderComplexId = order.cinemaComplexId;
      const matches = managerComplexIds.some(id => 
        id == orderComplexId || 
        Number(id) === Number(orderComplexId) ||
        String(id) === String(orderComplexId)
      );
      
      if (!matches && orders.indexOf(order) < 3) {
        console.log(`ManagerReports: Order ${order.bookingId} filtered out: cinemaComplexId=${orderComplexId} not in managerComplexIds=${managerComplexIds}`);
      }
      
      return matches;
    });
  }, [orders, managerComplexIds]);

  const dateRange = useMemo(() => {
    const endDate = new Date();
    const startDate = new Date();
    switch (timeRange) {
      case '7':
        startDate.setDate(endDate.getDate() - 7);
        break;
      case '30':
        startDate.setDate(endDate.getDate() - 30);
        break;
      case '90':
        startDate.setDate(endDate.getDate() - 90);
        break;
      default:
        startDate.setFullYear(2020);
    }
    return { startDate, endDate };
  }, [timeRange]);

  const filteredOrders = useMemo(() => {
    return scopedOrders.filter(order => {
      if (order.status !== 'PAID') return false;
      const orderDate = new Date(order.showtime);
      if (orderDate < dateRange.startDate || orderDate > dateRange.endDate) return false;
      if (selectedMovie !== 'all' && order.movieId !== Number(selectedMovie)) return false;
      return true;
    });
  }, [scopedOrders, dateRange, selectedMovie]);

  const summaryStats = useMemo(() => {
    const totalRevenue = filteredOrders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
    const totalTickets = filteredOrders.reduce((sum, order) => sum + (order.seats?.length || 0), 0);
    const activeMovies = (movies || []).filter(m => m.status === 'NOW_SHOWING').length;
    const totalBookings = filteredOrders.length;

    return {
      totalRevenue,
      totalTickets,
      activeMovies,
      totalBookings
    };
  }, [filteredOrders, movies]);

  const revenueByMovie = useMemo(() => {
    const movieRevenue = {};
    filteredOrders.forEach(order => {
      const movieId = order.movieId;
      const movieTitle = order.movieTitle || movies.find(m => m.movieId === movieId)?.title || 'Unknown';
      if (!movieRevenue[movieId]) {
        movieRevenue[movieId] = { movieId, title: movieTitle, revenue: 0, tickets: 0 };
      }
      movieRevenue[movieId].revenue += order.totalAmount || 0;
      movieRevenue[movieId].tickets += order.seats?.length || 0;
    });
    return Object.values(movieRevenue).sort((a, b) => b.revenue - a.revenue);
  }, [filteredOrders, movies]);

  const revenueByTheater = useMemo(() => {
    const theaterRevenue = {};
    filteredOrders.forEach(order => {
      const theaterName = order.theaterName || `Phòng ${order.theaterId || 'N/A'}`;
      if (!theaterRevenue[theaterName]) {
        theaterRevenue[theaterName] = { name: theaterName, revenue: 0, tickets: 0 };
      }
      theaterRevenue[theaterName].revenue += order.totalAmount || 0;
      theaterRevenue[theaterName].tickets += order.seats?.length || 0;
    });
    return Object.values(theaterRevenue).sort((a, b) => b.revenue - a.revenue);
  }, [filteredOrders]);

  const dailyRevenue = useMemo(() => {
    const daily = {};
    const days = [];
    for (let i = 29; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      const dateStr = date.toISOString().split('T')[0];
      daily[dateStr] = 0;
      days.push({
        date: dateStr,
        displayDate: date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' }),
        revenue: 0
      });
    }
    filteredOrders.forEach(order => {
      const orderDate = new Date(order.showtime);
      orderDate.setHours(0, 0, 0, 0);
      const dateStr = orderDate.toISOString().split('T')[0];
      if (daily[dateStr] !== undefined) {
        daily[dateStr] += order.totalAmount || 0;
      }
    });
    return days.map(d => ({ ...d, revenue: daily[d.date] || 0 }));
  }, [filteredOrders]);

  const top5Movies = useMemo(() => {
    return revenueByMovie
      .sort((a, b) => b.tickets - a.tickets)
      .slice(0, 5)
      .map((movie, idx) => ({ ...movie, rank: idx + 1 }));
  }, [revenueByMovie]);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat('vi-VN').format(num);
  };

  // Debug logging
  useEffect(() => {
    console.log('ManagerReports: Orders loaded:', orders.length);
    console.log('ManagerReports: Scoped orders:', scopedOrders.length);
    console.log('ManagerReports: Filtered orders:', filteredOrders.length);
    console.log('ManagerReports: Summary stats:', summaryStats);
  }, [orders, scopedOrders, filteredOrders, summaryStats]);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px', color: '#fff' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '48px',
            height: '48px',
            border: '4px solid rgba(232, 59, 65, 0.3)',
            borderTop: '4px solid #e83b41',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px'
          }}></div>
          <p>Đang tải dữ liệu báo cáo...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Thông tin rạp đang quản lý */}
      <div className="admin-card" style={{ background: 'linear-gradient(135deg, rgba(232, 59, 65, 0.1) 0%, rgba(20, 15, 16, 0.8) 100%)' }}>
        <div className="admin-card__content">
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ 
              width: '48px', 
              height: '48px', 
              borderRadius: '12px', 
              background: '#e83b41',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '24px'
            }}>
              🎬
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 700, color: '#fff' }}>
                {managedCinema?.name || 'Cụm rạp'}
              </h2>
              <p style={{ margin: '4px 0 0', fontSize: '14px', color: '#c9c4c5' }}>
                Báo cáo doanh thu & hiệu suất
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="admin-card">
        <div className="admin-card__header">
          <h2 className="admin-card__title">Bộ lọc</h2>
        </div>
        <div className="admin-card__content">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#c9c4c5' }}>
                Khoảng thời gian
              </label>
              <select
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  background: 'rgba(20, 15, 16, 0.8)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px',
                  color: '#fff',
                  fontSize: '14px'
                }}
              >
                <option value="7">7 ngày qua</option>
                <option value="30">30 ngày qua</option>
                <option value="90">90 ngày qua</option>
                <option value="all">Tất cả</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '14px', color: '#c9c4c5' }}>
                Phim
              </label>
              <select
                value={selectedMovie}
                onChange={(e) => setSelectedMovie(e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  background: 'rgba(20, 15, 16, 0.8)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px',
                  color: '#fff',
                  fontSize: '14px'
                }}
              >
                <option value="all">Tất cả phim</option>
                {(movies || []).map(m => (
                  <option key={m.movieId} value={m.movieId}>{m.title}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
        <div className="admin-stat-card">
          <div className="admin-stat-card__icon" style={{ color: '#4caf50' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="1" x2="12" y2="23"/>
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
            </svg>
          </div>
          <div className="admin-stat-card__content">
            <div className="admin-stat-card__value">{formatPrice(summaryStats.totalRevenue)}</div>
            <div className="admin-stat-card__label">Tổng doanh thu</div>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-card__icon" style={{ color: '#2196f3' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M2 9a3 3 0 0 1 3-3h14a3 3 0 0 1 3 3v6a3 3 0 0 1-3 3H5a3 3 0 0 1-3-3V9z"/>
              <path d="M6 9v6M18 9v6"/>
            </svg>
          </div>
          <div className="admin-stat-card__content">
            <div className="admin-stat-card__value">{formatNumber(summaryStats.totalTickets)}</div>
            <div className="admin-stat-card__label">Tổng vé bán</div>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-card__icon" style={{ color: '#ff9800' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="4" width="20" height="16" rx="2"/>
              <path d="M7 4v16M17 4v16M2 8h20M2 12h20M2 16h20"/>
            </svg>
          </div>
          <div className="admin-stat-card__content">
            <div className="admin-stat-card__value">{summaryStats.activeMovies}</div>
            <div className="admin-stat-card__label">Phim đang chiếu</div>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-card__icon" style={{ color: '#e83b41' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
            </svg>
          </div>
          <div className="admin-stat-card__content">
            <div className="admin-stat-card__value">{formatNumber(summaryStats.totalBookings)}</div>
            <div className="admin-stat-card__label">Tổng đơn đặt</div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))', gap: '24px' }}>
        <div className="admin-card">
          <div className="admin-card__header">
            <h2 className="admin-card__title">Doanh thu theo phim</h2>
          </div>
          <div className="admin-card__content">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={revenueByMovie.slice(0, 10)}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis 
                  dataKey="title" 
                  angle={-45}
                  textAnchor="end"
                  height={100}
                  stroke="#c9c4c5"
                  fontSize={12}
                />
                <YAxis 
                  stroke="#c9c4c5"
                  fontSize={12}
                  tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#2d2627', 
                    border: '1px solid #4a3f41',
                    borderRadius: '8px',
                    color: '#fff'
                  }}
                  formatter={(value) => formatPrice(value)}
                />
                <Legend />
                <Bar dataKey="revenue" fill="#e83b41" name="Doanh thu" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="admin-card">
          <div className="admin-card__header">
            <h2 className="admin-card__title">Doanh thu theo phòng chiếu</h2>
          </div>
          <div className="admin-card__content">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={revenueByTheater}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis 
                  dataKey="name" 
                  stroke="#c9c4c5"
                  fontSize={12}
                />
                <YAxis 
                  stroke="#c9c4c5"
                  fontSize={12}
                  tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#2d2627', 
                    border: '1px solid #4a3f41',
                    borderRadius: '8px',
                    color: '#fff'
                  }}
                  formatter={(value) => formatPrice(value)}
                />
                <Legend />
                <Bar dataKey="revenue" fill="#2196f3" name="Doanh thu" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="admin-card" style={{ gridColumn: '1 / -1' }}>
          <div className="admin-card__header">
            <h2 className="admin-card__title">Doanh thu theo ngày (30 ngày qua)</h2>
          </div>
          <div className="admin-card__content">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={dailyRevenue}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis 
                  dataKey="displayDate" 
                  stroke="#c9c4c5"
                  fontSize={12}
                />
                <YAxis 
                  stroke="#c9c4c5"
                  fontSize={12}
                  tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#2d2627', 
                    border: '1px solid #4a3f41',
                    borderRadius: '8px',
                    color: '#fff'
                  }}
                  formatter={(value) => formatPrice(value)}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#ffd159" 
                  strokeWidth={2}
                  name="Doanh thu"
                  dot={{ fill: '#ffd159', r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="admin-card">
        <div className="admin-card__header">
          <h2 className="admin-card__title">Top 5 phim bán chạy</h2>
        </div>
        <div className="admin-card__content">
          <div className="admin-table">
            <table>
              <thead>
                <tr>
                  <th>Hạng</th>
                  <th>Phim</th>
                  <th>Số vé</th>
                  <th>Doanh thu</th>
                </tr>
              </thead>
              <tbody>
                {top5Movies.map((movie) => (
                  <tr key={movie.movieId}>
                    <td>
                      <span style={{
                        display: 'inline-block',
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        background: movie.rank === 1 ? '#ffd700' : movie.rank === 2 ? '#c0c0c0' : movie.rank === 3 ? '#cd7f32' : 'rgba(255,255,255,0.1)',
                        color: '#fff',
                        textAlign: 'center',
                        lineHeight: '24px',
                        fontSize: '12px',
                        fontWeight: 700
                      }}>
                        {movie.rank}
                      </span>
                    </td>
                    <td>{movie.title}</td>
                    <td>{formatNumber(movie.tickets)}</td>
                    <td style={{ color: '#4caf50', fontWeight: 600 }}>{formatPrice(movie.revenue)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ManagerReports;