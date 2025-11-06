import React from 'react';
import Header from './components/Header.jsx';
import HeroCarousel from './components/HeroCarousel.jsx';
import Footer from './components/Footer.jsx';
import { Section, CardsGrid, HallsGrid, PromosGrid } from './components/SectionGrid.jsx';
import interstellar from './assets/images/interstellar.jpg';
import inception from './assets/images/inception.jpg';
import darkKnightRises from './assets/images/the-dark-knight-rises.jpg';
import driveMyCar from './assets/images/drive-my-car.jpg';

const nowShowing = [
  { title: 'Interstellar', genre: 'Sci‑Fi', poster: interstellar },
  { title: 'Inception', genre: 'Action', poster: inception },
  { title: 'The Dark Knight Rises', genre: 'Action', poster: darkKnightRises },
  { title: 'Drive My Car', genre: 'Drama', poster: driveMyCar }
];

const comingSoon = [
  { title: 'Wicked', genre: 'Fantasy', poster: 'https://image.tmdb.org/t/p/w500/9azEue8jX6n8WcN6iYG3PaY5E9R.jpg' },
  { title: 'Gladiator II', genre: 'Drama', poster: 'https://image.tmdb.org/t/p/w500/iADOJ8Zymht2JPMoy3R7xceZprc.jpg' },
  { title: 'Moana 2', genre: 'Animation', poster: 'https://image.tmdb.org/t/p/w500/6KAnr4PjkY3S2wPqDq3PcTzu3rG.jpg' },
  { title: 'Nosferatu', genre: 'Horror', poster: 'https://image.tmdb.org/t/p/w500/pQx6fJ5S9t8uKXuX4nHCqB6Sm9D.jpg' },
  { title: 'Superman', genre: 'Superhero', poster: 'https://image.tmdb.org/t/p/w500/okA8m4cC5hW6RtWLpmjDoE7YQD6.jpg' }
];

const halls = [
  { name: 'IMAX', desc: 'Màn hình lớn, âm thanh vòm sống động', image: 'https://images.unsplash.com/photo-1517602302552-471fe67acf66?q=80&w=1200&auto=format&fit=crop' },
  { name: '4DX', desc: 'Chuyển động, hiệu ứng gió và nước', image: 'https://images.unsplash.com/photo-1517601641458-309ba0be7f87?q=80&w=1200&auto=format&fit=crop' },
  { name: 'Dolby Atmos', desc: 'Âm thanh đa chiều chân thực', image: 'https://images.unsplash.com/photo-1526591674518-6c8a86a1a3a7?q=80&w=1200&auto=format&fit=crop' }
];

const promos = [
  { title: 'Mua 2 tặng 1 vé', desc: 'Áp dụng cuối tuần', image: 'https://images.unsplash.com/photo-1511735111819-9a3f7709049c?q=80&w=200&auto=format&fit=crop' },
  { title: 'Giảm 30% combo bắp nước', desc: 'Thành viên hạng Gold', image: 'https://images.unsplash.com/photo-1512428559087-560fa5ceab42?q=80&w=200&auto=format&fit=crop' }
];

export default function App() {
  return (
    <div className="min-h-screen cinema-mood">
      <Header />
      <HeroCarousel posters={[interstellar, inception, darkKnightRises, driveMyCar]} />
      <main className="main">
        <Section id="now-showing" title="Phim Đang Chiếu" linkText="Xem tất cả">
          <CardsGrid items={nowShowing} />
        </Section>
        <Section id="coming-soon" title="Phim Sắp Chiếu" linkText="Xem tất cả">
          <CardsGrid items={comingSoon} />
        </Section>
        <Section id="experience" title="Trải Nghiệm Các Phòng Chiếu">
          <HallsGrid items={halls} />
        </Section>
        <Section id="promotions" title="Chương Trình Ưu Đãi">
          <PromosGrid items={promos} />
        </Section>
      </main>
      <Footer />
    </div>
  );
}
