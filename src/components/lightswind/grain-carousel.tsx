"use client";

import React, {
    useState,
    useRef,
    useEffect,
    useCallback,
    useId,
    CSSProperties,
    forwardRef,
    useImperativeHandle,
} from "react";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight, Sparkles } from "lucide-react";

export type GrainFoilVariant =
    | "holographic"
    | "cosmic-cyan"
    | "neon-sakura"
    | "solar-plasma"
    | "cyber-emerald"
    | "ultra-violet"
    | "monochrome";

export interface GrainCarouselItem {
    id?: string | number;
    title?: string;
    subtitle?: string;
    category?: string;
    imageA: string;
    imageB?: string;
    badge?: string;
    href?: string;
    accentColor?: string;
    onClick?: () => void;
}

export interface GrainCarouselProps {
    /** List of carousel slide items with dual lenticular images and meta info */
    items?: GrainCarouselItem[];
    /** Initially active center card index (default: 2 or middle) */
    defaultIndex?: number;
    /** Controlled active index */
    activeIndex?: number;
    /** Callback fired when center slide changes */
    onIndexChange?: (index: number, item: GrainCarouselItem) => void;
    /** Width of each card in pixels (default: 270) */
    cardWidth?: number;
    /** Aspect ratio for cards (default: "3 / 4") */
    aspectRatio?: string;
    /** Spacing between cards in pixels (default: 24) */
    gap?: number;
    /** 3D perspective depth in pixels (default: 1200) */
    perspective?: number;
    /** Z-axis lift elevation in px when card is hovered (default: 36) */
    lift?: number;
    /** Maximum 3D rotation tilt angle in degrees (default: 16) */
    maxTilt?: number;
    /** Aesthetic gradient foil color palette */
    foilVariant?: GrainFoilVariant;
    /** Intensity of animated gradient film grain overlay (0.0 to 1.0, default: 0.35) */
    grainAmount?: number;
    /** Number of vertical lenticular optical refraction strips (default: 56) */
    lenticularStrips?: number;
    /** Scale factor for inactive background cards (0.5 to 1.0, default: 0.90) */
    inactiveScale?: number;
    /** Brightness dim factor for inactive background cards (0.1 to 1.0, default: 0.55) */
    inactiveDim?: number;
    /** Whether to show lenticular optical lens ribs (default: true) */
    showRibs?: boolean;
    /** Whether to show animated holographic foil shimmer (default: true) */
    showFoil?: boolean;
    /** Whether to show film grain overlay (default: true) */
    showGrain?: boolean;
    /** Enable navigation arrows (default: true) */
    showArrows?: boolean;
    /** Enable bottom segmented progress dots (default: true) */
    showDots?: boolean;
    /** Enable automatic slide cycling (default: false) */
    autoplay?: boolean;
    /** Autoplay transition interval in ms (default: 4000) */
    autoplayInterval?: number;
    /** Pause autoplay when mouse enters carousel (default: true) */
    pauseOnHover?: boolean;
    /** Border radius for cards (default: "16px") */
    radius?: string | number;
    /** Optional container class name */
    className?: string;
    /** Optional container inline style */
    style?: CSSProperties;
}

export interface GrainCarouselHandle {
    next: () => void;
    prev: () => void;
    goTo: (index: number) => void;
    getIndex: () => number;
}

const DEFAULT_CAROUSEL_ITEMS: GrainCarouselItem[] = [
    {
        id: 1,
        title: "Apex Structure",
        subtitle: "Parametric Glass Facade",
        badge: "Architecture",
        imageA: "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=600&q=80",
        imageB: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=600&q=80",
        accentColor: "#00F5FF",
    },
    {
        id: 2,
        title: "Modern Pavilion",
        subtitle: "Minimalist Natural Wood",
        badge: "Concept",
        imageA: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80",
        imageB: "https://images.unsplash.com/photo-1511818966892-d7d671e672a2?auto=format&fit=crop&w=600&q=80",
        accentColor: "#FF9FFC",
    },
    {
        id: 3,
        title: "Villa Solarium",
        subtitle: "Infinite Horizon Pool",
        badge: "Luxury",
        imageA: "https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=600&q=80",
        imageB: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=600&q=80",
        accentColor: "#FF9900",
    },
    {
        id: 4,
        title: "Glass Skyline",
        subtitle: "Urban Geometric Tower",
        badge: "Metropolis",
        imageA: "https://images.unsplash.com/photo-1486325212027-8081e485255e?auto=format&fit=crop&w=600&q=80",
        imageB: "https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&w=600&q=80",
        accentColor: "#00FF88",
    },
    {
        id: 5,
        title: "Monolith Center",
        subtitle: "Brutalist Concrete Curve",
        badge: "Exhibition",
        imageA: "https://images.unsplash.com/photo-1479839672679-a46483c0e7c8?auto=format&fit=crop&w=600&q=80",
        imageB: "https://images.unsplash.com/photo-1507652313519-d4e9174996dd?auto=format&fit=crop&w=600&q=80",
        accentColor: "#A855F7",
    },
];

