import React, { useState, useEffect } from 'react';
import { bannerService } from '../../services/bannerService';
import cloudinaryService from '../../services/cloudinaryService';
import ConfirmDeleteModal from '../Common/ConfirmDeleteModal';
import '../../styles/admin/banner-management.css';

// Banner Management Component
function BannerManagement({ banners: initialBannersList, onBannersChange }) {
  const [banners, setBanners] = useState(initialBannersList || []);
  const [showModal, setShowModal] = useState(false);
  const [editingBanner, setEditingBanner] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    image: '',
    imageFile: null
  });
  const [imagePreview, setImagePreview] = useState('');
  const [validationErrors, setValidationErrors] = useState({});
  const [notification, setNotification] = useState(null);
  const [savingBanner, setSavingBanner] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Notification component
  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 3000);
  };

  // Load banners from API on mount
  useEffect(() => {
    const loadBanners = async () => {
      const token = localStorage.getItem('jwt');
      if (!token) {
        setError('Vui lòng đăng nhập để tiếp tục');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      try {
        const result = await bannerService.getAllBanners();
        if (result.success) {
          const mappedBanners = (result.data || []).map(banner => ({
            id: banner.id,
            name: banner.name || '',
            image: banner.image || ''
          }));
          setBanners(mappedBanners);
          if (onBannersChange) {
            onBannersChange(mappedBanners);
          }
        } else {
          setError(result.error);
          if (result.error.includes('đăng nhập') || result.error.includes('hết hạn')) {
            setTimeout(() => {
              window.location.href = '/signin';
            }, 2000);
          }
        }
      } catch (err) {
        setError(err.message || 'Không thể tải danh sách banner');
      } finally {
        setLoading(false);
      }
    };
    loadBanners();
  }, []);

  // Sync with parent banners when they change
  useEffect(() => {
    if (initialBannersList && initialBannersList.length >= 0) {
      if (banners.length === 0 && initialBannersList.length > 0) {
        setBanners(initialBannersList);
      }
    }
  }, [initialBannersList]);

  // Handle image file upload
  const onUploadImage = async (file) => {
    if (!file) {
      setImagePreview('');
      setFormData({ ...formData, imageFile: null, image: '' });
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setValidationErrors({ ...validationErrors, image: 'Vui lòng chọn file ảnh hợp lệ' });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setValidationErrors({ ...validationErrors, image: 'Kích thước ảnh không được vượt quá 5MB' });
      return;
    }

    setUploadingImage(true);
    setValidationErrors({ ...validationErrors, image: null });

    try {
      // Upload to Cloudinary
      const uploadResult = await cloudinaryService.uploadSingle(file);
      
      if (uploadResult.success && uploadResult.url) {
        setFormData({
          ...formData,
          image: uploadResult.url,
          imageFile: file
        });
        setImagePreview(uploadResult.url);
        setValidationErrors({ ...validationErrors, image: null });
      } else {
        setValidationErrors({ ...validationErrors, image: uploadResult.error || 'Không thể upload ảnh' });
      }
    } catch (err) {
      console.error('Error uploading image:', err);
      setValidationErrors({ ...validationErrors, image: err.message || 'Không thể upload ảnh' });
    } finally {
      setUploadingImage(false);
    }
  };

  // Handle form input change
  const handleChange = (e) => {
    const { name, value, files } = e.target;
    
    if (name === 'imageFile' && files && files.length > 0) {
      onUploadImage(files[0]);
    } else {
      setFormData({ ...formData, [name]: value });
      // Clear validation error when user types
      if (validationErrors[name]) {
        setValidationErrors({ ...validationErrors, [name]: null });
      }
    }
  };

  // Validate form
  const validateForm = () => {
    const errors = {};
    
    if (!formData.name || formData.name.trim() === '') {
      errors.name = 'Vui lòng nhập tên banner';
    }
    
    if (!formData.image || formData.image.trim() === '') {
      errors.image = 'Vui lòng upload ảnh banner';
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle save (create or update)
  const handleSave = async () => {
    if (!validateForm()) {
      showNotification('Vui lòng điền đầy đủ thông tin', 'error');
      return;
    }

    setSavingBanner(true);
    setError(null);

    try {
      const bannerData = {
        name: formData.name.trim(),
        image: formData.image.trim()
      };

      let result;
      if (editingBanner) {
        // Update existing banner
        result = await bannerService.updateBanner(editingBanner.id, bannerData);
      } else {
        // Create new banner
        result = await bannerService.createBanner(bannerData);
      }

      if (result.success) {
        // Reload banners
        const reloadResult = await bannerService.getAllBanners();
        if (reloadResult.success) {
          const mappedBanners = (reloadResult.data || []).map(banner => ({
            id: banner.id,
            name: banner.name || '',
            image: banner.image || ''
          }));
          setBanners(mappedBanners);
          if (onBannersChange) {
            onBannersChange(mappedBanners);
          }
        }

        showNotification(
          editingBanner ? 'Cập nhật banner thành công' : 'Tạo banner thành công',
          'success'
        );
        handleCloseModal();
      } else {
        setError(result.error || 'Không thể lưu banner');
        showNotification(result.error || 'Không thể lưu banner', 'error');
      }
    } catch (err) {
      console.error('Error saving banner:', err);
      setError(err.message || 'Không thể lưu banner');
      showNotification(err.message || 'Không thể lưu banner', 'error');
    } finally {
      setSavingBanner(false);
    }
  };

  // Handle edit
  const handleEdit = (banner) => {
    setEditingBanner(banner);
    setFormData({
      name: banner.name || '',
      image: banner.image || '',
      imageFile: null
    });
    setImagePreview(banner.image || '');
    setValidationErrors({});
    setShowModal(true);
  };

  // Handle delete
  const handleDelete = async (bannerId) => {
    setLoading(true);
    setError(null);

    try {
      const result = await bannerService.deleteBanner(bannerId);
      if (result.success) {
        // Reload banners
        const reloadResult = await bannerService.getAllBanners();
        if (reloadResult.success) {
          const mappedBanners = (reloadResult.data || []).map(banner => ({
            id: banner.id,
            name: banner.name || '',
            image: banner.image || ''
          }));
          setBanners(mappedBanners);
          if (onBannersChange) {
            onBannersChange(mappedBanners);
          }
        }

        setDeleteConfirm(null); // Đóng modal sau khi xóa thành công
        showNotification('Xóa banner thành công', 'success');
      } else {
        setDeleteConfirm(null); // Đóng modal khi xóa thất bại
        setError(result.error || 'Không thể xóa banner');
        showNotification(result.error || 'Không thể xóa banner', 'error');
      }
    } catch (err) {
      console.error('Error deleting banner:', err);
      setDeleteConfirm(null); // Đóng modal khi có lỗi
      setError(err.message || 'Không thể xóa banner');
      showNotification(err.message || 'Không thể xóa banner', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Handle close modal
  const handleCloseModal = () => {
    setShowModal(false);
    setEditingBanner(null);
    setFormData({
      name: '',
      image: '',
      imageFile: null
    });
    setImagePreview('');
    setValidationErrors({});
    setError(null);
  };

  // Handle add new
  const handleAddNew = () => {
    setEditingBanner(null);
    setFormData({
      name: '',
      image: '',
      imageFile: null
    });
    setImagePreview('');
    setValidationErrors({});
    setError(null);
    setShowModal(true);
  };

  return (
    <div className="banner-management">
      {/* Notification */}
      {notification && (
        <div className={`banner-notification banner-notification--${notification.type}`}>
          {notification.message}
        </div>
      )}

      {/* Header */}
      <div className="banner-management__header">
        <div className="banner-management__title-section">
          <h2 className="banner-management__title">Quản lý Banner</h2>
          <p className="banner-management__subtitle">
            Quản lý các banner hiển thị trên trang chủ
          </p>
        </div>
        <button
          className="btn btn--primary"
          onClick={handleAddNew}
          disabled={loading}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="5" x2="12" y2="19"/>
            <line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          <span>Thêm Banner</span>
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="banner-management__error">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          <span>{error}</span>
        </div>
      )}

      {/* Loading State */}
      {loading ? (
        <div className="banner-management__loading">
          <div className="spinner"></div>
          <p>Đang tải danh sách banner...</p>
        </div>
      ) : (
        <>
          {/* Banners Grid */}
          {banners.length === 0 ? (
            <div className="banner-management__empty">
              <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                <line x1="9" y1="9" x2="15" y2="15"/>
                <line x1="15" y1="9" x2="9" y2="15"/>
              </svg>
              <h3>Chưa có banner nào</h3>
              <p>Thêm banner mới để hiển thị trên trang chủ</p>
              <button className="btn btn--primary" onClick={handleAddNew}>
                Thêm Banner Đầu Tiên
              </button>
            </div>
          ) : (
            <div className="banner-grid">
              {banners.map((banner) => (
                <div key={banner.id} className="banner-card">
                  <div className="banner-card__image-wrapper">
                    <img 
                      src={banner.image || '/placeholder-banner.jpg'} 
                      alt={`Banner ${banner.id}`}
                      className="banner-card__image"
                      onError={(e) => { e.target.src = '/placeholder-banner.jpg'; }}
                    />
                    <div className="banner-card__overlay">
                      <button
                        className="banner-card__btn banner-card__btn--edit"
                        onClick={() => handleEdit(banner)}
                        title="Chỉnh sửa"
                      >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                        </svg>
                      </button>
                      <button
                        className="banner-card__btn banner-card__btn--delete"
                        onClick={() => setDeleteConfirm(banner.id)}
                        title="Xóa"
                      >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="3 6 5 6 21 6"/>
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                          <line x1="10" y1="11" x2="10" y2="17"/>
                          <line x1="14" y1="11" x2="14" y2="17"/>
                        </svg>
                      </button>
                    </div>
                  </div>
                  <div className="banner-card__info">
                    <span className="banner-card__name">{banner.name || `Banner #${banner.id}`}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content banner-modal" onClick={(e) => e.stopPropagation()}>
            <div className="banner-modal__header">
              <h3 className="banner-modal__title">
                {editingBanner ? 'Chỉnh sửa Banner' : 'Thêm Banner Mới'}
              </h3>
              <button className="modal-close" onClick={handleCloseModal}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>

            <div className="banner-modal__body">
              {/* Name Input */}
              <div className="banner-form-group">
                <label className="banner-form-label">
                  Tên Banner <span className="required">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Nhập tên banner"
                  className="banner-form-input"
                  style={{
                    width: '100%',
                    padding: '12px',
                    border: `1px solid ${validationErrors.name ? '#ff5757' : 'rgba(255,255,255,0.1)'}`,
                    borderRadius: '8px',
                    backgroundColor: 'rgba(20, 15, 16, 0.5)',
                    color: '#fff',
                    fontSize: '14px',
                    outline: 'none',
                    transition: 'border-color 0.3s ease'
                  }}
                />
                {validationErrors.name && (
                  <div className="banner-form-error">{validationErrors.name}</div>
                )}
              </div>

              {/* Image Upload */}
              <div className="banner-form-group">
                <label className="banner-form-label">
                  Ảnh Banner <span className="required">*</span>
                </label>
                <div className="banner-upload-area">
                  {imagePreview ? (
                    <div className="banner-preview">
                      <img src={imagePreview} alt="Banner preview" className="banner-preview__image" />
                      <button
                        type="button"
                        className="banner-preview__remove"
                        onClick={() => {
                          setImagePreview('');
                          setFormData({ ...formData, image: '', imageFile: null });
                        }}
                      >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <line x1="18" y1="6" x2="6" y2="18"/>
                          <line x1="6" y1="6" x2="18" y2="18"/>
                        </svg>
                      </button>
                    </div>
                  ) : (
                    <label className="banner-upload-label">
                      <input
                        type="file"
                        name="imageFile"
                        accept="image/*"
                        onChange={handleChange}
                        className="banner-upload-input"
                        disabled={uploadingImage}
                      />
                      {uploadingImage ? (
                        <div className="banner-upload-loading">
                          <div className="spinner"></div>
                          <span>Đang upload...</span>
                        </div>
                      ) : (
                        <>
                          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                            <polyline points="17 8 12 3 7 8"/>
                            <line x1="12" y1="3" x2="12" y2="15"/>
                          </svg>
                          <span className="banner-upload-text">
                            Nhấn để chọn ảnh hoặc kéo thả ảnh vào đây
                          </span>
                          <span className="banner-upload-hint">JPG, PNG hoặc GIF (tối đa 5MB)</span>
                        </>
                      )}
                    </label>
                  )}
                </div>
                {validationErrors.image && (
                  <div className="banner-form-error">{validationErrors.image}</div>
                )}
              </div>
            </div>

            <div className="banner-modal__footer">
              <button
                className="btn btn--secondary"
                onClick={handleCloseModal}
                disabled={savingBanner}
              >
                Hủy
              </button>
              <button
                className="btn btn--primary"
                onClick={handleSave}
                disabled={savingBanner || uploadingImage || !formData.name || !formData.image}
              >
                {savingBanner ? (
                  <>
                    <div className="spinner spinner--small"></div>
                    <span>Đang lưu...</span>
                  </>
                ) : (
                  <span>{editingBanner ? 'Cập nhật' : 'Tạo mới'}</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmDeleteModal
        isOpen={deleteConfirm !== null}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={() => handleDelete(deleteConfirm)}
        title="Xóa Banner"
        message="Bạn có chắc chắn muốn xóa banner này? Hành động này không thể hoàn tác."
        confirmText="Xóa"
        isDeleting={loading}
      />
    </div>
  );
}

export default BannerManagement;

