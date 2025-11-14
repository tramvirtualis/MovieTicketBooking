import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

export function Section({ id, title, linkText, children }) {
  return (
    <section className="section" id={id}>
      <div className="container">
        <div className="section__head">
          <h2 className="section__title">{title}</h2>
          {linkText ? (
            <a className="section__link" href="/">{linkText} →</a>
          ) : null}
        </div>
        {children}
      </div>
    </section>
  );
}

export function CardsGrid({ items, isNowShowing = false, onPlayTrailer }) {
  const navigate = useNavigate();
  const displayItems = items.slice(0, 5); // Chỉ hiển thị tối đa 5 phim
  return (
    <div className="grid grid--cards">
      {displayItems.map((m, idx) => (
        <div key={idx} className="card" style={{ position: 'relative' }}>
          <div 
            onClick={() => navigate(`/movie/${m.id || encodeURIComponent(m.title)}`)}
            style={{ textDecoration: 'none', display: 'block', cursor: 'pointer' }}
          >
            <div className="card__img-wrapper">
              {m.rating && (
                <span className="card__rating-badge">{m.rating}</span>
              )}
              <img src={m.poster} alt={m.title} className="card__img" />
              <div className="card__play-overlay">
                <div className="card__buttons">
                  <button 
                    className="card__play-btn"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      if (onPlayTrailer && m.trailerId) {
                        onPlayTrailer(m.trailerId);
                      }
                    }}
                    aria-label="Play trailer"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M8 5v14l11-7z"/>
                    </svg>
                  </button>
                  {isNowShowing && (
                    <button
                      className="card__book-btn"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        navigate(`/movie/${m.id || encodeURIComponent(m.title)}`);
                      }}
                    >
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M2 9a3 3 0 0 1 3-3h14a3 3 0 0 1 3 3v6a3 3 0 0 1-3 3H5a3 3 0 0 1-3-3V9z"/>
                        <path d="M6 9v6M18 9v6"/>
                      </svg>
                      <span>Đặt vé</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
            <div className="card__body">
              <h3 className="card__title">{m.title}</h3>
              {m.genre ? <p className="card__meta">{m.genre}</p> : null}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function HallsGrid({ items }) {
  return (
    <div className="grid grid--halls">
      {items.map((h, idx) => (
        <article key={idx} className="card hall">
          <img src={h.image} alt={h.name} className="card__img" />
          <div className="card__body">
            <h3 className="card__title">{h.name}</h3>
            {h.desc ? <p className="card__meta">{h.desc}</p> : null}
          </div>
        </article>
      ))}
    </div>
  );
}

export function PromosGrid({ items }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {items.map((p, idx) => (
        <div key={idx} className="promo-card bg-gradient-to-br from-[#2d2627] to-[#1a1415] border border-[#4a3f41] rounded-xl overflow-hidden hover:border-[#e83b41] transition-all duration-300 hover:shadow-lg hover:shadow-[#e83b41]/20">
          <div className="flex flex-col md:flex-row h-full">
            {/* Poster */}
            <div className="promo-card__poster w-full md:w-36 h-40 md:h-auto flex-shrink-0 overflow-hidden relative">
              <img
                src={p.image || 'https://via.placeholder.com/1000x430?text=Promotion'}
                alt={p.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-2 right-2 bg-[#4caf50] text-white text-[9px] px-2 py-0.5 rounded-md font-bold uppercase shadow-lg">
                Đang diễn ra
              </div>
            </div>
            
            {/* Content */}
            <div className="promo-card__content flex-1 flex flex-col justify-between p-4 min-w-0">
              <div className="flex-1">
                <h3 className="text-base font-bold text-white mb-2 line-clamp-2 leading-tight">{p.title}</h3>
                {p.desc && (
                  <p className="text-xs text-[#c9c4c5] line-clamp-2 leading-relaxed">{p.desc}</p>
                )}
              </div>
              
              {/* Button - Căn giữa */}
              <div className="mt-4 flex justify-center">
                <Link 
                  to="/events" 
                  className="inline-flex items-center justify-center bg-gradient-to-r from-[#e83b41] to-[#ff5258] hover:from-[#ff5258] hover:to-[#ff6b6b] text-white text-xs font-semibold py-2 px-4 rounded-lg transition-all duration-200 hover:scale-105 active:scale-95 shadow-md hover:shadow-lg"
                >
                  Xem chi tiết
                </Link>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

