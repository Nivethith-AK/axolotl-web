"use client";

import React, { useEffect, useRef, useState } from "react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";

export type FlowVariant =
  | "blue"
  | "purple"
  | "emerald"
  | "solar"
  | "aurora"
  | "monochrome"
  | "custom"
  | "silk"
  | "abyss";

export interface AnimatedFlowProps {
  className?: string;
  children?: React.ReactNode;
  /** Preset theme variant ("blue" | "purple" | "emerald" | "solar" | "aurora" | "monochrome" | "custom") */
  variant?: FlowVariant;
  /** Explicit theme override ("light" | "dark" | "auto") */
  theme?: "light" | "dark" | "auto";
  /** Explicit dark mode indicator boolean */
  isDark?: boolean;
  /** Velocity speed multiplier for fluid motion (default: 1.0) */
  flowSpeed?: number;
  /** Noise density zoom scale (default: 1.15) */
  zoomScale?: number;
  /** Fluid domain warping intensity (default: 2.6) */
  distortionWarp?: number;
  /** Color vibrancy & contrast multiplier (default: 1.35) */
  colorContrast?: number;
  /** Analog film grain noise opacity (0.0 to 1.0, default: 0.35) */
  filmGrain?: number;
  /** Corner dark vignette strength (0.0 to 1.0, auto-adapts by theme if undefined) */
  vignetteStrength?: number;
  /** Rotation angle of the fluid field in degrees (default: 0) */
  rotationAngle?: number;
  /** Array of up to 5 HEX color strings for custom palette */
  colors?: string[];
  /** Individual HEX color stop overrides */
  color1?: string;
  color2?: string;
  color3?: string;
  color4?: string;
  color5?: string;
  /** Whether the fluid responds to cursor movement (default: true) */
  interactive?: boolean;
}

/** Variant Color Palettes for Light and Dark Modes */
const VARIANT_PALETTES: Record<
  Exclude<FlowVariant, "custom">,
  { light: [string, string, string, string, string]; dark: [string, string, string, string, string] }
> = {
  blue: {
    light: ["#ffffff", "#e0f2fe", "#38bdf8", "#0284c7", "#1d4ed8"],
    dark: ["#000000", "#031738", "#0055ff", "#00b4d8", "#7dd3fc"],
  },
  abyss: {
    light: ["#ffffff", "#e0f2fe", "#38bdf8", "#0284c7", "#1d4ed8"],
    dark: ["#000000", "#031738", "#0055ff", "#00b4d8", "#7dd3fc"],
  },
  purple: {
    light: ["#ffffff", "#fdf2f8", "#f43f5e", "#c026d3", "#6b21a8"],
    dark: ["#000000", "#1e0038", "#7b2cbf", "#ff007f", "#f472b6"],
  },
  silk: {
    light: ["#ffffff", "#fdf2f8", "#f43f5e", "#c026d3", "#6b21a8"],
    dark: ["#000000", "#1e0038", "#7b2cbf", "#ff007f", "#f472b6"],
  },
  emerald: {
    light: ["#ffffff", "#f0fdf4", "#34d399", "#059669", "#064e3b"],
    dark: ["#000000", "#02261b", "#10b981", "#06b6d4", "#6ee7b7"],
  },
  solar: {
    light: ["#ffffff", "#fff7ed", "#fb923c", "#ea580c", "#9a3412"],
    dark: ["#000000", "#240a02", "#c2410c", "#f97316", "#fde047"],
  },
  aurora: {
    light: ["#ffffff", "#f0fdfa", "#2dd4bf", "#6366f1", "#4338ca"],
    dark: ["#000000", "#022424", "#0d9488", "#8b5cf6", "#a7f3d0"],
  },
  monochrome: {
    light: ["#ffffff", "#f1f5f9", "#94a3b8", "#475569", "#0f172a"],
    dark: ["#000000", "#121215", "#3f3f46", "#71717a", "#e4e4e7"],
  },
};

