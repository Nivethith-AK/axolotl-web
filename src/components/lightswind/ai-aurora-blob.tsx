"use client";

import React, { useEffect, useRef, useState } from "react";
import { Renderer, Program, Mesh, Triangle } from "ogl";
import { motion } from "framer-motion";
import { MicOff } from "lucide-react";

function hexToVec3(hex: string): [number, number, number] {
  const h = hex.replace("#", "");
  return [
    parseInt(h.slice(0, 2), 16) / 255 || 0,
    parseInt(h.slice(2, 4), 16) / 255 || 0,
    parseInt(h.slice(4, 6), 16) / 255 || 0,
  ];
}

const vertexShader = `#version 300 es
in vec2 uv;
in vec2 position;
out vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position, 0, 1);
}
`;

const fragmentShader = `#version 300 es
precision highp float;

uniform float uTime;
uniform vec3 uResolution;
uniform float uSpeed;
uniform float uScale;
uniform float uBrightness;
uniform vec3 uColor1;
uniform vec3 uColor2;
uniform float uNoiseFreq;
uniform float uNoiseAmp;
uniform float uBandHeight;
uniform float uBandSpread;
uniform float uOctaveDecay;
uniform float uLayerOffset;
uniform float uColorSpeed;
uniform vec2 uMouse;
uniform float uMouseInfluence;
uniform bool uEnableMouse;
uniform bool uShowBorder;

out vec4 fragColor;

#define TAU 6.28318530718

vec3 gradientHash(vec3 p) {
  p = vec3(
    dot(p, vec3(127.1, 311.7, 234.6)),
    dot(p, vec3(269.5, 183.3, 198.3)),
    dot(p, vec3(169.5, 283.3, 156.9))
  );
  vec3 h = fract(sin(p) * 43758.5453123);
  float phi = acos(2.0 * h.x - 1.0);
  float theta = TAU * h.y;
  return vec3(cos(theta) * sin(phi), sin(theta) * cos(phi), cos(phi));
}

float quinticSmooth(float t) {
  float t2 = t * t;
  float t3 = t * t2;
  return 6.0 * t3 * t2 - 15.0 * t2 * t2 + 10.0 * t3;
}

vec3 cosineGradient(float t, vec3 a, vec3 b, vec3 c, vec3 d) {
  return a + b * cos(TAU * (c * t + d));
}

float perlin3D(float amplitude, float frequency, float px, float py, float pz) {
  float x = px * frequency;
  float y = py * frequency;

  float fx = floor(x); float fy = floor(y); float fz = floor(pz);
  float cx = ceil(x);  float cy = ceil(y);  float cz = ceil(pz);

  vec3 g000 = gradientHash(vec3(fx, fy, fz));
  vec3 g100 = gradientHash(vec3(cx, fy, fz));
  vec3 g010 = gradientHash(vec3(fx, cy, fz));
  vec3 g110 = gradientHash(vec3(cx, cy, fz));
  vec3 g001 = gradientHash(vec3(fx, fy, cz));
  vec3 g101 = gradientHash(vec3(cx, fy, cz));
  vec3 g011 = gradientHash(vec3(fx, cy, cz));
  vec3 g111 = gradientHash(vec3(cx, cy, cz));

  float d000 = dot(g000, vec3(x - fx, y - fy, pz - fz));
  float d100 = dot(g100, vec3(x - cx, y - fy, pz - fz));
  float d010 = dot(g010, vec3(x - fx, y - cy, pz - fz));
  float d110 = dot(g110, vec3(x - cx, y - cy, pz - fz));
  float d001 = dot(g001, vec3(x - fx, y - fy, pz - cz));
  float d101 = dot(g101, vec3(x - cx, y - fy, pz - cz));
  float d011 = dot(g011, vec3(x - fx, y - cy, pz - cz));
  float d111 = dot(g111, vec3(x - cx, y - cy, pz - cz));

  float sx = quinticSmooth(x - fx);
  float sy = quinticSmooth(y - fy);
  float sz = quinticSmooth(pz - fz);

  float lx00 = mix(d000, d100, sx);
  float lx10 = mix(d010, d110, sx);
  float lx01 = mix(d001, d101, sx);
  float lx11 = mix(d011, d111, sx);

  float ly0 = mix(lx00, lx10, sy);
  float ly1 = mix(lx01, lx11, sy);

  return amplitude * mix(ly0, ly1, sz);
}

float auroraGlow(float t, vec2 shift) {
  vec2 uv = gl_FragCoord.xy / uResolution.y;
  uv += shift;

  float noiseVal = 0.0;
  float freq = uNoiseFreq;
  float amp = uNoiseAmp;
  vec2 samplePos = uv * uScale;

  for (float i = 0.0; i < 3.0; i += 1.0) {
    noiseVal += perlin3D(amp, freq, samplePos.x, samplePos.y, t);
    amp *= uOctaveDecay;
    freq *= 2.0;
  }

  float yBand = (uv.y - 0.5) * 5.0;
  return max(exp(-2.2 * abs(noiseVal + yBand * 0.45)), 0.0);
}

void main() {
  vec2 uv = gl_FragCoord.xy / uResolution.xy;
  float t = uSpeed * 0.4 * uTime;

  vec2 p = (gl_FragCoord.xy - 0.5 * uResolution.xy) / uResolution.y;
  float dist = length(p);
  float radius = 0.36;
  float edge = fwidth(dist) * 1.5;
  float mask = 1.0 - smoothstep(radius - edge, radius + edge, dist);

  if (mask <= 0.0) {
    fragColor = vec4(0.0);
    return;
  }

  vec2 shift = vec2(0.0);
  if (uEnableMouse) {
    shift = (uMouse - 0.5) * uMouseInfluence;
  }

  // 1. Dynamic Aurora Waves Field
  vec3 auroraCol = vec3(0.0);
  auroraCol += 0.95 * auroraGlow(t, shift) * cosineGradient(uv.x + uTime * uSpeed * 0.2 * uColorSpeed, vec3(0.5), vec3(0.5), vec3(1.0), vec3(0.3, 0.20, 0.20)) * uColor1;
  auroraCol += 0.95 * auroraGlow(t + uLayerOffset, shift) * cosineGradient(uv.x + uTime * uSpeed * 0.1 * uColorSpeed, vec3(0.5), vec3(0.5), vec3(2.0, 1.0, 0.0), vec3(0.5, 0.20, 0.25)) * uColor2;

  // 2. Full Sphere Ambient Fill (renders whole circular ball filled with dynamic aurora glow)
  float normDist = clamp(dist / radius, 0.0, 1.0);
  float centerVol = sqrt(max(1.0 - normDist * normDist, 0.0));
  vec3 sphereBg = mix(uColor1, uColor2, sin(uv.x * 3.1415 + t * 0.5) * 0.5 + 0.5) * 0.45 * centerVol;

  vec3 col = sphereBg + auroraCol * uBrightness;

  // 3. Mild Frosted Glass Rim Reflection & Border Toggle (No dark shadow)
  if (uShowBorder) {
    float borderAngle = atan(p.y, p.x);
    vec3 glassTint = mix(uColor1, uColor2, sin(borderAngle * 2.0 + t * 1.2) * 0.5 + 0.5);
    vec3 glassHighlight = mix(vec3(1.0), glassTint * 1.2, 0.35);

    // Sleek mild frosted glass rim highlight along outer radius (0.91 - 0.99)
    float glassRim = sin(smoothstep(0.91, 0.99, normDist) * 3.14159);

    // Blend mild crystal glass rim highlight
    col = mix(col, glassHighlight, glassRim * 0.45);
  }

  // Soft spherical alpha falloff
  float alpha = (0.75 + 0.25 * centerVol) * mask;

  fragColor = vec4(col * alpha, alpha);
}
`;

