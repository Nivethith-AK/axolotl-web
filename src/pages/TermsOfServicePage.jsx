import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { TosContent } from '../components/tos/TosContent';

const SECTIONS = [
  { id: 'tos-preamble', label: 'PREAMBLE', num: '' },
  { id: 'tos-commissions', label: 'COMMISSION WORK', num: '01' },
  { id: 'tos-non-commercial', label: 'NON-COMMERCIAL USAGE', num: '02' },
  { id: 'tos-commercial', label: 'COMMERCIAL LICENSING', num: '03' },
  { id: 'tos-attribution', label: 'ATTRIBUTION RULES', num: '04' },
  { id: 'tos-ai', label: 'AI & DERIVATIVE WORK', num: '05' },
  { id: 'tos-payment', label: 'PAYMENT & REFUNDS', num: '06' },
  { id: 'tos-ip', label: 'INTELLECTUAL PROPERTY', num: '07' },
  { id: 'tos-termination', label: 'TERMINATION OF RIGHTS', num: '08' },
  { id: 'tos-complexity', label: 'COMPLEXITY MODEL', num: '09' },
  { id: 'tos-legal', label: 'AMENDMENTS & LEGAL', num: '10' },
];

export const TermsOfServicePage = () => {
  const { t } = useLanguage();
  const [activeSection, setActiveSection] = useState('tos-preamble');
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const mobileNavRef = useRef(null);

  useEffect(() => {
    document.title = t('page_title.tos', 'Δxolotl // Terms of Service');
    window.scrollTo(0, 0);
  }, [t]);

  // Scroll spy
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { rootMargin: '-15% 0px -75% 0px', threshold: 0 }
    );

    SECTIONS.forEach((sec) => {
      const el = document.getElementById(sec.id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

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
    setMobileNavOpen(false);
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <main id="main-content">
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

      {/* Mobile Nav Toggle */}
      <button
        type="button"
        className={`tos-mobile-nav-toggle ${mobileNavOpen ? 'open' : ''}`}
        id="tosNavToggle"
        onClick={() => setMobileNavOpen((prev) => !prev)}
      >
        CONTENTS // JUMP TO SECTION
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
                {sec.num && <span className="nav-id">{sec.num}</span>}
                {sec.label}
              </a>
            </li>
          ))}
        </ul>
      </div>

      {/* Main Layout */}
      <div className="tos-layout">
        {/* Desktop Sticky Sidenav */}
        <aside className="tos-sidenav">
          <div className="tos-sidenav-label">SECTIONS // TOC</div>
          <ul className="tos-sidenav-list" id="tosNavList">
            {SECTIONS.map((sec) => (
              <li key={sec.id}>
                <a
                  href={`#${sec.id}`}
                  className={activeSection === sec.id ? 'active' : ''}
                  onClick={(e) => handleLinkClick(e, sec.id)}
                >
                  {sec.num && <span className="nav-id">{sec.num}</span>}
                  {sec.label}
                </a>
              </li>
            ))}
          </ul>
        </aside>

        {/* Content */}
        <TosContent />
      </div>
    </main>
  );
};
