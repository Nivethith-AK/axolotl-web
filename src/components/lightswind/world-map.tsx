"use client";

import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

export interface MapMarker {
  id?: string;
  lat: number;
  lng: number;
  label?: string;
  country?: string;
  timeZone?: string;
  ping?: string;
  size?: number;
  color?: string;
  pulse?: boolean;
  data?: any;
}

export interface MapArc {
  id?: string;
  start: { lat: number; lng: number };
  end: { lat: number; lng: number };
  color?: string;
  strokeWidth?: number;
  dashed?: boolean;
}

export interface WorldMapProps extends React.SVGProps<SVGSVGElement> {
  width?: number;
  height?: number;
  dotRadius?: number;
  dotColor?: string;
  markerColor?: string;
  pulseColor?: string;
  markers?: MapMarker[];
  arcs?: MapArc[];
  pulse?: boolean;
  stagger?: boolean;
  enableTooltips?: boolean;
  showTimezones?: boolean;
  interactive?: boolean;
  className?: string;
  onMarkerClick?: (marker: MapMarker) => void;
  renderMarkerOverlay?: (args: {
    marker: MapMarker;
    x: number;
    y: number;
    r: number;
  }) => React.ReactNode;
}

// Convert Latitude / Longitude (WGS84) to SVG Map Coordinates (Equirectangular / Miller hybrid projection)
export function latLngToXY(lat: number, lng: number, width: number = 800, height: number = 400) {
  // Longitude: -180 to +180 -> 0 to width
  const x = ((lng + 180) / 360) * width;
  // Latitude: +90 to -90 -> 0 to height (Miller-adjusted projection for balanced continents)
  const latRad = (lat * Math.PI) / 180;
  const mercN = Math.log(Math.tan(Math.PI / 4 + (latRad * 0.85) / 2));
  const y = height / 2 - (width * mercN) / (2 * Math.PI);
  
  // Clamp boundaries safely
  const clampedX = Math.max(0, Math.min(width, x));
  const clampedY = Math.max(0, Math.min(height, y));
  return { x: clampedX, y: clampedY };
}

