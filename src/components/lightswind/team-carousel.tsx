"use client";

import React, { useState, useCallback, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence, TargetAndTransition} from 'framer-motion';
import { cn } from '@/lib/utils'; // Assuming this utility correctly merges class names

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  image: string;
  bio?: string;
}

export interface TeamCarouselProps {
  /** Array of team members */
  members: TeamMember[];
  /** Background color or gradient. Overrides the default 'bg-background' class. */
  background?: string;
  /** Card width in pixels */
  cardWidth?: number;
  /** Card height in pixels */
  cardHeight?: number;
  /** Card border radius */
  cardRadius?: number;
  /** Enable/disable navigation arrows */
  showArrows?: boolean;
  /** Enable/disable dots indicator */
  showDots?: boolean;
  /** Enable/disable keyboard navigation */
  keyboardNavigation?: boolean;
  /** Enable/disable touch/swipe navigation */
  touchNavigation?: boolean;
  /** Animation duration in milliseconds */
  animationDuration?: number;
  /** Auto-play interval in milliseconds (0 to disable) */
  autoPlay?: number;
  /** Pause auto-play on hover */
  pauseOnHover?: boolean;
  /** Number of visible cards on each side */
  visibleCards?: number;
  /** Scale factor for side cards */
  sideCardScale?: number;
  /** Opacity for side cards */
  sideCardOpacity?: number;
  /** Apply grayscale filter to side cards */
  grayscaleEffect?: boolean;
  /** Custom className for container */
  className?: string;
  /** Custom className for cards */
  cardClassName?: string;
  /** Member info position */
  infoPosition?: 'bottom' | 'overlay' | 'none';
  /** Info text color */
  infoTextColor?: string;
  /** Info background */
  infoBackground?: string;
  /** Callback when active member changes */
  onMemberChange?: (member: TeamMember, index: number) => void;
  /** Callback when card is clicked */
  onCardClick?: (member: TeamMember, index: number) => void;
  /** Initial active index */
  initialIndex?: number;
}

