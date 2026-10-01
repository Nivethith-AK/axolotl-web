import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { TosContent } from '../components/tos/TosContent';

const SECTIONS = [
  { id: 'tos-preamble', label: 'PREAMBLE', num: '' },
  { id: 'tos-01', label: 'DEFINITIONS', num: '01' },
  { id: 'tos-02', label: 'COMMISSIONING PROCESS', num: '02' },
  { id: 'tos-03', label: 'CODE OF CONDUCT', num: '03' },
  { id: 'tos-04', label: 'SCOPE OF SERVICES', num: '04' },
  { id: 'tos-05', label: 'VARIATION ORDERS & CHANGES', num: '05' },
  { id: 'tos-06', label: 'PRICING & BILLING', num: '06' },
  { id: 'tos-07', label: 'PAYMENT TERMS', num: '07' },
  { id: 'tos-08', label: 'REVISIONS', num: '08' },
  { id: 'tos-09', label: 'DEADLINES & DELIVERY', num: '09' },
  { id: 'tos-10', label: 'INTELLECTUAL PROPERTY', num: '10' },
  { id: 'tos-11', label: 'RIGHTS OF USE & LICENSING', num: '11' },
  { id: 'tos-12', label: 'CANCELLATIONS & REFUNDS', num: '12' },
  { id: 'tos-13', label: 'LIMITATION OF LIABILITY', num: '13' },
  { id: 'tos-14', label: 'AMENDMENTS & GOVERNING', num: '14' },
];

