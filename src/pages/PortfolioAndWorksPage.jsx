import React, { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { PORTFOLIO_DATA } from '../data/portfolioData';
import { WORKS_DATA } from '../data/worksData';
import { TechButton } from '../components/common/TechButton';
import { PortfolioView } from '../components/portfolio/PortfolioView';
import { WorksView } from '../components/works/WorksView';

const ViewToggle = ({ view, onChange }) => (
  <div className="pw-view-toggle" role="group" aria-label="Page view">
    <TechButton
      variant={view === 'portfolio' ? 'primary' : 'secondary'}
      aria-pressed={view === 'portfolio'}
      onClick={() => onChange('portfolio')}
    >
      PORTFOLIO
    </TechButton>
    <TechButton
      variant={view === 'works' ? 'primary' : 'secondary'}
      aria-pressed={view === 'works'}
      onClick={() => onChange('works')}
    >
      WORKS
    </TechButton>
  </div>
);

export const PortfolioAndWorksPage = () => {
  const { t } = useLanguage();
  const [searchParams, setSearchParams] = useSearchParams();
  const view = searchParams.get('view') === 'works' ? 'works' : 'portfolio';
  const isWorks = view === 'works';

  const setView = (next) => {
    if (next === view) return;
    setSearchParams(next === 'works' ? { view: 'works' } : {});
  };

  // Scroll to top when arriving on the page
  useEffect(() => {
    if (window.lenis) {
      window.lenis.scrollTo(0, { immediate: true });
    } else {
      window.scrollTo(0, 0);
    }
  }, []);

  // Tab title follows the active view
  useEffect(() => {
    document.title = isWorks
      ? t('page_title.works', 'Δxolotl // Works')
      : t('page_title.portfolio', 'Δxolotl // Portfolio');
  }, [t, isWorks]);

  return (
    <main id="main-content" style={{ minHeight: '100vh', paddingBottom: '100px' }}>
      <div
        className="section"
        id="portfolioWorksHeader"
        style={{ minHeight: 'unset', paddingTop: '82px', paddingBottom: '28px' }}
      >
        <div className="container-lg">
          {isWorks ? (
            <>
              <div className="works-header-tag" data-i18n="works.header_tag">
                {t('works.header_tag', 'NODE_ARCHIVE // COMMISSION_LOG')}
              </div>
              <h2 key="works" className="glitch-burst" data-text="Works" data-i18n="works.heading">
                {t('works.heading', 'Works')}
              </h2>
            </>
          ) : (
            <>
              <div className="works-header-tag" data-i18n="portfolio.header_tag">
                {t('portfolio.header_tag', 'NODE_ARCHIVE // PORTFOLIO_FEED')}
              </div>
              <h2 key="portfolio" className="glitch-burst" data-text="Portfolio" data-i18n="portfolio.heading">
                {t('portfolio.heading', 'Portfolio')}
              </h2>
            </>
          )}

          {/* Sub-line on the left, view toggle on the same row at the right */}
          <div className="pw-sub-row">
            <div className="works-header-sub">
              {isWorks ? (
                <>
                  Professional credits &amp; projects - <span>{WORKS_DATA.length}</span> ENTRIES &nbsp;·&nbsp; 2023 -
                  PRESENT
                </>
              ) : (
                <>
                  Selected works &amp; productions by <strong>Δxolotl</strong> &nbsp;·&nbsp;{' '}
                  <span>{PORTFOLIO_DATA.length}</span> PROJECTS &nbsp;·&nbsp; AUDIO_LOG
                </>
              )}
            </div>

            <ViewToggle view={view} onChange={setView} />
          </div>
        </div>
      </div>

      <div key={view} className="pw-view">
        {isWorks ? <WorksView /> : <PortfolioView />}
      </div>
    </main>
  );
};
