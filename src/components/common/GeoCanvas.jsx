import React, { useEffect, useRef } from 'react';
import { useTheme } from '../../context/ThemeContext';

export const GeoCanvas = () => {
  const canvasRef = useRef(null);
  const { theme } = useTheme();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let dpr = 1;

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      const W = window.innerWidth;
      const H = window.innerHeight;
      canvas.width = W * dpr;
      canvas.height = H * dpr;
      canvas.style.width = W + 'px';
      canvas.style.height = H + 'px';
      ctx.scale(dpr, dpr);
    };

    let resizeRaf = null;
    const handleResize = () => {
      if (resizeRaf) return;
      resizeRaf = requestAnimationFrame(() => {
        resizeRaf = null;
        resize();
      });
    };
    resize();
    window.addEventListener('resize', handleResize, { passive: true });

    const rand = (a, b) => a + Math.random() * (b - a);
    const randI = (a, b) => Math.floor(rand(a, b));
    const randSpeed = (min, max) =>
      (Math.random() < 0.5 ? -1 : 1) * (min + Math.random() * (max - min));

    const isMobile = window.innerWidth <= 768;
    const dotCount = isMobile ? 30 : 55;

    const dots = Array.from({ length: dotCount }, () => ({
      x: rand(0, 1),
      y: rand(0, 1),
      r: rand(1.2, 2.8),
      vx: randSpeed(0.0001, 0.00025),
      vy: randSpeed(0.0001, 0.00025),
      alpha: rand(0.2, 0.5),
    }));

    const dashedCircles = [
      { x: 0.2, y: 0.28 },
      { x: 0.78, y: 0.22 },
      { x: 0.5, y: 0.72 },
    ].map((pos) => ({
      ...pos,
      r: rand(110, 210),
      rotSpeed: randSpeed(0.0006, 0.0014),
      rot: rand(0, Math.PI * 2),
      driftX: randSpeed(0.00008, 0.00018),
      driftY: randSpeed(0.00008, 0.00018),
      dashLen: rand(8, 18),
      gapLen: rand(8, 18),
      alpha: rand(0.18, 0.32),
      pulseAmp: rand(5, 14),
      pulseSpeed: rand(0.008, 0.018),
      pulsePhase: rand(0, Math.PI * 2),
    }));

    const lines = Array.from({ length: 10 }, () => ({
      x1: rand(0, 1),
      y1: rand(0, 1),
      x2: rand(0, 1),
      y2: rand(0, 1),
      vx1: randSpeed(0.00008, 0.00018),
      vy1: randSpeed(0.00008, 0.00018),
      vx2: randSpeed(0.00008, 0.00018),
      vy2: randSpeed(0.00008, 0.00018),
      alpha: rand(0.08, 0.2),
    }));

    const tris = Array.from({ length: 12 }, () => ({
      x: rand(0.05, 0.95),
      y: rand(0.05, 0.95),
      size: rand(10, 32),
      rot: rand(0, Math.PI * 2),
      rotSpeed: randSpeed(0.003, 0.008),
      vx: randSpeed(0.0001, 0.00022),
      vy: randSpeed(0.0001, 0.00022),
      alpha: rand(0.15, 0.38),
    }));

    const squares = Array.from({ length: 6 }, () => ({
      x: rand(0.05, 0.95),
      y: rand(0.05, 0.95),
      size: rand(8, 24),
      rot: rand(0, Math.PI * 2),
      rotSpeed: randSpeed(0.002, 0.006),
      vx: randSpeed(0.00008, 0.0002),
      vy: randSpeed(0.00008, 0.0002),
      alpha: rand(0.12, 0.28),
    }));

    let glitchTarget = null;
    let glitchTimer = 0;
    let glitchTimeoutId;

    const scheduleGlitch = () => {
      glitchTimeoutId = setTimeout(() => {
        const pool = [...dashedCircles, ...tris, ...squares];
        glitchTarget = pool[randI(0, pool.length)];
        glitchTimer = randI(4, 10);
        scheduleGlitch();
      }, rand(2000, 5000));
    };
    scheduleGlitch();

    const shapeColor = () =>
      document.documentElement.getAttribute('data-theme') === 'dark' ? '#fff' : '#000';

    let frame = 0;
    let animId;
    let lastTime = performance.now();
    const speedMultiplier = reducedMotion ? 0.4 : 1.0;

    const draw = (now = performance.now()) => {
      const dt = Math.min((now - lastTime) / 16.667, 3.0) * speedMultiplier;
      lastTime = now;

      const W = window.innerWidth;
      const H = window.innerHeight;
      ctx.clearRect(0, 0, W, H);
      frame++;
      const fc = shapeColor();

      if (glitchTarget) {
        glitchTarget._glitch = true;
        if (--glitchTimer <= 0) {
          glitchTarget._glitch = false;
          glitchTarget = null;
        }
      }

      /* Dots */
      ctx.fillStyle = fc;
      dots.forEach((d) => {
        d.x += d.vx * dt;
        d.y += d.vy * dt;
        if (d.x < 0) d.x = 1;
        if (d.x > 1) d.x = 0;
        if (d.y < 0) d.y = 1;
        if (d.y > 1) d.y = 0;
        ctx.globalAlpha = d.alpha;
        ctx.beginPath();
        ctx.arc(d.x * W, d.y * H, d.r, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.globalAlpha = 1;

      /* Dashed circles */
      dashedCircles.forEach((c) => {
        c.rot += c.rotSpeed * dt;
        c.x += c.driftX * dt;
        c.y += c.driftY * dt;
        if (c.x <= 0.06 || c.x >= 0.94) c.driftX *= -1;
        if (c.y <= 0.06 || c.y >= 0.94) c.driftY *= -1;
        const pulse = c.r + Math.sin(frame * c.pulseSpeed + c.pulsePhase) * c.pulseAmp;
        ctx.save();
        ctx.globalAlpha = c._glitch ? rand(0.1, 0.55) : c.alpha;
        ctx.strokeStyle = c._glitch ? '#ff6b00' : fc;
        ctx.lineWidth = c._glitch ? 2 : 1;
        ctx.setLineDash([c.dashLen, c.gapLen]);
        ctx.lineDashOffset = -c.rot * 80;
        ctx.beginPath();
        ctx.arc(c.x * W, c.y * H, pulse, 0, Math.PI * 2);
        ctx.stroke();
        if (c._glitch) {
          ctx.globalAlpha = 0.12;
          ctx.beginPath();
          ctx.arc(c.x * W + rand(-14, 14), c.y * H + rand(-7, 7), pulse * 1.05, 0, Math.PI * 2);
          ctx.stroke();
        }
        ctx.setLineDash([]);
        ctx.restore();
      });

      /* Lines */
      if (W > 768) {
        ctx.strokeStyle = fc;
        ctx.lineWidth = 1;
        lines.forEach((l) => {
          l.x1 += l.vx1 * dt;
          l.y1 += l.vy1 * dt;
          l.x2 += l.vx2 * dt;
          l.y2 += l.vy2 * dt;
          ['x1', 'y1', 'x2', 'y2'].forEach((k) => {
            if (l[k] < 0) l[k] = 1;
            if (l[k] > 1) l[k] = 0;
          });
          ctx.globalAlpha = l.alpha;
          ctx.beginPath();
          ctx.moveTo(l.x1 * W, l.y1 * H);
          ctx.lineTo(l.x2 * W, l.y2 * H);
          ctx.stroke();
        });
        ctx.globalAlpha = 1;
      }

      /* Triangles */
      tris.forEach((t) => {
        t.rot += t.rotSpeed * dt;
        t.x += t.vx * dt;
        t.y += t.vy * dt;
        if (t.x <= 0.03 || t.x >= 0.97) t.vx *= -1;
        if (t.y <= 0.03 || t.y >= 0.97) t.vy *= -1;
        ctx.save();
        ctx.translate(t.x * W + (t._glitch ? rand(-9, 9) : 0), t.y * H);
        ctx.rotate(t.rot);
        ctx.globalAlpha = t._glitch ? rand(0.1, 0.55) : t.alpha;
        ctx.strokeStyle = t._glitch ? '#ff6b00' : fc;
        ctx.lineWidth = t._glitch ? 1.5 : 1;
        ctx.beginPath();
        ctx.moveTo(0, -t.size);
        ctx.lineTo(t.size * 0.866, t.size * 0.5);
        ctx.lineTo(-t.size * 0.866, t.size * 0.5);
        ctx.closePath();
        ctx.stroke();
        ctx.restore();
      });

      /* Squares */
      squares.forEach((s) => {
        s.rot += s.rotSpeed * dt;
        s.x += s.vx * dt;
        s.y += s.vy * dt;
        if (s.x <= 0.03 || s.x >= 0.97) s.vx *= -1;
        if (s.y <= 0.03 || s.y >= 0.97) s.vy *= -1;
        ctx.save();
        ctx.translate(s.x * W + (s._glitch ? rand(-10, 10) : 0), s.y * H);
        ctx.rotate(s.rot);
        ctx.globalAlpha = s._glitch ? rand(0.1, 0.55) : s.alpha;
        ctx.strokeStyle = s._glitch ? '#ff6b00' : fc;
        ctx.lineWidth = s._glitch ? 1.5 : 1;
        ctx.beginPath();
        ctx.rect(-s.size / 2, -s.size / 2, s.size, s.size);
        ctx.stroke();
        ctx.restore();
      });

      if (!document.hidden) {
        animId = requestAnimationFrame(draw);
      }
    };

    const handleVisibility = () => {
      if (!document.hidden) {
        lastTime = performance.now();
        cancelAnimationFrame(animId);
        animId = requestAnimationFrame(draw);
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);

    draw();

    return () => {
      if (resizeRaf) cancelAnimationFrame(resizeRaf);
      window.removeEventListener('resize', handleResize);
      document.removeEventListener('visibilitychange', handleVisibility);
      clearTimeout(glitchTimeoutId);
      cancelAnimationFrame(animId);
    };
  }, [theme]);

  return <canvas id="geoCanvas" ref={canvasRef} className="geo-canvas" aria-hidden="true"></canvas>;
};
