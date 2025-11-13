import React, { useState, useEffect } from 'react';
import Footer from '../components/Footer.jsx';

export default function ResetPassword() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [token, setToken] = useState('');

  useEffect(() => {
    // Lấy token từ URL query parameter
    const urlParams = new URLSearchParams(window.location.search);
    const tokenFromUrl = urlParams.get('token');
    if (tokenFromUrl) {
      setToken(tokenFromUrl);
    } else {
      // Nếu không có token, có thể lấy từ hash hoặc redirect về forgot password
      const hash = window.location.hash;
      if (hash.includes('token=')) {
        const hashParams = new URLSearchParams(hash.substring(1));
        const tokenFromHash = hashParams.get('token');
        if (tokenFromHash) {
          setToken(tokenFromHash);
        }
      }
    }
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!password || !confirmPassword) {
      setError('Vui lòng nhập đầy đủ thông tin');
      return;
    }

    if (password.length < 6) {
      setError('Mật khẩu phải có ít nhất 6 ký tự');
      return;
    }

    if (password !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp');
      return;
    }

    if (!token) {
      setError('Token không hợp lệ. Vui lòng yêu cầu link đặt lại mật khẩu mới.');
      return;
    }

    // TODO: Gọi API đặt lại mật khẩu
    // fetch('/api/reset-password', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ token, password })
    // })
    //   .then(res => res.json())
    //   .then(data => {
    //     if (data.success) {
    //       setSuccess(true);
    //     } else {
    //       setError(data.message || 'Có lỗi xảy ra');
    //     }
    //   })
    //   .catch(err => {
    //     setError('Có lỗi xảy ra. Vui lòng thử lại sau.');
    //   });

    // Simulate API call
    setTimeout(() => {
      setSuccess(true);
    }, 1000);
  };

  if (success) {
    return (
      <div className="min-h-screen cinema-mood">
        <div className="split">
          <section className="intro">
            <div className="intro__content">
              <h1 className="intro__title">ĐẶT LẠI<br/>MẬT KHẨU<br/>THÀNH CÔNG</h1>
              <p className="intro__subtitle">Mật khẩu của bạn đã được đặt lại thành công</p>
            </div>
            <div className="intro__popcorn" aria-hidden="true"></div>
          </section>

          <section className="auth">
            <div className="auth__panel">
              <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                <div style={{ 
                  width: '80px', 
                  height: '80px', 
                  borderRadius: '50%', 
                  background: 'linear-gradient(135deg, #4caf50, #45a049)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 24px',
                  boxShadow: '0 4px 20px rgba(76, 175, 80, 0.3)'
                }}>
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                </div>
                <h2 className="auth__title" style={{ marginBottom: '16px' }}>THÀNH CÔNG!</h2>
                <p className="auth__subtitle" style={{ marginBottom: '32px' }}>
                  Mật khẩu của bạn đã được đặt lại thành công. Bạn có thể đăng nhập ngay bây giờ.
                </p>
                <button 
                  className="btn btn--primary" 
                  onClick={() => { window.location.hash = '#signin'; }}
                  style={{ width: '100%' }}
                >
                  Đăng nhập ngay
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
            <p className="intro__subtitle">Nhập mật khẩu mới của bạn</p>
          </div>
          <div className="intro__popcorn" aria-hidden="true"></div>
        </section>

        <section className="auth">
          <div className="auth__panel">
            <button className="close" aria-label="Đóng" onClick={() => { window.location.hash = ''; }}>×</button>
            <h2 className="auth__title">ĐẶT LẠI MẬT KHẨU</h2>
            <p className="auth__subtitle">Nhập mật khẩu mới cho tài khoản của bạn</p>

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

            <form className="auth__form" action="#" method="post" autoComplete="on" onSubmit={handleSubmit}>
              <label className="field">
                <span className="field__label">Mật khẩu mới</span>
                <div style={{ position: 'relative' }}>
                  <input
                    className="field__input"
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    placeholder="Nhập mật khẩu mới (tối thiểu 6 ký tự)"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    style={{ paddingRight: '44px' }}
                  />
                  <button
                    type="button"
                    aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                    onClick={() => setShowPassword((v) => !v)}
                    style={{
                      position: 'absolute',
                      right: '10px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'transparent',
                      color: '#c9c4c5',
                      border: '0',
                      cursor: 'pointer',
                      padding: '4px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    {showPassword ? (
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
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    placeholder="Nhập lại mật khẩu mới"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    style={{ paddingRight: '44px' }}
                  />
                  <button
                    type="button"
                    aria-label={showConfirmPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                    onClick={() => setShowConfirmPassword((v) => !v)}
                    style={{
                      position: 'absolute',
                      right: '10px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'transparent',
                      color: '#c9c4c5',
                      border: '0',
                      cursor: 'pointer',
                      padding: '4px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    {showConfirmPassword ? (
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

              <button className="btn btn--primary" type="submit">Đặt lại mật khẩu</button>
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

