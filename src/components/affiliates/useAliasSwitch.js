import { useState, useEffect, useRef, useCallback } from 'react';

const GLITCH_CHARS = 'X@#$%!?_▒░▓╬╪╫';
const SCRAMBLE_FRAMES = 6;
const SCRAMBLE_INTERVAL_MS = 35;
const GLITCH_MS = 320; // matches the 0.3s aliasGlitch / aliasGlitchCover keyframes

/**
 * Alias state for a collaborator who has an alt / legacy account.
 * (Data keys stay altName / altImage / altAccent / altLinks.)
 *
 * Resets whenever `person` changes (or becomes null).
 * Returns the *active* name / image / accent / links so UI code never branches
 * on "is alias" itself, plus `shownName` (scrambled mid-switch) and `isGlitching`.
 */
export const useAliasSwitch = (person) => {
  const [showingAlias, setShowingAlias] = useState(false);
  const [isGlitching, setIsGlitching] = useState(false);
  const [scrambledName, setScrambledName] = useState(null);
  const scrambleTimer = useRef(null);
  const glitchTimer = useRef(null);

  const clearGlitch = useCallback(() => {
    clearInterval(scrambleTimer.current);
    clearTimeout(glitchTimer.current);
    setIsGlitching(false);
    setScrambledName(null);
  }, []);

  useEffect(() => {
    setShowingAlias(false);
    clearGlitch();
  }, [person, clearGlitch]);

  useEffect(
    () => () => {
      clearInterval(scrambleTimer.current);
      clearTimeout(glitchTimer.current);
    },
    []
  );

  const hasAlias = Boolean(person?.altImage);
  const isAlias = hasAlias && showingAlias;

  const toggle = useCallback(() => {
    if (!hasAlias) return;
    const next = !showingAlias;
    const nextName = next ? person.altName : person.name;

    clearGlitch();
    setShowingAlias(next);

    setIsGlitching(true);
    glitchTimer.current = setTimeout(() => setIsGlitching(false), GLITCH_MS);

    let frame = 0;
    scrambleTimer.current = setInterval(() => {
      if (++frame > SCRAMBLE_FRAMES) {
        clearInterval(scrambleTimer.current);
        setScrambledName(null);
        return;
      }
      setScrambledName(
        Array.from(nextName)
          .map((ch) => (ch === ' ' ? ' ' : GLITCH_CHARS[Math.floor(Math.random() * GLITCH_CHARS.length)]))
          .join('')
      );
    }, SCRAMBLE_INTERVAL_MS);
  }, [hasAlias, showingAlias, person, clearGlitch]);

  const name = person ? (isAlias ? person.altName : person.name) : '';

  return {
    hasAlias,
    showingAlias: isAlias,
    name,
    shownName: scrambledName ?? name,
    image: person ? (isAlias ? person.altImage : person.image) : null,
    accent: person
      ? isAlias
        ? person.altAccent || person.accent || '#ff6b00'
        : person.accent || '#ff6b00'
      : '#ff6b00',
    links: person ? (isAlias ? person.altLinks || person.links : person.links) : undefined,
    isGlitching,
    toggle,
  };
};
