import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { useLanguage } from '../../context/LanguageContext';

export const Navbar = ({ onMoreClick, onHomeClick, onLangToggle, isLangOpen }) => {
  const { theme, toggleTheme, transitionState } = useTheme();
  const { t } = useLanguage();
  const location = useLocation();
  const navigate = useNavigate();
  const [navOpen, setNavOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [shopText, setShopText] = useState('/SHOP');
  const [unknownText, setUnknownText] = useState('/UNKNOWN');

  const isIndex = location.pathname === '/';
  const onAbout = location.pathname.startsWith('/about');
  const onMusic = location.pathname.startsWith('/music');
  const onPortfolio = location.pathname.startsWith('/portfolio');
  const onDisco = location.pathname.startsWith('/discography');
  const onWorks = location.pathname.startsWith('/works');
  const onAffiliates = location.pathname.startsWith('/affiliates');
  const onConnect = location.pathname.startsWith('/connect');
  const onTos = location.pathname.startsWith('/terms');

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
      if (window.lenis) {
        window.lenis.scrollTo(0, { duration: 1.8 });
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
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
        if (window.lenis) {
          window.lenis.scrollTo(el, { offset: -60, duration: 1.8 });
        } else {
          el.scrollIntoView({ behavior: 'smooth' });
        }
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
        <img
          src="/images/assets/logo_black.webp"
          alt="Δxolotl Logo"
          className="nav-logo"
          width="36"
          height="32"
          decoding="async"
        />
        <div className="logo-text">ΔXOLOTL</div>
      </Link>

      <div className="nav-right">
        <button
          className={`nav-icon-btn ${transitionState?.active ? 'switching' : ''}`}
          id="modeToggle"
          aria-label="Toggle theme"
          onClick={toggleTheme}
        >
          <img src="/images/assets/mode.png" alt="Theme" width="26" height="26" decoding="async" />
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
          <img src="/images/assets/lang.png" alt="Language" width="26" height="26" decoding="async" />
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
        <Link
          to="/"
          className={`nav-link-item ${isIndex ? 'active' : ''}`}
          data-i18n="nav.home"
          onClick={(e) => {
            if (isIndex) {
              handleLogoClick(e);
            }
            closeNav();
          }}
        >
          {t('nav.home', '//_HOME')}
        </Link>
        <Link
          to="/about"
          className={`nav-link-item ${onAbout ? 'active' : ''}`}
          data-i18n="nav.about"
          onClick={closeNav}
        >
          {t('nav.about', '/ABOUT')}
        </Link>
        <Link
          to="/music"
          className={`nav-link-item ${onMusic ? 'active' : ''}`}
          data-i18n="nav.music"
          onClick={closeNav}
        >
          {t('nav.music', '/MUSIC')}
        </Link>
        <Link
          to="/portfolio"
          className={`nav-link-item ${onPortfolio ? 'active' : ''}`}
          data-i18n="nav.portfolio"
          onClick={closeNav}
        >
          {t('nav.portfolio', '/PORTFOLIO')}
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
          to="/affiliates"
          className={`nav-link-item ${onAffiliates ? 'active' : ''}`}
          data-i18n="nav.affiliates"
          onClick={closeNav}
        >
          {t('nav.affiliates', '/AFFILIATES')}
        </Link>
        <Link
          to="/connect"
          className={`nav-link-item ${onConnect ? 'active' : ''}`}
          data-i18n="nav.connect"
          onClick={closeNav}
        >
          {t('nav.connect', '/CONNECT')}
        </Link>
        <Link
          to="/terms-of-service"
          className={`nav-link-item ${onTos ? 'active' : ''}`}
          data-i18n="nav.tos"
          onClick={closeNav}
        >
          {t('nav.tos', '/TERMS_OF_SERVICE')}
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
      </div>
    </nav>
  );
};
