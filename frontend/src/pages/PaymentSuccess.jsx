import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import './PaymentSuccess.css';
import { paymentService } from '../services/paymentService';
import { notificationService } from '../services/notificationService';

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [paymentInfo, setPaymentInfo] = useState({
    paymentMethod: '',
    transactionId: '',
    amount: '',
    status: '',
    orderId: '',
    txnRef: '',
    message: ''
  });
  const [loading, setLoading] = useState(true);
  const [isSuccess, setIsSuccess] = useState(false);
  const [notificationTriggered, setNotificationTriggered] = useState(false);

  useEffect(() => {
    // Xác định payment method từ URL params
    const apptransid = searchParams.get('apptransid'); // ZaloPay
    const orderId = searchParams.get('orderId'); // MoMo
    const vnp_TxnRef = searchParams.get('vnp_TxnRef'); // VNPay
    const status = searchParams.get('status'); // ZaloPay status
    const resultCode = searchParams.get('resultCode'); // MoMo resultCode
    const vnp_ResponseCode = searchParams.get('vnp_ResponseCode'); // VNPay response code
    const amount = searchParams.get('amount') || searchParams.get('vnp_Amount'); // Amount
    const txnRef = orderId || vnp_TxnRef || apptransid;

    // Xác định payment method
    let paymentMethod = 'UNKNOWN';
    let transactionId = '';
    let paymentStatus = '';
    let isPaymentSuccess = false;

    if (apptransid) {
      // ZaloPay
      paymentMethod = 'ZaloPay';
      transactionId = apptransid;
      // Nếu có status trong URL, dùng nó, nhưng vẫn sẽ kiểm tra order để chắc chắn
      if (status !== null && status !== undefined) {
        paymentStatus = status === '1' ? 'Thành công' : 'Thất bại';
        isPaymentSuccess = status === '1';
      } else {
        // Không có status, sẽ kiểm tra order
        paymentStatus = 'Đang kiểm tra...';
        isPaymentSuccess = false; // Tạm thời false, sẽ update sau khi fetch order
      }
    } else if (orderId) {
      // MoMo
      paymentMethod = 'MoMo';
      transactionId = orderId;
      // Nếu có resultCode trong URL, dùng nó, nhưng vẫn sẽ kiểm tra order để chắc chắn
      if (resultCode !== null && resultCode !== undefined) {
        paymentStatus = resultCode === '0' ? 'Thành công' : 'Thất bại';
        isPaymentSuccess = resultCode === '0';
      } else {
        // Không có resultCode, sẽ kiểm tra order
        paymentStatus = 'Đang kiểm tra...';
        isPaymentSuccess = false; // Tạm thời false, sẽ update sau khi fetch order
      }
    } else if (vnp_TxnRef) {
      // VNPay
      paymentMethod = 'VNPay';
      transactionId = vnp_TxnRef;
      // Nếu có vnp_ResponseCode trong URL, dùng nó
      if (vnp_ResponseCode !== null && vnp_ResponseCode !== undefined) {
        paymentStatus = vnp_ResponseCode === '00' ? 'Thành công' : 'Thất bại';
        isPaymentSuccess = vnp_ResponseCode === '00';
      } else {
        paymentStatus = 'Đang kiểm tra...';
        isPaymentSuccess = false;
      }
    } else {
      // Không có params nào, không thể xác định
      setLoading(false);
      return;
    }

    // Set initial info
    setPaymentInfo({
      paymentMethod,
      transactionId,
      amount: amount ? (parseInt(amount) / 100).toLocaleString('vi-VN') + ' đ' : '',
      status: paymentStatus,
      orderId: '',
      txnRef: txnRef || '',
      message: isPaymentSuccess ? 'Thanh toán thành công!' : 'Đang kiểm tra...'
    });
    setIsSuccess(isPaymentSuccess);
    
    // LUÔN LUÔN thử fetch order info dựa trên txnRef để xác định thực sự thành công hay không
    // Vì chỉ lưu đơn thành công, nếu tìm thấy order = thanh toán thành công
    if (txnRef) {
      fetchOrderInfo(txnRef);
    } else {
      // Không có txnRef = không thể kiểm tra
      setLoading(false);
    }
  }, [searchParams]);

  const fetchOrderInfo = async (txnRef) => {
    try {
      // Thử fetch order nhiều lần với delay để đợi order được lưu (tránh race condition)
      let retryCount = 0;
      const maxRetries = 5;
      let orderData = null;
      
      while (retryCount < maxRetries) {
        const result = await paymentService.getOrderByTxnRef(txnRef);
        if (result.success && result.data) {
          orderData = result.data;
          break;
        }
        
        // Nếu không tìm thấy, đợi 500ms rồi thử lại
        if (retryCount < maxRetries - 1) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
        retryCount++;
      }
      
      if (orderData) {
        // Nếu tìm thấy order thì thanh toán thành công (vì chỉ lưu đơn thành công)
        setIsSuccess(true);
        setPaymentInfo(prev => ({
          ...prev,
          orderId: orderData.orderId,
          amount: new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
          }).format(orderData.totalAmount || 0),
          status: 'Thành công',
          message: 'Thanh toán thành công!'
        }));
        
        // Xóa cart và booking data
        localStorage.removeItem('checkoutCart');
        localStorage.removeItem('pendingBooking');
        
        // Trigger notification từ frontend làm FALLBACK (chỉ 1 lần duy nhất)
        // Vì callback/IPN có thể không được gọi (localhost, firewall, etc.)
        // notifyBookingSuccess có check duplicate 10 giây nên an toàn
        const storedUser = JSON.parse(localStorage.getItem('user'));
        if (storedUser && storedUser.userId && orderData.orderId && !notificationTriggered) {
          setNotificationTriggered(true); // Đánh dấu đã trigger
          
          // Đợi 1 giây rồi trigger notification
          setTimeout(async () => {
            try {
              console.log('Triggering notification from frontend for order:', orderData.orderId);
              await notificationService.triggerOrderSuccessNotification(orderData.orderId);
              console.log('Notification triggered successfully from frontend');
            } catch (notifError) {
              console.error('Error triggering notification:', notifError);
              // Không fail flow chính
            }
            
            // Reload notifications
            window.dispatchEvent(new CustomEvent('paymentSuccess', { 
              detail: { orderId: orderData.orderId } 
            }));
          }, 1000);
        }
      } else {
        // Không tìm thấy order sau nhiều lần thử = thanh toán thất bại hoặc đang xử lý
        setIsSuccess(false);
        setPaymentInfo(prev => ({
          ...prev,
          status: 'Thất bại',
          message: 'Không tìm thấy đơn hàng. Thanh toán có thể đã thất bại hoặc đang được xử lý. Vui lòng kiểm tra lại sau.'
        }));
        
        // Xóa cart và booking data để user có thể đặt lại
        localStorage.removeItem('checkoutCart');
        localStorage.removeItem('pendingBooking');
      }
    } catch (error) {
      console.error('Error fetching order info:', error);
      setIsSuccess(false);
      setPaymentInfo(prev => ({
        ...prev,
        status: 'Lỗi',
        message: 'Không thể xác nhận trạng thái thanh toán. Vui lòng kiểm tra lại trong trang đơn hàng.'
      }));
    } finally {
      setLoading(false);
    }
  };

  const formatAmount = (amount) => {
    if (!amount) return '0 đ';
    if (typeof amount === 'string') return amount;
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="payment-success">
        <div className="payment-success__container">
          <div className="text-center text-[#c9c4c5]">Đang xử lý kết quả thanh toán...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="payment-success">
      <div className="payment-success__container">
        <div className={`payment-success__icon ${isSuccess ? 'success' : 'failure'}`}>
          {isSuccess ? (
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
          ) : (
            <svg
              width="80"
              height="80"
              viewBox="0 0 80 80"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <circle cx="40" cy="40" r="40" fill="#f44336" />
              <path
                d="M30 30L50 50M50 30L30 50"
                stroke="white"
                strokeWidth="4"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
        </div>

        <h1 className="payment-success__title">
          {isSuccess ? 'Thanh toán thành công!' : 'Thanh toán thất bại'}
        </h1>
        <p className="payment-success__message">
          {paymentInfo.message || (isSuccess 
            ? 'Cảm ơn bạn đã đặt vé. Đơn hàng của bạn đã được xác nhận.'
            : 'Có lỗi xảy ra trong quá trình thanh toán. Vui lòng thử lại.')}
        </p>

        <div className="payment-success__details">
          {paymentInfo.paymentMethod && (
            <div className="payment-success__detail-item">
              <span className="payment-success__detail-label">Phương thức:</span>
              <span className="payment-success__detail-value">
                {paymentInfo.paymentMethod}
              </span>
            </div>
          )}
          {paymentInfo.transactionId && (
            <div className="payment-success__detail-item">
              <span className="payment-success__detail-label">Mã giao dịch:</span>
              <span className="payment-success__detail-value">
                {paymentInfo.transactionId}
              </span>
            </div>
          )}
          {paymentInfo.orderId && (
            <div className="payment-success__detail-item">
              <span className="payment-success__detail-label">Mã đơn hàng:</span>
              <span className="payment-success__detail-value">
                #{paymentInfo.orderId}
              </span>
            </div>
          )}
          {paymentInfo.amount && (
            <div className="payment-success__detail-item">
              <span className="payment-success__detail-label">Số tiền:</span>
              <span className="payment-success__detail-value payment-success__amount">
                {formatAmount(paymentInfo.amount)}
              </span>
            </div>
          )}
          {paymentInfo.status && (
            <div className="payment-success__detail-item">
              <span className="payment-success__detail-label">Trạng thái:</span>
              <span className="payment-success__detail-value">
                {paymentInfo.status}
              </span>
            </div>
          )}
        </div>

        <div className="payment-success__actions">
          {isSuccess && paymentInfo.orderId && (
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
          )}
          {!isSuccess && (
            <button
              className="payment-success__button payment-success__button--primary"
              onClick={() => navigate('/checkout')}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M10 10v6M7 13h6"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Thử lại
            </button>
          )}
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

        {isSuccess && (
          <div className="payment-success__note">
            <p>
              <strong>Lưu ý:</strong> Vé điện tử đã được gửi đến email của bạn.
              Vui lòng kiểm tra hộp thư đến hoặc thư rác.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentSuccess;
