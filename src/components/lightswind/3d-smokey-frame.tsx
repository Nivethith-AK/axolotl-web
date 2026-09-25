"use client";

import React, { useRef, useEffect, useCallback, PropsWithChildren, CSSProperties, forwardRef, useImperativeHandle } from "react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";

export interface ThreeDSmokeyFrameProps extends PropsWithChildren {
    /** Color of the animated smokey frame (Hex or RGB/RGBA, default: "#00F5FF" Cosmic Cyan) */
    frameColor?: string;
    /** Background interior base color (used when transparentBg is false) */
    frameBgColor?: string;
    /** Whether the interior background is completely transparent (default: true) */
    transparentBg?: boolean;
    /** Normalized frame width from edge toward center (0.01 - 0.50, default: 0.30) */
    frameWidth?: number;
    /** Animation wave and smoke propagation speed multiplier (default: 0.15) */
    speed?: number;
    /** Edge falloff curve exponent (higher values make the frame edge sharper, default: 6.0) */
    falloff?: number;
    /** Granularity and density of the procedural noise smoke (default: 3.0) */
    noiseScale?: number;
    /** Amount of noise turbulence modulating the frame (0.0 - 1.0, default: 1.0) */
    noiseStrength?: number;
    /** Brightness and emission intensity of the smoke (default: 1.2) */
    intensity?: number;
    /** Gamma curve contrast adjustment (default: 2.0) */
    gamma?: number;
    /** Overall canvas opacity (0.0 - 1.0, default: 1.0) */
    opacity?: number;
    /** Whether cursor movement dynamically displaces the smokey field (default: true) */
    interactive?: boolean;
    /** Enable external atmospheric colored glow behind the frame container (default: true) */
    glow?: boolean;
    /** Blur radius for external atmospheric glow in pixels (default: 36) */
    glowBlur?: number;
    /** Opacity for external ambient glow (default: 0.45) */
    glowOpacity?: number;
    /** Border radius for the frame container (default: "16px") */
    radius?: string | number;
    /** Optional class name for the outer container */
    className?: string;
    /** Optional class name for the canvas element */
    canvasClassName?: string;
    /** Optional inline styles */
    style?: CSSProperties;
    /** Maximum device pixel ratio to use for rendering (default: 2) */
    dpr?: number;
}

export interface ThreeDSmokeyFrameHandle {
    getCanvas: () => HTMLCanvasElement | null;
    getGL: () => WebGLRenderingContext | null;
}

/** Utility to parse Hex or RGB strings to normalized [r, g, b] float vectors */
function parseColorToRgb(color: string, fallback: [number, number, number] = [0, 0.96, 1]): [number, number, number] {
    if (!color) return fallback;
    const clean = color.trim();
    if (clean.startsWith("#")) {
        let hex = clean.replace("#", "");
        if (hex.length === 3) {
            hex = hex.split("").map((c) => c + c).join("");
        }
        const num = parseInt(hex, 16);
        if (isNaN(num)) return fallback;
        return [
            ((num >> 16) & 255) / 255,
            ((num >> 8) & 255) / 255,
            (num & 255) / 255,
        ];
    }
    const match = clean.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/i);
    if (match) {
        return [
            parseInt(match[1], 10) / 255,
            parseInt(match[2], 10) / 255,
            parseInt(match[3], 10) / 255,
        ];
    }
    return fallback;
}

const VERTEX_SHADER = `
  attribute vec2 a_position;
  varying vec2 v_uv;
  void main() {
    v_uv = (a_position + 1.0) * 0.5;
    gl_Position = vec4(a_position, 0.0, 1.0);
  }
`;

