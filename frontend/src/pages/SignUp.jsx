import React, { useState, useEffect } from 'react';
import Footer from '../components/Footer.jsx';

export default function SignUp() {
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [otp, setOtp] = useState('');
  const [countdown, setCountdown] = useState(0);
  const [isResendDisabled, setIsResendDisabled] = useState(false);

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

  const handleResendOTP = () => {
    setIsResendDisabled(true);
    setCountdown(30);
    // TODO: Gọi API gửi OTP ở đây
  };

  return (
    <div className="min-h-screen cinema-mood">
      <div className="split">
        <section className="intro">
          <div className="intro__content">
            <h1 className="intro__title">DỄ DÀNG<br/>ĐĂNG KÝ</h1>
            <p className="intro__subtitle">Tạo tài khoản và nhận ưu đãi độc quyền từ Cinesmart!</p>
          </div>
          <div className="intro__popcorn" aria-hidden="true"></div>
        </section>

        <section className="auth">
          <div className="auth__panel auth__panel--wide">
            <button className="close" aria-label="Đóng" onClick={() => { window.location.hash = ''; }}>×</button>
            <h2 className="auth__title">Đăng ký</h2>
            <p className="auth__subtitle">Nhận ưu đãi và quyền lợi độc quyền từ Cinesmart</p>

            <form className="auth__form" action="#" method="post" autoComplete="on" onSubmit={(e) => e.preventDefault()}>
              <div className="auth__form--two-col">
                <label className="field">
                  <span className="field__label">Họ và tên</span>
                  <input className="field__input" type="text" name="fullName" placeholder="Nhập họ và tên" required />
                </label>

                <label className="field">
                  <span className="field__label">Ngày sinh</span>
                  <input className="field__input" type="date" name="dob" placeholder="mm/dd/yyyy" required />
                </label>
              </div>

              <div className="auth__form--two-col">
                <label className="field">
                  <span className="field__label">Số điện thoại</span>
                  <input className="field__input" type="tel" name="mobile" placeholder="Nhập số điện thoại" required />
                </label>

                <label className="field">
                  <span className="field__label">Tên đăng nhập</span>
                  <input className="field__input" type="text" name="username" placeholder="Chọn tên đăng nhập" required />
                </label>
              </div>

              <label className="field">
                <span className="field__label">Email</span>
                <input className="field__input" type="email" name="email" placeholder="Nhập email" required />
              </label>

              <label className="field">
                <span className="field__label">Mật khẩu</span>
                <div style={{ position: 'relative' }}>
                  <input
                    className="field__input"
                    type={showPass ? 'text' : 'password'}
                    name="password"
                    placeholder="Tạo mật khẩu"
                    required
                    style={{ paddingRight: '44px' }}
                  />
                  <button
                    type="button"
                    aria-label={showPass ? 'Hide password' : 'Show password'}
                    onClick={() => setShowPass((v) => !v)}
                    style={{
                      position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)',
                      background: 'transparent', color: '#c9c4c5', border: 0, cursor: 'pointer', width: '24px', height: '24px', display: 'grid', placeItems: 'center'
                    }}
                  >
                    {showPass ? (
                      <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" fill="currentColor">
                        <path d="M12 5c-7 0-10 7-10 7s2.1 3.9 6.1 5.7l-1.5 1.5 1.4 1.4 14-14-1.4-1.4-2.1 2.1C16.7 5.5 14.4 5 12 5zm0 4c.6 0 1.1.2 1.6.4l-3.2 3.2c-.2-.5-.4-1-.4-1.6 0-1.7 1.3-3 3-3zm0 10c7 0 10-7 10-7s-1-1.9-3-3.7l-1.4 1.4C19.2 10 20 12 20 12s-2.6 5-8 5c-1 0-1.9-.2-2.7-.5l-1.6 1.6C9 18.7 10.5 19 12 19z"/>
                      </svg>
                    ) : (
                      <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" fill="currentColor">
                        <path d="M12 5c-7 0-10 7-10 7s3 7 10 7 10-7 10-7-3-7-10-7zm0 12c-2.8 0-5-2.2-5-5s2.2-5 5-5 5 2.2 5 5-2.2 5-5 5zm0-8c-1.7 0-3 1.3-3 3s1.3 3 3 3 3-1.3 3-3-1.3-3-3-3z"/>
                      </svg>
                    )}
                  </button>
                </div>
              </label>

              <label className="field">
                <span className="field__label">Xác nhận mật khẩu</span>
                <div style={{ position: 'relative' }}>
                  <input
                    className="field__input"
                    type={showConfirm ? 'text' : 'password'}
                    name="confirm"
                    placeholder="Nhập lại mật khẩu"
                    required
                    style={{ paddingRight: '44px' }}
                  />
                  <button
                    type="button"
                    aria-label={showConfirm ? 'Hide password' : 'Show password'}
                    onClick={() => setShowConfirm((v) => !v)}
                    style={{
                      position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)',
                      background: 'transparent', color: '#c9c4c5', border: 0, cursor: 'pointer', width: '24px', height: '24px', display: 'grid', placeItems: 'center'
                    }}
                  >
                    {showConfirm ? (
                      <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" fill="currentColor">
                        <path d="M12 5c-7 0-10 7-10 7s2.1 3.9 6.1 5.7l-1.5 1.5 1.4 1.4 14-14-1.4-1.4-2.1 2.1C16.7 5.5 14.4 5 12 5zm0 4c.6 0 1.1.2 1.6.4l-3.2 3.2c-.2-.5-.4-1-.4-1.6 0-1.7 1.3-3 3-3zm0 10c7 0 10-7 10-7s-1-1.9-3-3.7l-1.4 1.4C19.2 10 20 12 20 12s-2.6 5-8 5c-1 0-1.9-.2-2.7-.5l-1.6 1.6C9 18.7 10.5 19 12 19z"/>
                      </svg>
                    ) : (
                      <svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" fill="currentColor">
                        <path d="M12 5c-7 0-10 7-10 7s3 7 10 7 10-7 10-7-3-7-10-7zm0 12c-2.8 0-5-2.2-5-5s2.2-5 5-5 5 2.2 5 5-2.2 5-5 5zm0-8c-1.7 0-3 1.3-3 3s1.3 3 3 3 3-1.3 3-3-1.3-3-3-3z"/>
                      </svg>
                    )}
                  </button>
                </div>
              </label>

              <label className="field">
                <span className="field__label">Mã OTP</span>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                  <input
                    className="field__input"
                    type="text"
                    name="otp"
                    placeholder="Nhập mã OTP"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    required
                    style={{ flex: 1 }}
                  />
                  <button
                    type="button"
                    onClick={handleResendOTP}
                    disabled={isResendDisabled}
                    className="btn"
                    style={{
                      padding: '14px 16px',
                      background: isResendDisabled ? '#2a2223' : 'transparent',
                      color: isResendDisabled ? '#6b575a' : '#c9c4c5',
                      border: '1px solid rgba(255,255,255,0.25)',
                      cursor: isResendDisabled ? 'not-allowed' : 'pointer',
                      whiteSpace: 'nowrap',
                      opacity: isResendDisabled ? 0.5 : 1
                    }}
                  >
                    {isResendDisabled ? `Gửi lại (${countdown}s)` : 'Gửi OTP'}
                  </button>
                </div>
              </label>

              <button className="btn btn--primary" type="submit">Đăng ký</button>
              <button type="button" className="btn btn--google" aria-label="Continue with Google" style={{ marginTop: '8px' }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
                  <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303C33.602 31.91 29.197 35 24 35 16.82 35 11 29.18 11 22S16.82 9 24 9c3.59 0 6.84 1.353 9.35 3.57l5.657-5.657C34.884 3.029 29.7 1 24 1 10.745 1 0 11.745 0 25s10.745 24 24 24c12.426 0 23-9.065 23-24 0-1.604-.175-3.162-.389-4.917z"/>
                  <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.377 16.361 18.834 13 24 13c3.59 0 6.84 1.353 9.35 3.57l5.657-5.657C34.884 3.029 29.7 1 24 1 15.317 1 7.861 5.777 4.01 12.651l2.296 2.04z"/>
                  <path fill="#4CAF50" d="M24 49c5.115 0 9.81-1.743 13.49-4.72l-6.24-5.243C29.197 41.91 24.792 45 19.595 45c-7.016 0-12.94-5.026-14.51-11.742l-2.34 1.807C6.008 43.495 14.303 49 24 49z"/>
                  <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303c-1.32 3.91-5.725 7-10.922 7-5.057 0-9.395-3.23-10.95-7.726l-2.34 1.807C13.008 39.495 21.303 45 31 45c12.426 0 23-9.065 23-24 0-1.604-.175-3.162-.389-4.917z"/>
                </svg>
                Tiếp tục với Google
              </button>
          </form>

          <div className="auth__signup">
            <span>Đã có tài khoản? </span><a href="#signin">ĐĂNG NHẬP</a>
          </div>
          </div>
        </section>
      </div>

      <Footer />
    </div>
  );
}


