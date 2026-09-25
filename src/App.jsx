import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { GlobalGrid } from './components/common/GlobalGrid';
import { GeoCanvas } from './components/common/GeoCanvas';
import { TelemetryDecals } from './components/common/TelemetryDecals';
import { SocialSidePanel } from './components/common/SocialSidePanel';
import { Navbar } from './components/common/Navbar';
import { LangPanel } from './components/common/LangPanel';
import { Footer } from './components/common/Footer';
import { BootScreen } from './components/common/BootScreen';
import { ThemeTransitionOverlay } from './components/common/ThemeTransitionOverlay';
import { SmoothScrollProvider } from './components/common/SmoothScrollProvider';
import { HomePage } from './pages/HomePage';

const WorksPage = React.lazy(() =>
  import('./pages/WorksPage').then((m) => ({ default: m.WorksPage }))
);
const PortfolioPage = React.lazy(() =>
  import('./pages/PortfolioPage').then((m) => ({ default: m.PortfolioPage }))
);
const AboutPage = React.lazy(() =>
  import('./pages/AboutPage').then((m) => ({ default: m.AboutPage }))
);
const MusicPage = React.lazy(() =>
  import('./pages/MusicPage').then((m) => ({ default: m.MusicPage }))
);
const ConnectPage = React.lazy(() =>
  import('./pages/ConnectPage').then((m) => ({ default: m.ConnectPage }))
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
  '/portfolio': [
    'LOADING_PORTFOLIO_DATA...',
    'SCANNING_PROJECT_FILES...',
    'INDEXING_PRODUCTIONS...',
    'MOUNTING_MEDIA_STREAM...',
    'SYSTEM_READY',
  ],
  '/about': [
    'LOADING_BIO_ARCHIVE...',
    'DECRYPTING_DOSSIER...',
    'MOUNTING_IDENTITY_NODE...',
    'VERIFYING_CAPABILITIES...',
    'SYSTEM_READY',
  ],
  '/music': [
    'LOADING_AUDIO_FEED...',
    'SCANNING_FREQUENCY_SPECTRUM...',
    'INITIALIZING_PLAYBACK...',
    'MOUNTING_STREAM_RELAYS...',
    'SYSTEM_READY',
  ],
  '/connect': [
    'INITIALIZING_TRANSMISSION...',
    'SCANNING_NEURAL_FREQUENCIES...',
    'MOUNTING_COMMS_ARRAY...',
    'CHANNELS_OPEN',
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
    'LOADING_COLLABORATIVE_NET...',
    'SCANNING_AFFILIATES_DB...',
    'INDEXING_COLLABORATORS...',
    'MOUNTING_ROSTER...',
    'SYSTEM_READY',
  ],
  '/terms-of-service': [
    'LOADING_LEGAL_ARCHIVE...',
    'PARSING_TERMS_DATA...',
    'MOUNTING_TOS_NODE...',
    'VERIFYING_CLAUSES...',
    'SYSTEM_READY',
  ],
};

const getTopRoute = (path) => {
  if (path.startsWith('/discography')) return '/discography';
  if (path.startsWith('/affiliates')) return '/affiliates';
  if (path.startsWith('/works')) return '/works';
  if (path.startsWith('/portfolio')) return '/portfolio';
  if (path.startsWith('/about')) return '/about';
  if (path.startsWith('/music')) return '/music';
  if (path.startsWith('/connect')) return '/connect';
  if (path.startsWith('/terms-of-service')) return '/terms-of-service';
  return '/';
};

export const App = () => {
  const location = useLocation();
  const [isLangOpen, setIsLangOpen] = useState(false);
  const [revealTrigger, setRevealTrigger] = useState(false);

  const currentTop = getTopRoute(location.pathname);

  // Boot animation state on initial visit & page redirects
  const [bootState, setBootState] = useState({
    active: true,
    lines: ROUTE_BOOT_LINES[currentTop] || ROUTE_BOOT_LINES['/'],
    key: `boot-${currentTop}-initial`,
  });

  const prevTopRouteRef = useRef(currentTop);

  const handleBootComplete = useCallback(() => {
    setBootState((prev) => ({ ...prev, active: false }));
    if (window.lenis) window.lenis.start();
  }, []);

  // When redirecting to another page link, trigger authentic loading animation for that page
  useEffect(() => {
    const top = getTopRoute(location.pathname);
    if (top !== prevTopRouteRef.current) {
      prevTopRouteRef.current = top;
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      if (window.lenis) {
        window.lenis.scrollTo(0, { immediate: true });
        window.lenis.stop();
      }
      setBootState({
        active: true,
        lines: ROUTE_BOOT_LINES[top] || ROUTE_BOOT_LINES['/'],
        key: `boot-${top}-${Date.now()}`,
      });
    }
  }, [location.pathname]);

  // Section reveal observer (replicates legacy js/ui.js)
  useEffect(() => {
    const animIds = [];
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
              if (!document.body.contains(pct)) return;
              const progress = Math.min((now - startTime) / 1000, 1);
              pct.innerText = `${Math.floor(progress * 100)}%`;
              if (progress < 1) {
                animIds.push(requestAnimationFrame(animate));
              }
            };
            animIds.push(requestAnimationFrame(animate));
          }
        });
      },
      { threshold: 0.1 }
    );

    const checkSections = () => {
      const sections = document.querySelectorAll('.section:not(.is-visible)');
      sections.forEach((s) => {
        const rect = s.getBoundingClientRect();
        if (rect.top < window.innerHeight + 150 && rect.bottom > -50) {
          s.classList.add('is-visible');
          s.style.opacity = '1';
          s.style.transform = 'translateY(0)';
        } else {
          observer.observe(s);
        }
      });
    };

    checkSections();
    const t1 = setTimeout(checkSections, 80);
    const t2 = setTimeout(checkSections, 250);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      animIds.forEach(cancelAnimationFrame);
      observer.disconnect();
    };
  }, [location.pathname]);

  return (
    <SmoothScrollProvider>
      <a href="#main-content" className="skip-nav">
        Skip to main content
      </a>

      {/* Cyberpunk Theme Switch Transition Overlay */}
      <ThemeTransitionOverlay />

      {/* Boot screen loading animation on initial load & page redirect */}
      {bootState.active && (
        <BootScreen
          key={bootState.key}
          lines={bootState.lines}
          onComplete={handleBootComplete}
        />
      )}

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
          <Route path="/portfolio" element={<PortfolioPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/music" element={<MusicPage />} />
          <Route path="/connect" element={<ConnectPage />} />
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
    </SmoothScrollProvider>
  );
};

export default App;