export const TeamCarousel: React.FC<TeamCarouselProps> = ({
  members,
  background,
  cardWidth = 280,
  cardHeight = 380,
  cardRadius = 20,
  showArrows = true,
  showDots = true,
  keyboardNavigation = true,
  touchNavigation = true,
  animationDuration = 800,
  autoPlay = 0,
  pauseOnHover = true,
  visibleCards = 2,
  sideCardScale = 0.9,
  sideCardOpacity = 0.8,
  grayscaleEffect = true,
  className,
  cardClassName,
  infoPosition = "bottom",
  infoTextColor,
  infoBackground = "transparent",
  onMemberChange,
  onCardClick,
  initialIndex = 0,
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [direction, setDirection] = useState(0); // 0: no movement, 1: next, -1: prev
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);

  const totalMembers = members.length;

  const paginate = useCallback(
    (newDirection: number) => {
      if (totalMembers === 0) return;
      setDirection(newDirection);
      const nextIndex = (currentIndex + newDirection + totalMembers) % totalMembers;
      setCurrentIndex(nextIndex);
      onMemberChange?.(members[nextIndex], nextIndex);
    },
    [currentIndex, totalMembers, members, onMemberChange]
  );

  const wrapIndex = (index: number) => {
    return (index + totalMembers) % totalMembers;
  };

  const calculatePosition = (index: number) => {
    const activeIndex = currentIndex;
    const diff = wrapIndex(index - activeIndex);

    if (diff === 0) return 'center';
    if (diff <= visibleCards) return `right-${diff}`;
    if (diff >= totalMembers - visibleCards) return `left-${totalMembers - diff}`;
    return 'hidden';
  };

  // Explicitly type the return of getVariantStyles to match framer-motion's expectations
  const getVariantStyles = (position: string): TargetAndTransition => {
    // FIX: Changed ease from number[] to an array of string presets or a valid CubicBezier type
    // Using string presets for simplicity and type compatibility.
    // If you need the exact cubic-bezier values, ensure they are compatible with framer-motion's Easing type.
    // For custom cubic-bezier, you might need to use a type assertion like `as [number, number, number, number]`
    // or import CubicBezier from 'framer-motion/types/value/types'.
    const transition = {
      duration: animationDuration / 1000,
      // You can use a string preset like 'easeInOut' or a valid cubic-bezier array if framer-motion's types support it directly
      // For the given numbers, 'easeInOut' is a close approximation or 'cubic-bezier(0.25, 0.46, 0.45, 0.94)' if framer-motion accepted it directly as string
      // To strictly match [0.25, 0.46, 0.45, 0.94], framer-motion expects it as a CubicBezier tuple:
      ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number],
    };

    switch (position) {
      case 'center':
        return {
          zIndex: 10,
          opacity: 1,
          scale: 1.08,
          x: 0,
          filter: 'grayscale(0%)',
          pointerEvents: 'auto',
          transition,
        };
      case 'right-1':
        return {
          zIndex: 5,
          opacity: sideCardOpacity,
          scale: sideCardScale,
          x: cardWidth * 0.75,
          filter: grayscaleEffect ? 'grayscale(100%)' : 'grayscale(0%)',
          pointerEvents: 'auto',
          transition,
        };
      case 'right-2':
        return {
          zIndex: 1,
          opacity: sideCardOpacity * 0.7,
          scale: sideCardScale * 0.88,
          x: cardWidth * 1.5,
          filter: grayscaleEffect ? 'grayscale(100%)' : 'grayscale(0%)',
          pointerEvents: 'auto',
          transition,
        };
      case 'left-1':
        return {
          zIndex: 5,
          opacity: sideCardOpacity,
          scale: sideCardScale,
          x: -cardWidth * 0.75,
          filter: grayscaleEffect ? 'grayscale(100%)' : 'grayscale(0%)',
          pointerEvents: 'auto',
          transition,
        };
      case 'left-2':
        return {
          zIndex: 1,
          opacity: sideCardOpacity * 0.7,
          scale: sideCardScale * 0.88,
          x: -cardWidth * 1.5,
          filter: grayscaleEffect ? 'grayscale(100%)' : 'grayscale(0%)',
          pointerEvents: 'auto',
          transition,
        };
      default:
        return {
          zIndex: 0,
          opacity: 0,
          scale: 0.8,
          x: direction > 0 ? cardWidth * (visibleCards + 1.2) : -cardWidth * (visibleCards + 1.2),
          pointerEvents: 'none',
          filter: grayscaleEffect ? 'grayscale(100%)' : 'grayscale(0%)',
          transition,
        };
    }
  };

  // Auto-play functionality
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (autoPlay > 0) {
      interval = setInterval(() => {
        paginate(1);
      }, autoPlay);
    }

    const carouselContainer = document.getElementById('team-carousel-container');

    const handleMouseEnter = () => {
      if (pauseOnHover && autoPlay > 0) clearInterval(interval);
    };

    const handleMouseLeave = () => {
      if (pauseOnHover && autoPlay > 0) {
        interval = setInterval(() => {
          paginate(1);
        }, autoPlay);
      }
    };

    if (carouselContainer && pauseOnHover && autoPlay > 0) {
      carouselContainer.addEventListener('mouseenter', handleMouseEnter);
      carouselContainer.addEventListener('mouseleave', handleMouseLeave);
    }

    return () => {
      clearInterval(interval);
      if (carouselContainer && pauseOnHover && autoPlay > 0) {
        carouselContainer.removeEventListener('mouseenter', handleMouseEnter);
        carouselContainer.removeEventListener('mouseleave', handleMouseLeave);
      }
    };
  }, [autoPlay, paginate, pauseOnHover]);

  // Keyboard navigation
  useEffect(() => {
    if (!keyboardNavigation) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        paginate(-1);
      } else if (e.key === 'ArrowRight') {
        paginate(1);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [keyboardNavigation, paginate]);

  // Touch navigation
  const handleTouchStart = (e: React.TouchEvent) => {
    if (!touchNavigation) return;
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!touchNavigation) return;
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchNavigation) return;

    const swipeThreshold = 50;
    const diff = touchStart - touchEnd;

    if (Math.abs(diff) > swipeThreshold) {
      if (diff > 0) {
        paginate(1);
      } else {
        paginate(-1);
      }
    }
  };

  return (
    <div
      id="team-carousel-container"
      className={cn(
        "w-full py-4 md:py-8 flex flex-col items-center justify-center relative",
        className
      )}
      style={{ background: background }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Carousel Container */}
      <div
        className="w-full relative z-10 mx-auto flex items-center justify-center overflow-visible"
        style={{
          height: cardHeight + 40,
          perspective: '1000px',
        }}
      >
        {/* Navigation Arrows */}
        {showArrows && (
          <>
            <motion.button
              onClick={() => paginate(-1)}
              className="absolute left-2 md:left-6 top-1/2 transform -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white w-10 h-10 rounded-full flex items-center justify-center z-20 transition-all duration-300 hover:scale-110 shadow-lg"
              whileTap={{ scale: 0.9 }}
              aria-label="Previous Team Member"
            >
              <ChevronLeft className="w-6 h-6" />
            </motion.button>
            <motion.button
              onClick={() => paginate(1)}
              className="absolute right-2 md:right-6 top-1/2 transform -translate-y-1/2 bg-black/60 hover:bg-black/80 text-white w-10 h-10 rounded-full flex items-center justify-center z-20 transition-all duration-300 hover:scale-110 shadow-lg"
              whileTap={{ scale: 0.9 }}
              aria-label="Next Team Member"
            >
              <ChevronRight className="w-6 h-6" />
            </motion.button>
          </>
        )}

        {/* Cards Track */}
        <div
          className="w-full h-full flex justify-center items-center relative"
          style={{ transformStyle: 'preserve-3d' }}
        >
          <AnimatePresence initial={false} custom={direction}>
            {members.map((member, index) => {
              const position = calculatePosition(index);
              const isCurrent = index === currentIndex;

              if (position === 'hidden' && !isCurrent) return null;

              return (
                <motion.div
                  key={member.id}
                  className={cn(
                    "absolute bg-white overflow-hidden shadow-2xl cursor-pointer",
                    cardClassName
                  )}
                  style={{
                    width: cardWidth,
                    height: cardHeight,
                    borderRadius: cardRadius,
                    top: '50%',
                    left: '50%',
                    marginLeft: -cardWidth / 2,
                    marginTop: -cardHeight / 2,
                  }}
                  initial={getVariantStyles('hidden')}
                  animate={getVariantStyles(position)}
                  exit={getVariantStyles('hidden')}
                  onClick={() => {
                    if (!isCurrent) {
                      const newDirection = index > currentIndex ? 1 : -1;
                      setDirection(newDirection);
                      setCurrentIndex(index);
                      onMemberChange?.(members[index], index);
                    }
                    onCardClick?.(member, index);
                  }}
                >
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-full h-full object-cover"
                    loading="lazy"
                    decoding="async"
                  />

                  {/* Overlay Info */}
                  {infoPosition === 'overlay' && (
                    <div
                      className="absolute bottom-0 left-0 right-0 p-4 text-center"
                      style={{
                        background: infoBackground || "linear-gradient(transparent, rgba(0,0,0,0.8))",
                        color: infoTextColor,
                      }}
                    >
                      <h3 className="text-lg font-bold">{member.name}</h3>
                      <p className="text-sm opacity-90">{member.role}</p>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>

      {/* Member Info (Bottom) */}
      {infoPosition === 'bottom' && members[currentIndex] && (
        <motion.div
          key={members[currentIndex].id + "-info"}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -15 }}
          transition={{ duration: 0.3 }}
          className="text-center mt-6 z-10 text-foreground"
        >
          <h2
            className="text-3xl md:text-4xl font-bold mb-2 relative inline-block text-foreground"
            style={infoTextColor ? { color: infoTextColor } : undefined}
          >
            {members[currentIndex].name}
            <span
              className="absolute top-full left-0 w-full h-0.5 mt-1.5 bg-primary"
              style={infoTextColor ? { background: infoTextColor } : undefined}
            />
          </h2>
          <p
            className="text-lg md:text-xl font-medium opacity-90 uppercase tracking-wider mt-2 text-primary"
            style={infoTextColor ? { color: infoTextColor } : undefined}
          >
            {members[currentIndex].role}
          </p>
          {members[currentIndex].bio && (
            <p className="text-sm md:text-base mt-2 max-w-lg mx-auto opacity-75 px-4 text-muted-foreground">
              {members[currentIndex].bio}
            </p>
          )}
        </motion.div>
      )}

      {/* Dots Indicator */}
      {showDots && (
        <div className="flex justify-center gap-2.5 mt-6 z-10">
          {members.map((_, index) => (
            <motion.button
              key={index}
              onClick={() => {
                if (index !== currentIndex) {
                  const newDirection = index > currentIndex ? 1 : -1;
                  setDirection(newDirection);
                  setCurrentIndex(index);
                  onMemberChange?.(members[index], index);
                }
              }}
              className={cn(
                "w-3 h-3 rounded-full transition-all duration-300",
                index === currentIndex
                  ? "scale-125 bg-primary"
                  : "hover:scale-110 bg-muted-foreground/40"
              )}
              style={infoTextColor ? {
                background: index === currentIndex
                  ? infoTextColor
                  : `${infoTextColor}40`,
              } : undefined}
              whileTap={{ scale: 0.9 }}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default TeamCarousel;