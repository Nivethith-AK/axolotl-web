import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import en from '../locales/en.json';
import ja from '../locales/ja.json';
import zh from '../locales/zh.json';
import ko from '../locales/ko.json';
import fr from '../locales/fr.json';
import es from '../locales/es.json';
import de from '../locales/de.json';
import ru from '../locales/ru.json';

const LOCALES = { en, ja, zh, ko, fr, es, de, ru };

export const LANGS = [
  { code: 'en', label: 'English' },
  { code: 'ja', label: '日本語' },
  { code: 'zh', label: '中文' },
  { code: 'ko', label: '한국어' },
  { code: 'fr', label: 'Français' },
  { code: 'es', label: 'Español' },
  { code: 'de', label: 'Deutsch' },
  { code: 'ru', label: 'Русский' },
];

const CJK_FONTS = {
  ja: {
    family: 'WDXLLubrifontJPN',
    file: '/fonts/WDXLLubrifontJPN-Regular.ttf',
  },
  zh: {
    family: 'WDXLLubrifontSC',
    file: '/fonts/WDXLLubrifontSC-Regular.ttf',
  },
  ko: {
    family: 'Gugi',
    file: '/fonts/Gugi-Regular.ttf',
  },
};

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [lang, setLangState] = useState(() => localStorage.getItem('lang') || 'en');

  const setLang = (newLang) => {
    if (LOCALES[newLang]) {
      setLangState(newLang);
      localStorage.setItem('lang', newLang);
    }
  };

  useEffect(() => {
    document.documentElement.setAttribute('lang', lang);

    // Font injection for CJK
    if (CJK_FONTS[lang]) {
      const { family, file } = CJK_FONTS[lang];
      const styleId = `font-style-${lang}`;
      if (!document.getElementById(styleId)) {
        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = `
          @font-face {
            font-family: '${family}';
            src: url('${file}') format('truetype');
            font-weight: 400;
            font-display: swap;
          }
        `;
        document.head.appendChild(style);
        if (document.fonts) {
          document.fonts.load(`400 1em '${family}'`).then(() => {
            document.documentElement.classList.add('fonts-loaded');
          }).catch(() => {});
        }
      }
    }
  }, [lang]);

  const t = useCallback((path, fallback = '') => {
    const locale = LOCALES[lang] || LOCALES.en;
    try {
      const val = path.split('.').reduce((o, k) => o[k], locale);
      if (val !== undefined && val !== null) return val;
    } catch {
      // fallback
    }
    // Fallback to English if not found
    try {
      const enVal = path.split('.').reduce((o, k) => o[k], LOCALES.en);
      if (enVal !== undefined && enVal !== null) return enVal;
    } catch {
      // fallback
    }
    return fallback;
  }, [lang]);

  return (
    <LanguageContext.Provider value={{ lang, setLang, t, LANGS }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
