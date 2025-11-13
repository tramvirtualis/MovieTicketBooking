import React, { useState } from 'react';
import Footer from '../components/Footer.jsx';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!email) {
      setError('Vui lòng nhập email');
      return;
    }

    // TODO: Gọi API gửi email đặt lại mật khẩu
    // fetch('/api/forgot-password', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ email })
    // })
    //   .then(res => res.json())
    //   .then(data => {
    //     if (data.success) {
    //       setIsSubmitted(true);
    //     } else {
    //       setError(data.message || 'Có lỗi xảy ra');
    //     }
    //   })
    //   .catch(err => {
    //     setError('Có lỗi xảy ra. Vui lòng thử lại sau.');
    //   });

    // Simulate API call - generate a token and redirect to reset password
    setTimeout(() => {
      setIsSubmitted(true);
      // Generate a mock token (in real app, this would come from the backend)
      const mockToken = 'reset_token_' + Date.now();
      // Redirect to reset password page with token
      setTimeout(() => {
        window.location.hash = `#reset-password?token=${mockToken}`;
      }, 2000);
    }, 1000);
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen cinema-mood">
        <div className="split">
          <section className="intro">
            <div className="intro__content">
              <h1 className="intro__title">EMAIL ĐÃ<br/>ĐƯỢC GỬI</h1>
              <p className="intro__subtitle">Vui lòng kiểm tra email của bạn để đặt lại mật khẩu</p>
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
                  background: 'linear-gradient(135deg, #2196f3, #1976d2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 24px',
                  boxShadow: '0 4px 20px rgba(33, 150, 243, 0.3)'
                }}>
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                    <polyline points="22,6 12,13 2,6"/>
                  </svg>
                </div>
                <h2 className="auth__title" style={{ marginBottom: '16px' }}>ĐÃ GỬI EMAIL</h2>
                <p className="auth__subtitle" style={{ marginBottom: '32px' }}>
                  Chúng tôi đã gửi link đặt lại mật khẩu đến email <strong>{email}</strong>. 
                  Vui lòng kiểm tra hộp thư và làm theo hướng dẫn.
                </p>
                <p style={{ color: '#c9c4c5', fontSize: '13px', marginBottom: '24px' }}>
                  Đang chuyển hướng đến trang đặt lại mật khẩu...
                </p>
                <button 
                  className="btn btn--ghost" 
                  onClick={() => { window.location.hash = '#signin'; }}
                  style={{ width: '100%' }}
                >
                  Quay lại đăng nhập
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
            <p className="intro__subtitle">Nhập email của bạn và chúng tôi sẽ gửi link đặt lại mật khẩu</p>
          </div>
          <div className="intro__popcorn" aria-hidden="true"></div>
        </section>

        <section className="auth">
          <div className="auth__panel">
            <button className="close" aria-label="Đóng" onClick={() => { window.location.hash = ''; }}>×</button>
            <h2 className="auth__title">QUÊN MẬT KHẨU</h2>
            <p className="auth__subtitle">Chúng tôi sẽ gửi email hướng dẫn đặt lại mật khẩu cho bạn</p>

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
                <span className="field__label">Email</span>
                <input
                  className="field__input"
                  type="email"
                  name="email"
                  placeholder="Nhập email của bạn"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </label>

              <button className="btn btn--primary" type="submit">Gửi link đặt lại</button>
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