const FRAGMENT_SHADER = `
  precision highp float;
  varying vec2 v_uv;

  uniform vec2 u_resolution;
  uniform float u_time;
  uniform float u_speed;
  uniform float u_frameWidth;
  uniform float u_falloff;
  uniform float u_noiseScale;
  uniform float u_noiseStrength;
  uniform float u_intensity;
  uniform float u_gamma;
  uniform float u_opacity;
  uniform vec3 u_frameColor;
  uniform vec3 u_frameBgColor;
  uniform float u_transparentBg;
  uniform vec2 u_mouse;
  uniform float u_isHovered;

  // Simplex 2D noise generator
  vec3 permute(vec3 x) { return mod(((x*34.0)+1.0)*x, 289.0); }

  float snoise(vec2 v){
    const vec4 C = vec4(0.211324865405187, 0.366025403784439,
                       -0.577350269189626, 0.024390243902439);
    vec2 i  = floor(v + dot(v, C.yy) );
    vec2 x0 = v -   i + dot(i, C.xx);
    vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
    vec4 x12 = x0.xyxy + C.xxzz;
    x12.xy -= i1;
    i = mod(i, 289.0);
    vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))
          + i.x + vec3(0.0, i1.x, 1.0 ));
    vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
    m = m*m ;
    m = m*m ;
    vec3 x = 2.0 * fract(p * C.www) - 1.0;
    vec3 h = abs(x) - 0.5;
    vec3 ox = floor(x + 0.5);
    vec3 a0 = x - ox;
    m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
    vec3 g;
    g.x  = a0.x  * x0.x  + h.x  * x0.y;
    g.yz = a0.yz * x12.xz + h.yz * x12.yw;
    return 130.0 * dot(m, g);
  }

  // 5-Octave Fractional Brownian Motion for lush smoke tendrils
  float fbm(vec2 p) {
    float total = 0.0;
    float amp = 0.5;
    float freq = 1.0;
    for(int i = 0; i < 5; i++) {
      total += snoise(p * freq) * amp;
      freq *= 2.02;
      amp *= 0.5;
    }
    return total;
  }

  void main() {
    vec2 uv = v_uv;
    float aspect = u_resolution.x / u_resolution.y;

    // Aspect ratio correction for noise sampling
    vec2 noiseUV = uv;
    if (aspect > 1.0) {
      noiseUV.x *= aspect;
    } else {
      noiseUV.y /= aspect;
    }

    // Interactive mouse turbulence displacement
    if (u_isHovered > 0.0) {
      vec2 mouseUV = u_mouse;
      if (aspect > 1.0) mouseUV.x *= aspect; else mouseUV.y /= aspect;
      float dMouse = distance(noiseUV, mouseUV);
      float mouseInfluence = smoothstep(0.6, 0.0, dMouse);
      noiseUV += (noiseUV - mouseUV) * mouseInfluence * 0.12 * u_isHovered;
    }

    // Animated volumetric noise field
    float t = u_time * u_speed;
    float noise1 = fbm(noiseUV * u_noiseScale + vec2(t * 0.45, t * 0.28));
    float noise2 = fbm(noiseUV * (u_noiseScale * 1.5) - vec2(t * 0.32, -t * 0.4));
    float combinedNoise = (noise1 * 0.65 + noise2 * 0.35 + 1.0) * 0.5;

    // Distance calculation from all 4 boundaries (0 at boundary, 0.5 at center)
    vec2 distToEdge = min(uv, 1.0 - uv);
    float minAxisDist = min(distToEdge.x, distToEdge.y);

    // Normalize distance based on the frameWidth parameter
    float frameDist = clamp(minAxisDist / max(u_frameWidth, 0.0001), 0.0, 1.0);

    // Invert so frame edge = 1.0, interior core = 0.0
    float edgeStrength = 1.0 - frameDist;
    edgeStrength = pow(edgeStrength, u_falloff);

    // Modulate edge with procedural smoke noise
    float modulatedFrame = mix(edgeStrength, edgeStrength * combinedNoise, u_noiseStrength);

    // Apply intensity multiplier and gamma curve for rich contrast
    float finalGlow = pow(modulatedFrame * u_intensity, u_gamma);
    finalGlow = clamp(finalGlow, 0.0, 1.0);

    // Render with transparent background or blended solid background
    if (u_transparentBg > 0.5) {
      float alpha = finalGlow * u_opacity;
      gl_FragColor = vec4(u_frameColor, alpha);
    } else {
      vec3 finalColor = mix(u_frameBgColor, u_frameColor, finalGlow);
      gl_FragColor = vec4(finalColor, u_opacity);
    }
  }
`;

function createShader(gl: WebGLRenderingContext, type: number, source: string): WebGLShader | null {
    const shader = gl.createShader(type);
    if (!shader) return null;
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error("Shader compile error:", gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
    }
    return shader;
}

