import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { WaveformHeader } from '../common/WaveformHeader';
import { AboutGallery } from './AboutGallery';
import { TechButton } from '../common/TechButton';

// TODO: replace with the personal project page (internal route => use `to` on the TechButton instead of `href`)
const PERSONAL_PROJECT_URL = '#';

export const About = () => {
  const { t } = useLanguage();

  const defaultP1 = `Wello there, <strong>Δxolotl</strong> here!<br />I'm a composer, arranger, producer and multi-instrumentalist with a focus on contemporary music that bridges electronic and traditional influences across a wide range of genres.`;
  const defaultP2 = `I work across indie projects and freelance commissions, releasing original compositions, soundtracks, rearrangements and covers. My work draws heavily from Japanese anime and pop culture - though the sound rarely stays in one place for long.`;

  return (
    <section id="about" className="section">
      <div className="container-lg">
        <WaveformHeader title={t('about.heading', 'About')} dataText="About" i18nKey="about.heading" />

        <div className="about-layout">
          {/* Left: text content */}
          <div className="about-text">
            <p
              data-i18n-html="about.p1"
              dangerouslySetInnerHTML={{ __html: t('about.p1', defaultP1) }}
            ></p>
            <p
              style={{ marginTop: '1rem' }}
              data-i18n-html="about.p2"
              dangerouslySetInnerHTML={{ __html: t('about.p2', defaultP2) }}
            ></p>
            <div className="ext-link-row" style={{ marginTop: '1.4rem' }}>
              <TechButton href={PERSONAL_PROJECT_URL} variant="secondary">
                PERSONAL_PROJECT // PROJECT_PAGE
              </TechButton>
            </div>
          </div>

          {/* Right: gallery */}
          <AboutGallery />
        </div>
      </div>
    </section>
  );
};
