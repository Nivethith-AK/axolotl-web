import React, { useState, useEffect } from 'react';

const SESSION_STATES = ['ACTIVE', 'STREAMING', 'LINK_OPEN', 'SYNC_OK', 'NODE_LIVE'];

export const TelemetryDecals = () => {
  const [clock, setClock] = useState(() => new Date().toTimeString().split(' ')[0]);
  const [sysStatus, setSysStatus] = useState('ONLINE');
  const [sessionTimer, setSessionTimer] = useState('00:00:00');
  const [sessionState, setSessionState] = useState(SESSION_STATES[0]);
  const [sysOs, setSysOs] = useState('SYS: UNKNOWN');
  const [sysHw, setSysHw] = useState('SCANNING...');

  // Clock & Session Timer
  useEffect(() => {
    const SESSION_KEY = 'session_start';
    if (!sessionStorage.getItem(SESSION_KEY)) {
      sessionStorage.setItem(SESSION_KEY, Date.now().toString());
    }
    const sessionStart = parseInt(sessionStorage.getItem(SESSION_KEY), 10);

    const updateTimers = () => {
      setClock(new Date().toTimeString().split(' ')[0]);
      const s = Math.floor((Date.now() - sessionStart) / 1000);
      const h = String(Math.floor(s / 3600)).padStart(2, '0');
      const m = String(Math.floor((s % 3600) / 60)).padStart(2, '0');
      const sec = String(s % 60).padStart(2, '0');
      setSessionTimer(`${h}:${m}:${sec}`);
    };

    updateTimers();
    const interval = setInterval(updateTimers, 1000);
    return () => clearInterval(interval);
  }, []);

  // State cycler
  useEffect(() => {
    let idx = 0;
    const interval = setInterval(() => {
      idx = (idx + 1) % SESSION_STATES.length;
      setSessionState(SESSION_STATES[idx]);
    }, 3700);
    return () => clearInterval(interval);
  }, []);

  // Battery / System status
  useEffect(() => {
    if (navigator.getBattery) {
      navigator.getBattery().then((b) => {
        const updateBattery = () => {
          setSysStatus(`${b.charging ? 'CHARGING' : 'DISCHARGING'} [${Math.floor(b.level * 100)}%]`);
        };
        updateBattery();
        b.addEventListener('chargingchange', updateBattery);
        b.addEventListener('levelchange', updateBattery);
      }).catch(() => {
        setSysStatus('ONLINE');
      });
    } else {
      setSysStatus('ONLINE');
    }
  }, []);

  // OS and HW detection
  useEffect(() => {
    const ua = navigator.userAgent;
    let os = 'SYS: UNKNOWN';
    if (/Windows NT 10|Windows 11/.test(ua)) os = 'SYS: WIN_NT';
    else if (/Windows/.test(ua)) os = 'SYS: WINDOWS';
    else if (/Mac OS X/.test(ua)) os = 'SYS: MACOS';
    else if (/Android/.test(ua)) os = 'SYS: ANDROID';
    else if (/iPhone|iPad/.test(ua)) os = 'SYS: IOS';
    else if (/Linux/.test(ua)) os = 'SYS: LINUX';
    setSysOs(os);

    const cores = navigator.hardwareConcurrency || '?';
    const mem = navigator.deviceMemory || '?';
    setSysHw(`CPU: ${cores}-CORE // MEM: ${mem}GB`);
  }, []);

  return (
    <>
      <div className="ui-decal decal-tl">
        SYSTEM_STATUS: <span id="sys-status">{sysStatus}</span> //{' '}
        <span id="clock">{clock}</span>
      </div>
      <div className="ui-decal decal-tr">
        SESSION: <span id="session-timer">{sessionTimer}</span> //{' '}
        <span id="session-state">{sessionState}</span>
      </div>
      <div className="ui-decal decal-bl">
        <span id="sys-os">{sysOs}</span> //{' '}
        <span id="sys-hw">{sysHw}</span>
      </div>
      <div className="ui-decal decal-br">&copy; 2026 THEAXOLOTLMUSIC</div>
    </>
  );
};
