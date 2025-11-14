import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header.jsx';
import Footer from '../components/Footer.jsx';

// Get saved vouchers from localStorage
const getSavedVouchers = () => {
  try {
    const saved = localStorage.getItem('savedVouchers');
    if (saved) {
      const savedIds = JSON.parse(saved);
      const allVouchers = localStorage.getItem('adminVouchers');
      if (allVouchers) {
        const vouchers = JSON.parse(allVouchers);
        // savedIds is an object like {voucherId: true}, so check if the voucherId exists as a key
        return vouchers.filter(v => savedIds[v.voucherId] === true && v.isPublic && v.status);
      }
    }
  } catch (e) {
    console.error('Failed to load saved vouchers', e);
  }
  return [];
};

const isVoucherActive = (voucher) => {
  const now = Date.now();
  const start = new Date(voucher.startDate).getTime();
  const end = new Date(voucher.endDate + 'T23:59:59').getTime();
  return now >= start && now <= end;
};

const formatCurrency = (value) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);

const formatDiscountBadge = (voucher) =>
  voucher.discountType === 'PERCENT'
    ? `-${voucher.discountValue}%`
    : `-${formatCurrency(voucher.discountValue)}`;

export default function Checkout() {
  const navigate = useNavigate();
  const [cartData, setCartData] = useState(null);
  const [bookingData, setBookingData] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('vnpay');
  const [selectedVoucher, setSelectedVoucher] = useState(null);
  const [availableVouchers, setAvailableVouchers] = useState([]);
  const [showVoucherList, setShowVoucherList] = useState(false);
  
  // Sample customer data (would come from database/auth in real app)
  const customerInfo = {
    name: 'Nguyễn Văn A',
    phone: '0909000001',
    email: 'nguyenvana@example.com'
  };

  useEffect(() => {
    const savedCart = localStorage.getItem('checkoutCart');
    const savedBooking = localStorage.getItem('pendingBooking');
    
    if (savedCart) {
      setCartData(JSON.parse(savedCart));
    }
    if (savedBooking) {
      setBookingData(JSON.parse(savedBooking));
    }
    
    // Load available vouchers
    const vouchers = getSavedVouchers();
    setAvailableVouchers(vouchers.filter(v => isVoucherActive(v)));
    
    // Redirect back if no cart and no booking
    if (!savedCart && !savedBooking) {
      navigate('/food-drinks');
    }
  }, [navigate]);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Here you would process the payment
    alert('Đặt hàng thành công!');
    localStorage.removeItem('checkoutCart');
    localStorage.removeItem('pendingBooking');
    navigate('/orders');
  };

  const getSubtotal = () => {
    const foodTotal = cartData?.totalAmount || 0;
    const ticketTotal = bookingData?.totalPrice || 0;
    return foodTotal + ticketTotal;
  };

  const calculateDiscount = (voucher, subtotal) => {
    if (!voucher || subtotal < (voucher.minOrder || voucher.minOrderAmount || 0)) {
      return 0;
    }

    if (voucher.discountType === 'PERCENT') {
      const discount = (subtotal * voucher.discountValue) / 100;
      const maxDiscount = voucher.maxDiscount || voucher.maxDiscountAmount || Infinity;
      return Math.min(discount, maxDiscount);
    } else {
      return Math.min(voucher.discountValue, subtotal);
    }
  };

  const getDiscountAmount = () => {
    if (!selectedVoucher) return 0;
    return calculateDiscount(selectedVoucher, getSubtotal());
  };

  const getTotalAmount = () => {
    const subtotal = getSubtotal();
    const discount = getDiscountAmount();
    return Math.max(0, subtotal - discount);
  };

  const handleVoucherSelect = (voucher) => {
    if (selectedVoucher?.voucherId === voucher.voucherId) {
      setSelectedVoucher(null);
    } else {
      setSelectedVoucher(voucher);
    }
  };

  if (!cartData && !bookingData) {
    return (
      <div className="min-h-screen cinema-mood">
        <Header />
        <main className="main">
          <section className="section">
            <div className="container">
              <div className="flex items-center justify-center py-20">
                <p className="text-[#c9c4c5]">Đang tải...</p>
              </div>
            </div>
          </section>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen cinema-mood">
      <Header />

      <main className="main">
        <section className="section">
          <div className="container max-w-7xl mx-auto px-4 py-8">
            {/* Header */}
            <div className="flex items-center gap-3 mb-8">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#ffd159]">
                <path d="M20 7h-4M4 7h4m0 0V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m-6 0v12m6-12v12M4 7v12"/>
              </svg>
              <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
                Thanh toán
              </h1>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column - Customer Info */}
              <div className="lg:col-span-2 space-y-6">
                {/* Customer Information Card */}
                <div className="bg-gradient-to-br from-[#2d2627] to-[#1a1415] border border-[#4a3f41] rounded-xl p-6">
                  <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[#ffd159]">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                      <circle cx="12" cy="7" r="4"/>
                    </svg>
                    Thông tin khách hàng
                  </h2>
                  <div className="space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-4 border-b border-[#4a3f41]">
                      <span className="text-sm font-medium text-[#c9c4c5]">Họ và tên:</span>
                      <span className="text-white font-semibold">{customerInfo.name}</span>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-4 border-b border-[#4a3f41]">
                      <span className="text-sm font-medium text-[#c9c4c5]">Số điện thoại:</span>
                      <span className="text-white font-semibold">{customerInfo.phone}</span>
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <span className="text-sm font-medium text-[#c9c4c5]">Email:</span>
                      <span className="text-white font-semibold">{customerInfo.email}</span>
                    </div>
                  </div>
                </div>

                {/* Voucher Selection Card */}
                <div className="bg-gradient-to-br from-[#2d2627] to-[#1a1415] border border-[#4a3f41] rounded-xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[#ffd159]">
                        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
                        <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
                        <line x1="12" y1="22.08" x2="12" y2="12"/>
                      </svg>
                      Voucher
                    </h2>
                    {!selectedVoucher && availableVouchers.length > 0 && (
                      <button
                        onClick={() => setShowVoucherList(!showVoucherList)}
                        className="checkout-voucher-toggle-btn"
                      >
                        {showVoucherList ? 'Ẩn voucher' : 'Thêm voucher'}
                        <svg 
                          width="16" 
                          height="16" 
                          viewBox="0 0 24 24" 
                          fill="none" 
                          stroke="currentColor" 
                          strokeWidth="2"
                          style={{ transform: showVoucherList ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 300ms ease' }}
                        >
                          <polyline points="6 9 12 15 18 9"></polyline>
                        </svg>
                      </button>
                    )}
                  </div>

                  {/* Selected Voucher Display */}
                  {selectedVoucher && (
                    <div className="checkout-voucher-selected">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <span className="checkout-voucher-item__badge">{formatDiscountBadge(selectedVoucher)}</span>
                          <div className="flex-1 min-w-0">
                            <div className="checkout-voucher-item__code">{selectedVoucher.code}</div>
                            <div className="checkout-voucher-item__name text-sm">{selectedVoucher.name}</div>
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            setSelectedVoucher(null);
                            setShowVoucherList(false);
                          }}
                          className="checkout-voucher-remove-btn"
                          title="Bỏ chọn voucher"
                        >
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="18" y1="6" x2="6" y2="18"/>
                            <line x1="6" y1="6" x2="18" y2="18"/>
                          </svg>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Voucher List */}
                  {showVoucherList && availableVouchers.length > 0 && (
                    <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2 mt-4">
                      {availableVouchers.map((voucher) => {
                        const isSelected = selectedVoucher?.voucherId === voucher.voucherId;
                        const canUse = getSubtotal() >= (voucher.minOrder || voucher.minOrderAmount || 0);
                        return (
                          <div
                            key={voucher.voucherId}
                            onClick={() => {
                              if (canUse) {
                                handleVoucherSelect(voucher);
                                setShowVoucherList(false);
                              }
                            }}
                            className={`checkout-voucher-item ${isSelected ? 'checkout-voucher-item--selected' : ''} ${!canUse ? 'checkout-voucher-item--disabled' : ''}`}
                            style={{ cursor: canUse ? 'pointer' : 'not-allowed' }}
                          >
                            <div className="flex items-start gap-3">
                              <div className="checkout-voucher-item__radio">
                                <input
                                  type="radio"
                                  checked={isSelected}
                                  onChange={() => {}}
                                  disabled={!canUse}
                                />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="checkout-voucher-item__badge">{formatDiscountBadge(voucher)}</span>
                                  <span className="checkout-voucher-item__code">{voucher.code}</span>
                                </div>
                                <div className="checkout-voucher-item__name">{voucher.name}</div>
                                {!canUse && (
                                  <div className="checkout-voucher-item__warning text-xs text-[#ff5258] mt-1">
                                    Đơn tối thiểu: {formatCurrency(voucher.minOrder || voucher.minOrderAmount || 0)}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {availableVouchers.length === 0 && (
                    <div className="text-center py-4 text-[#c9c4c5] text-sm">
                      Bạn chưa có voucher nào. <a href="/events" className="text-[#ffd159] hover:underline">Xem voucher</a>
                    </div>
                  )}
                </div>

                {/* Payment Method Card */}
                <div className="bg-gradient-to-br from-[#2d2627] to-[#1a1415] border border-[#4a3f41] rounded-xl p-6">
                  <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[#ffd159]">
                      <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
                      <line x1="1" y1="10" x2="23" y2="10"/>
                    </svg>
                    Phương thức thanh toán
                  </h2>
                  <div className="checkout-payment-methods">
                    <label className="checkout-payment-method">
                      <input
                        type="radio"
                        name="payment"
                        value="vnpay"
                        checked={paymentMethod === 'vnpay'}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                      />
                      <div className="checkout-payment-method__content">
                        <span>VNPay</span>
                      </div>
                    </label>
                    <label className="checkout-payment-method">
                      <input
                        type="radio"
                        name="payment"
                        value="momo"
                        checked={paymentMethod === 'momo'}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                      />
                      <div className="checkout-payment-method__content">
                        <span>MoMo</span>
                      </div>
                    </label>
                    <label className="checkout-payment-method">
                      <input
                        type="radio"
                        name="payment"
                        value="cash"
                        checked={paymentMethod === 'cash'}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                      />
                      <div className="checkout-payment-method__content">
                        <span>Tiền mặt</span>
                      </div>
                    </label>
                  </div>
                </div>
              </div>

              {/* Right Column - Order Summary */}
              <div className="lg:col-span-1">
                <div className="bg-gradient-to-br from-[#2d2627] to-[#1a1415] border border-[#4a3f41] rounded-xl p-6 sticky top-6">
                  <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[#ffd159]">
                      <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/>
                      <path d="M3 6h18"/>
                      <path d="M16 10a4 4 0 0 1-8 0"/>
                    </svg>
                    Đơn hàng
                  </h2>
                  
                  {/* Cinema Info */}
                  <div className="flex items-center gap-2 mb-6 pb-4 border-b border-[#4a3f41]">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[#ffd159] flex-shrink-0">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                      <circle cx="12" cy="10" r="3"/>
                    </svg>
                    <span className="text-sm text-white font-medium">
                      {bookingData?.cinemaName || (cartData?.cinema ? `Cinestar ${cartData.cinema.name} (${cartData.cinema.province})` : 'Chưa chọn rạp')}
                    </span>
                  </div>

                  {/* Order Items */}
                  <div className="space-y-4 mb-6 max-h-[400px] overflow-y-auto pr-2">
                    {/* Movie Tickets */}
                    {bookingData && (
                      <div>
                        <div className="text-sm font-semibold text-white mb-3">Vé phim</div>
                        <div className="bg-[#1a1415] rounded-lg p-4 border border-[#4a3f41]">
                          <div className="flex justify-between items-start gap-4">
                            <div className="flex-1 min-w-0">
                              <div className="text-white font-semibold mb-1 truncate">{bookingData.movieTitle || 'Vé xem phim'}</div>
                              <div className="text-xs text-[#c9c4c5] mb-1">
                                {bookingData.room?.roomName} • {bookingData.room?.roomType}
                                {bookingData.showtime && (
                                  <> • {new Date(bookingData.showtime.startTime).toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}</>
                                )}
                              </div>
                              <div className="text-xs text-[#c9c4c5]">
                                Ghế: {bookingData.seats?.join(', ')}
                              </div>
                            </div>
                            <div className="text-[#ffd159] font-bold whitespace-nowrap">
                              {formatPrice(bookingData.totalPrice || 0)}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Food & Drinks */}
                    {cartData && cartData.items && cartData.items.length > 0 && (
                      <div>
                        {bookingData && <div className="text-sm font-semibold text-white mb-3 mt-4">Đồ ăn nước uống</div>}
                        <div className="space-y-3">
                          {cartData.items.map((item) => (
                            <div key={item.id} className="bg-[#1a1415] rounded-lg p-3 border border-[#4a3f41] flex items-center gap-3">
                              <div className="w-12 h-12 rounded-lg overflow-hidden flex-shrink-0">
                                <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="text-white font-medium text-sm truncate">{item.name}</div>
                                <div className="text-xs text-[#c9c4c5]">
                                  {formatPrice(item.price)} x {item.quantity}
                                </div>
                              </div>
                              <div className="text-[#ffd159] font-bold text-sm whitespace-nowrap">
                                {formatPrice(item.price * item.quantity)}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Price Breakdown */}
                  <div className="pt-4 border-t border-[#4a3f41] mb-6 space-y-3">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-[#c9c4c5]">Tạm tính:</span>
                      <span className="text-white font-semibold">{formatPrice(getSubtotal())}</span>
                    </div>
                    {selectedVoucher && (
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-[#c9c4c5]">Giảm giá ({selectedVoucher.code}):</span>
                        <span className="text-[#4caf50] font-semibold">-{formatPrice(getDiscountAmount())}</span>
                      </div>
                    )}
                    <div className="flex justify-between items-center pt-2 border-t border-[#4a3f41]">
                      <span className="text-lg font-semibold text-white">Tổng cộng:</span>
                      <span className="text-2xl font-extrabold text-[#ffd159]">{formatPrice(getTotalAmount())}</span>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button 
                    className="w-full bg-gradient-to-r from-[#e83b41] to-[#ff5258] hover:from-[#ff5258] hover:to-[#ff6b6b] text-white font-bold py-4 px-6 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] uppercase tracking-wide"
                    onClick={handleSubmit}
                  >
                    Xác nhận thanh toán
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

