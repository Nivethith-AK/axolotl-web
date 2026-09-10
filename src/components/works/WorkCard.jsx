import React, { useState, useRef, useEffect } from 'react';

export const WorkCard = ({ work }) => {
  const [isPlayingVideo, setIsPlayingVideo] = useState(false);
  const [isYtHovered, setIsYtHovered] = useState(false);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const [hintVerb, setHintVerb] = useState('HOVER');
  const videoRef = useRef(null);

  useEffect(() => {
    if (window.matchMedia && window.matchMedia('(pointer: coarse)').matches) {
      setHintVerb('HOLD');
    }
  }, []);

  const handleMouseEnter = () => {
    if (work.isVideo && work.videoSrc) {
      const vid = videoRef.current;
      if (vid) {
        if (!videoLoaded) {
          vid.src = work.videoSrc;
          vid.load();
          setVideoLoaded(true);
          vid.addEventListener('canplay', () => {
            setIsPlayingVideo(true);
            vid.play().catch(() => {});
          }, { once: true });
        } else {
          setIsPlayingVideo(true);
          vid.play().catch(() => {});
        }
      }
    } else if (work.isYt) {
      setIsYtHovered(true);
    }
  };

  const handleMouseLeave = () => {
    if (work.isVideo) {
      const vid = videoRef.current;
      if (vid) vid.pause();
      setIsPlayingVideo(false);
    } else if (work.isYt) {
      setIsYtHovered(false);
    }
  };

  const handleTouch = () => {
    if (work.isVideo) {
      if (isPlayingVideo) {
        handleMouseLeave();
      } else {
        handleMouseEnter();
      }
    } else if (work.isYt) {
      setIsYtHovered((prev) => !prev);
    }
  };

  return (
    <div
      className="work-card"
      id={work.id}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onTouchStart={handleTouch}
    >
      <div className="work-visual">
        <div className={`work-badge ${work.badgeClass}`}>{work.badge}</div>

        <img
          className={`work-poster ${isYtHovered ? 'yt-preview' : ''}`}
          src={work.poster}
          alt={work.title.replace('\n', ' ')}
          loading="lazy"
          decoding="async"
          width="360"
          height="202"
          style={{ opacity: isPlayingVideo ? 0 : 1 }}
          onError={(e) => {
            if (work.posterFallback) e.target.src = work.posterFallback;
          }}
        />

        {work.isVideo && (
          <video
            ref={videoRef}
            className="work-video"
            muted
            loop
            playsInline
            preload="none"
            style={{ opacity: isPlayingVideo ? 1 : 0 }}
          ></video>
        )}

        <div className="work-play-hint">
          {work.hasClip ? (
            <>
              // <span className="play-hint-verb">{hintVerb}</span> TO PREVIEW
            </>
          ) : (
            work.playHint
          )}
        </div>
      </div>

      <div className="work-info">
        <div className="work-type-tag">{work.typeTag}</div>

        {work.titleUrl ? (
          <a
            className="work-title"
            href={work.titleUrl}
            target="_blank"
            rel="noopener noreferrer"
            dangerouslySetInnerHTML={{ __html: work.title.replace('\n', '<br />') }}
          ></a>
        ) : (
          <div className="work-title" style={{ cursor: 'default' }}>
            {work.title}
          </div>
        )}

        <div className="work-sub">{work.sub}</div>
        <div className="work-roles-label">// ROLE</div>

        <div className="work-roles">
          {work.roles.map((r, i) => (
            <span key={i} className="work-role-tag">
              {r}
            </span>
          ))}
        </div>

        {work.ctaUrl ? (
          <a
            className="work-cta"
            href={work.ctaUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            {work.ctaText}
          </a>
        ) : (
          <div className="work-cta-unavail">{work.ctaText}</div>
        )}
      </div>

      <div className="work-index-num">{work.indexNum}</div>
    </div>
  );
};