/** Converts HEX color string ("#0047ff") to RGB float array ([0, 0.278, 1]) */
function hexToRgb(hex: string): [number, number, number] {
  let c = hex.replace("#", "").trim();
  if (c.length === 3) {
    c = c.split("").map((x) => x + x).join("");
  }
  const num = parseInt(c, 16);
  if (isNaN(num)) return [0, 0, 0];
  return [(num >> 16 & 255) / 255, (num >> 8 & 255) / 255, (num & 255) / 255];
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
uniform float u_scale;
uniform float u_warp;
uniform float u_contrast;
uniform float u_grain;
uniform float u_vignette;
uniform float u_angle;
uniform vec3 u_color1;
uniform vec3 u_color2;
uniform vec3 u_color3;
uniform vec3 u_color4;
uniform vec3 u_color5;

vec2 wp_hash2(vec2 p) {
    p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3)));
    return fract(sin(p) * 43758.5453) * 2.0 - 1.0;
}

float wp_hash1(vec2 p) {
    return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453);
}

float wp_noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(
        mix(dot(wp_hash2(i), f), 
            dot(wp_hash2(i + vec2(1.0, 0.0)), f - vec2(1.0, 0.0)), u.x), 
        mix(dot(wp_hash2(i + vec2(0.0, 1.0)), f - vec2(0.0, 1.0)), 
            dot(wp_hash2(i + vec2(1.0, 1.0)), f - vec2(1.0, 1.0)), u.x), 
        u.y);
}

float wp_fbm(vec2 p) {
    float a = 0.55;
    float s = 0.0;
    for (int i = 0; i < 4; i++) {
        s += a * wp_noise(p);
        p *= 2.05;
        a *= 0.45;
    }
    return s;
}

vec3 wp_pal(float t, vec3 c0, vec3 c1, vec3 c2, vec3 c3, vec3 c4) {
    t = clamp(t, 0.0, 1.0);
    vec3 c = mix(c0, c1, smoothstep(0.00, 0.35, t));
    c = mix(c, c2, smoothstep(0.30, 0.65, t));
    c = mix(c, c3, smoothstep(0.60, 0.88, t));
    c = mix(c, c4, smoothstep(0.85, 1.00, t));
    return c;
}

