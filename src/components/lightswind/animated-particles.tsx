"use client";

import React, { useEffect, useRef, useState } from "react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";

export type ParticleShape =
  | "random"
  | "heart"
  | "star"
  | "saturn"
  | "ring"
  | "infinity"
  | "diamond"
  | "spiral"
  | "butterfly";

export type ParticleGlyph =
  | "circle"
  | "star"
  | "square"
  | "diamond"
  | "ring"
  | "cross"
  | "random";

export type CursorMode = "disperse" | "attract" | "swirl";

export type ParticleVariant =
  | "azure"
  | "violet"
  | "emerald"
  | "solar"
  | "aurora"
  | "monochrome"
  | "custom";

export interface AnimatedParticlesProps {
  className?: string;
  children?: React.ReactNode;
  /** Overall particle shape formation ("random" | "heart" | "star" | "saturn" | "ring" | "infinity" | "diamond" | "spiral" | "butterfly", default: "random") */
  shape?: ParticleShape;
  /** Individual particle point glyph shape ("circle" | "star" | "square" | "diamond" | "ring" | "cross" | "random") */
  glyph?: ParticleGlyph;
  /** Preset color theme variant */
  variant?: ParticleVariant;
  /** Optional image URL to sample particle colors and positions from */
  imageUrl?: string;
  /** Total number of simulated particles (5,000 to 100,000, default: 45,000) */
  particleCount?: number;
  /** Rendered particle point size (default: 2.6) */
  particleSize?: number;
  /** Particle maximum alpha opacity (0.0 to 1.0, default: 0.9) */
  particleOpacity?: number;
  /** Vector field velocity speed multiplier (default: 1.0) */
  speed?: number;
  /** Curl noise frequency zoom scale (default: 0.004) */
  noiseScale?: number;
  /** Curl noise force displacement strength (default: 0.06) */
  noiseStrength?: number;
  /** Shape assembly spring stiffness (0.01 to 0.1, default: 0.045) */
  springStiffness?: number;
  /** Particle lifespan cycle frames (default: 240) */
  lifespan?: number;
  /** Velocity damping friction factor (0.85 to 0.99, default: 0.95) */
  damping?: number;
  /** Whether the particle field responds to cursor motion (default: true) */
  interactive?: boolean;
  /** Physics mode when cursor interacts with particles ("disperse" | "attract" | "swirl") */
  cursorMode?: CursorMode;
  /** Cursor interaction force strength (default: 0.15) */
  cursorStrength?: number;
  /** Cursor interaction influence radius in pixels (default: 140) */
  cursorRadius?: number;
  /** Background canvas color (auto-adapts by theme if undefined) */
  backgroundColor?: string;
  /** Optional ambient blurred background backdrop image */
  backdropImage?: string;
  /** Opacity of ambient backdrop image (0.0 to 1.0, default: 0.15) */
  backdropOpacity?: number;
  /** Blur radius for ambient backdrop (default: 20) */
  backdropBlur?: number;
  /** Custom HEX color palette array for particles */
  colors?: string[];
}

/** Variant Color Palettes for Light and Dark Modes */
const VARIANT_PALETTES: Record<
  Exclude<ParticleVariant, "custom">,
  {
    light: [string, string, string, string];
    dark: [string, string, string, string];
  }
> = {
  azure: {
    light: ["#0284c7", "#06b6d4", "#0284c7", "#0369a1"],
    dark: ["#00f2fe", "#4facfe", "#38bdf8", "#bae6fd"],
  },
  violet: {
    light: ["#7c3aed", "#9333ea", "#6d28d9", "#581c87"],
    dark: ["#a855f7", "#ec4899", "#d946ef", "#f5d0fe"],
  },
  emerald: {
    light: ["#059669", "#10b981", "#047857", "#065f46"],
    dark: ["#10b981", "#06b6d4", "#6ee7b7", "#a7f3d0"],
  },
  solar: {
    light: ["#ea580c", "#f97316", "#c2410c", "#9a3412"],
    dark: ["#f97316", "#fde047", "#fed7aa", "#ffedd5"],
  },
  aurora: {
    light: ["#0d9488", "#4f46e5", "#0f766e", "#4338ca"],
    dark: ["#2dd4bf", "#818cf8", "#c084fc", "#e0e7ff"],
  },
  monochrome: {
    light: ["#0f172a", "#334155", "#475569", "#1e293b"],
    dark: ["#ffffff", "#e2e8f0", "#94a3b8", "#cbd5e1"],
  },
};

