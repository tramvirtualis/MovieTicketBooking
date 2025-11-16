import React, { useEffect, useMemo, useState } from 'react';
import Header from '../components/Header.jsx';
import { customerVoucherService } from '../services/customerVoucherService';
import { voucherService } from '../services/voucherService';

// Helper to get public vouchers from API
const getPublicVouchers = async () => {
  try {
    const result = await voucherService.getPublicVouchers();
    if (result.success && result.data) {
      // Map vouchers from backend format
      const mappedVouchers = (result.data || []).map(v => ({
        voucherId: v.voucherId,
        code: v.code,
        name: v.name,
        description: v.description || '',
        discountType: v.discountType === 'VALUE' ? 'AMOUNT' : v.discountType,
        discountValue: v.discountValue,
        minOrder: v.minOrderAmount || 0,
        minOrderAmount: v.minOrderAmount || 0,
        maxDiscount: v.maxDiscountAmount || 0,
        maxDiscountAmount: v.maxDiscountAmount || 0,
        startDate: v.startDate ? v.startDate.split('T')[0] : '',
        endDate: v.endDate ? v.endDate.split('T')[0] : '',
        isPublic: v.scope === 'PUBLIC',
        image: v.image || '',
      }));
      // All vouchers from public endpoint are already PUBLIC, but filter just in case
      return mappedVouchers.filter(v => v.isPublic);
    }
  } catch (e) {
    console.error('Failed to load vouchers from API', e);
  }
  return [];
};

const formatCurrency = (value) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);

const formatDiscountBadge = (voucher) =>
  voucher.discountType === 'PERCENT'
    ? `-${voucher.discountValue}%`
    : `-${formatCurrency(voucher.discountValue)}`;

const formatDiscountDetail = (voucher) => {
  if (voucher.discountType === 'PERCENT') {
    return voucher.maxDiscount || voucher.maxDiscountAmount
      ? `Giảm ${voucher.discountValue}% (tối đa ${formatCurrency(voucher.maxDiscount || voucher.maxDiscountAmount)})`
      : `Giảm ${voucher.discountValue}%`;
  }
  return `Giảm trực tiếp ${formatCurrency(voucher.discountValue)}`;
};

const formatDiscountType = (type) => {
  if (type === 'PERCENT') return 'Giảm theo %';
  if (type === 'AMOUNT') return 'Giảm theo số tiền';
  return type;
};

const isVoucherActive = (voucher) => {
  const now = Date.now();
  const start = new Date(voucher.startDate).getTime();
  const end = new Date(voucher.endDate + 'T23:59:59').getTime();
  return now >= start && now <= end;
};

const getDaysLeft = (voucher) => {
  const end = new Date(voucher.endDate + 'T23:59:59').getTime();
  return Math.max(0, Math.ceil((end - Date.now()) / (1000 * 60 * 60 * 24)));
};