void main() {
    vec2 res = max(u_resolution, vec2(1.0));
    vec2 fc = vec2(gl_FragCoord.x, gl_FragCoord.y);
    vec2 uv = (fc - 0.5 * res) / res.y;

    float rad = u_angle * (3.14159265 / 180.0);
    mat2 rot = mat2(cos(rad), -sin(rad), sin(rad), cos(rad));
    uv = rot * uv;

    float sc = u_scale * 0.82;
    float wa = u_warp * 0.75;
    
    // Dynamic Mouse Warp Interaction across canvas
    vec2 mouseUV = (u_mouse - vec2(0.5, 0.5)) * vec2(res.x / res.y, 1.0);
    mouseUV = rot * mouseUV;
    float mouseDist = length(uv - mouseUV);
    float mouseInfluence = smoothstep(0.85, 0.0, mouseDist);
    vec2 mouseWarp = (uv - mouseUV) * mouseInfluence * 0.45;

    // Full-canvas interactive fluid coordinate
    vec2 uvw = uv + mouseWarp + (u_mouse - vec2(0.5, 0.5)) * 0.4;
    
    float ts = u_time * 0.45;
    uvw += 0.07 * vec2(sin(ts + uv.y * 3.8 + uv.x * 2.1), cos(ts * 0.8 + uv.x * 3.8 - uv.y * 2.1));

    vec2 p = uvw * sc + vec2(15.4, 11.2);

    vec2 q = vec2(wp_fbm(p + vec2(0.0, 0.0)), wp_fbm(p + vec2(5.2, 1.3)));
    vec2 r = vec2(wp_fbm(p + wa * q + vec2(1.7, 9.2)), wp_fbm(p + wa * q + vec2(8.3, 2.8)));
    float f = wp_fbm(p + wa * r);

    float t = 0.42 + f * u_contrast * 1.85;
    float k = t - 0.78;
    if (k > 0.0) { t = 0.78 + k / (1.0 + k * 1.6); }
    t = pow(clamp(t, 0.0, 1.0), 1.15);

    vec3 col = wp_pal(t, u_color1, u_color2, u_color3, u_color4, u_color5);

    float d = length(uv * vec2(0.78, 0.52));
    col *= mix(1.0, 1.0 - smoothstep(0.1, 1.25, d), clamp(u_vignette, 0.0, 1.0));

    float gs = 1500.0 / res.y;
    float g = wp_hash1(floor(fc * gs) + 37.0);
    col += (g - 0.5) * clamp(u_grain, 0.0, 1.0) * 0.34 * (0.22 + dot(col, vec3(0.333)));

    gl_FragColor = vec4(max(col, vec3(0.0)), 1.0);
}
`;

/**
 * AnimatedFlow
 *
 * A high-performance WebGL domain-warping fluid gradient background component.
 * Features customizable color variants, film grain, noise scale, domain warping, rotation, and light/dark theme switching.
 */
export function AnimatedFlow({
  className,
  children,
  variant = "blue",
  theme: propTheme,
  isDark: propIsDark,
  flowSpeed = 1.0,
  zoomScale = 1.15,
  distortionWarp = 2.6,
  colorContrast = 1.35,
  filmGrain = 0.35,
  vignetteStrength,
  rotationAngle = 0,
  colors,
  color1,
  color2,
  color3,
  color4,
  color5,
  interactive = true,
}: AnimatedFlowProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: 0.5, y: 0.5, targetX: 0.5, targetY: 0.5 });
  
  // Safe useTheme call (works with or without next-themes ThemeProvider)
  let resolvedTheme: string | undefined;
  let nextTheme: string | undefined;
  try {
    const context = useTheme();
    resolvedTheme = context.resolvedTheme;
    nextTheme = context.theme;
  } catch {
    // ignore if next-themes is not provided
  }

  const [mounted, setMounted] = useState(false);

  const checkIsLight = React.useCallback((): boolean => {
    // 1. Explicit boolean prop override
    if (typeof propIsDark === "boolean") {
      return !propIsDark;
    }
    // 2. Explicit theme prop override
    if (propTheme === "light") return true;
    if (propTheme === "dark") return false;

    // 3. DocumentElement classes (standard Tailwind class strategy)
    if (typeof document !== "undefined") {
      const cl = document.documentElement.classList;
      if (cl.contains("dark")) return false;
      if (cl.contains("light")) return true;

      // Check data-theme or data-mode attribute
      const dt = document.documentElement.getAttribute("data-theme") || document.documentElement.getAttribute("data-mode");
      if (dt === "dark") return false;
      if (dt === "light") return true;
    }

    // 4. next-themes context
    if (resolvedTheme === "dark" || nextTheme === "dark") return false;
    if (resolvedTheme === "light" || nextTheme === "light") return true;

    // 5. localStorage check
    if (typeof window !== "undefined" && window.localStorage) {
      try {
        const saved = localStorage.getItem("theme");
        if (saved === "dark") return false;
        if (saved === "light") return true;
      } catch {
        // ignore storage errors
      }
    }

    // 6. In Tailwind class-based mode, lack of "dark" on <html> means light mode
    if (typeof document !== "undefined") {
      return !document.documentElement.classList.contains("dark");
    }

    // 7. System preference fallback
    if (typeof window !== "undefined" && window.matchMedia) {
      return !window.matchMedia("(prefers-color-scheme: dark)").matches;
    }
    return false;
  }, [propTheme, propIsDark, resolvedTheme, nextTheme]);

  const [isLightMode, setIsLightMode] = useState<boolean>(() => {
    if (typeof propIsDark === "boolean") return !propIsDark;
    if (propTheme === "light") return true;
    if (propTheme === "dark") return false;
    if (typeof document !== "undefined") {
      if (document.documentElement.classList.contains("dark")) return false;
      if (document.documentElement.classList.contains("light")) return true;
      return !document.documentElement.classList.contains("dark");
    }
    return false;
  });

  useEffect(() => {
    setMounted(true);
    setIsLightMode(checkIsLight());

    if (typeof document !== "undefined") {
      const observer = new MutationObserver(() => {
        setIsLightMode(checkIsLight());
      });
      observer.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ["class", "data-theme", "data-mode"],
      });

      const handleStorage = (e: StorageEvent) => {
        if (e.key === "theme") {
          setIsLightMode(checkIsLight());
        }
      };
      window.addEventListener("storage", handleStorage);

      return () => {
        observer.disconnect();
        window.removeEventListener("storage", handleStorage);
      };
    }
  }, [checkIsLight]);

  const paletteKey = mounted && isLightMode ? "light" : "dark";

  // Resolve palette preset or custom overrides
  const selectedPalette = VARIANT_PALETTES[variant === "custom" ? "blue" : variant][paletteKey];

  const activeColor1 = color1 ?? colors?.[0] ?? selectedPalette[0];
  const activeColor2 = color2 ?? colors?.[1] ?? selectedPalette[1];
  const activeColor3 = color3 ?? colors?.[2] ?? selectedPalette[2];
  const activeColor4 = color4 ?? colors?.[3] ?? selectedPalette[3];
  const activeColor5 = color5 ?? colors?.[4] ?? selectedPalette[4];

  // Default vignette adapts by theme (no dark vignette in light mode)
  const activeVignette = vignetteStrength ?? (mounted && isLightMode ? 0.0 : 0.45);

  // Synchronize mutable parameters ref for 60fps zero-tear uniform updates
  const propsRef = useRef({
    flowSpeed,
    zoomScale,
    distortionWarp,
    colorContrast,
    filmGrain,
    activeVignette,
    rotationAngle,
    activeColor1,
    activeColor2,
    activeColor3,
    activeColor4,
    activeColor5,
    interactive,
  });

  propsRef.current = {
    flowSpeed,
    zoomScale,
    distortionWarp,
    colorContrast,
    filmGrain,
    activeVignette,
    rotationAngle,
    activeColor1,
    activeColor2,
    activeColor3,
    activeColor4,
    activeColor5,
    interactive,
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext("webgl") || (canvas.getContext("experimental-webgl") as WebGLRenderingContext | null);
    if (!gl) return;

    const createShader = (glCtx: WebGLRenderingContext, type: number, source: string) => {
      const shader = glCtx.createShader(type);
      if (!shader) return null;
      glCtx.shaderSource(shader, source);
      glCtx.compileShader(shader);
      if (!glCtx.getShaderParameter(shader, glCtx.COMPILE_STATUS)) {
        console.error("Shader compile error:", glCtx.getShaderInfoLog(shader));
        glCtx.deleteShader(shader);
        return null;
      }
      return shader;
    };

    const vertShader = createShader(gl, gl.VERTEX_SHADER, VERTEX_SHADER);
    const fragShader = createShader(gl, gl.FRAGMENT_SHADER, FRAGMENT_SHADER);
    if (!vertShader || !fragShader) return;

    const program = gl.createProgram();
    if (!program) return;
    gl.attachShader(program, vertShader);
    gl.attachShader(program, fragShader);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error("Program link error:", gl.getProgramInfoLog(program));
      return;
    }

    gl.useProgram(program);

    // Quad geometry
    const positionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]),
      gl.STATIC_DRAW
    );

    const posAttrib = gl.getAttribLocation(program, "position");
    gl.enableVertexAttribArray(posAttrib);
    gl.vertexAttribPointer(posAttrib, 2, gl.FLOAT, false, 0, 0);

    // Uniform locations
    const uResolution = gl.getUniformLocation(program, "u_resolution");
    const uTime = gl.getUniformLocation(program, "u_time");
    const uMouse = gl.getUniformLocation(program, "u_mouse");
    const uScale = gl.getUniformLocation(program, "u_scale");
    const uWarp = gl.getUniformLocation(program, "u_warp");
    const uContrast = gl.getUniformLocation(program, "u_contrast");
    const uGrain = gl.getUniformLocation(program, "u_grain");
    const uVignette = gl.getUniformLocation(program, "u_vignette");
    const uAngle = gl.getUniformLocation(program, "u_angle");
    const uColor1 = gl.getUniformLocation(program, "u_color1");
    const uColor2 = gl.getUniformLocation(program, "u_color2");
    const uColor3 = gl.getUniformLocation(program, "u_color3");
    const uColor4 = gl.getUniformLocation(program, "u_color4");
    const uColor5 = gl.getUniformLocation(program, "u_color5");

    let animId = 0;
    let isVisible = true;
    let startTime = performance.now();
    let cachedRect = canvas.getBoundingClientRect();

    const resize = () => {
      // Cap DPR to 1.25 for massive GPU performance boost on Retina/4K displays
      const dpr = Math.min(window.devicePixelRatio || 1, 1.25);
      const width = Math.floor(canvas.clientWidth * dpr);
      const height = Math.floor(canvas.clientHeight * dpr);
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
        gl.viewport(0, 0, width, height);
      }
      cachedRect = canvas.getBoundingClientRect();
    };

    const handlePointerMove = (e: MouseEvent | TouchEvent) => {
      if (!propsRef.current.interactive || !isVisible) return;
      const clientX = "touches" in e ? e.touches[0]?.clientX ?? 0 : e.clientX;
      const clientY = "touches" in e ? e.touches[0]?.clientY ?? 0 : e.clientY;
      const w = cachedRect.width || canvas.clientWidth || 1;
      const h = cachedRect.height || canvas.clientHeight || 1;
      const x = Math.max(0, Math.min(1, (clientX - cachedRect.left) / w));
      const y = Math.max(0, Math.min(1, 1.0 - (clientY - cachedRect.top) / h));
      mouseRef.current.targetX = x;
      mouseRef.current.targetY = y;
    };

    window.addEventListener("resize", resize, { passive: true });
    window.addEventListener("mousemove", handlePointerMove, { passive: true });
    window.addEventListener("touchmove", handlePointerMove, { passive: true });
    resize();

    const render = (now: number) => {
      if (!isVisible) {
        animId = 0;
        return;
      }

      const p = propsRef.current;
      const elapsedTime = (now - startTime) * 0.001 * p.flowSpeed;

      // Smooth mouse lerp with high responsiveness
      mouseRef.current.x += (mouseRef.current.targetX - mouseRef.current.x) * 0.08;
      mouseRef.current.y += (mouseRef.current.targetY - mouseRef.current.y) * 0.08;

      gl.useProgram(program);
      gl.uniform2f(uResolution, canvas.width, canvas.height);
      gl.uniform1f(uTime, elapsedTime);
      gl.uniform2f(uMouse, mouseRef.current.x, mouseRef.current.y);
      gl.uniform1f(uScale, p.zoomScale);
      gl.uniform1f(uWarp, p.distortionWarp);
      gl.uniform1f(uContrast, p.colorContrast);
      gl.uniform1f(uGrain, p.filmGrain);
      gl.uniform1f(uVignette, p.activeVignette);
      gl.uniform1f(uAngle, p.rotationAngle);

      const c1 = hexToRgb(p.activeColor1);
      const c2 = hexToRgb(p.activeColor2);
      const c3 = hexToRgb(p.activeColor3);
      const c4 = hexToRgb(p.activeColor4);
      const c5 = hexToRgb(p.activeColor5);

      gl.uniform3f(uColor1, c1[0], c1[1], c1[2]);
      gl.uniform3f(uColor2, c2[0], c2[1], c2[2]);
      gl.uniform3f(uColor3, c3[0], c3[1], c3[2]);
      gl.uniform3f(uColor4, c4[0], c4[1], c4[2]);
      gl.uniform3f(uColor5, c5[0], c5[1], c5[2]);

      gl.drawArrays(gl.TRIANGLES, 0, 6);
      animId = requestAnimationFrame(render);
    };

    // Pause WebGL rendering loop when hero is scrolled out of view
    const observer = new IntersectionObserver(
      ([entry]) => {
        isVisible = entry.isIntersecting;
        if (isVisible) {
          cachedRect = canvas.getBoundingClientRect();
          if (!animId) {
            animId = requestAnimationFrame(render);
          }
        } else if (animId) {
          cancelAnimationFrame(animId);
          animId = 0;
        }
      },
      { threshold: 0.01 }
    );
    observer.observe(canvas);

    animId = requestAnimationFrame(render);

    return () => {
      observer.disconnect();
      if (animId) cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", handlePointerMove);
      window.removeEventListener("touchmove", handlePointerMove);
      gl.deleteBuffer(positionBuffer);
      gl.deleteProgram(program);
      gl.deleteShader(vertShader);
      gl.deleteShader(fragShader);
    };
  }, []);

  return (
    <div
      className={cn(
        "relative w-full h-full min-h-[400px] overflow-hidden bg-white dark:bg-black text-slate-900 dark:text-white transition-colors duration-300",
        className
      )}
    >
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none z-0" />
      {children && <div className="relative z-10 w-full h-full">{children}</div>}
    </div>
  );
}

export default AnimatedFlow;
