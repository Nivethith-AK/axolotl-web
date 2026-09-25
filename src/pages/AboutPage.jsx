import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { AboutGallery } from '../components/about/AboutGallery';

export const AboutPage = () => {
  const { t } = useLanguage();

  useEffect(() => {
    document.title = t('page_title.about', 'Δxolotl // About');
    if (window.lenis) {
      window.lenis.scrollTo(0, { immediate: true });
    } else {
      window.scrollTo(0, 0);
    }
  }, [t]);

  const defaultP1 = `Wello there, <strong>Δxolotl</strong> here!<br />I'm a composer, arranger, producer and multi-instrumentalist with a focus on contemporary music that bridges electronic and traditional influences across a wide range of genres.`;
  const defaultP2 = `I work across indie projects and freelance commissions, releasing original compositions, soundtracks, rearrangements and covers. My work draws heavily from Japanese anime and pop culture - though the sound rarely stays in one place for long.`;

  const skills = [
    { label: 'COMPOSITION', desc: 'Anime OSTs, Cinematic, J-Rock, EDM' },
    { label: 'ARRANGEMENT', desc: 'Full Orchestra, Rock Band, Acoustic Ensembles' },
    { label: 'PRODUCTION', desc: 'Mixing, Mastering, Vocal Tuning, Sound Design' },
    { label: 'INSTRUMENTATION', desc: 'Piano Soloist, Electric/Acoustic Guitar, Harmonica' },
  ];

  return (
    <main id="main-content" style={{ minHeight: '100vh', paddingBottom: '100px' }}>
      <div
        className="section"
        id="aboutHeader"
        style={{ minHeight: 'unset', paddingTop: '82px', paddingBottom: '32px' }}
      >
        <div className="container-lg">
          <div className="works-header-tag" data-i18n="about.header_tag">
            {t('about.header_tag', 'IDENTITY_MATRIX // BIOGRAPHY')}
          </div>
          <h2 className="glitch-burst" data-text="About" data-i18n="about.heading">
            {t('about.heading', 'About')}
          </h2>
          <div className="works-header-sub">
            Composer, Producer &amp; Multi-Instrumentalist //
          </div>
        </div>
      </div>

      <div className="container-lg">
        <div className="about-layout" style={{ marginTop: '20px' }}>
          {/* Left: text content */}
          <div className="about-text">
            <p
              data-i18n-html="about.p1"
              dangerouslySetInnerHTML={{ __html: t('about.p1', defaultP1) }}
            ></p>
            <p
              style={{ marginTop: '1.2rem' }}
              data-i18n-html="about.p2"
              dangerouslySetInnerHTML={{ __html: t('about.p2', defaultP2) }}
            ></p>

            {/* Core Capabilities Matrix */}
            <div style={{ marginTop: '36px' }}>
              <div
                style={{
                  fontFamily: "'Roboto Mono', monospace",
                  fontSize: '0.68rem',
                  letterSpacing: '2px',
                  color: 'var(--accent)',
                  fontWeight: 700,
                  marginBottom: '16px',
                }}
              >
                // CAPABILITIES_PROFILE
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
                {skills.map((s, i) => (
                  <div
                    key={i}
                    style={{
                      border: '1px solid var(--border)',
                      padding: '14px 16px',
                      background: 'var(--surface)',
                    }}
                  >
                    <div
                      style={{
                        fontFamily: "'Roboto Mono', monospace",
                        fontSize: '0.68rem',
                        fontWeight: 700,
                        letterSpacing: '1px',
                        color: 'var(--fg)',
                        marginBottom: '4px',
                      }}
                    >
                      [{s.label}]
                    </div>
                    <div
                      style={{
                        fontFamily: "'Roboto Mono', monospace",
                        fontSize: '0.58rem',
                        color: 'var(--text-6)',
                        lineHeight: '1.5',
                      }}
                    >
                      {s.desc}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div style={{ marginTop: '40px', display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
              <Link
                to="/portfolio"
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
                }}
              >
                &gt;&gt; EXPLORE PORTFOLIO
              </Link>
              <Link
                to="/connect"
                style={{
                  fontFamily: "'Roboto Mono', monospace",
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  letterSpacing: '1px',
                  padding: '10px 20px',
                  border: '1px solid var(--border)',
                  background: 'var(--surface)',
                  color: 'var(--fg)',
                  textDecoration: 'none',
                }}
              >
                &gt;&gt; GET IN TOUCH
              </Link>
            </div>
          </div>

          {/* Right: photo gallery */}
          <AboutGallery />
        </div>
      </div>
    </main>
  );
};
