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

export function CardsGrid({ items }) {
  return (
    <div className="grid grid--cards">
      {items.map((m, idx) => (
        <a key={idx} href={`#movie?title=${encodeURIComponent(m.title)}`} className="card" style={{ textDecoration: 'none' }}>
          <img src={m.poster} alt={m.title} className="card__img" />
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
    <div className="grid grid--promos">
      {items.map((p, idx) => (
        <article key={idx} className="card promo">
          <img src={p.image} alt={p.title} className="card__img" />
          <div className="card__body">
            <h3 className="card__title">{p.title}</h3>
            {p.desc ? <p className="card__meta">{p.desc}</p> : null}
          </div>
        </article>
      ))}
    </div>
  );
}


