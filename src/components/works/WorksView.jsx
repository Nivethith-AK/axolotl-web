import React from 'react';
import { WORKS_DATA } from '../../data/worksData';
import { WorkCard } from './WorkCard';

// Body of the old /works page (its header now lives in PortfolioAndWorksPage).
export const WorksView = () => (
  <div className="container-lg">
    <div className="works-list">
      {WORKS_DATA.map((work) => (
        <WorkCard key={work.id} work={work} />
      ))}
    </div>
  </div>
);
