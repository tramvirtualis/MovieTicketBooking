import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import Header from '../components/Header.jsx';
import Footer from '../components/Footer.jsx';

export default function NotFound() {
  const navigate = useNavigate();

  const handleGoBack = () => {
    // Kiểm tra xem có history không, nếu không thì về trang chủ
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen cinema-mood">
      <Header />
      <main className="main">
        <section className="section">
          <div className="container" style={{ textAlign: 'center', padding: '80px 20px' }}>
            <div style={{ fontSize: '120px', fontWeight: 900, color: '#e83b41', marginBottom: '24px', lineHeight: 1 }}>
              404
            </div>
            <h1 style={{ fontSize: '32px', color: '#fff', marginBottom: '16px', fontWeight: 700 }}>
              Trang không tìm thấy
            </h1>
            <p style={{ fontSize: '18px', color: '#c9c4c5', marginBottom: '40px', maxWidth: '600px', margin: '0 auto 40px' }}>
              Trang bạn đang tìm kiếm không tồn tại hoặc đã bị xóa.
            </p>
            <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button
                className="btn btn--primary"
                onClick={handleGoBack}
                style={{ padding: '14px 28px', fontSize: '16px' }}
              >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: '8px', display: 'inline-block', verticalAlign: 'middle' }}>
                  <path d="M3 10h14M3 10l6-6M3 10l6 6"/>
                </svg>
                Trở về trang trước
              </button>
              <Link
                to="/"
                className="btn btn--ghost"
                style={{ padding: '14px 28px', fontSize: '16px', textDecoration: 'none', display: 'inline-block' }}
              >
                Về trang chủ
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}

