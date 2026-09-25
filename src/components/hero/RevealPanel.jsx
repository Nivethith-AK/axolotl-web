import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';

export const RevealPanel = ({ isOpen, onCloseComplete }) => {
  const { t } = useLanguage();
  const [panelVisible, setPanelVisible] = useState(false);
  const [nodeState, setNodeState] = useState({}); // { [index]: 'in' | 'out' | '' }
  const [mementoText, setMementoText] = useState('COMING SOON...');
  const [shopText, setShopText] = useState('SHOP');
  const [mementoTouchActive, setMementoTouchActive] = useState(false);
  const [shopTouchActive, setShopTouchActive] = useState(false);
  
  const panelRef = useRef(null);
  const hasMountedRef = useRef(false);
  const nodeTimersRef = useRef([]);
  const exitTimerRef = useRef(null);

  const mementoHoverRef = useRef(false);
  const mementoFlickerIvRef = useRef(null);
  const mementoTouchTimerRef = useRef(null);
  const mementoScrambleIvRef = useRef(null);

  const shopHoverRef = useRef(false);
  const shopFlickerIvRef = useRef(null);
  const shopTouchTimerRef = useRef(null);
  const shopScrambleIvRef = useRef(null);

  const glitchChars = 'X@#$%!?_-+=/\\|~^&*░▒▓';

  const clearNodeTimers = () => {
    nodeTimersRef.current.forEach(clearTimeout);
    nodeTimersRef.current = [];
    if (exitTimerRef.current) clearTimeout(exitTimerRef.current);
  };

  // Node enter/exit animations
  useEffect(() => {
    if (!hasMountedRef.current) {
      hasMountedRef.current = true;
      if (!isOpen) return;
    }

    clearNodeTimers();

    if (isOpen) {
      setPanelVisible(true);
      [0, 1, 2, 3, 4, 5].forEach((i) => {
        const t = setTimeout(() => {
          setNodeState((prev) => ({ ...prev, [i]: 'in' }));
        }, i * 90);
        nodeTimersRef.current.push(t);
      });
    } else {
      [5, 4, 3, 2, 1, 0].forEach((nodeIdx, i) => {
        const t = setTimeout(() => {
          setNodeState((prev) => ({ ...prev, [nodeIdx]: 'out' }));
        }, i * 60);
        nodeTimersRef.current.push(t);
      });
      exitTimerRef.current = setTimeout(() => {
        setPanelVisible(false);
        setNodeState({});
        if (onCloseComplete) onCloseComplete();
      }, 6 * 60 + 200);
    }

    return clearNodeTimers;
  }, [isOpen]);

  // Memento Mori hover scramble & recurring flicker
  const scrambleMemento = (target, onDone) => {
    clearInterval(mementoScrambleIvRef.current);
    const len = target.length;
    let frame = 0;
    const totalFrames = 10;
    mementoScrambleIvRef.current = setInterval(() => {
      if (!mementoHoverRef.current && target === 'MEMENTO MORI: A REASON TO LIVE') {
        clearInterval(mementoScrambleIvRef.current);
        return;
      }
      const revealed = Math.floor((frame / totalFrames) * len);
      const scrambled = Array.from(
        { length: len - revealed },
        () => glitchChars[Math.floor(Math.random() * glitchChars.length)]
      ).join('');
      setMementoText(target.slice(0, revealed) + scrambled);
      frame++;
      if (frame > totalFrames) {
        clearInterval(mementoScrambleIvRef.current);
        setMementoText(target);
        if (onDone) onDone();
      }
    }, 25);
  };

  const startMementoFlicker = () => {
    clearInterval(mementoFlickerIvRef.current);
    mementoFlickerIvRef.current = setInterval(() => {
      if (!mementoHoverRef.current) return;
      if (Math.random() > 0.45) {
        scrambleMemento('MEMENTO MORI: A REASON TO LIVE', () => {
          setTimeout(() => {
            if (mementoHoverRef.current) {
              scrambleMemento('COMING SOON...', null);
            }
          }, 400 + Math.random() * 600);
        });
      }
    }, 800 + Math.random() * 400);
  };

  const handleMementoEnter = () => {
    mementoHoverRef.current = true;
    startMementoFlicker();
  };

  const handleMementoLeave = () => {
    mementoHoverRef.current = false;
    clearInterval(mementoFlickerIvRef.current);
    scrambleMemento('COMING SOON...', null);
  };

  const handleMementoTouch = (e) => {
    clearTimeout(mementoTouchTimerRef.current);
    mementoHoverRef.current = true;
    setMementoTouchActive(true);
    startMementoFlicker();
    mementoTouchTimerRef.current = setTimeout(() => {
      mementoHoverRef.current = false;
      clearInterval(mementoFlickerIvRef.current);
      scrambleMemento('COMING SOON...', null);
      setMementoTouchActive(false);
    }, 2500);
  };

  // Shop hover scramble & recurring flicker
  const scrambleShop = (target, onDone) => {
    clearInterval(shopScrambleIvRef.current);
    const len = target.length;
    let frame = 0;
    const totalFrames = 10;
    shopScrambleIvRef.current = setInterval(() => {
      if (!shopHoverRef.current && target === 'TO_BE_OPENED...') {
        clearInterval(shopScrambleIvRef.current);
        return;
      }
      const revealed = Math.floor((frame / totalFrames) * len);
      const scrambled = Array.from(
        { length: len - revealed },
        () => glitchChars[Math.floor(Math.random() * glitchChars.length)]
      ).join('');
      setShopText(target.slice(0, revealed) + scrambled);
      frame++;
      if (frame > totalFrames) {
        clearInterval(shopScrambleIvRef.current);
        setShopText(target);
        if (onDone) onDone();
      }
    }, 25);
  };

  const startShopFlicker = () => {
    clearInterval(shopFlickerIvRef.current);
    shopFlickerIvRef.current = setInterval(() => {
      if (!shopHoverRef.current) return;
      scrambleShop('TO_BE_OPENED...', () => {
        setTimeout(() => {
          if (shopHoverRef.current) {
            scrambleShop('SHOP', null);
          }
        }, 450 + Math.random() * 500);
      });
    }, 900 + Math.random() * 400);
  };

  const handleShopEnter = () => {
    shopHoverRef.current = true;
    startShopFlicker();
  };

  const handleShopLeave = () => {
    shopHoverRef.current = false;
    clearInterval(shopFlickerIvRef.current);
    scrambleShop('SHOP', null);
  };

  const handleShopTouch = (e) => {
    clearTimeout(shopTouchTimerRef.current);
    shopHoverRef.current = true;
    setShopTouchActive(true);
    startShopFlicker();
    shopTouchTimerRef.current = setTimeout(() => {
      shopHoverRef.current = false;
      clearInterval(shopFlickerIvRef.current);
      scrambleShop('SHOP', null);
      setShopTouchActive(false);
    }, 2000);
  };

  useEffect(() => {
    return () => {
      clearInterval(mementoFlickerIvRef.current);
      clearInterval(mementoScrambleIvRef.current);
      clearTimeout(mementoTouchTimerRef.current);
      clearInterval(shopFlickerIvRef.current);
      clearInterval(shopScrambleIvRef.current);
      clearTimeout(shopTouchTimerRef.current);
    };
  }, []);

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
        opacity: panelVisible ? 1 : 0,
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
        className={`reveal-node active-node memento-node ${getNodeClass(4)} ${mementoTouchActive ? 'touch-active' : ''}`}
        id="mementoNode"
        onMouseEnter={handleMementoEnter}
        onMouseLeave={handleMementoLeave}
        onTouchStart={handleMementoTouch}
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
        className={`reveal-node locked-node ${getNodeClass(5)} ${shopTouchActive ? 'touch-active' : ''}`}
        id="shopNode"
        onMouseEnter={handleShopEnter}
        onMouseLeave={handleShopLeave}
        onTouchStart={handleShopTouch}
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
