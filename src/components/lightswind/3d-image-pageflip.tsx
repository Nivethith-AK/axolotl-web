"use client";

import React, { useState, useEffect, useCallback, CSSProperties, forwardRef, useImperativeHandle } from "react";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight, RotateCcw } from "lucide-react";

export interface PageFlipLeaf {
    id?: string | number;
    frontImage: string;
    backImage: string;
    frontTitle?: string;
    backTitle?: string;
    frontSubtitle?: string;
    backSubtitle?: string;
    frontBadge?: string;
    backBadge?: string;
}

export interface ThreeDImagePageflipProps {
    /** Array of page leaves, each containing front and back images & metadata */
    pages?: PageFlipLeaf[];
    /** Default turned page count (0 = closed book on cover) */
    defaultTurnedIndex?: number;
    /** Controlled turned page count */
    turnedIndex?: number;
    /** Callback fired when page flip changes */
    onPageChange?: (turnedCount: number, totalLeaves: number) => void;
    /** Width of a single page in pixels (default: 230) */
    pageWidth?: number;
    /** Height of a single page in pixels (default: 330) */
    pageHeight?: number;
    /** 3D perspective depth in pixels (default: 1300) */
    perspective?: number;
    /** Maximum hover peek angle in degrees (default: 14) */
    peekAngle?: number;
    /** Total turn angle in degrees (default: 180) */
    turnAngle?: number;
    /** Transition flip animation duration in seconds (default: 0.65) */
    duration?: number;
    /** Easing curve for flip animation (default: "cubic-bezier(0.4, 0, 0.2, 1)") */
    easing?: string;
    /** Shadow intensity factor (0.0 to 1.0, default: 0.45) */
    shadowIntensity?: number;
    /** Dynamically shift spine horizontally when book is open to center the 2-page spread (default: true) */
    spineShift?: boolean;
    /** Border radius for pages (default: "10px") */
    radius?: string | number;
    /** Enable page numbering tags (default: true) */
    showPageNumbers?: boolean;
    /** Enable outer book leather spine binding (default: true) */
    showSpineBinding?: boolean;
    /** Accent glow color for active elements (default: "#00F5FF") */
    accentColor?: string;
    /** Enable automatic page flipping (default: false) */
    autoplay?: boolean;
    /** Autoplay interval in milliseconds (default: 3500) */
    autoplayInterval?: number;
    /** Pause autoplay on hover (default: true) */
    pauseOnHover?: boolean;
    /** Enable interactive click on pages to flip (default: true) */
    interactive?: boolean;
    /** Enable navigation buttons (default: true) */
    showControls?: boolean;
    /** Optional container class name */
    className?: string;
    /** Optional container inline style */
    style?: CSSProperties;
}

export interface ThreeDImagePageflipHandle {
    next: () => void;
    prev: () => void;
    reset: () => void;
    goTo: (index: number) => void;
    getTurnedCount: () => number;
    getTotalLeaves: () => number;
}

const DEFAULT_PAGES: PageFlipLeaf[] = [
    {
        id: 1,
        frontImage: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80",
        backImage: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80",
        frontTitle: "Villa Solarium",
        frontSubtitle: "Horizon Pool & Architecture",
        frontBadge: "Cover",
        backTitle: "Minimal Horizon",
        backSubtitle: "Geometric Water Pavilion",
        backBadge: "Plate 01",
    },
    {
        id: 2,
        frontImage: "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80",
        backImage: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80",
        frontTitle: "Apex Structure",
        frontSubtitle: "Parametric Glass Facade",
        frontBadge: "Plate 02",
        backTitle: "Glass Skyline",
        backSubtitle: "Monolith Metropolitan Tower",
        backBadge: "Plate 03",
    },
    {
        id: 3,
        frontImage: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80",
        backImage: "https://images.unsplash.com/photo-1511818966892-d7d671e672a2?auto=format&fit=crop&w=800&q=80",
        frontTitle: "Emerald Cascade",
        frontSubtitle: "Alpine Mist & Forest Ridge",
        frontBadge: "Plate 04",
        backTitle: "Nordic Pavilion",
        backSubtitle: "Natural Timber Canopy",
        backBadge: "Plate 05",
    },
    {
        id: 4,
        frontImage: "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=800&q=80",
        backImage: "https://images.unsplash.com/photo-1507652313519-d4e9174996dd?auto=format&fit=crop&w=800&q=80",
        frontTitle: "Warm Solarium",
        frontSubtitle: "Sunlight & Interior Loft",
        frontBadge: "Plate 06",
        backTitle: "Zen Courtyard",
        backSubtitle: "Brutalist Stone Water Feature",
        backBadge: "Plate 07",
    },
    {
        id: 5,
        frontImage: "https://images.unsplash.com/photo-1486325212027-8081e485255e?auto=format&fit=crop&w=800&q=80",
        backImage: "https://images.unsplash.com/photo-1479839672679-a46483c0e7c8?auto=format&fit=crop&w=800&q=80",
        frontTitle: "Cyber Metropolis",
        frontSubtitle: "Urban Geometric Skyline",
        frontBadge: "Plate 08",
        backTitle: "Monolith Curve",
        backSubtitle: "Brutalist Concrete Finish",
        backBadge: "Endplate",
    },
];

