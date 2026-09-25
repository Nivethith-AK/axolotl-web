import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { MusicSection } from '../components/music/MusicSection';

export const MusicPage = () => {
  const { t } = useLanguage();

  useEffect(() => {
    document.title = t('page_title.music', 'Δxolotl // Music Feed');
    if (window.lenis) {
      window.lenis.scrollTo(0, { immediate: true });
    } else {
      window.scrollTo(0, 0);
    }
  }, [t]);

  return (
    <main id="main-content" style={{ minHeight: '100vh', paddingBottom: '100px' }}>
      <div
        className="section"
        id="musicHeader"
        style={{ minHeight: 'unset', paddingTop: '82px', paddingBottom: '20px' }}
      >
        <div className="container-lg">
          <div className="works-header-tag" data-i18n="music.header_tag">
            {t('music.header_tag', 'AUDIO_MATRIX // STREAMING_FEED')}
          </div>
          <h2 className="glitch-burst" data-text="Music Feed" data-i18n="music.heading">
            {t('music.heading', 'Music Feed')}
          </h2>
          <div className="works-header-sub">
            Realtime streaming feeds &amp; recent releases &nbsp;·&nbsp; YOUTUBE &nbsp;·&nbsp; SPOTIFY &nbsp;·&nbsp; APPLE MUSIC
          </div>
        </div>
      </div>

      {/* Embed Music Section component */}
      <MusicSection />

      {/* Cross link to Discography */}
      <div className="container-lg" style={{ marginTop: '40px' }}>
        <div
          style={{
            padding: '24px 28px',
            border: '1px solid var(--border)',
            background: 'var(--surface)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '16px',
          }}
        >
          <div>
            <div
              style={{
                fontFamily: "'Orbitron', sans-serif",
                fontSize: '1rem',
                fontWeight: 700,
                color: 'var(--fg)',
                marginBottom: '4px',
              }}
            >
              LOOKING FOR THE COMPLETE RELEASE TIMELINE?
            </div>
            <div
              style={{
                fontFamily: "'Roboto Mono', monospace",
                fontSize: '0.62rem',
                color: 'var(--text-6)',
              }}
            >
              Explore all official singles, EPs, featured vocaloid works, and collaborative releases.
            </div>
          </div>

          <Link
            to="/discography"
            style={{
              fontFamily: "'Roboto Mono', monospace",
              fontSize: '0.72rem',
              fontWeight: 700,
              letterSpacing: '1px',
              padding: '10px 20px',
              border: '1px solid var(--accent)',
              background: 'var(--accent)',
              color: '#fff',
              textDecoration: 'none',
              whiteSpace: 'nowrap',
            }}
          >
            &gt;&gt; OPEN FULL DISCOGRAPHY TIMELINE
          </Link>
        </div>
      </div>
    </main>
  );
};
