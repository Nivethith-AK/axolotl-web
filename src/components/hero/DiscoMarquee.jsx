import React, { useState, useEffect, useRef } from 'react';
import { DISCO_DATA } from '../../data/discographyData';

export const DiscoMarquee = ({ isVisible }) => {
  const [releases, setReleases] = useState([]);
  const trackRef = useRef(null);
  const animRef = useRef(null);
  const stateRef = useRef({
    hw: 0,
    position: 0,
    velocity: 0,
    isDragging: false,
    dragLastX: 0,
    hasDragged: false,
    hovered: false,
  });

  useEffect(() => {
    const seenCovers = new Set();
    const filtered = DISCO_DATA.filter((d) => d.type === 'release').filter((d) => {
      if (seenCovers.has(d.cover)) return false;
      seenCovers.add(d.cover);
      return true;
    });
    setReleases(filtered);
  }, []);

  useEffect(() => {
    const track = trackRef.current;
    if (!track || !releases.length) return;

    const SPEED = 0.45;
    const s = stateRef.current;

    const tick = () => {
      if (!s.hw && track.scrollWidth > 0) {
        s.hw = track.scrollWidth / 2;
      }
      if (!s.isDragging && !s.hovered) {
        s.position += SPEED;
      }
      if (!s.isDragging && s.velocity !== 0) {
        s.position += s.velocity;
        s.velocity *= 0.92;
        if (Math.abs(s.velocity) < 0.05) s.velocity = 0;
      }
      if (s.hw) {
        const wrapped = ((s.position % s.hw) + s.hw) % s.hw;
        track.style.transform = `translateX(${-wrapped}px)`;
      }
      animRef.current = requestAnimationFrame(tick);
    };

    animRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(animRef.current);
  }, [releases]);

  const handlePointerDown = (e) => {
    if (e.pointerType === 'touch') return;
    const s = stateRef.current;
    s.isDragging = true;
    s.hasDragged = false;
    s.dragLastX = e.clientX;
    s.velocity = 0;
  };

  const handlePointerMove = (e) => {
    const s = stateRef.current;
    if (!s.isDragging || e.pointerType === 'touch') return;
    const dx = e.clientX - s.dragLastX;
    if (Math.abs(dx) > 6) s.hasDragged = true;
    s.position -= dx;
    s.velocity = -dx * 0.4;
    s.dragLastX = e.clientX;
  };

  const handlePointerUp = (e) => {
    if (e.pointerType === 'touch') return;
    stateRef.current.isDragging = false;
  };

  const handleWheel = (e) => {
    e.preventDefault();
    stateRef.current.position += e.deltaY * 0.9;
    stateRef.current.velocity = 0;
  };

  const renderPanel = (d, key, hidden = false) => (
    <a
      key={key}
      href={d.url || '/discography'}
      target="_blank"
      rel="noopener noreferrer"
      className="disco-marquee-panel"
      aria-hidden={hidden}
      tabIndex={hidden ? -1 : undefined}
      aria-label={hidden ? undefined : d.title}
      onClick={(e) => {
        if (stateRef.current.hasDragged) e.preventDefault();
      }}
    >
      <div className="disco-marquee-bg"></div>
      <img
        src={d.cover}
        className="disco-marquee-cover"
        alt={d.title}
        loading="lazy"
        onError={(e) => {
          e.target.style.display = 'none';
        }}
      />
      <div className="disco-marquee-overlay"></div>
      <div className="disco-marquee-accent"></div>
      <div className="disco-marquee-title">{d.title}</div>
    </a>
  );

  return (
    <div className={`disco-marquee-wrap ${isVisible ? 'is-visible' : ''}`} id="discoMarqueeWrap">
      <div className="disco-marquee-tag" id="discoMarqueeTag">
        DISCOGRAPHY_FEED // {releases.length} RELEASES_INDEXED
      </div>
      <div
        className="disco-marquee-row"
        onMouseEnter={() => {
          stateRef.current.hovered = true;
        }}
        onMouseLeave={() => {
          stateRef.current.hovered = false;
        }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        onWheel={handleWheel}
      >
        <div className="disco-marquee-track" ref={trackRef}>
          {releases.map((d, i) => renderPanel(d, `orig-${i}`, false))}
          {releases.map((d, i) => renderPanel(d, `dup-${i}`, true))}
        </div>
      </div>
    </div>
  );
};
