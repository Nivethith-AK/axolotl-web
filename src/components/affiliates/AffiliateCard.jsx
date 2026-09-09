import React, { useState, useEffect } from 'react';

export const AffiliateCard = ({
  person,
  isDimmed,
  isActive,
  onMouseEnter,
  onMouseLeave,
  onClick,
}) => {
  const [showingAlt, setShowingAlt] = useState(false);
  const [isGlitching, setIsGlitching] = useState(false);

  useEffect(() => {
    if (!person.altImage) return;

    const interval = setInterval(() => {
      if (isDimmed) return;
      setIsGlitching(true);
      setTimeout(() => {
        setShowingAlt((prev) => !prev);
        setIsGlitching(false);
      }, 80);
    }, 2200 + Math.random() * 500);

    return () => clearInterval(interval);
  }, [person.altImage, isDimmed]);

  if (person.noSignal) {
    return (
      <div className="aff-panel aff-panel-nosignal">
        <div className="aff-panel-bg"></div>
        <div className="aff-nosignal-text">NO_SIGNAL</div>
      </div>
    );
  }

  const name = showingAlt ? person.altName : person.name;
  const image = showingAlt ? person.altImage : person.image;
  const accent = showingAlt ? person.altAccent || person.accent : person.accent || '#ff6b00';

  return (
    <div
      className={`aff-panel ${isDimmed ? 'aff-dimmed' : ''} ${isActive ? 'aff-active' : ''} ${isGlitching ? 'raven-glitch' : ''}`}
      style={{ '--accent': accent }}
      data-aff-id={person.name}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onClick={onClick}
    >
      <div className="aff-panel-bg"></div>
      {image ? (
        <img
          src={`/images/${image}`}
          className="aff-panel-cover"
          alt={name}
          loading="lazy"
          onError={(e) => {
            e.target.style.display = 'none';
            if (e.target.nextElementSibling) {
              e.target.nextElementSibling.style.display = 'flex';
            }
          }}
        />
      ) : null}
      <div
        className="aff-panel-initial"
        style={{ display: image ? 'none' : 'flex', color: accent }}
      >
        {name.charAt(0)}
      </div>

      <div className="aff-panel-overlay"></div>
      <div className="aff-panel-accent" style={{ background: accent }}></div>
      <div className="aff-panel-content">
        <div className="aff-panel-name">{name}</div>
        <div className="aff-panel-role">{person.role}</div>
      </div>
      {person.affiliation && (
        <img
          src={`/images/${person.affiliation.badge}`}
          className="aff-panel-affbadge"
          alt={person.affiliation.name}
          title={person.affiliation.name}
        />
      )}
    </div>
  );
};