// High-accuracy continent landmass sample grid points [lat, lng]
const WORLD_LANDMASS_SAMPLES: [number, number][] = [
  // North America - Alaska & Canada
  [71, -156], [68, -165], [64, -162], [65, -147], [61, -150], [60, -162], [58, -135],
  [69, -133], [65, -120], [62, -114], [67, -118], [63, -104], [60, -108], [64, -96],
  [58, -94], [55, -100], [53, -113], [54, -125], [51, -120], [49, -123], [52, -106],
  [50, -97], [53, -85], [58, -78], [55, -67], [52, -75], [48, -89], [47, -79], [46, -71],
  [47, -65], [45, -63], [53, -60],
  // USA (Lower 48)
  [48, -122], [46, -124], [44, -121], [42, -123], [39, -123], [37, -122], [34, -119], [32, -117],
  [47, -114], [44, -114], [40, -111], [37, -112], [34, -112], [32, -111],
  [48, -100], [45, -100], [41, -102], [37, -100], [33, -102], [30, -103], [28, -100],
  [47, -92], [43, -93], [39, -94], [35, -92], [32, -92], [30, -90],
  [44, -85], [41, -86], [38, -85], [34, -84], [30, -84], [27, -81], [25, -80],
  [43, -76], [40, -74], [37, -77], [35, -78], [32, -80],
  // Mexico & Central America
  [30, -110], [27, -108], [24, -105], [26, -100], [22, -101], [19, -99], [20, -90], [17, -93],
  [15, -90], [14, -87], [12, -85], [9, -83], [8, -80],
  // Caribbean
  [22, -79], [18, -72], [18, -66],
  // South America
  [10, -73], [7, -73], [4, -73], [1, -78], [-2, -79], [-5, -80], [-8, -78], [-12, -77], [-15, -75],
  [6, -62], [3, -60], [0, -50], [5, -53], [2, -66], [-2, -60], [-5, -63], [-8, -63],
  [-3, -44], [-6, -37], [-8, -35], [-12, -38], [-15, -44], [-12, -49],
  [-16, -68], [-19, -65], [-22, -65], [-23, -46], [-22, -43], [-25, -49], [-25, -57],
  [-28, -70], [-33, -71], [-38, -73], [-42, -73], [-46, -74], [-51, -73],
  [-29, -60], [-34, -58], [-38, -62], [-42, -64], [-46, -67], [-50, -68], [-54, -68],
  // Greenland & Iceland
  [76, -42], [72, -40], [70, -50], [65, -45], [64, -18],
  // Europe - UK & Ireland
  [58, -4], [55, -3], [52, -1], [51, 0], [53, -8],
  // Europe - Scandinavia
  [69, 25], [65, 22], [61, 25], [64, 14], [60, 11], [59, 17], [56, 13],
  // Europe - Western & Central
  [53, 5], [51, 4], [48, 2], [45, 0], [43, 3], [43, -3], [40, -4], [37, -5], [39, -9],
  [52, 10], [49, 11], [46, 9], [43, 12], [41, 14], [38, 15], [37, 14],
  [53, 19], [50, 19], [46, 17], [44, 21], [40, 22], [38, 23],
  // Europe - Eastern & Russia
  [58, 30], [55, 37], [52, 33], [48, 35], [45, 34], [46, 40],
  [65, 41], [60, 50], [55, 52], [52, 50], [48, 45],
  [68, 55], [64, 65], [60, 70], [56, 68], [52, 71],
  [67, 78], [63, 85], [59, 88], [55, 83], [52, 85],
  [68, 100], [63, 105], [58, 102], [54, 100],
  [67, 120], [62, 125], [57, 120], [53, 118],
  [66, 140], [62, 145], [58, 138], [54, 130],
  [64, 160], [60, 162], [56, 160], [52, 157],
  // Africa - North
  [36, 3], [34, 10], [32, 20], [31, 30], [31, -8],
  [28, -10], [25, 0], [25, 12], [26, 25], [26, 32],
  [21, -13], [20, -1], [20, 11], [20, 22], [21, 31],
  // Africa - West & Central
  [15, -16], [12, -8], [10, 0], [12, 14], [13, 25], [12, 37], [10, 42],
  [5, -3], [6, 3], [8, 10], [4, 19], [4, 28], [5, 36],
  [0, 10], [0, 20], [0, 29], [0, 38],
  // Africa - South
  [-5, 13], [-4, 22], [-4, 33], [-5, 39],
  [-11, 15], [-12, 26], [-11, 37],
  [-18, 15], [-18, 25], [-19, 34], [-19, 46],
  [-25, 17], [-24, 26], [-25, 33],
  [-30, 19], [-29, 27], [-30, 31], [-33, 22], [-34, 26],
  // Middle East
  [37, 36], [34, 44], [31, 47], [29, 40], [27, 45], [24, 45], [24, 54], [20, 56], [15, 48],
  [36, 50], [32, 54], [28, 56],
  // Central & South Asia
  [42, 60], [40, 68], [44, 75], [38, 73], [35, 68], [33, 70], [30, 68], [27, 65],
  [32, 76], [28, 77], [24, 75], [22, 80], [22, 88], [18, 74], [16, 80], [13, 77], [10, 78], [8, 80],
  // East Asia - China & Mongolia
  [48, 87], [44, 87], [41, 85], [47, 103], [44, 105], [40, 96], [40, 110], [42, 118], [45, 125],
  [36, 82], [35, 93], [35, 104], [36, 114], [37, 120], [39, 125],
  [30, 85], [30, 96], [30, 104], [31, 114], [31, 121],
  [25, 92], [24, 101], [25, 110], [24, 118], [22, 114],
  // Japan & Korea
  [38, 127], [35, 128], [43, 142], [38, 140], [35, 136], [33, 130],
  // Southeast Asia
  [19, 100], [18, 106], [14, 101], [15, 108], [11, 106], [6, 101], [3, 102], [1, 104],
  [16, 121], [13, 123], [9, 125], [1, 114], [-2, 115], [-2, 121], [-7, 110], [-8, 115],
  // Australia & New Zealand
  [-13, 131], [-15, 142], [-18, 123], [-21, 134], [-21, 148],
  [-25, 115], [-24, 126], [-25, 136], [-24, 151],
  [-30, 118], [-29, 129], [-31, 138], [-29, 153],
  [-34, 118], [-33, 136], [-35, 143], [-37, 145], [-34, 150], [-42, 146],
  [-37, 175], [-41, 174], [-45, 169]
];

