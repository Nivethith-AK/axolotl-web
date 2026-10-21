import React from 'react';
import { useAliasCycle } from './useAliasCycle';

export const AffiliateCard = ({
  person,
  isDimmed,
  isActive,
  staggerIndex = 0,
  onMouseEnter,
  onMouseLeave,
  onClick,
}) => {
  // Flips between main and alias every ~2s; skips while dimmed by a hover elsewhere.
  const { showingAlias, isGlitching } = useAliasCycle({
    enabled: Boolean(person.altImage),
    paused: isDimmed,
    baseMs: 2200, // cards flip a bit slower than the index marquee (2000)
    jitterMs: 500,
  });

  if (person.noSignal) {
    return (
      <div className="aff-panel aff-panel-nosignal" style={{ '--stagger-idx': staggerIndex }}>
        <div className="aff-panel-bg"></div>
        <div className="aff-nosignal-text">NO_SIGNAL</div>
      </div>
    );
  }

  const name = showingAlias ? person.altName : person.name;
  const image = showingAlias ? person.altImage : person.image;
  const accent = showingAlias ? person.altAccent || person.accent || '#ff6b00' : person.accent || '#ff6b00';

  return (
    <div
      className={`aff-panel ${isDimmed ? 'aff-dimmed' : ''} ${isActive ? 'aff-active' : ''} ${isGlitching ? 'alias-glitch' : ''}`}
      style={{ '--accent': accent, '--stagger-idx': staggerIndex }}
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
          decoding="async"
          width="200"
          height="220"
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
          loading="lazy"
          decoding="async"
          width="24"
          height="24"
        />
      )}
    </div>
  );
};
