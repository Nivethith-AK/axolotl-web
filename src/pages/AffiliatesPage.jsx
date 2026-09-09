import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { AFFILIATES_DATA, toSlug } from '../data/affiliatesData';
import { AffiliateCard } from '../components/affiliates/AffiliateCard';
import { AffiliateModal } from '../components/affiliates/AffiliateModal';

const TIER_ORDER = { high: 0, mid: 1, low: 2 };

const toTags = (role) =>
  (role || '').split('/').map((r) => r.trim().toLowerCase().replace(/\s+/g, '-')).filter(Boolean);

export const AffiliatesPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { t } = useLanguage();

  const [activeFilter, setActiveFilter] = useState('all');
  const [hoveredName, setHoveredName] = useState(null);
  const [selectedPerson, setSelectedPerson] = useState(null);
  const gridRef = useRef(null);
  const [columnCount, setColumnCount] = useState(5);

  useEffect(() => {
    document.title = t('page_title.affiliates', 'Δxolotl // Affiliates');
  }, [t]);

  // Sort data by tier then name
  const sortedData = [...AFFILIATES_DATA]
    .filter((d) => !d.noSignal)
    .sort((a, b) => {
      const ta = TIER_ORDER[a.tier || 'mid'];
      const tb = TIER_ORDER[b.tier || 'mid'];
      if (ta !== tb) return ta - tb;
      return a.name.localeCompare(b.name);
    });

  // Calculate dynamic tags and tag counts
  const allTagsSet = new Set();
  sortedData.forEach((p) => toTags(p.role).forEach((t) => allTagsSet.add(t)));
  const sortedTags = [...allTagsSet].sort();

  const getTagCount = (tag) => sortedData.filter((p) => toTags(p.role).includes(tag)).length;

  // Filter items
  const filteredData = sortedData.filter((person) => {
    if (activeFilter === 'all') return true;
    return toTags(person.role).includes(activeFilter);
  });

  // Grid column count detection for NO_SIGNAL padding
  useEffect(() => {
    const updateCols = () => {
      if (!gridRef.current) return;
      const cols = window
        .getComputedStyle(gridRef.current)
        .gridTemplateColumns.split(' ').length;
      setColumnCount(Math.max(1, cols));
    };
    updateCols();
    window.addEventListener('resize', updateCols);
    return () => window.removeEventListener('resize', updateCols);
  }, []);

  // Compute NO_SIGNAL padding for 'all' filter
  const padCount =
    activeFilter === 'all' && columnCount > 0
      ? (columnCount - (filteredData.length % columnCount)) % columnCount
      : 0;

  // Deep-link slug synchronization
  useEffect(() => {
    if (slug) {
      const match = sortedData.find((p) => toSlug(p.name) === slug);
      if (match) {
        setSelectedPerson(match);
      }
    } else {
      setSelectedPerson(null);
    }
  }, [slug]);

  const handleCardClick = (person) => {
    navigate(`/affiliates/${toSlug(person.name)}`);
  };

  const handleCloseModal = () => {
    navigate('/affiliates');
  };

  return (
    <main id="main-content">
      {/* ── Page Header ── */}
      <div className="section aff-page-header" id="affHeader">
        <div className="container-lg">
          <div className="aff-page-tag">COLLABORATIVE_NET // FULL_ROSTER</div>
          <h2 className="glitch-burst" data-text="Affiliates">
            Affiliates
          </h2>
          <div className="aff-page-sub">
            Collaborative network -{' '}
            <span id="affTotalCount">{sortedData.length}</span> ENTRIES &nbsp;·&nbsp; 2022 - PRESENT
          </div>
        </div>
      </div>

      {/* ── Filter Bar ── */}
      <div className="aff-filter-bar" id="affFilterBar">
        <button
          type="button"
          className={`aff-filter-btn ${activeFilter === 'all' ? 'active' : ''}`}
          onClick={() => setActiveFilter('all')}
        >
          ALL <span className="aff-filter-count">[{sortedData.length}]</span>
        </button>

        {sortedTags.map((tag) => (
          <button
            key={tag}
            type="button"
            className={`aff-filter-btn ${activeFilter === tag ? 'active' : ''}`}
            onClick={() => setActiveFilter(tag)}
          >
            {tag.replace(/-/g, ' ').toUpperCase()}{' '}
            <span className="aff-filter-count">[{getTagCount(tag)}]</span>
          </button>
        ))}
      </div>

      {/* ── Roster Grid ── */}
      <div className="aff-roster-wrap">
        <div
          className="aff-roster-grid"
          id="affGrid"
          ref={gridRef}
          onMouseLeave={() => setHoveredName(null)}
        >
          {filteredData.map((person) => {
            const isDimmed = hoveredName !== null && hoveredName !== person.name;
            const isActive = hoveredName === person.name;

            return (
              <AffiliateCard
                key={person.name}
                person={person}
                isDimmed={isDimmed}
                isActive={isActive}
                onMouseEnter={() => setHoveredName(person.name)}
                onMouseLeave={() => setHoveredName(null)}
                onClick={() => handleCardClick(person)}
              />
            );
          })}

          {/* NO_SIGNAL padding for 'all' filter */}
          {Array.from({ length: padCount }).map((_, i) => (
            <div key={`nosignal-${i}`} className="aff-panel aff-panel-nosignal">
              <div className="aff-panel-bg"></div>
              <div className="aff-nosignal-text">NO_SIGNAL</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Full-Page Dossier Modal ── */}
      {selectedPerson && (
        <AffiliateModal person={selectedPerson} onClose={handleCloseModal} />
      )}
    </main>
  );
};