export const DEFAULT_MARKERS: MapMarker[] = [
  { id: "sf", lat: 37.7749, lng: -122.4194, label: "San Francisco", country: "US", timeZone: "America/Los_Angeles", ping: "12ms", size: 3, pulse: true },
  { id: "nyc", lat: 40.7128, lng: -74.006, label: "New York", country: "US", timeZone: "America/New_York", ping: "18ms", size: 3, pulse: true },
  { id: "lon", lat: 51.5074, lng: -0.1278, label: "London", country: "UK", timeZone: "Europe/London", ping: "8ms", size: 3, pulse: true },
  { id: "ber", lat: 52.52, lng: 13.405, label: "Berlin", country: "DE", timeZone: "Europe/Berlin", ping: "14ms", size: 3, pulse: true },
  { id: "dxb", lat: 25.2048, lng: 55.2708, label: "Dubai", country: "AE", timeZone: "Asia/Dubai", ping: "28ms", size: 3, pulse: true },
  { id: "blr", lat: 12.9716, lng: 77.5946, label: "Bengaluru", country: "IN", timeZone: "Asia/Kolkata", ping: "19ms", size: 3, pulse: true },
  { id: "sg", lat: 1.3521, lng: 103.8198, label: "Singapore", country: "SG", timeZone: "Asia/Singapore", ping: "15ms", size: 3, pulse: true },
  { id: "tyo", lat: 35.6762, lng: 139.6503, label: "Tokyo", country: "JP", timeZone: "Asia/Tokyo", ping: "22ms", size: 3, pulse: true },
  { id: "syd", lat: -33.8688, lng: 151.2093, label: "Sydney", country: "AU", timeZone: "Australia/Sydney", ping: "38ms", size: 3, pulse: true },
  { id: "sp", lat: -23.5505, lng: -46.6333, label: "São Paulo", country: "BR", timeZone: "America/Sao_Paulo", ping: "45ms", size: 3, pulse: true },
];

export const DEFAULT_ARCS: MapArc[] = [
  { start: { lat: 37.7749, lng: -122.4194 }, end: { lat: 51.5074, lng: -0.1278 } }, // SF to London
  { start: { lat: 51.5074, lng: -0.1278 }, end: { lat: 12.9716, lng: 77.5946 } },   // London to Bengaluru
  { start: { lat: 12.9716, lng: 77.5946 }, end: { lat: 35.6762, lng: 139.6503 } },  // Bengaluru to Tokyo
  { start: { lat: 35.6762, lng: 139.6503 }, end: { lat: -33.8688, lng: 151.2093 } },// Tokyo to Sydney
];

