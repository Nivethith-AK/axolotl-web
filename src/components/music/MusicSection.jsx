import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { WaveformHeader } from '../common/WaveformHeader';
import { TechButton } from '../common/TechButton';

export const MusicSection = ({ hideHeader = false }) => {
  const { t } = useLanguage();
  const youtubeVideoId = 'qR_bDjRskpg';

  return (
    <section
  id="music"
  className="section"
  style={hideHeader ? { paddingTop: '8px', minHeight: 'unset' } : undefined}
>
  <div className="container-lg">
    {!hideHeader && (
      <WaveformHeader
        title={t('music.heading', 'Latest Feed')}
        dataText="Latest Feed"
        i18nKey="music.heading"
      />
    )}

    <div className={`music-grid-container row gx-4 gy-4 ${hideHeader ? 'mt-0' : 'mt-2'}`}>
      {/* Video Column */}
      <div className="video-column col-12 col-lg-6">
        <div className="frame-bar top-bar">
          <span className="pulse">●</span> REC // YOUTUBE_FEED
        </div>
        <div className="video-container">
          <iframe
            id="main-video"
            width="100%"
            height="352"
            src={`https://www.youtube.com/embed/${youtubeVideoId}`}
            title="YouTube video player"
            frameBorder="0"
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            loading="lazy"
          ></iframe>
        </div>
        <div className="frame-bar bottom-bar">
          STREAM_ID: <span id="dynamic-stream-id">{youtubeVideoId.toUpperCase()}</span>
        </div>
      </div>

      {/* Stream Column */}
      <div className="stream-column col-12 col-lg-6">
        <div className="frame-bar top-bar">
          STREAMING_FEED // SPOTIFY &amp; APPLE MUSIC
        </div>
        <div 
          className="stacked-players" 
          style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            justifyContent: 'space-between', 
            height: '352px' 
          }}
        >
          {/* Spotify Compact Slot */}
          <div className="stacked-player-slot" style={{ width: '100%' }}>
            <iframe
              data-testid="embed-iframe"
              style={{ borderRadius: '12px', width: '100%', display: 'block' }}
              src="https://open.spotify.com/embed/track/1yP1cHbfA3HcMJJF9HNftF?utm_source=generator&si=a3058b6294a04204"
              height="80"
              frameBorder="0"
              allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
              loading="lazy"
              title="Spotify embed"
            ></iframe>
          </div>

          {/* Apple Music Compact Slot */}
          <div className="stacked-player-slot" style={{ width: '100%' }}>
            <iframe
              allow="autoplay *; encrypted-media *; fullscreen *; clipboard-write"
              frameBorder="0"
              height="175"
              style={{
                width: '100%',
                overflow: 'hidden',
                borderRadius: '12px',
                display: 'block'
              }}
              sandbox="allow-forms allow-popups allow-same-origin allow-scripts allow-storage-access-by-user-activation allow-top-navigation-by-user-activation"
              src="https://embed.music.apple.com/us/song/death-wish/6786094702"
              title="Apple Music embed"
            ></iframe>
          </div>

          {/* Links Row */}
          <div className="stream-open-links" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <a
              href="https://spotify.com"
              target="_blank"
              rel="noopener noreferrer"
              className="stream-open-link"
            >
              OPEN IN SPOTIFY
            </a>
            <span className="stream-open-sep">|</span>
            <a
              href="https://apple.com"
              target="_blank"
              rel="noopener noreferrer"
              className="stream-open-link"
            >
              OPEN IN APPLE MUSIC
            </a>
          </div>
        </div>
        <div className="frame-bar bottom-bar">ISRC: LK-AAA-24-00001</div>
      </div>
    </div>

    <div className="ext-link-row mt-4">
      <TechButton to="/discography" variant="secondary">
        FULL_DISCOGRAPHY // DISCOGRAPHY_PAGE
      </TechButton>
    </div>
  </div>
</section>
  );
};
