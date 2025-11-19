import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import './PaymentSuccess.css';
import { paymentService } from '../services/paymentService';

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [paymentInfo, setPaymentInfo] = useState({
    appid: '',
    apptransid: '',
    amount: '',
    status: '',
    pmcid: '',
    bankcode: ''
  });

  useEffect(() => {
    // Lấy thông tin từ URL query parameters
    const appid = searchParams.get('appid');
    const apptransid = searchParams.get('apptransid');
    const amount = searchParams.get('amount');
    const status = searchParams.get('status');
    const pmcid = searchParams.get('pmcid');
    const bankcode = searchParams.get('bankcode');

    setPaymentInfo({
      appid,
      apptransid,
      amount,
      status,
      pmcid,
      bankcode
    });

    console.log('Payment success info:', {
      appid,
      apptransid,
      amount,
      status,
      pmcid,
      bankcode
    });

    // Tạo order từ pending order khi thanh toán thành công
    if (apptransid && status === '1') {
      completeOrder(apptransid);
    }
  }, [searchParams]);

  const completeOrder = async (appTransId) => {
    try {
      console.log('Completing order for appTransId:', appTransId);
      
      const result = await paymentService.completeZaloPayOrder(appTransId);
      console.log('Complete order result:', result);

      if (result.success) {
        console.log('Order created successfully! OrderId:', result.orderId);
        // Xóa cart và booking data
        localStorage.removeItem('checkoutCart');
        localStorage.removeItem('pendingBooking');
      } else {
        console.error('Failed to create order:', result.message || result.error);
      }
    } catch (error) {
      console.error('Error completing order:', error);
    }
  };

  const formatAmount = (amount) => {
    if (!amount) return '0';
    return new Intl.NumberFormat('vi-VN').format(amount) + ' đ';
  };

  return (
    <div className="payment-success">
      <div className="payment-success__container">
        <div className="payment-success__icon">
          <svg
            width="80"
            height="80"
            viewBox="0 0 80 80"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle cx="40" cy="40" r="40" fill="#4CAF50" />
            <path
              d="M25 40L35 50L55 30"
              stroke="white"
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        <h1 className="payment-success__title">Thanh toán thành công!</h1>
        <p className="payment-success__message">
          Cảm ơn bạn đã đặt vé. Đơn hàng của bạn đã được xác nhận.
        </p>

        <div className="payment-success__details">
          <div className="payment-success__detail-item">
            <span className="payment-success__detail-label">Mã giao dịch:</span>
            <span className="payment-success__detail-value">
              {paymentInfo.apptransid || 'N/A'}
            </span>
          </div>
          <div className="payment-success__detail-item">
            <span className="payment-success__detail-label">Số tiền:</span>
            <span className="payment-success__detail-value payment-success__amount">
              {formatAmount(paymentInfo.amount)}
            </span>
          </div>
          {paymentInfo.status && (
            <div className="payment-success__detail-item">
              <span className="payment-success__detail-label">Trạng thái:</span>
              <span className="payment-success__detail-value">
                {paymentInfo.status === '1' ? 'Thành công' : 'Đang xử lý'}
              </span>
            </div>
          )}
        </div>

        <div className="payment-success__actions">
          <button
            className="payment-success__button payment-success__button--primary"
            onClick={() => navigate('/orders')}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M3 5h14M5 5v12a2 2 0 002 2h6a2 2 0 002-2V5M8 5V3a2 2 0 012-2h0a2 2 0 012 2v2"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Xem đơn hàng
          </button>
          <button
            className="payment-success__button payment-success__button--secondary"
            onClick={() => navigate('/')}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M3 10h14M3 10l6-6M3 10l6 6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Về trang chủ
          </button>
        </div>

        <div className="payment-success__note">
          <p>
            <strong>Lưu ý:</strong> Vé điện tử đã được gửi đến email của bạn.
            Vui lòng kiểm tra hộp thư đến hoặc thư rác.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;

