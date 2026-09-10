import React, { useState, useEffect, useRef } from 'react';

const SLIDES = [
  { src: '/images/assets/logo_main.webp', alt: 'Δxolotl' },
  { src: '/images/assets/profile_image.webp', alt: 'Δxolotl' },
];

export const AboutGallery = () => {
  const total = SLIDES.length;
  const allSlots = total + 2; // cloneLast + real[0..total-1] + cloneFirst
  const [current, setCurrent] = useState(1);
  const [isAnimating, setIsAnimating] = useState(false);
  const trackRef = useRef(null);
  const startXRef = useRef(0);
  const draggingRef = useRef(false);

  const pad = (n) => String(n).padStart(2, '0');
  const realIdx = (slot) => (slot - 1 + total) % total;

  const goTo = (slot, animated = true) => {
    if (animated) setIsAnimating(true);
    if (trackRef.current) {
      trackRef.current.style.transition = animated
        ? 'transform 0.45s cubic-bezier(0.4, 0, 0.2, 1)'
        : 'none';
      trackRef.current.style.transform = `translateX(-${slot * (100 / allSlots)}%)`;
    }
    setCurrent(slot);

    if (animated) {
      setTimeout(() => {
        if (slot === 0) {
          goTo(total, false);
        } else if (slot === total + 1) {
          goTo(1, false);
        }
        setIsAnimating(false);
      }, 460);
    }
  };

  useEffect(() => {
    goTo(1, false);
  }, []);

  const handlePrev = () => {
    if (!isAnimating) goTo(current - 1);
  };

  const handleNext = () => {
    if (!isAnimating) goTo(current + 1);
  };

  // Touch & Drag handlers
  const handleTouchStart = (e) => {
    startXRef.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e) => {
    const dx = e.changedTouches[0].clientX - startXRef.current;
    if (!isAnimating && Math.abs(dx) > 40) {
      goTo(current + (dx < 0 ? 1 : -1));
    }
  };

  const handleMouseDown = (e) => {
    draggingRef.current = true;
    startXRef.current = e.clientX;
  };

  const handleMouseUp = (e) => {
    if (!draggingRef.current) return;
    draggingRef.current = false;
    const dx = e.clientX - startXRef.current;
    if (!isAnimating && Math.abs(dx) > 40) {
      goTo(current + (dx < 0 ? 1 : -1));
    }
  };

  const ri = realIdx(current);

  return (
    <div
      className="about-gallery"
      id="aboutGallery"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
    >
      <div className="ag-viewport">
        <div
          className="ag-track"
          id="agTrack"
          ref={trackRef}
          style={{ width: `${allSlots * 100}%` }}
        >
          {/* cloneLast */}
          <div
            className="ag-slide"
            aria-hidden="true"
            style={{ width: `${100 / allSlots}%`, minWidth: `${100 / allSlots}%` }}
          >
            <img src={SLIDES[total - 1].src} alt="" loading="lazy" decoding="async" width="300" height="300" />
          </div>

          {/* real slides */}
          {SLIDES.map((slide, i) => (
            <div
              key={i}
              className="ag-slide"
              style={{ width: `${100 / allSlots}%`, minWidth: `${100 / allSlots}%` }}
            >
              <img src={slide.src} alt={slide.alt} loading="lazy" decoding="async" width="300" height="300" />
            </div>
          ))}

          {/* cloneFirst */}
          <div
            className="ag-slide"
            aria-hidden="true"
            style={{ width: `${100 / allSlots}%`, minWidth: `${100 / allSlots}%` }}
          >
            <img src={SLIDES[0].src} alt="" loading="lazy" decoding="async" width="300" height="300" />
          </div>
        </div>
      </div>

      <div className="ag-dots" id="agDots">
        <button
          type="button"
          className="ag-arrow ag-prev"
          id="agPrev"
          aria-label="Previous"
          onClick={handlePrev}
        >
          &#8592;
        </button>
        {Array.from({ length: total }, (_, i) => (
          <div
            key={i}
            className={`ag-dot ${i === ri ? 'active' : ''}`}
            onClick={() => {
              if (!isAnimating) goTo(i + 1);
            }}
          ></div>
        ))}
        <button
          type="button"
          className="ag-arrow ag-next"
          id="agNext"
          aria-label="Next"
          onClick={handleNext}
        >
          &#8594;
        </button>
      </div>

      <div className="ag-counter" id="agCounter">
        {pad(ri + 1)} / {pad(total)}
      </div>
    </div>
  );
};
