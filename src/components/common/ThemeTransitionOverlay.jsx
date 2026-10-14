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
      <div className="theme-transition-flash" />
      <div className="theme-transition-raster" />
      <div className="theme-transition-beam" />
      <div className="theme-center-hud">
        <div className="theme-hud-bracket theme-hud-tl" />
        <div className="theme-hud-bracket theme-hud-tr" />
        <div className="theme-hud-bracket theme-hud-bl" />
        <div className="theme-hud-bracket theme-hud-br" />
        <div className="theme-hud-title">[ SYSTEM POLARITY SHIFT ]</div>
        <div className="theme-hud-status">
          {isToDark ? 'LUNAR MATRIX // ENGAGED' : 'SOLAR MATRIX // ENGAGED'}
        </div>
      </div>
    </div>
  );
};

export default ThemeTransitionOverlay;
