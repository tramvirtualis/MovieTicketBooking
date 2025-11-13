import React, { useState, useEffect } from 'react';
import Footer from '../components/Footer.jsx';
import authService from '../services/authService';

export default function SignUp() {
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [isResendDisabled, setIsResendDisabled] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [errors, setErrors] = useState({});

  const [formData, setFormData] = useState({
    fullName: '',
    dob: '',
    mobile: '',
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    otp: ''
  });

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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const showMessage = (type, text) => {
    setMessage({ type, text });
    setTimeout(() => setMessage({ type: '', text: '' }), 5000);
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Họ và tên không được để trống';
    } else if (formData.fullName.length < 2 || formData.fullName.length > 100) {
      newErrors.fullName = 'Họ và tên phải từ 2 đến 100 ký tự';
    }

    if (!formData.dob) {
      newErrors.dob = 'Ngày sinh không được để trống';
    } else if (new Date(formData.dob) >= new Date()) {
      newErrors.dob = 'Ngày sinh phải là ngày trong quá khứ';
    }

    const phoneRegex = /^(0[3|5|7|8|9])+([0-9]{8})$/;
    if (!formData.mobile.trim()) {
      newErrors.mobile = 'Số điện thoại không được để trống';
    } else if (!phoneRegex.test(formData.mobile)) {
      newErrors.mobile = 'Số điện thoại không hợp lệ (VD: 0901234567)';
    }

    const usernameRegex = /^[a-zA-Z0-9_]+$/;
    if (!formData.username.trim()) {
      newErrors.username = 'Tên đăng nhập không được để trống';
    } else if (formData.username.length < 4 || formData.username.length > 32) {
      newErrors.username = 'Tên đăng nhập phải từ 4 đến 32 ký tự';
    } else if (!usernameRegex.test(formData.username)) {
      newErrors.username = 'Tên đăng nhập chỉ chứa chữ cái, số và dấu gạch dưới';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = 'Email không được để trống';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Email không hợp lệ';
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/;
    if (!formData.password) {
      newErrors.password = 'Mật khẩu không được để trống';
    } else if (formData.password.length < 8 || formData.password.length > 32) {
      newErrors.password = 'Mật khẩu phải từ 8 đến 32 ký tự';
    } else if (!passwordRegex.test(formData.password)) {
      newErrors.password = 'Mật khẩu phải chứa ít nhất 1 chữ hoa, 1 chữ thường và 1 số';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Xác nhận mật khẩu không được để trống';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Mật khẩu xác nhận không khớp';
    }

    if (!formData.otp.trim()) {
      newErrors.otp = 'Mã OTP không được để trống';
    } else if (formData.otp.length !== 6) {
      newErrors.otp = 'Mã OTP phải có 6 ký tự';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSendOTP = async () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      setErrors(prev => ({ ...prev, email: 'Vui lòng nhập email' }));
      showMessage('error', 'Vui lòng nhập email');
      return;
    }
    if (!emailRegex.test(formData.email)) {
      setErrors(prev => ({ ...prev, email: 'Email không hợp lệ' }));
      showMessage('error', 'Email không hợp lệ');
      return;
    }

    setLoading(true);
    const result = await authService.sendOtp(formData.email);
    setLoading(false);

    if (result.success) {
      showMessage('success', result.data.message || 'Mã OTP đã được gửi đến email của bạn');
      setIsResendDisabled(true);
      setCountdown(30);
    } else {
      showMessage('error', result.error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      showMessage('error', 'Vui lòng kiểm tra lại thông tin');
      return;
    }

    setLoading(true);
    const result = await authService.register(formData);
    setLoading(false);

    if (result.success) {
      showMessage('success', result.data.message || 'Đăng ký thành công! Đang chuyển hướng...');
      setTimeout(() => {
        window.location.hash = '#signin';
      }, 2000);
    } else {
      showMessage('error', result.error);
    }
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
              <div className="auth__form--two-col">
                <label className="field">
                  <span className="field__label">Họ và tên *</span>
                  <input
                    className={`field__input ${errors.fullName ? 'field__input--error' : ''}`}
                    type="text"
                    name="fullName"
                    placeholder="Nhập họ và tên"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    required
                  />
                  {errors.fullName && <span className="field__error">{errors.fullName}</span>}
                </label>

                <label className="field">
                  <span className="field__label">Ngày sinh *</span>
                  <input
                    className={`field__input ${errors.dob ? 'field__input--error' : ''}`}
                    type="date"
                    name="dob"
                    value={formData.dob}
                    onChange={handleInputChange}
                    required
                  />
                  {errors.dob && <span className="field__error">{errors.dob}</span>}
                </label>
              </div>

              <div className="auth__form--two-col">
                <label className="field">
                  <span className="field__label">Số điện thoại *</span>
                  <input
                    className={`field__input ${errors.mobile ? 'field__input--error' : ''}`}
                    type="tel"
                    name="mobile"
                    placeholder="VD: 0901234567"
                    value={formData.mobile}
                    onChange={handleInputChange}
                    required
                  />
                  {errors.mobile && <span className="field__error">{errors.mobile}</span>}
                </label>

                <label className="field">
                  <span className="field__label">Tên đăng nhập *</span>
                  <input
                    className={`field__input ${errors.username ? 'field__input--error' : ''}`}
                    type="text"
                    name="username"
                    placeholder="4-32 ký tự, chỉ a-z, 0-9, _"
                    value={formData.username}
                    onChange={handleInputChange}
                    required
                  />
                  {errors.username && <span className="field__error">{errors.username}</span>}
                </label>
              </div>

              <label className="field">
                <span className="field__label">Email *</span>
                <input
                  className={`field__input ${errors.email ? 'field__input--error' : ''}`}
                  type="email"
                  name="email"
                  placeholder="Nhập email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
                {errors.email && <span className="field__error">{errors.email}</span>}
              </label>

              <label className="field">
                <span className="field__label">Mật khẩu * (8-32 ký tự, có chữ hoa, chữ thường, số)</span>
                <div style={{ position: 'relative' }}>
                  <input
                    className={`field__input ${errors.password ? 'field__input--error' : ''}`}
                    type={showPass ? 'text' : 'password'}
                    name="password"
                    placeholder="Tạo mật khẩu"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                    minLength={8}
                    maxLength={32}
                    style={{ paddingRight: '44px' }}
                  />
                  <button
                    type="button"
                    aria-label={showPass ? 'Hide password' : 'Show password'}
                    onClick={() => setShowPass((v) => !v)}
                    style={{
                      position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)',
                      background: 'transparent', color: '#c9c4c5', border: 0, cursor: 'pointer',
                      width: '24px', height: '24px', display: 'grid', placeItems: 'center'
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
                {errors.password && <span className="field__error">{errors.password}</span>}
              </label>

              <label className="field">
                <span className="field__label">Xác nhận mật khẩu *</span>
                <div style={{ position: 'relative' }}>
                  <input
                    className={`field__input ${errors.confirmPassword ? 'field__input--error' : ''}`}
                    type={showConfirm ? 'text' : 'password'}
                    name="confirmPassword"
                    placeholder="Nhập lại mật khẩu"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    required
                    style={{ paddingRight: '44px' }}
                  />
                  <button
                    type="button"
                    aria-label={showConfirm ? 'Hide password' : 'Show password'}
                    onClick={() => setShowConfirm((v) => !v)}
                    style={{
                      position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)',
                      background: 'transparent', color: '#c9c4c5', border: 0, cursor: 'pointer',
                      width: '24px', height: '24px', display: 'grid', placeItems: 'center'
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
                {errors.confirmPassword && <span className="field__error">{errors.confirmPassword}</span>}
              </label>

              <label className="field">
                <span className="field__label">Mã OTP *</span>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                  <div style={{ flex: 1 }}>
                    <input
                      className={`field__input ${errors.otp ? 'field__input--error' : ''}`}
                      type="text"
                      name="otp"
                      placeholder="Nhập mã OTP (6 số)"
                      value={formData.otp}
                      onChange={handleInputChange}
                      required
                      maxLength={6}
                    />
                    {errors.otp && <span className="field__error">{errors.otp}</span>}
                  </div>
                  <button
                    type="button"
                    onClick={handleSendOTP}
                    disabled={isResendDisabled || loading}
                    className="btn"
                    style={{
                      padding: '14px 16px',
                      background: (isResendDisabled || loading) ? '#2a2223' : 'transparent',
                      color: (isResendDisabled || loading) ? '#6b575a' : '#c9c4c5',
                      border: '1px solid rgba(255,255,255,0.25)',
                      cursor: (isResendDisabled || loading) ? 'not-allowed' : 'pointer',
                      whiteSpace: 'nowrap',
                      opacity: (isResendDisabled || loading) ? 0.5 : 1
                    }}
                  >
                    {loading ? 'Đang gửi...' : isResendDisabled ? `Gửi lại (${countdown}s)` : 'Gửi OTP'}
                  </button>
                </div>
              </label>

              <button 
                className="btn btn--primary" 
                type="submit"
                disabled={loading}
                style={{
                  opacity: loading ? 0.7 : 1,
                  cursor: loading ? 'not-allowed' : 'pointer'
                }}
              >
                {loading ? 'Đang xử lý...' : 'Đăng ký'}
              </button>
              
              <button 
                type="button" 
                className="btn btn--google" 
                aria-label="Continue with Google" 
                style={{ marginTop: '8px' }}
                disabled
              >
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