"use client";

import React, {
    useRef,
    useEffect,
    useCallback,
    useState,
    PropsWithChildren,
    CSSProperties,
    forwardRef,
    useImperativeHandle,
} from "react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";

export interface ShaderCardProps extends PropsWithChildren {
    /** Primary electric plasma shader color (Hex or RGB string, default: "#00D2FF" Sky Blue) */
    color?: string;
    /** Background card interior base color (default: "#0d0e12") */
    bgColor?: string;
    /** Fluid wave speed multiplier (default: 0.5) */
    speed?: number;
    /** Vertical origin position offset (default: 0.15) */
    positionY?: number;
    /** Coordinate zoom scale factor (default: 4.0) */
    scale?: number;
    /** Power exponent controlling plasma branch contrast & sharpness (default: 1.8) */
    branchIntensity?: number;
    /** Horizontal wave distortion amplitude (default: 0.25) */
    waveAmount?: number;
    /** Noise granularity and density multiplier (default: 1.5) */
    noiseScale?: number;
    /** Exponential vertical falloff power (default: 1.6) */
    falloffPower?: number;
    /** WebGL shader layer opacity (0.0 to 1.0, default: 0.85) */
    opacity?: number;
    /** Optional blur filter applied directly to the WebGL shader canvas (e.g. "6px" or 6) */
    shaderBlur?: number | string;
    /** Add a mild frosted glass blur overlay on top of the shader (default: false) */
    frostedOverlay?: boolean;
    /** Enable cursor-reactive turbulence and wave displacement (default: true) */
    interactive?: boolean;
    /** Enable subtle 3D card tilt perspective when hovering (default: true) */
    enableTilt?: boolean;
    /** Maximum 3D tilt angle in degrees (default: 10) */
    maxTilt?: number;
    /** Enable atmospheric colored ambient glow behind card (default: true) */
    glow?: boolean;
    /** Glow blur radius in pixels (default: 32) */
    glowBlur?: number;
    /** Glow opacity (default: 0.35) */
    glowOpacity?: number;
    /** Border radius for the card (default: "20px") */
    radius?: string | number;
    /** Optional outer card container class */
    className?: string;
    /** Optional canvas element class */
    canvasClassName?: string;
    /** Optional inline styles */
    style?: CSSProperties;
    /** Maximum device pixel ratio (default: 2) */
    dpr?: number;
}

export interface ShaderCardHandle {
    getCanvas: () => HTMLCanvasElement | null;
    getGL: () => WebGLRenderingContext | null;
}

