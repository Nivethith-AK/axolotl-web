import React from 'react';
import { useTheme } from '../../context/ThemeContext';

export const ThemeTransitionOverlay = () => {
  const { transitionState } = useTheme();

  if (!transitionState?.active) return null;

  const isToDark = transitionState.targetTheme === 'dark';

  return (
    <div
      className={`theme-transition-overlay active ${isToDark ? 'to-dark' : 'to-light'}`}
      aria-hidden="true"
    >
      <div className="theme-transition-raster"></div>
      <div className="theme-transition-flash"></div>
      <div className="theme-transition-glitch"></div>
      <div className="theme-transition-beam"></div>
      <div className="theme-telemetry-badge">
        <span className="theme-badge-dot"></span>
        <span>
          {isToDark
            ? 'SYS_POLARITY // [DARK_MATRIX_ACTIVE]'
            : 'SYS_POLARITY // [SOLAR_MATRIX_ACTIVE]'}
        </span>
      </div>
    </div>
  );
};

export default ThemeTransitionOverlay;
