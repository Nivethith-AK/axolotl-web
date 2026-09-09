import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { WaveformHeader } from '../common/WaveformHeader';
import { PORTFOLIO_DATA } from '../../data/portfolioData';

export const PortfolioSection = () => {
  const { t } = useLanguage();
  const pad = (n) => String(n).padStart(2, '0');

  /* Desktop paged grid */
  const PAGE_SIZE_DESKTOP = 8;
  const totalPagesDesktop = Math.max(1, Math.ceil(PORTFOLIO_DATA.length / PAGE_SIZE_DESKTOP));
  const [currentPageDesktop, setCurrentPageDesktop] = useState(0);

  /* Mobile swipeable carousel */
  const PAGE_SIZE_MOBILE = 6;
  const mobilePages = [];
  for (let i = 0; i < PORTFOLIO_DATA.length; i += PAGE_SIZE_MOBILE) {
    mobilePages.push(PORTFOLIO_DATA.slice(i, i + PAGE_SIZE_MOBILE));
  }
  const totalMobilePages = mobilePages.length;
  const allMobileSlots = totalMobilePages + 2;
  const [currentMobileSlot, setCurrentMobileSlot] = useState(1);
  const [isMobileAnimating, setIsMobileAnimating] = useState(false);
  const mobileTrackRef = useRef(null);
  const mobileStartRef = useRef(0);

  // Desktop Marquee overflow measurement
  const desktopGridRef = useRef(null);
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!desktopGridRef.current) return;
      desktopGridRef.current.querySelectorAll('.frame-bar-value-viewport').forEach((viewport) => {
        const valueEl = viewport.querySelector('.frame-bar-value');
        if (!valueEl) return;
        const overflow = valueEl.scrollWidth - viewport.clientWidth;
        if (overflow > 2) {
          valueEl.style.setProperty('--scroll-distance', `-${overflow}px`);
          valueEl.classList.add('is-overflowing');
        } else {
          valueEl.classList.remove('is-overflowing');
          valueEl.style.removeProperty('--scroll-distance');
        }
      });
    }, 120);
    return () => clearTimeout(timer);
  }, [currentPageDesktop]);

  // Mobile carousel navigation
  const goToMobileSlot = (slot, animated = true) => {
    if (animated) setIsMobileAnimating(true);
    if (mobileTrackRef.current) {
      mobileTrackRef.current.style.transition = animated
        ? 'transform 0.45s cubic-bezier(0.4, 0, 0.2, 1)'
        : 'none';
      mobileTrackRef.current.style.transform = `translateX(-${slot * (100 / allMobileSlots)}%)`;
    }
    setCurrentMobileSlot(slot);

    if (animated) {
      setTimeout(() => {
        if (slot === 0) {
          goToMobileSlot(totalMobilePages, false);
        } else if (slot === totalMobilePages + 1) {
          goToMobileSlot(1, false);
        }
        setIsMobileAnimating(false);
      }, 460);
    }
  };

  useEffect(() => {
    goToMobileSlot(1, false);
  }, []);

  const renderFacade = (item) => (
    <div className="mini-video-container">
      <a
        className="yt-facade"
        href={`https://www.youtube.com/watch?v=${item.youtubeId}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={item.label}
      >
        <img
          className="yt-facade-thumb"
          src={`https://img.youtube.com/vi/${item.youtubeId}/hqdefault.jpg`}
          alt={item.label}
          loading="lazy"
        />
        <span className="yt-facade-play">
          <svg viewBox="0 0 24 24">
            <path d="M6 4l15 8-15 8z" />
          </svg>
        </span>
      </a>
    </div>
  );

  // Desktop current items
  const startDesktop = currentPageDesktop * PAGE_SIZE_DESKTOP;
  const currentItemsDesktop = PORTFOLIO_DATA.slice(startDesktop, startDesktop + PAGE_SIZE_DESKTOP);
  const padCountDesktop = PAGE_SIZE_DESKTOP - currentItemsDesktop.length;

  const realMobileIdx = (slot) => (slot - 1 + totalMobilePages) % totalMobilePages;

  return (
    <section id="portfolio" className="section">
      <div className="container-lg">
        <WaveformHeader
          title={t('portfolio.heading', 'Portfolio')}
          dataText="Portfolio"
          i18nKey="portfolio.heading"
        />
        <p data-i18n-html="portfolio.sub">
          Selected works by <strong>Δxolotl</strong> //
        </p>

        {/* ── DESKTOP ONLY: Paged Grid ── */}
        <div className="portfolio-pager-row portfolio-desktop-only mt-1">
          <button
            type="button"
            className="portfolio-pager-arrow portfolio-pager-prev"
            id="portfolioPrev"
            aria-label="Previous page"
            disabled={currentPageDesktop === 0}
            onClick={() => setCurrentPageDesktop((p) => Math.max(0, p - 1))}
          >
            &#8592;
          </button>

          <div className="portfolio-video-grid row gx-3 gy-3" id="portfolioGrid" ref={desktopGridRef}>
            {currentItemsDesktop.map((item, i) => {
              const globalIndex = startDesktop + i;
              return (
                <div key={item.youtubeId} className="portfolio-video-item col-lg-3">
                  <div
                    className="frame-bar top-bar"
                    title={`PRJ_${pad(globalIndex + 1)} // ${item.label}`}
                  >
                    <span className="frame-bar-prefix">{`PRJ_${pad(globalIndex + 1)} // `}</span>
                    <span className="frame-bar-value-viewport">
                      <span className="frame-bar-value">{item.label}</span>
                    </span>
                  </div>
                  {renderFacade(item)}
                  <div className="frame-bar bottom-bar">
                    <span className="frame-bar-prefix">Data_Type: </span>
                    <span className="frame-bar-value-viewport">
                      <span className="frame-bar-value">{item.dataType}</span>
                    </span>
                  </div>
                </div>
              );
            })}

            {/* Locked Placeholders */}
            {Array.from({ length: padCountDesktop }).map((_, i) => {
              const globalIndex = startDesktop + currentItemsDesktop.length + i;
              return (
                <div
                  key={`locked-${i}`}
                  className="portfolio-video-item encrypted-slot col-lg-3"
                  data-placeholder="true"
                >
                  <div className="frame-bar top-bar">PRJ_{pad(globalIndex + 1)} // [LOCKED]</div>
                  <div className="encrypted-bg">
                    <div className="encrypted-text">
                      ENCRYPTED_DATA
                      <br />
                      ACCESS_DENIED
                    </div>
                  </div>
                  <div className="frame-bar bottom-bar">Data_Type: UNKNOWN</div>
                </div>
              );
            })}
          </div>

          <button
            type="button"
            className="portfolio-pager-arrow portfolio-pager-next"
            id="portfolioNext"
            aria-label="Next page"
            disabled={currentPageDesktop >= totalPagesDesktop - 1}
            onClick={() => setCurrentPageDesktop((p) => Math.min(totalPagesDesktop - 1, p + 1))}
          >
            &#8594;
          </button>
        </div>

        <div className="portfolio-pager-counter portfolio-desktop-only" id="portfolioPagerCounter">
          PAGE {pad(currentPageDesktop + 1)} / {pad(totalPagesDesktop)}
        </div>

        {/* ── MOBILE ONLY: Looping Carousel ── */}
        <div className="portfolio-mobile-only mt-1">
          <div
            className="pmc-viewport"
            id="pmcViewport"
            role="region"
            aria-label="Portfolio projects"
            aria-roledescription="carousel"
            onTouchStart={(e) => {
              mobileStartRef.current = e.touches[0].clientX;
            }}
            onTouchEnd={(e) => {
              const dx = e.changedTouches[0].clientX - mobileStartRef.current;
              if (!isMobileAnimating && Math.abs(dx) > 40) {
                goToMobileSlot(currentMobileSlot + (dx < 0 ? 1 : -1));
              }
            }}
          >
            <div
              className="pmc-track"
              id="pmcTrack"
              ref={mobileTrackRef}
              style={{ width: `${allMobileSlots * 100}%` }}
            >
              {/* Clone Last */}
              <div
                className="pmc-page"
                aria-hidden="true"
                style={{ width: `${100 / allMobileSlots}%`, minWidth: `${100 / allMobileSlots}%` }}
              >
                {mobilePages[totalMobilePages - 1]?.map((item) => (
                  <div key={item.youtubeId} className="pmc-card">
                    {renderFacade(item)}
                    <div className="pmc-caption">
                      <span className="frame-bar-value-viewport">
                        <span className="frame-bar-value">{item.label}</span>
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Real Pages */}
              {mobilePages.map((pageItems, pageIdx) => {
                const pads = PAGE_SIZE_MOBILE - pageItems.length;
                return (
                  <div
                    key={pageIdx}
                    className="pmc-page"
                    style={{ width: `${100 / allMobileSlots}%`, minWidth: `${100 / allMobileSlots}%` }}
                  >
                    {pageItems.map((item) => (
                      <div key={item.youtubeId} className="pmc-card">
                        {renderFacade(item)}
                        <div className="pmc-caption">
                          <span className="frame-bar-value-viewport">
                            <span className="frame-bar-value">{item.label}</span>
                          </span>
                        </div>
                      </div>
                    ))}
                    {Array.from({ length: pads }).map((_, pIdx) => (
                      <div key={`mpad-${pIdx}`} className="pmc-card">
                        <div className="encrypted-bg encrypted-bg--compact">
                          <div className="encrypted-text encrypted-text--compact">ENCRYPTED_DATA</div>
                        </div>
                        <div className="pmc-caption">[LOCKED]</div>
                      </div>
                    ))}
                  </div>
                );
              })}

              {/* Clone First */}
              <div
                className="pmc-page"
                aria-hidden="true"
                style={{ width: `${100 / allMobileSlots}%`, minWidth: `${100 / allMobileSlots}%` }}
              >
                {mobilePages[0]?.map((item) => (
                  <div key={item.youtubeId} className="pmc-card">
                    {renderFacade(item)}
                    <div className="pmc-caption">
                      <span className="frame-bar-value-viewport">
                        <span className="frame-bar-value">{item.label}</span>
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="pmc-dots" id="pmcDots">
            {Array.from({ length: totalMobilePages }).map((_, i) => (
              <button
                key={i}
                type="button"
                className={`pmc-dot ${i === realMobileIdx(currentMobileSlot) ? 'active' : ''}`}
                aria-label={`Go to page ${i + 1}`}
                onClick={() => {
                  if (!isMobileAnimating) goToMobileSlot(i + 1);
                }}
              ></button>
            ))}
          </div>
        </div>

        {/* External Foriio Link */}
        <div className="ext-link-row mt-4">
          <a
            href="https://foriio.com/theaxolotlmusic"
            target="_blank"
            rel="noopener noreferrer"
            className="ext-link"
          >
            <img src="/images/icons/foriio.png" alt="Foriio" className="ext-link-icon" />
            <span className="prompt">&gt;&gt;&gt;</span> Full_Portfolio :=
            <span className="value">Foriio</span>
          </a>
        </div>
      </div>
    </section>
  );
};
