"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import gsap from "gsap";

export interface SparkleCursorProps {
  /** Distance in pixels between sparkles */
  distance?: number;
  /** Whether to show a glow behind the cursor */
  glow?: boolean;
}

export const SparkleCursor = ({ distance = 50, glow = true }: SparkleCursorProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Handle high-DPI scaling with correct setTransform to prevent mouse displacement
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const width = window.innerWidth;
      const height = window.innerHeight;

      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      // Scale context so drawing units are 1:1 with screen CSS pixels
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resize();
    window.addEventListener("resize", resize);

    // SVG Star
    const svgData = `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="hsl(40 90% 80%)">
        <path fill-rule="evenodd" d="M10.868 2.884c-.321-.772-1.415-.772-1.736 0l-1.83 4.401-4.753.381c-.833.067-1.171 1.107-.536 1.651l3.62 3.102-1.106 4.637c-.194.813.691 1.456 1.405 1.02L10 15.591l4.069 2.485c.713.436 1.598-.207 1.404-1.02l-1.106-4.637 3.62-3.102c.635-.544.297-1.584-.536-1.65l-4.752-.382-1.831-4.401Z" clip-rule="evenodd" />
      </svg>
    `;
    const img = new Image();
    const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(svgBlob);

    let isImageLoaded = false;
    img.onload = () => {
      isImageLoaded = true;
      URL.revokeObjectURL(url);
    };
    img.src = url;

    let parts: any[] = [];
    let glows: any[] = [];

    const render = () => {
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

      for (const g of glows) {
        ctx.beginPath();
        ctx.arc(g.x, g.y, Math.max(0, g.size * g.scale), 0, Math.PI * 2);
        ctx.fillStyle = "hsl(265 90% 80% / 0.25)";
        ctx.fill();
      }

      for (const part of parts) {
        if (!isImageLoaded) continue;
        ctx.save();
        ctx.globalAlpha = Math.max(0, Math.min(1, part.alpha));
        ctx.filter = `brightness(${part.sy < 0 ? part.b + 0.5 : part.b})`;

        // Standard CSS coordinates directly match cursor (0 offset)
        ctx.translate(part.x, part.y);
        ctx.rotate(part.r * (Math.PI / 180));
        ctx.scale(1, part.sy);

        const size = Math.max(0, part.size * part.scale);
        ctx.drawImage(img, size * -0.5, size * -0.5, size, size);
        ctx.restore();
      }
    };

    let distCounter = 0;
    let lastPoint: [number, number] | null = null;

    const paint = (e: PointerEvent | MouseEvent) => {
      const x = e.clientX;
      const y = e.clientY;

      if (lastPoint) {
        const dist = Math.hypot(x - lastPoint[0], y - lastPoint[1]);
        if (!Number.isNaN(dist)) distCounter += dist;
      }
      lastPoint = [x, y];

      if (glow) {
        const g = {
          id: `glow--${Date.now()}-${Math.random()}`,
          size: 28,
          scale: 1,
          x,
          y,
        };
        gsap.to(g, {
          duration: 0.25,
          scale: 0,
          ease: "power1.out",
          onComplete: () => {
            glows = glows.filter((glow) => glow.id !== g.id);
          },
        });
        glows.push(g);
      }

      if (distCounter >= distance) {
        distCounter = 0;

        const newPart = {
          id: Date.now() + Math.random(),
          x,
          y,
          sy: Math.random() > 0.5 ? 1 : -1,
          b: gsap.utils.random(0.5, 1.5),
          r: gsap.utils.random(0, 359, 1),
          hue: gsap.utils.random(0, 359, 1),
          size: gsap.utils.random(14, 34, 1),
          scale: 1,
          alpha: 1,
        };

        const spin = gsap.to(newPart, {
          sy: newPart.sy < 0 ? 1 : -1,
          duration: gsap.utils.random(0.1, 0.5),
          repeat: gsap.utils.random(0, 10, 1),
        });

        gsap.to(newPart, {
          duration: gsap.utils.random(0.6, 2.0),
          r: newPart.r + gsap.utils.random(-45, 45, 1),
          y: y + gsap.utils.random(40, 200, 1),
          alpha: 0,
          scale: 0,
          ease: "power1.out",
          onComplete: () => {
            spin.kill();
            parts = parts.filter((p) => p.id !== newPart.id);
          },
        });

        parts.push(newPart);
      }
    };

    window.addEventListener("pointermove", paint, { passive: true });
    window.addEventListener("mousemove", paint, { passive: true });
    gsap.ticker.add(render);

    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("pointermove", paint);
      window.removeEventListener("mousemove", paint);
      gsap.ticker.remove(render);
    };
  }, [distance, glow, mounted]);

  if (!mounted) return null;

  return createPortal(
    <canvas
      ref={canvasRef}
      className="fixed top-0 left-0 w-full h-full pointer-events-none z-[99999]"
      style={{
        width: "100vw",
        height: "100vh",
      }}
    />,
    document.body
  );
};

export default SparkleCursor;
