import React, { useEffect, useMemo, useState } from 'react';

const SAMPLE_VOUCHERS = [
  {
    voucherId: 101,
    code: 'CSCHOOL45K',
    name: 'C’School | Ưu đãi vé từ 45K',
    description: 'Áp dụng cho học sinh, sinh viên, U22 và giáo viên trên toàn hệ thống.',
    discountType: 'AMOUNT',
    discountValue: 45000,
    minOrderAmount: 45000,
    maxDiscountAmount: 45000,
    startDate: '2025-11-01',
    endDate: '2025-12-31',
    quantity: 1500,
    image: 'https://images.unsplash.com/photo-1607319123379-5525198f977b?q=80&w=1200&auto=format&fit=crop'
  },
  {
    voucherId: 102,
    code: 'POPCORN30',
    name: 'Combo bắp nước 30K',
    description: 'Đặt vé online từ 2 ghế trở lên để nhận ngay voucher bắp nước trị giá 30.000đ.',
    discountType: 'AMOUNT',
    discountValue: 30000,
    minOrderAmount: 50000,
    maxDiscountAmount: 30000,
    startDate: '2025-11-05',
    endDate: '2025-11-30',
    quantity: 800,
    image: 'https://images.unsplash.com/photo-1502139214982-d0ad755818d8?q=80&w=1200&auto=format&fit=crop'
  },
  {
    voucherId: 103,
    code: 'COUPLE20',
    name: 'Movie Night Couple',
    description: 'Giảm 20% khi đặt ghế đôi COUPLE cho các suất chiếu sau 18h thứ 6 hàng tuần.',
    discountType: 'PERCENT',
    discountValue: 20,
    minOrderAmount: 180000,
    maxDiscountAmount: 70000,
    startDate: '2025-11-08',
    endDate: '2026-01-05',
    quantity: 1200,
    image: 'https://images.unsplash.com/photo-1524985069026-dd778a71c7b4?q=80&w=1200&auto=format&fit=crop'
  }
];

const formatCurrency = (value) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);

const formatDiscountBadge = (voucher) =>
  voucher.discountType === 'PERCENT'
    ? `-${voucher.discountValue}%`
    : `-${formatCurrency(voucher.discountValue)}`;

const formatDiscountDetail = (voucher) => {
  if (voucher.discountType === 'PERCENT') {
    return voucher.maxDiscountAmount
      ? `Giảm ${voucher.discountValue}% (tối đa ${formatCurrency(voucher.maxDiscountAmount)})`
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
  const [saved, setSaved] = useState(() => {
    try {
      const raw = localStorage.getItem('savedVouchers');
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  });

  useEffect(() => {
    localStorage.setItem('savedVouchers', JSON.stringify(saved));
  }, [saved]);

  const vouchers = useMemo(() => {
    return SAMPLE_VOUCHERS.map((voucher) => {
      const active = isVoucherActive(voucher);
      const remaining = Math.max(0, voucher.quantity - (saved[voucher.voucherId] ? 1 : 0));
      return {
        ...voucher,
        active,
        remaining,
        daysLeft: getDaysLeft(voucher)
      };
    });
  }, [saved]);

  const handleSave = (voucherId) => {
    setSaved((prev) => ({ ...prev, [voucherId]: true }));
  };

  return (
    <div className="events-page">
      <div className="container">
        <header className="events-hero">
          <div>
            <p className="events-hero__eyebrow">Ưu đãi dành riêng cho bạn</p>
            <h1 className="events-hero__title">Danh sách voucher hiện có</h1>
            <p className="events-hero__subtitle">
              Chọn và lưu các voucher phù hợp để sử dụng nhanh khi đặt vé và nhận ưu đãi ngay lập tức.
            </p>
          </div>
          <a href="#profile" className="events-hero__cta">
            <span className="events-hero__cta-text">Voucher của tôi</span>
            <span className="events-hero__cta-count">{Object.keys(saved).length} voucher đã lưu</span>
          </a>
        </header>

        <section className="voucher-showcase">
          {vouchers.map((voucher) => (
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
                    <span>Loại ưu đãi</span>
                    <strong>{formatDiscountType(voucher.discountType)}</strong>
                  </div>
                  <div className="voucher-meta-chip">
                    <span>Giá trị</span>
                    <strong>{formatDiscountDetail(voucher)}</strong>
                  </div>
                  <div className="voucher-meta-chip">
                    <span>Đơn tối thiểu</span>
                    <strong>{formatCurrency(voucher.minOrderAmount)}</strong>
                  </div>
                  {voucher.discountType === 'PERCENT' && voucher.maxDiscountAmount ? (
                    <div className="voucher-meta-chip">
                      <span>Giảm tối đa</span>
                      <strong>{formatCurrency(voucher.maxDiscountAmount)}</strong>
                    </div>
                  ) : null}
                  <div className="voucher-meta-chip">
                    <span>Thời gian</span>
                    <strong>
                      {new Date(voucher.startDate).toLocaleDateString('vi-VN')} -{' '}
                      {new Date(voucher.endDate).toLocaleDateString('vi-VN')}
                    </strong>
                  </div>
                  <div className="voucher-meta-chip">
                    <span>Trạng thái</span>
                    <strong className={voucher.active ? 'voucher-meta-chip--active' : 'voucher-meta-chip--inactive'}>
                      {voucher.active ? 'Đang diễn ra' : 'Hết hạn'}
                    </strong>
                  </div>
                  <div className="voucher-meta-chip">
                    <span>Số lượng còn</span>
                    <strong>{voucher.remaining}</strong>
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
                    className={`btn ${saved[voucher.voucherId] ? 'btn--ghost' : 'btn--primary'}`}
                    disabled={!voucher.active || saved[voucher.voucherId]}
                    onClick={() => handleSave(voucher.voucherId)}
                  >
                    {saved[voucher.voucherId] ? 'Đã lưu voucher' : 'Lưu voucher'}
                  </button>
                </footer>
              </div>
            </article>
          ))}
        </section>
      </div>
    </div>
  );
}
