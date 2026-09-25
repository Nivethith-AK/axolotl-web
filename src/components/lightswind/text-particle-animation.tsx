"use client";

import React, { useEffect, useRef } from "react";

export interface TextParticleAnimationProps {
  text: string;
  fontSize?: number;
  fontFamily?: string;
  fontWeight?: string | number;
  resolution?: number;
  pixelSize?: number;
  hoverRadius?: number;
  repelForce?: number;
  clickRadius?: number;
  clickForce?: number;
  springForce?: number;
  friction?: number;
  theme?: "light" | "dark";
  padding?: number;
  height?: number;
}

export function TextParticleAnimation({
  text,
  fontSize = 120,
  fontFamily = "sans-serif",
  fontWeight = 900,
  resolution = 4,
  pixelSize = 3,
  hoverRadius = 60,
  repelForce = 15,
  clickRadius = 300,
  clickForce = 80,
  springForce = 0.08,
  friction = 0.85,
  theme = "light",
  padding = 150,
  height,
}: TextParticleAnimationProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const canvas2 = canvas;

    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    if (!ctx) return;
    const ctx2 = ctx;

    let particles: Particle[] = [];
    let animationFrameId = 0;

    const mouse = { x: -1000, y: -1000 };

    const fontStr = `${fontWeight} ${fontSize}px ${fontFamily}`;
    ctx.font = fontStr;
    const metrics = ctx.measureText(text);

    const textWidth = metrics.width;
    const textHeight =
      (metrics.actualBoundingBoxAscent || fontSize) +
      (metrics.actualBoundingBoxDescent || 0);

    // Respect the height prop if specified, otherwise use calculated height
    canvas.width = textWidth + padding * 2;
    canvas.height = typeof height === "number" ? height : textHeight + padding * 2;

    ctx.font = fontStr;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = theme === "dark" ? "#ffffff" : "#121212";
    ctx.fillText(text, canvas.width / 2, canvas.height / 2);

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    class Particle {
      x: number;
      y: number;
      originX: number;
      originY: number;
      vx: number;
      vy: number;
      color: string;

      constructor(x: number, y: number, color: string) {
        this.x = x;
        this.y = y;
        this.originX = x;
        this.originY = y;
        this.vx = 0;
        this.vy = 0;
        this.color = color;
      }

      update() {
        const dx = mouse.x - this.x;
        const dy = mouse.y - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < hoverRadius) {
          const angle = Math.atan2(dy, dx);
          const force = (hoverRadius - distance) / hoverRadius;
          this.vx -= Math.cos(angle) * force * repelForce;
          this.vy -= Math.sin(angle) * force * repelForce;
        }

        this.vx += (this.originX - this.x) * springForce;
        this.vy += (this.originY - this.y) * springForce;

        this.vx *= friction;
        this.vy *= friction;

        this.x += this.vx;
        this.y += this.vy;
      }

      draw() {
        ctx2.fillStyle = this.color;
        ctx2.fillRect(this.x, this.y, pixelSize, pixelSize);
      }
    }

    function initParticles(data: ImageData) {
      particles = [];
      const d = data.data;

      for (let y = 0; y < canvas2.height; y += resolution) {
        for (let x = 0; x < canvas2.width; x += resolution) {
          const index = (y * canvas2.width + x) * 4;
          const alpha = d[index + 3];
          if (alpha > 10) {
            const r = d[index];
            const g = d[index + 1];
            const b = d[index + 2];
            particles.push(new Particle(x, y, `rgb(${r}, ${g}, ${b})`));
          }
        }
      }
    }

    function animate() {
      ctx2.clearRect(0, 0, canvas2.width, canvas2.height);
      for (let i = 0; i < particles.length; i++) {
        particles[i].update();
        particles[i].draw();
      }
      animationFrameId = window.requestAnimationFrame(animate);
    }

    const getMousePos = (e: MouseEvent) => {
      const rect = canvas2.getBoundingClientRect();
      const scaleX = canvas2.width / rect.width;
      const scaleY = canvas2.height / rect.height;
      return {
        x: (e.clientX - rect.left) * scaleX,
        y: (e.clientY - rect.top) * scaleY,
      };
    };

    const handleMouseMove = (e: MouseEvent) => {
      const pos = getMousePos(e);
      mouse.x = pos.x;
      mouse.y = pos.y;
    };

    const handleMouseLeave = () => {
      mouse.x = -1000;
      mouse.y = -1000;
    };

    const handleMouseDown = (e: MouseEvent) => {
      const pos = getMousePos(e);
      for (const p of particles) {
        const dx = pos.x - p.x;
        const dy = pos.y - p.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < clickRadius) {
          const angle = Math.atan2(dy, dx);
          const force = (clickRadius - distance) / clickRadius;
          p.vx -= Math.cos(angle) * force * clickForce;
          p.vy -= Math.sin(angle) * force * clickForce;
        }
      }
    };

    initParticles(imageData);
    animate();

    canvas2.addEventListener("mousemove", handleMouseMove);
    canvas2.addEventListener("mouseleave", handleMouseLeave);
    canvas2.addEventListener("mousedown", handleMouseDown);

    return () => {
      window.cancelAnimationFrame(animationFrameId);
      canvas2.removeEventListener("mousemove", handleMouseMove);
      canvas2.removeEventListener("mouseleave", handleMouseLeave);
      canvas2.removeEventListener("mousedown", handleMouseDown);
    };
  }, [
    text,
    fontSize,
    fontFamily,
    fontWeight,
    resolution,
    pixelSize,
    hoverRadius,
    repelForce,
    clickRadius,
    clickForce,
    springForce,
    friction,
    theme,
    padding,
    height,
  ]);

  return (
    <div className="flex w-full items-center justify-center overflow-visible">
      <canvas
        ref={canvasRef}
        className="block max-w-full select-none"
        style={{ height: typeof height === "number" ? `${height}px` : "auto" }}
      />
    </div>
  );
}

export default TextParticleAnimation;
