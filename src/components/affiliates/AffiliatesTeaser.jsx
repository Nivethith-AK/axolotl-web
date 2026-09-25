import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { WaveformHeader } from '../common/WaveformHeader';
import { AFFILIATES_DATA, toSlug } from '../../data/affiliatesData';

export const AffiliatesTeaser = () => {
  const { t } = useLanguage();
  const [selectedAffiliate, setSelectedAffiliate] = useState(null);
  const [showingAlt, setShowingAlt] = useState(false);
  const [accessingName, setAccessingName] = useState('');
  const [altPersonaText, setAltPersonaText] = useState('');
  const [ravenShowingAlt, setRavenShowingAlt] = useState(false);
  const [ravenGlitching, setRavenGlitching] = useState(false);

  useEffect(() => {
    let timer;
    let glitchInnerTimer;
    const scheduleNext = () => {
      timer = setTimeout(() => {
        setRavenGlitching(true);
        glitchInnerTimer = setTimeout(() => {
          setRavenShowingAlt((prev) => !prev);
          setRavenGlitching(false);
          scheduleNext();
        }, 80);
      }, 2000 + Math.random() * 500);
    };
    scheduleNext();
    return () => {
      clearTimeout(timer);
      clearTimeout(glitchInnerTimer);
    };
  }, []);

  const wrapRef = useRef(null);
  const track1Ref = useRef(null);
  const track2Ref = useRef(null);
  const animRef = useRef(null);

  const TIER_ORDER = { high: 0, mid: 1, low: 2 };
  const sorted = [...AFFILIATES_DATA].sort((a, b) => {
    if (a.noSignal) return 1;
    if (b.noSignal) return -1;
    const ta = TIER_ORDER[a.tier || 'mid'];
    const tb = TIER_ORDER[b.tier || 'mid'];
    if (ta !== tb) return ta - tb;
    return a.name.localeCompare(b.name);
  });

  const [hoveredAffId, setHoveredAffId] = useState(null);

  const row1 = sorted.slice(0, Math.ceil(sorted.length / 2));
  const row2 = sorted.slice(Math.ceil(sorted.length / 2));

  // Marquee animation
  const stateRef = useRef({
    hw1: 0,
    hw2: 0,
    positions: [0, 0],
    velocity: 0,
    hoveredRow: null,
    isDragging: false,
    dragStartX: 0,
    dragLastX: 0,
    hasDragged: false,
  });

  useEffect(() => {
    const SPEEDS = [-0.4, 0.4];
    const s = stateRef.current;

    const updateHalfWidths = () => {
      const t1 = track1Ref.current;
      const t2 = track2Ref.current;
      if (t1 && t1.scrollWidth > 0) {
        s.hw1 = t1.scrollWidth / 2;
      }
      if (t2 && t2.scrollWidth > 0) {
        s.hw2 = t2.scrollWidth / 2;
        if (!s.positions[1]) {
          s.positions[1] = s.hw2 / 2;
        }
      }
    };

    updateHalfWidths();

    const tick = () => {
      const t1 = track1Ref.current;
      const t2 = track2Ref.current;
      if (!t1 || !t2) return;

      if (!s.hw1 || !s.hw2) {
        updateHalfWidths();
      }

      if (!s.isDragging && s.hoveredRow === null) {
        s.positions[0] += SPEEDS[0];
        s.positions[1] += SPEEDS[1];
      }

      if (!s.isDragging && s.velocity !== 0) {
        s.positions[0] += s.velocity;
        s.positions[1] += s.velocity;
        s.velocity *= 0.92;
        if (Math.abs(s.velocity) < 0.05) s.velocity = 0;
      }

      if (s.hw1) {
        const wrap0 = ((s.positions[0] % s.hw1) + s.hw1) % s.hw1;
        t1.style.transform = `translateX(${wrap0 - s.hw1}px)`;
      }
      if (s.hw2) {
        const wrap1 = ((s.positions[1] % s.hw2) + s.hw2) % s.hw2;
        t2.style.transform = `translateX(${-wrap1}px)`;
      }

      animRef.current = requestAnimationFrame(tick);
    };

    const handleResize = () => {
      updateHalfWidths();
    };
    window.addEventListener('resize', handleResize, { passive: true });

    const handleVisibility = () => {
      if (document.hidden) {
        cancelAnimationFrame(animRef.current);
      } else {
        cancelAnimationFrame(animRef.current);
        animRef.current = requestAnimationFrame(tick);
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);

    animRef.current = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(animRef.current);
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, []);

  // Horizontal wheel & mobile touch gesture listeners
  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;

    // Trackpad horizontal swipe & Shift+Wheel support
    const handleWheel = (e) => {
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
        stateRef.current.positions[0] += e.deltaX * 0.8;
        stateRef.current.positions[1] += e.deltaX * 0.8;
        stateRef.current.velocity = 0;
      }
    };

    // Mobile touch gestures with vertical scroll pass-through
    let touchStartX = 0;
    let touchStartY = 0;
    let touchLastX = 0;
    let isHorizontalSwipe = false;

    const handleTouchStart = (e) => {
      if (e.touches.length !== 1) return;
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
      touchLastX = touchStartX;
      stateRef.current.velocity = 0;
      stateRef.current.hasDragged = false;
      isHorizontalSwipe = false;
    };

    const handleTouchMove = (e) => {
      if (e.touches.length !== 1) return;
      const cx = e.touches[0].clientX;
      const cy = e.touches[0].clientY;
      const dx = cx - touchLastX;
      const totalX = Math.abs(cx - touchStartX);
      const totalY = Math.abs(cy - touchStartY);

      if (!isHorizontalSwipe && totalX > 8 && totalX > totalY) {
        isHorizontalSwipe = true;
      }

      if (isHorizontalSwipe) {
        stateRef.current.hasDragged = true;
        stateRef.current.positions[0] -= dx;
        stateRef.current.positions[1] -= dx;
        stateRef.current.velocity = -dx * 0.4;
      }
      touchLastX = cx;
    };

    const handleTouchEnd = () => {
      setTimeout(() => {
        stateRef.current.hasDragged = false;
        stateRef.current.hoveredRow = null;
        setHoveredAffId(null);
      }, 80);
    };

    wrap.addEventListener('wheel', handleWheel, { passive: true });
    wrap.addEventListener('touchstart', handleTouchStart, { passive: true });
    wrap.addEventListener('touchmove', handleTouchMove, { passive: true });
    wrap.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      wrap.removeEventListener('wheel', handleWheel);
      wrap.removeEventListener('touchstart', handleTouchStart);
      wrap.removeEventListener('touchmove', handleTouchMove);
      wrap.removeEventListener('touchend', handleTouchEnd);
    };
  }, []);

  const openDossier = (data) => {
    setSelectedAffiliate(data);
    setShowingAlt(false);
    setAccessingName(data.name.toUpperCase().replace(/ /g, '_'));
    if (data.altName) {
      setAltPersonaText(data.altName.toUpperCase());
    }
    setTimeout(() => {
      if (window.lenis) {
        window.lenis.resize();
        const dossierEl = document.getElementById('dossierPanel');
        if (dossierEl) {
          window.lenis.scrollTo(dossierEl, { offset: -90, duration: 1.2 });
        }
      }
    }, 60);
  };

  const closeDossier = () => {
    setSelectedAffiliate(null);
    setAccessingName('');
    setShowingAlt(false);
    setTimeout(() => {
      if (window.lenis) {
        window.lenis.resize();
      }
      const t1 = track1Ref.current;
      const t2 = track2Ref.current;
      if (t1 && t1.scrollWidth > 0) stateRef.current.hw1 = t1.scrollWidth / 2;
      if (t2 && t2.scrollWidth > 0) stateRef.current.hw2 = t2.scrollWidth / 2;
    }, 60);
  };

  const togglePersona = () => {
    if (!selectedAffiliate?.altImage) return;
    setShowingAlt((prev) => !prev);
    const nextName = !showingAlt ? selectedAffiliate.altName : selectedAffiliate.name;
    setAccessingName(nextName.toUpperCase().replace(/ /g, '_'));
  };

  const renderCard = (data, idx, rowNum) => {
    const isDossierOpenForThis = selectedAffiliate?.name === data.name;
    const isAlt = isDossierOpenForThis ? showingAlt : data.altImage ? ravenShowingAlt : false;
    const isGlitching = !isDossierOpenForThis && data.altImage ? ravenGlitching : false;
    const coverSrc = isAlt ? `/images/${data.altImage}` : data.image ? `/images/${data.image}` : null;
    const displayName = isAlt ? data.altName : data.name;
    const displayAccent = isAlt ? data.altAccent || data.accent : data.accent || '#ff6b00';
    const isHovered = hoveredAffId === data.name;
    const isDimmed = hoveredAffId !== null && !isHovered;

    return (
      <div
        key={`${rowNum}-${data.name}-${idx}`}
        className={`aff-panel ${isGlitching ? 'raven-glitch' : ''} ${isHovered ? 'aff-active' : ''} ${isDimmed ? 'aff-dimmed' : ''}`}
        style={{ '--accent': displayAccent }}
        data-aff-id={data.name}
        onMouseEnter={() => setHoveredAffId(data.name)}
        onClick={() => {
          if (!stateRef.current.hasDragged) {
            openDossier(data);
          }
        }}
      >
        <div className="aff-panel-bg"></div>
        {coverSrc ? (
          <img
            src={coverSrc}
            className="aff-panel-cover"
            alt={displayName}
            loading="lazy"
            decoding="async"
            width="200"
            height="220"
          />
        ) : (
          <div className="aff-panel-initial" style={{ color: displayAccent }}>
            {displayName.charAt(0)}
          </div>
        )}
        <div className="aff-panel-overlay"></div>
        <div className="aff-panel-accent" style={{ background: displayAccent }}></div>
        <div className="aff-panel-content">
          <div className="aff-panel-name">{displayName}</div>
          <div className="aff-panel-role">{data.role}</div>
        </div>
        {data.affiliation && (
          <img
            src={`/images/${data.affiliation.badge}`}
            className="aff-panel-affbadge"
            alt={data.affiliation.name}
            title={data.affiliation.name}
            loading="lazy"
            decoding="async"
            width="24"
            height="24"
          />
        )}
      </div>
    );
  };

  const activeData = selectedAffiliate;
  const activeName = showingAlt ? activeData?.altName : activeData?.name;
  const activeImage = showingAlt ? activeData?.altImage : activeData?.image;
  const activeAccent = showingAlt ? activeData?.altAccent || activeData?.accent : activeData?.accent || '#ff6b00';
  const activeLinks = showingAlt ? activeData?.altLinks || activeData?.links : activeData?.links;

  return (
    <section id="affiliates" className="section">
      <div className="container-lg">
        <WaveformHeader
          title={t('affiliates.heading', 'Affiliates')}
          dataText="Affiliates"
          i18nKey="affiliates.heading"
        />
        <p className="aff-subline">
          <span data-i18n="affiliates.sub">
            {t('affiliates.sub', 'Collaborative network: //')}
          </span>
          <span className={`accessing-dossier ${accessingName ? 'visible' : ''}`} id="accessingDossier">
            {accessingName ? `ACCESSING_DOSSIER: ${accessingName}` : ''}
          </span>
        </p>

        {/* ── Marquee Rows ── */}
        <div
          className={`aff-panels-wrap ${activeData ? 'panels-out' : ''}`}
          id="affPanelsWrap"
          ref={wrapRef}
          style={
            activeData
              ? { height: '0', overflow: 'hidden', pointerEvents: 'none' }
              : undefined
          }
          onPointerDown={(e) => {
            if (e.pointerType === 'touch') return;
            try {
              e.currentTarget.setPointerCapture(e.pointerId);
            } catch (err) {}
            stateRef.current.isDragging = true;
            stateRef.current.hasDragged = false;
            stateRef.current.dragStartX = e.clientX;
            stateRef.current.dragLastX = e.clientX;
            stateRef.current.velocity = 0;
            if (wrapRef.current) wrapRef.current.style.cursor = 'grabbing';
          }}
          onPointerMove={(e) => {
            if (!stateRef.current.isDragging || e.pointerType === 'touch') return;
            const totalDx = Math.abs(e.clientX - stateRef.current.dragStartX);
            if (totalDx > 6) stateRef.current.hasDragged = true;
            const dx = e.clientX - stateRef.current.dragLastX;
            stateRef.current.positions[0] -= dx;
            stateRef.current.positions[1] -= dx;
            stateRef.current.velocity = -dx * 0.4;
            stateRef.current.dragLastX = e.clientX;
          }}
          onPointerUp={(e) => {
            try {
              e.currentTarget.releasePointerCapture(e.pointerId);
            } catch (err) {}
            stateRef.current.isDragging = false;
            if (wrapRef.current) wrapRef.current.style.cursor = '';
            setTimeout(() => {
              stateRef.current.hasDragged = false;
            }, 80);
          }}
          onPointerCancel={(e) => {
            try {
              e.currentTarget.releasePointerCapture(e.pointerId);
            } catch (err) {}
            stateRef.current.isDragging = false;
            stateRef.current.velocity = 0;
            if (wrapRef.current) wrapRef.current.style.cursor = '';
            setTimeout(() => {
              stateRef.current.hasDragged = false;
            }, 80);
          }}
        >
          <div
            className="aff-marquee-row"
            onMouseEnter={() => {
              stateRef.current.hoveredRow = 0;
            }}
            onMouseLeave={() => {
              stateRef.current.hoveredRow = null;
              setHoveredAffId(null);
            }}
          >
            <div className="aff-marquee-track" ref={track1Ref}>
              {row1.map((d, i) => renderCard(d, i, 1))}
              {row1.map((d, i) => renderCard(d, `dup-${i}`, 1))}
            </div>
          </div>

          <div
            className="aff-marquee-row"
            onMouseEnter={() => {
              stateRef.current.hoveredRow = 1;
            }}
            onMouseLeave={() => {
              stateRef.current.hoveredRow = null;
              setHoveredAffId(null);
            }}
          >
            <div className="aff-marquee-track" ref={track2Ref}>
              {row2.map((d, i) => renderCard(d, i, 2))}
              {row2.map((d, i) => renderCard(d, `dup-${i}`, 2))}
            </div>
          </div>
        </div>

        {/* ── Inline Dossier Panel ── */}
        <div
          className={`dossier-panel ${activeData ? 'is-open dossier-open' : ''}`}
          id="dossierPanel"
        >
          {activeData && (
            <>
              <div className="dossier-photo-col" id="dossierPhotoCol">
                <div className="dossier-photo-inner" id="dossierPhotoInner">
                  {activeImage ? (
                    <img
                      src={`/images/${activeImage}`}
                      className="dossier-photo"
                      alt={activeName}
                      decoding="async"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        if (e.target.nextElementSibling) {
                          e.target.nextElementSibling.style.display = 'flex';
                        }
                      }}
                    />
                  ) : null}
                  <div
                    className="dossier-photo-placeholder"
                    style={{ display: activeImage ? 'none' : 'flex' }}
                  >
                    IMAGE_DATA
                    <br />
                    NOT_FOUND
                  </div>
                </div>
              </div>

              <div className="dossier-info-col" id="dossierInfoCol">
                <button
                  type="button"
                  className="dossier-close"
                  id="dossierClose"
                  onClick={closeDossier}
                >
                  [×]
                </button>
                <div className="dossier-tag">NODE_AFFILIATE // COLLABORATOR</div>
                <div className="dossier-name" id="dossierName" style={{ color: activeAccent }}>
                  {activeName}
                </div>

                {activeData.affiliation && (
                  <a
                    href={activeData.affiliation.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="dossier-affiliation"
                  >
                    <span className="dossier-affiliation-from">from</span>
                    <span className="dossier-affiliation-name">
                      {activeData.affiliation.name}
                    </span>
                    <img
                      src={`/images/${activeData.affiliation.badge}`}
                      className="dossier-affiliation-badge"
                      alt={activeData.affiliation.name}
                      decoding="async"
                      width="18"
                      height="18"
                    />
                  </a>
                )}

                <div className="dossier-role">{activeData.role}</div>

                {activeData.altImage && (
                  <div className="dossier-section">
                    <div className="dossier-section-label">// ALT</div>
                    <button
                      type="button"
                      id="ravenToggleBtn"
                      onClick={togglePersona}
                      style={{
                        fontFamily: "'Roboto Mono', monospace",
                        fontSize: '0.52rem',
                        letterSpacing: '1px',
                        padding: '6px 14px',
                        border: `1px solid ${activeAccent}`,
                        color: activeAccent,
                        background: 'transparent',
                        cursor: 'pointer',
                        textTransform: 'uppercase',
                        transition: 'background 0.2s, color 0.2s, border-color 0.2s',
                      }}
                    >
                      SWITCH → {showingAlt ? activeData.name.toUpperCase() : activeData.altName.toUpperCase()}
                    </button>
                  </div>
                )}

                {activeData.projects?.length > 0 && (
                  <div className="dossier-section">
                    <div className="dossier-section-label">// COLLABORATIVE_LOG</div>
                    {activeData.projects.map((p, pIdx) => (
                      <a
                        key={pIdx}
                        href={p.url || '#'}
                        className="dossier-project"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <div className="dossier-project-title">{p.title}</div>
                        <div className="dossier-project-role">{p.role}</div>
                      </a>
                    ))}
                  </div>
                )}

                {activeLinks?.length > 0 && (
                  <div className="dossier-section" id="dossierLinksWrap">
                    <div className="dossier-section-label">// LINKS</div>
                    {activeLinks.map((l, lIdx) => (
                      <a
                        key={lIdx}
                        href={l.url}
                        className="dossier-link"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        &gt;&gt; {l.label}
                      </a>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* ── Link to Full Roster ── */}
        <div className="ext-link-row mt-4">
          <Link to="/affiliates" className="ext-link">
            <img
              src="/images/assets/logo_main.webp"
              alt="Affiliates"
              className="ext-link-icon"
              width="16"
              height="16"
              loading="lazy"
              decoding="async"
              style={{ borderRadius: '50%', objectFit: 'cover' }}
            />
            <span className="prompt">&gt;&gt;&gt;</span> Full_Roster :=
            <span className="value">Affiliates</span>
          </Link>
        </div>
      </div>
    </section>
  );
};
