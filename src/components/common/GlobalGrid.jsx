import React, { useEffect, useRef } from 'react';

export const GlobalGrid = () => {
  const gridRef = useRef(null);

  useEffect(() => {
    let pos = 0;
    let animId;
    let lastTime = performance.now();

    const animate = (now = performance.now()) => {
      const dt = Math.min((now - lastTime) / 16.667, 2.5);
      lastTime = now;
      pos = (pos + 0.3 * dt) % 60;
      if (gridRef.current) {
        gridRef.current.style.backgroundPosition = `${pos}px ${pos}px`;
      }
      animId = requestAnimationFrame(animate);
    };

    const handleVisibility = () => {
      if (!document.hidden) {
        lastTime = performance.now();
        cancelAnimationFrame(animId);
        animId = requestAnimationFrame(animate);
      }
    };

    animId = requestAnimationFrame(animate);
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      cancelAnimationFrame(animId);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, []);

  return <div id="globalGrid" ref={gridRef} className="global-grid" aria-hidden="true"></div>;
};
