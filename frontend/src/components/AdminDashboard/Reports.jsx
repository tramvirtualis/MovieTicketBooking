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
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { getAllOrdersAdmin } from '../../services/customer';
import showtimeService from '../../services/showtimeService';
import { userService } from '../../services/userService';
import { voucherService } from '../../services/voucherService';

// Reports Component
function Reports({ orders: initialOrders, movies, cinemas, vouchers, users }) {
  const [timeRange, setTimeRange] = useState('30');
  const [selectedCinema, setSelectedCinema] = useState('all');
  const [selectedMovie, setSelectedMovie] = useState('all');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [allShowtimes, setAllShowtimes] = useState([]);
  const [actualUsers, setActualUsers] = useState(users || []);
  const [actualVouchers, setActualVouchers] = useState(vouchers || []);
  
  // Load orders from backend
  useEffect(() => {
    const loadOrders = async () => {
      setLoading(true);
      try {
        const ordersData = await getAllOrdersAdmin();
        console.log('Reports: Loaded orders from backend:', ordersData);
        
        // Map backend format to frontend format (same as BookingManagement)
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
                orderId: order.orderId, // Keep orderId for reference
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
                showtime: firstTicket.showtimeStart,
                seats: seats,
                pricePerSeat: ticketGroup.length > 0 ? parseFloat(ticketGroup[0].price) || 0 : 0,
                ticketAmount: totalTicketPrice, // Amount from tickets only
                comboAmount: comboTotal, // Amount from combos only
                totalAmount: parseFloat(order.totalAmount) || totalAmount,
                combos: order.combos || [], // Store combos for food revenue calculation
                orderDate: order.orderDate || order.createdAt || new Date().toISOString(), // Store order date
                status: 'PAID', // All orders in DB are successful
                paymentMethod: order.paymentMethod || 'UNKNOWN'
              });
            });
          }
        });
        
        console.log('Reports: Mapped orders:', mappedOrders);
        setOrders(mappedOrders);
      } catch (err) {
        console.error('Reports: Error loading orders:', err);
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };
    
    loadOrders();
  }, []);

  // Load all showtimes to check which movies are actually showing
  useEffect(() => {
    const loadShowtimes = async () => {
      if (!movies || movies.length === 0) return;
      
      try {
        // Check showtimes for the next 7 days to see which movies are actually showing
        const dates = [];
        for (let i = 0; i < 7; i++) {
          const date = new Date();
          date.setDate(date.getDate() + i);
          dates.push(date.toISOString().split('T')[0]);
        }
        
        const showtimesPromises = movies.flatMap(movie => 
          dates.map(async (date) => {
            try {
              const result = await showtimeService.getPublicShowtimes(movie.movieId, null, date);
              if (result.success && result.data) {
                return result.data.map(st => ({
                  ...st,
                  movieId: movie.movieId
                }));
              }
              return [];
            } catch (err) {
              // Silently fail for individual requests
              return [];
            }
          })
        );
        
        const showtimesArrays = await Promise.all(showtimesPromises);
        const allShowtimesData = showtimesArrays.flat();
        setAllShowtimes(allShowtimesData);
      } catch (err) {
        console.error('Error loading showtimes:', err);
        setAllShowtimes([]);
      }
    };
    
    loadShowtimes();
  }, [movies]);

  // Load users from API if not provided or empty
  useEffect(() => {
    const loadUsers = async () => {
      try {
        const result = await userService.getAllUsers();
        if (result.success && result.data) {
          console.log('Reports: Loaded users:', result.data.length);
          console.log('Reports: User roles:', result.data.map(u => ({ userId: u.userId, username: u.username, role: u.role })));
          setActualUsers(result.data);
        } else {
          setActualUsers(users || []);
        }
      } catch (err) {
        console.error('Error loading users:', err);
        setActualUsers(users || []);
      }
    };
    
    loadUsers();
  }, [users]);

  // Load vouchers from API if not provided or empty
  useEffect(() => {
    const loadVouchers = async () => {
      try {
        const result = await voucherService.getAllVouchers();
        if (result.success && result.data) {
          // Map vouchers from backend format and calculate status
          const mappedVouchers = (result.data || []).map(voucher => {
            const now = new Date();
            now.setHours(0, 0, 0, 0);
            
            // Parse dates from backend (LocalDateTime format: "2024-01-01T00:00:00" or ISO string)
            const startDateStr = voucher.startDate ? (typeof voucher.startDate === 'string' ? voucher.startDate.split('T')[0] : voucher.startDate) : null;
            const endDateStr = voucher.endDate ? (typeof voucher.endDate === 'string' ? voucher.endDate.split('T')[0] : voucher.endDate) : null;
            
            const startDate = startDateStr ? new Date(startDateStr) : null;
            const endDate = endDateStr ? new Date(endDateStr) : null;
            
            let status = 'expired'; // 'upcoming', 'active', 'expired'
            if (startDate && endDate) {
              startDate.setHours(0, 0, 0, 0);
              endDate.setHours(23, 59, 59, 999);
              
              if (now < startDate) {
                status = 'upcoming';
              } else if (now >= startDate && now <= endDate) {
                status = 'active';
              } else {
                status = 'expired';
              }
            }
            
            return {
              ...voucher,
              startDate: startDateStr || '',
              endDate: endDateStr || '',
              status: status
            };
          });
          
          console.log('Reports: Loaded vouchers:', mappedVouchers.length);
          console.log('Reports: Voucher statuses:', mappedVouchers.map(v => ({ code: v.code, status: v.status, startDate: v.startDate, endDate: v.endDate })));
          setActualVouchers(mappedVouchers);
        } else {
          setActualVouchers(vouchers || []);
        }
      } catch (err) {
        console.error('Error loading vouchers:', err);
        setActualVouchers(vouchers || []);
      }
    };
    
    loadVouchers();
  }, [vouchers]);

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
      // All orders from backend are already paid (filtered by backend)
      // So we don't need to check status here
      
      // Use orderDate if available, otherwise use showtime
      const orderDate = order.orderDate ? new Date(order.orderDate) : new Date(order.showtime);
      if (orderDate < dateRange.startDate || orderDate > dateRange.endDate) return false;
      
      if (selectedCinema !== 'all' && order.cinemaComplexId !== Number(selectedCinema)) return false;
      if (selectedMovie !== 'all' && order.movieId !== Number(selectedMovie)) return false;
      
      return true;
    });
  }, [orders, dateRange, selectedCinema, selectedMovie]);

  // Summary Statistics
  const summaryStats = useMemo(() => {
    // Calculate revenue - use totalAmount from orders
    // Group by orderId to avoid double counting (one order can have multiple booking records)
    const uniqueOrders = new Map();
    filteredOrders.forEach(order => {
      const orderId = order.orderId || order.bookingId;
      if (!uniqueOrders.has(orderId)) {
        uniqueOrders.set(orderId, {
          totalAmount: order.totalAmount || 0,
          ticketCount: order.seats?.length || 0
        });
      } else {
        // If order already exists, only add tickets (revenue already counted)
        uniqueOrders.get(orderId).ticketCount += order.seats?.length || 0;
      }
    });
    
    const totalRevenue = Array.from(uniqueOrders.values()).reduce((sum, order) => sum + order.totalAmount, 0);
    const totalTickets = Array.from(uniqueOrders.values()).reduce((sum, order) => sum + order.ticketCount, 0);
    
    // Active movies - count movies that have showtimes in the future or currently showing
    const now = new Date();
    const activeMovies = (movies || []).filter(m => {
      // Check if movie has any showtime that is in the future or currently showing
      const movieShowtimes = allShowtimes.filter(st => st.movieId === m.movieId);
      if (movieShowtimes.length === 0) return false;
      
      // Check if any showtime is in the future or currently showing
      return movieShowtimes.some(st => {
        const startTime = new Date(st.startTime);
        const endTime = new Date(st.endTime);
        // Showtime is active if it hasn't ended yet
        return endTime > now;
      });
    }).length;
    
    // Registered customers - count users with role USER (not ADMIN or MANAGER)
    const customerUsers = actualUsers.filter(u => {
      const role = (u.role || '').toString().toUpperCase().trim();
      const isCustomer = role === 'USER' || role === 'CUSTOMER';
      return isCustomer;
    });
    
    console.log('Reports: Total users:', actualUsers.length);
    console.log('Reports: Customer users:', customerUsers.length);
    console.log('Reports: User roles breakdown:', actualUsers.reduce((acc, u) => {
      const role = (u.role || '').toString().toUpperCase().trim();
      acc[role] = (acc[role] || 0) + 1;
      return acc;
    }, {}));
    
    const registeredCustomers = customerUsers.length;
    
    // Active vouchers - vouchers that are currently valid (check status field)
    const activeVouchersList = actualVouchers.filter(v => {
      // Check if voucher has status field and it's 'active'
      if (v.status) {
        const status = typeof v.status === 'string' ? v.status.toLowerCase() : v.status;
        return status === 'active' || status === 'available';
      }
      
      // Fallback: if no status, calculate from dates
      if (!v.startDate || !v.endDate) return false;
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const startDateStr = typeof v.startDate === 'string' ? v.startDate.split('T')[0] : v.startDate;
      const endDateStr = typeof v.endDate === 'string' ? v.endDate.split('T')[0] : v.endDate;
      
      const start = new Date(startDateStr);
      const end = new Date(endDateStr);
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);
      
      return start <= today && today <= end;
    });
    
    console.log('Reports: Total vouchers:', actualVouchers.length);
    console.log('Reports: Active vouchers:', activeVouchersList.length);
    console.log('Reports: Voucher details:', actualVouchers.map(v => ({ 
      code: v.code, 
      status: v.status, 
      startDate: v.startDate, 
      endDate: v.endDate 
    })));
    
    const activeVouchers = activeVouchersList.length;

    return {
      totalRevenue,
      totalTickets,
      activeMovies,
      registeredCustomers,
      activeVouchers
    };
  }, [filteredOrders, movies, actualUsers, actualVouchers, allShowtimes]);

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

  // Revenue by Cinema - Aggregate by unique orderId to avoid double counting
  const revenueByCinema = useMemo(() => {
    console.log('Calculating revenueByCinema from filteredOrders:', filteredOrders.length);
    const cinemaRevenue = {};
    
    // Group orders by unique (cinemaId, orderId) pair to avoid double counting
    // Each order can have multiple booking records (one per showtime), but we only count the order once per cinema
    const uniqueOrdersByCinema = {};
    
    filteredOrders.forEach(order => {
      const cinemaId = order.cinemaComplexId;
      const orderId = order.orderId;
      
      if (!orderId || !cinemaId) {
        console.warn('Order missing orderId or cinemaId:', order);
        return;
      }
      
      // Create a unique key for this (cinema, order) pair
      const key = `${cinemaId}_${orderId}`;
      
      // Only process each order once per cinema
      // If already exists, add tickets (since one order can have multiple showtimes)
      if (!uniqueOrdersByCinema[key]) {
        uniqueOrdersByCinema[key] = {
          cinemaId: Number(cinemaId),
          orderId: orderId,
          totalAmount: order.totalAmount || 0,
          ticketCount: order.seats?.length || 0,
          cinemaName: order.cinemaName
        };
      } else {
        // Add tickets from this showtime to the total (for orders with multiple showtimes)
        uniqueOrdersByCinema[key].ticketCount += order.seats?.length || 0;
      }
    });
    
    // Aggregate revenue by cinema
    Object.values(uniqueOrdersByCinema).forEach(order => {
      const cinemaId = order.cinemaId;
      
      if (!cinemaRevenue[cinemaId]) {
        const cinemaName = cinemas.find(c => c.complexId === cinemaId)?.name || 
                          order.cinemaName || 
                          `Rạp #${cinemaId}`;
        cinemaRevenue[cinemaId] = {
          cinemaId: cinemaId,
          name: cinemaName,
          revenue: 0,
          tickets: 0
        };
      }
      
      // Sum up revenue and tickets for this cinema
      cinemaRevenue[cinemaId].revenue += order.totalAmount || 0;
      cinemaRevenue[cinemaId].tickets += order.ticketCount || 0;
    });
    
    const result = Object.values(cinemaRevenue).sort((a, b) => b.revenue - a.revenue);
    console.log('revenueByCinema result:', result);
    console.log('Unique orders processed:', Object.keys(uniqueOrdersByCinema).length);
    console.log('Cinemas found:', result.length);
    return result;
  }, [filteredOrders, cinemas]);

  // Daily Revenue (last 30 days)
  const dailyRevenue = useMemo(() => {
    const daily = {};
    const days = [];
    const daysCount = timeRange === '7' ? 7 : timeRange === '90' ? 90 : timeRange === 'all' ? 365 : 30;
    
    for (let i = daysCount - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      const dateStr = date.toISOString().split('T')[0];
      daily[dateStr] = { revenue: 0, orderIds: new Set() };
      days.push({
        date: dateStr,
        displayDate: date.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' }),
        revenue: 0
      });
    }
    
    // Group orders by orderId to avoid double counting
    const ordersByDate = {};
    filteredOrders.forEach(order => {
      // Use orderDate if available, otherwise use showtime
      const orderDate = order.orderDate ? new Date(order.orderDate) : new Date(order.showtime);
      orderDate.setHours(0, 0, 0, 0);
      const dateStr = orderDate.toISOString().split('T')[0];
      const orderId = order.orderId || order.bookingId;
      
      if (daily[dateStr]) {
        if (!ordersByDate[dateStr]) {
          ordersByDate[dateStr] = {};
        }
        // Only count each order once per day
        if (!ordersByDate[dateStr][orderId]) {
          ordersByDate[dateStr][orderId] = order.totalAmount || 0;
          daily[dateStr].revenue += order.totalAmount || 0;
        }
      }
    });
    
    return days.map(d => ({ ...d, revenue: daily[d.date]?.revenue || 0 }));
  }, [filteredOrders, timeRange]);

  // Top 5 Movies by Ticket Count
  const top5Movies = useMemo(() => {
    return revenueByMovie
      .sort((a, b) => b.tickets - a.tickets)
      .slice(0, 5)
      .map((movie, idx) => ({ ...movie, rank: idx + 1 }));
  }, [revenueByMovie]);

  // Cinema Performance (for pie chart)
  const cinemaPerformance = useMemo(() => {
    const result = revenueByCinema.slice(0, 5).map(c => ({
      name: c.name,
      value: c.revenue
    }));
    console.log('cinemaPerformance for pie chart:', result);
    return result;
  }, [revenueByCinema]);

  // Food Combo Sales - Calculate from actual orders
  const foodComboSales = useMemo(() => {
    console.log('Calculating foodComboSales from filteredOrders:', filteredOrders.length);
    const comboStats = {};
    const processedOrderIds = new Set(); // Track processed orders to avoid double counting
    
    // Aggregate combo sales from all orders
    filteredOrders.forEach(order => {
      const orderId = order.orderId;
      
      // Only process each order once to avoid double counting
      // (since one order can have multiple booking records for different showtimes)
      if (!orderId || processedOrderIds.has(orderId)) {
        return;
      }
      processedOrderIds.add(orderId);
      
      // Process combos from this order
      if (order.combos && Array.isArray(order.combos) && order.combos.length > 0) {
        order.combos.forEach(combo => {
          const comboId = combo.comboId || combo.comboName;
          const comboName = combo.comboName || `Combo #${comboId}`;
          const quantity = combo.quantity || 1;
          const price = parseFloat(combo.price) || 0;
          const revenue = price * quantity;
          
          if (!comboStats[comboId]) {
            comboStats[comboId] = {
              id: comboId,
              name: comboName,
              quantity: 0,
              revenue: 0
            };
          }
          
          comboStats[comboId].quantity += quantity;
          comboStats[comboId].revenue += revenue;
        });
      }
    });
    
    const result = Object.values(comboStats).sort((a, b) => b.revenue - a.revenue);
    console.log('foodComboSales result:', result);
    return result;
  }, [filteredOrders]);

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

  // Debug logging
  useEffect(() => {
    console.log('Reports: Orders loaded:', orders.length);
    console.log('Reports: Filtered orders:', filteredOrders.length);
    console.log('Reports: Summary stats:', summaryStats);
  }, [orders, filteredOrders, summaryStats]);

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
      {/* Description */}
      <p style={{ color: '#c9c4c5', fontSize: '14px', marginBottom: '8px' }}>
        Tổng quan hiệu suất kinh doanh và xu hướng doanh thu
      </p>

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
                    labelLine={true}
                    label={({ name, percent }) => {
                      // Shorten cinema name if too long
                      const shortName = name.length > 15 ? name.substring(0, 12) + '...' : name;
                      return `${shortName}: ${(percent * 100).toFixed(0)}%`;
                    }}
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
                  <Legend 
                    verticalAlign="bottom" 
                    height={36}
                    wrapperStyle={{ fontSize: '12px' }}
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

        {/* Food Combo Sales - Only show if there's data */}
        {foodComboSales && foodComboSales.length > 0 && (
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
                    {foodComboSales.map((combo, idx) => (
                      <tr key={combo.id || idx}>
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
        )}
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