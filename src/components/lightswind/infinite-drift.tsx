"use client";

import React, { useRef, useEffect } from "react";
import { cn } from "@/lib/utils";

export interface InfiniteDriftBand {
  images: string[];
  speed?: number;
  rotation?: number;
  offsetY?: number;
  curveAmount?: number;
  curveDirection?: 1 | -1;
  rotationType?: "fromLeft" | "fromCenter";
}

export interface InfiniteDriftProps {
  bands?: InfiniteDriftBand[];
  height?: string | number;
  gap?: number;
  imageHeight?: number;
  bandHeight?: number;
  maxImageWidth?: number;
  inertia?: number;
  preserveOriginalRatios?: boolean;
  className?: string;
  children?: React.ReactNode;
}

const DEFAULT_BANDS: InfiniteDriftBand[] = [
  { offsetY: -220, speed: 1.0, rotation: 7, rotationType: "fromLeft", curveAmount: 40.0, curveDirection: 1, images: ["https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=400","https://images.unsplash.com/photo-1550684399-3f0f745771d1?w=400","https://images.unsplash.com/photo-1550684847-75bdda21cc95?w=400","https://images.unsplash.com/photo-1563089145-599997674d42?w=400"] },
  { offsetY: -110, speed: 1.3, rotation: 7, rotationType: "fromCenter", curveAmount: 35.0, curveDirection: 1, images: ["https://images.unsplash.com/photo-1557683316-973673baf926?w=400","https://images.unsplash.com/photo-1557683311-eac922347aa1?w=400","https://images.unsplash.com/photo-1557683325-3ba8f0df79de?w=400","https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400"] },
  { offsetY: 0, speed: 0.7, rotation: 7, curveAmount: 40.0, curveDirection: 1, images: ["https://images.unsplash.com/photo-1511447333849-2b89ae13b002?w=400","https://images.unsplash.com/photo-1536431311719-398b6704d4cc?w=400","https://images.unsplash.com/photo-1543966888-7c1dc482a810?w=400","https://images.unsplash.com/photo-1561070791-36c11767b26a?w=400"] },
  { offsetY: 110, speed: 1.2, rotation: 7, curveAmount: 40.0, curveDirection: 1, images: ["https://images.unsplash.com/photo-1493246507139-91e8bef99c02?w=400","https://images.unsplash.com/photo-1477346611705-65d1883cee1e?w=400","https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=400","https://images.unsplash.com/photo-1561070791-0626bcd0516e?w=400"] },
  { offsetY: 220, speed: 0.9, rotation: 7, curveAmount: 35.0, curveDirection: 1, images: ["https://images.unsplash.com/photo-1534067783941-51c9c23ecefd?w=400","https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400","https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=400","https://images.unsplash.com/photo-1557683316-973673baf926?w=400"] },
];

// Replicate GLSL mod() – always positive remainder
const glslMod = (a: number, b: number) => ((a % b) + b) % b;

// Replicate GLSL rotate2d() – rotate point (px,py) around centre (cx,cy)
const rotate2dPt = (px: number, py: number, cx: number, cy: number, angle: number): [number, number] => {
  const dx = px - cx, dy = py - cy, c = Math.cos(angle), s = Math.sin(angle);
  return [cx + c * dx - s * dy, cy + s * dx + c * dy];
};

interface BandState {
  config: InfiniteDriftBand;
  stripCanvas: HTMLCanvasElement;
  sequenceWidth: number;
  ready: boolean;
}

