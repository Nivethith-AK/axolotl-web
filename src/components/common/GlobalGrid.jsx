import React, { useEffect, useRef } from 'react';

export const GlobalGrid = () => {
  const gridRef = useRef(null);

  useEffect(() => {
    let posX = 0;
    let posY = 0;
    let animId;

    const animate = () => {
      posX += 0.3;
      posY += 0.3;
      if (gridRef.current) {
        gridRef.current.style.backgroundPosition = `${posX}px ${posY}px`;
      }
      animId = requestAnimationFrame(animate);
    };

    animId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animId);
  }, []);

  return <div id="globalGrid" ref={gridRef} className="global-grid" aria-hidden="true"></div>;
};
