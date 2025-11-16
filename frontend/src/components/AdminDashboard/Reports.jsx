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
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

// Reports Component
function Reports({ orders, movies, cinemas, vouchers, users }) {
  const [timeRange, setTimeRange] = useState('30');
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
        startDate.setFullYear(2020);
    }
    return { startDate, endDate };
  }, [timeRange]);

  // Filter orders based on filters
  const filteredOrders = useMemo(() => {
    return (orders || []).filter(order => {
      if (order.status !== 'PAID') return false;
      
      const orderDate = new Date(order.showtime);
      if (orderDate < dateRange.startDate || orderDate > dateRange.endDate) return false;
      
      if (selectedCinema !== 'all' && order.cinemaComplexId !== Number(selectedCinema)) return false;
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
      return u.role !== 'ADMIN' && u.role !== 'MANAGER';
    }).length;
    
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

  // Cinema Performance (for pie chart)
  const cinemaPerformance = useMemo(() => {
    return revenueByCinema.slice(0, 5).map(c => ({
      name: c.name,
      value: c.revenue
    }));
  }, [revenueByCinema]);

  // Food Combo Sales (simulated)
  const foodComboSales = useMemo(() => {
    return [
      { id: 1, name: 'Combo 1: Bắp + Nước', quantity: 245, revenue: 11025000 },
      { id: 2, name: 'Combo 2: Bắp + Nước + Snack', quantity: 189, revenue: 11340000 },
      { id: 3, name: 'Combo 3: Bắp lớn + 2 Nước', quantity: 156, revenue: 9360000 },
      { id: 4, name: 'Combo 4: Snack + Nước', quantity: 98, revenue: 4900000 },
    ].sort((a, b) => b.revenue - a.revenue);
  }, []);

  // Peak Hours Analysis
  const peakHours = useMemo(() => {
    const hourRevenue = {};
    for (let i = 0; i < 24; i++) {
      hourRevenue[i] = 0;
    }
    
    filteredOrders.forEach(order => {
      const hour = new Date(order.showtime).getHours();
      hourRevenue[hour] += order.totalAmount || 0;
    });
    
    return Object.entries(hourRevenue)
      .map(([hour, revenue]) => ({
        hour: `${hour}:00`,
        revenue
      }))
      .filter(h => h.revenue > 0);
  }, [filteredOrders]);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat('vi-VN').format(num);
  };

  const COLORS = ['#e83b41', '#ffd159', '#4caf50', '#2196f3', '#9c27b0'];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        marginBottom: '8px'
      }}>
        <div>
          <h1 style={{ 
            fontSize: '28px', 
            fontWeight: 700, 
            color: '#fff',
            marginBottom: '8px'
          }}>
            Báo cáo & Thống kê
          </h1>
          <p style={{ color: '#c9c4c5', fontSize: '14px' }}>
            Tổng quan hiệu suất kinh doanh và xu hướng doanh thu
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="admin-card">
        <div className="admin-card__content">
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', color: '#c9c4c5', fontWeight: 500 }}>
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
                  fontSize: '14px',
                  cursor: 'pointer'
                }}
              >
                <option value="7">7 ngày qua</option>
                <option value="30">30 ngày qua</option>
                <option value="90">90 ngày qua</option>
                <option value="all">Tất cả</option>
              </select>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', color: '#c9c4c5', fontWeight: 500 }}>
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
                  fontSize: '14px',
                  cursor: 'pointer'
                }}
              >
                <option value="all">Tất cả rạp</option>
                {(cinemas || []).map(c => (
                  <option key={c.complexId} value={c.complexId}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '13px', color: '#c9c4c5', fontWeight: 500 }}>
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
                  fontSize: '14px',
                  cursor: 'pointer'
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

      {/* Summary Cards - 2 rows */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
        <div className="admin-stat-card">
          <div className="admin-stat-card__icon" style={{ color: '#4caf50' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M2 9a3 3 0 0 1 3-3h14a3 3 0 0 1 3 3v6a3 3 0 0 1-3 3H5a3 3 0 0 1-3-3V9z"/>
              <path d="M6 9v6M18 9v6"/>
            </svg>
          </div>
          <div className="admin-stat-card__content">
            <div className="admin-stat-card__value">{formatNumber(summaryStats.totalTickets)}</div>
            <div className="admin-stat-card__label">Tổng vé bán ra</div>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-card__icon" style={{ color: '#ff9800' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
              <circle cx="9" cy="7" r="4"/>
              <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>
            </svg>
          </div>
          <div className="admin-stat-card__content">
            <div className="admin-stat-card__value">{formatNumber(summaryStats.registeredCustomers)}</div>
            <div className="admin-stat-card__label">Khách hàng</div>
          </div>
        </div>

        <div className="admin-stat-card">
          <div className="admin-stat-card__icon" style={{ color: '#e83b41' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
            </svg>
          </div>
          <div className="admin-stat-card__content">
            <div className="admin-stat-card__value">{summaryStats.activeVouchers}</div>
            <div className="admin-stat-card__label">Voucher hoạt động</div>
          </div>
        </div>
      </div>

      {/* Main Charts */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '24px' }}>
        {/* Daily Revenue - Full Width */}
        <div className="admin-card">
          <div className="admin-card__header">
            <h2 className="admin-card__title">Xu hướng doanh thu (30 ngày)</h2>
          </div>
          <div className="admin-card__content">
            <ResponsiveContainer width="100%" height={320}>
              <LineChart data={dailyRevenue}>
                <defs>
                  <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ffd159" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#ffd159" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis 
                  dataKey="displayDate" 
                  stroke="#c9c4c5"
                  fontSize={12}
                  tick={{ fill: '#c9c4c5' }}
                />
                <YAxis 
                  stroke="#c9c4c5"
                  fontSize={12}
                  tick={{ fill: '#c9c4c5' }}
                  tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(20, 15, 16, 0.95)', 
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '8px',
                    color: '#fff',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.3)'
                  }}
                  formatter={(value) => [formatPrice(value), 'Doanh thu']}
                />
                <Line 
                  type="monotone" 
                  dataKey="revenue" 
                  stroke="#ffd159" 
                  strokeWidth={3}
                  dot={{ fill: '#ffd159', r: 5, strokeWidth: 2, stroke: '#1a1517' }}
                  activeDot={{ r: 7 }}
                  fill="url(#revenueGradient)"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Revenue Charts Row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))', gap: '24px' }}>
          {/* Revenue by Movie */}
          <div className="admin-card">
            <div className="admin-card__header">
              <h2 className="admin-card__title">Top phim theo doanh thu</h2>
            </div>
            <div className="admin-card__content">
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={revenueByMovie.slice(0, 8)}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis 
                    dataKey="title" 
                    angle={-35}
                    textAnchor="end"
                    height={120}
                    stroke="#c9c4c5"
                    fontSize={11}
                    tick={{ fill: '#c9c4c5' }}
                  />
                  <YAxis 
                    stroke="#c9c4c5"
                    fontSize={12}
                    tick={{ fill: '#c9c4c5' }}
                    tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(20, 15, 16, 0.95)', 
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '8px',
                      color: '#fff'
                    }}
                    formatter={(value) => [formatPrice(value), 'Doanh thu']}
                  />
                  <Bar dataKey="revenue" fill="#e83b41" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Revenue by Cinema - Pie Chart */}
          <div className="admin-card">
            <div className="admin-card__header">
              <h2 className="admin-card__title">Phân bố doanh thu theo rạp</h2>
            </div>
            <div className="admin-card__content">
              <ResponsiveContainer width="100%" height={320}>
                <PieChart>
                  <Pie
                    data={cinemaPerformance}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {cinemaPerformance.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(20, 15, 16, 0.95)', 
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '8px',
                      color: '#fff'
                    }}
                    formatter={(value) => formatPrice(value)}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Tables Section */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px' }}>
        {/* Top 5 Movies by Ticket */}
        <div className="admin-card">
          <div className="admin-card__header">
            <h2 className="admin-card__title">🏆 Top 5 phim bán chạy</h2>
          </div>
          <div className="admin-card__content">
            <div className="admin-table">
              <table>
                <thead>
                  <tr>
                    <th style={{ width: '60px' }}>Hạng</th>
                    <th>Phim</th>
                    <th style={{ textAlign: 'right' }}>Vé</th>
                    <th style={{ textAlign: 'right' }}>Doanh thu</th>
                  </tr>
                </thead>
                <tbody>
                  {top5Movies.map((movie) => (
                    <tr key={movie.movieId}>
                      <td>
                        <span style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: '32px',
                          height: '32px',
                          borderRadius: '8px',
                          background: movie.rank === 1 ? 'linear-gradient(135deg, #ffd700, #ffed4e)' : 
                                      movie.rank === 2 ? 'linear-gradient(135deg, #c0c0c0, #e8e8e8)' : 
                                      movie.rank === 3 ? 'linear-gradient(135deg, #cd7f32, #f4a460)' : 
                                      'rgba(255,255,255,0.1)',
                          color: movie.rank <= 3 ? '#000' : '#fff',
                          fontSize: '14px',
                          fontWeight: 700,
                          boxShadow: movie.rank <= 3 ? '0 2px 8px rgba(0,0,0,0.3)' : 'none'
                        }}>
                          {movie.rank}
                        </span>
                      </td>
                      <td style={{ fontWeight: 500 }}>{movie.title}</td>
                      <td style={{ textAlign: 'right', color: '#2196f3' }}>{formatNumber(movie.tickets)}</td>
                      <td style={{ textAlign: 'right', color: '#4caf50', fontWeight: 600 }}>{formatPrice(movie.revenue)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Food Combo Sales */}
        <div className="admin-card">
          <div className="admin-card__header">
            <h2 className="admin-card__title">🍿 Doanh số combo đồ ăn</h2>
          </div>
          <div className="admin-card__content">
            <div className="admin-table">
              <table>
                <thead>
                  <tr>
                    <th>Combo</th>
                    <th style={{ textAlign: 'right' }}>SL</th>
                    <th style={{ textAlign: 'right' }}>Doanh thu</th>
                  </tr>
                </thead>
                <tbody>
                  {foodComboSales.map((combo) => (
                    <tr key={combo.id}>
                      <td style={{ fontWeight: 500 }}>{combo.name}</td>
                      <td style={{ textAlign: 'right', color: '#ffd159' }}>{formatNumber(combo.quantity)}</td>
                      <td style={{ textAlign: 'right', color: '#4caf50', fontWeight: 600 }}>{formatPrice(combo.revenue)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Peak Hours Analysis */}
      {peakHours.length > 0 && (
        <div className="admin-card">
          <div className="admin-card__header">
            <h2 className="admin-card__title">⏰ Phân tích giờ cao điểm</h2>
          </div>
          <div className="admin-card__content">
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={peakHours}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis 
                  dataKey="hour" 
                  stroke="#c9c4c5"
                  fontSize={12}
                  tick={{ fill: '#c9c4c5' }}
                />
                <YAxis 
                  stroke="#c9c4c5"
                  fontSize={12}
                  tick={{ fill: '#c9c4c5' }}
                  tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(20, 15, 16, 0.95)', 
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '8px',
                    color: '#fff'
                  }}
                  formatter={(value) => [formatPrice(value), 'Doanh thu']}
                />
                <Bar dataKey="revenue" fill="#9c27b0" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );
}

export default Reports;