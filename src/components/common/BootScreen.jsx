import React, { useState, useEffect, useRef } from 'react';

const DEFAULT_LINES = [
  'LOADING_AUDIO_MATRIX...',
  'DECRYPTING_ARCHIVE...',
  'MOUNTING_NEURAL_LINK...',
  'VERIFYING_INTEGRITY...',
  'SYSTEM_READY',
];

const MORSE_CHARS = [
  '・一一', // W
  '・', // E
  '・一・・', // L
  '・一・・', // L
  '一一一', // O
];

export const BootScreen = ({ lines = DEFAULT_LINES, onComplete }) => {
  const [logoVisible, setLogoVisible] = useState(false);
  const [percent, setPercent] = useState(0);
  const [currentLine, setCurrentLine] = useState(lines[0]);
  const [visibleMorse, setVisibleMorse] = useState({});
  const [isComplete, setIsComplete] = useState(false);
  const [isGlitching, setIsGlitching] = useState(false);
  const [isCollapsing, setIsCollapsing] = useState(false);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    document.body.style.overflow = 'hidden';

    const logoTimer = setTimeout(() => {
      setLogoVisible(true);
    }, 320);

    const mainTimer = setTimeout(() => {
      const duration = 1900;
      const start = performance.now();
      let lineIdx = 0;

      const lineTimer = setInterval(() => {
        if (lineIdx < lines.length) {
          setCurrentLine(lines[lineIdx++]);
        } else {
          clearInterval(lineTimer);
        }
      }, duration / lines.length);

      // Morse chars delays
      MORSE_CHARS.forEach((_, i) => {
        const delay = duration * 0.1 + (i / (MORSE_CHARS.length - 1)) * (duration * 0.75);
        setTimeout(() => {
          setVisibleMorse((prev) => ({ ...prev, [i]: true }));
        }, delay);
      });

      let animId;
      const tick = (now) => {
        const t = Math.min((now - start) / duration, 1);
        const p = Math.floor(t * 100);
        setPercent(p);

        if (t < 1) {
          animId = requestAnimationFrame(tick);
        } else {
          clearInterval(lineTimer);
          setCurrentLine('SYSTEM_READY');
          setPercent(100);
          setIsComplete(true);

          setTimeout(() => {
            setIsGlitching(true);
            setTimeout(() => {
              setIsCollapsing(true);
              setTimeout(() => {
                setHidden(true);
                document.body.style.overflow = '';
                if (onComplete) onComplete();
              }, 450);
            }, 350);
          }, 600);
        }
      };

      animId = requestAnimationFrame(tick);

      return () => {
        clearInterval(lineTimer);
        cancelAnimationFrame(animId);
      };
    }, 750);

    return () => {
      clearTimeout(logoTimer);
      clearTimeout(mainTimer);
      document.body.style.overflow = '';
    };
  }, [lines, onComplete]);

  const skipBoot = () => {
    setHidden(true);
    document.body.style.overflow = '';
    if (onComplete) onComplete();
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') {
        skipBoot();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (hidden) return null;

  return (
    <div
      id="boot-screen"
      className={isCollapsing ? 'boot-collapse' : ''}
      onClick={skipBoot}
      title="Click or press Esc to skip"
    >
      <div className="boot-scanlines"></div>
      <div className={`boot-content ${isGlitching ? 'content-glitch' : ''}`} id="bootContent">
        <div className="boot-logo-wrap">
          <img
            src="/images/assets/logo_white.webp"
            id="bootLogo"
            className={`boot-logo ${logoVisible ? 'boot-logo-visible' : ''}`}
            alt="Δxolotl"
            width="180"
            height="160"
            decoding="async"
          />
        </div>
        <div className="boot-bar-track">
          <div
            className={`boot-bar-fill ${isComplete ? 'bar-complete' : ''}`}
            id="bootBarFill"
            style={{ width: `${percent}%` }}
          ></div>
        </div>
        <div className="boot-status">
          <span id="bootPercent" className={isComplete ? 'pct-complete' : ''}>
            {percent}%
          </span>
          <span id="bootLine">{currentLine}</span>
        </div>
        <div className="boot-morse" id="bootMorse">
          {MORSE_CHARS.map((char, i) => (
            <React.Fragment key={i}>
              <span className={`morse-char ${visibleMorse[i] ? 'visible' : ''}`}>{char}</span>
              {i < MORSE_CHARS.length - 1 && (
                <span className={`morse-sep ${visibleMorse[i] ? 'visible' : ''}`}>·</span>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
};
