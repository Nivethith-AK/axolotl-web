import React, { createContext, useContext, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import Lenis from 'lenis';
import 'lenis/dist/lenis.css';
import { scrollToSection } from '../../lib/scrollToSection';

const SmoothScrollContext = createContext(null);

export const useSmoothScroll = () => useContext(SmoothScrollContext);

export const SmoothScrollProvider = ({ children }) => {
  const lenisRef = useRef(null);
  const location = useLocation();

  useEffect(() => {
    // Respect OS reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      return;
    }

    // Initialize Lenis for cinematic slomo scrolling momentum
    const lenis = new Lenis({
      duration: 1.4, // Responsive weighted momentum glide
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // Exponential deceleration curve
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 0.9,
      touchMultiplier: 1.5,
      smoothTouch: false, // CRITICAL FOR ALL DEVICES: Native 120Hz/60Hz hardware touch responsiveness
      infinite: false,
      autoResize: true,
    });

    lenisRef.current = lenis;
    window.lenis = lenis;

    let rafId;
    function raf(time) {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    }
    rafId = requestAnimationFrame(raf);

    // Global interceptor for in-page anchor links (e.g. #about, #music, etc.)
    const handleAnchorClick = (e) => {
  if (e.defaultPrevented) return; // Navbar / ToS links already handled it
  const anchor = e.target.closest('a[href^="#"]');
  if (!anchor) return;
  const href = anchor.getAttribute('href');
  if (!href || href === '#' || href === '#!') return;
  if (document.querySelector(href)) {
    e.preventDefault();
    scrollToSection(href.slice(1), { duration: 1.4 });
  }
};

    document.addEventListener('click', handleAnchorClick);

    // Synchronize Lenis immediately if native scroll occurs (e.g. dragging scrollbar thumb or clicking track)
    const handleNativeScroll = () => {
      if (lenis.isScrolling === 'smooth') {
        const diff = Math.abs(lenis.animatedScroll - window.scrollY);
        if (diff > 40) {
          lenis.isScrolling = 'native';
          if (lenis.animate) lenis.animate.stop();
          lenis.animatedScroll = lenis.targetScroll = window.scrollY;
        }
      }
    };
    window.addEventListener('scroll', handleNativeScroll, { passive: true });

    // Observe body size changes to keep Lenis geometry synchronized with lazy-loaded routes
    let resizeObserver;
    if (typeof ResizeObserver !== 'undefined') {
      let resizeTimer;
      resizeObserver = new ResizeObserver(() => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
          if (lenisRef.current) lenisRef.current.resize();
        }, 100);
      });
      resizeObserver.observe(document.body);
    }

    return () => {
      document.removeEventListener('click', handleAnchorClick);
      window.removeEventListener('scroll', handleNativeScroll);
      if (resizeObserver) resizeObserver.disconnect();
      cancelAnimationFrame(rafId);
      lenis.destroy();
      lenisRef.current = null;
      if (window.lenis === lenis) {
        delete window.lenis;
      }
    };
  }, []);

  // On route change, reset scroll position immediately and recalculate layout dimensions
  useEffect(() => {
    if (lenisRef.current) {
      lenisRef.current.scrollTo(0, { immediate: true });
      setTimeout(() => {
        if (lenisRef.current) lenisRef.current.resize();
      }, 50);
      setTimeout(() => {
        if (lenisRef.current) lenisRef.current.resize();
      }, 300);
    }
  }, [location.pathname]);

  useEffect(() => {
  const nav = document.getElementById('mainNav');
  if (!nav || typeof ResizeObserver === 'undefined') return;
  const setH = () =>
    document.documentElement.style.setProperty('--header-h', `${nav.offsetHeight}px`);
  setH();
  const ro = new ResizeObserver(setH);
  ro.observe(nav);
  return () => ro.disconnect();
  }, []);

  return (
    <SmoothScrollContext.Provider value={lenisRef.current}>
      {children}
    </SmoothScrollContext.Provider>
  );
};
