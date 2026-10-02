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
      <div className="theme-transition-glitch" />
      <div className="theme-transition-beam" />
      <div className="theme-telemetry-badge">
        <span className="theme-badge-dot" />
        <span>
          {isToDark
            ? 'SYS_POLARITY // [LUNAR_MATRIX_ACTIVE]'
            : 'SYS_POLARITY // [SOLAR_MATRIX_ACTIVE]'}
        </span>
      </div>
      <div className="theme-center-hud">
        <div className="theme-hud-bracket theme-hud-tl" />
        <div className="theme-hud-bracket theme-hud-tr" />
        <div className="theme-hud-bracket theme-hud-bl" />
        <div className="theme-hud-bracket theme-hud-br" />
        <div className="theme-hud-topline">
          <span className="theme-hud-dot" />
          <span className="theme-hud-title">SYSTEM_POLARITY_SHIFT</span>
          <span className="theme-hud-code">{isToDark ? '0x9F' : '0x01'}</span>
        </div>
        <div className="theme-hud-status">
          {isToDark ? 'LUNAR_MATRIX // ENGAGED' : 'SOLAR_MATRIX // ENGAGED'}
        </div>
        <div className="theme-hud-protocol">
          {isToDark ? 'PHOTONIC_SUPPRESSION // ACTIVE' : 'LUMINESCENCE_FLUX // ACTIVE'}
        </div>
      </div>
    </div>
  );
};

export default ThemeTransitionOverlay;
