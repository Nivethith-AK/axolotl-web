import React, { useEffect, useState } from 'react';

/**
 * DxolotlVectorLogo
 * High-precision vector representation of the Δxolotl emblem.
 * Features clean vector stroke drawing (pathLength 0 -> 1)
 * and authentic cyberpunk digital glitch slice effects (zero RGB gradient bloat).
 */
export const DxolotlVectorLogo = ({
  size = 110,
  className = '',
  isComplete = false,
  isGlitching = false,
  strokeColor = '#ffffff',
}) => {
  const [animStage, setAnimStage] = useState('initial'); // 'initial' | 'drawing' | 'ready'

  useEffect(() => {
    const tDraw = setTimeout(() => {
      setAnimStage('drawing');
    }, 60);

    const tReady = setTimeout(() => {
      setAnimStage('ready');
    }, 1150);

    return () => {
      clearTimeout(tDraw);
      clearTimeout(tReady);
    };
  }, []);

  const isDrawn = animStage === 'drawing' || animStage === 'ready' || isComplete;
  const isReady = animStage === 'ready' || isComplete;

  return (
    <div
      className={`dxolotl-vector-logo-wrap ${isGlitching ? 'is-glitching' : ''} ${className}`}
      style={{
        width: size,
        height: size,
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {/* Glitch Shadow Clone 1 */}
      {isGlitching && (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 764 764"
          width={size}
          height={size}
          className="dxo-glitch-clone dxo-glitch-clone-1"
          aria-hidden="true"
        >
          <g fill="none" stroke="var(--accent, #ff6b00)" strokeLinecap="round" strokeLinejoin="round" opacity="0.85">
            <line x1="382" y1="38" x2="382" y2="726" strokeWidth="36" />
            <line x1="108" y1="382" x2="656" y2="382" strokeWidth="36" />
            <circle cx="382" cy="382" r="158" strokeWidth="38" />
            <path d="M 382 224 L 519 457 L 245 457 Z" strokeWidth="38" />
          </g>
        </svg>
      )}

      {/* Main SVG Vector Emblem */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 764 764"
        width={size}
        height={size}
        className={`dxolotl-vector-svg ${isDrawn ? 'is-drawing' : ''} ${isReady ? 'is-ready' : ''}`}
        style={{
          overflow: 'visible',
        }}
        aria-label="Δxolotl Emblem"
      >
        <g
          fill="none"
          stroke={strokeColor}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {/* Vertical Crosshair Line */}
          <line
            className="dxo-path dxo-path-vaxis"
            x1="382"
            y1="38"
            x2="382"
            y2="726"
            strokeWidth="36"
            pathLength="1"
          />

          {/* Horizontal Crosshair Line */}
          <line
            className="dxo-path dxo-path-haxis"
            x1="108"
            y1="382"
            x2="656"
            y2="382"
            strokeWidth="36"
            pathLength="1"
          />

          {/* Outer Inscribed Circle */}
          <circle
            className="dxo-path dxo-path-circle"
            cx="382"
            cy="382"
            r="158"
            strokeWidth="38"
            pathLength="1"
            transform="rotate(-90 382 382)"
          />

          {/* Delta Triangle */}
          <path
            className="dxo-path dxo-path-delta"
            d="M 382 224 L 519 457 L 245 457 Z"
            strokeWidth="38"
            pathLength="1"
          />
        </g>
      </svg>
    </div>
  );
};

export default DxolotlVectorLogo;
