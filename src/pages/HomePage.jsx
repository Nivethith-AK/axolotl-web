import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Hero } from '../components/hero/Hero';
import { About } from '../components/about/About';
import { MusicSection } from '../components/music/MusicSection';
import { PortfolioSection } from '../components/portfolio/PortfolioSection';
import { AffiliatesTeaser } from '../components/affiliates/AffiliatesTeaser';
import { ConnectSection } from '../components/connect/ConnectSection';
import { SignalBoard } from '../components/home/SignalBoard';

export const HomePage = ({ revealTrigger, onResetRevealTrigger }) => {
  const location = useLocation();

  useEffect(() => {
    if (location.hash) {
      const id = location.hash.replace('#', '');
      const el = document.getElementById(id);
      if (el) {
        el.classList.add('is-visible');
        el.style.opacity = '1';
        setTimeout(() => {
          if (window.lenis) {
            window.lenis.scrollTo(el, { offset: -60, duration: 1.5 });
          } else {
            el.scrollIntoView({ behavior: 'smooth' });
          }
        }, 150);
      }
    }
  }, [location.hash]);

  return (
    <main id="main-content">
      <Hero
        revealTrigger={revealTrigger}
        onResetRevealTrigger={onResetRevealTrigger}
      />
      <About />
      <SignalBoard />
      <MusicSection />
      <PortfolioSection />
      <AffiliatesTeaser />
      <ConnectSection />
    </main>
  );
};
