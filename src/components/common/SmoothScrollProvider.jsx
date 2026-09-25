import React, { createContext, useContext, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import Lenis from 'lenis';
import 'lenis/dist/lenis.css';

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
      duration: 1.8, // Slow-motion weighted momentum glide
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)), // Exponential deceleration curve
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 0.85, // Controlled, slow-motion mouse wheel glide
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
      const anchor = e.target.closest('a[href^="#"]');
      if (!anchor) return;
      const href = anchor.getAttribute('href');
      if (!href || href === '#' || href === '#!') return;

      const targetEl = document.querySelector(href);
      if (targetEl) {
        e.preventDefault();
        targetEl.classList.add('is-visible');
        targetEl.style.opacity = '1';
        targetEl.style.transform = 'translateY(0)';
        lenis.scrollTo(targetEl, {
          offset: -60,
          duration: 1.8,
          easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        });
      }
    };

    document.addEventListener('click', handleAnchorClick);

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

  return (
    <SmoothScrollContext.Provider value={lenisRef.current}>
      {children}
    </SmoothScrollContext.Provider>
  );
};