export const InfiniteDrift: React.FC<InfiniteDriftProps> = ({
  bands = DEFAULT_BANDS,
  height = 600,
  gap = 20,
  imageHeight = 100,
  bandHeight = 120,
  maxImageWidth = 300,
  inertia = 0.92,
  preserveOriginalRatios = true,
  className,
  children,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef    = useRef<HTMLCanvasElement>(null);
  const scrollState  = useRef({
    scrollY: 0, targetScrollY: 0, scrollVelocity: 0, isDragging: false, lastMouseY: 0,
  });

  useEffect(() => {
    if (!containerRef.current || !canvasRef.current) return;
    const container = containerRef.current;
    const canvas    = canvasRef.current;
    const dpr       = Math.min(window.devicePixelRatio, 2);

    const resize = () => {
      canvas.width  = container.clientWidth  * dpr;
      canvas.height = container.clientHeight * dpr;
      // Re-apply DPR scale after every resize – resizing resets the transform
      const c = canvas.getContext("2d");
      if (c) c.scale(dpr, dpr);
    };
    resize();

    const ctx = canvas.getContext("2d");
    if (!ctx) return; // guard: stale WebGL context from HMR or SSR

    // ---- Build one offscreen strip per band (3-clone texture atlas) ----
    const bandStates: BandState[] = bands.map((config) => ({
      config,
      stripCanvas: document.createElement("canvas"),
      sequenceWidth: 0,
      ready: false,
    }));

    const loadBand = async (bs: BandState) => {
      const { config } = bs;
      const imgs = await Promise.all(config.images.map((url) =>
        new Promise<HTMLImageElement | HTMLCanvasElement>((resolve) => {
          const img = new Image();
          img.crossOrigin = "anonymous";
          img.onload  = () => resolve(img);
          img.onerror = () => {
            const fb = document.createElement("canvas");
            fb.width = 400; fb.height = 300;
            const fc = fb.getContext("2d")!;
            fc.fillStyle = `hsl(${Math.random() * 360},70%,60%)`;
            fc.fillRect(0, 0, 400, 300);
            resolve(fb);
          };
          img.src = url;
        })
      ));

      let seqW = 0;
      const infos = imgs.map((src) => {
        const nw = (src as HTMLImageElement).naturalWidth  || (src as HTMLCanvasElement).width;
        const nh = (src as HTMLImageElement).naturalHeight || (src as HTMLCanvasElement).height;
        const ratio = nw / nh || 1.5;
        let w: number, h: number;
        if (preserveOriginalRatios) {
          h = imageHeight; w = Math.round(h * ratio);
          if (w > maxImageWidth) { w = maxImageWidth; h = Math.round(w / ratio); }
        } else {
          h = imageHeight; w = Math.round(h * 1.5);
        }
        seqW += w + gap;
        return { src, w, h };
      });
      seqW -= gap; // remove trailing gap

      const CLONES = 3;
      const strip  = bs.stripCanvas;
      strip.width  = seqW * CLONES;
      strip.height = bandHeight;
      const sc     = strip.getContext("2d")!;
      let cx2 = 0;
      for (let c = 0; c < CLONES; c++) {
        for (const info of infos) {
          sc.drawImage(info.src, cx2, (bandHeight - info.h) / 2, info.w, info.h);
          cx2 += info.w + gap;
        }
      }
      bs.sequenceWidth = seqW;
      bs.ready = true;
    };

    void Promise.all(bandStates.map(loadBand));

    // ---- Render one band – exact GLSL shader math in Canvas 2D ----
    // Shader replication:
    //   curveOffset(x) = (0.5 - 4*(nx-0.5)^2) * curveAmount * curveDirection
    //   rotation: rotate point around pivot before texture lookup
    //   wrapping:  glslMod(srcX + scrollPos, sequenceWidth)
    const drawBand = (bs: BandState, W: number, H: number, scrollY: number) => {
      if (!bs.ready) return;
      const { config, stripCanvas, sequenceWidth } = bs;

      const rotRad      = ((config.rotation || 0) * Math.PI) / 180;
      const hasRot      = Math.abs(rotRad) > 0.0001;
      const curveAmount = config.curveAmount  ?? 0;
      const curveDir    = config.curveDirection ?? 1;
      const speed       = config.speed  ?? 1.0;
      const offsetY     = config.offsetY ?? 0;
      const fromLeft    = config.rotationType === "fromLeft";

      // Mirrors shader: bandTopBase = (uResolution.y - uBandHeight) * 0.5 + uOffsetY
      const bandTopBase = (H - bandHeight) * 0.5 + offsetY;
      const bandCenterY = bandTopBase + bandHeight * 0.5;
      const pivotX      = fromLeft ? 0 : W * 0.5;
      const pivotY      = bandCenterY;
      const scrollPos   = scrollY * speed;

      ctx.save();

      // Clip to band region (with curvature padding + rotation padding)
      ctx.beginPath();
      if (hasRot) {
        const pad = curveAmount + 4;
        const corners: [number, number][] = [
          [0,     bandTopBase - pad],
          [W,     bandTopBase - pad],
          [W,     bandTopBase + bandHeight + pad],
          [0,     bandTopBase + bandHeight + pad],
        ];
        corners.forEach(([cx_, cy_], i) => {
          const [rx, ry] = rotate2dPt(cx_, cy_, pivotX, pivotY, -rotRad);
          if (i === 0) ctx.moveTo(rx, ry); else ctx.lineTo(rx, ry);
        });
        ctx.closePath();
      } else {
        const pad = curveAmount + 4;
        ctx.rect(0, bandTopBase - pad, W, bandHeight + pad * 2);
      }
      ctx.clip();

      // Column-slice loop – replicates per-pixel shader logic
      for (let x = 0; x < W; x++) {
        // 1. Parabolic curvature: curveOffset = (0.5 - 4*(nx-0.5)^2) * amount * dir
        const nx          = x / W;
        const curveFactor = 4.0 * (nx - 0.5) * (nx - 0.5);
        const curveOffset = (0.5 - curveFactor) * curveAmount * curveDir;
        const bandTop     = bandTopBase + curveOffset;

        // 2. Rotation inverse – find source x in strip texture
        let srcX = x;
        if (hasRot) {
          const [rx] = rotate2dPt(x, bandCenterY, pivotX, pivotY, rotRad);
          srcX = rx;
        }

        // 3. Infinite wrapping via GLSL mod
        const wrappedX = glslMod(srcX + scrollPos, sequenceWidth);
        const texSrcX  = wrappedX + sequenceWidth; // use 2nd tile (of 3) for stability

        if (texSrcX < 0 || texSrcX >= stripCanvas.width) continue;

        // 4. Draw 1-px column from strip onto output at curved position
        ctx.drawImage(stripCanvas, texSrcX, 0, 1, bandHeight, x, bandTop, 1, bandHeight);
      }

      ctx.restore();
    };

    // ---- Animation loop ----
    let animId: number;
    const animate = () => {
      animId = requestAnimationFrame(animate);
      const W = container.clientWidth, H = container.clientHeight;
      const state = scrollState.current;

      if (!state.isDragging) {
        state.targetScrollY  += state.scrollVelocity;
        state.scrollVelocity *= inertia;
        if (Math.abs(state.scrollVelocity) < 0.1) state.scrollVelocity = 0;
      }
      state.scrollY += (state.targetScrollY - state.scrollY) * 0.1;

      ctx.clearRect(0, 0, W, H);
      for (const bs of bandStates) drawBand(bs, W, H, state.scrollY);
    };
    animate();

    // ---- Event handlers – identical to original ----
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      scrollState.current.targetScrollY  += e.deltaY;
      scrollState.current.scrollVelocity  = e.deltaY * 0.15;
    };

    let lastScrollTop = window.scrollY;
    const handleGlobalScroll = () => {
      const c = window.scrollY, d = c - lastScrollTop;
      lastScrollTop = c;
      scrollState.current.targetScrollY  += d * 2.5;
      scrollState.current.scrollVelocity  = d * 0.3;
    };

    const handleMouseDown = (e: MouseEvent) => {
      scrollState.current.isDragging    = true;
      scrollState.current.lastMouseY    = e.clientY;
      scrollState.current.scrollVelocity = 0;
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!scrollState.current.isDragging) return;
      const d = e.clientY - scrollState.current.lastMouseY;
      scrollState.current.targetScrollY  += d * 2.0;
      scrollState.current.lastMouseY      = e.clientY;
      scrollState.current.scrollVelocity  = d * 0.25;
    };

    const handleMouseUp = () => { scrollState.current.isDragging = false; };

    const handleResize = () => { resize(); }; // scale is re-applied inside resize()

    const handleTouchStart = (e: TouchEvent) => {
      scrollState.current.lastMouseY = e.touches[0].clientY;
      scrollState.current.isDragging = true;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!scrollState.current.isDragging) return;
      const d = e.touches[0].clientY - scrollState.current.lastMouseY;
      scrollState.current.targetScrollY  += d * 2.5;
      scrollState.current.lastMouseY      = e.touches[0].clientY;
      scrollState.current.scrollVelocity  = d * 0.3;
    };

    container.addEventListener("wheel",      handleWheel,        { passive: false });
    container.addEventListener("mousedown",  handleMouseDown);
    window.addEventListener("mousemove",     handleMouseMove);
    window.addEventListener("mouseup",       handleMouseUp);
    window.addEventListener("resize",        handleResize);
    window.addEventListener("scroll",        handleGlobalScroll, { passive: true });
    container.addEventListener("touchstart", handleTouchStart,   { passive: false });
    container.addEventListener("touchmove",  handleTouchMove,    { passive: false });
    container.addEventListener("touchend",   handleMouseUp);

    return () => {
      cancelAnimationFrame(animId);
      container.removeEventListener("wheel",      handleWheel);
      container.removeEventListener("mousedown",  handleMouseDown);
      window.removeEventListener("mousemove",     handleMouseMove);
      window.removeEventListener("mouseup",       handleMouseUp);
      window.removeEventListener("resize",        handleResize);
      window.removeEventListener("scroll",        handleGlobalScroll);
      container.removeEventListener("touchstart", handleTouchStart);
      container.removeEventListener("touchmove",  handleTouchMove);
      container.removeEventListener("touchend",   handleMouseUp);
    };
  }, [bands, gap, imageHeight, bandHeight, maxImageWidth, inertia, preserveOriginalRatios]);

  return (
    <div
      ref={containerRef}
      className={cn("relative w-full overflow-hidden bg-background cursor-grab active:cursor-grabbing", className)}
      style={{ height }}
    >
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
      {children}
    </div>
  );
};

export default InfiniteDrift;
