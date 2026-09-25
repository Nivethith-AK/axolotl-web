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
    if (transitionState.active) return;
    const nextTheme = theme === 'dark' ? 'light' : 'dark';

    // Activate transition state & CSS smoothing class
    document.documentElement.classList.add('theme-transitioning');
    setTransitionState({ active: true, targetTheme: nextTheme });

    // Switch theme halfway through the beam sweep so the laser beam unveils the new palette
    setTimeout(() => {
      setTheme(nextTheme);
    }, 130);

    // End transition & remove helper classes
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      document.documentElement.classList.remove('theme-transitioning');
      setTransitionState({ active: false, targetTheme: null });
    }, 550);
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, transitionState }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
