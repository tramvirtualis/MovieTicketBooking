import React, { useState, useMemo } from 'react';
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

// Reports Component
function Reports({ orders, movies, cinemas, vouchers, users }) {
  const [timeRange, setTimeRange] = useState('30'); // '7', '30', '90', 'all'
  const [selectedCinema, setSelectedCinema] = useState('all');
  const [selectedMovie, setSelectedMovie] = useState('all');

  // Calculate date range based on timeRange
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
        startDate.setFullYear(2020); // All time
    }
    return { startDate, endDate };
  }, [timeRange]);

  // Filter orders based on filters
  const filteredOrders = useMemo(() => {
    return (orders || []).filter(order => {
      // Filter by payment status (only SUCCESS)
      if (order.status !== 'PAID') return false;
      
      // Filter by date range
      const orderDate = new Date(order.showtime);
      if (orderDate < dateRange.startDate || orderDate > dateRange.endDate) return false;
      
      // Filter by cinema
      if (selectedCinema !== 'all' && order.cinemaComplexId !== Number(selectedCinema)) return false;
      
      // Filter by movie
      if (selectedMovie !== 'all' && order.movieId !== Number(selectedMovie)) return false;
      
      return true;
    });
  }, [orders, dateRange, selectedCinema, selectedMovie]);

  // Summary Statistics
  const summaryStats = useMemo(() => {
    const totalRevenue = filteredOrders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
    const totalTickets = filteredOrders.reduce((sum, order) => sum + (order.seats?.length || 0), 0);
    const activeMovies = (movies || []).filter(m => m.status === 'NOW_SHOWING').length;
    const registeredCustomers = (users || []).filter(u => {
      // Count users that are not ADMIN or MANAGER
      return u.role !== 'ADMIN' && u.role !== 'MANAGER';
    }).length;
    
    // Active vouchers (startDate <= today <= endDate)
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const activeVouchers = (vouchers || []).filter(v => {
      const start = new Date(v.startDate);
      const end = new Date(v.endDate);
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
      return start <= today && today <= end && v.status;
    }).length;

    return {
      totalRevenue,
      totalTickets,
      activeMovies,
      registeredCustomers,
      activeVouchers
    };
  }, [filteredOrders, movies, users, vouchers]);

  // Revenue by Movie
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

  // Revenue by Cinema
  const revenueByCinema = useMemo(() => {
    const cinemaRevenue = {};
    filteredOrders.forEach(order => {
      const cinemaId = order.cinemaComplexId;
      const cinemaName = order.cinemaName || cinemas.find(c => c.complexId === cinemaId)?.name || 'Unknown';
      if (!cinemaRevenue[cinemaId]) {
        cinemaRevenue[cinemaId] = { cinemaId, name: cinemaName, revenue: 0, tickets: 0 };
      }
      cinemaRevenue[cinemaId].revenue += order.totalAmount || 0;
      cinemaRevenue[cinemaId].tickets += order.seats?.length || 0;
    });
    return Object.values(cinemaRevenue).sort((a, b) => b.revenue - a.revenue);
  }, [filteredOrders, cinemas]);

  // Daily Revenue (last 30 days)
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

  // Top 5 Movies by Ticket Count
  const top5Movies = useMemo(() => {
    return revenueByMovie
      .sort((a, b) => b.tickets - a.tickets)
      .slice(0, 5)
      .map((movie, idx) => ({ ...movie, rank: idx + 1 }));
  }, [revenueByMovie]);

  // Voucher Usage Statistics
  const voucherUsage = useMemo(() => {
    // In real app, this would come from database
    // For now, simulate based on vouchers
    return (vouchers || [])
      .filter(v => {
        const today = new Date();
        const start = new Date(v.startDate);
        const end = new Date(v.endDate);
        return start <= today && today <= end;
      })
      .map(v => ({
        voucherId: v.voucherId,
        name: v.name,
        code: v.code,
        timesUsed: Math.floor(Math.random() * 50) + 10, // Simulated
        totalDiscount: Math.floor(Math.random() * 5000000) + 1000000 // Simulated
      }))
      .sort((a, b) => b.timesUsed - a.timesUsed);
  }, [vouchers]);

  // Food Combo Sales (simulated - would come from OrderCombo table)
  const foodComboSales = useMemo(() => {
    // Simulated data - in real app, this would come from OrderCombo + FoodCombo tables
    return [
      { id: 1, name: 'Combo 1: Bắp + Nước', quantity: 245, revenue: 11025000 },
      { id: 2, name: 'Combo 2: Bắp + Nước + Snack', quantity: 189, revenue: 11340000 },
      { id: 3, name: 'Combo 3: Bắp lớn + 2 Nước', quantity: 156, revenue: 9360000 },
      { id: 4, name: 'Combo 4: Snack + Nước', quantity: 98, revenue: 4900000 },
    ].sort((a, b) => b.revenue - a.revenue);
  }, []);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat('vi-VN').format(num);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Filters */}
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
                Rạp
              </label>
              <select
                value={selectedCinema}
                onChange={(e) => setSelectedCinema(e.target.value)}
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
                <option value="all">Tất cả rạp</option>
                {(cinemas || []).map(c => (
                  <option key={c.complexId} value={c.complexId}>{c.name}</option>
                ))}
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

      {/* Summary Cards */}
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
          <div className="admin-stat-card__icon" style={{ color: '#9c27b0' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
          </div>
          <div className="admin-stat-card__content">
            <div className="admin-stat-card__value">{formatNumber(summaryStats.registeredCustomers)}</div>
            <div className="admin-stat-card__label">Khách hàng đăng ký</div>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-card__icon" style={{ color: '#e83b41' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
              <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
              <line x1="12" y1="22.08" x2="12" y2="12"/>
            </svg>
          </div>
          <div className="admin-stat-card__content">
            <div className="admin-stat-card__value">{summaryStats.activeVouchers}</div>
            <div className="admin-stat-card__label">Voucher đang hoạt động</div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(500px, 1fr))', gap: '24px' }}>
        {/* Revenue by Movie */}
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

        {/* Revenue by Cinema */}
        <div className="admin-card">
          <div className="admin-card__header">
            <h2 className="admin-card__title">Doanh thu theo rạp</h2>
          </div>
          <div className="admin-card__content">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={revenueByCinema}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis 
                  dataKey="name" 
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
                <Bar dataKey="revenue" fill="#4caf50" name="Doanh thu" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Daily Revenue */}
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

      {/* Tables Section */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px' }}>
        {/* Top 5 Movies by Ticket Count */}
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

        {/* Voucher Usage Statistics */}
        <div className="admin-card">
          <div className="admin-card__header">
            <h2 className="admin-card__title">Thống kê sử dụng voucher</h2>
          </div>
          <div className="admin-card__content">
            <div className="admin-table">
              <table>
                <thead>
                  <tr>
                    <th>Voucher</th>
                    <th>Số lần dùng</th>
                    <th>Tổng giảm giá</th>
                  </tr>
                </thead>
                <tbody>
                  {voucherUsage.length > 0 ? (
                    voucherUsage.map((v) => (
                      <tr key={v.voucherId}>
                        <td>
                          <div style={{ fontWeight: 600 }}>{v.name}</div>
                          <div style={{ fontSize: '12px', color: '#c9c4c5' }}>{v.code}</div>
                        </td>
                        <td>{formatNumber(v.timesUsed)}</td>
                        <td style={{ color: '#e83b41', fontWeight: 600 }}>{formatPrice(v.totalDiscount)}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="3" style={{ textAlign: 'center', color: '#c9c4c5', padding: '20px' }}>
                        Không có dữ liệu
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Food Combo Sales */}
        <div className="admin-card" style={{ gridColumn: '1 / -1' }}>
          <div className="admin-card__header">
            <h2 className="admin-card__title">Doanh số combo đồ ăn</h2>
          </div>
          <div className="admin-card__content">
            <div className="admin-table">
              <table>
                <thead>
                  <tr>
                    <th>Tên combo</th>
                    <th>Số lượng bán</th>
                    <th>Doanh thu</th>
                  </tr>
                </thead>
                <tbody>
                  {foodComboSales.map((combo) => (
                    <tr key={combo.id}>
                      <td>{combo.name}</td>
                      <td>{formatNumber(combo.quantity)}</td>
                      <td style={{ color: '#4caf50', fontWeight: 600 }}>{formatPrice(combo.revenue)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Reports;