/** Converts HEX color string ("#00F2FE") to RGB float array ([0, 0.949, 0.996]) */
function hexToRgb(hex: string): [number, number, number] {
  let c = hex.replace("#", "").trim();
  if (c.length === 3) {
    c = c.split("").map((x) => x + x).join("");
  }
  const num = parseInt(c, 16);
  if (isNaN(num)) return [1, 1, 1];
  return [((num >> 16) & 255) / 255, ((num >> 8) & 255) / 255, (num & 255) / 255];
}

/** Computes target coordinate on the 2D canvas for each shape formation */
function computeShapeTarget(
  targetShape: ParticleShape,
  i: number,
  total: number,
  w: number,
  h: number
): [number, number] {
  const minDim = Math.min(w, h);
  const cx = w * 0.5;
  const cy = h * 0.5;

  if (targetShape === "heart") {
    const t = Math.random() * Math.PI * 2;
    const r = Math.pow(Math.random(), 0.35);
    const scale = minDim * 0.021 * r;
    const hx = 16 * Math.pow(Math.sin(t), 3) * scale;
    const hy = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)) * scale;
    return [cx + hx, cy + hy + minDim * 0.03];
  }

  if (targetShape === "star") {
    const angle = Math.random() * Math.PI * 2;
    const points = 5;
    const section = Math.PI / points;
    const aMod = ((angle % (section * 2)) + section * 2) % (section * 2);
    const rInner = 0.42;
    const rOuter = 1.0;
    const t = aMod / section;
    const baseR = t < 1 ? rInner + (rOuter - rInner) * t : rOuter - (rOuter - rInner) * (t - 1);
    const volumeR = Math.pow(Math.random(), 0.45) * baseR;
    const scale = minDim * 0.38;
    const sx = Math.cos(angle - Math.PI / 2) * volumeR * scale;
    const sy = Math.sin(angle - Math.PI / 2) * volumeR * scale;
    return [cx + sx, cy + sy];
  }

  if (targetShape === "saturn") {
    if (Math.random() < 0.48) {
      const angle = Math.random() * Math.PI * 2;
      const rRing = minDim * (0.30 + Math.random() * 0.14);
      const rx = Math.cos(angle) * rRing;
      const ry = Math.sin(angle) * rRing * 0.28;
      const tilt = -0.45;
      const tx = rx * Math.cos(tilt) - ry * Math.sin(tilt);
      const ty = rx * Math.sin(tilt) + ry * Math.cos(tilt);
      return [cx + tx, cy + ty];
    } else {
      const theta = Math.random() * Math.PI * 2;
      const r = Math.sqrt(Math.random()) * minDim * 0.19;
      return [cx + Math.cos(theta) * r, cy + Math.sin(theta) * r];
    }
  }

  if (targetShape === "ring") {
    const angle = Math.random() * Math.PI * 2;
    const r = minDim * (0.33 + (Math.random() - 0.5) * 0.06);
    return [cx + Math.cos(angle) * r, cy + Math.sin(angle) * r];
  }

  if (targetShape === "infinity") {
    const t = Math.random() * Math.PI * 2;
    const scale = minDim * 0.44;
    const denom = 1 + Math.sin(t) * Math.sin(t);
    const jitter = (Math.random() - 0.5) * (minDim * 0.04);
    const ix = (scale * Math.cos(t)) / denom + jitter;
    const iy = (scale * Math.sin(t) * Math.cos(t)) / denom + jitter;
    return [cx + ix, cy + iy];
  }

  if (targetShape === "diamond") {
    const u = (Math.random() - 0.5) * 2.0;
    const maxV = 1.0 - Math.abs(u);
    const v = (Math.random() - 0.5) * 2.0 * maxV;
    const scale = minDim * 0.38;
    return [cx + u * scale, cy + v * scale * 1.15];
  }

  if (targetShape === "spiral") {
    const arm = Math.random() > 0.5 ? 0 : Math.PI;
    const r = Math.pow(Math.random(), 0.55) * minDim * 0.42;
    const theta = (r / minDim) * 12.0 + arm + (Math.random() - 0.5) * 0.22;
    return [cx + Math.cos(theta) * r, cy + Math.sin(theta) * r];
  }

  if (targetShape === "butterfly") {
    const t = (Math.random() - 0.5) * Math.PI * 2;
    const r = (Math.exp(Math.cos(t)) - 2 * Math.cos(4 * t) - Math.pow(Math.sin(t / 12), 5)) * (minDim * 0.08);
    const bx = Math.sin(t) * r * Math.pow(Math.random(), 0.3);
    const by = -Math.cos(t) * r * Math.pow(Math.random(), 0.3);
    return [cx + bx, cy + by];
  }

  // Default "random": Uniformly splitted across the full canvas
  return [Math.random() * w, Math.random() * h];
}

