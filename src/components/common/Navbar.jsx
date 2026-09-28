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
  const [activeSection, setActiveSection] = useState('hero');

  const isIndex = location.pathname === '/';

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

  // Track active section on the homepage based on scroll position
  useEffect(() => {
    if (!isIndex) return;

    const sectionIds = ['hero', 'about', 'music', 'portfolio', 'affiliates', 'connect'];
    const sections = sectionIds
      .map((id) => document.getElementById(id))
      .filter(Boolean);

    if (!sections.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { rootMargin: '-20% 0px -55% 0px' }
    );

    sections.forEach((sec) => observer.observe(sec));
    return () => observer.disconnect();
  }, [isIndex]);

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
    closeNav();
    if (isIndex) {
      e.preventDefault();
      if (window.lenis) {
        window.lenis.scrollTo(0, { duration: 1.8 });
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
      if (onHomeClick) onHomeClick();
    }
  };

  const handleNavClick = (e, targetHash) => {
    closeNav();
    if (isIndex) {
      e.preventDefault();
      const targetId = targetHash.replace('#', '');
      const el = document.getElementById(targetId);
      if (el) {
        el.classList.add('is-visible');
        el.style.opacity = '1';
        el.style.transform = 'translateY(0)';
        if (window.lenis) {
          window.lenis.scrollTo(el, { offset: targetId === 'hero' ? 0 : -60, duration: 1.5 });
        } else {
          if (targetId === 'hero') {
            window.scrollTo({ top: 0, behavior: 'smooth' });
          } else {
            el.scrollIntoView({ behavior: 'smooth' });
          }
        }
      }
    } else {
      e.preventDefault();
      navigate('/' + targetHash);
    }
  };

  const handleMoreClick = (e) => {
    e.preventDefault();
    closeNav();
    if (isIndex) {
      if (window.lenis) {
        window.lenis.scrollTo(0, { duration: 1.2 });
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
      if (onMoreClick) onMoreClick();
    } else {
      navigate('/#hero');
      setTimeout(() => {
        if (onMoreClick) onMoreClick();
      }, 350);
    }
  };

  const getIsActive = (sectionId, routePrefix) => {
    if (isIndex) {
      return activeSection === sectionId;
    }
    return routePrefix !== '/' && location.pathname.startsWith(routePrefix);
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
        <a
          href="#hero"
          className={`nav-link-item ${getIsActive('hero', '/') ? 'active' : ''}`}
          data-i18n="nav.home"
          onClick={(e) => handleNavClick(e, '#hero')}
        >
          {t('nav.home', '//_HOME')}
        </a>
        <a
          href="#about"
          className={`nav-link-item ${getIsActive('about', '/about') ? 'active' : ''}`}
          data-i18n="nav.about"
          onClick={(e) => handleNavClick(e, '#about')}
        >
          {t('nav.about', '/ABOUT')}
        </a>
        <a
          href="#music"
          className={`nav-link-item ${getIsActive('music', '/music') ? 'active' : ''}`}
          data-i18n="nav.music"
          onClick={(e) => handleNavClick(e, '#music')}
        >
          {t('nav.music', '/MUSIC')}
        </a>
        <a
          href="#portfolio"
          className={`nav-link-item ${getIsActive('portfolio', '/portfolio') ? 'active' : ''}`}
          data-i18n="nav.portfolio"
          onClick={(e) => handleNavClick(e, '#portfolio')}
        >
          {t('nav.portfolio', '/PORTFOLIO')}
        </a>
        <a
          href="#affiliates"
          className={`nav-link-item ${getIsActive('affiliates', '/affiliates') ? 'active' : ''}`}
          data-i18n="nav.affiliates"
          onClick={(e) => handleNavClick(e, '#affiliates')}
        >
          {t('nav.affiliates', '/AFFILIATES')}
        </a>
        <a
          href="#connect"
          className={`nav-link-item ${getIsActive('connect', '/connect') ? 'active' : ''}`}
          data-i18n="nav.connect"
          onClick={(e) => handleNavClick(e, '#connect')}
        >
          {t('nav.connect', '/CONNECT')}
        </a>
        <a
          href="#hero"
          className="nav-link-item"
          id="navMoreLink"
          data-i18n="nav.more"
          onClick={handleMoreClick}
        >
          {t('nav.more', '/MORE')}
        </a>
      </div>
    </nav>
  );
};
