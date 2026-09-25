import React, { forwardRef, CSSProperties, SVGProps } from "react";
import { Wifi, Battery, Signal } from "lucide-react";

export type Iphone16ProFinish = "theme" | "black" | "white" | "natural" | "desert" | "cosmic" | string;

export interface Iphone16ProProps extends SVGProps<SVGSVGElement> {
    /** Device frame width (base SVG width) */
    width?: number;
    /** Device frame height (base SVG height) */
    height?: number;
    /** Titanium finish preset ("theme" | "black" | "white" | "natural" | "desert" | "cosmic") or custom hex color */
    finish?: Iphone16ProFinish;
    /** Image URL source for screen */
    src?: string;
    /** Video URL source for screen */
    videoSrc?: string;
    /** Custom wallpaper gradient or color for screen */
    wallpaper?: string;
    /** Custom React nodes/children to render inside the iPhone screen */
    children?: React.ReactNode;
    /** Toggle Dynamic Island pill */
    showIsland?: boolean;
    /** Custom content inside expanded Dynamic Island on hover */
    islandContent?: React.ReactNode;
    /** Island width */
    islandWidth?: number;
    /** Island height */
    islandHeight?: number;
    /** Frame color (light mode override) */
    frameColor?: string;
    /** Frame color (dark mode override) */
    frameDarkColor?: string;
    /** Bezel color */
    bezelColor?: string;
    /** Screen border radius */
    screenRadius?: number;
    /** Enable drop shadow */
    shadow?: boolean;
    /** Rounded outer frame corners */
    rounded?: boolean;
    /** Class for inner content container */
    contentClassName?: string;
    /** Custom styles for inner content */
    contentStyle?: CSSProperties;
    /** Toggle camera lens dot */
    showCamera?: boolean;
    /** Background gradient for screen */
    screenGradient?: string;
    /** Enable smooth hover tilt animation */
    hoverAnimation?: boolean;
    /** Rotation angle in degrees (e.g. 0, 15, -15, 90) */
    rotate?: number;
    /** Enable continuous smooth floating & rotating 3D animation */
    autoRotate?: boolean;
    /** Device orientation: "portrait" | "landscape" */
    orientation?: "portrait" | "landscape";
    /** Toggle top iOS Status Bar (Time, WiFi, Battery) */
    showStatusBar?: boolean;
    /** Custom time string for status bar (default: "9:41") */
    statusTime?: string;
    /** Toggle bottom iOS Home Indicator bar */
    showHomeIndicator?: boolean;
    /** Toggle subtle glass glare reflection overlay */
    glassReflection?: boolean;
}

const FINISH_PRESETS: Record<string, { frame: string; stroke: string; bezel: string }> = {
    theme: {
        frame: "fill-black stroke-neutral-800 dark:fill-neutral-100 dark:stroke-neutral-300",
        stroke: "stroke-neutral-800 dark:stroke-neutral-300",
        bezel: "fill-black",
    },
    black: {
        frame: "fill-[#141416] dark:fill-[#0a0a0c]",
        stroke: "stroke-[#2a2a2d] dark:stroke-[#202022]",
        bezel: "fill-black",
    },
    white: {
        frame: "fill-[#ffffff] dark:fill-[#f0f0f4]",
        stroke: "stroke-[#e2e2e7] dark:stroke-[#d0d0d5]",
        bezel: "fill-black",
    },
    natural: {
        frame: "fill-[#c5c2bb] dark:fill-[#7a7771]",
        stroke: "stroke-[#dfdcd6] dark:stroke-[#5a5752]",
        bezel: "fill-[#141416]",
    },
    desert: {
        frame: "fill-[#e2d5c3] dark:fill-[#8a7d6e]",
        stroke: "stroke-[#f2e7d7] dark:stroke-[#695d4e]",
        bezel: "fill-[#141416]",
    },
    cosmic: {
        frame: "fill-[#f97316] dark:fill-[#ea580c]",
        stroke: "stroke-[#fdba74] dark:stroke-[#c2410c]",
        bezel: "fill-[#141416]",
    },
};

