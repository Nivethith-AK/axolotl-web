import { useState, useEffect, useRef } from 'react';

/**
 * Auto-flips between main and alias every ~2-2.5s with a short glitch beat.
 * Used by roster cards (one timer per card) and by the index marquee (one shared
 * timer so the duplicated cards stay in sync).
 *
 * @param enabled  start/stop the cycle (e.g. only for people who have an alias)
 * @param paused   skip flips while true (e.g. card is dimmed by a hover elsewhere)
 * @param baseMs   minimum time between flips
 * @param jitterMs random extra time added to each wait
 * @param glitchMs how long the glitch runs; the image/name swaps at the halfway point.
 *                 Keep in sync with the 0.6s `.aff-panel.alias-glitch` animation in style.css.
 */
export const useAliasCycle = ({
  enabled = true,
  paused = false,
  baseMs = 2000,
  jitterMs = 500,
  glitchMs = 600,
} = {}) => {
  const [showingAlias, setShowingAlias] = useState(false);
  const [isGlitching, setIsGlitching] = useState(false);
  const pausedRef = useRef(paused);
  pausedRef.current = paused;

  useEffect(() => {
    if (!enabled) return undefined;
    let timer;
    let swapTimer;
    let endTimer;

    const schedule = () => {
      timer = setTimeout(() => {
        if (pausedRef.current) {
          schedule();
          return;
        }
        setIsGlitching(true);
        // swap mid-glitch so the change is hidden inside the effect
        swapTimer = setTimeout(() => setShowingAlias((prev) => !prev), glitchMs / 2);
        endTimer = setTimeout(() => {
          setIsGlitching(false);
          schedule();
        }, glitchMs);
      }, baseMs + Math.random() * jitterMs);
    };

    schedule();
    return () => {
      clearTimeout(timer);
      clearTimeout(swapTimer);
      clearTimeout(endTimer);
    };
  }, [enabled, baseMs, jitterMs, glitchMs]);

  return { showingAlias: enabled && showingAlias, isGlitching: enabled && isGlitching };
};
