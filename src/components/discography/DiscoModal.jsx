import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AFFILIATES_DATA, toSlug as toAffiliateSlug } from '../../data/affiliatesData';

export const DiscoModal = ({ track, onClose }) => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!track) return null;

  const isFeatured = track.type === 'featured';
  const accentColor = isFeatured ? '#00dde9' : '#ff6b00';

  const linkLabel = (url) => {
    if (!url) return '';
    if (url.includes('youtube') || url.includes('youtu.be')) return 'OPEN ON YOUTUBE';
    return 'OPEN ON WEBSITE';
  };

  const abbrevRole = (role) => {
    if (!role) return '';
    return role
      .replace(/Vocals?/gi, 'Voc')
      .replace(/Illustration/gi, 'Illust')
      .replace(/Music Video|\bMV\b/gi, 'MV')
      .replace(/Mix\s*\/\s*Master/gi, 'Mix/Mst')
      .replace(/Music Producer/gi, 'Prod')
      .replace(/Vocal Tuning/gi, 'Tuning')
      .replace(/Vocal Mix/gi, 'Voc.Mix')
      .replace(/Tune/gi, 'Tune')
      .replace(/Lyrics?/gi, 'Lyr')
      .replace(/Producer/gi, 'Prod')
      .replace(/Arranger/gi, 'Arr')
      .replace(/Composer/gi, 'Comp')
      .replace(/Sound Design/gi, 'SFX')
      .replace(/Animation/gi, 'Anim')
      .replace(/Video/gi, 'Vid')
      .replace(/\s*,\s*/g, '/');
  };

  // Matched affiliate chips
  const affiliateCollabs = (track.collabs || []).filter((c) =>
    AFFILIATES_DATA.some((a) => a.name.toLowerCase() === c.name.toLowerCase())
  );

  const rawFeat = Array.isArray(track.feat) ? track.feat.join(' · ') : track.feat || '';

  return (
    <div
      className="disco-modal-backdrop is-open"
      id="discoModalBackdrop"
      role="dialog"
      aria-modal="true"
      onClick={(e) => {
        if (e.target.id === 'discoModalBackdrop') onClose();
      }}
    >
      <div className="disco-modal" id="discoModal">
        <div className="disco-modal-hdr">
          <span className="disco-modal-subline">
            NODE_ARCHIVE // AUDIO_LOG:{' '}
            <span className="disco-modal-accessing">{track.title}</span>
          </span>
          <button
            type="button"
            className="disco-modal-close"
            id="discoModalClose"
            onClick={onClose}
          >
            [×]
          </button>
        </div>

        <div
          className="disco-modal-photo-col"
          id="discoModalPhotoCol"
          title={track.url ? 'Click to open' : ''}
          onClick={() => {
            if (track.url) window.open(track.url, '_blank', 'noopener,noreferrer');
          }}
        >
          <div className="disco-modal-photo-inner">
            <img
              src={track.cover}
              className="disco-modal-photo"
              alt={track.title}
              onError={(e) => {
                e.target.parentElement.innerHTML =
                  '<div class="disco-modal-photo-placeholder">NO_COVER_DATA</div>';
              }}
            />
          </div>
        </div>

        <div className="disco-modal-info-col">
          <div className="disco-modal-name" style={{ color: accentColor }}>
            {track.title}
          </div>
          <div className="disco-modal-role">
            {track.tag} &nbsp;·&nbsp; {track.year}
          </div>
          <div className="disco-modal-divider"></div>

          <div className="disco-modal-section">
            <div className="disco-modal-notes">{track.notes}</div>
          </div>

          {/* Roles */}
          {track.roles?.length > 0 && (
            <div className="disco-modal-section">
              <div className="disco-modal-section-label">// ROLE</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                {track.roles.map((r, i) => (
                  <span
                    key={i}
                    style={{
                      fontFamily: "'Roboto Mono', monospace",
                      fontSize: '0.5rem',
                      letterSpacing: '1px',
                      padding: '2px 8px',
                      border: `1px solid ${accentColor}`,
                      color: accentColor,
                      textTransform: 'uppercase',
                    }}
                  >
                    {r}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Collaborator chips */}
          {track.type === 'release' && affiliateCollabs.length > 0 && (
            <div className="disco-modal-section">
              <div className="disco-modal-section-label">// COLLABORATORS</div>
              <div className="disco-collabs">
                {affiliateCollabs.map((c, i) => {
                  const aff = AFFILIATES_DATA.find(
                    (a) => a.name.toLowerCase() === c.name.toLowerCase()
                  );
                  const img = aff?.image ? `/images/${aff.image}` : null;
                  const chipAccent = aff?.accent || '#ff6b00';
                  const slug = toAffiliateSlug(c.name);

                  return (
                    <button
                      key={i}
                      type="button"
                      className="disco-collab-chip"
                      style={{ '--chip-accent': chipAccent }}
                      title={`${c.name} — ${c.role}`}
                      onClick={() => {
                        navigate(`/affiliates/${slug}`);
                      }}
                    >
                      {img ? (
                        <img
                          className="disco-collab-avatar"
                          src={img}
                          alt={c.name}
                          onError={(e) => {
                            e.target.style.display = 'none';
                            if (e.target.nextElementSibling) {
                              e.target.nextElementSibling.style.display = 'flex';
                            }
                          }}
                        />
                      ) : null}
                      <div
                        className="disco-collab-avatar-placeholder"
                        style={{
                          display: img ? 'none' : 'flex',
                          borderColor: chipAccent,
                        }}
                      >
                        {c.name.charAt(0)}
                      </div>
                      <span className="disco-collab-name">{c.name}</span>
                      <span className="disco-collab-role">{abbrevRole(c.role)}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Feat credits */}
          {rawFeat && (
            <div className="disco-modal-section">
              <div className="disco-modal-section-label">// FEAT.</div>
              <div
                style={{
                  fontFamily: "'Roboto Mono', monospace",
                  fontSize: '0.52rem',
                  color: 'var(--c-text-dim)',
                  lineHeight: '1.8',
                }}
              >
                {rawFeat}
              </div>
            </div>
          )}

          {/* Tracklist / Series */}
          {track.series?.length > 0 && (
            <div className="disco-modal-section">
              <div className="disco-modal-section-label">// TRACKLIST</div>
              {track.series.map((s, i) => (
                <div
                  key={i}
                  style={{
                    fontFamily: "'Roboto Mono', monospace",
                    fontSize: '0.5rem',
                    color: 'var(--c-text-subtle)',
                    padding: '3px 0',
                    borderBottom: '1px solid var(--c-border-subtle)',
                  }}
                >
                  {s}
                </div>
              ))}
            </div>
          )}

          {/* External Link */}
          {track.url ? (
            <div className="disco-modal-section">
              <a
                href={track.url}
                target="_blank"
                rel="noopener noreferrer"
                className="disco-modal-project"
              >
                <div className="disco-modal-project-title">&gt;&gt; {linkLabel(track.url)}</div>
                <div className="disco-modal-project-role">{track.url}</div>
              </a>
            </div>
          ) : (
            <div
              style={{
                fontFamily: "'Roboto Mono', monospace",
                fontSize: '0.5rem',
                color: 'var(--c-text-faint)',
                letterSpacing: '1px',
                marginTop: '8px',
              }}
            >
              // NO EXTERNAL LINK AVAILABLE
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