export default function Events() {
  const [vouchers, setVouchers] = useState([]);
  const [savedVouchers, setSavedVouchers] = useState(new Set()); // Set of voucher IDs that user has saved
  const [loading, setLoading] = useState(true);
  const [savingVoucherId, setSavingVoucherId] = useState(null);

  // Load public vouchers and user's saved vouchers
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        console.log('Events: Loading public vouchers...');
        // Load public vouchers
        const publicVouchers = await getPublicVouchers();
        console.log('Events: Public vouchers loaded:', publicVouchers);
        
        // Load user's saved vouchers if logged in
        const token = localStorage.getItem('jwt');
        let savedSet = new Set();
        if (token) {
          try {
            const savedResult = await customerVoucherService.getUserVouchers();
            if (savedResult.success && savedResult.data) {
              savedSet = new Set(savedResult.data.map(v => v.voucherId));
              console.log('Events: Saved vouchers loaded:', savedSet.size);
            }
          } catch (error) {
            console.error('Error loading saved vouchers:', error);
          }
        }

        setSavedVouchers(savedSet);

        // Map vouchers with status
        const mappedVouchers = publicVouchers.map((voucher) => {
          const active = isVoucherActive(voucher);
          return {
            ...voucher,
            active,
            daysLeft: getDaysLeft(voucher)
          };
        });

        console.log('Events: Mapped vouchers:', mappedVouchers.length);
        setVouchers(mappedVouchers);
      } catch (error) {
        console.error('Error loading vouchers:', error);
        setVouchers([]);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleSave = async (voucherId) => {
    const token = localStorage.getItem('jwt');
    if (!token) {
      alert('Vui lòng đăng nhập để lưu voucher');
      window.location.href = '/signin';
      return;
    }

    if (savedVouchers.has(voucherId)) {
      return; // Already saved
    }

    setSavingVoucherId(voucherId);
    try {
      console.log('Events: Saving voucher:', voucherId);
      const result = await customerVoucherService.saveVoucher(voucherId);
      console.log('Events: Save result:', result);
      
      if (result.success) {
        setSavedVouchers(prev => new Set([...prev, voucherId]));
        // Reload saved vouchers to ensure consistency
        try {
          const savedResult = await customerVoucherService.getUserVouchers();
          if (savedResult.success && savedResult.data) {
            setSavedVouchers(new Set(savedResult.data.map(v => v.voucherId)));
          }
        } catch (reloadError) {
          console.error('Error reloading saved vouchers:', reloadError);
        }
      } else {
        const errorMsg = result.error || 'Không thể lưu voucher';
        console.error('Save failed:', errorMsg);
        alert(errorMsg);
      }
    } catch (error) {
      console.error('Error saving voucher:', error);
      const errorMsg = error.response?.data?.message || error.message || 'Không thể lưu voucher';
      alert(errorMsg);
    } finally {
      setSavingVoucherId(null);
    }
  };

  return (
    <div className="events-page">
      <Header />
      <div className="container">
        <header className="events-hero">
          <div>
            <p className="events-hero__eyebrow">Ưu đãi dành riêng cho bạn</p>
            <h1 className="events-hero__title">Danh sách voucher hiện có</h1>
            <p className="events-hero__subtitle">
              Chọn và lưu các voucher phù hợp để sử dụng nhanh khi đặt vé và nhận ưu đãi ngay lập tức.
            </p>
          </div>
          <a href="/profile?tab=vouchers" className="events-hero__cta">
            <span className="events-hero__cta-text">Voucher của tôi</span>
            <span className="events-hero__cta-count">{savedVouchers.size} voucher đã lưu</span>
          </a>
        </header>

        <section className="voucher-showcase">
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#e83b41] mb-4"></div>
              <p className="text-[#c9c4c5]">Đang tải voucher...</p>
            </div>
          ) : vouchers.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-[#c9c4c5] text-lg">Không có voucher nào</p>
            </div>
          ) : (
            vouchers.map((voucher) => {
              const isSaved = savedVouchers.has(voucher.voucherId);
              const isSaving = savingVoucherId === voucher.voucherId;
              
              return (
                <article key={voucher.voucherId} className="voucher-panel">
                  <div className="voucher-panel__media">
                    <img src={voucher.image} alt={voucher.name} />
                    <span className="voucher-panel__badge">{formatDiscountBadge(voucher)}</span>
                  </div>

                  <div className="voucher-panel__content">
                    <div className="voucher-panel__header">
                      <h2 className="voucher-panel__title">{voucher.name}</h2>
                      <p className="voucher-panel__description">{voucher.description}</p>
                    </div>

                    <div className="voucher-panel__meta">
                      <div className="voucher-meta-chip">
                        <span>Mã voucher</span>
                        <strong>{voucher.code}</strong>
                      </div>
                      <div className="voucher-meta-chip">
                        <span>Giá trị</span>
                        <strong>{formatDiscountDetail(voucher)}</strong>
                      </div>
                      <div className="voucher-meta-chip">
                        <span>Đơn tối thiểu</span>
                        <strong>{formatCurrency(voucher.minOrder || voucher.minOrderAmount || 0)}</strong>
                      </div>
                      <div className="voucher-meta-chip">
                        <span>Thời gian</span>
                        <strong>
                          {new Date(voucher.startDate).toLocaleDateString('vi-VN')} -{' '}
                          {new Date(voucher.endDate).toLocaleDateString('vi-VN')}
                        </strong>
                      </div>
                    </div>

                    <footer className="voucher-panel__footer">
                      <div className="voucher-panel__footer-info">
                        <span className="voucher-panel__code">{voucher.code}</span>
                        <span className="voucher-panel__days">
                          {voucher.active ? `${voucher.daysLeft} ngày còn lại` : 'Đã hết hạn'}
                        </span>
                      </div>
                      <button
                        className={`btn ${isSaved ? 'btn--ghost' : 'btn--primary'}`}
                        disabled={!voucher.active || isSaved || isSaving}
                        onClick={() => handleSave(voucher.voucherId)}
                      >
                        {isSaving ? 'Đang lưu...' : isSaved ? 'Đã lưu voucher' : 'Lưu voucher'}
                      </button>
                    </footer>
                  </div>
                </article>
              );
            })
          )}
        </section>
      </div>
    </div>
  );
}