export const ThreeDImagePageflip = forwardRef<ThreeDImagePageflipHandle, ThreeDImagePageflipProps>(({
    pages = DEFAULT_PAGES,
    defaultTurnedIndex = 0,
    turnedIndex: controlledTurnedIndex,
    onPageChange,
    pageWidth = 230,
    pageHeight = 330,
    perspective = 1300,
    peekAngle = 14,
    turnAngle = 180,
    duration = 0.65,
    easing = "cubic-bezier(0.4, 0, 0.2, 1)",
    shadowIntensity = 0.45,
    spineShift = true,
    radius = "10px",
    showPageNumbers = true,
    showSpineBinding = true,
    accentColor = "#00F5FF",
    autoplay = false,
    autoplayInterval = 3500,
    pauseOnHover = true,
    interactive = true,
    showControls = true,
    className,
    style,
}, ref) => {
    const [internalTurned, setInternalTurned] = useState<number>(defaultTurnedIndex);
    const [isHovered, setIsHovered] = useState<boolean>(false);
    const [peekingIndex, setPeekingIndex] = useState<number | null>(null);

    const totalLeaves = pages.length;
    const currentTurned = controlledTurnedIndex !== undefined ? controlledTurnedIndex : internalTurned;
    const isOpen = currentTurned > 0 && currentTurned < totalLeaves;

    const parsedRadius = typeof radius === "number" ? `${radius}px` : radius;

    const setTurned = useCallback((newCount: number) => {
        const clamped = Math.max(0, Math.min(newCount, totalLeaves));
        if (controlledTurnedIndex === undefined) {
            setInternalTurned(clamped);
        }
        if (onPageChange) {
            onPageChange(clamped, totalLeaves);
        }
    }, [controlledTurnedIndex, totalLeaves, onPageChange]);

    const flipNext = useCallback(() => {
        if (currentTurned < totalLeaves) {
            setTurned(currentTurned + 1);
        }
    }, [currentTurned, totalLeaves, setTurned]);

    const flipPrev = useCallback(() => {
        if (currentTurned > 0) {
            setTurned(currentTurned - 1);
        }
    }, [currentTurned, setTurned]);

    const resetBook = useCallback(() => {
        setTurned(0);
    }, [setTurned]);

    useImperativeHandle(ref, () => ({
        next: flipNext,
        prev: flipPrev,
        reset: resetBook,
        goTo: (idx) => setTurned(idx),
        getTurnedCount: () => currentTurned,
        getTotalLeaves: () => totalLeaves,
    }));

    // Autoplay Timer
    useEffect(() => {
        if (!autoplay || (pauseOnHover && isHovered) || totalLeaves <= 1) return;
        const timer = setInterval(() => {
            setInternalTurned((prev) => (prev >= totalLeaves ? 0 : prev + 1));
        }, autoplayInterval);
        return () => clearInterval(timer);
    }, [autoplay, autoplayInterval, pauseOnHover, isHovered, totalLeaves]);

    // Keyboard Navigation
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "ArrowRight") flipNext();
            if (e.key === "ArrowLeft") flipPrev();
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [flipNext, flipPrev]);

    const handleLeafClick = (index: number) => {
        if (!interactive) return;
        if (index === currentTurned) {
            // Click unturned top page -> flip forward
            flipNext();
        } else if (index === currentTurned - 1) {
            // Click turned top left page -> flip backward
            flipPrev();
        }
    };

    return (
        <div
            className={cn("w-full flex flex-col items-center justify-center select-none py-6", className)}
            style={style}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => {
                setIsHovered(false);
                setPeekingIndex(null);
            }}
        >
            {/* 3D Book Viewport Stage */}
            <div
                className="relative flex items-center justify-center transition-all duration-500"
                style={{
                    perspective: `${perspective}px`,
                    width: `${pageWidth * 2 + 40}px`,
                    height: `${pageHeight + 40}px`,
                }}
            >
                {/* 3D Book Container */}
                <div
                    className="relative transition-transform"
                    style={{
                        width: `${pageWidth}px`,
                        height: `${pageHeight}px`,
                        transformStyle: "preserve-3d",
                        transition: `transform ${duration}s ${easing}`,
                        transform: spineShift && isOpen ? `translateX(${pageWidth / 2}px)` : "translateX(0)",
                    }}
                >
                    {/* Spine Shadow & Binding Crease */}
                    {showSpineBinding && (
                        <div
                            className="absolute top-0 bottom-0 left-[-4px] w-[8px] rounded-l-sm bg-gradient-to-r from-black/80 via-zinc-800 to-black/40 shadow-2xl z-30 pointer-events-none"
                            style={{
                                opacity: isOpen ? 0.95 : 0.6,
                                transition: `opacity ${duration}s ease`,
                            }}
                        />
                    )}

                    {/* Ground Ambience Drop Shadow underneath the book */}
                    <div
                        className="absolute -bottom-6 left-[-15%] w-[130%] h-8 bg-black/40 rounded-full blur-xl pointer-events-none transition-all duration-500"
                        style={{
                            opacity: isOpen ? 0.7 : 0.4,
                            transform: isOpen ? "scale(1.15)" : "scale(0.85)",
                        }}
                    />

                    {/* Book Leaves Stacking Loop */}
                    {pages.map((leaf, index) => {
                        const isTurned = index < currentTurned;
                        const isCanPeek = index === currentTurned;
                        const isPeeking = peekingIndex === index;

                        // Calculate Z-Index: turned leaves stack forward on left, unturned leaves stack backward on right
                        const zIndex = isTurned ? index + 1 : totalLeaves - index;

                        // Rotation Angle
                        let leafRotation = isTurned ? -turnAngle : 0;
                        if (!isTurned && isPeeking) {
                            leafRotation = -peekAngle;
                        }

                        return (
                            <div
                                key={leaf.id ?? index}
                                onClick={() => handleLeafClick(index)}
                                onMouseEnter={() => {
                                    if (isCanPeek) setPeekingIndex(index);
                                }}
                                onMouseLeave={() => {
                                    if (peekingIndex === index) setPeekingIndex(null);
                                }}
                                className={cn(
                                    "absolute inset-0 origin-left cursor-pointer",
                                    interactive ? "cursor-pointer" : "pointer-events-none"
                                )}
                                style={{
                                    transformStyle: "preserve-3d",
                                    transition: `transform ${duration}s ${easing}`,
                                    transform: `rotateY(${leafRotation}deg)`,
                                    zIndex,
                                    borderRadius: parsedRadius,
                                }}
                            >
                                {/* FRONT FACE (Visible when page is on the right) */}
                                <div
                                    className="absolute inset-0 w-full h-full bg-zinc-950 overflow-hidden"
                                    style={{
                                        backfaceVisibility: "hidden",
                                        WebkitBackfaceVisibility: "hidden",
                                        borderRadius: parsedRadius,
                                        boxShadow: `0 12px 28px rgba(0, 0, 0, ${shadowIntensity})`,
                                    }}
                                >
                                    <img
                                        src={leaf.frontImage}
                                        alt={leaf.frontTitle ?? `Page ${index * 2 + 1}`}
                                        className="w-full h-full object-cover pointer-events-none select-none"
                                        loading="lazy"
                                    />

                                    {/* Spine crease shadow overlay for 3D depth */}
                                    <div
                                        className="absolute inset-0 pointer-events-none transition-opacity duration-300"
                                        style={{
                                            background: "linear-gradient(to right, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.12) 14%, transparent 35%)",
                                            opacity: isTurned ? 0 : 1,
                                        }}
                                    />

                                    {/* Bottom Vignette & Metadata */}
                                    <div className="absolute inset-x-0 bottom-0 p-3.5 bg-gradient-to-t from-black/85 via-black/35 to-transparent text-white pointer-events-none">
                                        <div className="flex items-center justify-between gap-2 mb-1">
                                            {leaf.frontBadge && (
                                                <span
                                                    className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider backdrop-blur-md border border-white/20"
                                                    style={{
                                                        color: accentColor,
                                                        backgroundColor: `${accentColor}20`,
                                                    }}
                                                >
                                                    {leaf.frontBadge}
                                                </span>
                                            )}
                                            {showPageNumbers && (
                                                <span className="text-[10px] font-mono text-zinc-300/80">
                                                    {index * 2 + 1}
                                                </span>
                                            )}
                                        </div>
                                        {leaf.frontTitle && (
                                            <h4 className="text-xs sm:text-sm font-bold tracking-tight text-white drop-shadow-sm line-clamp-1">
                                                {leaf.frontTitle}
                                            </h4>
                                        )}
                                        {leaf.frontSubtitle && (
                                            <p className="text-[10px] text-zinc-300/70 font-medium line-clamp-1">
                                                {leaf.frontSubtitle}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                {/* BACK FACE (Visible when page is turned to the left) */}
                                <div
                                    className="absolute inset-0 w-full h-full bg-zinc-950 overflow-hidden"
                                    style={{
                                        backfaceVisibility: "hidden",
                                        WebkitBackfaceVisibility: "hidden",
                                        transform: "rotateY(180deg)",
                                        borderRadius: parsedRadius,
                                        boxShadow: `0 12px 28px rgba(0, 0, 0, ${shadowIntensity})`,
                                    }}
                                >
                                    <img
                                        src={leaf.backImage}
                                        alt={leaf.backTitle ?? `Page ${index * 2 + 2}`}
                                        className="w-full h-full object-cover pointer-events-none select-none"
                                        loading="lazy"
                                    />

                                    {/* Spine crease shadow overlay for turned back-face */}
                                    <div
                                        className="absolute inset-0 pointer-events-none transition-opacity duration-300"
                                        style={{
                                            background: "linear-gradient(to left, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.12) 14%, transparent 35%)",
                                            opacity: isTurned ? 1 : 0,
                                        }}
                                    />

                                    {/* Bottom Vignette & Metadata */}
                                    <div className="absolute inset-x-0 bottom-0 p-3.5 bg-gradient-to-t from-black/85 via-black/35 to-transparent text-white pointer-events-none">
                                        <div className="flex items-center justify-between gap-2 mb-1">
                                            {leaf.backBadge && (
                                                <span
                                                    className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider backdrop-blur-md border border-white/20"
                                                    style={{
                                                        color: accentColor,
                                                        backgroundColor: `${accentColor}20`,
                                                    }}
                                                >
                                                    {leaf.backBadge}
                                                </span>
                                            )}
                                            {showPageNumbers && (
                                                <span className="text-[10px] font-mono text-zinc-300/80">
                                                    {index * 2 + 2}
                                                </span>
                                            )}
                                        </div>
                                        {leaf.backTitle && (
                                            <h4 className="text-xs sm:text-sm font-bold tracking-tight text-white drop-shadow-sm line-clamp-1">
                                                {leaf.backTitle}
                                            </h4>
                                        )}
                                        {leaf.backSubtitle && (
                                            <p className="text-[10px] text-zinc-300/70 font-medium line-clamp-1">
                                                {leaf.backSubtitle}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Book Controls & Page Progress Toolbar */}
            {showControls && (
                <div className="flex items-center justify-center gap-3 mt-4 select-none">
                    <button
                        onClick={flipPrev}
                        disabled={currentTurned === 0}
                        aria-label="Previous Page"
                        className="px-3.5 py-1.5 rounded-xl flex items-center gap-1 text-xs font-semibold bg-card border border-border text-foreground hover:bg-muted hover:scale-105 active:scale-95 disabled:opacity-30 disabled:pointer-events-none transition-all shadow-xs cursor-pointer"
                    >
                        <ChevronLeft className="w-3.5 h-3.5" />
                        <span>Prev</span>
                    </button>

                    <button
                        onClick={resetBook}
                        disabled={currentTurned === 0}
                        aria-label="Reset Book"
                        className="px-3 py-1.5 rounded-xl flex items-center gap-1 text-xs font-semibold bg-card border border-border text-foreground hover:bg-muted hover:scale-105 active:scale-95 disabled:opacity-30 disabled:pointer-events-none transition-all shadow-xs cursor-pointer"
                    >
                        <RotateCcw className="w-3 h-3" />
                        <span>Reset</span>
                    </button>

                    <div className="px-3 py-1.5 rounded-xl bg-card border border-border text-xs font-mono text-muted-foreground shadow-xs">
                        <span className="font-bold text-foreground">{currentTurned}</span>
                        <span className="opacity-50"> / </span>
                        <span>{totalLeaves} leaves</span>
                    </div>

                    <button
                        onClick={flipNext}
                        disabled={currentTurned === totalLeaves}
                        aria-label="Next Page"
                        className="px-3.5 py-1.5 rounded-xl flex items-center gap-1 text-xs font-semibold bg-card border border-border text-foreground hover:bg-muted hover:scale-105 active:scale-95 disabled:opacity-30 disabled:pointer-events-none transition-all shadow-xs cursor-pointer"
                    >
                        <span>Next</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                </div>
            )}
        </div>
    );
});

ThreeDImagePageflip.displayName = "ThreeDImagePageflip";

export default ThreeDImagePageflip;
