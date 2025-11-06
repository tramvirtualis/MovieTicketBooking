import React from 'react';
import Header from '../components/Header.jsx';
import Footer from '../components/Footer.jsx';

const cinemas = [
  { name: 'Quốc Thanh', province: 'TP.HCM' },
  { name: 'Hai Bà Trưng', province: 'TP.HCM' },
  { name: 'Sinh Viên', province: 'TP.HCM' },
  { name: 'Satra Quận 6', province: 'TP.HCM' },
  { name: 'Huế', province: 'TP. Huế' },
  { name: 'Đà Lạt', province: 'Lâm Đồng' },
  { name: 'Mỹ Tho', province: 'Đồng Tháp' },
  { name: 'Lâm Đồng', province: 'Đức Trọng' },
  { name: 'Kiên Giang', province: 'An Giang' },
];

export default function Cinemas() {
  return (
    <div className="min-h-screen cinema-mood">
      <Header />

      <main className="main">
        <section className="section section--compact">
          <div className="container">
            <h1 className="section__title" style={{ fontSize: '24px', marginBottom: '16px' }}>Danh sách rạp</h1>
            <div className="cinemas-grid">
              {cinemas.map((cinema, idx) => (
                <a
                  key={idx}
                  href={`#cinema?name=${encodeURIComponent(cinema.name)}&province=${encodeURIComponent(cinema.province)}`}
                  className="cinema-item-link"
                >
                  Cinestar {cinema.name} ({cinema.province})
                </a>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

