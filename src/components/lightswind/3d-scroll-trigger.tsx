// ThreeDScrollTrigger.tsx
"use client";

import React, {
  useRef,
  useEffect,
  useMemo,
  useContext,
} from "react";
import { cn } from "@/lib/utils";

/* -------------------------
   Utility: wrap (backward compatibility)
   ------------------------- */
export const wrap = (min: number, max: number, v: number) => {
  const rangeSize = max - min;
  return ((((v - min) % rangeSize) + rangeSize) % rangeSize) + min;
};

/* -----------------------------------
   Context for passive scroll velocity
   ----------------------------------- */
interface ScrollVelocityContextType {
  getVelocity: () => number;
}

const ThreeDScrollTriggerContext =
  React.createContext<ScrollVelocityContextType>({
    getVelocity: () => 0,
  });

/* --------------------------
   Container that tracks scroll velocity passively without re-renders
   -------------------------- */
export function ThreeDScrollTriggerContainer({
  children,
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  const targetVelocityRef = useRef(0);
  const lastScrollY = useRef(0);
  const lastTime = useRef(0);
  const decayTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    lastScrollY.current = window.scrollY;
    lastTime.current = performance.now();

    const handleScroll = () => {
      const now = performance.now();
      const dt = now - lastTime.current;
      if (dt <= 0) return;

      const currentScrollY = window.scrollY;
      const deltaY = currentScrollY - lastScrollY.current;

      // Calculate instant velocity in px/second (clamped to realistic range [-2500, 2500])
      const instantVelocity = (deltaY / Math.max(6, dt)) * 1000;
      targetVelocityRef.current = Math.max(-2500, Math.min(2500, instantVelocity));

      lastScrollY.current = currentScrollY;
      lastTime.current = now;

      // When active continuous scrolling ceases, decay target velocity to zero
      if (decayTimeoutRef.current) clearTimeout(decayTimeoutRef.current);
      decayTimeoutRef.current = setTimeout(() => {
        targetVelocityRef.current = 0;
      }, 50);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (decayTimeoutRef.current) clearTimeout(decayTimeoutRef.current);
    };
  }, []);

  const contextValue = useMemo(
    () => ({
      getVelocity: () => targetVelocityRef.current,
    }),
    []
  );

  return (
    <ThreeDScrollTriggerContext.Provider value={contextValue}>
      <div
        className={cn(
          "relative w-full overflow-hidden [perspective:1200px]",
          className
        )}
        {...props}
      >
        {children}
      </div>
    </ThreeDScrollTriggerContext.Provider>
  );
}

/* --------------------------
   Props
   -------------------------- */
export interface ThreeDScrollTriggerRowProps
  extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  baseVelocity?: number; // Speed multiplier (e.g. 5, 6)
  direction?: 1 | -1;
  resetIntervalMs?: number;
  tiltEffect?: boolean; // Dynamic 3D card tilt angle during scroll
}

/* --------------------------
   High-FPS GPU-Accelerated 3D Row
   -------------------------- */
