import React, { useState, useEffect } from 'react';
import { useEnums } from '../../hooks/useEnums';

// Voucher Management Component
function VoucherManagement({ vouchers: initialVouchersList, users: usersList, onVouchersChange }) {
  const { enums } = useEnums();
  const [vouchers, setVouchers] = useState(initialVouchersList);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterPublic, setFilterPublic] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingVoucher, setEditingVoucher] = useState(null);
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    description: '',
    discountType: 'PERCENT',
    discountValue: '',
    maxDiscount: '',
    minOrder: '',
    startDate: '',
    endDate: '',
    quantity: '',
    status: true,
    isPublic: true,
    assignedUserIds: [],
    image: '',
    imageFile: null
  });
  const [imagePreview, setImagePreview] = useState('');

  useEffect(() => {
    if (onVouchersChange) onVouchersChange(vouchers);
    // Save vouchers to localStorage for Events page
    try {
      localStorage.setItem('adminVouchers', JSON.stringify(vouchers));
    } catch (e) {
      console.error('Failed to save vouchers to localStorage', e);
    }
  }, [vouchers, onVouchersChange]);

  const filtered = vouchers.filter(v => {
    const matchesSearch =
      v.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === '' ? true : v.status === (filterStatus === 'true');
    const matchesType = !filterType || v.discountType === filterType;
    const matchesPublic = filterPublic === '' ? true : (filterPublic === 'true' ? v.isPublic : !v.isPublic);
    return matchesSearch && matchesStatus && matchesType && matchesPublic;
  });

  const handleAdd = () => {
    setEditingVoucher(null);
    setFormData({
      code: '',
      name: '',
      description: '',
      discountType: 'PERCENT',
      discountValue: '',
      maxDiscount: '',
      minOrder: '',
      startDate: '',
      endDate: '',
      quantity: '',
      status: true,
      isPublic: true,
      assignedUserIds: [],
      image: '',
      imageFile: null
    });
    setImagePreview('');
    setShowModal(true);
  };

  const handleEdit = (v) => {
    setEditingVoucher(v);
    setFormData({
      code: v.code,
      name: v.name,
      description: v.description,
      discountType: v.discountType,
      discountValue: v.discountValue.toString(),
      maxDiscount: v.maxDiscount.toString(),
      minOrder: v.minOrder.toString(),
      startDate: v.startDate,
      endDate: v.endDate,
      quantity: v.quantity.toString(),
      status: v.status,
      isPublic: v.isPublic !== undefined ? v.isPublic : true,
      assignedUserIds: v.assignedUserIds || [],
      image: v.image || '',
      imageFile: null
    });
    setImagePreview(v.image || '');
    setShowModal(true);
  };

  const handleSave = () => {
    if (!formData.code || !formData.name || !formData.discountValue || !formData.startDate || !formData.endDate) {
      alert('Vui lòng điền đầy đủ thông tin bắt buộc');
      return;
    }
    const payload = {
      code: formData.code.trim(),
      name: formData.name.trim(),
      description: formData.description.trim(),
      discountType: formData.discountType,
      discountValue: Number(formData.discountValue),
      maxDiscount: Number(formData.maxDiscount || 0),
      minOrder: Number(formData.minOrder || 0),
      startDate: formData.startDate,
      endDate: formData.endDate,
      quantity: Number(formData.quantity || 0),
      status: !!formData.status,
      isPublic: !!formData.isPublic,
      assignedUserIds: formData.isPublic ? [] : (editingVoucher ? (editingVoucher.assignedUserIds || []) : []),
      image: imagePreview || formData.image
    };
    if (editingVoucher) {
      setVouchers(vouchers.map(v => v.voucherId === editingVoucher.voucherId ? { ...v, ...payload } : v));
    } else {
      const newItem = { voucherId: Math.max(...vouchers.map(v => v.voucherId), 0) + 1, ...payload };
      setVouchers([newItem, ...vouchers]);
    }
    setShowModal(false);
    setEditingVoucher(null);
    setImagePreview('');
  };

  const handleDelete = (voucherId) => {
    if (window.confirm('Xóa voucher này?')) {
      setVouchers(vouchers.filter(v => v.voucherId !== voucherId));
    }
  };

  const onUploadImage = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      alert('Vui lòng chọn file hình ảnh');
      return;
    }
    if (file.size > 4 * 1024 * 1024) {
      alert('Kích thước ảnh tối đa 4MB');
      return;
    }
    setFormData(prev => ({ ...prev, imageFile: file, image: '' }));
    const reader = new FileReader();
    reader.onloadend = () => setImagePreview(reader.result);
    reader.readAsDataURL(file);
  };

  const discountBadge = (v) => {
    if (v.discountType === 'PERCENT') return `-${v.discountValue}%`;
    return `-${new Intl.NumberFormat('vi-VN').format(v.discountValue)}đ`;
  };

  return (
    <div className="admin-card">
      <div className="admin-card__header">
        <h2 className="admin-card__title">Quản lý voucher</h2>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <div className="movie-search">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
            <input className="movie-search__input" placeholder="Tìm mã hoặc tên voucher..." value={searchTerm} onChange={(e)=>setSearchTerm(e.target.value)} />
          </div>
          <select className="movie-filter" value={filterType} onChange={(e)=>setFilterType(e.target.value)}>
            <option value="">Tất cả loại giảm</option>
            {enums.discountTypes?.map(type => {
              // Map VALUE to AMOUNT for display
              const displayType = type === 'VALUE' ? 'AMOUNT' : type;
              const displayLabel = type === 'PERCENT' ? 'Phần trăm' : 'Số tiền';
              return (
                <option key={type} value={displayType}>{displayLabel}</option>
              );
            })}
          </select>
          <select className="movie-filter" value={filterPublic} onChange={(e)=>setFilterPublic(e.target.value)}>
            <option value="">Tất cả loại</option>
            <option value="true">Công khai</option>
            <option value="false">Riêng tư</option>
          </select>
          <select className="movie-filter" value={filterStatus} onChange={(e)=>setFilterStatus(e.target.value)}>
            <option value="">Tất cả trạng thái</option>
            <option value="true">Hoạt động</option>
            <option value="false">Ngừng</option>
          </select>
          <button className="btn btn--primary" onClick={handleAdd}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Tạo voucher
          </button>
        </div>
      </div>
      <div className="admin-card__content">
        {filtered.length === 0 ? (
          <div className="movie-empty">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M7 4v16M17 4v16M2 8h20M2 12h20M2 16h20"/></svg>
            <p>Không có voucher nào</p>
          </div>
        ) : (
          <div className="movie-grid">
            {filtered.map(v => (
              <div key={v.voucherId} className="movie-card">
                <div
                  className="movie-card__poster"
                  style={{ width: '100%', height: '160px', overflow: 'hidden', position: 'relative', padding: 0 }}
                >
                  <img
                    src={v.image || 'https://via.placeholder.com/1000x430?text=Voucher'}
                    alt={v.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                  />
                  <div className="movie-card__overlay">
                    <button className="movie-card__action" onClick={() => handleEdit(v)} title="Chỉnh sửa">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                    </button>
                    <button className="movie-card__action movie-card__action--delete" onClick={() => handleDelete(v.voucherId)} title="Xóa">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                    </button>
                  </div>
                  <div className="movie-card__status" style={{ backgroundColor: v.status ? '#4caf50' : '#9e9e9e' }}>
                    {v.status ? 'Hoạt động' : 'Ngừng'}
                  </div>
                  <div className="movie-card__badge" style={{ position: 'absolute', top: 8, left: 8, background: '#e83b41', color: '#fff', padding: '4px 8px', borderRadius: 6, fontWeight: 800 }}>
                    {discountBadge(v)}
                  </div>
                </div>
                <div className="movie-card__content">
                  <h3 className="movie-card__title">{v.name}</h3>
                  {v.isPublic === false && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4, marginBottom: 8 }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: '#7b61ff' }}>
                        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                        <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                      </svg>
                      <span style={{ fontSize: '12px', color: '#7b61ff', fontWeight: 500 }}>Riêng tư</span>
                    </div>
                  )}
                  <div className="movie-card__meta">
                    <span className="movie-card__genre">Mã: {v.code}</span>
                    <span className="movie-card__rating">{new Date(v.startDate).toLocaleDateString('vi-VN')} — {new Date(v.endDate).toLocaleDateString('vi-VN')}</span>
                    <span className="movie-card__duration">SL: {v.quantity}</span>
                  </div>
                  <div className="movie-card__director">{v.description}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showModal && (
        <div className="movie-modal-overlay" onClick={() => { setShowModal(false); setImagePreview(''); }}>
          <div className="movie-modal" onClick={(e) => e.stopPropagation()}>
            <div className="movie-modal__header">
              <h2>{editingVoucher ? 'Chỉnh sửa voucher' : 'Tạo voucher'}</h2>
              <button className="movie-modal__close" onClick={() => setShowModal(false)}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            <div className="movie-modal__content">
              <div className="movie-form">
                <div className="movie-form__row">
                  <div className="movie-form__group">
                    <label>Tên voucher <span className="required">*</span></label>
                    <input value={formData.name} onChange={(e)=>setFormData({ ...formData, name: e.target.value })} />
                  </div>
                  <div className="movie-form__group">
                    <label>Mã <span className="required">*</span></label>
                    <input value={formData.code} onChange={(e)=>setFormData({ ...formData, code: e.target.value.toUpperCase() })} />
                  </div>
                </div>
                <div className="movie-form__group">
                  <label>Mô tả</label>
                  <input value={formData.description} onChange={(e)=>setFormData({ ...formData, description: e.target.value })} />
                </div>
                <div className="movie-form__row">
                  <div className="movie-form__group">
                    <label>Loại giảm <span className="required">*</span></label>
                    <select value={formData.discountType} onChange={(e)=>setFormData({ ...formData, discountType: e.target.value })}>
                      {enums.discountTypes?.map(type => {
                        // Map VALUE to AMOUNT for display
                        const displayType = type === 'VALUE' ? 'AMOUNT' : type;
                        const displayLabel = type === 'PERCENT' ? 'Phần trăm (%)' : 'Số tiền (đ)';
                        return (
                          <option key={type} value={displayType}>{displayLabel}</option>
                        );
                      })}
                    </select>
                  </div>
                  <div className="movie-form__group">
                    <label>Giá trị <span className="required">*</span></label>
                    <input type="number" value={formData.discountValue} onChange={(e)=>setFormData({ ...formData, discountValue: e.target.value })} min="0" />
                  </div>
                  <div className="movie-form__group">
                    <label>Giảm tối đa</label>
                    <input type="number" value={formData.maxDiscount} onChange={(e)=>setFormData({ ...formData, maxDiscount: e.target.value })} min="0" />
                  </div>
                </div>
                <div className="movie-form__row">
                  <div className="movie-form__group">
                    <label>Đơn tối thiểu</label>
                    <input type="number" value={formData.minOrder} onChange={(e)=>setFormData({ ...formData, minOrder: e.target.value })} min="0" />
                  </div>
                  <div className="movie-form__group">
                    <label>Số lượng</label>
                    <input type="number" value={formData.quantity} onChange={(e)=>setFormData({ ...formData, quantity: e.target.value })} min="0" />
                  </div>
                </div>
                <div className="movie-form__row">
                  <div className="movie-form__group">
                    <label>Ngày bắt đầu <span className="required">*</span></label>
                    <input type="date" value={formData.startDate} onChange={(e)=>setFormData({ ...formData, startDate: e.target.value })} />
                  </div>
                  <div className="movie-form__group">
                    <label>Ngày kết thúc <span className="required">*</span></label>
                    <input type="date" value={formData.endDate} onChange={(e)=>setFormData({ ...formData, endDate: e.target.value })} />
                  </div>
                </div>
                <div className="movie-form__group">
                  <label>Ảnh voucher</label>
                  <div className="movie-poster-upload">
                    <div className="movie-poster-upload__options">
                      <label className="movie-poster-upload__btn">
                        <input type="file" accept="image/*" onChange={onUploadImage} style={{ display: 'none' }} />
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
                        Upload từ máy
                      </label>
                      <span className="movie-poster-upload__or">hoặc</span>
                      <input
                        type="url"
                        className="movie-poster-upload__url"
                        placeholder="Dán URL ảnh"
                        value={formData.image}
                        onChange={(e)=>{ setFormData({ ...formData, image: e.target.value, imageFile: null }); setImagePreview(e.target.value); }}
                      />
                    </div>
                    {(imagePreview || formData.image) && (
                      <div className="movie-poster-upload__preview" style={{ width: '100%', height: '180px' }}>
                        <img
                          src={imagePreview || formData.image}
                          alt="Voucher preview"
                          style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 8 }}
                        />
                      </div>
                    )}
                  </div>
                </div>
                <div className="movie-form__group">
                  <label>Loại voucher <span className="required">*</span></label>
                  <div style={{ display: 'flex', gap: 16 }}>
                    <label style={{ display: 'inline-flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                      <input 
                        type="radio" 
                        name="voucherType" 
                        checked={formData.isPublic} 
                        onChange={() => setFormData({ ...formData, isPublic: true })} 
                      />
                      Công khai (Hiển thị trên trang voucher)
                    </label>
                    <label style={{ display: 'inline-flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                      <input 
                        type="radio" 
                        name="voucherType" 
                        checked={!formData.isPublic} 
                        onChange={() => setFormData({ ...formData, isPublic: false })} 
                      />
                      Riêng tư (Gán cho người dùng ở trang quản lý người dùng)
                    </label>
                  </div>
                </div>
                <div className="movie-form__group">
                  <label>Trạng thái</label>
                  <label style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                    <input type="checkbox" checked={formData.status} onChange={(e)=>setFormData({ ...formData, status: e.target.checked })} />
                    Hoạt động
                  </label>
                </div>
              </div>
            </div>
            <div className="movie-modal__footer">
              <button className="btn btn--ghost" onClick={() => setShowModal(false)}>Hủy</button>
              <button className="btn btn--primary" onClick={handleSave}>{editingVoucher ? 'Cập nhật' : 'Tạo voucher'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default VoucherManagement;
