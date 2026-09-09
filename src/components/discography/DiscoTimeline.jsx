import React, { useState, useRef, useEffect } from 'react';
import { DISCO_DATA, getDiscoSlug } from '../../data/discographyData';
import { useLanguage } from '../../context/LanguageContext';

export const DiscoTimeline = ({ onSelectTrack, isModalOpen }) => {
  const { t } = useLanguage();
  const [filter, setFilter] = useState('all');
  const [hoveredId, setHoveredId] = useState(null);
  const trackRef = useRef(null);
  const dragRef = useRef({ isDown: false, startX: 0, scrollLeft: 0, hasDragged: false });

  const releasesCount = DISCO_DATA.filter((d) => d.type === 'release').length;
  const featuredCount = DISCO_DATA.filter((d) => d.type === 'featured').length;
  const totalCount = DISCO_DATA.length;

  const filteredData = DISCO_DATA.filter((d) => {
    if (filter === 'all') return true;
    return d.type === filter;
  });

  // Group by year
  const groupedYears = [];
  let currentGroup = null;
  filteredData.forEach((item) => {
    if (!currentGroup || currentGroup.year !== item.year) {
      if (currentGroup) groupedYears.push(currentGroup);
      currentGroup = { year: item.year, items: [] };
    }
    currentGroup.items.push(item);
  });
  if (currentGroup) groupedYears.push(currentGroup);

  // Smooth scroll
  const smoothScroll = (delta) => {
    const track = trackRef.current;
    if (!track) return;
    const start = track.scrollLeft;
    const target = start + delta;
    const dist = target - start;
    const dur = 380;
    const t0 = performance.now();
    const ease = (progress) => (progress < 0.5 ? 2 * progress * progress : -1 + (4 - 2 * progress) * progress);

    const tick = (now) => {
      const p = Math.min((now - t0) / dur, 1);
      track.scrollLeft = start + dist * ease(p);
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };

  const handleMouseDown = (e) => {
    dragRef.current = {
      isDown: true,
      startX: e.clientX,
      scrollLeft: trackRef.current ? trackRef.current.scrollLeft : 0,
      hasDragged: false,
    };
    if (trackRef.current) trackRef.current.classList.add('is-dragging');
  };

  const handleMouseMove = (e) => {
    if (!dragRef.current.isDown || !trackRef.current) return;
    const dx = e.clientX - dragRef.current.startX;
    if (Math.abs(dx) > 6) dragRef.current.hasDragged = true;
    trackRef.current.scrollLeft = dragRef.current.scrollLeft - dx * 1.4;
  };

  const handleMouseUp = () => {
    dragRef.current.isDown = false;
    if (trackRef.current) trackRef.current.classList.remove('is-dragging');
  };

  return (
    <div id="discoTimeline" className={isModalOpen ? 'dossier-mode' : ''} style={{ position: 'relative', zIndex: 3 }}>
      {/* Header */}
      <div className="section" id="discoHeader" style={{ minHeight: 'unset', paddingTop: '82px', paddingBottom: '12px' }}>
        <div className="container-lg">
          <div className="disco-header-tag" data-i18n="disco.header_tag">
            {t('disco.header_tag', 'NODE_ARCHIVE // AUDIO_LOG')}
          </div>
          <h2 className="glitch-burst" data-text="Discography" data-i18n="disco.heading">
            {t('disco.heading', 'Discography')}
          </h2>
          <div className="disco-header-counts">
            <span>{releasesCount}</span> RELEASES &nbsp;·&nbsp; <span>{featuredCount}</span> FEATURED &nbsp;·&nbsp; 2022 - PRESENT
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className={`disco-tabs ${isModalOpen ? 'hidden' : ''}`} id="discoTabs">
        <button
          type="button"
          className={`disco-tab ${filter === 'all' ? 'active' : ''}`}
          onClick={() => setFilter('all')}
        >
          <span data-i18n="disco.filter_all">{t('disco.filter_all', 'ALL')}</span>
          <span className="tab-count">[{totalCount}]</span>
        </button>
        <button
          type="button"
          className={`disco-tab ${filter === 'release' ? 'active' : ''}`}
          onClick={() => setFilter('release')}
        >
          <span data-i18n="disco.filter_releases">{t('disco.filter_releases', 'RELEASES')}</span>
          <span className="tab-count">[{releasesCount}]</span>
        </button>
        <button
          type="button"
          className={`disco-tab ${filter === 'featured' ? 'active' : ''}`}
          onClick={() => setFilter('featured')}
        >
          <span data-i18n="disco.filter_featured">{t('disco.filter_featured', 'FEATURED')}</span>
          <span className="tab-count">[{featuredCount}]</span>
        </button>
      </div>

      {/* Timeline Content */}
      <div className="htl-timeline-wrap" id="htlTimelineWrap">
        <div className="htl-nav">
          <span className="htl-hint htl-hint-desktop" data-i18n="disco.hint_desktop">
            {t('disco.hint_desktop', '// DRAG OR CLICK ARROWS TO NAVIGATE')}
          </span>
          <span className="htl-hint htl-hint-mobile" data-i18n="disco.hint_mobile">
            {t('disco.hint_mobile', '// SCROLL TO NAVIGATE')}
          </span>
        </div>

        <div className="htl-arrow-wrap">
          <button
            type="button"
            className="htl-arrow htl-prev"
            id="htlPrev"
            aria-label="Scroll left"
            onClick={() => smoothScroll(-630)}
          >
            &#8592;
          </button>

          <div className="htl-viewport" id="htlViewport">
            <div
              className="htl-scroll-track"
              id="htlScrollTrack"
              ref={trackRef}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
            >
              <div className="htl-inner" id="htlInner">
                {groupedYears.map((grp, grpIdx) => (
                  <React.Fragment key={`grp-${grp.year}-${grpIdx}`}>
                    {grp.items.map((d, i) => {
                      const posClass = i % 2 === 0 ? 'pos-above' : 'pos-below';
                      const isDimmed = hoveredId !== null && hoveredId !== d.id;
                      const isActive = hoveredId === d.id;

                      return (
                        <div
                          key={d.id}
                          className={`htl-entry-col type-${d.type} ${posClass} ${isDimmed ? 'disco-dimmed' : ''} ${isActive ? 'disco-active' : ''}`}
                          data-disco-id={d.id}
                          data-type={d.type}
                          onMouseEnter={() => setHoveredId(d.id)}
                          onMouseLeave={() => setHoveredId(null)}
                          onClick={() => {
                            if (!dragRef.current.hasDragged) {
                              onSelectTrack(d);
                            }
                          }}
                        >
                          <div className="htl-connector"></div>
                          <div className="htl-card">
                            <div className="dp-bg"></div>
                            <img
                              className="dp-cover"
                              src={d.cover}
                              alt={d.title}
                              loading="lazy"
                              onError={(e) => {
                                e.target.style.display = 'none';
                              }}
                            />
                            <div className="dp-overlay"></div>
                            <div className="dp-accent"></div>
                            <div className="dp-content">
                              <div className="dp-title">{d.title}</div>
                              <div className="dp-type">{d.tag}</div>
                              {d.subVer && <div className="dp-sub-ver">{d.subVer}</div>}
                            </div>
                          </div>
                        </div>
                      );
                    })}

                    <div className="htl-year-col">
                      <div className="htl-year-badge">{grp.year}</div>
                    </div>
                  </React.Fragment>
                ))}
              </div>
            </div>
          </div>

          <button
            type="button"
            className="htl-arrow htl-next"
            id="htlNext"
            aria-label="Scroll right"
            onClick={() => smoothScroll(630)}
          >
            &#8594;
          </button>
        </div>

        <div className="htl-bottom">
          // 2022 - PRESENT<br />
          <span className="htl-bottom-dot">&nbsp;·&nbsp;</span>
          <span data-i18n="disco.bottom_hint">
            {t('disco.bottom_hint', 'CLICK ANY TRACK TO OPEN DOSSIER')}
          </span>
        </div>
      </div>
    </div>
  );
};