const FOIL_GRADIENTS: Record<GrainFoilVariant, string> = {
    holographic:
        "linear-gradient(115deg, transparent 0%, rgba(255, 0, 128, 0.4) 25%, rgba(0, 255, 255, 0.5) 50%, rgba(255, 255, 0, 0.4) 75%, transparent 100%)",
    "cosmic-cyan":
        "linear-gradient(115deg, transparent 0%, rgba(0, 150, 255, 0.4) 25%, rgba(0, 245, 255, 0.6) 50%, rgba(120, 255, 214, 0.4) 75%, transparent 100%)",
    "neon-sakura":
        "linear-gradient(115deg, transparent 0%, rgba(255, 70, 150, 0.4) 25%, rgba(255, 160, 250, 0.6) 50%, rgba(180, 100, 255, 0.4) 75%, transparent 100%)",
    "solar-plasma":
        "linear-gradient(115deg, transparent 0%, rgba(255, 60, 0, 0.4) 25%, rgba(255, 160, 0, 0.6) 50%, rgba(255, 220, 50, 0.4) 75%, transparent 100%)",
    "cyber-emerald":
        "linear-gradient(115deg, transparent 0%, rgba(0, 200, 100, 0.4) 25%, rgba(0, 255, 140, 0.6) 50%, rgba(0, 230, 255, 0.4) 75%, transparent 100%)",
    "ultra-violet":
        "linear-gradient(115deg, transparent 0%, rgba(130, 0, 255, 0.4) 25%, rgba(190, 80, 255, 0.6) 50%, rgba(255, 70, 180, 0.4) 75%, transparent 100%)",
    monochrome:
        "linear-gradient(115deg, transparent 0%, rgba(255, 255, 255, 0.15) 30%, rgba(255, 255, 255, 0.4) 50%, rgba(255, 255, 255, 0.15) 70%, transparent 100%)",
};