export function ThreeDScrollTriggerRow({
  children,
  baseVelocity = 5,
  direction = 1,
  tiltEffect = true,
  className,
  ...props
}: ThreeDScrollTriggerRowProps) {
  const context = useContext(ThreeDScrollTriggerContext);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const singleBlockRef = useRef<HTMLDivElement | null>(null);

  const xRef = useRef(0);
  const unitWidthRef = useRef(0);
  const smoothVelocityRef = useRef(0);
  const smoothTiltRef = useRef(0);
  const isInViewRef = useRef(false);
  const rafIdRef = useRef<number | null>(null);
  const startAnimationRef = useRef<(() => void) | null>(null);

  // Measure single block width with ResizeObserver & sub-pixel precision
  useEffect(() => {
    const measure = () => {
      if (singleBlockRef.current) {
        const rect = singleBlockRef.current.getBoundingClientRect();
        unitWidthRef.current = rect.width || singleBlockRef.current.offsetWidth || 0;
      }
    };
    measure();

    let ro: ResizeObserver | null = null;
    if (typeof ResizeObserver !== "undefined" && singleBlockRef.current) {
      ro = new ResizeObserver(measure);
      ro.observe(singleBlockRef.current);
    }
    window.addEventListener("resize", measure, { passive: true });
    return () => {
      ro?.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [children]);

  // Viewport intersection observer: completely halt rAF when scrolled away
  useEffect(() => {
    const el = containerRef.current;
    if (!el || typeof IntersectionObserver === "undefined") {
      isInViewRef.current = true;
      return;
    }

    const io = new IntersectionObserver(
      ([entry]) => {
        const wasInView = isInViewRef.current;
        isInViewRef.current = entry && entry.isIntersecting;
        if (isInViewRef.current && !wasInView && startAnimationRef.current) {
          startAnimationRef.current();
        }
      },
      { rootMargin: "250px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  // Ultra-Smooth Direct-GPU Animation Loop (120 FPS, 0 React re-renders)
  useEffect(() => {
    let lastTime = performance.now();

    const animate = (now: number) => {
      if (!isInViewRef.current) {
        // Completely halt rAF scheduling when not in view
        return;
      }

      // Safe delta time clamped to avoid jumps after tab switch / pause
      const dt = Math.min(0.04, Math.max(0.001, (now - lastTime) / 1000));
      lastTime = now;

      // 1. Smoothly interpolate velocity using exponential damping (frame-rate independent)
      const targetVelocity = context?.getVelocity() || 0;
      const lerpFactor = 1 - Math.exp(-12 * dt);
      smoothVelocityRef.current += (targetVelocity - smoothVelocityRef.current) * lerpFactor;

      const unitWidth = unitWidthRef.current;
      if (unitWidth > 0) {
        // 2. Base cruising speed (~26px/sec per baseVelocity unit)
        const baseSpeed = Math.abs(baseVelocity) * 26;

        // 3. Dynamic scroll velocity boost
        const scrollBoost = Math.abs(smoothVelocityRef.current) * 0.45;

        // 4. Direction handling:
        // When scrolling down (velocity >= 0): row cruises and accelerates in its configured direction
        // When scrolling up towards top (velocity < 0): row smoothly reverses and accelerates backwards
        const isScrollingUp = smoothVelocityRef.current < -30;
        const scrollDirection = isScrollingUp ? -1 : 1;
        const effectiveDirection = direction * scrollDirection;

        // 5. Compute net frame movement
        const currentSpeed = effectiveDirection * (baseSpeed + scrollBoost);
        const moveDelta = currentSpeed * dt;
        xRef.current += moveDelta;

        // 6. Seamless continuous modulo wrapping (works flawlessly for positive and negative values)
        xRef.current = ((xRef.current % unitWidth) + unitWidth) % unitWidth;

        // 7. Dynamic 3D card tilt angle (reacts smoothly to scroll velocity & direction)
        let tiltTransform = "";
        if (tiltEffect) {
          const targetTilt = Math.max(-4.5, Math.min(4.5, (currentSpeed / 200) * 1.8));
          const tiltLerp = 1 - Math.exp(-14 * dt);
          smoothTiltRef.current += (targetTilt - smoothTiltRef.current) * tiltLerp;
          tiltTransform = ` skewX(${-smoothTiltRef.current}deg)`;
        }

        // 8. Direct hardware-accelerated transform on GPU compositor
        if (trackRef.current) {
          trackRef.current.style.transform = `translate3d(${-xRef.current}px, 0, 0)${tiltTransform}`;
        }
      }

      rafIdRef.current = requestAnimationFrame(animate);
    };

    startAnimationRef.current = () => {
      lastTime = performance.now();
      if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = requestAnimationFrame(animate);
    };

    if (isInViewRef.current) {
      startAnimationRef.current();
    }

    return () => {
      startAnimationRef.current = null;
      if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
    };
  }, [baseVelocity, direction, tiltEffect, context]);

  const childrenArray = useMemo(
    () => React.Children.toArray(children),
    [children]
  );

  return (
    <div
      ref={containerRef}
      className={cn(
        "w-full overflow-hidden whitespace-nowrap [perspective:1200px]",
        className
      )}
      {...props}
    >
      <div
        ref={trackRef}
        className="inline-flex will-change-transform transform-gpu select-none"
        style={{
          transform: "translate3d(0, 0, 0)",
          contain: "layout paint",
        }}
      >
        {/* Set 1: Measured Reference Block */}
        <div ref={singleBlockRef} className="inline-flex shrink-0">
          {childrenArray}
        </div>
        {/* Set 2: Seamless Clone */}
        <div className="inline-flex shrink-0" aria-hidden="true">
          {childrenArray}
        </div>
        {/* Set 3: Seamless Clone */}
        <div className="inline-flex shrink-0" aria-hidden="true">
          {childrenArray}
        </div>
        {/* Set 4: Seamless Clone for ultra-wide displays */}
        <div className="inline-flex shrink-0" aria-hidden="true">
          {childrenArray}
        </div>
      </div>
    </div>
  );
}

export default ThreeDScrollTriggerRow;