/** Utility to parse Hex or RGB strings to normalized [r, g, b] float vectors */
function parseColorToRgb(color: string, fallback: [number, number, number] = [0, 0.82, 1]): [number, number, number] {
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

  uniform float u_time;
  uniform vec2 u_resolution;
  uniform vec3 u_color;
  uniform float u_speed;
  uniform float u_positionY;
  uniform float u_scale;
  uniform float u_branchIntensity;
  uniform float u_waveAmount;
  uniform float u_noiseScale;
  uniform float u_falloffPower;
  uniform float u_opacity;
  uniform vec2 u_mouse;
  uniform float u_isHovered;

  // Simple 2D Pseudo Random / Noise
  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    float a = hash(i);
    float b = hash(i + vec2(1.0, 0.0));
    float c = hash(i + vec2(0.0, 1.0));
    float d = hash(i + vec2(1.0, 1.0));
    return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
  }

  float fbm(vec2 p) {
    float v = 0.0;
    float a = 0.5;
    for (int i = 0; i < 4; i++) {
      v += a * noise(p);
      p *= 2.0;
      a *= 0.5;
    }
    return v;
  }

  void main() {
    vec2 uv = v_uv;
    float t = u_time * u_speed;

    // Aspect ratio correction
    float aspect = u_resolution.x / u_resolution.y;

    // Position offset adjustment
    vec2 p = uv * u_scale;
    p.y -= u_positionY * u_scale;

    // Cursor interactive fluid wave displacement
    if (u_isHovered > 0.0) {
      vec2 m = u_mouse * u_scale;
      m.y -= u_positionY * u_scale;
      float dMouse = distance(p, m);
      float mouseInfluence = smoothstep(1.6, 0.0, dMouse);
      p += (p - m) * mouseInfluence * 0.5 * u_isHovered;
    }

    // Wave distortion
    float wave = sin(p.x * 2.0 + t) * cos(p.y * 1.5 + t * 0.7) * u_waveAmount;
    
    // Fluid noise branch calculation
    float n = fbm(p * u_noiseScale + vec2(t * 0.2, -t * 0.3) + wave);
    n = pow(n, u_branchIntensity);

    // Vertical falloff mask (glow concentrated around bottom-to-middle)
    float verticalMask = smoothstep(0.0, 1.0, uv.y * 1.6);
    verticalMask = pow(verticalMask, u_falloffPower);

    // Core glow & color mixing
    float intensity = n * verticalMask * 2.4;
    vec3 color = u_color * intensity;

    // Bottom accent glow
    float bottomGlow = smoothstep(0.0, 0.8, uv.y) * 0.35;
    color += u_color * bottomGlow;

    // Localized cursor interactive glow aura
    if (u_isHovered > 0.0) {
      float dMouseUV = distance(uv, u_mouse);
      float cursorGlow = smoothstep(0.45, 0.0, dMouseUV) * 0.35 * u_isHovered;
      color += u_color * cursorGlow;
    }

    float alpha = clamp(intensity * u_opacity, 0.0, 1.0);
    gl_FragColor = vec4(color, alpha);
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

export const ShaderCard = forwardRef<ShaderCardHandle, ShaderCardProps>(({
    children,
    color = "#00D2FF",
    bgColor,
    speed = 0.5,
    positionY = 0.15,
    scale = 4.0,
    branchIntensity = 1.8,
    waveAmount = 0.25,
    noiseScale = 1.5,
    falloffPower = 1.6,
    opacity = 0.85,
    shaderBlur,
    frostedOverlay = false,
    interactive = true,
    enableTilt = false,
    maxTilt = 10,
    glow = true,
    glowBlur = 32,
    glowOpacity = 0.35,
    radius = "20px",
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

    const mousePosRef = useRef<{ x: number; y: number }>({ x: 0.5, y: 0.5 });
    const isHoveredRef = useRef<number>(0);
    const startTimeRef = useRef<number>(performance.now());
    const [tiltStyle, setTiltStyle] = useState<{ transform: string }>({ transform: "" });

    const { resolvedTheme, theme } = useTheme();
    const isLightMode = resolvedTheme === "light" || theme === "light";
    const effectiveBgColor = bgColor ?? (isLightMode ? "#f8fafc" : "#0d0e12");

    const parsedRadius = typeof radius === "number" ? `${radius}px` : radius;
    const parsedShaderBlur = typeof shaderBlur === "number" ? `${shaderBlur}px` : shaderBlur;

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
            console.warn("WebGL not supported for ShaderCard");
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
            time: gl.getUniformLocation(program, "u_time"),
            resolution: gl.getUniformLocation(program, "u_resolution"),
            color: gl.getUniformLocation(program, "u_color"),
            speed: gl.getUniformLocation(program, "u_speed"),
            positionY: gl.getUniformLocation(program, "u_positionY"),
            scale: gl.getUniformLocation(program, "u_scale"),
            branchIntensity: gl.getUniformLocation(program, "u_branchIntensity"),
            waveAmount: gl.getUniformLocation(program, "u_waveAmount"),
            noiseScale: gl.getUniformLocation(program, "u_noiseScale"),
            falloffPower: gl.getUniformLocation(program, "u_falloffPower"),
            opacity: gl.getUniformLocation(program, "u_opacity"),
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

        const resizeObserver = new ResizeObserver(() => handleResize());
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
                const rgb = parseColorToRgb(color, [0, 0.82, 1]);

                // Smooth hover transition
                const targetHover = isHoveredRef.current;
                currentHover += (targetHover - currentHover) * 0.1;

                gl.uniform1f(uniforms.time, time);
                gl.uniform2f(uniforms.resolution, canvas.width, canvas.height);
                gl.uniform3f(uniforms.color, rgb[0], rgb[1], rgb[2]);
                gl.uniform1f(uniforms.speed, speed);
                gl.uniform1f(uniforms.positionY, positionY);
                gl.uniform1f(uniforms.scale, scale);
                gl.uniform1f(uniforms.branchIntensity, branchIntensity);
                gl.uniform1f(uniforms.waveAmount, waveAmount);
                gl.uniform1f(uniforms.noiseScale, noiseScale);
                gl.uniform1f(uniforms.falloffPower, falloffPower);
                gl.uniform1f(uniforms.opacity, opacity);
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
        color,
        speed,
        positionY,
        scale,
        branchIntensity,
        waveAmount,
        noiseScale,
        falloffPower,
        opacity,
        dpr,
    ]);

    const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
        const y = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height));

        mousePosRef.current = { x, y: 1.0 - y }; // Invert for WebGL coords

        if (enableTilt) {
            const tiltY = (x - 0.5) * (maxTilt * 2);
            const tiltX = (0.5 - y) * (maxTilt * 2);
            setTiltStyle({
                transform: `perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale3d(1.02, 1.02, 1.02)`,
            });
        }
    }, [enableTilt, maxTilt]);

    const handleMouseEnter = useCallback(() => {
        if (interactive) isHoveredRef.current = 1.0;
    }, [interactive]);

    const handleMouseLeave = useCallback(() => {
        if (interactive) isHoveredRef.current = 0.0;
        if (enableTilt) {
            setTiltStyle({
                transform: "perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)",
            });
        }
    }, [interactive, enableTilt]);

    return (
        <div
            ref={containerRef}
            onMouseMove={handleMouseMove}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            className={cn(
                "relative flex flex-col justify-between overflow-hidden transition-transform duration-300 ease-out border border-white/10 dark:border-white/10 shadow-2xl select-none group",
                className
            )}
            style={{
                borderRadius: parsedRadius,
                backgroundColor: effectiveBgColor,
                transformStyle: "preserve-3d",
                ...tiltStyle,
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
                        background: `radial-gradient(ellipse at center, ${color} 0%, transparent 70%)`,
                        opacity: glowOpacity,
                    }}
                />
            )}

            {/* WebGL Canvas Background */}
            <canvas
                ref={canvasRef}
                className={cn("w-full h-full block pointer-events-none absolute inset-0 z-0", canvasClassName)}
                style={{
                    borderRadius: parsedRadius,
                    filter: parsedShaderBlur ? `blur(${parsedShaderBlur})` : undefined,
                }}
            />

            {/* Mild Frosted Glass Light Blur Overlay */}
            {frostedOverlay && (
                <div
                    className="absolute inset-0 pointer-events-none z-0 backdrop-blur-[6px] bg-black/15 dark:bg-black/25"
                    style={{
                        borderRadius: parsedRadius,
                    }}
                />
            )}

            {/* Content Slot Layer */}
            {children && (
                <div className="relative z-10 w-full h-full pointer-events-auto flex flex-col justify-between">
                    {children}
                </div>
            )}
        </div>
    );
});

ShaderCard.displayName = "ShaderCard";

export default ShaderCard;
