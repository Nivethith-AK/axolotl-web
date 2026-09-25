"use client";

import React, { useEffect, useRef, useState } from "react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";

export type GrainVariant =
  | "ocean"
  | "violet"
  | "cyberpunk"
  | "emerald"
  | "solar"
  | "monochrome"
  | "sunset"
  | "matrix"
  | "custom";

export type DitherPattern = "hash" | "crosshatch" | "bayer";

export interface AnimatedGrainProps {
  className?: string;
  children?: React.ReactNode;
  /** Preset color theme variant */
  variant?: GrainVariant;
  /** Dither pattern style ("hash" for '#' weave grid, "crosshatch", or "bayer") */
  ditherPattern?: DitherPattern;
  /** Wave oscillation speed multiplier (default: 1.0) */
  speed?: number;
  /** Wave density and zoom scale (default: 3.5) */
  scale?: number;
  /** Domain warp turbulence intensity (default: 2.2) */
  intensity?: number;
  /** Pixel quantization dither scale factor (0.2 to 2.0, default: 0.6) */
  ditherScale?: number;
  /** Extra subtle analog film grain overlay (0.0 to 1.0, default: 0.15) */
  grainAmount?: number;
  /** Color vibrancy & contrast multiplier (default: 1.2) */
  contrast?: number;
  /** Field rotation angle in degrees (default: 0) */
  rotationAngle?: number;
  /** Dark corner vignette strength (0.0 to 1.0, auto-adapts by theme if undefined) */
  vignetteStrength?: number;
  /** Overall opacity (0.0 to 1.0, default: 1.0) */
  opacity?: number;
  /** Array of up to 4 HEX color strings for custom palette */
  colors?: string[];
  /** Individual HEX color overrides */
  primaryColor?: string;
  secondaryColor?: string;
  tertiaryColor?: string;
  highlightColor?: string;
  /** Whether the wave shader responds to cursor movement (default: true) */
  interactive?: boolean;
}

/** Variant Color Palettes for Light and Dark Modes */
const VARIANT_PALETTES: Record<
  Exclude<GrainVariant, "custom">,
  {
    light: [string, string, string, string]; // [primary, secondary, tertiary, highlight]
    dark: [string, string, string, string];
  }
> = {
  ocean: {
    light: ["#0284c7", "#06b6d4", "#f0f9ff", "#ffffff"],
    dark: ["#38bdf8", "#0284c7", "#031221", "#bae6fd"],
  },
  violet: {
    light: ["#5227ff", "#9333ea", "#f5f3ff", "#ffffff"],
    dark: ["#ffffff", "#5227ff", "#0a0a0f", "#a289ff"],
  },
  cyberpunk: {
    light: ["#06b6d4", "#d946ef", "#fdf4ff", "#ffffff"],
    dark: ["#00f5ff", "#ff007f", "#09090e", "#ffe600"],
  },
  emerald: {
    light: ["#059669", "#10b981", "#f0fdf4", "#ffffff"],
    dark: ["#34d399", "#059669", "#04140d", "#a7f3d0"],
  },
  solar: {
    light: ["#ea580c", "#f59e0b", "#fffbeb", "#ffffff"],
    dark: ["#fde047", "#f97316", "#140702", "#fed7aa"],
  },
  monochrome: {
    light: ["#1e293b", "#64748b", "#f8fafc", "#ffffff"],
    dark: ["#ffffff", "#71717a", "#09090b", "#d4d4d8"],
  },
  sunset: {
    light: ["#e11d48", "#f97316", "#fff1f2", "#ffffff"],
    dark: ["#fb7185", "#e11d48", "#18040a", "#fecdd3"],
  },
  matrix: {
    light: ["#16a34a", "#22c55e", "#f0fdf4", "#ffffff"],
    dark: ["#4ade80", "#16a34a", "#021206", "#86efac"],
  },
};

/** Converts HEX color string ("#5227FF") to RGB float array ([0.32, 0.15, 1.0]) */
function hexToRgb(hex: string): [number, number, number] {
  let c = hex.replace("#", "").trim();
  if (c.length === 3) {
    c = c.split("").map((x) => x + x).join("");
  }
  const num = parseInt(c, 16);
  if (isNaN(num)) return [1, 1, 1];
  return [((num >> 16) & 255) / 255, ((num >> 8) & 255) / 255, (num & 255) / 255];
}

const VERTEX_SHADER = `
attribute vec2 position;
void main() {
    gl_Position = vec4(position, 0.0, 1.0);
}
`;

