import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header.jsx';
import Footer from '../components/Footer.jsx';
import { customerVoucherService } from '../services/customerVoucherService.js';
import { paymentService } from '../services/paymentService.js';
import { websocketService } from '../services/websocketService';
import { walletService } from '../services/walletService.js';

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

const formatDiscountBadge = (voucher) => {
  // Handle both old format (discountValue) and new format (discount, discountPercent)
  const discountType = voucher.discountType || (voucher.discountPercent > 0 ? 'PERCENT' : 'AMOUNT');
  const discountValue = voucher.discountType === 'PERCENT'
    ? (voucher.discountValue || voucher.discountPercent || 0)
    : (voucher.discountValue || voucher.discount || 0);

  return discountType === 'PERCENT'
    ? `-${discountValue}%`
    : `-${formatCurrency(discountValue)}`;
};

export default function Checkout() {
  const navigate = useNavigate();
  const [cartData, setCartData] = useState(null);
  const [bookingData, setBookingData] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('MOMO');
  const [selectedVoucher, setSelectedVoucher] = useState(null);
  const [availableVouchers, setAvailableVouchers] = useState([]);
  const [showVoucherList, setShowVoucherList] = useState(false);
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    phone: '',
    email: ''
  });
  const [loadingVouchers, setLoadingVouchers] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false); // Prevent double submission
  const isRedirectingToPayment = useRef(false); // Track if redirecting to payment gateway
  const [walletBalance, setWalletBalance] = useState(null);
  const [loadingWallet, setLoadingWallet] = useState(false);

  useEffect(() => {
    const savedCart = localStorage.getItem('checkoutCart');
    const savedBooking = localStorage.getItem('pendingBooking');

    if (savedCart) {
      setCartData(JSON.parse(savedCart));
    }
    // Chỉ set bookingData nếu thực sự có booking (có showtimeId và seats)
    // Nếu chỉ có cart (đồ ăn) mà không có booking hợp lệ, thì không set bookingData
    if (savedBooking) {
      try {
        const booking = JSON.parse(savedBooking);
        console.log('Loaded booking from localStorage:', booking);
        // Kiểm tra nếu có showtimeId (từ bookingInfo mới) hoặc showtime.showtimeId (từ bookingInfo cũ)
        const showtimeId = booking.showtimeId || booking.showtime?.showtimeId;
        // Chỉ set nếu có showtimeId và seats (tức là có đặt vé phim)
        if (showtimeId && booking.seats && Array.isArray(booking.seats) && booking.seats.length > 0) {
          // Đảm bảo showtimeId được set nếu chưa có
          if (!booking.showtimeId && booking.showtime?.showtimeId) {
            booking.showtimeId = booking.showtime.showtimeId;
          }
          console.log('Setting bookingData with showtimeId:', booking.showtimeId, 'seats:', booking.seats);
          setBookingData(booking);
        } else {
          console.warn('Booking không hợp lệ - showtimeId:', showtimeId, 'seats:', booking.seats);
          // Xóa pendingBooking nếu không hợp lệ (không có seats hoặc không có showtimeId)
          // Đây có thể là dữ liệu cũ từ lần đặt vé trước, cần xóa để tránh nhầm lẫn
          localStorage.removeItem('pendingBooking');
          console.log('Removed invalid pendingBooking from localStorage');
        }
      } catch (e) {
        console.error('Failed to parse booking data:', e);
        localStorage.removeItem('pendingBooking');
      }
    } else {
      // Không có savedBooking -> chỉ có đồ ăn, đảm bảo bookingData là null
      console.log('No savedBooking found - food-only order');
      setBookingData(null);
    }

    // Load customer info from localStorage (saved when login)
    const userData = localStorage.getItem('user');
    if (userData) {
      try {
        const user = JSON.parse(userData);
        setCustomerInfo({
          name: user.name || '',
          phone: user.phone || '',
          email: user.email || ''
        });
      } catch (e) {
        console.error('Failed to parse user data:', e);
      }
    }

    // Load vouchers from database
    loadVouchersFromDatabase();

    // Load wallet balance
    loadWalletBalance();

    // Redirect back if no cart and no booking
    if (!savedCart && !savedBooking) {
      navigate('/food-drinks');
    }
  }, [navigate]);

  // Cleanup effect: Release seats if leaving page without paying
  useEffect(() => {
    // Connect WebSocket if needed (to ensure we can send DESELECT)
    if (bookingData?.showtimeId && !websocketService.getConnectionStatus()) {
      websocketService.connectForSeats();
    }

    return () => {
      // If NOT redirecting to payment gateway AND we have booked seats
      if (!isRedirectingToPayment.current && bookingData?.seats && bookingData.showtimeId) {
        console.log('[Checkout] Leaving page without payment, releasing seats:', bookingData.seats);

        // Send DESELECT for each seat
        bookingData.seats.forEach(seatId => {
          if (websocketService.getConnectionStatus()) {
            websocketService.sendSeatSelection(bookingData.showtimeId, seatId, 'DESELECT');
          }
        });
      }
    };
  }, [bookingData]);

  const loadVouchersFromDatabase = async () => {
    setLoadingVouchers(true);
    try {
      const response = await customerVoucherService.getUserVouchers();
      if (response.success && response.data) {
        // Filter only active vouchers
        const activeVouchers = response.data.filter(v => {
          const now = new Date();
          const start = v.startDate ? new Date(v.startDate) : null;
          const end = v.expiryDate ? new Date(v.expiryDate + 'T23:59:59') : null;
          return (!start || now >= start) && (!end || now <= end);
        });
        setAvailableVouchers(activeVouchers);
      } else {
        setAvailableVouchers([]);
      }
    } catch (error) {
      console.error('Error loading vouchers:', error);
      setAvailableVouchers([]);
    } finally {
      setLoadingVouchers(false);
    }
  };

  const loadWalletBalance = async () => {
    setLoadingWallet(true);
    try {
      const wallet = await walletService.getWallet();
      setWalletBalance(wallet.balance);
    } catch (error) {
      console.error('Error loading wallet balance:', error);
      setWalletBalance(null);
    } finally {
      setLoadingWallet(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(price);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    // Prevent double submission - disable button ngay lập tức
    if (isSubmitting) {
      console.log('Payment is already being processed, please wait...');
      return;
    }

    const totalAmount = getTotalAmount();

    if (totalAmount <= 0) {
      alert('Số tiền thanh toán không hợp lệ.');
      return;
    }

    // Kiểm tra số dư ví nếu thanh toán bằng ví Cinesmart
    if (paymentMethod === 'WALLET') {
      if (walletBalance === null) {
        alert('Không thể tải số dư ví. Vui lòng thử lại.');
        return;
      }
      if (walletBalance < totalAmount) {
        alert(`Số dư ví Cinesmart không đủ. Số dư hiện tại: ${formatPrice(walletBalance)}. Vui lòng nạp thêm ${formatPrice(totalAmount - walletBalance)}.`);
        return;
      }
    }

    // Set submitting state NGAY LẬP TỨC để lock button
    setIsSubmitting(true);

    // Disable button ngay lập tức
    const submitButton = document.querySelector('button[type="submit"]');
    if (submitButton) {
      submitButton.disabled = true;
      submitButton.style.opacity = '0.6';
      submitButton.style.cursor = 'not-allowed';
    }

    // Thanh toán qua ZaloPay
    if (paymentMethod === 'ZALOPAY') {
      try {
        const orderId = `ORDER-${Date.now()}`;
        const description = bookingData?.movieTitle
          ? `Vé xem phim: ${bookingData.movieTitle}`
          : 'Thanh toán vé xem phim';

        // Đảm bảo totalAmount là số nguyên
        const amount = Math.round(totalAmount);

        // Chuẩn bị booking info để gửi lên server
        // CHỈ gửi booking info nếu thực sự có đặt vé phim (có showtimeId và seats)
        const hasValidBooking = bookingData &&
          bookingData.showtimeId &&
          bookingData.seats &&
          Array.isArray(bookingData.seats) &&
          bookingData.seats.length > 0;

        console.log('Checkout - hasValidBooking:', hasValidBooking);
        console.log('Checkout - bookingData:', bookingData);
        console.log('Checkout - cartData:', cartData);

        // Tạo bookingInfo - CHỈ thêm showtimeId và seatIds nếu có đặt vé phim
        const bookingInfo = {};

        if (hasValidBooking) {
          // Có đặt vé phim -> gửi showtimeId và seatIds
          bookingInfo.showtimeId = bookingData.showtimeId;
          bookingInfo.seatIds = bookingData.seats;
          console.log('Checkout - Adding showtimeId and seatIds to bookingInfo');
        } else {
          // Chỉ có đồ ăn -> KHÔNG gửi showtimeId và seatIds
          // NHƯNG cần gửi cinemaComplexId để xác định rạp
          if (cartData?.cinema?.complexId) {
            bookingInfo.cinemaComplexId = cartData.cinema.complexId;
            console.log('Checkout - Food-only order, adding cinemaComplexId:', bookingInfo.cinemaComplexId);
          } else {
            console.warn('Checkout - Food-only order but no cinemaComplexId found in cartData');
          }
        }

        // Luôn gửi foodCombos và voucherCode
        bookingInfo.foodCombos = cartData?.items?.map(item => ({
          foodComboId: item.id?.replace('fc_', '') || item.foodComboId,
          quantity: item.quantity || 1
        })) || [];
        bookingInfo.voucherCode = selectedVoucher?.code || null;

        console.log('Creating ZaloPay order:', {
          amount,
          description,
          orderId,
          bookingInfo,
          hasShowtimeId: 'showtimeId' in bookingInfo,
          showtimeIdValue: bookingInfo.showtimeId,
          hasSeatIds: 'seatIds' in bookingInfo
        });

        const result = await paymentService.createZaloPayOrder(
          amount,
          description,
          orderId,
          bookingInfo
        );

        console.log('ZaloPay order result:', result);

        if (result.success && result.data?.payment_url) {
          console.log('Redirecting to ZaloPay:', result.data.payment_url);
          // Set flag to prevent seat release
          isRedirectingToPayment.current = true;
          // Redirect đến ZaloPay payment page
          window.location.href = result.data.payment_url;
        } else {
          // Hiển thị lỗi chi tiết từ backend
          const errorMsg = result.error || result.message || 'Không thể tạo đơn hàng thanh toán';
          console.error('ZaloPay error:', result);

          // Nếu là duplicate order, hiển thị thông báo đặc biệt
          if (result.message && result.message.includes('đang được xử lý')) {
            alert('Đơn hàng đang được xử lý. Vui lòng đợi và không nhấn lại nút thanh toán.');
          } else {
            alert('Lỗi thanh toán ZaloPay: ' + errorMsg);
          }
          setIsSubmitting(false);
        }
      } catch (error) {
        console.error('Error creating ZaloPay order:', error);
        alert('Có lỗi xảy ra khi tạo đơn hàng thanh toán');
        // Re-enable button
        const submitButton = document.querySelector('button[type="submit"]');
        if (submitButton) {
          submitButton.disabled = false;
          submitButton.style.opacity = '1';
          submitButton.style.cursor = 'pointer';
        }
        setIsSubmitting(false);
      }
      return;
    }

    // Thanh toán qua MoMo
    if (paymentMethod === 'MOMO') {
      try {
        // Chỉ gửi showtimeId và seatIds nếu thực sự có đặt vé phim
        const hasValidBooking = bookingData &&
          bookingData.showtimeId &&
          bookingData.seats &&
          Array.isArray(bookingData.seats) &&
          bookingData.seats.length > 0;

        const payload = {
          amount: totalAmount,
          voucherId: selectedVoucher?.voucherId || null,
          voucherCode: selectedVoucher?.code || null,
          orderDescription: 'Thanh toán đơn hàng tại Cinesmart',
          // CHỈ gửi showtimeId và seatIds nếu có đặt vé phim
          showtimeId: hasValidBooking ? bookingData.showtimeId : null,
          seatIds: hasValidBooking ? bookingData.seats : [],
          // Nếu chỉ có đồ ăn, gửi cinemaComplexId để xác định rạp
          cinemaComplexId: !hasValidBooking && cartData?.cinema?.complexId ? cartData.cinema.complexId : null,
          foodCombos: cartData?.items?.map(item => ({
            foodComboId: item.id?.replace('fc_', '') || item.foodComboId,
            quantity: item.quantity || 1
          })) || []
        };

        const response = await paymentService.createMomoPayment(payload);
        if (response.success && response.data?.paymentUrl) {
          // Set flag to prevent seat release
          isRedirectingToPayment.current = true;
          // Redirect đến MoMo payment page - KHÔNG reset isSubmitting vì đang redirect
          window.location.href = response.data.paymentUrl;
          return; // Exit early để không reset state
        } else {
          // Nếu là duplicate order, hiển thị thông báo đặc biệt
          if (response.message && response.message.includes('đang được xử lý')) {
            alert('Đơn hàng đang được xử lý. Vui lòng đợi và không nhấn lại nút thanh toán.');
          } else {
            alert(response.message || 'Không thể khởi tạo thanh toán MoMo. Vui lòng thử lại.');
          }
          // Re-enable button
          const submitButton = document.querySelector('button[type="submit"]');
          if (submitButton) {
            submitButton.disabled = false;
            submitButton.style.opacity = '1';
            submitButton.style.cursor = 'pointer';
          }
          setIsSubmitting(false);
        }
      } catch (error) {
        console.error('Error creating MoMo payment:', error);
        alert(error.message || 'Không thể khởi tạo thanh toán MoMo. Vui lòng thử lại.');
        // Re-enable button
        const submitButton = document.querySelector('button[type="submit"]');
        if (submitButton) {
          submitButton.disabled = false;
          submitButton.style.opacity = '1';
          submitButton.style.cursor = 'pointer';
        }
        setIsSubmitting(false);
      }
      return;
    }

    // Thanh toán bằng ví Cinesmart
    if (paymentMethod === 'WALLET') {
      try {
        const hasValidBooking = bookingData &&
          bookingData.showtimeId &&
          bookingData.seats &&
          Array.isArray(bookingData.seats) &&
          bookingData.seats.length > 0;

        const payload = {
          amount: totalAmount,
          voucherId: selectedVoucher?.voucherId || null,
          voucherCode: selectedVoucher?.code || null,
          orderDescription: 'Thanh toán đơn hàng tại Cinesmart',
          showtimeId: hasValidBooking ? bookingData.showtimeId : null,
          seatIds: hasValidBooking ? bookingData.seats : [],
          cinemaComplexId: !hasValidBooking && cartData?.cinema?.complexId ? cartData.cinema.complexId : null,
          foodCombos: cartData?.items?.map(item => ({
            foodComboId: item.id?.replace('fc_', '') || item.foodComboId,
            quantity: item.quantity || 1
          })) || []
        };

        console.log('Creating wallet payment with payload:', payload);
        const response = await paymentService.createWalletPayment(payload);
        console.log('Wallet payment response:', response);
        
        if (response.success && response.data) {
          // Set flag to prevent seat release
          isRedirectingToPayment.current = true;
          // Xóa dữ liệu checkout
          localStorage.removeItem('checkoutCart');
          localStorage.removeItem('pendingBooking');
          // Redirect đến trang thành công
          navigate(`/payment/success?orderId=${response.data.orderId}&status=PAID&paymentMethod=WALLET`);
          return;
        } else {
          const errorMessage = response.message || 'Không thể thanh toán bằng ví Cinesmart. Vui lòng thử lại.';
          console.error('Wallet payment failed:', errorMessage, response);
          alert(errorMessage);
          // Re-enable button
          const submitButton = document.querySelector('button[type="submit"]');
          if (submitButton) {
            submitButton.disabled = false;
            submitButton.style.opacity = '1';
            submitButton.style.cursor = 'pointer';
          }
          setIsSubmitting(false);
        }
      } catch (error) {
        console.error('Error creating wallet payment:', error);
        const errorMessage = error.message || error.response?.data?.message || 'Có lỗi xảy ra khi thanh toán bằng ví Cinesmart. Vui lòng thử lại.';
        alert(errorMessage);
        // Re-enable button
        const submitButton = document.querySelector('button[type="submit"]');
        if (submitButton) {
          submitButton.disabled = false;
          submitButton.style.opacity = '1';
          submitButton.style.cursor = 'pointer';
        }
        setIsSubmitting(false);
      }
      return;
    }

    // Các phương thức thanh toán khác (chưa tích hợp)
    alert('Chức năng thanh toán cho phương thức này chưa được hỗ trợ. Vui lòng chọn MoMo, ZaloPay hoặc Ví Cinesmart.');
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

    // Handle both old format (discountValue) and new format (discount, discountPercent)
    const discountType = voucher.discountType || (voucher.discountPercent > 0 ? 'PERCENT' : 'AMOUNT');

    if (discountType === 'PERCENT') {
      const discountPercent = voucher.discountValue || voucher.discountPercent || 0;
      const discount = (subtotal * discountPercent) / 100;
      const maxDiscount = voucher.maxDiscount || voucher.maxDiscountAmount || Infinity;
      return Math.min(discount, maxDiscount);
    } else {
      const discountAmount = voucher.discountValue || voucher.discount || 0;
      return Math.min(discountAmount, subtotal);
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
                <path d="M20 7h-4M4 7h4m0 0V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m-6 0v12m6-12v12M4 7v12" />
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
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
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
                        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                        <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                        <line x1="12" y1="22.08" x2="12" y2="12" />
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
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Voucher List */}
                  {loadingVouchers && (
                    <div className="text-center py-4 text-[#c9c4c5] text-sm">
                      Đang tải vouchers...
                    </div>
                  )}
                  {!loadingVouchers && showVoucherList && availableVouchers.length > 0 && (
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
                                  onChange={() => { }}
                                  disabled={!canUse}
                                />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="checkout-voucher-item__badge">{formatDiscountBadge(voucher)}</span>
                                  <span className="checkout-voucher-item__code">{voucher.code}</span>
                                </div>
                                <div className="checkout-voucher-item__name">{voucher.name || voucher.title}</div>
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

                  {!loadingVouchers && availableVouchers.length === 0 && (
                    <div className="text-center py-4 text-[#c9c4c5] text-sm">
                      Bạn chưa có voucher nào. <a href="/events" className="text-[#ffd159] hover:underline">Xem voucher</a>
                    </div>
                  )}
                </div>

                {/* Payment Method Card */}
                <div className="bg-gradient-to-br from-[#2d2627] to-[#1a1415] border border-[#4a3f41] rounded-xl p-6">
                  <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[#ffd159]">
                      <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
                      <line x1="1" y1="10" x2="23" y2="10" />
                    </svg>
                    Phương thức thanh toán
                  </h2>
                  <div className="checkout-payment-methods">
                    <label className="checkout-payment-method">
                      <input
                        type="radio"
                        name="payment"
                        value="MOMO"
                        checked={paymentMethod === 'MOMO'}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                      />
                      <div className="checkout-payment-method__content">
                        <img src="/momo.png" alt="MoMo" style={{ width: '32px', height: '32px', marginRight: '12px', flexShrink: 0, objectFit: 'contain' }} />
                        <span>MoMo</span>
                      </div>
                    </label>
                    <label className="checkout-payment-method">
                      <input
                        type="radio"
                        name="payment"
                        value="ZALOPAY"
                        checked={paymentMethod === 'ZALOPAY'}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                      />
                      <div className="checkout-payment-method__content">
                        <img src="/zalopay.png" alt="ZaloPay" style={{ width: '32px', height: '32px', marginRight: '12px', flexShrink: 0, objectFit: 'contain' }} />
                        <span>ZaloPay</span>
                      </div>
                    </label>
                    <label className="checkout-payment-method">
                      <input
                        type="radio"
                        name="payment"
                        value="WALLET"
                        checked={paymentMethod === 'WALLET'}
                        onChange={(e) => setPaymentMethod(e.target.value)}
                        disabled={walletBalance !== null && walletBalance < getTotalAmount()}
                      />
                      <div className="checkout-payment-method__content">
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: '12px', flexShrink: 0, color: '#ffd159' }}>
                          <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
                          <line x1="1" y1="10" x2="23" y2="10" />
                        </svg>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <span>Ví Cinesmart</span>
                            {loadingWallet ? (
                              <span className="text-xs text-[#c9c4c5]">Đang tải...</span>
                            ) : walletBalance !== null ? (
                              <span className="text-xs text-[#c9c4c5]">
                                Số dư: {formatPrice(walletBalance)}
                              </span>
                            ) : null}
                          </div>
                          {walletBalance !== null && walletBalance < getTotalAmount() && (
                            <div className="text-xs text-[#ff5258] mt-1">
                              Số dư không đủ. Vui lòng nạp thêm {formatPrice(getTotalAmount() - walletBalance)}
                            </div>
                          )}
                        </div>
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
                      <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
                      <path d="M3 6h18" />
                      <path d="M16 10a4 4 0 0 1-8 0" />
                    </svg>
                    Đơn hàng
                  </h2>

                  {/* Cinema Info */}
                  <div className="flex items-center gap-2 mb-6 pb-4 border-b border-[#4a3f41]">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-[#ffd159] flex-shrink-0">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                      <circle cx="12" cy="10" r="3" />
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
                            <div className="flex flex-col items-end gap-1">
                              {bookingData.showtime?.basePrice && bookingData.showtime?.adjustedPrice &&
                                bookingData.showtime.basePrice !== bookingData.showtime.adjustedPrice && (
                                  <>
                                    <div className="text-xs text-[#c9c4c5] line-through">
                                      {formatPrice(bookingData.totalPrice / (bookingData.seats?.length || 1) * (bookingData.seats?.length || 1))}
                                    </div>
                                    <div className="text-[#ffd159] font-bold">
                                      {formatPrice(bookingData.totalPrice)}
                                    </div>
                                    <div className="text-[10px] text-[#4caf50] font-semibold">
                                      +30% Weekend
                                    </div>
                                  </>
                                )}
                              {!(bookingData.showtime?.basePrice && bookingData.showtime?.adjustedPrice &&
                                bookingData.showtime.basePrice !== bookingData.showtime.adjustedPrice) && (
                                  <div className="text-[#ffd159] font-bold">
                                    {formatPrice(bookingData.totalPrice || 0)}
                                  </div>
                                )}
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
                    className="w-full bg-gradient-to-r from-[#e83b41] to-[#ff5258] hover:from-[#ff5258] hover:to-[#ff6b6b] text-white font-bold py-4 px-6 rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] uppercase tracking-wide disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Đang xử lý...' : 'Xác nhận thanh toán'}
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
