import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { TechButton } from '../common/TechButton';
import { ScrollArea } from '../ui/scroll-area';
import { useAliasSwitch } from './useAliasSwitch';
import { ytId, getWorks, toTags, getFlagCode } from './affiliateUtils';

/* ═══════════════════════════════════════════════════════════════════════════
   AffiliateDossier
   One dossier for both places it's used:

     variant="popup"  centered screen pop-up (index page marquee)
     variant="page"   full-page dossier (/affiliates and /affiliates/:slug)

   Alias (alt / legacy account) state, glitch and scramble live in useAliasSwitch.
   `onAliasChange(bool)` lets a parent mirror it (the index cards do).
   ═══════════════════════════════════════════════════════════════════════════ */

/* ── Shared pieces ──────────────────────────────────────────────────────── */

// "SWITCH → NAME" — colour follows the active name colour via --alias-accent.
const AliasSwitchButton = ({ person, alias }) => (
  <button
    type="button"
    className="alias-switch"
    style={{ '--alias-accent': alias.accent }}
    onClick={alias.toggle}
  >
    SWITCH → {(alias.showingAlias ? person.name : person.altName).toUpperCase()}
  </button>
);

// Popup only: "| SWITCH → NAME" sitting right beside the name.
const AliasSwitchInline = ({ person, alias }) => {
  if (!alias.hasAlias) return null;
  return (
    <>
      <span className="alias-switch-divider" aria-hidden="true">
        |
      </span>
      <AliasSwitchButton person={person} alias={alias} />
    </>
  );
};

const AliasName = ({ alias, className, id, style }) => (
  <div
    id={id}
    className={`${className}${alias.isGlitching ? ' alias-glitch-text' : ''}`}
    style={{ ...style, color: alias.accent }}
  >
    {alias.shownName}
  </div>
);

// Photo column with the alias glitch. cfg carries the variant's class names/styles.
const AliasPhoto = ({ alias, cfg, placeholder }) => {
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [alias.image]);

  return (
    <div
      id={cfg.colId}
      className={`${cfg.colClass}${alias.isGlitching ? ' alias-glitch-photo' : ''}`}
      style={cfg.colStyle}
    >
      <div className={cfg.innerClass} style={cfg.innerStyle}>
        {alias.image && !failed ? (
          <img
            id={cfg.imgId}
            src={`/images/${alias.image}`}
            className={`${cfg.imgClass}${alias.isGlitching ? ' alias-glitch-img' : ''}`}
            style={cfg.imgStyle}
            alt={alias.name}
            decoding="async"
            draggable="false"
            onError={() => setFailed(true)}
          />
        ) : (
          placeholder
        )}
      </div>
    </div>
  );
};

