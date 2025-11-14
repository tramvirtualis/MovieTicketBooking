import React, { useState, useEffect } from 'react';

// Food & Beverage Management Component
function FoodBeverageManagement({ items: initialItems, onItemsChange }) {
  const [items, setItems] = useState(initialItems || []);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'table'
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    category: 'FOOD',
    description: '',
    price: '',
    image: '',
    imageFile: null,
    status: 'AVAILABLE'
  });
  const [imagePreview, setImagePreview] = useState('');
  const [validationErrors, setValidationErrors] = useState({});
  const [notification, setNotification] = useState(null);

  const CATEGORIES = ['FOOD', 'BEVERAGE', 'COMBO'];
  const STATUSES = ['AVAILABLE', 'UNAVAILABLE'];

  useEffect(() => {
    if (onItemsChange) {
      onItemsChange(items);
    }
  }, [items, onItemsChange]);

  // Notification component
  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 3000);
  };

  // Handle image upload
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        showNotification('Vui lòng chọn file hình ảnh', 'error');
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        showNotification('Kích thước file không được vượt quá 10MB', 'error');
        return;
      }
      
      setFormData({ ...formData, imageFile: file, image: '' });
      
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  // Remove image
  const handleRemoveImage = () => {
    setFormData({ ...formData, imageFile: null, image: '' });
    setImagePreview('');
  };

  // Open add item modal
  const handleAddItem = () => {
    setEditingItem(null);
    setFormData({
      name: '',
      category: 'FOOD',
      description: '',
      price: '',
      image: '',
      imageFile: null,
      status: 'AVAILABLE'
    });
    setImagePreview('');
    setValidationErrors({});
    setShowModal(true);
  };

  // Open edit item modal
  const handleEditItem = (item) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      category: item.category,
      description: item.description || '',
      price: item.price.toString(),
      image: item.image || '',
      imageFile: null,
      status: item.status || 'AVAILABLE'
    });
    setImagePreview(item.image || '');
    setValidationErrors({});
    setShowModal(true);
  };

  // Save item
  const handleSaveItem = () => {
    const errors = {};
    
    if (!formData.name || formData.name.trim() === '') {
      errors.name = 'Tên sản phẩm không được để trống';
    }
    if (!formData.price || formData.price === '' || parseFloat(formData.price) <= 0) {
      errors.price = 'Giá không được để trống và phải lớn hơn 0';
    }
    if (!imagePreview && (!formData.image || formData.image.trim() === '')) {
      errors.image = 'Vui lòng upload hình ảnh hoặc nhập URL hình ảnh';
    }

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      const modalContent = document.querySelector('.movie-modal__content');
      if (modalContent) {
        modalContent.scrollTo({ top: 0, behavior: 'smooth' });
      }
      return;
    }

    setValidationErrors({});

    let imageValue = '';
    if (imagePreview && imagePreview.startsWith('data:image')) {
      imageValue = imagePreview;
    } else if (formData.image) {
      imageValue = formData.image;
    }

    if (editingItem) {
      // Update existing item
      setItems(items.map(item =>
        item.id === editingItem.id
          ? {
              ...item,
              name: formData.name,
              category: formData.category,
              description: formData.description,
              price: parseFloat(formData.price),
              image: imageValue,
              status: formData.status
            }
          : item
      ));
      showNotification('Cập nhật sản phẩm thành công', 'success');
    } else {
      // Create new item
      const newItem = {
        id: Math.max(...items.map(i => i.id), 0) + 1,
        name: formData.name,
        category: formData.category,
        description: formData.description,
        price: parseFloat(formData.price),
        image: imageValue,
        status: formData.status
      };
      setItems([...items, newItem]);
      showNotification('Thêm sản phẩm thành công', 'success');
    }

    setShowModal(false);
    setEditingItem(null);
    setImagePreview('');
  };

  // Delete item
  const handleDeleteItem = (id) => {
    setItems(items.filter(item => item.id !== id));
    setDeleteConfirm(null);
    showNotification('Xóa sản phẩm thành công', 'success');
  };

  // Format category for display
  const formatCategory = (category) => {
    const categoryMap = {
      'FOOD': 'Đồ ăn',
      'BEVERAGE': 'Nước uống',
      'COMBO': 'Combo'
    };
    return categoryMap[category] || category;
  };

  // Format status for display
  const formatStatus = (status) => {
    const statusMap = {
      'AVAILABLE': 'Có sẵn',
      'UNAVAILABLE': 'Hết hàng'
    };
    return statusMap[status] || status;
  };

  // Get status color
  const getStatusColor = (status) => {
    const colorMap = {
      'AVAILABLE': '#4caf50',
      'UNAVAILABLE': '#9e9e9e'
    };
    return colorMap[status] || '#9e9e9e';
  };

  // Format price
  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  // Filter items
  const filteredItems = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = !filterCategory || item.category === filterCategory;
    const matchesStatus = !filterStatus || item.status === filterStatus;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  return (
    <>
      {/* Notification Toast */}
      {notification && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          zIndex: 10000,
          padding: '16px 20px',
          borderRadius: '12px',
          background: notification.type === 'success' 
            ? 'rgba(76, 175, 80, 0.95)' 
            : 'rgba(244, 67, 54, 0.95)',
          color: '#fff',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          minWidth: '300px',
          maxWidth: '500px',
          animation: 'slideInRight 0.3s ease-out',
          border: `1px solid ${notification.type === 'success' ? 'rgba(76, 175, 80, 1)' : 'rgba(244, 67, 54, 1)'}`
        }}>
          <div style={{
            width: '24px',
            height: '24px',
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}>
            {notification.type === 'success' ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            )}
          </div>
          <span>{notification.message}</span>
        </div>
      )}

      <div className="movie-management">
        {/* Header - Compact Layout */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px',
          gap: '16px',
          flexWrap: 'wrap'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            flex: '1',
            minWidth: '300px'
          }}>
            <div className="movie-management__search" style={{ flex: '1', maxWidth: '400px' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"/>
                <path d="M21 21l-4.35-4.35"/>
              </svg>
              <input
                type="text"
                placeholder="Tìm kiếm sản phẩm..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ fontSize: '14px' }}
              />
            </div>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="movie-management__filter"
              style={{ 
                minWidth: '140px',
                fontSize: '14px',
                padding: '8px 12px'
              }}
            >
              <option value="">Tất cả loại</option>
              {CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{formatCategory(cat)}</option>
              ))}
            </select>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="movie-management__filter"
              style={{ 
                minWidth: '140px',
                fontSize: '14px',
                padding: '8px 12px'
              }}
            >
              <option value="">Tất cả trạng thái</option>
              {STATUSES.map(status => (
                <option key={status} value={status}>{formatStatus(status)}</option>
              ))}
            </select>
          </div>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <div className="view-mode-toggle">
              <button
                className={`view-mode-btn ${viewMode === 'grid' ? 'active' : ''}`}
                onClick={() => setViewMode('grid')}
                title="Xem dạng lưới"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="7" height="7"/>
                  <rect x="14" y="3" width="7" height="7"/>
                  <rect x="14" y="14" width="7" height="7"/>
                  <rect x="3" y="14" width="7" height="7"/>
                </svg>
              </button>
              <button
                className={`view-mode-btn ${viewMode === 'table' ? 'active' : ''}`}
                onClick={() => setViewMode('table')}
                title="Xem dạng bảng"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 3H5a2 2 0 0 0-2 2v4m6-6h10a2 2 0 0 1 2 2v4M9 3v18m0 0h10a2 2 0 0 0 2-2V9M9 21H5a2 2 0 0 1-2-2V9m0 0h18"/>
                </svg>
              </button>
            </div>
            <button 
              className="btn btn--primary" 
              onClick={handleAddItem}
              style={{
                padding: '10px 16px',
                fontSize: '14px',
                whiteSpace: 'nowrap'
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="12" y1="5" x2="12" y2="19"/>
                <line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              Thêm sản phẩm
            </button>
          </div>
        </div>

        {/* Items count - Compact */}
        <div style={{
          marginBottom: '16px',
          fontSize: '14px',
          color: 'rgba(255,255,255,0.6)'
        }}>
          Tìm thấy <strong style={{ color: '#fff' }}>{filteredItems.length}</strong> sản phẩm
        </div>

        {/* Items list */}
        {viewMode === 'grid' ? (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
            gap: '16px',
            padding: '0'
          }}>
            {filteredItems.map(item => (
              <div key={item.id} style={{
                background: 'rgba(20, 15, 16, 0.6)',
                borderRadius: '12px',
                overflow: 'hidden',
                border: '1px solid rgba(255,255,255,0.1)',
                transition: 'all 0.3s ease',
                cursor: 'pointer',
                position: 'relative'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.3)';
                e.currentTarget.style.borderColor = 'rgba(123, 97, 255, 0.5)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)';
              }}
              >
                <div style={{ position: 'relative', width: '100%', paddingTop: '75%', overflow: 'hidden' }}>
                  <img 
                    src={item.image || 'https://via.placeholder.com/200x150'} 
                    alt={item.name}
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover'
                    }}
                  />
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'linear-gradient(to bottom, rgba(0,0,0,0) 0%, rgba(0,0,0,0.7) 100%)',
                    opacity: 0,
                    transition: 'opacity 0.3s',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '12px'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
                  onMouseLeave={(e) => e.currentTarget.style.opacity = '0'}
                  >
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditItem(item);
                      }}
                      style={{
                        background: 'rgba(123, 97, 255, 0.9)',
                        border: 'none',
                        borderRadius: '8px',
                        width: '36px',
                        height: '36px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        color: '#fff'
                      }}
                      title="Chỉnh sửa"
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                      </svg>
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteConfirm(item);
                      }}
                      style={{
                        background: 'rgba(232, 59, 65, 0.9)',
                        border: 'none',
                        borderRadius: '8px',
                        width: '36px',
                        height: '36px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        color: '#fff'
                      }}
                      title="Xóa"
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="3 6 5 6 21 6"/>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                      </svg>
                    </button>
                  </div>
                  <div style={{
                    position: 'absolute',
                    top: '8px',
                    right: '8px',
                    padding: '4px 10px',
                    borderRadius: '12px',
                    fontSize: '11px',
                    fontWeight: 600,
                    backgroundColor: getStatusColor(item.status),
                    color: '#fff',
                    textTransform: 'uppercase'
                  }}>
                    {formatStatus(item.status)}
                  </div>
                </div>
                <div style={{ padding: '12px' }}>
                  <h3 style={{
                    fontSize: '15px',
                    fontWeight: 600,
                    margin: '0 0 8px 0',
                    color: '#fff',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}>
                    {item.name}
                  </h3>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '6px'
                  }}>
                    <span style={{
                      fontSize: '12px',
                      color: 'rgba(255,255,255,0.6)',
                      background: 'rgba(123, 97, 255, 0.2)',
                      padding: '2px 8px',
                      borderRadius: '4px'
                    }}>
                      {formatCategory(item.category)}
                    </span>
                    <span style={{
                      fontSize: '14px',
                      color: '#ffd700',
                      fontWeight: 600
                    }}>
                      {formatPrice(item.price)}
                    </span>
                  </div>
                  {item.description && (
                    <div style={{
                      fontSize: '12px',
                      color: 'rgba(255,255,255,0.5)',
                      marginTop: '6px',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                      lineHeight: '1.4'
                    }}>
                      {item.description}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="admin-table">
            <table>
              <thead>
                <tr>
                  <th>Hình ảnh</th>
                  <th>Tên sản phẩm</th>
                  <th>Loại</th>
                  <th>Giá</th>
                  <th>Mô tả</th>
                  <th>Trạng thái</th>
                  <th>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.map(item => (
                  <tr key={item.id}>
                    <td>
                      <img src={item.image || 'https://via.placeholder.com/60x90'} alt={item.name} className="movie-table-poster" />
                    </td>
                    <td>
                      <div className="movie-table-title">{item.name}</div>
                    </td>
                    <td>{formatCategory(item.category)}</td>
                    <td style={{ fontWeight: 600, color: '#ffd700' }}>{formatPrice(item.price)}</td>
                    <td style={{ maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {item.description || '-'}
                    </td>
                    <td>
                      <span className="movie-status-badge" style={{ backgroundColor: getStatusColor(item.status) }}>
                        {formatStatus(item.status)}
                      </span>
                    </td>
                    <td>
                      <div className="movie-table-actions">
                        <button
                          className="movie-action-btn"
                          onClick={() => handleEditItem(item)}
                          title="Chỉnh sửa"
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                          </svg>
                        </button>
                        <button
                          className="movie-action-btn movie-action-btn--delete"
                          onClick={() => setDeleteConfirm(item)}
                          title="Xóa"
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="3 6 5 6 21 6"/>
                            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Empty state */}
        {filteredItems.length === 0 && (
          <div className="movie-empty" style={{
            padding: '60px 20px',
            textAlign: 'center',
            color: '#c9c4c5'
          }}>
            <svg 
              width="80" 
              height="80" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="1.5"
              style={{ 
                marginBottom: '20px',
                opacity: 0.5,
                color: '#7b61ff'
              }}
            >
              <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/>
              <line x1="3" y1="6" x2="21" y2="6"/>
              <path d="M16 10a4 4 0 0 1-8 0"/>
            </svg>
            <p style={{ 
              fontSize: '16px', 
              fontWeight: 500, 
              marginBottom: '8px',
              color: '#e6e1e2'
            }}>
              {searchTerm || filterCategory || filterStatus 
                ? 'Không tìm thấy sản phẩm nào phù hợp với bộ lọc' 
                : 'Chưa có sản phẩm nào trong hệ thống'}
            </p>
            {!searchTerm && !filterCategory && !filterStatus && (
              <button 
                className="btn btn--primary" 
                onClick={handleAddItem}
                style={{ marginTop: '16px' }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="12" y1="5" x2="12" y2="19"/>
                  <line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
                Thêm sản phẩm đầu tiên
              </button>
            )}
          </div>
        )}

        {/* Add/Edit Item Modal */}
        {showModal && (
          <div className="movie-modal-overlay" onClick={() => {
            setShowModal(false);
            setImagePreview('');
          }}>
            <div className="movie-modal" onClick={(e) => e.stopPropagation()}>
              <div className="movie-modal__header">
                <h2>{editingItem ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm mới'}</h2>
                <button className="movie-modal__close" onClick={() => {
                  setShowModal(false);
                  setImagePreview('');
                }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18"/>
                    <line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                </button>
              </div>
              <div className="movie-modal__content">
                <div className="movie-form">
                  {Object.keys(validationErrors).length > 0 && (
                    <div style={{
                      padding: '12px 16px',
                      marginBottom: '20px',
                      backgroundColor: 'rgba(255, 87, 87, 0.1)',
                      border: '1px solid rgba(255, 87, 87, 0.3)',
                      borderRadius: '8px',
                      color: '#ff5757',
                      fontSize: '14px'
                    }}>
                      <div style={{ fontWeight: 600, marginBottom: '8px' }}>Vui lòng kiểm tra các trường sau:</div>
                      <ul style={{ margin: 0, paddingLeft: '20px' }}>
                        {Object.values(validationErrors).map((error, index) => (
                          <li key={index}>{error}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  <div className="movie-form__row">
                    <div className="movie-form__group">
                      <label>Tên sản phẩm <span className="required">*</span></label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => {
                          setFormData({ ...formData, name: e.target.value });
                          if (validationErrors.name) {
                            setValidationErrors({ ...validationErrors, name: null });
                          }
                        }}
                        placeholder="Nhập tên sản phẩm"
                        style={{
                          borderColor: validationErrors.name ? '#ff5757' : undefined
                        }}
                      />
                      {validationErrors.name && (
                        <div style={{ color: '#ff5757', fontSize: '12px', marginTop: '4px' }}>
                          {validationErrors.name}
                        </div>
                      )}
                    </div>
                    <div className="movie-form__group">
                      <label>Loại <span className="required">*</span></label>
                      <select
                        value={formData.category}
                        onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                      >
                        {CATEGORIES.map(cat => (
                          <option key={cat} value={cat}>{formatCategory(cat)}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="movie-form__row">
                    <div className="movie-form__group">
                      <label>Giá (VNĐ) <span className="required">*</span></label>
                      <input
                        type="number"
                        value={formData.price}
                        onChange={(e) => {
                          setFormData({ ...formData, price: e.target.value });
                          if (validationErrors.price) {
                            setValidationErrors({ ...validationErrors, price: null });
                          }
                        }}
                        placeholder="Nhập giá"
                        min="0"
                        step="1000"
                        style={{
                          borderColor: validationErrors.price ? '#ff5757' : undefined
                        }}
                      />
                      {validationErrors.price && (
                        <div style={{ color: '#ff5757', fontSize: '12px', marginTop: '4px' }}>
                          {validationErrors.price}
                        </div>
                      )}
                    </div>
                    <div className="movie-form__group">
                      <label>Trạng thái <span className="required">*</span></label>
                      <select
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                      >
                        {STATUSES.map(status => (
                          <option key={status} value={status}>{formatStatus(status)}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="movie-form__group">
                    <label>Mô tả</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Nhập mô tả sản phẩm"
                      rows="3"
                    />
                  </div>
                  <div className="movie-form__group">
                    <label>Hình ảnh <span className="required">*</span></label>
                    {imagePreview ? (
                      <div style={{ position: 'relative', display: 'inline-block' }}>
                        <img 
                          src={imagePreview} 
                          alt="Preview" 
                          style={{
                            width: '200px',
                            height: '200px',
                            objectFit: 'cover',
                            borderRadius: '8px',
                            border: '1px solid rgba(255,255,255,0.1)'
                          }}
                        />
                        <button
                          type="button"
                          onClick={handleRemoveImage}
                          style={{
                            position: 'absolute',
                            top: '8px',
                            right: '8px',
                            background: 'rgba(232, 59, 65, 0.9)',
                            border: 'none',
                            borderRadius: '50%',
                            width: '32px',
                            height: '32px',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#fff'
                          }}
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="18" y1="6" x2="6" y2="18"/>
                            <line x1="6" y1="6" x2="18" y2="18"/>
                          </svg>
                        </button>
                      </div>
                    ) : (
                      <div>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          style={{ marginBottom: '8px' }}
                        />
                        <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)', marginTop: '4px' }}>
                          hoặc
                        </div>
                        <input
                          type="text"
                          value={formData.image}
                          onChange={(e) => {
                            setFormData({ ...formData, image: e.target.value });
                            if (validationErrors.image) {
                              setValidationErrors({ ...validationErrors, image: null });
                            }
                          }}
                          placeholder="Nhập URL hình ảnh"
                          style={{
                            marginTop: '8px',
                            borderColor: validationErrors.image ? '#ff5757' : undefined
                          }}
                        />
                      </div>
                    )}
                    {validationErrors.image && (
                      <div style={{ color: '#ff5757', fontSize: '12px', marginTop: '4px' }}>
                        {validationErrors.image}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="movie-modal__footer">
                <button className="btn btn--ghost" onClick={() => {
                  setShowModal(false);
                  setImagePreview('');
                }}>
                  Hủy
                </button>
                <button className="btn btn--primary" onClick={handleSaveItem}>
                  {editingItem ? 'Cập nhật' : 'Thêm sản phẩm'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {deleteConfirm && (
          <div className="movie-modal-overlay" onClick={() => setDeleteConfirm(null)}>
            <div className="movie-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '400px' }}>
              <div className="movie-modal__header">
                <h2>Xác nhận xóa</h2>
                <button className="movie-modal__close" onClick={() => setDeleteConfirm(null)}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18"/>
                    <line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                </button>
              </div>
              <div className="movie-modal__content">
                <p>Bạn có chắc chắn muốn xóa sản phẩm <strong>{deleteConfirm.name}</strong>?</p>
                <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.7)', marginTop: '8px' }}>
                  Hành động này không thể hoàn tác.
                </p>
              </div>
              <div className="movie-modal__footer">
                <button className="btn btn--ghost" onClick={() => setDeleteConfirm(null)}>
                  Hủy
                </button>
                <button 
                  className="btn btn--primary" 
                  onClick={() => {
                    handleDeleteItem(deleteConfirm.id);
                  }}
                  style={{ background: '#e83b41', borderColor: '#e83b41' }}
                >
                  Xóa
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default FoodBeverageManagement;

