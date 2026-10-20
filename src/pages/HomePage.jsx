import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Hero } from '../components/hero/Hero';
import { About } from '../components/about/About';
import { MusicSection } from '../components/music/MusicSection';
import { PortfolioSection } from '../components/portfolio/PortfolioSection';
import { AffiliatesTeaser } from '../components/affiliates/AffiliatesTeaser';
import { ConnectSection } from '../components/connect/ConnectSection';
import { scrollToSection } from '../lib/scrollToSection';

export const HomePage = ({ revealTrigger, onResetRevealTrigger }) => {
  const location = useLocation();

  useEffect(() => {
  if (!location.hash) return;
  const id = location.hash.replace('#', '');
  const timer = setTimeout(() => scrollToSection(id, { duration: 1.5 }), 150);
  return () => clearTimeout(timer);
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
