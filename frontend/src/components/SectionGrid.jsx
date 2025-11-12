import React from 'react';

export function Section({ id, title, linkText, children }) {
  return (
    <section className="section" id={id}>
      <div className="container">
        <div className="section__head">
          <h2 className="section__title">{title}</h2>
          {linkText ? (
            <a className="section__link" href="#">{linkText} →</a>
          ) : null}
        </div>
        {children}
      </div>
    </section>
  );
}

export function CardsGrid({ items, isNowShowing = false, onPlayTrailer }) {
  const displayItems = items.slice(0, 5); // Chỉ hiển thị tối đa 5 phim
  return (
    <div className="grid grid--cards">
      {displayItems.map((m, idx) => (
        <a key={idx} href={`#movie?title=${encodeURIComponent(m.title)}`} className="card" style={{ textDecoration: 'none' }}>
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
                  <a
                    href={`#movie?title=${encodeURIComponent(m.title)}`}
                    className="card__book-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                    }}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M2 9a3 3 0 0 1 3-3h14a3 3 0 0 1 3 3v6a3 3 0 0 1-3 3H5a3 3 0 0 1-3-3V9z"/>
                      <path d="M6 9v6M18 9v6"/>
                    </svg>
                    <span>Đặt vé</span>
                  </a>
                )}
              </div>
            </div>
          </div>
          <div className="card__body">
            <h3 className="card__title">{m.title}</h3>
            {m.genre ? <p className="card__meta">{m.genre}</p> : null}
          </div>
        </a>
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
    <div className="movie-grid">
      {items.map((p, idx) => (
        <div key={idx} className="movie-card">
          <div
            className="movie-card__poster"
            style={{ width: '100%', height: '160px', overflow: 'hidden', position: 'relative', padding: 0 }}
          >
            <img
              src={p.image || 'https://via.placeholder.com/1000x430?text=Promotion'}
              alt={p.title}
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            />
            <div className="movie-card__status" style={{ backgroundColor: '#4caf50' }}>
              Đang diễn ra
            </div>
          </div>
          <div className="movie-card__content">
            <h3 className="movie-card__title">{p.title}</h3>
            {p.desc ? <div className="movie-card__director">{p.desc}</div> : null}
            <a href="#events" className="btn btn--primary" style={{ width: '100%', marginTop: '12px', textAlign: 'center', display: 'block', textDecoration: 'none' }}>
              Xem chi tiết
            </a>
          </div>
        </div>
      ))}
    </div>
  );
}


