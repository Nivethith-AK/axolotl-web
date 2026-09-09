import React, { useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { WORKS_DATA } from '../data/worksData';
import { WorkCard } from '../components/works/WorkCard';

export const WorksPage = () => {
  const { t } = useLanguage();

  useEffect(() => {
    document.title = t('page_title.works', 'Δxolotl // Works');
    window.scrollTo(0, 0);
  }, [t]);

  return (
    <main id="main-content">
      <div
        className="section"
        id="worksHeader"
        style={{ minHeight: 'unset', paddingTop: '82px', paddingBottom: '40px' }}
      >
        <div className="container-lg">
          <div className="works-header-tag" data-i18n="works.header_tag">
            {t('works.header_tag', 'NODE_ARCHIVE // COMMISSION_LOG')}
          </div>
          <h2 className="glitch-burst" data-text="Works" data-i18n="works.heading">
            {t('works.heading', 'Works')}
          </h2>
          <div className="works-header-sub">
            Professional credits &amp; projects - <span>{WORKS_DATA.length}</span> ENTRIES &nbsp;·&nbsp; 2023 - PRESENT
          </div>
        </div>
      </div>

      <div className="works-list">
        {WORKS_DATA.map((work) => (
          <WorkCard key={work.id} work={work} />
        ))}
      </div>
    </main>
  );
};
