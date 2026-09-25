"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { cn } from "@/lib/utils";

export interface WoofyHoverImageProps {
  src: string;
  alt?: string;
  width?: number | string;
  height?: number | string;
  className?: string;
  effectType?: "inversion" | "blackWhite" | "sepia" | "duotone" | "pixelate" | "blur";
  maskRadius?: number;
  turbulenceIntensity?: number;
  animationSpeed?: number;
  appearDuration?: number;
  disappearDuration?: number;
  effectIntensity?: number;
  invertMask?: boolean;
  duotoneColor1?: string;
  duotoneColor2?: string;
  onHover?: () => void;
  onLeave?: () => void;
}

export const WoofyHoverImage: React.FC<WoofyHoverImageProps> = ({
  src,
  alt = "",
  width = "auto",
  height = 400,
  className,
  effectType = "inversion",
  maskRadius = 0.35,
  turbulenceIntensity = 0.225,
  animationSpeed = 1.0,
  appearDuration = 0.4,
  disappearDuration = 0.3,
  effectIntensity = 0.5,
  invertMask = false,
  duotoneColor1 = "#3366cc",
  duotoneColor2 = "#e63333",
  onHover,
  onLeave,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const imgElementRef = useRef<HTMLImageElement | null>(null);

  const isMouseInsideRef = useRef(false);
  const targetMouseRef = useRef({ x: 0.5, y: 0.5 });
  const lerpedMouseRef = useRef({ x: 0.5, y: 0.5 });
  const currentRadiusRef = useRef(0);
  const animationIdRef = useRef<number | null>(null);
  const timeRef = useRef(0);

  // Pre-rendered offscreen canvases for base image and effect image
  const baseCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const effectCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Generate the effect layer into an offscreen canvas
  const renderEffectLayer = useCallback(
    (img: HTMLImageElement, w: number, h: number) => {
      const effectCanvas = document.createElement("canvas");
      effectCanvas.width = w;
      effectCanvas.height = h;
      const eCtx = effectCanvas.getContext("2d");
      if (!eCtx) return null;

      // Draw original image first
      eCtx.drawImage(img, 0, 0, w, h);

      switch (effectType) {
        case "blackWhite": {
          eCtx.save();
          eCtx.globalCompositeOperation = "copy";
          eCtx.filter = "grayscale(100%)";
          eCtx.drawImage(img, 0, 0, w, h);
          eCtx.restore();
          break;
        }

        case "sepia": {
          eCtx.save();
          eCtx.globalCompositeOperation = "copy";
          eCtx.filter = "sepia(100%)";
          eCtx.drawImage(img, 0, 0, w, h);
          eCtx.restore();
          break;
        }

        case "blur": {
          eCtx.save();
          eCtx.globalCompositeOperation = "copy";
          const blurPx = Math.max(1, Math.round(effectIntensity * 12));
          eCtx.filter = `blur(${blurPx}px)`;
          eCtx.drawImage(img, 0, 0, w, h);
          eCtx.restore();
          break;
        }

        case "pixelate": {
          const pixelSize = Math.max(2, Math.round(effectIntensity * 24));
          const pW = Math.max(1, Math.floor(w / pixelSize));
          const pH = Math.max(1, Math.floor(h / pixelSize));
          const pCanvas = document.createElement("canvas");
          pCanvas.width = pW;
          pCanvas.height = pH;
          const pCtx = pCanvas.getContext("2d");
          if (pCtx) {
            pCtx.drawImage(img, 0, 0, pW, pH);
            eCtx.save();
            eCtx.imageSmoothingEnabled = false;
            eCtx.drawImage(pCanvas, 0, 0, w, h);
            eCtx.restore();
          }
          break;
        }

        case "duotone": {
          // 1. Grayscale base
          eCtx.save();
          eCtx.globalCompositeOperation = "copy";
          eCtx.filter = "grayscale(100%)";
          eCtx.drawImage(img, 0, 0, w, h);

          // 2. Duotone gradient overlay
          eCtx.globalCompositeOperation = "multiply";
          const grad = eCtx.createLinearGradient(0, 0, w, h);
          grad.addColorStop(0, duotoneColor1);
          grad.addColorStop(1, duotoneColor2);
          eCtx.fillStyle = grad;
          eCtx.fillRect(0, 0, w, h);
          eCtx.restore();
          break;
        }

        case "inversion":
        default: {
          eCtx.save();
          eCtx.globalCompositeOperation = "copy";
          eCtx.filter = "invert(100%)";
          eCtx.drawImage(img, 0, 0, w, h);
          eCtx.restore();
          break;
        }
      }

      return effectCanvas;
    },
    [effectType, effectIntensity, duotoneColor1, duotoneColor2]
  );

  // Load image
  useEffect(() => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = src;
    img.onload = () => {
      imgElementRef.current = img;
      setImageLoaded(true);
    };
  }, [src]);

  // Handle resizing and rebuilding offscreen canvases
  const updateCanvases = useCallback(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    const img = imgElementRef.current;
    if (!container || !canvas || !img) return;

    const rect = container.getBoundingClientRect();
    const w = Math.max(Math.floor(rect.width), 10);
    const h = Math.max(Math.floor(rect.height), 10);
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;

    // Base offscreen canvas
    const baseCanvas = document.createElement("canvas");
    baseCanvas.width = w * dpr;
    baseCanvas.height = h * dpr;
    const bCtx = baseCanvas.getContext("2d");
    if (bCtx) {
      bCtx.drawImage(img, 0, 0, w * dpr, h * dpr);
      baseCanvasRef.current = baseCanvas;
    }

    // Effect offscreen canvas
    effectCanvasRef.current = renderEffectLayer(img, w * dpr, h * dpr);
  }, [renderEffectLayer]);

  useEffect(() => {
    if (!imageLoaded) return;
    updateCanvases();

    const handleResize = () => updateCanvases();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [imageLoaded, updateCanvases]);

  // Draw organic ink-marbling boundary path
  const drawOrganicMask = (
    ctx: CanvasRenderingContext2D,
    cx: number,
    cy: number,
    r: number,
    time: number,
    speed: number,
    turbulence: number
  ) => {
    const steps = 72;
    ctx.beginPath();
    for (let i = 0; i <= steps; i++) {
      const angle = (i / steps) * Math.PI * 2;
      // Multi-frequency harmonic wave disturbance simulating fluid ink marbling
      const wave =
        Math.sin(3 * angle + time * speed * 1.5) * 0.45 +
        Math.cos(5 * angle - time * speed * 2.1) * 0.32 +
        Math.sin(8 * angle + time * speed * 3.3) * 0.23;

      const currentR = Math.max(0, r * (1.0 + wave * turbulence * 2.2));
      const px = cx + Math.cos(angle) * currentR;
      const py = cy + Math.sin(angle) * currentR;

      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
  };

  // Main animation loop
  useEffect(() => {
    if (!imageLoaded) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animId = 0;

    const animate = () => {
      animId = requestAnimationFrame(animate);

      const baseCanvas = baseCanvasRef.current;
      const effectCanvas = effectCanvasRef.current;
      if (!baseCanvas || !effectCanvas) return;

      const w = canvas.width;
      const h = canvas.height;

      // Smooth mouse lerp
      lerpedMouseRef.current.x += (targetMouseRef.current.x - lerpedMouseRef.current.x) * 0.1;
      lerpedMouseRef.current.y += (targetMouseRef.current.y - lerpedMouseRef.current.y) * 0.1;

      if (isMouseInsideRef.current) {
        timeRef.current += 0.015 * animationSpeed;
      }

      ctx.clearRect(0, 0, w, h);

      // 1. Draw primary background layer
      const primaryLayer = invertMask ? effectCanvas : baseCanvas;
      const maskedLayer = invertMask ? baseCanvas : effectCanvas;

      ctx.drawImage(primaryLayer, 0, 0, w, h);

      // 2. Draw organic mask reveal layer if radius > 0
      const currentRadius = currentRadiusRef.current;
      if (currentRadius > 0.001) {
        const cx = lerpedMouseRef.current.x * w;
        const cy = lerpedMouseRef.current.y * h;
        const pixelRadius = currentRadius * Math.min(w, h);

        ctx.save();
        drawOrganicMask(ctx, cx, cy, pixelRadius, timeRef.current, animationSpeed, turbulenceIntensity);
        ctx.clip();

        ctx.drawImage(maskedLayer, 0, 0, w, h);
        ctx.restore();
      }
    };

    animate();
    animationIdRef.current = animId;

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [imageLoaded, animationSpeed, turbulenceIntensity, invertMask]);

  // Pointer hover interactions with smooth easing
  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const inside =
        e.clientX >= rect.left &&
        e.clientX <= rect.right &&
        e.clientY >= rect.top &&
        e.clientY <= rect.bottom;

      if (inside) {
        targetMouseRef.current.x = (e.clientX - rect.left) / rect.width;
        targetMouseRef.current.y = (e.clientY - rect.top) / rect.height;

        if (!isMouseInsideRef.current) {
          isMouseInsideRef.current = true;
          onHover?.();

          // Animate radius to maskRadius with ease-out cubic
          const startRadius = currentRadiusRef.current;
          const targetRadius = maskRadius;
          const startTime = performance.now();

          const animateRadius = () => {
            const elapsed = (performance.now() - startTime) / 1000;
            const progress = Math.min(elapsed / appearDuration, 1);
            const easeProgress = 1 - Math.pow(1 - progress, 3);

            currentRadiusRef.current = startRadius + (targetRadius - startRadius) * easeProgress;

            if (progress < 1 && isMouseInsideRef.current) {
              requestAnimationFrame(animateRadius);
            }
          };

          animateRadius();
        }
      } else if (isMouseInsideRef.current) {
        isMouseInsideRef.current = false;
        onLeave?.();

        // Animate radius to 0 with ease-in cubic
        const startRadius = currentRadiusRef.current;
        const startTime = performance.now();

        const animateRadius = () => {
          const elapsed = (performance.now() - startTime) / 1000;
          const progress = Math.min(elapsed / disappearDuration, 1);
          const easeProgress = Math.pow(progress, 3);

          currentRadiusRef.current = startRadius * (1 - easeProgress);

          if (progress < 1 && !isMouseInsideRef.current) {
            requestAnimationFrame(animateRadius);
          }
        };

        animateRadius();
      }
    },
    [maskRadius, appearDuration, disappearDuration, onHover, onLeave]
  );

  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [handleMouseMove]);

  return (
    <div
      ref={containerRef}
      className={cn("relative overflow-hidden flex items-center justify-center select-none", className)}
      style={{ width, height }}
    >
      <img
        src={src}
        alt={alt}
        className="w-full h-full object-cover pointer-events-none"
        style={{ position: "relative", zIndex: 0 }}
      />
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full pointer-events-none block z-10"
      />
    </div>
  );
};

export default WoofyHoverImage;