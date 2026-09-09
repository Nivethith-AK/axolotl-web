import React, { useEffect, useRef } from 'react';

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

export const TerminalLayer = ({ isRevealed, isTransitioning }) => {
  const layer1Ref = useRef(null);
  const layer2Ref = useRef(null);
  const activeRef = useRef(!isRevealed);
  const deleteAbortRef = useRef(false);

  activeRef.current = !isRevealed && !isTransitioning;

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

  useEffect(() => {
    const iv1 = setInterval(() => {
      if (!layer1Ref.current || !activeRef.current) return;
      layer1Ref.current.innerHTML = buildLayer1()
        .map((l) => `<span class="terminal-line">${l}</span>`)
        .join('');
    }, 80);

    const iv2 = setInterval(() => {
      if (!layer2Ref.current || !activeRef.current) return;
      layer2Ref.current.innerHTML = buildLayer2Lines(isMobile() ? 14 : 6);
    }, 110);

    return () => {
      clearInterval(iv1);
      clearInterval(iv2);
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
};