const FRAGMENT_SHADER = `
precision highp float;
uniform vec2 u_resolution;
uniform float u_time;
uniform vec2 u_mouse;
uniform float u_speed;
uniform float u_intensity;
uniform float u_scale;
uniform float u_downScale;
uniform float u_contrast;
uniform float u_grain;
uniform float u_vignette;
uniform float u_angle;
uniform float u_opacity;
uniform int u_ditherStyle;
uniform vec3 u_primaryColor;
uniform vec3 u_secondaryColor;
uniform vec3 u_tertiaryColor;
uniform vec3 u_highlightColor;

// Procedural Hash (#) Weave Dithering Matrix
// Generates intersecting vertical and horizontal lines forming sharp '#' lattice crosshatching
float hashGridDither(vec2 uv) {
    int x = int(mod(uv.x, 4.0));
    int y = int(mod(uv.y, 4.0));
    
    // Check if on horizontal line (y=1 or y=3) or vertical line (x=1 or x=3)
    bool isVert = (x == 1 || x == 3);
    bool isHoriz = (y == 1 || y == 3);
    
    // Intersection points of the '#' grid (4 intersection nodes)
    if (isVert && isHoriz) {
        int idx = (x == 1 ? 0 : 1) + (y == 1 ? 0 : 2);
        if (idx == 0) return 0.00;
        if (idx == 1) return 0.08;
        if (idx == 2) return 0.16;
        return 0.24;
    }
    
    // Vertical line segments connecting the '#'
    if (isVert) {
        int idx = (x == 1 ? 0 : 1) + (y == 0 ? 0 : 2);
        if (idx == 0) return 0.32;
        if (idx == 1) return 0.40;
        if (idx == 2) return 0.48;
        return 0.56;
    }
    
    // Horizontal line segments connecting the '#'
    if (isHoriz) {
        int idx = (x == 0 ? 0 : 1) + (y == 1 ? 0 : 2);
        if (idx == 0) return 0.36;
        if (idx == 1) return 0.44;
        if (idx == 2) return 0.52;
        return 0.60;
    }
    
    // Outer open spaces surrounding the '#' grid
    int idx = (x == 0 ? 0 : 1) + (y == 0 ? 0 : 2);
    if (idx == 0) return 0.76;
    if (idx == 1) return 0.84;
    if (idx == 2) return 0.92;
    return 0.98;
}

// Procedural Continuous Crosshatch Weave Matrix
float crosshatchDither(vec2 uv) {
    int x = int(mod(uv.x, 4.0));
    int y = int(mod(uv.y, 4.0));
    if ((x == 1 || x == 3) && (y == 1 || y == 3)) return 0.05;
    if (x == 1 || x == 3) return 0.35;
    if (y == 1 || y == 3) return 0.55;
    return 0.90;
}

// 4x4 Standard Bayer Dithering Matrix
float bayer4x4(vec2 uv) {
    int x = int(mod(uv.x, 4.0));
    int y = int(mod(uv.y, 4.0));
    int index = x + y * 4;
    
    if (index == 0) return 0.0 / 16.0;
    if (index == 1) return 8.0 / 16.0;
    if (index == 2) return 2.0 / 16.0;
    if (index == 3) return 10.0 / 16.0;
    if (index == 4) return 12.0 / 16.0;
    if (index == 5) return 4.0 / 16.0;
    if (index == 6) return 14.0 / 16.0;
    if (index == 7) return 6.0 / 16.0;
    if (index == 8) return 3.0 / 16.0;
    if (index == 9) return 11.0 / 16.0;
    if (index == 10) return 1.0 / 16.0;
    if (index == 11) return 9.0 / 16.0;
    if (index == 12) return 15.0 / 16.0;
    if (index == 13) return 7.0 / 16.0;
    if (index == 14) return 13.0 / 16.0;
    return 5.0 / 16.0;
}

// Pseudo-random noise hash
float hash1(vec2 p) {
    return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
}

void main() {
    vec2 res = max(u_resolution, vec2(1.0));
    vec2 fc = gl_FragCoord.xy;
    vec2 st = (fc - 0.5 * res) / min(res.x, res.y);
    
    // Rotation transformation
    float rad = u_angle * (3.14159265 / 180.0);
    mat2 rot = mat2(cos(rad), -sin(rad), sin(rad), cos(rad));
    st = rot * st;

    // Interactive mouse warp displacement
    vec2 mouseST = (u_mouse - vec2(0.5, 0.5)) * vec2(res.x / min(res.x, res.y), res.y / min(res.x, res.y));
    mouseST = rot * mouseST;
    float mouseDist = length(st - mouseST);
    float mouseInfluence = smoothstep(0.9, 0.0, mouseDist);
    vec2 mouseWarp = (st - mouseST) * mouseInfluence * 0.35;

    vec2 p = (st + mouseWarp) * (u_scale * 0.85);
    float t = u_time * u_speed * 0.45;
    
    // Multi-Harmonic Wave & Domain Warping
    float wave1 = sin(p.x * 2.0 + t) * cos(p.y * 2.0 + t);
    float wave2 = sin(p.x * 3.0 - t * 0.85 + wave1 * u_intensity);
    float wave3 = cos(p.y * 4.0 + t * 0.6 + wave2 * u_intensity);
    float wave4 = sin((p.x + p.y) * 2.5 + t * 0.4 + wave3 * (u_intensity * 0.5));
    
    float wavePattern = clamp((wave1 + wave2 + wave3 + wave4) * 0.25 + 0.5, 0.0, 1.0);
    wavePattern = pow(wavePattern, 1.0 / max(0.2, u_contrast));

    // Pixel Dithering via Hash (#) or Crosshatch Matrix lookup
    float pixelSize = max(1.0, 1.0 / max(0.05, u_downScale));
    vec2 pixelCoord = floor(fc / pixelSize);
    
    float ditherThreshold;
    if (u_ditherStyle == 0) {
        ditherThreshold = hashGridDither(pixelCoord);
    } else if (u_ditherStyle == 1) {
        ditherThreshold = crosshatchDither(pixelCoord);
    } else {
        ditherThreshold = bayer4x4(pixelCoord);
    }
    
    // Dither step thresholding
    float dithered = step(ditherThreshold, wavePattern);

    // Multi-stop harmonic gradient blend
    vec3 grad = mix(u_tertiaryColor, u_secondaryColor, smoothstep(0.05, 0.65, wavePattern));
    grad = mix(grad, u_primaryColor, smoothstep(0.40, 0.88, wavePattern));
    grad = mix(grad, u_highlightColor, smoothstep(0.85, 1.00, wavePattern));
    
    vec3 finalColor = mix(u_tertiaryColor, grad, dithered);

    // Subtle edge vignette
    float d = length(st * vec2(0.8, 0.55));
    finalColor *= mix(1.0, 1.0 - smoothstep(0.2, 1.4, d), clamp(u_vignette, 0.0, 1.0));

    // Subtle analog grain layer
    float grain = hash1(floor(fc * 1.5) + fract(u_time));
    finalColor += (grain - 0.5) * clamp(u_grain, 0.0, 1.0) * 0.25;

    gl_FragColor = vec4(clamp(finalColor, 0.0, 1.0), u_opacity);
}
`;

