import React, { createContext, useContext, useState, useEffect, useRef } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    const stored = localStorage.getItem('theme');
    if (stored) return stored;
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'light';
  });

  const [transitionState, setTransitionState] = useState({
    active: false,
    targetTheme: null,
  });

  const timerRef = useRef(null);

  useEffect(() => {
    localStorage.setItem('theme', theme);
    if (theme === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';

    // Synchronously update DOM attributes immediately for zero perceived lag
    if (nextTheme === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
      document.documentElement.classList.remove('dark');
    }

    // Update state immediately
    setTheme(nextTheme);

    // Activate transition state & CSS smoothing class without blocking rapid clicks
    document.documentElement.classList.add('theme-transitioning');
    setTransitionState({ active: true, targetTheme: nextTheme });

    // End transition after brief, smooth sweep
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      document.documentElement.classList.remove('theme-transitioning');
      setTransitionState({ active: false, targetTheme: null });
    }, 280);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, transitionState }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