const VERTEX_SHADER = `
attribute vec2 a_origin;
attribute vec2 a_position;
attribute float a_life;
attribute float a_maxLife;
attribute float a_shape;
attribute vec3 a_color;

uniform vec2 u_resolution;
uniform float u_particleSize;
uniform float u_particleOpacity;

varying vec2 v_texCoord;
varying float v_alpha;
varying float v_shape;
varying vec3 v_color;

void main() {
    v_texCoord = vec2(a_origin.x, 1.0 - a_origin.y);
    float lifeRatio = clamp(a_life / a_maxLife, 0.0, 1.0);
    v_alpha = sin(lifeRatio * 3.14159265) * u_particleOpacity;
    v_shape = a_shape;
    v_color = a_color;
    
    vec2 clipSpace = (a_position / u_resolution) * 2.0 - 1.0;
    gl_Position = vec4(clipSpace * vec2(1.0, -1.0), 0.0, 1.0);
    gl_PointSize = u_particleSize;
}
`;

const FRAGMENT_SHADER = `
precision highp float;
uniform sampler2D u_image;
uniform int u_useImage;

varying vec2 v_texCoord;
varying float v_alpha;
varying float v_shape;
varying vec3 v_color;

void main() {
    vec2 coord = gl_PointCoord - vec2(0.5);
    float dist = length(coord);
    int shapeType = int(floor(v_shape + 0.5));
    
    // Geometry shape masking
    if (shapeType == 0) {
        // Circle
        if (dist > 0.5) discard;
    } else if (shapeType == 1) {
        // 4-Point Star
        float r = dist;
        float a = atan(coord.y, coord.x);
        float starDist = r * (0.8 + 0.6 * pow(abs(sin(a * 2.0)), 0.5));
        if (starDist > 0.45) discard;
    } else if (shapeType == 2) {
        // Square / Pixel
        if (abs(coord.x) > 0.45 || abs(coord.y) > 0.45) discard;
    } else if (shapeType == 3) {
        // Diamond
        if (abs(coord.x) + abs(coord.y) > 0.5) discard;
    } else if (shapeType == 4) {
        // Ring / Donut
        if (dist > 0.5 || dist < 0.22) discard;
    } else if (shapeType == 5) {
        // Cross '+'
        bool horiz = abs(coord.y) < 0.16 && abs(coord.x) < 0.48;
        bool vert = abs(coord.x) < 0.16 && abs(coord.y) < 0.48;
        if (!horiz && !vert) discard;
    }
    
    vec4 baseColor;
    if (u_useImage == 1) {
        baseColor = texture2D(u_image, v_texCoord);
        if (baseColor.a < 0.05) discard;
    } else {
        baseColor = vec4(v_color, 1.0);
    }
    
    gl_FragColor = vec4(baseColor.rgb, baseColor.a * v_alpha);
}
`;

