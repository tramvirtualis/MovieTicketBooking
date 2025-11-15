import React, { useState, useEffect } from 'react';
import VoucherAssignModal from './VoucherAssignModal';

const PROVINCES = [
  'Hồ Chí Minh', 'Hà Nội', 'Đà Nẵng', 'Cần Thơ', 'Hải Phòng',
  'Bình Dương', 'Đồng Nai', 'Khánh Hòa', 'Lâm Đồng', 'Nghệ An',
  'Bà Rịa - Vũng Tàu', 'Thừa Thiên Huế'
];

// User Management Component
function UserManagement({ users: initialUsersList, cinemas: cinemasList, vouchers: vouchersList, onUsersChange, onVouchersChange }) {
  const [users, setUsers] = useState(initialUsersList);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterProvince, setFilterProvince] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showVoucherModal, setShowVoucherModal] = useState(false);
  const [voucherAssigningUser, setVoucherAssigningUser] = useState(null);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    email: '',
    phone: '',
    addressDescription: '',
    addressProvince: 'Hồ Chí Minh',
    status: true,
    role: 'MANAGER',
    cinemaComplexId: ''
  });

  useEffect(() => {
    if (onUsersChange) onUsersChange(users);
  }, [users, onUsersChange]);

  const formatRole = (r) => r === 'ADMIN' ? 'Admin' : r === 'MANAGER' ? 'Manager' : 'User';

  const filtered = users.filter(u => {
    const matchesSearch =
      u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.phone.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = !filterRole || u.role === filterRole;
    const matchesStatus = filterStatus === '' ? true : u.status === (filterStatus === 'true');
    const province = (u.address?.split(',').pop() || '').trim();
    const matchesProvince = !filterProvince || province === filterProvince;
    return matchesSearch && matchesRole && matchesStatus && matchesProvince;
  });

  const handleAddStaff = () => {
    setFormData({
      username: '',
      password: '',
      email: '',
      phone: '',
      addressDescription: '',
      addressProvince: 'Hồ Chí Minh',
      status: true,
      role: 'MANAGER',
      cinemaComplexId: ''
    });
    setShowModal(true);
  };

  const handleSaveStaff = () => {
    if (!formData.username || !formData.password || !formData.email || !formData.phone || !formData.addressDescription || !formData.addressProvince) {
      alert('Vui lòng điền đầy đủ thông tin bắt buộc');
      return;
    }
    if (formData.role === 'MANAGER' && !formData.cinemaComplexId) {
      alert('Manager cần gán vào một cụm rạp');
      return;
    }

    const address = `${formData.addressDescription}, ${formData.addressProvince}`;
    const newUser = {
      userId: Math.max(...users.map(u => u.userId), 0) + 1,
      username: formData.username,
      password: '******',
      email: formData.email,
      phone: formData.phone,
      address,
      status: formData.status,
      role: formData.role,
      cinemaComplexId: formData.role === 'MANAGER' ? Number(formData.cinemaComplexId) : undefined
    };
    setUsers([newUser, ...users]);
    setShowModal(false);
  };

  const handleToggleStatus = (user) => {
    if (window.confirm(`Bạn muốn ${user.status ? 'chặn' : 'bỏ chặn'} người dùng ${user.username}?`)) {
      setUsers(users.map(u =>
        u.userId === user.userId ? { ...u, status: !u.status } : u
      ));
    }
  };

  // Chỉ cho phép gán voucher cho user thường
  const canAssignVoucher = (user) => user.role === 'USER';

  return (
    <div className="admin-card">
      <div className="admin-card__header">
        <h2 className="admin-card__title">Quản lý người dùng</h2>
        <div style={{ display: 'flex', gap: 6, flexWrap: 'nowrap', alignItems: 'center' }}>
          <input
            className="movie-search__input"
            style={{ minWidth: 180, flex: 1 }}
            placeholder="Tìm username, email, phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <select value={filterRole} onChange={(e) => setFilterRole(e.target.value)} className="movie-filter" style={{ minWidth: 120 }}>
            <option value="">Tất cả vai trò</option>
            <option value="ADMIN">ADMIN</option>
            <option value="MANAGER">MANAGER</option>
            <option value="USER">USER</option>
          </select>
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="movie-filter" style={{ minWidth: 120 }}>
            <option value="">Tất cả trạng thái</option>
            <option value="true">Hoạt động</option>
            <option value="false">Khóa</option>
          </select>
          <select value={filterProvince} onChange={(e) => setFilterProvince(e.target.value)} className="movie-filter" style={{ minWidth: 120 }}>
            <option value="">Tất cả tỉnh/thành</option>
            {PROVINCES.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
          <button className="btn btn--primary" onClick={handleAddStaff} style={{ whiteSpace: 'nowrap' }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Tạo tài khoản Staff
          </button>
        </div>
      </div>
      
      <div className="admin-card__content">
        <div className="admin-table">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Username</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Địa chỉ</th>
                <th>Vai trò</th>
                <th>Trạng thái</th>
                <th>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(u => (
                <tr key={u.userId}>
                  <td>{u.userId}</td>
                  <td>{u.username}</td>
                  <td>{u.email}</td>
                  <td>{u.phone}</td>
                  <td>{u.address}</td>
                  <td>
                    {formatRole(u.role)}
                    {u.role === 'MANAGER' && u.cinemaComplexId ? (
                      <span style={{ marginLeft: 6, fontSize: 12, opacity: .85 }}>(Cụm #{u.cinemaComplexId})</span>
                    ) : null}
                  </td>
                  <td>
                    <span 
                      className="movie-status-badge" 
                      style={{ 
                        backgroundColor: u.status ? '#4caf50' : '#9e9e9e',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        minWidth: '100px'
                      }}
                      onClick={() => handleToggleStatus(u)}
                      title={`Click để ${u.status ? 'chặn' : 'bỏ chặn'}`}
                    >
                      {u.status ? 'Hoạt động' : 'Khóa'}
                    </span>
                  </td>
                  <td>
                    <div className="movie-table-actions">
                      <button 
                        className="movie-action-btn"
                        onClick={() => handleToggleStatus(u)}
                        title={u.status ? 'Chặn người dùng này' : 'Bỏ chặn người dùng này'}
                        style={{ color: u.status ? '#e83b41' : '#4caf50' }}
                      >
                        {u.status ? (
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10"/>
                            <polyline points="12 6 12 12 16 14"/>
                          </svg>
                        ) : (
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10"/>
                            <line x1="12" y1="16" x2="12" y2="12"/>
                            <line x1="12" y1="8" x2="12.01" y2="8"/>
                          </svg>
                        )}
                      </button>
                      {canAssignVoucher(u) && (
                        <button 
                          className="movie-action-btn" 
                          onClick={() => { setVoucherAssigningUser(u); setShowVoucherModal(true); }} 
                          title="Gán voucher"
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 7h-4V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v3H4a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2z"/><path d="M12 12v6M9 15h6"/></svg>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal tạo tài khoản Staff (Manager/Admin) */}
      {showModal && (
        <div className="movie-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="movie-modal" onClick={(e) => e.stopPropagation()}>
            <div className="movie-modal__header">
              <h2>Tạo tài khoản Staff</h2>
              <button className="movie-modal__close" onClick={() => setShowModal(false)}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            <div className="movie-modal__content">
              <div className="movie-form">
                <div className="movie-form__row">
                  <div className="movie-form__group">
                    <label>Username <span className="required">*</span></label>
                    <input type="text" value={formData.username} onChange={(e) => setFormData({ ...formData, username: e.target.value })} />
                  </div>
                  <div className="movie-form__group">
                    <label>Password <span className="required">*</span></label>
                    <input type="password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} />
                  </div>
                </div>
                <div className="movie-form__row">
                  <div className="movie-form__group">
                    <label>Email <span className="required">*</span></label>
                    <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
                  </div>
                  <div className="movie-form__group">
                    <label>Phone <span className="required">*</span></label>
                    <input type="tel" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} />
                  </div>
                </div>
                <div className="movie-form__group">
                  <label>Địa chỉ - Mô tả <span className="required">*</span></label>
                  <input
                    type="text"
                    value={formData.addressDescription}
                    onChange={(e) => setFormData({ ...formData, addressDescription: e.target.value })}
                    placeholder="Số nhà, đường, phường/xã, quận/huyện"
                  />
                </div>
                <div className="movie-form__group">
                  <label>Tỉnh/Thành phố <span className="required">*</span></label>
                  <select
                    value={formData.addressProvince}
                    onChange={(e) => setFormData({ ...formData, addressProvince: e.target.value })}
                  >
                    {PROVINCES.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
                <div className="movie-form__row">
                  <div className="movie-form__group">
                    <label>Vai trò <span className="required">*</span></label>
                    <select
                      value={formData.role}
                      onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    >
                      <option value="MANAGER">MANAGER</option>
                      <option value="ADMIN">ADMIN</option>
                    </select>
                  </div>
                  {formData.role === 'MANAGER' && (
                    <div className="movie-form__group">
                      <label>Cụm rạp (Manager) <span className="required">*</span></label>
                      <select
                        value={formData.cinemaComplexId}
                        onChange={(e) => setFormData({ ...formData, cinemaComplexId: e.target.value })}
                      >
                        <option value="">Chọn cụm rạp</option>
                        {cinemasList.map(c => (
                          <option key={c.complexId} value={c.complexId}>
                            #{c.complexId} - {c.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              </div>
            </div>
            <div className="movie-modal__footer">
              <button className="btn btn--ghost" onClick={() => setShowModal(false)}>Hủy</button>
              <button className="btn btn--primary" onClick={handleSaveStaff}>Tạo tài khoản</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal gán voucher (chỉ cho user thường) */}
      {showVoucherModal && voucherAssigningUser && vouchersList && canAssignVoucher(voucherAssigningUser) && (
        <VoucherAssignModal
          user={voucherAssigningUser}
          vouchers={vouchersList}
          onClose={() => { setShowVoucherModal(false); setVoucherAssigningUser(null); }}
          onSave={(updatedVouchers) => {
            if (onVouchersChange) {
              onVouchersChange(updatedVouchers);
            }
            setShowVoucherModal(false);
            setVoucherAssigningUser(null);
          }}
        />
      )}
    </div>
  );
}

export default UserManagement;