export interface AiAuroraBlobProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Diameter of the AI Aurora Blob container in pixels (default: 260) */
  size?: number;
  /** Primary aurora gradient color (default: "#10b981") */
  color1?: string;
  /** Secondary aurora gradient color (default: "#6366f1") */
  color2?: string;
  /** AI Assistant state mode: "listening" | "thinking" | "speaking" | "orbit" | "pulse" */
  variant?: "listening" | "thinking" | "speaking" | "orbit" | "pulse";
  /** Aurora wave speed multiplier (default: 0.6) */
  speed?: number;
  /** Aurora wave scale (default: 1.5) */
  scale?: number;
  /** Aurora brightness (default: 1.2) */
  brightness?: number;
  /** Noise frequency (default: 2.5) */
  noiseFrequency?: number;
  /** Noise amplitude (default: 1.0) */
  noiseAmplitude?: number;
  /** Aurora band height position (default: 0.5) */
  bandHeight?: number;
  /** Aurora band spread (default: 1.0) */
  bandSpread?: number;
  /** Enable mouse interaction warping (default: true) */
  enableMouseInteraction?: boolean;
  /** Mouse warp influence factor (default: 0.25) */
  mouseInfluence?: number;
  /** Toggle outer glassmorphic border rim (default: true) */
  showBorder?: boolean;
  /** Active voice listening state */
  isListening?: boolean;
  /** Central mic click handler */
  onMicClick?: () => void;
  /** Custom content inside center orb */
  centerContent?: React.ReactNode;
}