export const Iphone16Pro = forwardRef<SVGSVGElement, Iphone16ProProps>(
    (
        {
            width = 433,
            height = 882,
            finish = "theme",
            rotate = 0,
            autoRotate = false,
            orientation = "portrait",
            src,
            videoSrc,
            wallpaper = "bg-gradient-to-tr from-slate-950 via-indigo-950 to-slate-900",
            children,
            showIsland = true,
            islandContent,
            islandWidth = 124,
            islandHeight = 35,
            frameColor,
            frameDarkColor,
            bezelColor = "black",
            screenRadius = 50,
            shadow = true,
            rounded = true,
            contentClassName = "",
            contentStyle,
            showCamera = true,
            screenGradient,
            hoverAnimation = true,
            showStatusBar = true,
            statusTime = "9:41",
            showHomeIndicator = true,
            glassReflection = true,
            className = "",
            style,
            ...props
        }: Iphone16ProProps,
        ref
    ) => {
        const finishStyle = FINISH_PRESETS[finish] || {
            frame: frameColor ? `fill-[${frameColor}]` : FINISH_PRESETS.theme.frame,
            stroke: "stroke-gray-300 dark:stroke-white/20",
            bezel: "fill-black",
        };

        const finalRotate = orientation === "landscape" ? rotate + 90 : rotate;
        const screenX = 18;
        const screenY = 18;
        const screenW = width - 36; // 397
        const screenH = height - 36; // 846

        return (
            <svg
                ref={ref}
                viewBox={`0 0 ${width} ${height}`}
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                style={{
                    transform: !autoRotate && finalRotate !== 0 ? `rotate(${finalRotate}deg)` : undefined,
                    transition: "transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)",
                    ...style,
                }}
                className={`
                    w-full h-auto max-w-[433px] max-h-[85vh] mx-auto block select-none
                    ${shadow ? "drop-shadow-[0_25px_50px_rgba(0,0,0,0.35)] dark:drop-shadow-[0_25px_50px_rgba(0,0,0,0.7)]" : ""}
                    ${hoverAnimation && !autoRotate ? "transition-transform duration-500 hover:scale-[1.015]" : ""}
                    ${autoRotate ? "animate-iphone-float-rotate" : ""}
                    ${className}
                `}
                {...props}
            >
                <defs>
                    {autoRotate && (
                        <style>
                            {`
                                @keyframes iphone-float-rotate {
                                    0%, 100% { transform: translateY(0px) rotate(${finalRotate}deg) scale(1); }
                                    25% { transform: translateY(-10px) rotate(${finalRotate + 5}deg) scale(1.01); }
                                    50% { transform: translateY(-18px) rotate(${finalRotate}deg) scale(1.02); }
                                    75% { transform: translateY(-10px) rotate(${finalRotate - 5}deg) scale(1.01); }
                                }
                                .animate-iphone-float-rotate {
                                    animation: iphone-float-rotate 8s ease-in-out infinite;
                                    transform-origin: center center;
                                }
                            `}
                        </style>
                    )}
                </defs>
                {/* ── Side Buttons (iPhone 16 Pro Layout) ── */}
                {/* Action Button (Left) */}
                <rect x="0" y="165" width="4" height="32" rx="2" className="fill-[#68655f] dark:fill-[#403e3a]" />
                {/* Volume Up (Left) */}
                <rect x="0" y="215" width="4" height="60" rx="2" className="fill-[#68655f] dark:fill-[#403e3a]" />
                {/* Volume Down (Left) */}
                <rect x="0" y="290" width="4" height="60" rx="2" className="fill-[#68655f] dark:fill-[#403e3a]" />
                {/* Power Button (Right) */}
                <rect x={width - 4} y="225" width="4" height="96" rx="2" className="fill-[#68655f] dark:fill-[#403e3a]" />
                {/* Camera Control Button (Right - New in iPhone 16) */}
                <rect x={width - 4} y="635" width="4" height="68" rx="2" className="fill-[#68655f]/80 dark:fill-[#403e3a]/80" />

                {/* ── Outer Titanium Frame ── */}
                <rect
                    x="3"
                    y="3"
                    width={width - 6}
                    height={height - 6}
                    rx={rounded ? 68 : 0}
                    className={`${finishStyle.frame} ${finishStyle.stroke}`}
                    strokeWidth="3"
                />

                {/* Inner Antenna/Chassis Bezel Accent */}
                <rect
                    x="12"
                    y="12"
                    width={width - 24}
                    height={height - 24}
                    rx={rounded ? 58 : 0}
                    className="fill-black stroke-neutral-900/80"
                    strokeWidth="2"
                />

                {/* Screen Clip Path */}
                <clipPath id="iphone-screen-clip">
                    <rect
                        x={screenX}
                        y={screenY}
                        width={screenW}
                        height={screenH}
                        rx={screenRadius}
                        ry={screenRadius}
                    />
                </clipPath>

                {/* ── Screen Area (foreignObject for Full React / Image / Video Rendering) ── */}
                <foreignObject
                    x={screenX}
                    y={screenY}
                    width={screenW}
                    height={screenH}
                    clipPath="url(#iphone-screen-clip)"
                >
                    <div
                        className={`relative w-full h-full overflow-hidden flex flex-col justify-between ${
                            screenGradient ? "" : wallpaper
                        } ${contentClassName}`}
                        style={{
                            borderRadius: `${screenRadius}px`,
                            background: screenGradient
                                ? `linear-gradient(135deg, ${screenGradient})`
                                : undefined,
                            ...contentStyle,
                        }}
                    >
                        {/* Background Image / Video if provided */}
                        {src && (
                            <img
                                src={src}
                                alt="iPhone Screen"
                                className="absolute inset-0 w-full h-full object-cover z-0"
                            />
                        )}
                        {videoSrc && (
                            <video
                                src={videoSrc}
                                autoPlay
                                loop
                                muted
                                playsInline
                                className="absolute inset-0 w-full h-full object-cover z-0"
                            />
                        )}

                        {/* Custom Children Layout */}
                        {children && (
                            <div className="relative z-10 w-full h-full overflow-auto">
                                {children}
                            </div>
                        )}

                        {/* Default Content Placeholder if no src/children passed */}
                        {!src && !videoSrc && !children && (
                            <div className="relative z-0 w-full h-full flex flex-col items-center justify-center p-6 text-center text-white/90">
                                <div className="w-16 h-16 rounded-3xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center mb-4 shadow-xl">
                                    <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
                                    </svg>
                                </div>
                                <h3 className="text-xl font-extrabold tracking-tight text-white mb-1">iPhone 16 Pro</h3>
                                <p className="text-xs text-white/70 max-w-[240px] leading-relaxed">
                                    Titanium design with Super Retina XDR &amp; Dynamic Island
                                </p>
                            </div>
                        )}

                        {/* ── Top Status Bar Overlay (iOS Native Style) ── */}
                        {showStatusBar && (
                            <div className="absolute top-0 left-0 right-0 z-30 pt-3.5 px-7 flex items-center justify-between pointer-events-none text-white font-sans text-xs">
                                <span className="font-semibold tracking-tight text-[13px] pl-1">
                                    {statusTime}
                                </span>
                                <div className="flex items-center gap-1.5 opacity-90 pr-1">
                                    <Signal className="w-3.5 h-3.5 fill-current" />
                                    <Wifi className="w-3.5 h-3.5 stroke-[2.5]" />
                                    <Battery className="w-4 h-4 fill-current stroke-[1.5]" />
                                </div>
                            </div>
                        )}

                        {/* ── Dynamic Island Pill ── */}
                        {showIsland && (
                            <div className="absolute top-2.5 left-1/2 -translate-x-1/2 z-40 group cursor-pointer">
                                <div
                                    className="bg-black rounded-full flex items-center justify-between px-3 text-white transition-all duration-300 shadow-lg border border-white/10 group-hover:w-[190px] group-hover:h-[42px]"
                                    style={{
                                        width: `${islandWidth}px`,
                                        height: `${islandHeight}px`,
                                    }}
                                >
                                    {islandContent ? (
                                        islandContent
                                    ) : (
                                        <>
                                            <div className="flex items-center gap-2">
                                                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                                                <span className="text-[10px] font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-200 truncate max-w-[100px]">
                                                    Live Activity
                                                </span>
                                            </div>
                                            {showCamera && (
                                                <div className="w-3.5 h-3.5 rounded-full bg-neutral-900 border border-neutral-700/80 flex items-center justify-center shrink-0">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-950/80" />
                                                </div>
                                            )}
                                        </>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* ── Glass Reflection Overlay ── */}
                        {glassReflection && (
                            <div className="absolute inset-0 z-20 pointer-events-none bg-gradient-to-tr from-transparent via-white/[0.07] to-transparent" />
                        )}

                        {/* ── Bottom Home Indicator Bar ── */}
                        {showHomeIndicator && (
                            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-30 w-32 h-1 bg-white/40 backdrop-blur-sm rounded-full pointer-events-none" />
                        )}
                    </div>
                </foreignObject>

                {/* Optional Linear Gradient Definition for Screen */}
                {screenGradient && (
                    <defs>
                        <linearGradient id="gradient" x1="0" y1="0" x2="1" y2="1">
                            <stop offset="0%" stopColor={screenGradient.split(",")[0]} />
                            <stop offset="100%" stopColor={screenGradient.split(",")[1] || screenGradient.split(",")[0]} />
                        </linearGradient>
                    </defs>
                )}
            </svg>
        );
    }
);

Iphone16Pro.displayName = "Iphone16Pro";