/**
 * AnimatedParticles
 *
 * A high-performance WebGL particle vector field component.
 * Supports full background random particle flow as well as morphing shape formations (Heart, Star, Saturn, Ring, Infinity, Diamond, Spiral, Butterfly).
 */
export function AnimatedParticles({
  className,
  children,
  shape = "random",
  glyph = "random",
  variant = "azure",
  imageUrl,
  particleCount = 45000,
  particleSize = 2.6,
  particleOpacity = 0.9,
  speed = 1.0,
  noiseScale = 0.004,
  noiseStrength = 0.06,
  springStiffness = 0.045,
  lifespan = 240,
  damping = 0.95,
  interactive = true,
  cursorMode = "disperse",
  cursorStrength = 0.15,
  cursorRadius = 140,
  backgroundColor,
  backdropImage,
  backdropOpacity = 0.15,
  backdropBlur = 20,
  colors,
}: AnimatedParticlesProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: -9999, y: -9999, vx: 0, vy: 0, active: false });
  const { resolvedTheme, theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [isLightMode, setIsLightMode] = useState(false);

  useEffect(() => {
    setMounted(true);
    const checkIsLight = () => {
      if (typeof document !== "undefined") {
        if (document.documentElement.classList.contains("dark")) return false;
        if (document.documentElement.classList.contains("light")) return true;
      }
      if (resolvedTheme) return resolvedTheme === "light";
      if (theme) return theme === "light";
      if (typeof window !== "undefined" && window.matchMedia) {
        return !window.matchMedia("(prefers-color-scheme: dark)").matches;
      }
      return false;
    };

    setIsLightMode(checkIsLight());

    if (typeof document !== "undefined") {
      const observer = new MutationObserver(() => {
        setIsLightMode(checkIsLight());
      });
      observer.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ["class"],
      });
      return () => observer.disconnect();
    }
  }, [resolvedTheme, theme]);

  const paletteKey = mounted && isLightMode ? "light" : "dark";
  const selectedPalette = VARIANT_PALETTES[variant === "custom" ? "azure" : variant][paletteKey];
  const activeColors = colors && colors.length > 0 ? colors : selectedPalette;

  const resolvedBg =
    backgroundColor ?? (mounted && isLightMode ? "#ffffff" : "#07090e");

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl =
      canvas.getContext("webgl") ||
      (canvas.getContext("experimental-webgl") as WebGLRenderingContext | null);
    if (!gl) return;

    const createShader = (type: number, source: string) => {
      const shader = gl.createShader(type);
      if (!shader) return null;
      gl.shaderSource(shader, source);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.warn("[AnimatedParticles] Shader error:", gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
      }
      return shader;
    };

    const vert = createShader(gl.VERTEX_SHADER, VERTEX_SHADER);
    const frag = createShader(gl.FRAGMENT_SHADER, FRAGMENT_SHADER);
    if (!vert || !frag) return;

    const program = gl.createProgram();
    if (!program) return;
    gl.attachShader(program, vert);
    gl.attachShader(program, frag);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.warn("[AnimatedParticles] Program link error:", gl.getProgramInfoLog(program));
      return;
    }

    gl.useProgram(program);

    // Locations
    const aOrigin = gl.getAttribLocation(program, "a_origin");
    const aPosition = gl.getAttribLocation(program, "a_position");
    const aLife = gl.getAttribLocation(program, "a_life");
    const aMaxLife = gl.getAttribLocation(program, "a_maxLife");
    const aShape = gl.getAttribLocation(program, "a_shape");
    const aColor = gl.getAttribLocation(program, "a_color");

    const uResolution = gl.getUniformLocation(program, "u_resolution");
    const uParticleSize = gl.getUniformLocation(program, "u_particleSize");
    const uParticleOpacity = gl.getUniformLocation(program, "u_particleOpacity");
    const uUseImage = gl.getUniformLocation(program, "u_useImage");
    const uImage = gl.getUniformLocation(program, "u_image");

    // Optional texture loading
    const texture = gl.createTexture();
    let imageLoaded = false;

    if (imageUrl) {
      const image = new Image();
      image.crossOrigin = "anonymous";
      image.src = imageUrl;
      image.onload = () => {
        if (!gl) return;
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
        imageLoaded = true;
      };
    }

    // Particle CPU State Arrays
    const count = Math.max(1000, Math.min(100000, particleCount));
    const origins = new Float32Array(count * 2);
    const positions = new Float32Array(count * 2);
    const targets = new Float32Array(count * 2);
    const velocities = new Float32Array(count * 2);
    const lives = new Float32Array(count);
    const maxLives = new Float32Array(count);
    const shapes = new Float32Array(count);
    const colorAttrs = new Float32Array(count * 3);

    const parsedColors = activeColors.map((c) => hexToRgb(c));

    const getGlyphIndex = (g: ParticleGlyph): number => {
      switch (g) {
        case "circle":
          return 0;
        case "star":
          return 1;
        case "square":
          return 2;
        case "diamond":
          return 3;
        case "ring":
          return 4;
        case "cross":
          return 5;
        case "random":
          return Math.floor(Math.random() * 6);
        default:
          return 0;
      }
    };

    const initParticle = (i: number, w: number, h: number, respawnOnly: boolean = false) => {
      const [tx, ty] = computeShapeTarget(shape, i, count, w, h);
      targets[i * 2] = tx;
      targets[i * 2 + 1] = ty;

      origins[i * 2] = tx / Math.max(1, w);
      origins[i * 2 + 1] = ty / Math.max(1, h);

      if (!respawnOnly) {
        if (shape === "random") {
          positions[i * 2] = Math.random() * w;
          positions[i * 2 + 1] = Math.random() * h;
          velocities[i * 2] = (Math.random() - 0.5) * 1.5;
          velocities[i * 2 + 1] = (Math.random() - 0.5) * 1.5;
        } else {
          positions[i * 2] = tx + (Math.random() - 0.5) * 20.0;
          positions[i * 2 + 1] = ty + (Math.random() - 0.5) * 20.0;
          velocities[i * 2] = (Math.random() - 0.5) * 0.4;
          velocities[i * 2 + 1] = (Math.random() - 0.5) * 0.4;
        }
      } else {
        if (shape === "random") {
          positions[i * 2] = Math.random() * w;
          positions[i * 2 + 1] = Math.random() * h;
        }
      }

      const mLife = lifespan * (0.8 + Math.random() * 0.4);
      maxLives[i] = mLife;
      lives[i] = Math.random() * mLife;
      shapes[i] = getGlyphIndex(glyph);

      const colorRGB = parsedColors[Math.floor(Math.random() * parsedColors.length)] || [1, 1, 1];
      colorAttrs[i * 3] = colorRGB[0];
      colorAttrs[i * 3 + 1] = colorRGB[1];
      colorAttrs[i * 3 + 2] = colorRGB[2];
    };

    // GPU Buffers
    const originBuffer = gl.createBuffer();
    const posBuffer = gl.createBuffer();
    const lifeBuffer = gl.createBuffer();
    const maxLifeBuffer = gl.createBuffer();
    const shapeBuffer = gl.createBuffer();
    const colorBuffer = gl.createBuffer();

    let animationFrameId: number;
    let time = 0;

    const bgRgb = hexToRgb(resolvedBg);

    const render = () => {
      if (!canvas || !gl) return;

      const dpr = Math.min(typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1, 2);
      const displayWidth = Math.floor(canvas.clientWidth * dpr);
      const displayHeight = Math.floor(canvas.clientHeight * dpr);

      if (canvas.width !== displayWidth || canvas.height !== displayHeight) {
        canvas.width = displayWidth;
        canvas.height = displayHeight;
        gl.viewport(0, 0, displayWidth, displayHeight);
        for (let i = 0; i < count; i++) {
          initParticle(i, displayWidth, displayHeight, false);
        }
      }

      time += 0.01 * speed;
      const isRandom = shape === "random";
      const spring = isRandom ? 0.0 : springStiffness;

      // Particle physics update
      for (let i = 0; i < count; i++) {
        lives[i] += 1;
        if (lives[i] >= maxLives[i]) {
          initParticle(i, displayWidth, displayHeight, true);
        }

        const px = positions[i * 2];
        const py = positions[i * 2 + 1];
        const tx = targets[i * 2];
        const ty = targets[i * 2 + 1];

        // Shape Spring Assembly Force
        let fx = (tx - px) * spring;
        let fy = (ty - py) * spring;

        // Curl noise flow field vector
        const angle =
          Math.sin(px * noiseScale + time) *
          Math.cos(py * noiseScale + time) *
          Math.PI *
          2;
        
        const curlMag = isRandom ? noiseStrength * 2.2 : noiseStrength * 0.4;
        fx += Math.cos(angle) * curlMag;
        fy += Math.sin(angle) * curlMag;

        velocities[i * 2] = (velocities[i * 2] + fx) * damping;
        velocities[i * 2 + 1] = (velocities[i * 2 + 1] + fy) * damping;

        // Interactive cursor physics
        if (interactive && mouseRef.current.active) {
          const dx = px - mouseRef.current.x;
          const dy = py - mouseRef.current.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < cursorRadius && dist > 0) {
            const factor = (1 - dist / cursorRadius) * cursorStrength;

            if (cursorMode === "disperse") {
              const pushX = (dx / dist) * factor * 16.0 + mouseRef.current.vx * factor * 0.8;
              const pushY = (dy / dist) * factor * 16.0 + mouseRef.current.vy * factor * 0.8;
              velocities[i * 2] += pushX;
              velocities[i * 2 + 1] += pushY;
            } else if (cursorMode === "attract") {
              const pullX = -(dx / dist) * factor * 12.0;
              const pullY = -(dy / dist) * factor * 12.0;
              velocities[i * 2] += pullX;
              velocities[i * 2 + 1] += pullY;
            } else if (cursorMode === "swirl") {
              const perpX = -dy / dist;
              const perpY = dx / dist;
              velocities[i * 2] += perpX * factor * 14.0;
              velocities[i * 2 + 1] += perpY * factor * 14.0;
            }
          }
        }

        positions[i * 2] += velocities[i * 2];
        positions[i * 2 + 1] += velocities[i * 2 + 1];

        // Wrap around canvas boundaries for random mode
        if (isRandom) {
          if (positions[i * 2] < -20) positions[i * 2] = displayWidth + 20;
          else if (positions[i * 2] > displayWidth + 20) positions[i * 2] = -20;

          if (positions[i * 2 + 1] < -20) positions[i * 2 + 1] = displayHeight + 20;
          else if (positions[i * 2 + 1] > displayHeight + 20) positions[i * 2 + 1] = -20;
        }
      }

      // Clear Canvas
      gl.clearColor(bgRgb[0], bgRgb[1], bgRgb[2], 1.0);
      gl.clear(gl.COLOR_BUFFER_BIT);

      gl.enable(gl.BLEND);
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

      gl.uniform2f(uResolution, displayWidth, displayHeight);
      gl.uniform1f(uParticleSize, particleSize);
      gl.uniform1f(uParticleOpacity, particleOpacity);

      const useImg = imageUrl && imageLoaded ? 1 : 0;
      gl.uniform1i(uUseImage, useImg);

      if (useImg === 1) {
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.uniform1i(uImage, 0);
      }

      // Stream buffers to GPU
      gl.bindBuffer(gl.ARRAY_BUFFER, originBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, origins, gl.DYNAMIC_DRAW);
      gl.enableVertexAttribArray(aOrigin);
      gl.vertexAttribPointer(aOrigin, 2, gl.FLOAT, false, 0, 0);

      gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, positions, gl.DYNAMIC_DRAW);
      gl.enableVertexAttribArray(aPosition);
      gl.vertexAttribPointer(aPosition, 2, gl.FLOAT, false, 0, 0);

      gl.bindBuffer(gl.ARRAY_BUFFER, lifeBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, lives, gl.DYNAMIC_DRAW);
      gl.enableVertexAttribArray(aLife);
      gl.vertexAttribPointer(aLife, 1, gl.FLOAT, false, 0, 0);

      gl.bindBuffer(gl.ARRAY_BUFFER, maxLifeBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, maxLives, gl.DYNAMIC_DRAW);
      gl.enableVertexAttribArray(aMaxLife);
      gl.vertexAttribPointer(aMaxLife, 1, gl.FLOAT, false, 0, 0);

      gl.bindBuffer(gl.ARRAY_BUFFER, shapeBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, shapes, gl.DYNAMIC_DRAW);
      gl.enableVertexAttribArray(aShape);
      gl.vertexAttribPointer(aShape, 1, gl.FLOAT, false, 0, 0);

      gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, colorAttrs, gl.DYNAMIC_DRAW);
      gl.enableVertexAttribArray(aColor);
      gl.vertexAttribPointer(aColor, 3, gl.FLOAT, false, 0, 0);

      gl.drawArrays(gl.POINTS, 0, count);

      // Damp mouse velocities
      mouseRef.current.vx *= 0.88;
      mouseRef.current.vy *= 0.88;

      animationFrameId = requestAnimationFrame(render);
    };

    // Initialize all particle targets when shape or count changes
    const dpr = Math.min(typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1, 2);
    const initialW = (canvas.clientWidth || window.innerWidth) * dpr;
    const initialH = (canvas.clientHeight || window.innerHeight) * dpr;
    for (let i = 0; i < count; i++) {
      initParticle(i, initialW, initialH, false);
    }

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
      if (gl) {
        gl.deleteProgram(program);
        gl.deleteShader(vert);
        gl.deleteShader(frag);
        gl.deleteBuffer(originBuffer);
        gl.deleteBuffer(posBuffer);
        gl.deleteBuffer(lifeBuffer);
        gl.deleteBuffer(maxLifeBuffer);
        gl.deleteBuffer(shapeBuffer);
        gl.deleteBuffer(colorBuffer);
        gl.deleteTexture(texture);
      }
    };
  }, [
    shape,
    glyph,
    variant,
    imageUrl,
    particleCount,
    particleSize,
    particleOpacity,
    speed,
    noiseScale,
    noiseStrength,
    springStiffness,
    lifespan,
    damping,
    interactive,
    cursorMode,
    cursorStrength,
    cursorRadius,
    resolvedBg,
    activeColors,
  ]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!interactive || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const dpr = Math.min(typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1, 2);
    const newX = (e.clientX - rect.left) * dpr;
    const newY = (e.clientY - rect.top) * dpr;

    if (mouseRef.current.x !== -9999) {
      mouseRef.current.vx = newX - mouseRef.current.x;
      mouseRef.current.vy = newY - mouseRef.current.y;
    }
    mouseRef.current.x = newX;
    mouseRef.current.y = newY;
    mouseRef.current.active = true;
  };

  const handleMouseLeave = () => {
    if (!interactive) return;
    mouseRef.current.active = false;
    mouseRef.current.x = -9999;
    mouseRef.current.y = -9999;
  };

  return (
    <div
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={cn("relative w-full h-full overflow-hidden bg-background", className)}
    >
      {/* Optional Ambient Backdrop Image */}
      {backdropImage && (
        <div
          className="absolute inset-0 w-full h-full pointer-events-none transition-all duration-300"
          style={{
            backgroundImage: `url(${backdropImage})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            opacity: backdropOpacity,
            filter: `blur(${backdropBlur}px) saturate(1.4)`,
            transform: "scale(1.08)",
          }}
        />
      )}

      {/* WebGL Particle Simulation Canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full block pointer-events-none z-1"
      />

      {/* Children Layer */}
      {children && <div className="relative z-10 w-full h-full">{children}</div>}
    </div>
  );
}

export default AnimatedParticles;
