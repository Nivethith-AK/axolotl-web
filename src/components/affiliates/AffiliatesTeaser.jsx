import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { WaveformHeader } from '../common/WaveformHeader';
import { AFFILIATES_DATA, toSlug } from '../../data/affiliatesData';
import { TechButton } from '../common/TechButton';
import { AffiliateDossier } from '../affiliates/AffiliateDossier';
import { useAliasCycle } from '../affiliates/useAliasCycle';

export const AffiliatesTeaser = () => {
  const { t } = useLanguage();
  const [selectedAffiliate, setSelectedAffiliate] = useState(null);
  // const [viewMode, setViewMode] = useState('stream');
  // Mirrors the open dossier's alias state so its roster card flips with it.
  const [dossierShowingAlias, setDossierShowingAlias] = useState(false);
  // One shared timer so the duplicated marquee cards flip in sync.
  const cycle = useAliasCycle();

  const accessingName = selectedAffiliate
    ? (dossierShowingAlias ? selectedAffiliate.altName : selectedAffiliate.name)
        .toUpperCase()
        .replace(/ /g, '_')
    : '';

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
    const SPEED_ROW1 = 0.45;
    const SPEED_ROW2 = 0.32;
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
        s.positions[0] += SPEED_ROW1;
        s.positions[1] += SPEED_ROW2;
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

    let ro = null;
    if (typeof ResizeObserver !== 'undefined') {
      ro = new ResizeObserver(() => {
        updateHalfWidths();
      });
      if (track1Ref.current) ro.observe(track1Ref.current);
      if (track2Ref.current) ro.observe(track2Ref.current);
    }

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
      if (ro) ro.disconnect();
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, []);

  // Horizontal wheel, window pointer & mobile touch gesture listeners
  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;

    // Trackpad horizontal swipe & Shift+Wheel support (vertical scrolling passes through naturally)
    const handleWheel = (e) => {
      const isHorizontal = Math.abs(e.deltaX) > Math.abs(e.deltaY) || e.shiftKey;
      if (isHorizontal) {
        if (e.cancelable) e.preventDefault();
        const delta = e.shiftKey ? e.deltaY : e.deltaX;
        stateRef.current.positions[0] -= delta * 0.75;
        stateRef.current.positions[1] += delta * 0.75;
        stateRef.current.velocity = -delta * 0.3;
      }
    };

    // Mobile touch gestures with vertical scroll pass-through
    let touchStartX = 0;
    let touchStartY = 0;
    let touchLastX = 0;
    let isHorizontalSwipe = false;
    let isVerticalScroll = false;

    const handleTouchStart = (e) => {
      if (e.touches.length !== 1) return;
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
      touchLastX = touchStartX;
      stateRef.current.velocity = 0;
      stateRef.current.hasDragged = false;
      isHorizontalSwipe = false;
      isVerticalScroll = false;
    };

    const handleTouchMove = (e) => {
      if (e.touches.length !== 1) return;
      const cx = e.touches[0].clientX;
      const cy = e.touches[0].clientY;
      const dx = cx - touchLastX;
      const totalX = Math.abs(cx - touchStartX);
      const totalY = Math.abs(cy - touchStartY);

      if (!isHorizontalSwipe && !isVerticalScroll) {
        if (totalY > 8 && totalY > totalX) {
          isVerticalScroll = true;
        } else if (totalX > 10 && totalX > totalY * 1.5) {
          isHorizontalSwipe = true;
        }
      }

      if (isHorizontalSwipe) {
        if (e.cancelable) e.preventDefault();
        stateRef.current.hasDragged = true;
        stateRef.current.positions[0] += dx;
        stateRef.current.positions[1] += dx;
        stateRef.current.velocity = dx * 0.35;
      }
      touchLastX = cx;
    };

    const handleTouchEnd = () => {
      setTimeout(() => {
        stateRef.current.hasDragged = false;
        stateRef.current.hoveredRow = null;
        setHoveredAffId(null);
      }, 100);
    };

    const handleGlobalPointerMove = (e) => {
      if (!stateRef.current.isDragging || e.pointerType === 'touch') return;
      const totalDx = Math.abs(e.clientX - stateRef.current.dragStartX);
      if (totalDx > 6) stateRef.current.hasDragged = true;
      const dx = e.clientX - stateRef.current.dragLastX;
      stateRef.current.positions[0] += dx;
      stateRef.current.positions[1] += dx;
      stateRef.current.velocity = dx * 0.35;
      stateRef.current.dragLastX = e.clientX;
    };

    const handleGlobalPointerUp = (e) => {
      if (e.pointerType === 'touch') return;
      if (stateRef.current.isDragging) {
        stateRef.current.isDragging = false;
        if (wrapRef.current) wrapRef.current.style.cursor = '';
        setTimeout(() => {
          stateRef.current.hasDragged = false;
        }, 120);
      }
    };

    wrap.addEventListener('wheel', handleWheel, { passive: false });
    wrap.addEventListener('touchstart', handleTouchStart, { passive: true });
    wrap.addEventListener('touchmove', handleTouchMove, { passive: false });
    wrap.addEventListener('touchend', handleTouchEnd, { passive: true });
    window.addEventListener('pointermove', handleGlobalPointerMove);
    window.addEventListener('pointerup', handleGlobalPointerUp);
    window.addEventListener('pointercancel', handleGlobalPointerUp);

    return () => {
      wrap.removeEventListener('wheel', handleWheel);
      wrap.removeEventListener('touchstart', handleTouchStart);
      wrap.removeEventListener('touchmove', handleTouchMove);
      wrap.removeEventListener('touchend', handleTouchEnd);
      window.removeEventListener('pointermove', handleGlobalPointerMove);
      window.removeEventListener('pointerup', handleGlobalPointerUp);
      window.removeEventListener('pointercancel', handleGlobalPointerUp);
    };
  }, []);

  const openDossier = (data) => setSelectedAffiliate(data);
  const closeDossier = () => setSelectedAffiliate(null);

  const renderCard = (data, idx, rowNum) => {
    const isDossierOpenForThis = selectedAffiliate?.name === data.name;
    const isAlt = isDossierOpenForThis ? dossierShowingAlias : data.altImage ? cycle.showingAlias : false;
    const isGlitching = !isDossierOpenForThis && data.altImage ? cycle.isGlitching : false;
    const coverSrc = isAlt ? `/images/${data.altImage}` : data.image ? `/images/${data.image}` : null;
    const displayName = isAlt ? data.altName : data.name;
    const displayAccent = isAlt ? data.altAccent || data.accent : data.accent || '#ff6b00';
    const isHovered = hoveredAffId === data.name;
    const isDraggingActive = stateRef.current.isDragging || stateRef.current.hasDragged;
    const isDimmed = !isDraggingActive && hoveredAffId !== null && !isHovered;

    return (
      <div
        key={`${rowNum}-${data.name}-${idx}`}
        className={`aff-panel ${isGlitching ? 'alias-glitch' : ''} ${isHovered ? 'aff-active' : ''} ${isDimmed ? 'aff-dimmed' : ''}`}
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
            draggable="false"
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
            draggable="false"
          />
        )}
      </div>
    );
  };


  return (
    <section id="affiliates" className="section">
      <div className="container-lg">
        <WaveformHeader
          title={t('affiliates.heading', 'Affiliates')}
          dataText="Affiliates"
          i18nKey="affiliates.heading"
        />
        <div className="aff-subline-row">
          <p className="aff-subline">
            <span data-i18n="affiliates.sub">
              {t('affiliates.sub', 'Collaborative network: //')}
            </span>
            <span className={`accessing-dossier ${accessingName ? 'visible' : ''}`} id="accessingDossier">
              {accessingName ? `ACCESSING_DOSSIER: ${accessingName}` : ''}
            </span>
          </p>
          <div 
            className="aff-drag-instruction" 
            style={{ 
              fontFamily: "'Roboto Mono', monospace", 
              fontSize: '0.68rem', 
              fontWeight: '700',
              letterSpacing: '2px', 
              color: 'var(--accent)', 
              textTransform: 'uppercase' 
            }}
          >
            // HOLD &amp; DRAG TO NAVIGATE ROSTER
          </div>
        </div>

        {/* ── Stream Marquee Rows ── */}
        <div
          className="aff-panels-wrap"
          id="affPanelsWrap"
          ref={wrapRef}
          onPointerDown={(e) => {
            if (e.pointerType === 'touch') return;
            stateRef.current.isDragging = true;
            stateRef.current.hasDragged = false;
            stateRef.current.dragStartX = e.clientX;
            stateRef.current.dragLastX = e.clientX;
            stateRef.current.velocity = 0;
            if (wrapRef.current) wrapRef.current.style.cursor = 'grabbing';
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

        {/* ── Centered Holographic Dossier Modal (Screen Pop Up) ── */}
        <AffiliateDossier
          variant="popup"
          person={selectedAffiliate}
          onClose={closeDossier}
          onAliasChange={setDossierShowingAlias}
        />

        {/* ── Reusable Full Roster Control (Left-Aligned) ── */}
        <div className="ext-link-row mt-4" style={{ display: 'flex', justifyContent: 'flex-start' }}>
          <TechButton to="/affiliates" variant="secondary">
            FULL_ROSTER // AFFILIATES_PAGE
          </TechButton>
        </div>
      </div>
    </section>
  );
};
