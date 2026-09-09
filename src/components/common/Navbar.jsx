import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';

export const Navbar = ({ onMoreClick, onHomeClick, onLangToggle, isLangOpen }) => {
  const { theme, toggleTheme } = useTheme();
  const { t } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();
  const [navOpen, setNavOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [shopText, setShopText] = useState('/SHOP');
  const [unknownText, setUnknownText] = useState('/UNKNOWN');

  const isIndex = location.pathname === '/';
  const onDisco = location.pathname.startsWith('/discography');
  const onWorks = location.pathname.startsWith('/works');
  const onTos = location.pathname.startsWith('/terms');
  const onAffiliates = location.pathname.startsWith('/affiliates');

  const navLinksRef = useRef(null);
  const togglerRef = useRef(null);
  const lastScrollY = useRef(0);

  // Scroll shadow
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
      if (Math.abs(window.scrollY - lastScrollY.current) > 8 && navOpen) {
        setNavOpen(false);
      }
      lastScrollY.current = window.scrollY;
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [navOpen]);

  // Focus trap for drawer
  useEffect(() => {
    if (!navOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setNavOpen(false);
        togglerRef.current?.focus();
        return;
      }
      if (e.key === 'Tab' && navLinksRef.current) {
        const focusables = Array.from(
          navLinksRef.current.querySelectorAll(
            'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
          )
        );
        if (!focusables.length) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === first) {
            e.preventDefault();
            last.focus();
          }
        } else {
          if (document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [navOpen]);

  // Close drawer on outside click
  useEffect(() => {
    const handleOutside = (e) => {
      if (
        navOpen &&
        navLinksRef.current &&
        !navLinksRef.current.contains(e.target) &&
        togglerRef.current &&
        !togglerRef.current.contains(e.target)
      ) {
        setNavOpen(false);
      }
    };
    document.addEventListener('click', handleOutside);
    document.addEventListener('touchend', handleOutside, { passive: true });
    return () => {
      document.removeEventListener('click', handleOutside);
      document.removeEventListener('touchend', handleOutside);
    };
  }, [navOpen]);

  const closeNav = () => setNavOpen(false);

  const handleLogoClick = (e) => {
    if (isIndex) {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
      if (onHomeClick) onHomeClick();
    }
    closeNav();
  };

  const handleSectionClick = (e, targetId) => {
    if (isIndex) {
      e.preventDefault();
      const el = document.getElementById(targetId);
      if (el) {
        el.classList.add('is-visible');
        el.style.opacity = '1';
        el.style.transform = 'translateY(0)';
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }
    closeNav();
  };

  const handleGlitchLink = (e, orig, setter) => {
    e.preventDefault();
    closeNav();
    const chars = 'X@#$%!?_▒░▓';
    let frames = 0;
    const interval = setInterval(() => {
      setter(
        Array.from(orig)
          .map((c) => (c === '/' ? c : chars[Math.floor(Math.random() * chars.length)]))
          .join('')
      );
      if (++frames > 8) {
        clearInterval(interval);
        setter(orig);
      }
    }, 40);
  };

  return (
    <nav
      className={`nav ${scrolled ? 'scrolled' : ''}`}
      id="mainNav"
      role="navigation"
      aria-label="Main navigation"
    >
      <Link
        to="/"
        className="nav-left"
        onClick={handleLogoClick}
        style={{ textDecoration: 'none', color: 'inherit' }}
      >
        <img src="/images/assets/logo_black.png" alt="Δxolotl Logo" className="nav-logo" />
        <div className="logo-text">ΔXOLOTL</div>
      </Link>

      <div className="nav-right">
        <button
          className="nav-icon-btn"
          id="modeToggle"
          aria-label="Toggle theme"
          onClick={toggleTheme}
        >
          <img src="/images/assets/mode.png" alt="Theme" />
        </button>
        <button
          className={`nav-icon-btn ${isLangOpen ? 'active' : ''}`}
          id="langToggle"
          aria-label="Switch language"
          onClick={(e) => {
            e.stopPropagation();
            if (navOpen) setNavOpen(false);
            onLangToggle();
          }}
        >
          <img src="/images/assets/lang.png" alt="Language" />
        </button>
        <div className="nav-divider"></div>
        <button
          ref={togglerRef}
          className={`nav-toggler ${navOpen ? 'open' : ''}`}
          id="navToggler"
          aria-label="Toggle navigation"
          aria-expanded={navOpen}
          onClick={(e) => {
            e.stopPropagation();
            setNavOpen((prev) => !prev);
          }}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>

      <div ref={navLinksRef} className={`nav-links ${navOpen ? 'open' : ''}`} id="navLinks">
        {isIndex ? (
          <>
            <a
              href="#hero"
              className="nav-link-item"
              data-i18n="nav.home"
              onClick={(e) => {
                handleLogoClick(e);
                closeNav();
              }}
            >
              {t('nav.home', '//_HOME')}
            </a>
            <a
              href="#about"
              className="nav-link-item"
              data-i18n="nav.about"
              onClick={(e) => handleSectionClick(e, 'about')}
            >
              {t('nav.about', '/ABOUT')}
            </a>
            <a
              href="#music"
              className="nav-link-item"
              data-i18n="nav.music"
              onClick={(e) => handleSectionClick(e, 'music')}
            >
              {t('nav.music', '/MUSIC')}
            </a>
            <a
              href="#portfolio"
              className="nav-link-item"
              data-i18n="nav.portfolio"
              onClick={(e) => handleSectionClick(e, 'portfolio')}
            >
              {t('nav.portfolio', '/PORTFOLIO')}
            </a>
            <a
              href="#affiliates"
              className="nav-link-item"
              data-i18n="nav.affiliates"
              onClick={(e) => handleSectionClick(e, 'affiliates')}
            >
              {t('nav.affiliates', '/AFFILIATES')}
            </a>
            <a
              href="#connect"
              className="nav-link-item"
              data-i18n="nav.connect"
              onClick={(e) => handleSectionClick(e, 'connect')}
            >
              {t('nav.connect', '/CONNECT')}
            </a>
            <a
              href="#hero"
              className="nav-link-item"
              id="navMoreBtn"
              data-i18n="nav.more"
              onClick={(e) => {
                e.preventDefault();
                closeNav();
                const hero = document.getElementById('hero');
                if (hero) hero.scrollIntoView({ behavior: 'smooth' });
                if (onMoreClick) onMoreClick();
              }}
            >
              {t('nav.more', '/MORE')}
            </a>
          </>
        ) : (
          <>
            <Link to="/" className="nav-link-item" data-i18n="nav.home" onClick={closeNav}>
              {t('nav.home', '//_HOME')}
            </Link>
            <Link
              to="/discography"
              className={`nav-link-item ${onDisco ? 'active' : ''}`}
              data-i18n="nav.discography"
              onClick={closeNav}
            >
              {t('nav.discography', '/DISCOGRAPHY')}
            </Link>
            <Link
              to="/works"
              className={`nav-link-item ${onWorks ? 'active' : ''}`}
              data-i18n="nav.works"
              onClick={closeNav}
            >
              {t('nav.works', '/WORKS')}
            </Link>
            <Link
              to="/terms-of-service"
              className={`nav-link-item ${onTos ? 'active' : ''}`}
              data-i18n="nav.tos"
              onClick={closeNav}
            >
              {t('nav.tos', '/TERMS_OF_SERVICE')}
            </Link>
            <Link
              to="/affiliates"
              className={`nav-link-item ${onAffiliates ? 'active' : ''}`}
              data-i18n="nav.affiliates_page"
              onClick={closeNav}
            >
              {t('nav.affiliates_page', '/AFFILIATES')}
            </Link>
            <a
              href="#"
              className="nav-link-item"
              id="navShopLink"
              data-i18n="nav.shop"
              onClick={(e) => handleGlitchLink(e, t('nav.shop', '/SHOP'), setShopText)}
            >
              {shopText}
            </a>
            <a
              href="#"
              className="nav-link-item"
              id="navUnknownLink"
              data-i18n="nav.unknown"
              onClick={(e) => handleGlitchLink(e, t('nav.unknown', '/UNKNOWN'), setUnknownText)}
            >
              {unknownText}
            </a>
          </>
        )}
      </div>
    </nav>
  );
};
