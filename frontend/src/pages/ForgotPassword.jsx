import React, { useState, useEffect } from 'react';
import Footer from '../components/Footer.jsx';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState(1); // 1: nhập email, 2: nhập OTP
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(0);
  const [isResendDisabled, setIsResendDisabled] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  useEffect(() => {
    if (countdown === 0 && isResendDisabled) {
      setIsResendDisabled(false);
    }
  }, [countdown, isResendDisabled]);

  const handleSendOTP = (e) => {
    e.preventDefault();
    setError('');

    if (!email) {
      setError('Vui lòng nhập email');
      return;
    }

    // TODO: Gọi API gửi OTP qua email
    // fetch('/api/forgot-password/send-otp', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ email })
    // })
    //   .then(res => res.json())
    //   .then(data => {
    //     if (data.success) {
    //       setStep(2);
    //       setCountdown(60);
    //       setIsResendDisabled(true);
    //     } else {
    //       setError(data.message || 'Có lỗi xảy ra');
    //     }
    //   })
    //   .catch(err => {
    //     setError('Có lỗi xảy ra. Vui lòng thử lại sau.');
    //   });

    // Simulate API call
    setTimeout(() => {
      setStep(2);
      setCountdown(60);
      setIsResendDisabled(true);
    }, 1000);
  };

  const handleResendOTP = () => {
    setError('');
    setIsResendDisabled(true);
    setCountdown(60);

    // TODO: Gọi API gửi lại OTP
    // fetch('/api/forgot-password/resend-otp', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ email })
    // })
    //   .then(res => res.json())
    //   .then(data => {
    //     if (data.success) {
    //       setCountdown(60);
    //       setIsResendDisabled(true);
    //     } else {
    //       setError(data.message || 'Có lỗi xảy ra');
    //     }
    //   })
    //   .catch(err => {
    //     setError('Có lỗi xảy ra. Vui lòng thử lại sau.');
    //   });
  };

  const handleVerifyOTP = (e) => {
    e.preventDefault();
    setError('');
    setIsVerifying(true);

    if (!otp || otp.length !== 6) {
      setError('Vui lòng nhập mã OTP 6 chữ số');
      setIsVerifying(false);
      return;
    }

    // TODO: Gọi API xác thực OTP
    // fetch('/api/forgot-password/verify-otp', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ email, otp })
    // })
    //   .then(res => res.json())
    //   .then(data => {
    //     if (data.success) {
    //       // Generate a token and redirect to reset password
    //       const token = data.token || 'reset_token_' + Date.now();
    //       window.location.hash = `#reset-password?token=${token}&email=${encodeURIComponent(email)}`;
    //     } else {
    //       setError(data.message || 'Mã OTP không đúng');
    //       setIsVerifying(false);
    //     }
    //   })
    //   .catch(err => {
    //     setError('Có lỗi xảy ra. Vui lòng thử lại sau.');
    //     setIsVerifying(false);
    //   });

    // Simulate API call - verify OTP (accept any 6-digit code for demo)
    setTimeout(() => {
      if (otp.length === 6) {
        const mockToken = 'reset_token_' + Date.now();
        window.location.hash = `#reset-password?token=${mockToken}&email=${encodeURIComponent(email)}`;
      } else {
        setError('Mã OTP không đúng');
        setIsVerifying(false);
      }
    }, 1000);
  };

  // Step 2: Nhập OTP
  if (step === 2) {
    return (
      <div className="min-h-screen cinema-mood">
        <div className="split">
          <section className="intro">
            <div className="intro__content">
              <h1 className="intro__title">NHẬP MÃ<br/>XÁC THỰC</h1>
              <p className="intro__subtitle">Vui lòng nhập mã OTP đã được gửi đến email của bạn</p>
            </div>
            <div className="intro__popcorn" aria-hidden="true"></div>
          </section>

          <section className="auth">
            <div className="auth__panel">
              <button className="close" aria-label="Đóng" onClick={() => { window.location.hash = ''; }}>×</button>
              <h2 className="auth__title">XÁC THỰC OTP</h2>
              <p className="auth__subtitle">
                Chúng tôi đã gửi mã OTP đến email <strong>{email}</strong>. 
                Vui lòng kiểm tra và nhập mã 6 chữ số.
              </p>

              {error && (
                <div style={{
                  padding: '12px 16px',
                  background: 'rgba(232, 59, 65, 0.1)',
                  border: '1px solid rgba(232, 59, 65, 0.3)',
                  borderRadius: '8px',
                  color: '#e83b41',
                  marginBottom: '20px',
                  fontSize: '14px'
                }}>
                  {error}
                </div>
              )}

              <form className="auth__form" action="#" method="post" autoComplete="off" onSubmit={handleVerifyOTP}>
                <label className="field">
                  <span className="field__label">Mã OTP</span>
                  {/* make placeholder smaller only for this OTP input */}
                  <style>{`.otp-input::placeholder { font-size: 14px; opacity: 0.85; }`}</style>
                  <input
                    className="field__input otp-input"
                    type="text"
                    name="otp"
                    placeholder="Nhập mã OTP 6 chữ số"
                    value={otp}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '').slice(0, 6);
                      setOtp(value);
                      if (error) setError('');
                    }}
                    required
                    maxLength={6}
                    style={{ 
                      textAlign: 'center',
                      fontSize: '24px',
                      letterSpacing: '8px',
                      fontWeight: '600'
                    }}
                    autoFocus
                  />
                </label>

                <button 
                  className="btn btn--primary" 
                  type="submit"
                  disabled={isVerifying || otp.length !== 6}
                  style={{ 
                    opacity: (isVerifying || otp.length !== 6) ? 0.6 : 1,
                    cursor: (isVerifying || otp.length !== 6) ? 'not-allowed' : 'pointer'
                  }}
                >
                  {isVerifying ? 'Đang xác thực...' : 'Xác thực OTP'}
                </button>
              </form>

              <div style={{ 
                marginTop: '20px', 
                padding: '16px', 
                background: 'rgba(255,255,255,0.05)', 
                borderRadius: '8px',
                textAlign: 'center'
              }}>
                <p style={{ color: '#c9c4c5', fontSize: '14px', marginBottom: '12px' }}>
                  Không nhận được mã OTP?
                </p>
                <button
                  type="button"
                  onClick={handleResendOTP}
                  disabled={isResendDisabled}
                  style={{
                    background: 'transparent',
                    border: '1px solid rgba(255,255,255,0.2)',
                    color: isResendDisabled ? '#666' : '#fff',
                    padding: '10px 20px',
                    borderRadius: '8px',
                    cursor: isResendDisabled ? 'not-allowed' : 'pointer',
                    fontSize: '14px',
                    width: '100%',
                    transition: 'all 0.3s'
                  }}
                >
                  {isResendDisabled 
                    ? `Gửi lại mã sau ${countdown}s` 
                    : 'Gửi lại mã OTP'
                  }
                </button>
              </div>

              <div className="auth__signup" style={{ marginTop: '20px' }}>
                <button
                  type="button"
                  onClick={() => {
                    setStep(1);
                    setOtp('');
                    setError('');
                    setCountdown(0);
                    setIsResendDisabled(false);
                  }}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: '#c9c4c5',
                    fontSize: '13px',
                    cursor: 'pointer',
                    textDecoration: 'underline'
                  }}
                >
                  ← Quay lại nhập email
                </button>
              </div>
            </div>
          </section>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen cinema-mood">
      <div className="split">
        <section className="intro">
          <div className="intro__content">
            <h1 className="intro__title">ĐẶT LẠI<br/>MẬT KHẨU</h1>
            <p className="intro__subtitle">Nhập email của bạn và chúng tôi sẽ gửi mã OTP để đặt lại mật khẩu</p>
          </div>
          <div className="intro__popcorn" aria-hidden="true"></div>
        </section>

        <section className="auth">
          <div className="auth__panel">
            <button className="close" aria-label="Đóng" onClick={() => { window.location.hash = ''; }}>×</button>
            <h2 className="auth__title">QUÊN MẬT KHẨU</h2>
            <p className="auth__subtitle">Chúng tôi sẽ gửi mã OTP đến email của bạn để xác thực</p>

            {error && (
              <div style={{
                padding: '12px 16px',
                background: 'rgba(232, 59, 65, 0.1)',
                border: '1px solid rgba(232, 59, 65, 0.3)',
                borderRadius: '8px',
                color: '#e83b41',
                marginBottom: '20px',
                fontSize: '14px'
              }}>
                {error}
              </div>
            )}

            <form className="auth__form" action="#" method="post" autoComplete="on" onSubmit={handleSendOTP}>
              <label className="field">
                <span className="field__label">Email</span>
                <input
                  className="field__input"
                  type="email"
                  name="email"
                  placeholder="Nhập email của bạn"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (error) setError('');
                  }}
                  required
                />
              </label>

              <button className="btn btn--primary" type="submit">Gửi mã OTP</button>
            </form>

            <div className="auth__signup">
              <span>Nhớ lại mật khẩu? </span><a href="#signin">QUAY LẠI ĐĂNG NHẬP</a>
            </div>
          </div>
        </section>
      </div>

      <Footer />
    </div>
  );
}

