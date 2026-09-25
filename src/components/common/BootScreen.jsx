import React, { useState, useEffect, useRef, useCallback } from 'react';
import { DxolotlVectorLogo } from './DxolotlVectorLogo';

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

/**
 * SplittingText - Clean character-by-character kinetic spring motion
 */
const SplittingText = React.memo(({ text }) => {
  return (
    <span className="split-text-root" key={text}>
      {text.split('').map((char, idx) => (
        <span
          key={`${char}-${idx}`}
          className="split-char"
          style={{
            animationDelay: `${idx * 0.018}s`,
          }}
        >
          {char === ' ' ? '\u00A0' : char}
        </span>
      ))}
    </span>
  );
});

export const BootScreen = React.memo(({
  lines = DEFAULT_LINES,
  onComplete,
}) => {
  const [hidden, setHidden] = useState(false);
  const [currentLine, setCurrentLine] = useState(lines[0] || 'SYSTEM_BOOT...');
  const [isComplete, setIsComplete] = useState(false);
  const [isGlitching, setIsGlitching] = useState(false);

  const screenRef = useRef(null);
  const barFillRef = useRef(null);
  const pctRef = useRef(null);
  const contentRef = useRef(null);
  const morseCharsRef = useRef([]);
  const morseSepsRef = useRef([]);

  const onCompleteRef = useRef(onComplete);
  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  const linesRef = useRef(lines);
  useEffect(() => {
    linesRef.current = lines;
  }, [lines]);

  const finishedRef = useRef(false);

  const cleanupAndFinish = useCallback(() => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    setHidden(true);
    document.body.style.overflow = '';
    if (window.lenis) window.lenis.start();
    if (onCompleteRef.current) onCompleteRef.current();
  }, []);

  const handleSkip = useCallback(() => {
    cleanupAndFinish();
  }, [cleanupAndFinish]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') {
        handleSkip();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleSkip]);

  useEffect(() => {
    // 1. Lock scrolling on body
    document.body.style.overflow = 'hidden';
    if (window.lenis) window.lenis.stop();

    const duration = 1900;
    const startDelay = 500;
    const holdDelay = 450;
    const glitchDelay = 350;
    const collapseDelay = 450;

    const timers = [];
    let lineTimer;
    let animId;

    // Trigger intermittent digital glitch spasms during loading
    const triggerGlitchPulse = (ms = 110) => {
      setIsGlitching(true);
      const t = setTimeout(() => setIsGlitching(false), ms);
      timers.push(t);
    };

    // Staggered glitch triggers during the loading phase
    timers.push(setTimeout(() => triggerGlitchPulse(140), 650));
    timers.push(setTimeout(() => triggerGlitchPulse(90), 1250));
    timers.push(setTimeout(() => triggerGlitchPulse(120), 1800));

    // 2. Progress sequence starts at +500ms
    const mainTimer = setTimeout(() => {
      const start = performance.now();
      const currentLines = linesRef.current || DEFAULT_LINES;
      let lineIdx = 0;

      // Cycle boot text lines with SplittingText motion & brief glitch jitter
      const lineInterval = Math.max(120, duration / currentLines.length);
      lineTimer = setInterval(() => {
        if (lineIdx < currentLines.length) {
          triggerGlitchPulse(80);
          setCurrentLine(currentLines[lineIdx++]);
        } else {
          clearInterval(lineTimer);
        }
      }, lineInterval);

      // Stagger morse characters and delayed separators
      MORSE_CHARS.forEach((_, i) => {
        const charDelay =
          duration * 0.12 + (i / Math.max(1, MORSE_CHARS.length - 1)) * (duration * 0.72);
        const tChar = setTimeout(() => {
          if (morseCharsRef.current[i]) {
            morseCharsRef.current[i].classList.add('visible');
          }
          if (i < MORSE_CHARS.length - 1) {
            const tSep = setTimeout(() => {
              if (morseSepsRef.current[i]) {
                morseSepsRef.current[i].classList.add('visible');
              }
            }, 80);
            timers.push(tSep);
          }
        }, charDelay);
        timers.push(tChar);
      });

      // 60fps hardware RAF tick with direct DOM updates
      const tick = (now) => {
        const elapsed = Math.max(0, now - start);
        const t = Math.min(elapsed / duration, 1);
        const p = Math.floor(t * 100);

        if (barFillRef.current) barFillRef.current.style.width = `${p}%`;
        if (pctRef.current) pctRef.current.textContent = `${p}%`;

        if (t < 1) {
          animId = requestAnimationFrame(tick);
        } else {
          clearInterval(lineTimer);
          setCurrentLine('SYSTEM_READY');
          setIsComplete(true);

          if (barFillRef.current) {
            barFillRef.current.style.width = '100%';
            barFillRef.current.classList.add('bar-complete');
          }
          if (pctRef.current) {
            pctRef.current.textContent = '100%';
            pctRef.current.classList.add('pct-complete');
          }

          // Authentic Cyberpunk CRT Glitch & Collapse Exit Sequence
          const glitchTimer = setTimeout(() => {
            if (contentRef.current) contentRef.current.classList.add('content-glitch');
            const collapseTimer = setTimeout(() => {
              if (screenRef.current) screenRef.current.classList.add('boot-collapse');
              const doneTimer = setTimeout(() => {
                cleanupAndFinish();
              }, collapseDelay);
              timers.push(doneTimer);
            }, glitchDelay);
            timers.push(collapseTimer);
          }, holdDelay);
          timers.push(glitchTimer);
        }
      };

      animId = requestAnimationFrame(tick);
    }, startDelay);
    timers.push(mainTimer);

    return () => {
      timers.forEach(clearTimeout);
      clearInterval(lineTimer);
      cancelAnimationFrame(animId);
      document.body.style.overflow = '';
      if (window.lenis) window.lenis.start();
    };
  }, [cleanupAndFinish]);

  if (hidden) return null;

  return (
    <div
      ref={screenRef}
      id="boot-screen"
      onClick={handleSkip}
      title="Click or press Esc to skip"
      style={{ cursor: 'pointer' }}
    >
      <div className="boot-scanlines"></div>
      <div ref={contentRef} className="boot-content" id="bootContent">
        <div className="boot-logo-wrap">
          <DxolotlVectorLogo
            size={110}
            isComplete={isComplete}
            isGlitching={isGlitching}
          />
        </div>
        <div className="boot-bar-track">
          <div ref={barFillRef} className="boot-bar-fill" id="bootBarFill"></div>
        </div>
        <div className="boot-status">
          <span ref={pctRef} id="bootPercent">
            0%
          </span>
          <span id="bootLine" className="boot-line-wrap">
            <SplittingText text={currentLine} />
          </span>
        </div>
        <div className="boot-morse" id="bootMorse">
          {MORSE_CHARS.map((char, i) => (
            <React.Fragment key={i}>
              <span
                ref={(el) => (morseCharsRef.current[i] = el)}
                className="morse-char"
              >
                {char}
              </span>
              {i < MORSE_CHARS.length - 1 && (
                <span
                  ref={(el) => (morseSepsRef.current[i] = el)}
                  className="morse-sep"
                >
                  ·
                </span>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
});

export default BootScreen;
