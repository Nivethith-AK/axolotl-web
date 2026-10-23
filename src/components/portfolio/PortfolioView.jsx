import React, { useState, useEffect, useRef } from 'react';
import { PORTFOLIO_DATA } from '../../data/portfolioData';
import { TechButton } from '../common/TechButton';

// Body of the old /portfolio page: category filter + project grid.
// (Its header now lives in PortfolioAndWorksPage.)
export const PortfolioView = () => {
  const [activeFilter, setActiveFilter] = useState('ALL');
  const [activeVideo, setActiveVideo] = useState(null);
  const [isFiltering, setIsFiltering] = useState(false);
  const filterTimerRef = useRef(null);

  const handleFilterChange = (categoryId) => {
    if (categoryId === activeFilter || isFiltering) return;
    setIsFiltering(true);
    if (filterTimerRef.current) clearTimeout(filterTimerRef.current);
    filterTimerRef.current = setTimeout(() => {
      setActiveFilter(categoryId);
      setIsFiltering(false);
    }, 110);
  };

  useEffect(() => {
    return () => {
      if (filterTimerRef.current) clearTimeout(filterTimerRef.current);
    };
  }, []);

  const pad = (n) => String(n).padStart(2, '0');

  // Filter categories
  const categories = [
    { id: 'ALL', label: 'ALL_TRACKS', count: PORTFOLIO_DATA.length },
    {
      id: 'ORIGINAL',
      label: 'ORIGINAL_TRACKS',
      match: (item) =>
        item.dataType.includes('J-Rock') ||
        item.dataType.includes('J-Pop') ||
        item.dataType.includes('Latin') ||
        item.dataType.includes('Electronic/Dance') ||
        item.dataType.includes('Lo-Fi'),
    },
    {
      id: 'ORCHESTRAL',
      label: 'ORCHESTRAL_&_CINEMATIC',
      match: (item) => item.dataType.includes('Orchestral') || item.dataType.includes('Scoring'),
    },
    {
      id: 'PIANO',
      label: 'PIANO_&_COVERS',
      match: (item) => item.dataType.includes('Piano') || item.label.includes('Cover') || item.label.includes('medley'),
    },
  ];

  const filteredItems = PORTFOLIO_DATA.filter((item) => {
    if (activeFilter === 'ALL') return true;
    const cat = categories.find((c) => c.id === activeFilter);
    return cat?.match ? cat.match(item) : true;
  });

  return (
    <div className="container-lg">
      {/* Category Filter Bar */}
      <div
        className="portfolio-filter-bar"
        style={{
          display: 'flex',
          gap: '8px',
          flexWrap: 'wrap',
          marginTop: '0',
          paddingBottom: '16px',
          borderBottom: '1px solid var(--border-soft)',
        }}
      >
        {categories.map((cat) => {
          const count = cat.id === 'ALL'
            ? PORTFOLIO_DATA.length
            : PORTFOLIO_DATA.filter(cat.match).length;
          const isActive = activeFilter === cat.id;

          return (
            <button
              key={cat.id}
              type="button"
              className={`portfolio-filter-button${isActive ? ' is-active' : ''}`}
              onClick={() => handleFilterChange(cat.id)}
              aria-pressed={isActive}
              disabled={isFiltering}
              style={{
                fontFamily: "'Roboto Mono', monospace",
                fontSize: '0.62rem',
                fontWeight: 700,
                letterSpacing: '1.5px',
                padding: '8px 14px',
                border: `1px solid ${isActive ? 'var(--accent)' : 'var(--border-dim)'}`,
                background: isActive ? 'var(--accent)' : 'var(--surface)',
                color: isActive ? '#fff' : 'var(--fg)',
                cursor: isFiltering ? 'default' : 'pointer',
                textTransform: 'uppercase',
                transition: 'background-color 0.32s cubic-bezier(0.16, 1, 0.3, 1), color 0.32s cubic-bezier(0.16, 1, 0.3, 1), border-color 0.32s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.32s cubic-bezier(0.16, 1, 0.3, 1), transform 0.2s cubic-bezier(0.16, 1, 0.3, 1)',
              }}
            >
              // {cat.label} [{count}]
            </button>
          );
        })}
      </div>
      <div className="portfolio-filter-status" role="status" aria-live="polite">
        <span className="portfolio-filter-status-label">ACTIVE_QUERY</span>
        <strong>{categories.find((category) => category.id === activeFilter)?.label}</strong>
        <span className="portfolio-filter-status-count">{filteredItems.length} RECORDS</span>
      </div>

        <div
          key={activeFilter}
          className={`row gx-4 gy-4 portfolio-full-grid ${isFiltering ? 'is-filtering-out' : 'is-filtering-in'}`}
          style={{ marginTop: '4px' }}
        >
          {filteredItems.map((item, idx) => {
            const originalIdx = PORTFOLIO_DATA.indexOf(item);
            const isPlaying = activeVideo === item.youtubeId;

            return (
              <div
                key={item.youtubeId}
                className="col-12 col-md-6 col-lg-4 col-xl-3"
                style={{ '--stagger-idx': Math.min(idx, 15) }}
              >
                <div
                  className="portfolio-video-item portfolio-card"
                  style={{ height: '100%' }}
                >
                  {/* Top Frame Bar */}
                  <div
                    className="frame-bar top-bar"
                    title={`PRJ_${pad(originalIdx + 1)} // ${item.label}`}
                    style={{
                      background: '#000',
                      color: '#fff',
                      padding: '8px 12px',
                      fontSize: '0.64rem',
                      fontFamily: "'Roboto Mono', monospace",
                      fontWeight: 700,
                      borderBottom: '1px solid #222',
                      display: 'flex',
                      alignItems: 'center',
                      overflow: 'hidden',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    <span style={{ color: 'var(--accent)', marginRight: '6px' }}>
                      PRJ_{pad(originalIdx + 1)}
                    </span>
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      // {item.label}
                    </span>
                  </div>

                  {/* Video Thumbnail Facade / Embedded Player */}
                  <div className="mini-video-container" style={{ position: 'relative', width: '100%', paddingTop: '56.25%', background: '#000' }}>
                    {isPlaying ? (
                      <iframe
                        src={`https://www.youtube-nocookie.com/embed/${item.youtubeId}?autoplay=1&rel=0`}
                        title={item.label}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
                        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }}
                      />
                    ) : (
                      <button
                        type="button"
                        className="yt-facade"
                        onClick={() => setActiveVideo(item.youtubeId)}
                        aria-label={`Play ${item.label}`}
                        style={{
                          position: 'absolute',
                          inset: 0,
                          width: '100%',
                          height: '100%',
                          border: 'none',
                          padding: 0,
                          margin: 0,
                          cursor: 'pointer',
                          background: '#000',
                          overflow: 'hidden',
                        }}
                      >
                        <img
                          src={`https://img.youtube.com/vi/${item.youtubeId}/hqdefault.jpg`}
                          alt={item.label}
                          className="yt-facade-thumb"
                          loading="lazy"
                          decoding="async"
                          style={{
                            position: 'absolute',
                            inset: 0,
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            transition: 'transform 0.4s ease',
                          }}
                        />
                        <div
                          style={{
                            position: 'absolute',
                            inset: 0,
                            background: 'linear-gradient(to top, rgba(0,0,0,0.65) 0%, transparent 60%)',
                          }}
                        />
                        <span className="yt-facade-play">
                          <svg viewBox="0 0 24 24" style={{ width: '18px', height: '18px', fill: 'var(--accent)' }}>
                            <path d="M6 4l15 8-15 8z" />
                          </svg>
                        </span>
                      </button>
                    )}
                  </div>

                  {/* Bottom Frame Bar */}
                  <div
                    className="frame-bar bottom-bar"
                    style={{
                      background: '#000',
                      color: '#aaa',
                      padding: '8px 12px',
                      fontSize: '0.62rem',
                      fontFamily: "'Roboto Mono', monospace",
                      borderTop: '1px solid #222',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginTop: 'auto',
                    }}
                  >
                    <span>{item.dataType}</span>
                    <a
                      href={`https://www.youtube.com/watch?v=${item.youtubeId}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="Open on YouTube"
                      style={{
                        color: 'var(--accent)',
                        textDecoration: 'none',
                        fontSize: '0.6rem',
                        fontWeight: 700,
                      }}
                    >
                      [YT ↗]
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* External portfolio archive */}
        <div
          className="ext-link-row"
          style={{
            marginTop: '60px',
            paddingTop: '32px',
            borderTop: '1px solid var(--border-soft)',
          }}
        >
          <TechButton href="https://foriio.com/theaxolotlmusic" variant="secondary">
            FULL_PORTFOLIO // FORIIO_ARCHIVE
          </TechButton>
        </div>
    </div>
  );
};