export const AiAuroraBlob: React.FC<AiAuroraBlobProps> = ({
  size = 260,
  color1 = "#10b981",
  color2 = "#6366f1",
  variant = "listening",
  speed = 0.6,
  scale = 1.5,
  brightness = 1.2,
  noiseFrequency = 2.5,
  noiseAmplitude = 1.0,
  bandHeight = 0.5,
  bandSpread = 1.0,
  enableMouseInteraction = true,
  mouseInfluence = 0.25,
  showBorder = true,
  isListening = true,
  onMicClick,
  centerContent,
  className = "",
  style,
  onMouseEnter,
  onMouseLeave,
  ...props
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState<boolean>(false);

  // Dynamic state variations based on AI Voice Assistant mode
  const variantConfig = React.useMemo(() => {
    switch (variant) {
      case "listening":
        return { speedMult: 1.3, brightMult: 1.1, freqMult: 1.1 };
      case "thinking":
        return { speedMult: 1.9, brightMult: 1.3, freqMult: 1.8 };
      case "speaking":
        return { speedMult: 2.3, brightMult: 1.4, freqMult: 1.4 };
      case "orbit":
        return { speedMult: 0.8, brightMult: 1.0, freqMult: 0.9 };
      case "pulse":
        return { speedMult: 1.1, brightMult: 1.2, freqMult: 1.0 };
      default:
        return { speedMult: 1.0, brightMult: 1.0, freqMult: 1.0 };
    }
  }, [variant]);

  const hoverSpeedMult = isHovered ? 2.4 : 1.0;
  const hoverBrightMult = isHovered ? 1.25 : 1.0;

  const propsRef = useRef({
    speed: speed * variantConfig.speedMult * hoverSpeedMult,
    scale,
    brightness: brightness * variantConfig.brightMult * hoverBrightMult,
    color1,
    color2,
    noiseFrequency: noiseFrequency * variantConfig.freqMult,
    noiseAmplitude,
    bandHeight,
    bandSpread,
    enableMouseInteraction,
    mouseInfluence,
    showBorder,
  });

  propsRef.current = {
    speed: speed * variantConfig.speedMult * hoverSpeedMult,
    scale,
    brightness: brightness * variantConfig.brightMult * hoverBrightMult,
    color1,
    color2,
    noiseFrequency: noiseFrequency * variantConfig.freqMult,
    noiseAmplitude,
    bandHeight,
    bandSpread,
    enableMouseInteraction,
    mouseInfluence,
    showBorder,
  };

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let renderer: Renderer | null = null;
    try {
      renderer = new Renderer({ alpha: true, premultipliedAlpha: true });
    } catch (e) {
      console.warn("WebGL not supported for AiAuroraBlob", e);
      return;
    }

    const gl = renderer.gl;
    gl.clearColor(0, 0, 0, 0);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    gl.canvas.style.backgroundColor = "transparent";

    let program: Program;
    let currentMouse = [0.5, 0.5];
    let targetMouse = [0.5, 0.5];

    function handleMouseMove(e: MouseEvent) {
      const rect = gl.canvas.getBoundingClientRect();
      targetMouse = [
        (e.clientX - rect.left) / (rect.width || 1),
        1.0 - (e.clientY - rect.top) / (rect.height || 1),
      ];
    }

    function handleMouseLeave() {
      targetMouse = [0.5, 0.5];
    }

    function resize() {
      if (!container || !renderer) return;
      const w = container.offsetWidth || size;
      const h = container.offsetHeight || size;
      renderer.setSize(w, h);
      if (program) {
        program.uniforms.uResolution.value = [w, h, w / h];
      }
    }

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(container);
    resize();

    const geometry = new Triangle(gl);
    program = new Program(gl, {
      vertex: vertexShader,
      fragment: fragmentShader,
      uniforms: {
        uTime: { value: 0 },
        uResolution: { value: [container.offsetWidth || size, container.offsetHeight || size, 1.0] },
        uSpeed: { value: propsRef.current.speed },
        uScale: { value: propsRef.current.scale },
        uBrightness: { value: propsRef.current.brightness },
        uColor1: { value: hexToVec3(propsRef.current.color1) },
        uColor2: { value: hexToVec3(propsRef.current.color2) },
        uNoiseFreq: { value: propsRef.current.noiseFrequency },
        uNoiseAmp: { value: propsRef.current.noiseAmplitude },
        uBandHeight: { value: propsRef.current.bandHeight },
        uBandSpread: { value: propsRef.current.bandSpread },
        uOctaveDecay: { value: 0.1 },
        uLayerOffset: { value: 0.5 },
        uColorSpeed: { value: 1.0 },
        uMouse: { value: new Float32Array([0.5, 0.5]) },
        uMouseInfluence: { value: propsRef.current.mouseInfluence },
        uEnableMouse: { value: propsRef.current.enableMouseInteraction },
        uShowBorder: { value: propsRef.current.showBorder },
      },
    });

    const mesh = new Mesh(gl, { geometry, program });
    container.appendChild(gl.canvas);

    if (enableMouseInteraction) {
      gl.canvas.addEventListener("mousemove", handleMouseMove);
      gl.canvas.addEventListener("mouseleave", handleMouseLeave);
    }

    let animationFrameId: number;

    function update(time: number) {
      animationFrameId = requestAnimationFrame(update);
      if (!renderer) return;

      const current = propsRef.current;
      program.uniforms.uTime.value = time * 0.001;
      program.uniforms.uSpeed.value = current.speed;
      program.uniforms.uScale.value = current.scale;
      program.uniforms.uBrightness.value = current.brightness;
      program.uniforms.uColor1.value = hexToVec3(current.color1);
      program.uniforms.uColor2.value = hexToVec3(current.color2);
      program.uniforms.uNoiseFreq.value = current.noiseFrequency;
      program.uniforms.uNoiseAmp.value = current.noiseAmplitude;
      program.uniforms.uBandHeight.value = current.bandHeight;
      program.uniforms.uBandSpread.value = current.bandSpread;
      program.uniforms.uEnableMouse.value = current.enableMouseInteraction;
      program.uniforms.uMouseInfluence.value = current.mouseInfluence;
      program.uniforms.uShowBorder.value = current.showBorder;

      if (current.enableMouseInteraction) {
        currentMouse[0] += 0.08 * (targetMouse[0] - currentMouse[0]);
        currentMouse[1] += 0.08 * (targetMouse[1] - currentMouse[1]);
        program.uniforms.uMouse.value[0] = currentMouse[0];
        program.uniforms.uMouse.value[1] = currentMouse[1];
      } else {
        program.uniforms.uMouse.value[0] = 0.5;
        program.uniforms.uMouse.value[1] = 0.5;
      }

      renderer.render({ scene: mesh });
    }
    animationFrameId = requestAnimationFrame(update);

    return () => {
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
      if (enableMouseInteraction && gl.canvas) {
        gl.canvas.removeEventListener("mousemove", handleMouseMove);
        gl.canvas.removeEventListener("mouseleave", handleMouseLeave);
      }
      if (container && gl.canvas.parentNode === container) {
        container.removeChild(gl.canvas);
      }
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    };
  }, [size]);

  return (
    <div
      onMouseEnter={(e) => {
        setIsHovered(true);
        onMouseEnter?.(e);
      }}
      onMouseLeave={(e) => {
        setIsHovered(false);
        onMouseLeave?.(e);
      }}
      className={`relative inline-flex items-center justify-center select-none overflow-hidden cursor-pointer group ${className}`}
      style={{ width: size, height: size, ...style }}
      {...props}
    >
      {/* ── Background WebGL Procedural Soft Aurora Waves ── */}
      <div ref={containerRef} className="absolute inset-0 w-full h-full pointer-events-none" />

      {/* ── Center Frosted Glassmorphic Voice Button ── */}
      <div className="relative z-10 flex items-center justify-center">
        <motion.button
          whileHover={{ scale: 1.12 }}
          whileTap={{ scale: 0.92 }}
          onClick={onMicClick}
          className={`
            relative w-[84px] h-[84px] rounded-full
            bg-white/15 dark:bg-white/10 backdrop-blur-2xl
            border border-white/60 dark:border-white/40
            shadow-[0_8px_32px_rgba(0,0,0,0.25),inset_0_2px_8px_rgba(255,255,255,0.7)]
            flex items-center justify-center
            text-white transition-all cursor-pointer group-hover:bg-white/25
          `}
          style={{
            boxShadow: `0 8px 32px rgba(0,0,0,0.25), inset 0 2px 8px rgba(255,255,255,0.7), 0 0 24px ${color1}40`,
          }}
        >
          {centerContent ? (
            centerContent
          ) : isListening ? (
            <div className="flex items-center justify-center gap-1.5">
              {/* 1. LISTENING MODE: Dynamic Audio Equalizer Bounce */}
              {variant === "listening" && (
                <>
                  <motion.span
                    animate={{ height: isHovered ? ["14px", "36px", "14px"] : ["12px", "32px", "12px"] }}
                    transition={{ duration: isHovered ? 0.35 : 0.6, repeat: Infinity, ease: "easeInOut" }}
                    className="w-1.5 bg-white rounded-full shadow-xs"
                  />
                  <motion.span
                    animate={{ height: isHovered ? ["24px", "44px", "24px"] : ["20px", "40px", "20px"] }}
                    transition={{ duration: isHovered ? 0.35 : 0.6, delay: 0.1, repeat: Infinity, ease: "easeInOut" }}
                    className="w-1.5 bg-white rounded-full shadow-xs"
                  />
                  <motion.span
                    animate={{ height: isHovered ? ["12px", "30px", "12px"] : ["10px", "26px", "10px"] }}
                    transition={{ duration: isHovered ? 0.35 : 0.6, delay: 0.2, repeat: Infinity, ease: "easeInOut" }}
                    className="w-1.5 bg-white rounded-full shadow-xs"
                  />
                </>
              )}

              {/* 2. THINKING MODE: Floating Loading Wave Dots */}
              {variant === "thinking" && (
                <>
                  <motion.span
                    animate={{ y: [-6, 6, -6], opacity: [0.4, 1, 0.4] }}
                    transition={{ duration: isHovered ? 0.5 : 0.8, repeat: Infinity, ease: "easeInOut" }}
                    className="w-2.5 h-2.5 bg-white rounded-full shadow-xs"
                  />
                  <motion.span
                    animate={{ y: [-6, 6, -6], opacity: [0.4, 1, 0.4] }}
                    transition={{ duration: isHovered ? 0.5 : 0.8, delay: 0.15, repeat: Infinity, ease: "easeInOut" }}
                    className="w-2.5 h-2.5 bg-white rounded-full shadow-xs"
                  />
                  <motion.span
                    animate={{ y: [-6, 6, -6], opacity: [0.4, 1, 0.4] }}
                    transition={{ duration: isHovered ? 0.5 : 0.8, delay: 0.3, repeat: Infinity, ease: "easeInOut" }}
                    className="w-2.5 h-2.5 bg-white rounded-full shadow-xs"
                  />
                </>
              )}

              {/* 3. SPEAKING MODE: High Energy Rapid Speech Oscillation */}
              {variant === "speaking" && (
                <>
                  <motion.span
                    animate={{ height: ["8px", "36px", "14px", "30px", "8px"] }}
                    transition={{ duration: isHovered ? 0.22 : 0.35, repeat: Infinity, ease: "easeInOut" }}
                    className="w-1.5 bg-white rounded-full shadow-xs"
                  />
                  <motion.span
                    animate={{ height: ["32px", "12px", "38px", "10px", "32px"] }}
                    transition={{ duration: isHovered ? 0.22 : 0.35, delay: 0.08, repeat: Infinity, ease: "easeInOut" }}
                    className="w-1.5 bg-white rounded-full shadow-xs"
                  />
                  <motion.span
                    animate={{ height: ["14px", "30px", "8px", "34px", "14px"] }}
                    transition={{ duration: isHovered ? 0.22 : 0.35, delay: 0.15, repeat: Infinity, ease: "easeInOut" }}
                    className="w-1.5 bg-white rounded-full shadow-xs"
                  />
                </>
              )}

              {/* 4. ORBIT MODE: Rotating 3-Dot Orbital Loop */}
              {variant === "orbit" && (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: isHovered ? 0.8 : 1.5, repeat: Infinity, ease: "linear" }}
                  className="flex items-center gap-2"
                >
                  <span className="w-2.5 h-2.5 bg-white rounded-full shadow-xs" />
                  <span className="w-2.5 h-2.5 bg-white/70 rounded-full shadow-xs" />
                  <span className="w-2.5 h-2.5 bg-white/30 rounded-full shadow-xs" />
                </motion.div>
              )}

              {/* 5. PULSE MODE: Synchronized Breathing Equalizer Pulse */}
              {variant === "pulse" && (
                <>
                  <motion.span
                    animate={{ scaleY: [0.5, 1.5, 0.5] }}
                    transition={{ duration: isHovered ? 0.7 : 1.2, repeat: Infinity, ease: "easeInOut" }}
                    className="w-1.5 h-7 bg-white rounded-full shadow-xs"
                  />
                  <motion.span
                    animate={{ scaleY: [0.5, 1.5, 0.5] }}
                    transition={{ duration: isHovered ? 0.7 : 1.2, delay: 0.1, repeat: Infinity, ease: "easeInOut" }}
                    className="w-1.5 h-7 bg-white rounded-full shadow-xs"
                  />
                  <motion.span
                    animate={{ scaleY: [0.5, 1.5, 0.5] }}
                    transition={{ duration: isHovered ? 0.7 : 1.2, delay: 0.2, repeat: Infinity, ease: "easeInOut" }}
                    className="w-1.5 h-7 bg-white rounded-full shadow-xs"
                  />
                </>
              )}
            </div>
          ) : (
            <MicOff className="w-7 h-7 text-white/80" />
          )}
        </motion.button>
      </div>
    </div>
  );
};

export default AiAuroraBlob;
