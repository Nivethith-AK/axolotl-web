import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';

export const Footer = () => {
  const { t } = useLanguage();
  const [lastUpdated, setLastUpdated] = useState('BUILT BY ΔXOLOTL // LAST_UPDATED: 2026.04.05');

  useEffect(() => {
    fetch('/build-info.json')
      .then((r) => r.json())
      .then(({ built }) => {
        if (!built) return;
        const d = new Date(built);
        const formatted = d.toLocaleDateString('en-GB', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        }).toUpperCase();
        setLastUpdated(`BUILT BY ΔXOLOTL // LAST UPDATED: ${formatted}`);
      })
      .catch(() => {});
  }, []);

  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-main" data-i18n="footer.rights">
          {t('footer.rights', '©THEAXOLOTLMUSIC // ALL RIGHTS RESERVED')}
        </div>
        <div className="footer-sub" id="last-updated">
          {lastUpdated}
        </div>
      </div>
    </footer>
  );
};
