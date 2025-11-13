import React, { useState } from 'react';
import Footer from '../components/Footer.jsx';
import authService from '../services/authService.js'; // ✅ import service bạn đã có

export default function SignIn() {
  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 5000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: '', text: '' });

    const result = await authService.login(username, password);

    if (result.success) {
      showMessage('success', 'Đăng nhập thành công!');
      const user = result.data;
    
      localStorage.setItem('user', JSON.stringify(user));
    
      // Redirect theo role sau 1 giây để người dùng thấy thông báo
      setTimeout(() => {
        if (user.role === 'ADMIN') window.location.href = '/admin';
        else if (user.role === 'MANAGER') window.location.href = '/manager';
        else window.location.href = '/';
      }, 1000);
    } else {
      showMessage('error', result.error || 'Tên đăng nhập hoặc mật khẩu không đúng');
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen cinema-mood">
      <div className="split">
        <section className="intro">
          <div className="intro__content">
            <h1 className="intro__title">ĐĂNG NHẬP<br/>THẬT ĐƠN GIẢN</h1>
            <p className="intro__subtitle">Bạn chỉ cần nhập username và password!</p>
          </div>
          <div className="intro__popcorn" aria-hidden="true"></div>
        </section>

        <section className="auth">
          <div className="auth__panel">
            <button className="close" aria-label="Close" onClick={() => { window.location.hash = ''; }}>×</button>
            <h2 className="auth__title">Đăng nhập</h2>
            <p className="auth__subtitle">Truy cập quyền lợi và ưu đãi Cinesmart</p>

            {message.text && (
              <div style={{
                padding: '12px',
                marginBottom: '16px',
                borderRadius: '4px',
                backgroundColor: message.type === 'success' ? '#1a472a' : '#4a1a1a',
                color: message.type === 'success' ? '#4ade80' : '#f87171',
                border: `1px solid ${message.type === 'success' ? '#22c55e' : '#ef4444'}`
              }}>
                {message.text}
              </div>
            )}

            <form className="auth__form" onSubmit={handleSubmit} autoComplete="on">
              <label className="field">
                <span className="field__label">Tên đăng nhập</span>
                <input
                  className="field__input"
                  type="text"
                  name="username"
                  placeholder="Nhập tên đăng nhập"
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    e.target.setCustomValidity('');
                  }}
                  onInvalid={(e) => e.target.setCustomValidity('Vui lòng nhập tên đăng nhập')}
                  required
                />
              </label>

              <label className="field">
                <span className="field__label">Mật khẩu</span>
                <div style={{ position: 'relative' }}>
                  <input
                    className="field__input"
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    placeholder="Nhập mật khẩu"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      e.target.setCustomValidity('');
                    }}
                    onInvalid={(e) => e.target.setCustomValidity('Vui lòng nhập mật khẩu')}
                    required
                    style={{ paddingRight: '44px' }}
                  />
                  <button
                    type="button"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
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
                      padding: 0,
                      width: '24px',
                      height: '24px',
                      display: 'grid',
                      placeItems: 'center'
                    }}
                  >
                    {showPassword ? (
                      <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
                        <path d="M12 5c-7 0-10 7-10 7s2.1 3.9 6.1 5.7l-1.5 1.5 1.4 1.4 14-14-1.4-1.4-2.1 2.1C16.7 5.5 14.4 5 12 5zm0 4c.6 0 1.1.2 1.6.4l-3.2 3.2c-.2-.5-.4-1-.4-1.6 0-1.7 1.3-3 3-3zm0 10c7 0 10-7 10-7s-1-1.9-3-3.7l-1.4 1.4C19.2 10 20 12 20 12s-2.6 5-8 5c-1 0-1.9-.2-2.7-.5l-1.6 1.6C9 18.7 10.5 19 12 19z"/>
                      </svg>
                    ) : (
                      <svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor">
                        <path d="M12 5c-7 0-10 7-10 7s3 7 10 7 10-7 10-7-3-7-10-7zm0 12c-2.8 0-5-2.2-5-5s2.2-5 5-5 5 2.2 5 5-2.2 5-5 5zm0-8c-1.7 0-3 1.3-3 3s1.3 3 3 3 3-1.3 3-3-1.3-3-3-3z"/>
                      </svg>
                    )}
                  </button>
                </div>
              </label>

              <div className="auth__forgot">
                <a href="#forgot">Quên mật khẩu?</a>
              </div>

              <button className="btn btn--primary" type="submit" disabled={loading}>
                {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
              </button>

              <button type="button" className="btn btn--google" aria-label="Continue with Google" style={{ marginTop: '8px' }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 48 48" aria-hidden="true">
                  <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303C33.602 31.91 29.197 35 24 35 16.82 35 11 29.18 11 22S16.82 9 24 9c3.59 0 6.84 1.353 9.35 3.57l5.657-5.657C34.884 3.029 29.7 1 24 1 10.745 1 0 11.745 0 25s10.745 24 24 24c12.426 0 23-9.065 23-24 0-1.604-.175-3.162-.389-4.917z"/>
                </svg>
                Tiếp tục với Google
              </button>
            </form>

            <div className="auth__signup">
              <span>NGƯỜI MỚI? </span><a href="#register">ĐĂNG KÝ</a>
            </div>
          </div>
        </section>
      </div>

      <Footer />
    </div>
  );
}