export const TermsOfServicePage = () => {
  const { t } = useLanguage();
  const [activeSection, setActiveSection] = useState('tos-preamble');
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const mobileNavRef = useRef(null);
  const sidenavRef = useRef(null);

  useEffect(() => {
    document.title = t('page_title.tos', 'Δxolotl // Terms of Service');
    if (window.lenis) {
      window.lenis.scrollTo(0, { immediate: true });
    } else {
      window.scrollTo(0, 0);
    }
  }, [t]);

  // Robust Scroll Spy: tracks user scrolling through all 15 authentic sections
  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const scrollY = window.scrollY || window.pageYOffset;
          const windowHeight = window.innerHeight;
          const docHeight = document.documentElement.scrollHeight;

          // Bottom of page check: lock to final section
          if (scrollY + windowHeight >= docHeight - 60) {
            setActiveSection(SECTIONS[SECTIONS.length - 1].id);
            ticking = false;
            return;
          }

          const readingLine = scrollY + 120;
          let currentId = SECTIONS[0].id;

          for (let i = 0; i < SECTIONS.length; i++) {
            const el = document.getElementById(SECTIONS[i].id);
            if (el) {
              const top = el.getBoundingClientRect().top + scrollY;
              if (top <= readingLine) {
                currentId = SECTIONS[i].id;
              } else {
                break;
              }
            }
          }

          setActiveSection(currentId);
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    const timer = setTimeout(handleScroll, 100);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(timer);
    };
  }, []);

  // Auto-scroll TOC sidebar to keep active section in view if sidebar overflows
  useEffect(() => {
    if (!sidenavRef.current) return;
    const activeLink = sidenavRef.current.querySelector(`a[href="#${activeSection}"]`);
    if (activeLink) {
      const sidenav = sidenavRef.current;
      const linkTop = activeLink.offsetTop;
      const sidenavScroll = sidenav.scrollTop;
      const sidenavHeight = sidenav.clientHeight;

      if (linkTop < sidenavScroll + 20 || linkTop > sidenavScroll + sidenavHeight - 40) {
        sidenav.scrollTo({
          top: Math.max(0, linkTop - sidenavHeight / 2 + activeLink.offsetHeight / 2),
          behavior: 'smooth',
        });
      }
    }
  }, [activeSection]);

  // Close mobile nav on outside click
  useEffect(() => {
    const handleOutside = (e) => {
      if (mobileNavRef.current && !mobileNavRef.current.contains(e.target)) {
        const toggleBtn = document.getElementById('tosNavToggle');
        if (!toggleBtn || !toggleBtn.contains(e.target)) {
          setMobileNavOpen(false);
        }
      }
    };
    document.addEventListener('click', handleOutside);
    document.addEventListener('touchend', handleOutside, { passive: true });
    return () => {
      document.removeEventListener('click', handleOutside);
      document.removeEventListener('touchend', handleOutside);
    };
  }, []);

  const handleLinkClick = (e, id) => {
    e.preventDefault();
    setActiveSection(id);
    setMobileNavOpen(false);
    const el = document.getElementById(id);
    if (el) {
      const isMobile = window.innerWidth <= 991;
      const offset = isMobile ? -135 : -88;
      if (window.lenis) {
        window.lenis.scrollTo(el, { offset, duration: 1.2 });
      } else {
        const top = el.getBoundingClientRect().top + window.pageYOffset + offset;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    }
  };

  const activeSectionObj = SECTIONS.find((s) => s.id === activeSection) || SECTIONS[0];

  return (
    <main id="main-content" style={{ minHeight: '100vh', paddingBottom: '80px' }}>
      <div
        className="section"
        id="tosHeader"
        style={{ minHeight: 'unset', paddingTop: '82px', paddingBottom: '20px' }}
      >
        <div className="container-lg">
          <div className="tos-header-tag" data-i18n="tos.header_tag">
            {t('tos.header_tag', 'LEGAL // USAGE_POLICY')}
          </div>
          <h2 className="glitch-burst" data-text="Terms of Service" data-i18n="tos.heading">
            {t('tos.heading', 'Terms of Service')}
          </h2>
          <div className="tos-header-sub">
            COMMISSION AGREEMENT, LICENSING TERMS &amp; USAGE POLICIES
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="container-lg">
        {/* Mobile Nav Sticky Bar & Dropdown */}
        <div className="tos-mobile-nav-container">
          <button
            type="button"
            className={`tos-mobile-nav-toggle ${mobileNavOpen ? 'open' : ''}`}
            id="tosNavToggle"
            aria-expanded={mobileNavOpen}
            onClick={() => setMobileNavOpen((prev) => !prev)}
          >
            <span className="tos-toggle-label">
              CONTENTS // {activeSectionObj.num ? `§${activeSectionObj.num} ` : ''}{activeSectionObj.label}
            </span>
            <span className="tos-toggle-arrow">{mobileNavOpen ? '▲' : '▼'}</span>
          </button>

          {/* Mobile Nav Dropdown */}
          <div
            ref={mobileNavRef}
            className={`tos-mobile-nav-panel ${mobileNavOpen ? 'open' : ''}`}
            id="tosNavPanel"
          >
            <ul className="tos-sidenav-list" id="tosNavListMobile">
              {SECTIONS.map((sec) => (
                <li key={sec.id}>
                  <a
                    href={`#${sec.id}`}
                    className={activeSection === sec.id ? 'active' : ''}
                    onClick={(e) => handleLinkClick(e, sec.id)}
                  >
                    {sec.num && <span className="nav-id">§{sec.num}</span>}
                    {sec.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* 2-Column Main Layout */}
        <div className="tos-layout">
          {/* Desktop Sticky Sidenav */}
          <aside className="tos-sidenav" ref={sidenavRef}>
            <div className="tos-sidenav-label">SECTIONS // TOC</div>
            <ul className="tos-sidenav-list" id="tosNavList">
              {SECTIONS.map((sec) => (
                <li key={sec.id}>
                  <a
                    href={`#${sec.id}`}
                    className={activeSection === sec.id ? 'active' : ''}
                    onClick={(e) => handleLinkClick(e, sec.id)}
                  >
                    {sec.num && <span className="nav-id">§{sec.num}</span>}
                    {sec.label}
                  </a>
                </li>
              ))}
            </ul>
          </aside>

          {/* Content */}
          <TosContent />
        </div>
      </div>
    </main>
  );
};