export function WorldMap({
  width = 900,
  height = 450,
  dotRadius = 1.8,
  dotColor,
  markerColor = "#3B82F6",
  pulseColor,
  markers = DEFAULT_MARKERS,
  arcs = DEFAULT_ARCS,
  pulse = true,
  stagger = true,
  enableTooltips = true,
  showTimezones = false,
  interactive = true,
  className,
  onMarkerClick,
  renderMarkerOverlay,
  style,
  ...svgProps
}: WorldMapProps) {
  const [hoveredMarker, setHoveredMarker] = useState<MapMarker | null>(null);
  const [now, setNow] = useState<Date>(new Date());

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatLocalTime = (tz?: string) => {
    if (!tz) return now.toLocaleTimeString();
    try {
      return new Intl.DateTimeFormat("en-US", {
        timeZone: tz,
        hour: "numeric",
        minute: "numeric",
        second: "numeric",
        hour12: true,
      }).format(now);
    } catch {
      return now.toLocaleTimeString();
    }
  };

  // Convert landmass sample points into SVG grid coordinates
  const points = useMemo(() => {
    return WORLD_LANDMASS_SAMPLES.map(([lat, lng]) => {
      const { x, y } = latLngToXY(lat, lng, width, height);
      return { x: Math.round(x * 10) / 10, y: Math.round(y * 10) / 10 };
    });
  }, [width, height]);

  // Convert markers to SVG coordinates
  const plottedMarkers = useMemo(() => {
    return markers.map((m) => {
      const { x, y } = latLngToXY(m.lat, m.lng, width, height);
      return { ...m, x, y };
    });
  }, [markers, width, height]);

  // Generate SVG Bezier arc paths
  const plottedArcs = useMemo(() => {
    return arcs.map((arc, idx) => {
      const start = latLngToXY(arc.start.lat, arc.start.lng, width, height);
      const end = latLngToXY(arc.end.lat, arc.end.lng, width, height);

      // Calculate control point for arching curve
      const dx = end.x - start.x;
      const dy = end.y - start.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const midX = (start.x + end.x) / 2;
      const midY = (start.y + end.y) / 2 - dist * 0.25; // arch curvature height

      return {
        id: arc.id || `arc-${idx}`,
        path: `M ${start.x} ${start.y} Q ${midX} ${midY} ${end.x} ${end.y}`,
        color: arc.color || markerColor,
        strokeWidth: arc.strokeWidth || 1.2,
      };
    });
  }, [arcs, width, height, markerColor]);

  return (
    <div className={cn("relative w-full h-full select-none overflow-hidden flex flex-col justify-center items-center", className)}>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="xMidYMid meet"
        className="w-full h-full text-zinc-300 dark:text-zinc-700 transition-colors duration-300"
        style={{ width: "100%", height: "100%", ...style }}
        {...svgProps}
      >
        {/* Subtle grid background */}
        <defs>
          <radialGradient id="mapCenterGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={markerColor} stopOpacity="0.08" />
            <stop offset="100%" stopColor="transparent" stopOpacity="0" />
          </radialGradient>
        </defs>

        <rect width={width} height={height} fill="url(#mapCenterGlow)" />

        {/* Continental Dotted Matrix */}
        <g className="transition-opacity duration-300">
          {points.map((pt, i) => (
            <circle
              key={`dot-${i}`}
              cx={pt.x}
              cy={pt.y}
              r={dotRadius}
              fill={dotColor || "currentColor"}
              className="opacity-70 dark:opacity-50 transition-colors duration-300"
            />
          ))}
        </g>

        {/* Connecting Curved Arcs */}
        <g className="pointer-events-none">
          {plottedArcs.map((arc) => (
            <g key={arc.id}>
              <path
                d={arc.path}
                fill="none"
                stroke={arc.color}
                strokeWidth={arc.strokeWidth}
                strokeOpacity={0.35}
                strokeDasharray="4 4"
              />
              {/* Traveling light particle */}
              <circle r={2} fill={arc.color}>
                <animateMotion path={arc.path} dur="4s" repeatCount="indefinite" />
              </circle>
            </g>
          ))}
        </g>

        {/* Location Markers */}
        {plottedMarkers.map((marker, idx) => {
          const r = marker.size || 3.5;
          const mColor = marker.color || markerColor;
          const pColor = pulseColor || mColor;
          const shouldPulse = pulse || marker.pulse;
          const isHovered = hoveredMarker?.id === marker.id || (hoveredMarker?.lat === marker.lat && hoveredMarker?.lng === marker.lng);

          return (
            <g
              key={marker.id || `marker-${idx}`}
              className={interactive ? "cursor-pointer group" : ""}
              onMouseEnter={() => interactive && setHoveredMarker(marker)}
              onMouseLeave={() => interactive && setHoveredMarker(null)}
              onClick={() => onMarkerClick?.(marker)}
            >
              {/* Pulsing radar waves */}
              {shouldPulse && (
                <g pointerEvents="none">
                  <circle cx={marker.x} cy={marker.y} r={r} fill="none" stroke={pColor} strokeWidth={1} strokeOpacity={0.8}>
                    <animate attributeName="r" values={`${r};${r * 3.8}`} dur="1.8s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="0.8;0" dur="1.8s" repeatCount="indefinite" />
                  </circle>
                  <circle cx={marker.x} cy={marker.y} r={r} fill="none" stroke={pColor} strokeWidth={0.8} strokeOpacity={0.6}>
                    <animate attributeName="r" values={`${r};${r * 3.8}`} dur="1.8s" begin="0.9s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="0.6;0" dur="1.8s" begin="0.9s" repeatCount="indefinite" />
                  </circle>
                </g>
              )}

              {/* Core solid marker point */}
              <circle
                cx={marker.x}
                cy={marker.y}
                r={isHovered ? r * 1.4 : r}
                fill={mColor}
                className="transition-all duration-200 drop-shadow-md"
              />

              {/* Center highlight dot */}
              <circle cx={marker.x} cy={marker.y} r={r * 0.4} fill="#FFFFFF" />

              {/* Custom Marker Overlay Hook */}
              {renderMarkerOverlay?.({ marker, x: marker.x, y: marker.y, r })}
            </g>
          );
        })}
      </svg>

      {/* Floating Interactive Tooltip */}
      <AnimatePresence>
        {enableTooltips && hoveredMarker && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute z-50 p-3 bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl border border-zinc-200 dark:border-zinc-800 shadow-2xl rounded-2xl pointer-events-none text-left min-w-[200px]"
            style={{
              left: `${(latLngToXY(hoveredMarker.lat, hoveredMarker.lng, width, height).x / width) * 100}%`,
              top: `${(latLngToXY(hoveredMarker.lat, hoveredMarker.lng, width, height).y / height) * 100}%`,
              transform: "translate(-50%, -125%)",
            }}
          >
            <div className="flex items-center justify-between gap-2 border-b border-zinc-100 dark:border-zinc-800 pb-2 mb-2">
              <div className="flex items-center gap-1.5 min-w-0">
                <MapPin className="w-3.5 h-3.5 text-primarylw shrink-0" />
                <span className="font-bold text-xs text-zinc-900 dark:text-white truncate">
                  {hoveredMarker.label || `${hoveredMarker.lat.toFixed(1)}°, ${hoveredMarker.lng.toFixed(1)}°`}
                </span>
              </div>
              {hoveredMarker.ping && (
                <span className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[9px] font-bold px-1.5 py-0.5 rounded-md flex items-center gap-1 shrink-0">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  {hoveredMarker.ping}
                </span>
              )}
            </div>

            <div className="space-y-1 text-[11px]">
              {hoveredMarker.timeZone && (
                <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" /> Local Time
                  </span>
                  <span className="font-mono font-semibold text-zinc-900 dark:text-zinc-200">
                    {formatLocalTime(hoveredMarker.timeZone)}
                  </span>
                </div>
              )}
              <div className="flex items-center justify-between text-zinc-500 dark:text-zinc-400">
                <span>Coordinates</span>
                <span className="font-mono font-medium text-[10px] text-zinc-600 dark:text-zinc-400">
                  {hoveredMarker.lat.toFixed(2)}°, {hoveredMarker.lng.toFixed(2)}°
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default WorldMap;
