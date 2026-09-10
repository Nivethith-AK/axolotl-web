import React, { useEffect, useRef } from 'react';
import { useLanguage } from '../../context/LanguageContext';

export const LangPanel = ({ isOpen, onClose }) => {
  const { lang, setLang, t, LANGS } = useLanguage();
  const panelRef = useRef(null);

  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (isOpen && panelRef.current && !panelRef.current.contains(e.target)) {
        const toggleBtn = document.getElementById('langToggle');
        if (!toggleBtn || !toggleBtn.contains(e.target)) {
          onClose();
        }
      }
    };

    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('click', handleOutsideClick);
    document.addEventListener('touchend', handleOutsideClick, { passive: true });
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('click', handleOutsideClick);
      document.removeEventListener('touchend', handleOutsideClick);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  return (
    <div
      ref={panelRef}
      className={`lang-panel ${isOpen ? 'open' : ''}`}
      id="langLinks"
      role="dialog"
      aria-modal="true"
      aria-label="Select Language"
    >
      <div className="lang-panel-label">{t('lang_panel.label', 'SELECT_LANGUAGE')}</div>
      <div className="lang-panel-divider"></div>
      {LANGS.map((l) => (
        <button
          key={l.code}
          type="button"
          className={`lang-option ${lang === l.code ? 'lang-active' : ''}`}
          data-lang-code={l.code}
          aria-label={l.label}
          onClick={() => {
            setLang(l.code);
            onClose();
          }}
        >
          <img
            src={`/images/lang/${l.code}.webp`}
            alt={l.label}
            className="lang-flag-img"
            loading="lazy"
            decoding="async"
            width="24"
            height="18"
          />
          <span className="lang-name">{l.label}</span>
          <span className="lang-code">{l.code.toUpperCase()}</span>
        </button>
      ))}
    </div>
  );
};
