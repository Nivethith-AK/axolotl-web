import React, { useState, useEffect } from 'react';
import { toSlug } from '../../data/affiliatesData';
import { ScrollArea } from '@/components/ui/scroll-area';

const COUNTRY_FLAGS = {
  japan: 'jp', japanese: 'jp',
  usa: 'us', us: 'us', 'united states': 'us', american: 'us',
  canada: 'ca', canadian: 'ca',
  uk: 'gb', 'united kingdom': 'gb', british: 'gb', england: 'gb',
  australia: 'au', australian: 'au',
  philippines: 'ph', filipino: 'ph',
  china: 'cn', chinese: 'cn',
  taiwan: 'tw', taiwanese: 'tw',
  'south korea': 'kr', korea: 'kr', korean: 'kr',
  indonesia: 'id', indonesian: 'id',
  malaysia: 'my', malaysian: 'my',
  singapore: 'sg', singaporean: 'sg',
  thailand: 'th', thai: 'th',
  vietnam: 'vn', vietnamese: 'vn',
  germany: 'de', german: 'de',
  france: 'fr', french: 'fr',
  russia: 'ru', russian: 'ru',
  brazil: 'br', brazilian: 'br',
  mexico: 'mx', mexican: 'mx',
  argentina: 'ar', argentinian: 'ar',
  spain: 'es', spanish: 'es',
  italy: 'it', italian: 'it',
  netherlands: 'nl', dutch: 'nl',
  poland: 'pl', polish: 'pl',
  sweden: 'se', swedish: 'se',
  norway: 'no', norwegian: 'no',
  finland: 'fi', finnish: 'fi',
  denmark: 'dk', danish: 'dk',
  'new zealand': 'nz', kiwi: 'nz',
  india: 'in', indian: 'in',
  'sri lanka': 'lk', 'sri lankan': 'lk',
  venezuela: 've', venezuelan: 've',
  estonia: 'ee', estonian: 'ee',
  'hong kong': 'hk',
  'puerto rico': 'pr', 'puerto rican': 'pr',
};

const getFlagCode = (str) => COUNTRY_FLAGS[str.trim().toLowerCase()] || null;

const ytId = (url) => {
  if (!url) return null;
  const m = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/);
  return m ? m[1] : null;
};

