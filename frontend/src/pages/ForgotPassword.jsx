import React, { useState } from 'react';
import Footer from '../components/Footer.jsx';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');

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

            <form className="auth__form" action="#" method="post" autoComplete="on" onSubmit={(e) => e.preventDefault()}>
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

