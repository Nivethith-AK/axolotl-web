import React, { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useTheme } from '../../context/ThemeContext';
import { TerminalLayer } from './TerminalLayer';
import { RevealPanel } from './RevealPanel';
import { DiscoMarquee } from './DiscoMarquee';
import { SOCIAL_LINKS } from '../common/SocialSidePanel';

export const Hero = ({ revealTrigger, onResetRevealTrigger }) => {
  const { t } = useLanguage();
  const { theme } = useTheme();
  const [progress, setProgress] = useState(50);
  const [loadValText, setLoadValText] = useState('0%');
  const [isRevealed, setIsRevealed] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Initial standby animation (0% -> 50%)
  useEffect(() => {
    const timer = setTimeout(() => {
      let count = 0;
      const interval = setInterval(() => {
        count++;
        setLoadValText(`${count}%`);
        if (count >= 50) {
          clearInterval(interval);
          setLoadValText('50% [STANDBY]');
        }
      }, 30);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  const toggleBigButton = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);

    if (progress === 50) {
      // Standby -> Online
      let count = 50;
      const upInterval = setInterval(() => {
        count++;
        setLoadValText(`${count}%`);
        if (count >= 100) {
          clearInterval(upInterval);
          setLoadValText('100% [ONLINE]');
        }
      }, 40);

      setProgress(100);
      setTimeout(() => {
        setIsRevealed(true);
        setIsTransitioning(false);
      }, 600);
    } else {
      // Online -> Standby
      setIsRevealed(false);
      let count = 100;
      const downInterval = setInterval(() => {
        count--;
        setLoadValText(`${count}%`);
        if (count <= 50) {
          clearInterval(downInterval);
          setLoadValText('50% [STANDBY]');
        }
      }, 30);

      setProgress(50);
      setTimeout(() => {
        setIsTransitioning(false);
      }, 600);
    }
  };

  // Allow external trigger from /MORE nav link
  useEffect(() => {
    if (revealTrigger && progress === 50) {
      toggleBigButton();
      if (onResetRevealTrigger) onResetRevealTrigger();
    }
  }, [revealTrigger]);

  const isDark = theme === 'dark';
  const valColor = progress === 100 ? '#ff6b00' : isDark ? '#e0e0e0' : undefined;

  return (
    <section className="hero" id="hero">
      <div className="hero-grid"></div>
      <TerminalLayer isRevealed={isRevealed} isTransitioning={isTransitioning} />
      <RevealPanel isOpen={isRevealed} />
      <DiscoMarquee isVisible={isRevealed} />

      <div className="hero-content d-flex flex-column justify-content-center">
        <div className="hero-big-button">
          <div className="system-loader-wrap">
            <div className="loader-label">
              <span data-i18n="hero.loader_label">{t('hero.loader_label', 'SYSTEM_LINKS:')}</span>
              <span id="load-val" style={{ color: valColor }}>
                {loadValText}
              </span>
            </div>
            <div className="loader-bar-bg">
              <div
                id="loader-fill"
                className={progress === 100 ? 'complete' : ''}
                style={{
                  width: `${progress}%`,
                  transition:
                    progress === 100
                      ? 'width 2s cubic-bezier(0.4, 0, 0.2, 1)'
                      : 'width 1.5s cubic-bezier(0.65, 0, 0.35, 1)',
                }}
              ></div>
            </div>
          </div>

          <div
            className="big-button"
            role="button"
            tabIndex={0}
            onClick={toggleBigButton}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                toggleBigButton();
              }
            }}
          >
            <img
              src="/images/assets/logo_main.webp"
              className="hero-logo"
              alt="Δxolotl"
              width="130"
              height="130"
              fetchPriority="high"
              decoding="async"
            />
            <div className="btn-hint" aria-hidden="true">
              <svg className="btn-hint-ring" viewBox="0 0 220 220" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <path
                    id="hintRingPath"
                    d="M 110,110 m -76,0 a 76,76 0 1,1 152,0 a 76,76 0 1,1 -152,0"
                  />
                </defs>
                <g className="btn-hint-ring-rotate">
                  <text className="btn-hint-ring-text btn-hint-ring-desktop">
                    <textPath href="#hintRingPath" startOffset="0%">
                      CLICK HERE
                    </textPath>
                  </text>
                  <text className="btn-hint-ring-text btn-hint-ring-desktop">
                    <textPath href="#hintRingPath" startOffset="50%">
                      CLICK HERE
                    </textPath>
                  </text>
                  <text className="btn-hint-ring-text btn-hint-ring-mobile">
                    <textPath href="#hintRingPath" startOffset="0%">
                      PRESS HERE
                    </textPath>
                  </text>
                  <text className="btn-hint-ring-text btn-hint-ring-mobile">
                    <textPath href="#hintRingPath" startOffset="50%">
                      PRESS HERE
                    </textPath>
                  </text>
                </g>
              </svg>
            </div>
          </div>
        </div>

        <div className="hero-text text-center text-md-start">
          <h1
            className="hero-title glitch-burst"
            data-text="Δxolotl"
            style={{ color: progress === 100 ? '#ff6b00' : isDark ? '#e0e0e0' : undefined }}
          >
            ΔXOLOTL
          </h1>
          <p className="hero-sub" data-i18n="hero.sub">
            {t('hero.sub', '[ACTIVE]::Composer / Musician //')}
          </p>
        </div>

        <div
          className={`mobile-icons-bar ${isRevealed ? 'icons-hidden' : ''}`}
          id="mobileIconsBar"
        >
          {SOCIAL_LINKS.map((link) => (
            <a
              key={link.label}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="side-icon-link"
              data-label={link.label}
            >
              <div className="side-icon-circle">
                <img
                  src={link.icon}
                  alt={link.alt}
                  className="side-icon"
                  width="20"
                  height="20"
                  decoding="async"
                />
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
};
