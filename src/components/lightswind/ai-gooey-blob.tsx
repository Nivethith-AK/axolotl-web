"use client";

import React, { useId } from "react";
import { motion } from "framer-motion";
import { MicOff } from "lucide-react";

export interface AiGooeyBlobProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Diameter of the AI Blob container in pixels (default: 220) */
  size?: number;
  /** Primary gradient color (default: "#6366f1") */
  color?: string;
  /** Secondary gradient color (default: "#ec4899") */
  colorSecondary?: string;
  /** Tertiary gradient color (default: "#06b6d4") */
  colorTertiary?: string;
  /** AI Assistant state mode: "listening" | "thinking" | "speaking" | "orbit" | "pulse" */
  variant?: "listening" | "thinking" | "speaking" | "orbit" | "pulse";
  /** Sensitivity scale modifier (default: 0.6) */
  audioLevel?: number;
  /** Active listening state toggle */
  isListening?: boolean;
  /** Click handler for central mic orb */
  onMicClick?: () => void;
  /** Custom icon or content inside the core nucleus */
  centerContent?: React.ReactNode;
}

export const AiGooeyBlob: React.FC<AiGooeyBlobProps> = ({
  size = 220,
  color = "#6366f1",
  colorSecondary = "#ec4899",
  colorTertiary = "#06b6d4",
  variant = "listening",
  audioLevel = 0.6,
  isListening = true,
  onMicClick,
  centerContent,
  className = "",
  style,
  ...props
}) => {
  const rawId = useId();
  const filterId = `gooey-filter-${rawId.replace(/:/g, "")}`;

  return (
    <div
      className={`relative inline-flex flex-col items-center justify-center select-none ${className}`}
      style={{ width: size, height: size, ...style }}
      {...props}
    >
      {/* ── SVG Crisp Gooey Liquid Filter Definition ── */}
      <svg className="absolute w-0 h-0 pointer-events-none" aria-hidden="true">
        <defs>
          {/* Sharp High-Definition Liquid Gooey Filter */}
          <filter id={filterId} colorInterpolationFilters="sRGB">
            <feGaussianBlur in="SourceGraphic" stdDeviation="9" result="blur" />
            <feColorMatrix
              in="blur"
              mode="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 32 -11"
              result="gooey"
            />
            <feComposite in="SourceGraphic" in2="gooey" operator="atop" />
          </filter>
        </defs>
      </svg>

      {/* ── Liquid Gooey Metaball Container ── */}
      <div
        className="relative w-full h-full flex items-center justify-center"
        style={{ filter: `url(#${filterId})` }}
      >
        {/* Central Core Liquid Nucleus - Pure Fluid Morphing (No Line Animations) */}
        <motion.div
          animate={
            variant === "listening"
              ? {
                  scale: [1, 1.22, 0.82, 1.15, 1],
                  borderRadius: [
                    "30% 70% 70% 30% / 30% 30% 70% 70%",
                    "70% 30% 30% 70% / 70% 70% 30% 30%",
                    "25% 75% 60% 40% / 55% 25% 75% 45%",
                    "65% 35% 40% 60% / 35% 65% 35% 65%",
                    "30% 70% 70% 30% / 30% 30% 70% 70%",
                  ],
                }
              : variant === "speaking"
              ? {
                  scale: [0.82, 1.3, 0.78, 1.25, 0.82],
                  borderRadius: [
                    "20% 80% 40% 60% / 70% 30% 70% 30%",
                    "80% 20% 60% 40% / 30% 70% 30% 70%",
                    "35% 65% 25% 75% / 65% 35% 75% 25%",
                    "20% 80% 40% 60% / 70% 30% 70% 30%",
                  ],
                }
              : variant === "pulse"
              ? {
                  scale: [0.8, 1.28, 0.8],
                  borderRadius: [
                    "25% 75% 75% 25% / 60% 40% 60% 40%",
                    "75% 25% 25% 75% / 40% 60% 40% 60%",
                    "25% 75% 75% 25% / 60% 40% 60% 40%",
                  ],
                }
              : {
                  scale: [0.9, 1.18, 0.9],
                  borderRadius: [
                    "35% 65% 60% 40% / 60% 40% 60% 40%",
                    "65% 35% 40% 60% / 40% 60% 40% 60%",
                    "35% 65% 60% 40% / 60% 40% 60% 40%",
                  ],
                }
          }
          transition={{
            duration: variant === "speaking" ? 1.8 : variant === "listening" ? 3 : 3.8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute rounded-full flex items-center justify-center pointer-events-none"
          style={{
            width: size * 0.54,
            height: size * 0.54,
            background: `linear-gradient(135deg, ${color}, ${colorSecondary}, ${colorTertiary})`,
            boxShadow: `inset 0 2px 4px rgba(255,255,255,0.4), 0 8px 20px rgba(0,0,0,0.15)`,
          }}
        />

        {/* Orbiting Satellite Liquid Drops - Deep Fluid Fusion */}
        {[0, 1, 2, 3, 4].map((i) => {
          const angle = (i * 360) / 5;
          const orbitRadius = size * (0.24 + (i % 2) * 0.05);
          const dropSize = size * (0.2 + (i % 3) * 0.04);

          return (
            <motion.div
              key={i}
              animate={{
                rotate: variant === "speaking" ? [angle, angle - 360] : [angle, angle + 360],
              }}
              transition={{
                duration: variant === "speaking" ? 3.5 : 6 + i * 1.2,
                repeat: Infinity,
                ease: "linear",
              }}
              className="absolute rounded-full flex items-center justify-center pointer-events-none"
              style={{
                width: size * 0.72,
                height: size * 0.72,
                transformOrigin: "center center",
              }}
            >
              <motion.div
                animate={{
                  scale: [0.65, 1.45, 0.65],
                  borderRadius: [
                    "25% 75% 75% 25% / 60% 40% 60% 40%",
                    "75% 25% 25% 75% / 40% 60% 40% 60%",
                    "25% 75% 75% 25% / 60% 40% 60% 40%",
                  ],
                }}
                transition={{
                  duration: 2.2 + i * 0.4,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: i * 0.25,
                }}
                className="rounded-full"
                style={{
                  width: dropSize,
                  height: dropSize,
                  background:
                    i % 2 === 0
                      ? `linear-gradient(135deg, ${color}, ${colorSecondary}, ${colorTertiary})`
                      : `linear-gradient(225deg, ${colorTertiary}, ${color}, ${colorSecondary})`,
                  boxShadow: `inset 0 1px 3px rgba(255,255,255,0.4)`,
                  transform: `translate(${orbitRadius * Math.cos((angle * Math.PI) / 180)}px, ${
                    orbitRadius * Math.sin((angle * Math.PI) / 180)
                  }px)`,
                }}
              />
            </motion.div>
          );
        })}
      </div>

      {/* ── Center Micro-Interactive Mic / Voice Orb with 5 Mode-Specific 3-Bar Equalizers ── */}
      <div className="absolute inset-0 flex items-center justify-center z-10">
        <motion.button
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.92 }}
          onClick={onMicClick}
          className={`
            relative w-14 h-14 rounded-full bg-black/30 dark:bg-black/50 backdrop-blur-md
            border border-white/50 shadow-lg flex items-center justify-center
            text-white transition-all cursor-pointer group hover:bg-black/40
          `}
        >
          {centerContent ? (
            centerContent
          ) : isListening ? (
            <div className="flex items-center justify-center gap-1">
              {/* 1. LISTENING MODE: Dynamic Audio Mic Equalizer Bounce */}
              {variant === "listening" && (
                <>
                  <motion.span
                    animate={{ height: ["8px", "22px", "8px"] }}
                    transition={{ duration: 0.6, repeat: Infinity, ease: "easeInOut" }}
                    className="w-1 bg-white rounded-full shadow-xs"
                  />
                  <motion.span
                    animate={{ height: ["14px", "28px", "14px"] }}
                    transition={{ duration: 0.6, delay: 0.15, repeat: Infinity, ease: "easeInOut" }}
                    className="w-1 bg-white rounded-full shadow-xs"
                  />
                  <motion.span
                    animate={{ height: ["6px", "18px", "6px"] }}
                    transition={{ duration: 0.6, delay: 0.3, repeat: Infinity, ease: "easeInOut" }}
                    className="w-1 bg-white rounded-full shadow-xs"
                  />
                </>
              )}

              {/* 2. THINKING MODE: Floating Loading Wave Dots */}
              {variant === "thinking" && (
                <>
                  <motion.span
                    animate={{ y: [-4, 4, -4], opacity: [0.4, 1, 0.4] }}
                    transition={{ duration: 0.8, repeat: Infinity, ease: "easeInOut" }}
                    className="w-1.5 h-1.5 bg-white rounded-full shadow-xs"
                  />
                  <motion.span
                    animate={{ y: [-4, 4, -4], opacity: [0.4, 1, 0.4] }}
                    transition={{ duration: 0.8, delay: 0.2, repeat: Infinity, ease: "easeInOut" }}
                    className="w-1.5 h-1.5 bg-white rounded-full shadow-xs"
                  />
                  <motion.span
                    animate={{ y: [-4, 4, -4], opacity: [0.4, 1, 0.4] }}
                    transition={{ duration: 0.8, delay: 0.4, repeat: Infinity, ease: "easeInOut" }}
                    className="w-1.5 h-1.5 bg-white rounded-full shadow-xs"
                  />
                </>
              )}

              {/* 3. SPEAKING MODE: High Energy Rapid Speech Oscillation */}
              {variant === "speaking" && (
                <>
                  <motion.span
                    animate={{ height: ["4px", "26px", "10px", "24px", "4px"] }}
                    transition={{ duration: 0.4, repeat: Infinity, ease: "easeInOut" }}
                    className="w-1 bg-white rounded-full shadow-xs"
                  />
                  <motion.span
                    animate={{ height: ["24px", "8px", "28px", "6px", "24px"] }}
                    transition={{ duration: 0.4, delay: 0.1, repeat: Infinity, ease: "easeInOut" }}
                    className="w-1 bg-white rounded-full shadow-xs"
                  />
                  <motion.span
                    animate={{ height: ["10px", "22px", "4px", "26px", "10px"] }}
                    transition={{ duration: 0.4, delay: 0.2, repeat: Infinity, ease: "easeInOut" }}
                    className="w-1 bg-white rounded-full shadow-xs"
                  />
                </>
              )}

              {/* 4. ORBIT MODE: Rotating 3-Dot Orbital Loop */}
              {variant === "orbit" && (
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1.6, repeat: Infinity, ease: "linear" }}
                  className="flex items-center gap-1"
                >
                  <span className="w-1.5 h-1.5 bg-white rounded-full shadow-xs" />
                  <span className="w-1.5 h-1.5 bg-white/70 rounded-full shadow-xs" />
                  <span className="w-1.5 h-1.5 bg-white/30 rounded-full shadow-xs" />
                </motion.div>
              )}

              {/* 5. PULSE MODE: Synchronized Breathing Equalizer Pulse */}
              {variant === "pulse" && (
                <>
                  <motion.span
                    animate={{ scaleY: [0.5, 1.4, 0.5] }}
                    transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
                    className="w-1 h-5 bg-white rounded-full shadow-xs"
                  />
                  <motion.span
                    animate={{ scaleY: [0.5, 1.4, 0.5] }}
                    transition={{ duration: 1.2, delay: 0.15, repeat: Infinity, ease: "easeInOut" }}
                    className="w-1 h-5 bg-white rounded-full shadow-xs"
                  />
                  <motion.span
                    animate={{ scaleY: [0.5, 1.4, 0.5] }}
                    transition={{ duration: 1.2, delay: 0.3, repeat: Infinity, ease: "easeInOut" }}
                    className="w-1 h-5 bg-white rounded-full shadow-xs"
                  />
                </>
              )}
            </div>
          ) : (
            <MicOff className="w-5 h-5 text-white/80" />
          )}
        </motion.button>
      </div>
    </div>
  );
};

export default AiGooeyBlob;