const YoutubeThumb = ({ videoId, title, style, width, height }) => (
  <img
    src={`https://img.youtube.com/vi/${videoId}/hqdefault.jpg`}
    alt={title}
    className="aff-video-thumb"
    loading="lazy"
    decoding="async"
    width={width}
    height={height}
    style={style}
    onError={(e) => {
      e.target.src = `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;
    }}
  />
);

/* ═══ Popup variant ═════════════════════════════════════════════════════════
   Styles are plain objects for now; next step is .aff-dossier-* classes in
   affiliates.css.
   ═══════════════════════════════════════════════════════════════════════════ */
const P = {
  overlay: {
    position: 'fixed',
    inset: 0,
    background: 'rgba(0, 0, 0, 0.8)',
    backdropFilter: 'blur(8px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
    padding: '20px',
  },
  container: {
    width: '900px',
    maxWidth: '92vw',
    height: '560px',
    maxHeight: '90vh',
    background: 'var(--surface)',
    border: '2px solid var(--accent)',
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',
    overflow: 'hidden',
    boxShadow: '0 24px 60px rgba(0, 0, 0, 0.6)',
  },
  closeWrap: { position: 'absolute', top: '16px', right: '18px', zIndex: 10 },
  body: { display: 'grid', gridTemplateColumns: '320px 1fr', height: '100%', overflow: 'hidden' },
  photoCol: {
    height: '100%',
    width: '100%',
    position: 'relative',
    background: '#000',
    overflow: 'hidden',
    borderRight: '2px solid var(--accent)',
  },
  // Zero inner borders: .dossier-photo-inner has a border + striped bg in style.css
  photoInner: {
    width: '100%',
    height: '100%',
    position: 'relative',
    border: 'none',
    outline: 'none',
    boxShadow: 'none',
    backgroundImage: 'none',
    background: '#000',
  },
  photoImg: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    objectPosition: 'center top',
    display: 'block',
    border: 'none',
    outline: 'none',
  },
  placeholder: {
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoCol: {
    padding: '28px 32px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    height: '100%',
    overflow: 'hidden',
  },
  topGroup: { display: 'flex', flexDirection: 'column', gap: '12px' },
  tag: { fontSize: '0.58rem', marginBottom: '4px' },
  nameRow: { display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '14px', marginBottom: '4px' },
  name: { margin: 0, fontSize: '1.9rem', lineHeight: '1.1' },
  affiliation: { marginBottom: '4px', fontSize: '0.62rem' },
  role: { fontSize: '0.68rem', letterSpacing: '1.5px' },
  bio: {
    fontFamily: "'Roboto Mono', monospace",
    fontSize: '0.75rem',
    lineHeight: '1.4',
    fontStyle: 'italic',
    color: 'var(--text-3)',
    margin: 0,
  },
  section: { margin: 0 },
  sectionLabel: { fontSize: '0.62rem', marginBottom: '6px' },
  worksSection: { margin: 0, display: 'flex', flexDirection: 'column', minHeight: 0 },
  thumbWrap: {
    position: 'relative',
    aspectRatio: '16 / 9',
    overflow: 'hidden',
    background: '#111',
    marginBottom: '6px',
    border: '1px solid #000',
  },
  thumbImg: { width: '100%', height: '100%', objectFit: 'cover', display: 'block' },
  videoTitle: {
    fontFamily: "'Roboto Mono', monospace",
    fontSize: '0.6rem',
    fontWeight: '700',
    letterSpacing: '0.5px',
    color: 'var(--fg)',
    textTransform: 'uppercase',
    lineHeight: '1.3',
  },
  videoRole: {
    fontFamily: "'Roboto Mono', monospace",
    fontSize: '0.5rem',
    letterSpacing: '0.5px',
    color: 'var(--text-6)',
    marginTop: '2px',
  },
  videoPlay: {
    position: 'absolute',
    inset: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.3rem',
    color: 'rgba(255, 255, 255, 0.9)',
    background: 'rgba(0, 0, 0, 0.4)',
    opacity: 0,
    transition: 'opacity 0.2s',
  },
  linksRow: {
    display: 'flex',
    gap: '8px',
    overflowX: 'auto',
    whiteSpace: 'nowrap',
    paddingBottom: '4px',
    scrollbarWidth: 'thin',
  },
};

const popupPhotoCfg = {
  colClass: 'dossier-photo-col',
  colStyle: P.photoCol,
  innerClass: 'dossier-photo-inner',
  innerStyle: P.photoInner,
  imgClass: 'dossier-photo',
  imgStyle: P.photoImg,
};

const PopupNoSignalWork = () => (
  <div style={{ display: 'grid', gridTemplateColumns: 'minmax(240px, 300px)' }}>
    <div className="aff-video-card" style={{ display: 'block' }}>
      <div
        className="aff-video-thumb-wrap"
        style={{ ...P.thumbWrap, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      >
        <span
          className="aff-nosignal-text"
          style={{ fontSize: '0.65rem', letterSpacing: '2px', color: 'var(--accent)' }}
        >
          [NO SIGNAL]
        </span>
      </div>
      <div className="aff-video-title" style={P.videoTitle}>
        // TO BE ADDED
      </div>
    </div>
  </div>
);

const PopupWorks = ({ person, accent }) => {
  const works = getWorks(person.projects);
  const hasOverflow = works.length > 3; // scrollbar only when there are more than 3 works
  const isSingle = works.length === 1;

  return (
    <div className="dossier-section" style={{ ...P.worksSection, flex: person.bio ? '0 1 auto' : '1 1 auto' }}>
      <div className="dossier-section-label" style={P.sectionLabel}>
        // WORKS
      </div>

      {works.length === 0 ? (
        <PopupNoSignalWork />
      ) : (
        <div
          style={{
            flex: 1,
            maxHeight: hasOverflow ? '175px' : 'none',
            overflowY: hasOverflow ? 'auto' : 'visible',
            scrollbarWidth: hasOverflow ? 'thin' : 'none',
            scrollbarColor: hasOverflow ? `${accent} transparent` : undefined,
            paddingRight: hasOverflow ? '4px' : '0',
          }}
        >
          <div
            className="aff-videos-grid"
            style={{
              display: 'grid',
              gridTemplateColumns: isSingle ? 'minmax(240px, 300px)' : 'repeat(3, minmax(0, 1fr))',
              gap: '12px',
            }}
          >
            {works.map((w, i) => (
              <a
                key={i}
                href={w.url}
                target="_blank"
                rel="noopener noreferrer"
                className="aff-video-card"
                style={{ textDecoration: 'none', display: 'block' }}
              >
                <div className="aff-video-thumb-wrap" style={P.thumbWrap}>
                  <YoutubeThumb videoId={ytId(w.url)} title={w.title} style={P.thumbImg} />
                  <div className="aff-video-play" style={P.videoPlay}>
                    ▶
                  </div>
                </div>
                <div className="aff-video-title" style={P.videoTitle}>
                  {w.title}
                </div>
                <div className="aff-video-role" style={P.videoRole}>
                  {w.role}
                </div>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const PopupLinks = ({ links }) => {
  if (!links?.length) return null;
  return (
    <div className="dossier-section" style={P.section}>
      <div className="dossier-section-label" style={P.sectionLabel}>
        // LINKS
      </div>
      <div style={P.linksRow}>
        {links.map((l, i) => (
          <TechButton key={i} href={l.url} variant="secondary" size="sm" style={{ flexShrink: 0 }}>
            {l.label}
          </TechButton>
        ))}
      </div>
    </div>
  );
};

const PopupDossier = ({ person, alias, onClose }) =>
  createPortal(
    <div
      className="dossier-modal-overlay"
      style={P.overlay}
      data-lenis-prevent=""
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="dossier-modal-container" role="dialog" aria-modal="true" style={P.container}>
        <div style={P.closeWrap}>
          <TechButton onClick={onClose} variant="secondary" size="sm">
            CLOSE
          </TechButton>
        </div>

        <div className="dossier-modal-body" style={P.body}>
          <AliasPhoto
            alias={alias}
            cfg={popupPhotoCfg}
            placeholder={
              <div className="dossier-photo-placeholder" style={P.placeholder}>
                IMAGE_DATA
                <br />
                NOT_FOUND
              </div>
            }
          />

          <div className="dossier-info-col" style={P.infoCol}>
            <div style={P.topGroup}>
              <div>
                <div className="dossier-tag" style={P.tag}>
                  NODE_AFFILIATE // COLLABORATOR
                </div>

                <div style={P.nameRow}>
                  <AliasName alias={alias} className="dossier-name" style={P.name} />
                  <AliasSwitchInline person={person} alias={alias} />
                </div>

                {person.affiliation && (
                  <a
                    href={person.affiliation.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="dossier-affiliation"
                    style={P.affiliation}
                  >
                    <span className="dossier-affiliation-from">from</span>
                    <span className="dossier-affiliation-name">{person.affiliation.name}</span>
                    <img
                      src={`/images/${person.affiliation.badge}`}
                      className="dossier-affiliation-badge"
                      alt={person.affiliation.name}
                      decoding="async"
                      width="20"
                      height="20"
                      draggable="false"
                    />
                  </a>
                )}

                <div className="dossier-role" style={P.role}>
                  {person.role}
                </div>
              </div>

              {person.bio && (
                <div className="dossier-section" style={P.section}>
                  <div className="dossier-section-label" style={{ ...P.sectionLabel, marginBottom: '4px' }}>
                    // ABOUT
                  </div>
                  <p style={P.bio}>{person.bio}</p>
                </div>
              )}
            </div>

            <PopupWorks person={person} accent={alias.accent} />
            <PopupLinks links={alias.links} />
          </div>
        </div>
      </div>
    </div>,
    document.body
  );

/* ═══ Page variant ══════════════════════════════════════════════════════════
   Styled by the .aff-modal-* rules in affiliates.css.
   ═══════════════════════════════════════════════════════════════════════════ */
const pagePhotoCfg = {
  colId: 'affPhotoCol',
  colClass: 'aff-modal-photo-col',
  innerClass: 'aff-modal-photo-inner',
  imgId: 'affDossierPhoto',
  imgClass: 'aff-modal-photo',
};

const PageDossier = ({ person, alias, onClose }) => {
  const tags = toTags(person.role);
  const projects = person.projects || [];
  const works = getWorks(person.projects);
  const nationalityParts = person.nationality
    ? person.nationality.split('/').map((s) => s.trim()).filter(Boolean)
    : [];

  return (
    <div
      className="aff-modal-backdrop is-open"
      id="affModalBackdrop"
      role="dialog"
      aria-modal="true"
      data-lenis-prevent=""
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="aff-modal" id="affModal" data-lenis-prevent="">
        <div className="aff-modal-hdr">
          <span className="aff-modal-subline">
            <span className="aff-hdr-desktop">Collaborative network: // Accessing Dossier: </span>
            <span className="aff-hdr-mobile">Collaborative network: // </span>
            <span className="aff-modal-accessing">{alias.name}</span>
          </span>
          <button type="button" className="aff-modal-close" id="affModalClose" onClick={onClose}>
            [×]
          </button>
        </div>

        <AliasPhoto
          alias={alias}
          cfg={pagePhotoCfg}
          placeholder={
            <div className="aff-modal-photo-placeholder" style={{ color: alias.accent }}>
              {alias.name.charAt(0)}
            </div>
          }
        />

        <ScrollArea
          className="aff-modal-info-col"
          viewportClassName="aff-modal-info-scroll"
          thumbStyle={{ background: alias.accent, boxShadow: `0 0 8px ${alias.accent}` }}
        >
          <div className="aff-modal-name-row">
            <AliasName alias={alias} className="aff-modal-name" id="affDossierName" />

            {nationalityParts.length > 0 && (
              <div className="aff-flag-badge">
                {nationalityParts.map((p, i) => {
                  const flagCode = getFlagCode(p);
                  return (
                    <React.Fragment key={i}>
                      {i > 0 && <span className="aff-flag-sep"> / </span>}
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

          {alias.hasAlias && (
            <div className="aff-modal-section">
              <div className="aff-modal-section-label">// ALT</div>
              <AliasSwitchButton person={person} alias={alias} />
            </div>
          )}

          {projects.length > 0 && (
            <div className="aff-modal-section">
              <div className="aff-modal-section-label">// COLLABORATIVE_LOG</div>
              <div className="aff-collab-log">
                {projects.map((q, i) => {
                  const inner = (
                    <>
                      <span className="aff-modal-project-title">{q.title}</span>
                      <span className="aff-modal-project-role">{q.role}</span>
                    </>
                  );
                  return q.url ? (
                    <a key={i} href={q.url} target="_blank" rel="noopener noreferrer" className="aff-modal-project">
                      {inner}
                    </a>
                  ) : (
                    <div key={i} className="aff-modal-project no-link">
                      {inner}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {works.length > 0 && (
            <div className="aff-modal-section">
              <div className="aff-modal-section-label">// WORKS</div>
              <div className="aff-videos-grid">
                {works.map((q, i) => (
                  <a key={i} href={q.url} target="_blank" rel="noopener noreferrer" className="aff-video-card">
                    <div className="aff-video-thumb-wrap">
                      <YoutubeThumb videoId={ytId(q.url)} title={q.title} width="120" height="68" />
                      <div className="aff-video-play">▶</div>
                    </div>
                    <div className="aff-video-title">{q.title}</div>
                    <div className="aff-video-role">{q.role}</div>
                  </a>
                ))}
              </div>
            </div>
          )}

          {alias.links?.length > 0 && (
            <div className="aff-modal-section" id="affDossierLinks">
              <div className="aff-modal-section-label">// LINKS</div>
              <div className="aff-modal-links">
                {alias.links.map((l, i) => (
                  <a key={i} href={l.url} className="aff-modal-link" target="_blank" rel="noopener noreferrer">
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

/* ═══ Public component ══════════════════════════════════════════════════════ */

export const AffiliateDossier = ({ person, variant = 'popup', onClose, onAliasChange }) => {
  const alias = useAliasSwitch(person);

  // Let a parent mirror the alias state (index cards flip with the open dossier).
  useEffect(() => {
    onAliasChange?.(alias.showingAlias);
  }, [alias.showingAlias, onAliasChange]);

  // Keep the latest onClose without re-running the effect below on every parent render.
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  // Escape closes; background smooth-scroll (Lenis) pauses while a dossier is open.
  useEffect(() => {
    if (!person) return undefined;
    const onKeyDown = (e) => {
      if (e.key === 'Escape') onCloseRef.current?.();
    };
    document.addEventListener('keydown', onKeyDown);
    if (window.lenis) window.lenis.stop();
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      if (window.lenis) window.lenis.start();
    };
  }, [person]);

  if (!person) return null;

  return variant === 'page' ? (
    <PageDossier person={person} alias={alias} onClose={onClose} />
  ) : (
    <PopupDossier person={person} alias={alias} onClose={onClose} />
  );
};