/**
 * AnimatedGrain
 *
 * A high-performance WebGL procedural Hash (#) dither wave background component.
 * Features customizable '#' hash lattice weave dithering, domain warping, dynamic cursor interaction, and light/dark themes.
 */
export function AnimatedGrain({
  className,
  children,
  variant = "ocean",
  ditherPattern = "hash",
  speed = 1.0,
  scale = 3.5,
  intensity = 2.2,
  ditherScale = 0.6,
  grainAmount = 0.15,
  contrast = 1.2,
  rotationAngle = 0,
  vignetteStrength,
  opacity = 1.0,
  colors,
  primaryColor,
  secondaryColor,
  tertiaryColor,
  highlightColor,
  interactive = true,
}: AnimatedGrainProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: 0.5, y: 0.5, targetX: 0.5, targetY: 0.5 });
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
  const selectedPalette = VARIANT_PALETTES[variant === "custom" ? "ocean" : variant][paletteKey];

  const activePrimary = primaryColor ?? colors?.[0] ?? selectedPalette[0];
  const activeSecondary = secondaryColor ?? colors?.[1] ?? selectedPalette[1];
  const activeTertiary = tertiaryColor ?? colors?.[2] ?? selectedPalette[2];
  const activeHighlight = highlightColor ?? colors?.[3] ?? selectedPalette[3];

  const activeVignette = vignetteStrength ?? (mounted && isLightMode ? 0.0 : 0.4);

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
        console.warn("[AnimatedGrain] Shader error:", gl.getShaderInfoLog(shader));
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
      console.warn("[AnimatedGrain] Program link error:", gl.getProgramInfoLog(program));
      return;
    }

    gl.useProgram(program);

    // Fullscreen Quad
    const quad = new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]);
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, quad, gl.STATIC_DRAW);

    const posAttr = gl.getAttribLocation(program, "position");
    gl.enableVertexAttribArray(posAttr);
    gl.vertexAttribPointer(posAttr, 2, gl.FLOAT, false, 0, 0);

    const uniforms = {
      resolution: gl.getUniformLocation(program, "u_resolution"),
      time: gl.getUniformLocation(program, "u_time"),
      mouse: gl.getUniformLocation(program, "u_mouse"),
      speed: gl.getUniformLocation(program, "u_speed"),
      intensity: gl.getUniformLocation(program, "u_intensity"),
      scale: gl.getUniformLocation(program, "u_scale"),
      downScale: gl.getUniformLocation(program, "u_downScale"),
      contrast: gl.getUniformLocation(program, "u_contrast"),
      grain: gl.getUniformLocation(program, "u_grain"),
      vignette: gl.getUniformLocation(program, "u_vignette"),
      angle: gl.getUniformLocation(program, "u_angle"),
      opacity: gl.getUniformLocation(program, "u_opacity"),
      ditherStyle: gl.getUniformLocation(program, "u_ditherStyle"),
      primaryColor: gl.getUniformLocation(program, "u_primaryColor"),
      secondaryColor: gl.getUniformLocation(program, "u_secondaryColor"),
      tertiaryColor: gl.getUniformLocation(program, "u_tertiaryColor"),
      highlightColor: gl.getUniformLocation(program, "u_highlightColor"),
    };

    let animationFrameId: number;
    const startTime = performance.now();

    const render = (now: number) => {
      if (!canvas || !gl) return;

      const dpr = Math.min(typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1, 2);
      const displayWidth = Math.floor(canvas.clientWidth * dpr);
      const displayHeight = Math.floor(canvas.clientHeight * dpr);

      if (canvas.width !== displayWidth || canvas.height !== displayHeight) {
        canvas.width = displayWidth;
        canvas.height = displayHeight;
        gl.viewport(0, 0, displayWidth, displayHeight);
      }

      // Smooth mouse lerp
      if (interactive) {
        mouseRef.current.x += (mouseRef.current.targetX - mouseRef.current.x) * 0.06;
        mouseRef.current.y += (mouseRef.current.targetY - mouseRef.current.y) * 0.06;
      }

      const pCol = hexToRgb(activePrimary);
      const sCol = hexToRgb(activeSecondary);
      const tCol = hexToRgb(activeTertiary);
      const hCol = hexToRgb(activeHighlight);

      const styleIndex = ditherPattern === "crosshatch" ? 1 : ditherPattern === "bayer" ? 2 : 0;

      gl.uniform2f(uniforms.resolution, canvas.width, canvas.height);
      gl.uniform1f(uniforms.time, (now - startTime) * 0.001);
      gl.uniform2f(uniforms.mouse, mouseRef.current.x, mouseRef.current.y);
      gl.uniform1f(uniforms.speed, speed);
      gl.uniform1f(uniforms.intensity, intensity);
      gl.uniform1f(uniforms.scale, scale);
      gl.uniform1f(uniforms.downScale, ditherScale);
      gl.uniform1f(uniforms.contrast, contrast);
      gl.uniform1f(uniforms.grain, grainAmount);
      gl.uniform1f(uniforms.vignette, activeVignette);
      gl.uniform1f(uniforms.angle, rotationAngle);
      gl.uniform1f(uniforms.opacity, opacity);
      gl.uniform1i(uniforms.ditherStyle, styleIndex);

      gl.uniform3f(uniforms.primaryColor, pCol[0], pCol[1], pCol[2]);
      gl.uniform3f(uniforms.secondaryColor, sCol[0], sCol[1], sCol[2]);
      gl.uniform3f(uniforms.tertiaryColor, tCol[0], tCol[1], tCol[2]);
      gl.uniform3f(uniforms.highlightColor, hCol[0], hCol[1], hCol[2]);

      gl.drawArrays(gl.TRIANGLES, 0, 6);
      animationFrameId = requestAnimationFrame(render);
    };

    animationFrameId = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(animationFrameId);
      if (gl) {
        gl.deleteProgram(program);
        gl.deleteShader(vert);
        gl.deleteShader(frag);
        gl.deleteBuffer(buffer);
      }
    };
  }, [
    activePrimary,
    activeSecondary,
    activeTertiary,
    activeHighlight,
    ditherPattern,
    speed,
    scale,
    intensity,
    ditherScale,
    grainAmount,
    contrast,
    rotationAngle,
    activeVignette,
    opacity,
    interactive,
  ]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!interactive || !canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = 1.0 - (e.clientY - rect.top) / rect.height;
    mouseRef.current.targetX = Math.max(0, Math.min(1, x));
    mouseRef.current.targetY = Math.max(0, Math.min(1, y));
  };

  const handleMouseLeave = () => {
    if (!interactive) return;
    mouseRef.current.targetX = 0.5;
    mouseRef.current.targetY = 0.5;
  };

  return (
    <div
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={cn("relative w-full h-full overflow-hidden", className)}
    >
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full block pointer-events-none"
      />
      {children && <div className="relative z-10 w-full h-full">{children}</div>}
    </div>
  );
}

export default AnimatedGrain;
