import React, { useEffect, useRef, forwardRef, useImperativeHandle } from 'react';

const CHARSET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%&*+=-_";
const LEFT_MSGS = [
  "LOCAL_ENCRYPTION_ACTIVE",
  "BUFFERING_NEURAL_SIGNAL",
  "SYNCING_LOCAL_NODE_04",
  "MAPPING_AUDIO_MATRIX",
  "SYSTEM_IDLE_LISTENING",
];

const rand = (arr) => arr[Math.floor(Math.random() * arr.length)];
const noise = (len) =>
  Array.from({ length: len }, () => rand(CHARSET.split(''))).join('');
const isMobile = () => typeof window !== 'undefined' && window.innerWidth <= 768;

export const TerminalLayer = forwardRef(({ isRevealed }, ref) => {
  const layer1Ref = useRef(null);
  const layer2Ref = useRef(null);
  const activeRef = useRef(!isRevealed);
  const deleteAbortRef = useRef(false);

  useEffect(() => {
    activeRef.current = !isRevealed;
  }, [isRevealed]);

  const buildLayer1 = () => {
    const base = [
      `[STATUS]: <span class="status-fixed">ENCRYPTING_NEURAL_LINK...</span>`,
      `FETCHING_PACKET_0${Math.floor(Math.random() * 9)}: ${noise(10)}`,
      `[DATA]: ${noise(85)}`,
      `[STATUS]: <span class="status-fixed">DECODING_WAVEFORM_DATA</span>`,
      `RECOVERY_SEQ: ${noise(110)}`,
      `[LOG]: <span class="status-fixed">ACCESSING_PORTFOLIO_PRJ_0${Math.floor(Math.random() * 6)}...</span>`,
      noise(90),
    ];
    if (!isMobile()) return base;
    return [
      ...base,
      `[STATUS]: <span class="status-fixed">BUFFERING_AUDIO_STREAM...</span>`,
      `PACKET_VERIFY_${Math.floor(Math.random() * 99)}: ${noise(75)}`,
      `[DATA]: ${noise(95)}`,
      `NODE_SYNC: <span class="status-fixed">LINK_ESTABLISHED_0${Math.floor(Math.random() * 9)}</span>`,
      noise(80),
      `[LOG]: ${noise(100)}`,
      `CHECKSUM: ${noise(60)} // 0x${Math.floor(Math.random() * 0xffffff).toString(16).toUpperCase()}`,
    ];
  };

  const buildLayer2Lines = (count) =>
    Array.from({ length: count })
      .map((_, i) => {
        const hex = Math.floor(Math.random() * 0xffffff).toString(16).toUpperCase();
        return `<div class="terminal-line"><span class="status-fixed">>> ${rand(LEFT_MSGS)}</span> // ${noise(70)} // 0x${hex} // L_NODE_0${i % 9}</div>`;
      })
      .join('');

  const deleteLayer = (layer, onDone, opts = {}) => {
    if (!layer) {
      if (onDone) onDone();
      return;
    }
    const lines = Array.from(layer.children);
    if (!lines.length) {
      layer.classList.add('terminal-hidden');
      if (onDone) onDone();
      return;
    }

    const totalFrames = opts.totalFrames ?? 4;
    const frameMs = opts.frameMs ?? 12;
    const betweenMs = opts.betweenMs ?? 8;
    const shuffled = [...lines].sort(() => Math.random() - 0.5);
    let idx = 0;

    const wipeNext = () => {
      if (deleteAbortRef.current || idx >= shuffled.length) {
        if (!deleteAbortRef.current) layer.classList.add('terminal-hidden');
        if (onDone) onDone();
        return;
      }
      const line = shuffled[idx];
      const originalLen = Math.max((line.textContent || '').length, 8);
      let frame = 0;
      const iv = setInterval(() => {
        if (deleteAbortRef.current) {
          clearInterval(iv);
          if (onDone) onDone();
          return;
        }
        if (frame < totalFrames) {
          const remaining = Math.max(
            0,
            originalLen - Math.floor(((frame + 1) / totalFrames) * originalLen)
          );
          line.textContent = noise(remaining);
          frame++;
        } else {
          clearInterval(iv);
          line.textContent = '';
          line.style.visibility = 'hidden';
          idx++;
          setTimeout(wipeNext, betweenMs);
        }
      }, frameMs);
    };
    wipeNext();
  };

  const deleteLayersPooled = (l1, l2, onDone, opts = {}) => {
    const totalFrames = opts.totalFrames ?? 4;
    const frameMs = opts.frameMs ?? 12;
    const betweenMs = opts.betweenMs ?? 8;
    const allLines = [
      ...Array.from(l1 ? l1.children : []),
      ...Array.from(l2 ? l2.children : []),
    ].sort(() => Math.random() - 0.5);
    if (!allLines.length) {
      [l1, l2].forEach((l) => {
        if (l) l.classList.add('terminal-hidden');
      });
      if (onDone) onDone();
      return;
    }
    let idx = 0;
    const wipeNext = () => {
      if (deleteAbortRef.current || idx >= allLines.length) {
        if (!deleteAbortRef.current) {
          [l1, l2].forEach((l) => {
            if (l) l.classList.add('terminal-hidden');
          });
        }
        if (onDone) onDone();
        return;
      }
      const line = allLines[idx];
      const originalLen = Math.max((line.textContent || '').length, 8);
      let frame = 0;
      const iv = setInterval(() => {
        if (deleteAbortRef.current) {
          clearInterval(iv);
          if (onDone) onDone();
          return;
        }
        if (frame < totalFrames) {
          line.textContent = noise(
            Math.max(
              0,
              originalLen - Math.floor(((frame + 1) / totalFrames) * originalLen)
            )
          );
          frame++;
        } else {
          clearInterval(iv);
          line.textContent = '';
          line.style.visibility = 'hidden';
          idx++;
          setTimeout(wipeNext, betweenMs);
        }
      }, frameMs);
    };
    wipeNext();
  };

  const materializeLayer = (layer, content, onComplete, opts = {}) => {
    if (!layer) {
      if (onComplete) onComplete();
      return;
    }
    layer.classList.remove('terminal-hidden');
    layer.innerHTML = content;
    const lines = Array.from(layer.children);
    const shuffled = [...lines].sort(() => Math.random() - 0.5);
    const totalFrames = opts.totalFrames ?? 5;
    const frameMs = opts.frameMs ?? 10;
    const betweenMs = opts.betweenMs ?? 6;
    const finalHTML = lines.map((l) => l.innerHTML);
    const finalText = lines.map((l) => l.textContent || '');
    lines.forEach((l) => {
      l.style.visibility = 'hidden';
    });

    let idx = 0;
    const growNext = () => {
      if (deleteAbortRef.current || idx >= shuffled.length) {
        lines.forEach((l, i) => {
          l.innerHTML = finalHTML[i];
          l.style.visibility = '';
        });
        if (onComplete) onComplete();
        return;
      }
      const line = shuffled[idx];
      const lineOrigIdx = lines.indexOf(line);
      const targetText = finalText[lineOrigIdx];
      const targetLen = Math.max(targetText.length, 1);
      let frame = 0;
      line.style.visibility = '';
      const iv = setInterval(() => {
        if (deleteAbortRef.current) {
          clearInterval(iv);
          if (onComplete) onComplete();
          return;
        }
        if (frame < totalFrames) {
          const revealed = Math.floor(((frame + 1) / totalFrames) * targetLen);
          line.textContent =
            noise(targetLen - revealed) + targetText.slice(0, revealed);
          frame++;
        } else {
          clearInterval(iv);
          line.innerHTML = finalHTML[lineOrigIdx];
          idx++;
          setTimeout(growNext, betweenMs);
        }
      }, frameMs);
    };
    growNext();
  };

  const materializeLayersPooled = (l1, c1, l2, c2, onDone, opts = {}) => {
    const totalFrames = opts.totalFrames ?? 5;
    const frameMs = opts.frameMs ?? 10;
    const betweenMs = opts.betweenMs ?? 6;
    [l1, l2].forEach((l, i) => {
      if (!l) return;
      l.classList.remove('terminal-hidden');
      l.innerHTML = i === 0 ? c1 : c2;
    });
    const lines1 = l1 ? Array.from(l1.children) : [];
    const lines2 = l2 ? Array.from(l2.children) : [];
    const tagged = [
      ...lines1.map((l) => ({
        line: l,
        finalHTML: l.innerHTML,
        finalText: l.textContent || '',
      })),
      ...lines2.map((l) => ({
        line: l,
        finalHTML: l.innerHTML,
        finalText: l.textContent || '',
      })),
    ].sort(() => Math.random() - 0.5);
    tagged.forEach(({ line }) => {
      line.style.visibility = 'hidden';
    });
    let idx = 0;
    const growNext = () => {
      if (deleteAbortRef.current || idx >= tagged.length) {
        tagged.forEach(({ line, finalHTML }) => {
          line.innerHTML = finalHTML;
          line.style.visibility = '';
        });
        if (onDone) onDone();
        return;
      }
      const { line, finalText, finalHTML } = tagged[idx];
      const targetLen = Math.max(finalText.length, 1);
      let frame = 0;
      line.style.visibility = '';
      const iv = setInterval(() => {
        if (deleteAbortRef.current) {
          clearInterval(iv);
          if (onDone) onDone();
          return;
        }
        if (frame < totalFrames) {
          const revealed = Math.floor(((frame + 1) / totalFrames) * targetLen);
          line.textContent =
            noise(targetLen - revealed) + finalText.slice(0, revealed);
          frame++;
        } else {
          clearInterval(iv);
          line.innerHTML = finalHTML;
          idx++;
          setTimeout(growNext, betweenMs);
        }
      }, frameMs);
    };
    growNext();
  };

  const hideTerminals = (onComplete) => {
    deleteAbortRef.current = false;
    activeRef.current = false;
    const l1 = layer1Ref.current;
    const l2 = layer2Ref.current;
    if (isMobile()) {
      deleteLayersPooled(l1, l2, onComplete, {
        totalFrames: 2,
        frameMs: 6,
        betweenMs: 2,
      });
    } else {
      let done = 0;
      const check = () => {
        if (++done === 2 && onComplete) onComplete();
      };
      deleteLayer(l1, check);
      deleteLayer(l2, check);
    }
  };

  const showTerminals = (onComplete) => {
    deleteAbortRef.current = true;
    activeRef.current = false;
    const mobile = isMobile();
    const content1 = buildLayer1()
      .map((l) => `<span class="terminal-line">${l}</span>`)
      .join('');
    const content2 = buildLayer2Lines(mobile ? 14 : 6);
    const l1 = layer1Ref.current;
    const l2 = layer2Ref.current;

    const finish = () => {
      deleteAbortRef.current = false;
      activeRef.current = true;
      if (onComplete) onComplete();
    };

    if (mobile) {
      materializeLayersPooled(
        l1,
        content1,
        l2,
        content2,
        finish,
        { totalFrames: 2, frameMs: 6, betweenMs: 2 }
      );
    } else {
      let done = 0;
      const check = () => {
        if (++done === 2) finish();
      };
      materializeLayer(l1, content1, check);
      materializeLayer(l2, content2, check);
    }
  };

  useImperativeHandle(ref, () => ({
    hideTerminals,
    showTerminals,
  }));

  useEffect(() => {
    let inViewport = true;
    let observer;

    if (layer1Ref.current && !isRevealed) {
      layer1Ref.current.innerHTML = buildLayer1()
        .map((l) => `<span class="terminal-line">${l}</span>`)
        .join('');
    }
    if (layer2Ref.current && !isRevealed) {
      layer2Ref.current.innerHTML = buildLayer2Lines(isMobile() ? 14 : 6);
    }

    if (typeof IntersectionObserver !== 'undefined' && layer1Ref.current) {
      observer = new IntersectionObserver(
        ([entry]) => {
          inViewport = entry.isIntersecting;
        },
        { threshold: 0 }
      );
      observer.observe(layer1Ref.current);
    }

    const iv1 = setInterval(() => {
      if (!layer1Ref.current || !activeRef.current || !inViewport || document.hidden) return;
      layer1Ref.current.innerHTML = buildLayer1()
        .map((l) => `<span class="terminal-line">${l}</span>`)
        .join('');
    }, 80);

    const iv2 = setInterval(() => {
      if (!layer2Ref.current || !activeRef.current || !inViewport || document.hidden) return;
      layer2Ref.current.innerHTML = buildLayer2Lines(isMobile() ? 14 : 6);
    }, 110);

    return () => {
      clearInterval(iv1);
      clearInterval(iv2);
      deleteAbortRef.current = true;
      if (observer) observer.disconnect();
    };
  }, []);

  return (
    <>
      <div
        id="hero-terminal-layer"
        ref={layer1Ref}
        className={`terminal-bg-layer ${isRevealed ? 'terminal-hidden' : ''}`}
      ></div>
      <div
        id="hero-terminal-layer-2"
        ref={layer2Ref}
        className={`terminal-bg-layer-2 ${isRevealed ? 'terminal-hidden' : ''}`}
      ></div>
    </>
  );
});

TerminalLayer.displayName = 'TerminalLayer';
