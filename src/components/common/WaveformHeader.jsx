import React, { useState, useEffect, useRef } from 'react';

export const WaveformHeader = ({ title, dataText, i18nKey }) => {
  const [percent, setPercent] = useState(0);
  const wrapRef = useRef(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasAnimated.current) {
            hasAnimated.current = true;
            const sec = el.closest('.section');
            if (sec) {
              sec.classList.add('is-visible');
              sec.style.opacity = '1';
              sec.style.transform = 'translateY(0)';
            }
            const startTime = performance.now();
            const animate = (now) => {
              const progress = Math.min((now - startTime) / 1000, 1);
              setPercent(Math.floor(progress * 100));
              if (progress < 1) requestAnimationFrame(animate);
            };
            requestAnimationFrame(animate);
          }
        });
      },
      { threshold: 0.15 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={wrapRef}>
      <div className="waveform-wrap d-flex align-items-center mb-3">
        <div className="progress-container">
          <div className="progress-loader"></div>
        </div>
        <span className="percentage">{percent}%</span>
      </div>
      <h2
        className="glitch-burst"
        data-text={dataText || title}
        data-i18n={i18nKey}
      >
        {title}
      </h2>
    </div>
  );
};