export const ThreeDSmokeyFrame = forwardRef<ThreeDSmokeyFrameHandle, ThreeDSmokeyFrameProps>(({
    children,
    frameColor = "#00F5FF",
    frameBgColor,
    transparentBg = true,
    frameWidth = 0.30,
    speed = 0.15,
    falloff = 6.0,
    noiseScale = 3.0,
    noiseStrength = 1.0,
    intensity = 1.2,
    gamma = 2.0,
    opacity = 1.0,
    interactive = true,
    glow = true,
    glowBlur = 36,
    glowOpacity = 0.45,
    radius = "16px",
    className,
    canvasClassName,
    style,
    dpr = 2,
}, ref) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const glRef = useRef<WebGLRenderingContext | null>(null);
    const animFrameRef = useRef<number | null>(null);
    const isVisibleRef = useRef<boolean>(true);

    const { resolvedTheme, theme } = useTheme();
    const isLightMode = resolvedTheme === "light" || theme === "light";
    const effectiveBgColor = frameBgColor ?? (isLightMode ? "#ffffff" : "#08080a");

    const mousePosRef = useRef<{ x: number; y: number }>({ x: 0.5, y: 0.5 });
    const isHoveredRef = useRef<number>(0);
    const startTimeRef = useRef<number>(performance.now());

    const parsedRadius = typeof radius === "number" ? `${radius}px` : radius;

    useImperativeHandle(ref, () => ({
        getCanvas: () => canvasRef.current,
        getGL: () => glRef.current,
    }));

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const gl = canvas.getContext("webgl", {
            alpha: true,
            antialias: true,
            depth: false,
            preserveDrawingBuffer: false,
        });

        if (!gl) {
            console.warn("WebGL not supported for ThreeDSmokeyFrame");
            return;
        }

        glRef.current = gl;
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

        const vs = createShader(gl, gl.VERTEX_SHADER, VERTEX_SHADER);
        const fs = createShader(gl, gl.FRAGMENT_SHADER, FRAGMENT_SHADER);
        if (!vs || !fs) return;

        const program = gl.createProgram();
        if (!program) return;
        gl.attachShader(program, vs);
        gl.attachShader(program, fs);
        gl.linkProgram(program);

        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
            console.error("Program link error:", gl.getProgramInfoLog(program));
            return;
        }

        gl.useProgram(program);

        // Quad Geometry Buffers
        const positionBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
        gl.bufferData(
            gl.ARRAY_BUFFER,
            new Float32Array([
                -1, -1,
                 1, -1,
                -1,  1,
                -1,  1,
                 1, -1,
                 1,  1,
            ]),
            gl.STATIC_DRAW
        );

        const positionLocation = gl.getAttribLocation(program, "a_position");
        gl.enableVertexAttribArray(positionLocation);
        gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

        // Uniform Locations
        const uniforms = {
            resolution: gl.getUniformLocation(program, "u_resolution"),
            time: gl.getUniformLocation(program, "u_time"),
            speed: gl.getUniformLocation(program, "u_speed"),
            frameWidth: gl.getUniformLocation(program, "u_frameWidth"),
            falloff: gl.getUniformLocation(program, "u_falloff"),
            noiseScale: gl.getUniformLocation(program, "u_noiseScale"),
            noiseStrength: gl.getUniformLocation(program, "u_noiseStrength"),
            intensity: gl.getUniformLocation(program, "u_intensity"),
            gamma: gl.getUniformLocation(program, "u_gamma"),
            opacity: gl.getUniformLocation(program, "u_opacity"),
            frameColor: gl.getUniformLocation(program, "u_frameColor"),
            frameBgColor: gl.getUniformLocation(program, "u_frameBgColor"),
            transparentBg: gl.getUniformLocation(program, "u_transparentBg"),
            mouse: gl.getUniformLocation(program, "u_mouse"),
            isHovered: gl.getUniformLocation(program, "u_isHovered"),
        };

        const handleResize = () => {
            if (!canvas || !gl) return;
            const targetDpr = Math.min(window.devicePixelRatio || 1, dpr);
            const displayWidth = Math.round(canvas.clientWidth * targetDpr);
            const displayHeight = Math.round(canvas.clientHeight * targetDpr);

            if (canvas.width !== displayWidth || canvas.height !== displayHeight) {
                canvas.width = Math.max(1, displayWidth);
                canvas.height = Math.max(1, displayHeight);
                gl.viewport(0, 0, canvas.width, canvas.height);
            }
        };

        handleResize();

        const resizeObserver = new ResizeObserver(() => {
            handleResize();
        });
        resizeObserver.observe(canvas);

        const intersectionObserver = new IntersectionObserver(
            ([entry]) => {
                isVisibleRef.current = entry.isIntersecting;
            },
            { threshold: 0.05 }
        );
        intersectionObserver.observe(canvas);

        let currentHover = 0;

        const render = () => {
            if (isVisibleRef.current && gl && canvas) {
                handleResize();

                const time = (performance.now() - startTimeRef.current) * 0.001;
                const fColor = parseColorToRgb(frameColor, [0, 0.96, 1]);
                const bColor = parseColorToRgb(effectiveBgColor, [0.04, 0.04, 0.04]);

                // Smooth hover transition
                const targetHover = isHoveredRef.current;
                currentHover += (targetHover - currentHover) * 0.1;

                gl.uniform2f(uniforms.resolution, canvas.width, canvas.height);
                gl.uniform1f(uniforms.time, time);
                gl.uniform1f(uniforms.speed, speed);
                gl.uniform1f(uniforms.frameWidth, frameWidth);
                gl.uniform1f(uniforms.falloff, falloff);
                gl.uniform1f(uniforms.noiseScale, noiseScale);
                gl.uniform1f(uniforms.noiseStrength, noiseStrength);
                gl.uniform1f(uniforms.intensity, intensity);
                gl.uniform1f(uniforms.gamma, gamma);
                gl.uniform1f(uniforms.opacity, opacity);
                gl.uniform3f(uniforms.frameColor, fColor[0], fColor[1], fColor[2]);
                gl.uniform3f(uniforms.frameBgColor, bColor[0], bColor[1], bColor[2]);
                gl.uniform1f(uniforms.transparentBg, transparentBg ? 1.0 : 0.0);
                gl.uniform2f(uniforms.mouse, mousePosRef.current.x, mousePosRef.current.y);
                gl.uniform1f(uniforms.isHovered, currentHover);

                gl.drawArrays(gl.TRIANGLES, 0, 6);
            }

            animFrameRef.current = requestAnimationFrame(render);
        };

        animFrameRef.current = requestAnimationFrame(render);

        return () => {
            if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
            resizeObserver.disconnect();
            intersectionObserver.disconnect();
            if (gl) {
                gl.deleteProgram(program);
                gl.deleteShader(vs);
                gl.deleteShader(fs);
                gl.deleteBuffer(positionBuffer);
            }
        };
    }, [
        frameColor,
        effectiveBgColor,
        transparentBg,
        frameWidth,
        speed,
        falloff,
        noiseScale,
        noiseStrength,
        intensity,
        gamma,
        opacity,
        dpr,
    ]);

    const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
        if (!interactive || !containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width;
        const y = 1.0 - (e.clientY - rect.top) / rect.height; // Invert for WebGL UV coords
        mousePosRef.current = { x, y };
    }, [interactive]);

    const handleMouseEnter = useCallback(() => {
        if (interactive) isHoveredRef.current = 1.0;
    }, [interactive]);

    const handleMouseLeave = useCallback(() => {
        if (interactive) isHoveredRef.current = 0.0;
    }, [interactive]);

    return (
        <div
            ref={containerRef}
            onMouseMove={handleMouseMove}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            className={cn("relative w-full h-full min-h-[300px] overflow-hidden select-none", className)}
            style={{
                borderRadius: parsedRadius,
                ...style,
            }}
        >
            {/* Ambient Atmosphere Glow Backdrop */}
            {glow && (
                <div
                    className="absolute inset-0 pointer-events-none -z-10 scale-105 transition-opacity duration-300"
                    style={{
                        borderRadius: parsedRadius,
                        filter: `blur(${glowBlur}px)`,
                        background: `radial-gradient(ellipse at center, ${frameColor} 0%, transparent 75%)`,
                        opacity: glowOpacity,
                    }}
                />
            )}

            {/* WebGL Canvas Shader Output */}
            <canvas
                ref={canvasRef}
                className={cn("w-full h-full block pointer-events-none absolute inset-0", canvasClassName)}
                style={{
                    borderRadius: parsedRadius,
                }}
            />

            {/* Slotted Children Content Layer */}
            {children && (
                <div
                    className="relative z-10 w-full h-full flex flex-col justify-center items-center pointer-events-auto"
                    style={{
                        borderRadius: parsedRadius,
                    }}
                >
                    {children}
                </div>
            )}
        </div>
    );
});

ThreeDSmokeyFrame.displayName = "ThreeDSmokeyFrame";

export default ThreeDSmokeyFrame;
