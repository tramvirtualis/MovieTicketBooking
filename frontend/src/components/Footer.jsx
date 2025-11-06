import React from 'react';

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer__grid">
        <div className="footer__col">
          <h4>Phim</h4>
          <a href="#now-showing">Đang chiếu</a>
          <a href="#coming-soon">Sắp chiếu</a>
          <a href="#promotions">Ưu đãi</a>
        </div>
        <div className="footer__col">
          <h4>Công ty</h4>
          <a href="#about">Giới thiệu</a>
          <a href="#contact">Liên hệ</a>
          <a href="#support">Hỗ trợ</a>
        </div>
        <div className="footer__col">
          <h4>Kết nối</h4>
          <div className="social">
            <a aria-label="Facebook" href="#" className="icon fb">f</a>
            <a aria-label="Instagram" href="#" className="icon ig">◐</a>
            <a aria-label="YouTube" href="#" className="icon yt">▶</a>
            <a aria-label="X" href="#" className="icon x">x</a>
          </div>
        </div>
      </div>
      <p className="copyright">© 2025 MovieClub Cinemas • Bảo lưu mọi quyền</p>
    </footer>
  );
}


