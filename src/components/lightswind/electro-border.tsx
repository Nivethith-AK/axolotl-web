"use client";

import React, {
    useRef,
    useLayoutEffect,
    useEffect,
    useId,
    CSSProperties,
    PropsWithChildren,
    useCallback,
} from "react";

/* -----------------------------
   🔧 Utility: HEX → RGBA
------------------------------ */
const toRGBA = (color: string, alpha = 1): string => {
    if (!color) return `rgba(0, 255, 252, ${alpha})`;

    if (color.startsWith("#")) {
        const hex = color.length === 4
            ? `#${color[1]}${color[1]}${color[2]}${color[2]}${color[3]}${color[3]}`
            : color;

        if (hex.length === 7) {
            const r = parseInt(hex.slice(1, 3), 16);
            const g = parseInt(hex.slice(3, 5), 16);
            const b = parseInt(hex.slice(5, 7), 16);
            return `rgba(${r}, ${g}, ${b}, ${alpha})`;
        }
    }

    if (typeof window === "undefined") return color;

    try {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (!ctx) return color;
        ctx.fillStyle = color;
        const computed = ctx.fillStyle;

        if (computed.startsWith("rgba")) {
            return computed.replace(/[\d.]+\)$/g, `${alpha})`);
        }
        if (computed.startsWith("rgb")) {
            return computed.replace("rgb", "rgba").replace(")", `, ${alpha})`);
        }
        if (computed.startsWith("#")) {
            const r = parseInt(computed.slice(1, 3), 16);
            const g = parseInt(computed.slice(3, 5), 16);
            const b = parseInt(computed.slice(5, 7), 16);
            return `rgba(${r}, ${g}, ${b}, ${alpha})`;
        }
    } catch {
        return color;
    }
    return color;
};

/* -----------------------------
   ⚙️ Props Definition
------------------------------ */
export interface ElectroBorderProps extends PropsWithChildren {
    /** Border electric neon color (e.g., #00fffc, #ff7700, #ff007f) */
    borderColor?: string;
    /** Custom card background color / gradient (optional, auto theme-adaptive by default) */
    cardBackground?: string;
    /** Border thickness in px (default 2) */
    borderWidth?: number;
    /** Animation distortion intensity (default 1) */
    distortion?: number;
    /** Animation speed multiplier (default 1) */
    animationSpeed?: number;
    /** Border radius (default "24px") */
    radius?: string | number;

    /** 🔘 Enable outer glow effects (default true) */
    glow?: boolean;
    /** 🔘 Enable aura background reflection (default true) */
    aura?: boolean;
    /** 🔘 Enable glossy light overlays (default true) */
    overlay?: boolean;
    /** 🔘 Master toggle for all decorative layers */
    effects?: boolean;

    /** Glow blur intensity */
    glowBlur?: number;
    /** Number of octaves for the turbulence noise filter (default 2 for optimal 60fps performance) */
    numOctaves?: number;
    className?: string;
    style?: CSSProperties;
}

