import React, { useState, useMemo } from 'react';

// Manager Booking Management Component (filtered by managerComplexIds)
function ManagerBookingManagement({ orders: initialOrders, cinemas, movies, managerComplexIds }) {
  const [orders] = useState(initialOrders);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCinema, setFilterCinema] = useState('');
  const [filterMovie, setFilterMovie] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [sortField, setSortField] = useState('bookingId');
  const [sortOrder, setSortOrder] = useState('asc');
  const [selected, setSelected] = useState(null);

  const scopedCinemas = useMemo(() => {
    return (cinemas || []).filter(c => managerComplexIds.includes(c.complexId));
  }, [cinemas, managerComplexIds]);

  const filteredOrders = useMemo(() => {
    return (orders || []).filter(order => {
      if (!managerComplexIds.includes(order.cinemaComplexId)) return false;
      if (searchTerm) {
        const term = searchTerm.toLowerCase();
        const matches = 
          (order.user?.name || '').toLowerCase().includes(term) ||
          (order.user?.phone || '').includes(term) ||
          (order.movieTitle || '').toLowerCase().includes(term) ||
          (order.cinemaName || '').toLowerCase().includes(term);
        if (!matches) return false;
      }
      if (filterCinema && order.cinemaComplexId !== Number(filterCinema)) return false;
      if (filterMovie && order.movieId !== Number(filterMovie)) return false;
      if (filterStatus) {
        const orderDate = new Date(order.showtime);
        const now = new Date();
        const isActive = orderDate > now && order.status === 'PAID';
        if (filterStatus === 'ACTIVE' && !isActive) return false;
        if (filterStatus === 'EXPIRED' && isActive) return false;
      }
      if (dateFrom) {
        const from = new Date(dateFrom);
        from.setHours(0, 0, 0, 0);
        if (new Date(order.showtime) < from) return false;
      }
      if (dateTo) {
        const to = new Date(dateTo);
        to.setHours(23, 59, 59, 999);
        if (new Date(order.showtime) > to) return false;
      }
      return true;
    });
  }, [orders, searchTerm, filterCinema, filterMovie, filterStatus, dateFrom, dateTo, managerComplexIds]);

  const sorted = useMemo(() => {
    const sortedList = [...filteredOrders];
    sortedList.sort((a, b) => {
      let aVal, bVal;
      switch (sortField) {
        case 'bookingId': aVal = a.bookingId; bVal = b.bookingId; break;
        case 'customer': aVal = a.user?.name || ''; bVal = b.user?.name || ''; break;
        case 'movie': aVal = a.movieTitle || ''; bVal = b.movieTitle || ''; break;
        case 'showtime': aVal = new Date(a.showtime).getTime(); bVal = new Date(b.showtime).getTime(); break;
        case 'amount': aVal = a.totalAmount || 0; bVal = b.totalAmount || 0; break;
        case 'status': 
          const aDate = new Date(a.showtime);
          const bDate = new Date(b.showtime);
          const now = new Date();
          aVal = aDate > now && a.status === 'PAID' ? 'ACTIVE' : 'EXPIRED';
          bVal = bDate > now && b.status === 'PAID' ? 'ACTIVE' : 'EXPIRED';
          break;
        default: return 0;
      }
      if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
      return 0;
    });
    return sortedList;
  }, [filteredOrders, sortField, sortOrder]);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const SortIcon = ({ field }) => {
    if (sortField !== field) return <span style={{ opacity: 0.3 }}>↕</span>;
    return sortOrder === 'asc' ? '↑' : '↓';
  };

  const derivedStatus = (order) => {
    const orderDate = new Date(order.showtime);
    const now = new Date();
    return orderDate > now && order.status === 'PAID' ? 'ACTIVE' : 'EXPIRED';
  };

  const statusColor = (status) => status === 'ACTIVE' ? '#4caf50' : '#9e9e9e';

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
            {scopedCinemas.map(c => <option key={c.complexId} value={c.complexId}>#{c.complexId} - {c.name}</option>)}
          </select>
          <select className="movie-filter" value={filterMovie} onChange={(e)=>setFilterMovie(e.target.value)}>
            <option value="">Tất cả phim</option>
            {(movies || []).map(m => <option key={m.movieId} value={m.movieId}>{m.title}</option>)}
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
        {sorted.length === 0 ? (
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
                      <div className="movie-table-title">{o.user?.name || 'Unknown'}</div>
                      <div className="movie-table-rating">{o.user?.email} • {o.user?.phone}</div>
                    </td>
                    <td>
                      <div className="movie-table-title">{o.movieTitle}</div>
                      <div className="movie-table-rating">{o.cinemaName} • {o.roomName}</div>
                    </td>
                    <td>{new Date(o.showtime).toLocaleString('vi-VN')}</td>
                    <td>
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        {o.seats.map(s => (
                          <span key={s} className="badge-rating" style={{ background: 'linear-gradient(180deg,#7b61ff,#4a1a5c)', boxShadow: '0 1px 3px rgba(0,0,0,0.15)' }}>
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
                    <div className="movie-table-title">{selected.user?.name}</div>
                    <div className="movie-table-rating">{selected.user?.email} • {selected.user?.phone}</div>
                    <div style={{ marginTop: 8 }}>{selected.movieTitle} • {selected.cinemaName} • {selected.roomName}</div>
                    <div>Suất: {new Date(selected.showtime).toLocaleString('vi-VN')}</div>
                  </div>
                </div>
                <div className="admin-card">
                  <div className="admin-card__header"><h3 className="admin-card__title">Ghế & Thanh toán</h3></div>
                  <div className="admin-card__content">
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 8 }}>
                      {selected.seats.map(s => (
                        <span key={s} className="badge-rating" style={{ background: 'linear-gradient(180deg,#7b61ff,#4a1a5c)', boxShadow: '0 1px 3px rgba(0,0,0,0.15)' }}>
                          {s}
                        </span>
                      ))}
                    </div>
                    <div>Giá vé: {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(selected.pricePerSeat)} / ghế</div>
                    <div>Tổng: <strong>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(selected.totalAmount)}</strong> • {selected.paymentMethod}</div>
                    <div style={{ marginTop: 8 }}>
                      Trạng thái:{' '}
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

export default ManagerBookingManagement;

