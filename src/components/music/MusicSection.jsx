import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { WaveformHeader } from '../common/WaveformHeader';

export const MusicSection = () => {
  const { t } = useLanguage();
  const youtubeVideoId = 'qR_bDjRskpg';

  return (
    <section id="music" className="section">
      <div className="container-lg">
        <WaveformHeader
          title={t('music.heading', 'Latest Feed')}
          dataText="Latest Feed"
          i18nKey="music.heading"
        />

        <div className="music-grid-container row gx-4 gy-4 mt-2">
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
                allowFullScreen
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
            <div className="stacked-players">
              <div className="stacked-player-slot">
                <iframe
                  data-testid="embed-iframe"
                  style={{ borderRadius: '12px' }}
                  src="https://open.spotify.com/embed/track/1yP1cHbfA3HcMJJF9HNftF?utm_source=generator&si=be24aebb94a7418f"
                  width="100%"
                  height="352"
                  frameBorder="0"
                  allowFullScreen
                  allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                  loading="lazy"
                  title="Spotify embed"
                ></iframe>
              </div>
              <div className="stacked-player-slot">
                <iframe
                  allow="autoplay *; encrypted-media *; fullscreen *; clipboard-write"
                  frameBorder="0"
                  height="175"
                  style={{
                    width: '100%',
                    maxWidth: '660px',
                    overflow: 'hidden',
                    borderRadius: '10px',
                  }}
                  sandbox="allow-forms allow-popups allow-same-origin allow-scripts allow-storage-access-by-user-activation allow-top-navigation-by-user-activation"
                  src="https://embed.music.apple.com/us/song/death-wish/6786094702"
                  title="Apple Music embed"
                ></iframe>
              </div>
              <div className="stream-open-links">
                <a
                  href="https://open.spotify.com/artist/7MlnwvPwl6GG7oOlYqCFbe"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="stream-open-link"
                >
                  OPEN IN SPOTIFY
                </a>
                <span className="stream-open-sep">|</span>
                <a
                  href="https://music.apple.com/lk/artist/%CE%B4xolotl/1651143074"
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
      </div>
    </section>
  );
};