/* -----------------------------
   ⚡ ElectroBorder Component
------------------------------ */
export const ElectroBorder: React.FC<ElectroBorderProps> = ({
    children,
    borderColor = "#00fffc",
    cardBackground,
    borderWidth = 2,
    distortion = 1,
    animationSpeed = 1,
    radius = "24px",
    glow = true,
    aura = true,
    overlay = true,
    effects = true,
    glowBlur = 32,
    numOctaves = 2,
    className,
    style,
}) => {
    const rootRef = useRef<HTMLDivElement>(null);
    const svgRef = useRef<SVGSVGElement>(null);
    const mainCardRef = useRef<HTMLDivElement>(null);
    const rawId = useId();
    const filterId = `turbulent-displace-${rawId.replace(/[^a-zA-Z0-9_-]/g, "")}`;

    const parsedRadius = typeof radius === "number" ? `${radius}px` : radius;

    /* -----------------------------
       🔄 Filter Animation Control
    ------------------------------ */
    const updateFilter = useCallback((wOverride?: number, hOverride?: number) => {
        const svg = svgRef.current;
        const root = rootRef.current;
        if (!svg || !root) return;

        let w = wOverride;
        let h = hOverride;
        if (!w || !h) {
            const rect = root.getBoundingClientRect();
            w = Math.max(100, Math.round(rect.width || 350));
            h = Math.max(100, Math.round(rect.height || 500));
        }

        const dy1 = svg.querySelector<SVGAnimateElement>(`#${filterId}-dy-anim-1`);
        const dy2 = svg.querySelector<SVGAnimateElement>(`#${filterId}-dy-anim-2`);
        const dx1 = svg.querySelector<SVGAnimateElement>(`#${filterId}-dx-anim-1`);
        const dx2 = svg.querySelector<SVGAnimateElement>(`#${filterId}-dx-anim-2`);

        if (dy1) dy1.setAttribute("values", `${h}; 0`);
        if (dy2) dy2.setAttribute("values", `0; -${h}`);
        if (dx1) dx1.setAttribute("values", `${w}; 0`);
        if (dx2) dx2.setAttribute("values", `0; -${w}`);

        const duration = Math.max(0.1, 6 / Math.max(0.1, animationSpeed));
        const animations = [dy1, dy2, dx1, dx2];
        animations.forEach((anim) => {
            if (anim) {
                anim.setAttribute("dur", `${duration}s`);
                if ((anim as any).beginElement) {
                    try {
                        (anim as any).beginElement();
                    } catch {}
                }
            }
        });

        const disp = svg.querySelector("feDisplacementMap");
        if (disp) {
            disp.setAttribute("scale", `${30 * distortion}`);
        }
    }, [animationSpeed, distortion, filterId]);

    useLayoutEffect(() => {
        updateFilter();
        const root = rootRef.current;
        if (!root) return;
        const observer = new ResizeObserver((entries) => {
            if (entries[0]) {
                const { width, height } = entries[0].contentRect;
                if (width && height) {
                    updateFilter(Math.round(width), Math.round(height));
                }
            }
        });
        observer.observe(root);
        return () => observer.disconnect();
    }, [updateFilter]);

    useEffect(() => {
        updateFilter();
    }, [updateFilter]);

    // Viewport-aware performance optimization: pause SMIL animations when off-screen
    useEffect(() => {
        const root = rootRef.current;
        const svg = svgRef.current;
        if (!root || !svg || typeof IntersectionObserver === "undefined") return;

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry && entry.isIntersecting) {
                    try {
                        if (typeof svg.unpauseAnimations === "function") {
                            svg.unpauseAnimations();
                        }
                    } catch {}
                } else {
                    try {
                        if (typeof svg.pauseAnimations === "function") {
                            svg.pauseAnimations();
                        }
                    } catch {}
                }
            },
            { rootMargin: "250px" }
        );

        observer.observe(root);
        return () => observer.disconnect();
    }, []);

    const gradientColor = toRGBA(borderColor, 0.25);
    const electricLight = toRGBA(borderColor, 0.9);
    const electricDim = toRGBA(borderColor, 0.5);

    return (
        <div
            ref={rootRef}
            className={`relative p-[2px] ${className ?? ""}`}
            style={{
                borderRadius: parsedRadius,
                ...style,
            }}
        >
            {/* Theme-Adaptive Card Background Layer (No hard shadow) */}
            <div
                className="absolute inset-0 pointer-events-none bg-gradient-to-b from-white to-zinc-50/90 dark:from-[#141417] dark:to-[#0c0c0e]"
                style={{
                    borderRadius: parsedRadius,
                    background: cardBackground ? cardBackground : undefined,
                }}
            />

            {/* Subtle Gradient Color Tint */}
            {!cardBackground && (
                <div
                    className="absolute inset-0 pointer-events-none opacity-25 dark:opacity-60"
                    style={{
                        borderRadius: parsedRadius,
                        background: `linear-gradient(-30deg, ${gradientColor}, transparent, ${gradientColor})`,
                    }}
                />
            )}

            {/* SVG Filter Definition */}
            <svg
                ref={svgRef}
                className="absolute w-0 h-0 pointer-events-none opacity-0"
                aria-hidden="true"
                focusable="false"
            >
                <defs>
                    <filter
                        id={filterId}
                        colorInterpolationFilters="sRGB"
                        x="-20%"
                        y="-20%"
                        width="140%"
                        height="140%"
                    >
                        <feTurbulence
                            type="turbulence"
                            baseFrequency="0.02"
                            numOctaves={numOctaves}
                            result="noise1"
                            seed="1"
                        />
                        <feOffset in="noise1" dx="0" dy="0" result="offsetNoise1">
                            <animate
                                id={`${filterId}-dy-anim-1`}
                                attributeName="dy"
                                values="700; 0"
                                dur="6s"
                                repeatCount="indefinite"
                                calcMode="linear"
                            />
                        </feOffset>

                        <feTurbulence
                            type="turbulence"
                            baseFrequency="0.02"
                            numOctaves={numOctaves}
                            result="noise2"
                            seed="1"
                        />
                        <feOffset in="noise2" dx="0" dy="0" result="offsetNoise2">
                            <animate
                                id={`${filterId}-dy-anim-2`}
                                attributeName="dy"
                                values="0; -700"
                                dur="6s"
                                repeatCount="indefinite"
                                calcMode="linear"
                            />
                        </feOffset>

                        <feTurbulence
                            type="turbulence"
                            baseFrequency="0.02"
                            numOctaves={numOctaves}
                            result="noise3"
                            seed="2"
                        />
                        <feOffset in="noise3" dx="0" dy="0" result="offsetNoise3">
                            <animate
                                id={`${filterId}-dx-anim-1`}
                                attributeName="dx"
                                values="490; 0"
                                dur="6s"
                                repeatCount="indefinite"
                                calcMode="linear"
                            />
                        </feOffset>

                        <feTurbulence
                            type="turbulence"
                            baseFrequency="0.02"
                            numOctaves={numOctaves}
                            result="noise4"
                            seed="2"
                        />
                        <feOffset in="noise4" dx="0" dy="0" result="offsetNoise4">
                            <animate
                                id={`${filterId}-dx-anim-2`}
                                attributeName="dx"
                                values="0; -490"
                                dur="6s"
                                repeatCount="indefinite"
                                calcMode="linear"
                            />
                        </feOffset>

                        <feComposite in="offsetNoise1" in2="offsetNoise2" result="part1" />
                        <feComposite in="offsetNoise3" in2="offsetNoise4" result="part2" />
                        <feBlend in="part1" in2="part2" mode="color-dodge" result="combinedNoise" />

                        <feDisplacementMap
                            in="SourceGraphic"
                            in2="combinedNoise"
                            scale="30"
                            xChannelSelector="R"
                            yChannelSelector="B"
                        />
                    </filter>
                </defs>
            </svg>

            {/* Inner Border Layers */}
            <div className="absolute inset-0 pointer-events-none" style={{ borderRadius: parsedRadius }}>
                {/* Outer guide border */}
                <div
                    className="absolute inset-0 pr-1 pb-1"
                    style={{
                        border: `${borderWidth}px solid ${electricDim}`,
                        borderRadius: parsedRadius,
                    }}
                >
                    {/* Main Turbulent Animated Electric Border */}
                    <div
                        ref={mainCardRef}
                        className="w-full h-full -mt-1 -ml-1"
                        style={{
                            borderRadius: parsedRadius,
                            border: `${borderWidth}px solid ${borderColor}`,
                            filter: `url(#${filterId})`,
                        }}
                    />
                </div>

                {/* Glow Layer 1 */}
                {effects && glow && (
                    <div
                        className="absolute inset-0"
                        style={{
                            border: `${borderWidth}px solid ${electricDim}`,
                            borderRadius: parsedRadius,
                            filter: "blur(1px)",
                            opacity: 0.8,
                        }}
                    />
                )}

                {/* Glow Layer 2 */}
                {effects && glow && (
                    <div
                        className="absolute inset-0"
                        style={{
                            border: `${borderWidth}px solid ${electricLight}`,
                            borderRadius: parsedRadius,
                            filter: "blur(4px)",
                            opacity: 0.9,
                        }}
                    />
                )}
            </div>

            {/* Glossy Electric Overlay */}
            {effects && overlay && (
                <div
                    className="absolute inset-0 pointer-events-none opacity-30 dark:opacity-50 mix-blend-overlay"
                    style={{
                        borderRadius: parsedRadius,
                        background: `linear-gradient(-30deg, ${electricLight}, transparent 35%, transparent 65%, ${electricLight})`,
                    }}
                />
            )}

            {/* Ambient Background Aura Glow (True Electric Theme Color) */}
            {effects && aura && (
                <div
                    className="absolute inset-0 pointer-events-none -z-10 scale-105 opacity-40 dark:opacity-60"
                    style={{
                        borderRadius: parsedRadius,
                        filter: `blur(${glowBlur}px)`,
                        background: `radial-gradient(ellipse at center, ${electricLight} 0%, ${electricDim} 40%, transparent 75%)`,
                    }}
                />
            )}

            {/* Content Slot */}
            <div className="relative z-10 w-full h-full" style={{ borderRadius: parsedRadius }}>
                {children}
            </div>
        </div>
    );
};

export default ElectroBorder;
