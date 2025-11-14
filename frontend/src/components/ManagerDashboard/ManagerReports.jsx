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

// Manager Reports Component (filtered by managerComplexIds)
function ManagerReports({ orders, movies, cinemas, managerComplexIds }) {
  const [timeRange, setTimeRange] = useState('30');
  const [selectedCinema, setSelectedCinema] = useState('all');
  const [selectedMovie, setSelectedMovie] = useState('all');

  const scopedCinemas = useMemo(() => {
    return (cinemas || []).filter(c => managerComplexIds.includes(c.complexId));
  }, [cinemas, managerComplexIds]);

  const scopedOrders = useMemo(() => {
    return (orders || []).filter(order => managerComplexIds.includes(order.cinemaComplexId));
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
      if (selectedCinema !== 'all' && order.cinemaComplexId !== Number(selectedCinema)) return false;
      if (selectedMovie !== 'all' && order.movieId !== Number(selectedMovie)) return false;
      return true;
    });
  }, [scopedOrders, dateRange, selectedCinema, selectedMovie]);

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

  const revenueByCinema = useMemo(() => {
    const cinemaRevenue = {};
    filteredOrders.forEach(order => {
      const cinemaId = order.cinemaComplexId;
      const cinemaName = order.cinemaName || scopedCinemas.find(c => c.complexId === cinemaId)?.name || 'Unknown';
      if (!cinemaRevenue[cinemaId]) {
        cinemaRevenue[cinemaId] = { cinemaId, name: cinemaName, revenue: 0, tickets: 0 };
      }
      cinemaRevenue[cinemaId].revenue += order.totalAmount || 0;
      cinemaRevenue[cinemaId].tickets += order.seats?.length || 0;
    });
    return Object.values(cinemaRevenue).sort((a, b) => b.revenue - a.revenue);
  }, [filteredOrders, scopedCinemas]);

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

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
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
                {scopedCinemas.map(c => (
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