export const AffiliateModal = ({ person, onClose }) => {
  const [showingAlt, setShowingAlt] = useState(false);
  const [isPhotoGlitching, setIsPhotoGlitching] = useState(false);
  const [displayName, setDisplayName] = useState(person?.name || '');

  useEffect(() => {
    if (person) {
      setShowingAlt(false);
      setDisplayName(person.name);
    }
  }, [person]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!person) return null;

  const currentName = showingAlt ? person.altName : person.name;
  const currentImg = showingAlt ? person.altImage : person.image;
  const currentAccent = showingAlt ? person.altAccent || person.accent : person.accent || '#ff6b00';
  const currentLinks = showingAlt ? person.altLinks || person.links : person.links;

  const togglePersona = () => {
    if (!person.altImage) return;
    setIsPhotoGlitching(true);
    setShowingAlt((prev) => !prev);
    const targetName = !showingAlt ? person.altName : person.name;

    // Scramble name
    const glitchChars = 'X@#$%!?_▒░▓╬╪╫';
    let f = 0;
    const scramble = setInterval(() => {
      setDisplayName(
        Array.from(targetName)
          .map(() => glitchChars[Math.floor(Math.random() * glitchChars.length)])
          .join('')
      );
      if (++f > 6) {
        clearInterval(scramble);
        setDisplayName(targetName);
      }
    }, 35);

    setTimeout(() => {
      setIsPhotoGlitching(false);
    }, 320);
  };

  const toTags = (role) =>
    (role || '').split('/').map((r) => r.trim().toLowerCase().replace(/\s+/g, '-')).filter(Boolean);
  const tags = toTags(person.role);

  const projects = person.projects || [];
  const vidProjects = projects.filter((q) => ytId(q.url) && !q.title.startsWith('['));

  // Nationality flags
  const nationalityParts = person.nationality
    ? person.nationality.split('/').map((s) => s.trim()).filter(Boolean)
    : [];

  return (
    <div
      className="aff-modal-backdrop is-open"
      id="affModalBackdrop"
      role="dialog"
      aria-modal="true"
      onClick={(e) => {
        if (e.target.id === 'affModalBackdrop') onClose();
      }}
    >
      <div className="aff-modal" id="affModal">
        <div className="aff-modal-hdr">
          <span className="aff-modal-subline">
            <span className="aff-hdr-desktop">Collaborative network: // Accessing Dossier: </span>
            <span className="aff-hdr-mobile">Collaborative network: // </span>
            <span className="aff-modal-accessing">{currentName}</span>
          </span>
          <button
            type="button"
            className="aff-modal-close"
            id="affModalClose"
            onClick={onClose}
          >
            [×]
          </button>
        </div>

        <div
          className={`aff-modal-photo-col ${isPhotoGlitching ? 'raven-glitch-dossier' : ''}`}
          id="affPhotoCol"
        >
          <div className="aff-modal-photo-inner">
            {currentImg ? (
              <img
                src={`/images/${currentImg}`}
                className={`aff-modal-photo ${isPhotoGlitching ? 'raven-glitch-img' : ''}`}
                id="affDossierPhoto"
                alt={currentName}
                decoding="async"
                onError={(e) => {
                  e.target.parentElement.innerHTML = `<div class="aff-modal-photo-placeholder" style="color:${currentAccent}">${currentName.charAt(0)}</div>`;
                }}
              />
            ) : (
              <div className="aff-modal-photo-placeholder" style={{ color: currentAccent }}>
                {currentName.charAt(0)}
              </div>
            )}
          </div>
        </div>

        <ScrollArea className="aff-modal-info-col">
          <div className="aff-modal-name-row">
            <div
              className="aff-modal-name"
              id="affDossierName"
              style={{ color: currentAccent }}
            >
              {displayName}
            </div>

            {nationalityParts.length > 0 && (
              <div className="aff-flag-badge">
                {nationalityParts.map((p, pIdx) => {
                  const flagCode = getFlagCode(p);
                  return (
                    <React.Fragment key={pIdx}>
                      {pIdx > 0 && <span className="aff-flag-sep"> / </span>}
                      {flagCode ? (
                        <span className={`fi fi-${flagCode}`} title={p}></span>
                      ) : (
                        <span className="aff-flag-text">{p}</span>
                      )}
                    </React.Fragment>
                  );
                })}
              </div>
            )}
          </div>

          {person.affiliation && (
            <a
              href={person.affiliation.url}
              target="_blank"
              rel="noopener noreferrer"
              className="aff-modal-affiliation"
            >
              <span className="aff-modal-from">from</span>
              <span className="aff-modal-aff-name">{person.affiliation.name}</span>
              <img
                src={`/images/${person.affiliation.badge}`}
                className="aff-modal-aff-badge"
                alt={person.affiliation.name}
                decoding="async"
                width="18"
                height="18"
              />
            </a>
          )}

          <div className="aff-modal-role-tags">
            {tags.map((t, i) => (
              <span key={i} className="aff-role-tag">
                {t.replace(/-/g, ' ')}
              </span>
            ))}
          </div>

          {person.birthday && (
            <div className="aff-modal-meta">
              <span className="aff-meta-item">
                <span className="aff-meta-key">BIRTHDAY</span>&nbsp;{person.birthday}
              </span>
            </div>
          )}

          {(person.bio || person.birthday) && <div className="aff-modal-divider"></div>}

          {person.bio && (
            <div className="aff-modal-section">
              <div className="aff-modal-section-label">// ABOUT</div>
              <p className="aff-modal-bio">{person.bio}</p>
            </div>
          )}

          {person.altImage && (
            <div className="aff-modal-section">
              <div className="aff-modal-section-label">// ALT</div>
              <button
                type="button"
                id="affPersonaToggle"
                onClick={togglePersona}
                style={{
                  fontFamily: "'Roboto Mono', monospace",
                  fontSize: '0.52rem',
                  letterSpacing: '1px',
                  padding: '6px 14px',
                  border: `1px solid ${currentAccent}`,
                  color: currentAccent,
                  background: 'transparent',
                  cursor: 'pointer',
                  textTransform: 'uppercase',
                  transition: 'background 0.2s, color 0.2s, border-color 0.2s',
                }}
              >
                SWITCH → {showingAlt ? person.name.toUpperCase() : person.altName.toUpperCase()}
              </button>
            </div>
          )}

          {projects.length > 0 && (
            <div className="aff-modal-section">
              <div className="aff-modal-section-label">// COLLABORATIVE_LOG</div>
              <div className="aff-collab-log">
                {projects.map((q, qIdx) => {
                  const inner = (
                    <>
                      <span className="aff-modal-project-title">{q.title}</span>
                      <span className="aff-modal-project-role">{q.role}</span>
                    </>
                  );
                  return q.url ? (
                    <a
                      key={qIdx}
                      href={q.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="aff-modal-project"
                    >
                      {inner}
                    </a>
                  ) : (
                    <div key={qIdx} className="aff-modal-project no-link">
                      {inner}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {vidProjects.length > 0 && (
            <div className="aff-modal-section">
              <div className="aff-modal-section-label">// WORKS</div>
              <div className="aff-videos-grid">
                {vidProjects.map((q, vIdx) => {
                  const vid = ytId(q.url);
                  return (
                    <a
                      key={vIdx}
                      href={q.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="aff-video-card"
                    >
                      <div className="aff-video-thumb-wrap">
                        <img
                          src={`https://img.youtube.com/vi/${vid}/hqdefault.jpg`}
                          alt={q.title}
                          className="aff-video-thumb"
                          loading="lazy"
                          decoding="async"
                          width="120"
                          height="68"
                          onError={(e) => {
                            e.target.src = `https://img.youtube.com/vi/${vid}/mqdefault.jpg`;
                          }}
                        />
                        <div className="aff-video-play">▶</div>
                      </div>
                      <div className="aff-video-title">{q.title}</div>
                      <div className="aff-video-role">{q.role}</div>
                    </a>
                  );
                })}
              </div>
            </div>
          )}

          {currentLinks?.length > 0 && (
            <div className="aff-modal-section" id="affDossierLinks">
              <div className="aff-modal-section-label">// LINKS</div>
              <div className="aff-modal-links">
                {currentLinks.map((l, lIdx) => (
                  <a
                    key={lIdx}
                    href={l.url}
                    className="aff-modal-link"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    &gt;&gt; {l.label}
                  </a>
                ))}
              </div>
            </div>
          )}
        </ScrollArea>
      </div>
    </div>
  );
};
