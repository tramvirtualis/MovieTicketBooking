import React, { useState, useEffect } from 'react';
import { getAllOrdersAdmin } from '../../services/customer';

// Booking Management Component
function BookingManagement({ orders: initialOrders, cinemas: cinemasList, movies: moviesList, onOrdersChange }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCinema, setFilterCinema] = useState('');
  const [filterMovie, setFilterMovie] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [selected, setSelected] = useState(null);
  const [sortField, setSortField] = useState('showtime');
  const [sortDirection, setSortDirection] = useState('desc');

  // Load orders from backend
  useEffect(() => {
    const loadOrders = async () => {
      setLoading(true);
      setError(null);
      try {
        const ordersData = await getAllOrdersAdmin();
        console.log('Loaded orders from backend:', ordersData);
        
        // Map backend format to frontend format
        // Backend returns OrderResponseDTO with items (tickets) array
        // Frontend expects one booking per ticket
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
                showtime: firstTicket.showtimeStart,
                seats: seats,
                pricePerSeat: ticketGroup.length > 0 ? parseFloat(ticketGroup[0].price) || 0 : 0,
                totalAmount: parseFloat(order.totalAmount) || totalAmount,
                status: 'PAID', // All orders in DB are successful (status removed)
                paymentMethod: order.paymentMethod || 'UNKNOWN'
              });
            });
          }
        });
        
        console.log('Mapped orders:', mappedOrders);
        setOrders(mappedOrders);
        if (onOrdersChange) onOrdersChange(mappedOrders);
      } catch (err) {
        console.error('Error loading orders:', err);
        setError(err.message || 'Không thể tải danh sách đơn hàng');
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };
    
    loadOrders();
  }, [onOrdersChange]);

  const withinRange = (dt) => {
    const t = new Date(dt).getTime();
    if (dateFrom && t < new Date(dateFrom).getTime()) return false;
    if (dateTo && t > new Date(dateTo + 'T23:59:59').getTime()) return false;
    return true;
  };

  const isExpired = (o) => new Date(o.showtime).getTime() < Date.now();
  const derivedStatus = (o) => (isExpired(o) ? 'EXPIRED' : 'ACTIVE'); // Còn hạn / Hết hạn

  const filtered = orders.filter(o => {
    const matchesText =
      o.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.user.phone.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.movieTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.cinemaName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCinema = !filterCinema || String(o.cinemaComplexId) === String(filterCinema);
    const matchesMovie = !filterMovie || String(o.movieId) === String(filterMovie);
    const matchesStatus = !filterStatus || derivedStatus(o) === filterStatus;
    return matchesText && matchesCinema && matchesMovie && matchesStatus && withinRange(o.showtime);
  });

  const statusColor = (s) => ({ ACTIVE: '#4caf50', EXPIRED: '#9e9e9e' }[s] || '#9e9e9e');

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sorted = [...filtered].sort((a, b) => {
    let aVal, bVal;
    switch (sortField) {
      case 'bookingId':
        aVal = a.bookingId;
        bVal = b.bookingId;
        break;
      case 'customer':
        aVal = a.user.name.toLowerCase();
        bVal = b.user.name.toLowerCase();
        break;
      case 'movie':
        aVal = a.movieTitle.toLowerCase();
        bVal = b.movieTitle.toLowerCase();
        break;
      case 'showtime':
        aVal = new Date(a.showtime).getTime();
        bVal = new Date(b.showtime).getTime();
        break;
      case 'amount':
        aVal = a.totalAmount;
        bVal = b.totalAmount;
        break;
      case 'status':
        aVal = derivedStatus(a);
        bVal = derivedStatus(b);
        break;
      default:
        aVal = new Date(a.showtime).getTime();
        bVal = new Date(b.showtime).getTime();
    }
    
    if (typeof aVal === 'string') {
      return sortDirection === 'asc' 
        ? aVal.localeCompare(bVal)
        : bVal.localeCompare(aVal);
    } else {
      return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
    }
  });

  const SortIcon = ({ field }) => {
    if (sortField !== field) {
      return (
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ opacity: 0.3, marginLeft: 4 }}>
          <path d="M8 9l4-4 4 4M16 15l-4 4-4-4"/>
        </svg>
      );
    }
    return sortDirection === 'asc' ? (
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginLeft: 4 }}>
        <path d="M8 9l4-4 4 4"/>
      </svg>
    ) : (
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginLeft: 4 }}>
        <path d="M16 15l-4 4-4-4"/>
      </svg>
    );
  };

  return (
    <div className="admin-card">
      <div className="admin-card__header">
        <h2 className="admin-card__title">Quản lý đặt vé</h2>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <div className="movie-search">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
            <input className="movie-search__input" placeholder="Tìm tên KH, sđt, phim, rạp..." value={searchTerm} onChange={(e)=>setSearchTerm(e.target.value)} />
          </div>
          <select className="movie-filter" value={filterCinema} onChange={(e)=>setFilterCinema(e.target.value)}>
            <option value="">Tất cả rạp</option>
            {cinemasList.map(c => <option key={c.complexId} value={c.complexId}>#{c.complexId} - {c.name}</option>)}
          </select>
          <select className="movie-filter" value={filterMovie} onChange={(e)=>setFilterMovie(e.target.value)}>
            <option value="">Tất cả phim</option>
            {moviesList.map(m => <option key={m.movieId} value={m.movieId}>{m.title}</option>)}
          </select>
          <select className="movie-filter" value={filterStatus} onChange={(e)=>setFilterStatus(e.target.value)}>
            <option value="">Tất cả trạng thái</option>
            <option value="ACTIVE">Còn hạn</option>
            <option value="EXPIRED">Hết hạn</option>
          </select>
          <input type="date" className="movie-filter" value={dateFrom} onChange={(e)=>setDateFrom(e.target.value)} />
          <input type="date" className="movie-filter" value={dateTo} onChange={(e)=>setDateTo(e.target.value)} />
        </div>
      </div>

      <div className="admin-card__content">
        {loading ? (
          <div className="movie-empty">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#e83b41] mb-4"></div>
            <p>Đang tải dữ liệu...</p>
          </div>
        ) : error ? (
          <div className="movie-empty">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            <p>{error}</p>
          </div>
        ) : sorted.length === 0 ? (
          <div className="movie-empty">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
            <p>Không có đơn đặt vé</p>
          </div>
        ) : (
          <div className="admin-table">
            <table>
              <thead>
                <tr>
                  <th style={{ cursor: 'pointer', userSelect: 'none' }} onClick={() => handleSort('bookingId')}>
                    Mã <SortIcon field="bookingId" />
                  </th>
                  <th style={{ cursor: 'pointer', userSelect: 'none' }} onClick={() => handleSort('customer')}>
                    Khách hàng <SortIcon field="customer" />
                  </th>
                  <th style={{ cursor: 'pointer', userSelect: 'none' }} onClick={() => handleSort('movie')}>
                    Phim / Rạp / Phòng <SortIcon field="movie" />
                  </th>
                  <th style={{ cursor: 'pointer', userSelect: 'none' }} onClick={() => handleSort('showtime')}>
                    Suất <SortIcon field="showtime" />
                  </th>
                  <th>Ghế</th>
                  <th style={{ cursor: 'pointer', userSelect: 'none' }} onClick={() => handleSort('amount')}>
                    Thanh toán <SortIcon field="amount" />
                  </th>
                  <th style={{ cursor: 'pointer', userSelect: 'none' }} onClick={() => handleSort('status')}>
                    Trạng thái <SortIcon field="status" />
                  </th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {sorted.map(o => (
                  <tr key={o.bookingId}>
                    <td>#{o.bookingId}</td>
                    <td>
                      <div className="movie-table-title">{o.user.name}</div>
                      <div className="movie-table-rating">{o.user.phone}</div>
                    </td>
                    <td>
                      <div className="movie-table-title">{o.movieTitle}</div>
                      <div className="movie-table-rating">{o.cinemaName} • {o.roomName}</div>
                    </td>
                    <td>
                      <div className="movie-table-title">{new Date(o.showtime).toLocaleDateString('vi-VN')}</div>
                      <div className="movie-table-rating">{new Date(o.showtime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}</div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        {o.seats.map(s => (
                          <span
                            key={s}
                            className="badge-rating"
                            style={{
                              background: 'linear-gradient(180deg,#7b61ff,#4a1a5c)',
                              boxShadow: '0 1px 3px rgba(0,0,0,0.15)'
                            }}
                          >
                            {s}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td>
                      <div className="movie-table-title">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(o.totalAmount)}</div>
                      <div className="movie-table-rating">{o.paymentMethod}</div>
                    </td>
                    <td>
                      <span className="movie-status-badge" style={{ backgroundColor: statusColor(derivedStatus(o)) }}>
                        {derivedStatus(o) === 'ACTIVE' ? 'Còn hạn' : 'Hết hạn'}
                      </span>
                    </td>
                    <td>
                      <div className="movie-table-actions">
                        <button className="movie-action-btn" title="Chi tiết" onClick={()=>setSelected(o)}>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12" y2="8"/></svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selected && (
        <div className="movie-modal-overlay" onClick={()=>setSelected(null)}>
          <div className="movie-modal" onClick={(e)=>e.stopPropagation()}>
            <div className="movie-modal__header">
              <h2>Chi tiết đơn #{selected.bookingId}</h2>
              <button className="movie-modal__close" onClick={()=>setSelected(null)}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            <div className="movie-modal__content">
              <div className="admin-dashboard-grid">
                <div className="admin-card">
                  <div className="admin-card__header"><h3 className="admin-card__title">Thông tin</h3></div>
                  <div className="admin-card__content">
                    <div className="movie-table-title">{selected.user.name}</div>
                    <div className="movie-table-rating">{selected.user.email} • {selected.user.phone}</div>
                    <div style={{ marginTop: 8 }}>{selected.movieTitle} • {selected.cinemaName} • {selected.roomName}</div>
                    <div>Suất: {new Date(selected.showtime).toLocaleString('vi-VN')}</div>
                  </div>
                </div>
                <div className="admin-card">
                  <div className="admin-card__header"><h3 className="admin-card__title">Ghế & Thanh toán</h3></div>
                  <div className="admin-card__content">
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 8 }}>
                      {selected.seats.map(s => (
                        <span
                          key={s}
                          className="badge-rating"
                          style={{ background: 'linear-gradient(180deg,#7b61ff,#4a1a5c)', boxShadow: '0 1px 3px rgba(0,0,0,0.15)' }}
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                    <div>Giá vé: {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(selected.pricePerSeat)} / ghế</div>
                    <div>Tổng: <strong>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(selected.totalAmount)}</strong> • {selected.paymentMethod}</div>
                    <div style={{ marginTop: 8 }}>
                      <span className="movie-status-badge" style={{ backgroundColor: statusColor(derivedStatus(selected)) }}>
                        {derivedStatus(selected) === 'ACTIVE' ? 'Còn hạn' : 'Hết hạn'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="movie-modal__footer">
              <button className="btn btn--ghost" onClick={()=>setSelected(null)}>Đóng</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default BookingManagement;
