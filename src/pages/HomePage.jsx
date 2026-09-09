import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Hero } from '../components/hero/Hero';
import { About } from '../components/about/About';
import { MusicSection } from '../components/music/MusicSection';
import { PortfolioSection } from '../components/portfolio/PortfolioSection';
import { AffiliatesTeaser } from '../components/affiliates/AffiliatesTeaser';
import { ConnectSection } from '../components/connect/ConnectSection';

export const HomePage = ({ revealTrigger, onResetRevealTrigger }) => {
  const location = useLocation();

  useEffect(() => {
    if (location.hash) {
      const id = location.hash.replace('#', '');
      const el = document.getElementById(id);
      if (el) {
        el.classList.add('is-visible');
        el.style.opacity = '1';
        el.style.transform = 'translateY(0)';
        setTimeout(() => el.scrollIntoView({ behavior: 'smooth' }), 100);
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
      <MusicSection />
      <PortfolioSection />
      <AffiliatesTeaser />
      <ConnectSection />
    </main>
  );
};
