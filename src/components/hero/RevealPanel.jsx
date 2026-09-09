import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';

export const RevealPanel = ({ isOpen }) => {
  const { t } = useLanguage();
  const [nodeState, setNodeState] = useState({}); // { [index]: 'in' | 'out' | '' }
  const [mementoText, setMementoText] = useState('COMING SOON...');
  const [shopText, setShopText] = useState('SHOP');
  const panelRef = useRef(null);

  const glitchChars = 'X@#$%!?_-+=/\\|~^&*░▒▓';

  // Node enter/exit animations
  useEffect(() => {
    if (isOpen) {
      // Stagger node-in
      [0, 1, 2, 3, 4, 5].forEach((i) => {
        setTimeout(() => {
          setNodeState((prev) => ({ ...prev, [i]: 'in' }));
        }, i * 90);
      });
    } else {
      // Stagger node-out
      [5, 4, 3, 2, 1, 0].forEach((nodeIdx, i) => {
        setTimeout(() => {
          setNodeState((prev) => ({ ...prev, [nodeIdx]: 'out' }));
        }, i * 60);
      });
      const timer = setTimeout(() => {
        setNodeState({});
      }, 6 * 60 + 200);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Memento Mori hover scramble
  const scrambleMemento = (target, onDone) => {
    const len = target.length;
    let frame = 0;
    const totalFrames = 10;
    const id = setInterval(() => {
      const revealed = Math.floor((frame / totalFrames) * len);
      const scrambled = Array.from(
        { length: len - revealed },
        () => glitchChars[Math.floor(Math.random() * glitchChars.length)]
      ).join('');
      setMementoText(target.slice(0, revealed) + scrambled);
      frame++;
      if (frame > totalFrames) {
        clearInterval(id);
        setMementoText(target);
        if (onDone) onDone();
      }
    }, 25);
  };

  const handleMementoEnter = () => {
    scrambleMemento('MEMENTO MORI: A REASON TO LIVE');
  };

  const handleMementoLeave = () => {
    scrambleMemento('COMING SOON...');
  };

  // Shop hover scramble
  const scrambleShop = (target, onDone) => {
    const len = target.length;
    let frame = 0;
    const totalFrames = 10;
    const id = setInterval(() => {
      const revealed = Math.floor((frame / totalFrames) * len);
      const scrambled = Array.from(
        { length: len - revealed },
        () => glitchChars[Math.floor(Math.random() * glitchChars.length)]
      ).join('');
      setShopText(target.slice(0, revealed) + scrambled);
      frame++;
      if (frame > totalFrames) {
        clearInterval(id);
        setShopText(target);
        if (onDone) onDone();
      }
    }, 25);
  };

  const handleShopEnter = () => {
    scrambleShop('TO_BE_OPENED...');
  };

  const handleShopLeave = () => {
    scrambleShop('SHOP');
  };

  const getNodeClass = (index) => {
    const state = nodeState[index];
    if (state === 'in') return 'node-in';
    if (state === 'out') return 'node-out';
    return '';
  };

  return (
    <div
      ref={panelRef}
      className="hero-reveal-panel"
      id="heroRevealPanel"
      style={{
        opacity: isOpen ? 1 : 0,
        pointerEvents: isOpen ? 'all' : 'none',
      }}
    >
      <div className="reveal-tag" data-i18n="hero.reveal_tag">
        {t('hero.reveal_tag', 'SYS_LINK: ESTABLISHED // NODES_UNLOCKED')}
      </div>

      {/* NODE: DISCOGRAPHY */}
      <Link to="/discography" className={`reveal-node active-node ${getNodeClass(0)}`}>
        <div className="node-bracket">[</div>
        <div className="node-content">
          <div className="node-label" data-i18n="hero.node_disco_label">
            {t('hero.node_disco_label', 'DISCOGRAPHY')}
          </div>
          <div className="node-sub" data-i18n="hero.node_disco_sub">
            {t('hero.node_disco_sub', 'PRJ_ARCHIVE // AUDIO_LOG')}
          </div>
        </div>
        <div className="node-bracket">]</div>
      </Link>

      {/* NODE: WORKS */}
      <Link to="/works" className={`reveal-node active-node ${getNodeClass(1)}`}>
        <div className="node-bracket">[</div>
        <div className="node-content">
          <div className="node-label" data-i18n="hero.node_works_label">
            {t('hero.node_works_label', 'WORKS')}
          </div>
          <div className="node-sub" data-i18n="hero.node_works_sub">
            {t('hero.node_works_sub', 'SELECTED_WORKS // PORTFOLIO')}
          </div>
        </div>
        <div className="node-bracket">]</div>
      </Link>

      {/* NODE: TERMS OF SERVICE */}
      <Link to="/terms-of-service" className={`reveal-node active-node ${getNodeClass(2)}`}>
        <div className="node-bracket">[</div>
        <div className="node-content">
          <div className="node-label" data-i18n="hero.node_tos_label">
            {t('hero.node_tos_label', 'TERMS_OF_SERVICE')}
          </div>
          <div className="node-sub" data-i18n="hero.node_tos_sub">
            {t('hero.node_tos_sub', 'LEGAL // USAGE_POLICY')}
          </div>
        </div>
        <div className="node-bracket">]</div>
      </Link>

      {/* NODE: AFFILIATES */}
      <Link to="/affiliates" className={`reveal-node active-node ${getNodeClass(3)}`}>
        <div className="node-bracket">[</div>
        <div className="node-content">
          <div className="node-label">AFFILIATES</div>
          <div className="node-sub">COLLABORATIVE_NET // FULL_ROSTER</div>
        </div>
        <div className="node-bracket">]</div>
      </Link>

      {/* NODE: MEMENTO MORI */}
      <a
        href="https://theaxolotlmusic.com/memento_mori/cover.html"
        target="_blank"
        rel="noopener noreferrer"
        className={`reveal-node active-node memento-node ${getNodeClass(4)}`}
        id="mementoNode"
        onMouseEnter={handleMementoEnter}
        onMouseLeave={handleMementoLeave}
        onTouchStart={handleMementoEnter}
        onTouchEnd={handleMementoLeave}
      >
        <div className="node-bracket">[</div>
        <div className="node-content">
          <div className="node-label" id="mementoLabel">
            {mementoText}
          </div>
          <div className="node-sub">PRJ_GENESIS // init(VOCADUO_2026)</div>
        </div>
        <div className="node-bracket">]</div>
      </a>

      {/* NODE: SHOP — locked */}
      <div
        className={`reveal-node locked-node ${getNodeClass(5)}`}
        id="shopNode"
        onMouseEnter={handleShopEnter}
        onMouseLeave={handleShopLeave}
        onTouchStart={handleShopEnter}
        onTouchEnd={handleShopLeave}
      >
        <div className="node-bracket">[</div>
        <div className="node-content">
          <div className="node-label" id="shopLabel">
            {shopText}
          </div>
          <div className="node-sub" data-i18n="hero.node_shop_sub">
            {t('hero.node_shop_sub', 'MERCH // ACCESS_RESTRICTED')}
          </div>
        </div>
        <div className="node-bracket">]</div>
      </div>
    </div>
  );
};
