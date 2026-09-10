import React, { useState, useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { GlobalGrid } from './components/common/GlobalGrid';
import { GeoCanvas } from './components/common/GeoCanvas';
import { TelemetryDecals } from './components/common/TelemetryDecals';
import { SocialSidePanel } from './components/common/SocialSidePanel';
import { Navbar } from './components/common/Navbar';
import { LangPanel } from './components/common/LangPanel';
import { Footer } from './components/common/Footer';
import { BootScreen } from './components/common/BootScreen';
import { HomePage } from './pages/HomePage';

const WorksPage = React.lazy(() =>
  import('./pages/WorksPage').then((m) => ({ default: m.WorksPage }))
);
const DiscographyPage = React.lazy(() =>
  import('./pages/DiscographyPage').then((m) => ({ default: m.DiscographyPage }))
);
const AffiliatesPage = React.lazy(() =>
  import('./pages/AffiliatesPage').then((m) => ({ default: m.AffiliatesPage }))
);
const TermsOfServicePage = React.lazy(() =>
  import('./pages/TermsOfServicePage').then((m) => ({ default: m.TermsOfServicePage }))
);

const ROUTE_BOOT_LINES = {
  '/': [
    'LOADING_AUDIO_MATRIX...',
    'DECRYPTING_ARCHIVE...',
    'MOUNTING_NEURAL_LINK...',
    'VERIFYING_INTEGRITY...',
    'SYSTEM_READY',
  ],
  '/works': [
    'LOADING_PROJECT_FILES...',
    'SCANNING_WORKS_LOG...',
    'INDEXING_COMMISSIONS...',
    'MOUNTING_CREDITS_DB...',
    'SYSTEM_READY',
  ],
  '/discography': [
    'LOADING_AUDIO_ARCHIVE...',
    'INDEXING_RELEASES...',
    'PARSING_TIMELINE_DATA...',
    'MOUNTING_DISCOGRAPHY...',
    'SYSTEM_READY',
  ],
  '/affiliates': [
    'LOADING_NETWORK_ROSTER...',
    'INDEXING_COLLABORATORS...',
    'VERIFYING_AFFILIATIONS...',
    'MOUNTING_DOSSIER_DB...',
    'SYSTEM_READY',
  ],
  '/terms-of-service': [
    'LOADING_LEGAL_FRAMEWORK...',
    'PARSING_COMMISSION_TOS...',
    'INDEXING_USAGE_RIGHTS...',
    'VERIFYING_POLICY_DOCS...',
    'SYSTEM_READY',
  ],
};

export const App = () => {
  const location = useLocation();
  const [isLangOpen, setIsLangOpen] = useState(false);
  const [revealTrigger, setRevealTrigger] = useState(false);

  // Check initial boot lines based on location
  const initialPath = location.pathname.startsWith('/discography')
    ? '/discography'
    : location.pathname.startsWith('/affiliates')
    ? '/affiliates'
    : location.pathname;

  const bootLines = ROUTE_BOOT_LINES[initialPath] || ROUTE_BOOT_LINES['/'];

  // Section reveal observer (replicates legacy js/ui.js)
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('is-visible');
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
          observer.unobserve(entry.target);

          const pct = entry.target.querySelector('.percentage');
          if (pct && (pct.innerText === '0%' || pct.innerText === '0')) {
            const startTime = performance.now();
            const animate = (now) => {
              const progress = Math.min((now - startTime) / 1000, 1);
              pct.innerText = `${Math.floor(progress * 100)}%`;
              if (progress < 1) requestAnimationFrame(animate);
            };
            requestAnimationFrame(animate);
          }
        });
      },
      { threshold: 0.1 }
    );

    const timer = setTimeout(() => {
      const sections = document.querySelectorAll('.section');
      sections.forEach((s) => {
        const rect = s.getBoundingClientRect();
        if (rect.top < window.innerHeight + 150 && rect.bottom > -50) {
          s.classList.add('is-visible');
          s.style.opacity = '1';
          s.style.transform = 'translateY(0)';
        }
        observer.observe(s);
      });
    }, 60);

    return () => {
      clearTimeout(timer);
      observer.disconnect();
    };
  }, [location.pathname]);

  return (
    <>
      <a href="#main-content" className="skip-nav">
        Skip to main content
      </a>

      {/* Boot screen on load */}
      <BootScreen lines={bootLines} />

      {/* Shared backgrounds & interactive elements */}
      <GlobalGrid />
      <GeoCanvas />
      <TelemetryDecals />
      <SocialSidePanel />

      {/* Navigation */}
      <Navbar
        onMoreClick={() => setRevealTrigger(true)}
        onResetRevealTrigger={() => setRevealTrigger(false)}
        onLangToggle={() => setIsLangOpen((prev) => !prev)}
        isLangOpen={isLangOpen}
      />
      <LangPanel isOpen={isLangOpen} onClose={() => setIsLangOpen(false)} />

      {/* Page Routes */}
      <React.Suspense fallback={null}>
        <Routes>
          <Route
            path="/"
            element={
              <HomePage
                revealTrigger={revealTrigger}
                onResetRevealTrigger={() => setRevealTrigger(false)}
              />
            }
          />
          <Route path="/works" element={<WorksPage />} />
          <Route path="/discography" element={<DiscographyPage />} />
          <Route path="/discography/:slug" element={<DiscographyPage />} />
          <Route path="/affiliates" element={<AffiliatesPage />} />
          <Route path="/affiliates/:slug" element={<AffiliatesPage />} />
          <Route path="/terms-of-service" element={<TermsOfServicePage />} />
          <Route
            path="*"
            element={
              <HomePage
                revealTrigger={revealTrigger}
                onResetRevealTrigger={() => setRevealTrigger(false)}
              />
            }
          />
        </Routes>
      </React.Suspense>

      {/* Footer */}
      <Footer />
    </>
  );
};