export const GrainCarousel = forwardRef<GrainCarouselHandle, GrainCarouselProps>(({
    items = DEFAULT_CAROUSEL_ITEMS,
    defaultIndex,
    activeIndex: controlledIndex,
    onIndexChange,
    cardWidth = 270,
    aspectRatio = "3 / 4",
    gap = 24,
    perspective = 1200,
    lift = 36,
    maxTilt = 16,
    foilVariant = "cosmic-cyan",
    grainAmount = 0.35,
    lenticularStrips = 56,
    inactiveScale = 0.90,
    inactiveDim = 0.55,
    showRibs = true,
    showFoil = true,
    showGrain = true,
    showArrows = true,
    showDots = true,
    autoplay = false,
    autoplayInterval = 4000,
    pauseOnHover = true,
    radius = "16px",
    className,
    style,
}, ref) => {
    const rawDefault = defaultIndex !== undefined ? defaultIndex : Math.min(2, Math.max(0, Math.floor(items.length / 2)));
    const [internalIndex, setInternalIndex] = useState<number>(rawDefault);
    const currentIndex = controlledIndex !== undefined ? controlledIndex : internalIndex;

    const [trackOffset, setTrackOffset] = useState<number>(0);
    const [isHovered, setIsHovered] = useState<boolean>(false);
    const [cardInteractions, setCardInteractions] = useState<
        Record<number, { tiltX: number; tiltY: number; progress: number; foilX: number; foilY: number }>
    >({});

    const containerRef = useRef<HTMLDivElement>(null);
    const trackRef = useRef<HTMLDivElement>(null);
    const isDraggingRef = useRef<boolean>(false);
    const dragStartXRef = useRef<number>(0);

    const filterId = useId().replace(/[:]/g, "");

    const parsedRadius = typeof radius === "number" ? `${radius}px` : radius;

    const changeIndex = useCallback(
        (newIndex: number) => {
            const clamped = Math.max(0, Math.min(newIndex, items.length - 1));
            if (controlledIndex === undefined) {
                setInternalIndex(clamped);
            }
            if (onIndexChange && items[clamped]) {
                onIndexChange(clamped, items[clamped]);
            }
        },
        [controlledIndex, items, onIndexChange]
    );

    useImperativeHandle(ref, () => ({
        next: () => changeIndex(currentIndex + 1),
        prev: () => changeIndex(currentIndex - 1),
        goTo: (idx) => changeIndex(idx),
        getIndex: () => currentIndex,
    }));

    // Update track position for active slide centering
    const updateTrackPosition = useCallback(() => {
        if (!containerRef.current) return;
        const containerWidth = containerRef.current.offsetWidth;
        const centerOffset = containerWidth / 2 - cardWidth / 2;
        const targetTranslate = centerOffset - currentIndex * (cardWidth + gap);
        setTrackOffset(targetTranslate);
    }, [currentIndex, cardWidth, gap]);

    useEffect(() => {
        updateTrackPosition();
        const ro = new ResizeObserver(() => updateTrackPosition());
        if (containerRef.current) ro.observe(containerRef.current);
        return () => ro.disconnect();
    }, [updateTrackPosition]);

    // Autoplay Timer
    useEffect(() => {
        if (!autoplay || (pauseOnHover && isHovered) || items.length <= 1) return;
        const timer = setInterval(() => {
            setInternalIndex((prev) => (prev >= items.length - 1 ? 0 : prev + 1));
        }, autoplayInterval);
        return () => clearInterval(timer);
    }, [autoplay, autoplayInterval, pauseOnHover, isHovered, items.length]);

    // Keyboard Navigation
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "ArrowLeft") changeIndex(currentIndex - 1);
            if (e.key === "ArrowRight") changeIndex(currentIndex + 1);
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [currentIndex, changeIndex]);

    // Mouse Interaction for 3D Tilt and Lenticular Transition
    const handleCardMouseMove = (e: React.MouseEvent<HTMLDivElement>, index: number) => {
        const card = e.currentTarget;
        const rect = card.getBoundingClientRect();
        const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
        const y = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height));

        const tiltY = (x - 0.5) * (maxTilt * 2);
        const tiltX = (0.5 - y) * (maxTilt * 1.5);
        const progress = x;

        setCardInteractions((prev) => ({
            ...prev,
            [index]: {
                tiltX,
                tiltY,
                progress,
                foilX: x * 100,
                foilY: y * 100,
            },
        }));
    };

    const handleCardMouseLeave = (index: number) => {
        setCardInteractions((prev) => ({
            ...prev,
            [index]: { tiltX: 0, tiltY: 0, progress: 0, foilX: 50, foilY: 50 },
        }));
    };

    // Drag / Swipe Handlers
    const handleMouseDown = (e: React.MouseEvent) => {
        isDraggingRef.current = true;
        dragStartXRef.current = e.clientX;
    };

    const handleTouchStart = (e: React.TouchEvent) => {
        isDraggingRef.current = true;
        dragStartXRef.current = e.touches[0].clientX;
    };

    const handleDragMove = (clientX: number) => {
        if (!isDraggingRef.current) return;
        const deltaX = clientX - dragStartXRef.current;
        if (Math.abs(deltaX) > 45) {
            if (deltaX > 0 && currentIndex > 0) {
                changeIndex(currentIndex - 1);
            } else if (deltaX < 0 && currentIndex < items.length - 1) {
                changeIndex(currentIndex + 1);
            }
            isDraggingRef.current = false;
        }
    };

    const handleMouseUp = () => {
        isDraggingRef.current = false;
    };

    return (
        <div
            className={cn("w-full flex flex-col items-center select-none relative", className)}
            style={style}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => {
                setIsHovered(false);
                isDraggingRef.current = false;
            }}
        >
            {/* SVG Procedural Grain Noise Filter definition */}
            <svg className="absolute w-0 h-0 pointer-events-none opacity-0" aria-hidden="true">
                <defs>
                    <filter id={`grain-filter-${filterId}`} x="0%" y="0%" width="100%" height="100%">
                        <feTurbulence
                            type="fractalNoise"
                            baseFrequency="0.85"
                            numOctaves="3"
                            stitchTiles="stitch"
                            result="noise"
                        />
                        <feColorMatrix
                            type="matrix"
                            values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 1 0"
                        />
                    </filter>
                </defs>
            </svg>

            {/* 3D Viewport Wrapper */}
            <div
                ref={containerRef}
                className="w-full relative py-8 overflow-hidden"
                style={{ perspective: `${perspective}px` }}
                onMouseDown={handleMouseDown}
                onMouseMove={(e) => handleDragMove(e.clientX)}
                onMouseUp={handleMouseUp}
                onTouchStart={handleTouchStart}
                onTouchMove={(e) => handleDragMove(e.touches[0].clientX)}
                onTouchEnd={handleMouseUp}
            >
                {/* 3D Carousel Track */}
                <div
                    ref={trackRef}
                    className="flex items-center cursor-grab active:cursor-grabbing will-change-transform transition-transform duration-500 ease-[cubic-bezier(0.25,1,0.5,1)]"
                    style={{
                        transform: `translateX(${trackOffset}px)`,
                        gap: `${gap}px`,
                    }}
                >
                    {items.map((item, index) => {
                        const isActive = index === currentIndex;
                        const interaction = cardInteractions[index] || {
                            tiltX: 0,
                            tiltY: 0,
                            progress: 0,
                            foilX: 50,
                            foilY: 50,
                        };
                        const hasDualImage = Boolean(item.imageB);
                        const flipProgress = hasDualImage ? interaction.progress : 0;
                        const foilOpacity = Math.sin(interaction.progress * Math.PI) * 0.75;

                        return (
                            <div
                                key={item.id ?? index}
                                onClick={() => {
                                    if (!isActive) changeIndex(index);
                                    if (item.onClick) item.onClick();
                                }}
                                onMouseMove={(e) => handleCardMouseMove(e, index)}
                                onMouseLeave={() => handleCardMouseLeave(index)}
                                className={cn(
                                    "relative shrink-0 rounded-2xl cursor-pointer transition-all duration-500 ease-[cubic-bezier(0.2,0.8,0.2,1)] group",
                                    isActive
                                        ? "z-20 shadow-2xl ring-1 ring-white/20"
                                        : "z-10 shadow-lg hover:brightness-75"
                                )}
                                style={{
                                    width: `${cardWidth}px`,
                                    aspectRatio,
                                    borderRadius: parsedRadius,
                                    transform: `scale(${isActive ? 1.0 : inactiveScale})`,
                                    filter: isActive ? "brightness(1)" : `brightness(${inactiveDim})`,
                                    transformStyle: "preserve-3d",
                                }}
                            >
                                {/* 3D Hover Tilt & Lift Container */}
                                <div
                                    className="w-full h-full relative rounded-[inherit] overflow-hidden transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] bg-zinc-900 border border-white/10 dark:border-white/5"
                                    style={{
                                        borderRadius: parsedRadius,
                                        transformStyle: "preserve-3d",
                                        transform: isActive
                                            ? `translateZ(${interaction.tiltX || interaction.tiltY ? lift : 0}px) rotateY(${interaction.tiltY}deg) rotateX(${interaction.tiltX}deg)`
                                            : undefined,
                                    }}
                                >
                                    {/* Primary Image Face (Image A) */}
                                    <img
                                        src={item.imageA}
                                        alt={item.title ?? `Slide ${index + 1}`}
                                        className="absolute inset-0 w-full h-full object-cover pointer-events-none rounded-[inherit] transition-transform duration-700 group-hover:scale-105"
                                        loading="lazy"
                                    />

                                    {/* Secondary Lenticular Image Face (Image B) */}
                                    {hasDualImage && (
                                        <img
                                            src={item.imageB}
                                            alt={item.title ? `${item.title} Alt` : `Slide ${index + 1} Alt`}
                                            className="absolute inset-0 w-full h-full object-cover pointer-events-none rounded-[inherit] transition-opacity duration-150"
                                            style={{
                                                opacity: flipProgress,
                                                filter: "contrast(1.08) saturate(1.15)",
                                            }}
                                            loading="lazy"
                                        />
                                    )}

                                    {/* Lenticular Lens Ribs Optical Refraction Overlay */}
                                    {showRibs && (
                                        <div
                                            className="absolute inset-0 pointer-events-none rounded-[inherit] mix-blend-overlay opacity-50"
                                            style={{
                                                background: `repeating-linear-gradient(90deg, rgba(255,255,255,0.12) 0px, rgba(0,0,0,0.4) calc(${cardWidth}px / ${lenticularStrips} * 0.5), rgba(255,255,255,0.12) calc(${cardWidth}px / ${lenticularStrips}))`,
                                            }}
                                        />
                                    )}

                                    {/* Animated Holographic Foil Shimmer */}
                                    {showFoil && (
                                        <div
                                            className="absolute inset-0 pointer-events-none rounded-[inherit] mix-blend-color-dodge transition-opacity duration-200"
                                            style={{
                                                background: FOIL_GRADIENTS[foilVariant] || FOIL_GRADIENTS["cosmic-cyan"],
                                                backgroundSize: "220% 220%",
                                                backgroundPosition: `${interaction.foilX}% ${interaction.foilY}%`,
                                                opacity: foilOpacity,
                                            }}
                                        />
                                    )}

                                    {/* Micro Film Grain Texture Overlay */}
                                    {showGrain && (
                                        <div
                                            className="absolute inset-0 pointer-events-none rounded-[inherit] mix-blend-overlay opacity-40 transition-opacity duration-300 group-hover:opacity-60"
                                            style={{
                                                filter: `url(#grain-filter-${filterId})`,
                                                opacity: grainAmount,
                                            }}
                                        />
                                    )}

                                    {/* Bottom Vignette Scrim */}
                                    <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-black/90 via-black/35 to-transparent rounded-[inherit]" />

                                    {/* Card Content Overlay */}
                                    <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5 flex flex-col gap-1.5 pointer-events-none text-white select-none">
                                        {item.badge && (
                                            <div className="inline-flex items-center gap-1 self-start px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider backdrop-blur-md bg-white/15 border border-white/20 text-white">
                                                <Sparkles className="w-2.5 h-2.5" />
                                                <span>{item.badge}</span>
                                            </div>
                                        )}

                                        {item.title && (
                                            <h3 className="text-base sm:text-lg font-bold tracking-tight text-white drop-shadow-md">
                                                {item.title}
                                            </h3>
                                        )}

                                        {item.subtitle && (
                                            <p className="text-xs text-zinc-300/80 font-medium line-clamp-1">
                                                {item.subtitle}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Carousel Controls & Segmented Dots Rail */}
            {(showArrows || showDots) && (
                <div className="flex items-center justify-center gap-4 mt-2 select-none">
                    {/* Previous Button */}
                    {showArrows && (
                        <button
                            onClick={() => changeIndex(currentIndex - 1)}
                            disabled={currentIndex === 0}
                            aria-label="Previous Slide"
                            className="w-9 h-9 rounded-full flex items-center justify-center bg-card border border-border text-foreground hover:bg-muted hover:scale-105 active:scale-95 disabled:opacity-30 disabled:pointer-events-none transition-all duration-200 shadow-xs cursor-pointer"
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                    )}

                    {/* Progress Dots Rail */}
                    {showDots && (
                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-card/80 border border-border backdrop-blur-md">
                            {items.map((_, i) => (
                                <button
                                    key={i}
                                    onClick={() => changeIndex(i)}
                                    aria-label={`Go to slide ${i + 1}`}
                                    className={cn(
                                        "h-1.5 rounded-full transition-all duration-300 cursor-pointer",
                                        i === currentIndex
                                            ? "w-7 bg-cyan-500 shadow-xs"
                                            : "w-2 bg-muted-foreground/30 hover:bg-muted-foreground/60"
                                    )}
                                />
                            ))}
                        </div>
                    )}

                    {/* Next Button */}
                    {showArrows && (
                        <button
                            onClick={() => changeIndex(currentIndex + 1)}
                            disabled={currentIndex === items.length - 1}
                            aria-label="Next Slide"
                            className="w-9 h-9 rounded-full flex items-center justify-center bg-card border border-border text-foreground hover:bg-muted hover:scale-105 active:scale-95 disabled:opacity-30 disabled:pointer-events-none transition-all duration-200 shadow-xs cursor-pointer"
                        >
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    )}
                </div>
            )}
        </div>
    );
});

GrainCarousel.displayName = "GrainCarousel";

export default GrainCarousel;
