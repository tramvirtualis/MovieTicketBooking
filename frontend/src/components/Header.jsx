import React from 'react';

export default function Header() {
  return (
    <header className="site-header">
      <div className="container nav">
        <a className="logo" href="#home">🎬 cinesmart</a>
        <nav className="menu">
          <a href="#booking">Đặt vé phim chiếu rạp</a>
          <a href="#schedule">Lịch chiếu phim</a>
          <a href="#cinemas">Rạp</a>
          <a href="#news">Tin tức</a>
          <a href="#community">Cộng đồng</a>
        </nav>
        <div className="actions">
          <a className="btn btn--ghost" href="#register">Đăng ký</a>
          <a className="btn btn--primary" href="#signin">Đăng nhập</a>
        </div>
      </div>
    </header>
  );
}


