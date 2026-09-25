"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { motion, type HTMLMotionProps } from "framer-motion";
import { Check, Copy, RotateCcw, FileCode, Terminal } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/lightswind/button";
import { Badge } from "@/components/lightswind/badge";
import { getOneDarkTokenStyle, TokenThemeColors } from "@/components/utils/oneDarkTheme";

export interface CodeToken {
  text: string;
  type?: keyof TokenThemeColors;
}

export type TypingAnimationMode =
  | "lineByLine"
  | "charByChar"
  | "typewriter"
  | "fade"
  | "slideIn";

export interface AiCodeBlockProps {
  /** Code string to display and stream */
  code?: string;
  /** Custom pre-tokenized lines if raw parsing is bypassed */
  tokenizedLines?: CodeToken[][];
  /** Filename shown in header */
  filename?: string;
  /** Programming language badge */
  language?: string;
  /** AI agent name badge */
  aiAgentName?: string;
  /** Icon for AI status badge */
  aiIcon?: React.ReactNode;
  /** Typing / streaming animation mode */
  typingAnimation?: TypingAnimationMode;
  /** Whether to stream the code line-by-line automatically */
  isStreaming?: boolean;
  /** Auto start streaming on mount */
  autoPlay?: boolean;
  /** Speed of line/character streaming in ms */
  streamSpeedMs?: number;
  /** Show line numbers column */
  showLineNumbers?: boolean;
  /** Show copy button in header */
  showCopyButton?: boolean;
  /** Show replay animation button in header */
  showReplayButton?: boolean;
  /** Show language badge */
  showLanguageBadge?: boolean;
  /** Show AI status indicator badge */
  showAiStatus?: boolean;
  /** Visual variant */
  variant?: "default" | "glass" | "minimal" | "dark";
  /** Array of line numbers (1-indexed) to highlight */
  highlightLines?: number[];
  /** Max height before scrollable/collapsible (e.g. 400 or 'none') */
  maxHeight?: number | "none";
  /** Additional CSS class names for container */
  className?: string;
  /** Callback when copy button is clicked */
  onCopy?: () => void;
  /** Callback when streaming animation completes */
  onComplete?: () => void;
}

// ── Built-in OneDark Tokenizer Engine ───────────────────────────────────────
const parseCodeToTokens = (codeStr: string): CodeToken[][] => {
  const lines = codeStr.split("\n");
  const keywords = new Set([
    "export", "async", "function", "const", "let", "var", "await", "return",
    "import", "from", "default", "if", "else", "for", "while", "try", "catch",
    "class", "extends", "interface", "type", "public", "private", "protected",
    "def", "self", "None", "True", "False", "in", "is", "not", "and", "or",
    "select", "where", "group", "by", "order", "having", "as", "join", "left",
    "fn", "pub", "struct", "enum", "impl", "mut", "use", "mod", "match"
  ]);

  return lines.map((line) => {
    if (!line.trim()) {
      return [{ text: "", type: "dim" }];
    }

    const tokens: CodeToken[] = [];
    const regex = /(".*?"|'.*?'|`.*?`|\/\/. *?$|#.*?$|\b\d+\b|\b[a-zA-Z_]\w*(?=\()|\b[a-zA-Z_]\w*\b|[{}()\[\];,.:]|[^a-zA-Z0-9\s{}()\[\];,.:]+|\s+)/g;

    let match: RegExpExecArray | null;
    while ((match = regex.exec(line)) !== null) {
      const text = match[0];
      if (!text) continue;

      if (text.startsWith("//") || text.startsWith("#")) {
        tokens.push({ text, type: "comment" });
      } else if (text.startsWith('"') || text.startsWith("'") || text.startsWith("`")) {
        tokens.push({ text, type: "str" });
      } else if (/^\d+$/.test(text)) {
        tokens.push({ text, type: "num" });
      } else if (keywords.has(text.toLowerCase())) {
        tokens.push({ text, type: "kw" });
      } else if (/^[A-Z][a-zA-Z0-9_]*$/.test(text)) {
        tokens.push({ text, type: "type" });
      } else if (line.substring(match.index + text.length).trim().startsWith("(")) {
        tokens.push({ text, type: "fn" });
      } else if (/[{}()\[\];,.:]/.test(text)) {
        tokens.push({ text, type: "dim" });
      } else {
        tokens.push({ text, type: "var" });
      }
    }

    return tokens.length > 0 ? tokens : [{ text: line, type: "var" }];
  });
};

const DEFAULT_SAMPLE_CODE = `import { streamText } from "ai";
import { openai } from "@ai-sdk/openai";

export async function generateUiComponent(prompt: string) {
  const { textStream } = await streamText({
    model: openai("gpt-4o"),
    system: "You are an expert React UI engineer building Lightswind components.",
    prompt,
  });
  return textStream;
}`;

export const AiCodeBlock: React.FC<AiCodeBlockProps> = ({
  code = DEFAULT_SAMPLE_CODE,
  tokenizedLines,
  filename = "generateComponent.ts",
  language = "TypeScript",
  aiAgentName = "Lightswind AI",
  aiIcon = <Terminal className="h-3 w-3 text-primarylw" />,
  typingAnimation = "lineByLine",
  isStreaming = true,
  autoPlay = true,
  streamSpeedMs = 200,
  showLineNumbers = true,
  showCopyButton = true,
  showReplayButton = true,
  showLanguageBadge = true,
  showAiStatus = true,
  variant = "default",
  highlightLines = [],
  maxHeight = "none",
  className,
  onCopy,
  onComplete,
}) => {
  // Parsed tokenized lines
  const parsedLines = useMemo(() => {
    if (tokenizedLines && tokenizedLines.length > 0) {
      return tokenizedLines;
    }
    return parseCodeToTokens(code);
  }, [code, tokenizedLines]);

  // Total character count across all lines
  const totalCharCount = useMemo(() => {
    return parsedLines.reduce(
      (acc, line) => acc + line.reduce((lAcc, tok) => lAcc + tok.text.length, 0) + 1,
      0
    );
  }, [parsedLines]);

  const isCharMode = typingAnimation === "charByChar" || typingAnimation === "typewriter";

  // Line-based visible state
  const [visibleCount, setVisibleCount] = useState<number>(
    isStreaming && autoPlay ? 0 : parsedLines.length
  );

  // Character-based visible state
  const [visibleCharCount, setVisibleCharCount] = useState<number>(
    isStreaming && autoPlay ? 0 : totalCharCount
  );

  const [copied, setCopied] = useState<boolean>(false);
  const [isExpanded, setIsExpanded] = useState<boolean>(true);

  const isDone = isCharMode
    ? visibleCharCount >= totalCharCount
    : visibleCount >= parsedLines.length;

  // Timer for line-by-line or char-by-char streaming
  useEffect(() => {
    if (!isStreaming || !autoPlay) {
      setVisibleCount(parsedLines.length);
      setVisibleCharCount(totalCharCount);
      return;
    }

    if (isCharMode) {
      if (visibleCharCount >= totalCharCount) {
        if (onComplete) onComplete();
        return;
      }

      const charSpeed = Math.max(12, Math.floor(streamSpeedMs / 14));
      const timer = setTimeout(() => {
        setVisibleCharCount((prev) => prev + 1);
      }, charSpeed);

      return () => clearTimeout(timer);
    } else {
      if (visibleCount >= parsedLines.length) {
        if (onComplete) onComplete();
        return;
      }

      const timer = setTimeout(() => {
        setVisibleCount((prev) => prev + 1);
      }, streamSpeedMs);

      return () => clearTimeout(timer);
    }
  }, [
    isStreaming,
    autoPlay,
    isCharMode,
    visibleCount,
    visibleCharCount,
    parsedLines.length,
    totalCharCount,
    streamSpeedMs,
    onComplete,
  ]);

  // Replay handler
  const handleReplay = useCallback(() => {
    setVisibleCount(0);
    setVisibleCharCount(0);
  }, []);

  // Copy handler
  const handleCopy = useCallback(() => {
    const rawText = tokenizedLines
      ? tokenizedLines.map((line) => line.map((t) => t.text).join("")).join("\n")
      : code;

    navigator.clipboard.writeText(rawText).then(() => {
      setCopied(true);
      if (onCopy) onCopy();
      setTimeout(() => setCopied(false), 2000);
    });
  }, [code, tokenizedLines, onCopy]);

  // Derived displayed lines for rendering
  const displayedLines = useMemo(() => {
    if (!isStreaming || !autoPlay) {
      return parsedLines;
    }

    if (isCharMode) {
      let budget = visibleCharCount;
      const result: CodeToken[][] = [];

      for (let i = 0; i < parsedLines.length; i++) {
        if (budget <= 0) break;
        const line = parsedLines[i];
        const slicedLine: CodeToken[] = [];

        for (const tok of line) {
          if (budget <= 0) break;

          if (tok.text.length <= budget) {
            slicedLine.push(tok);
            budget -= tok.text.length;
          } else {
            slicedLine.push({ text: tok.text.slice(0, budget), type: tok.type });
            budget = 0;
            break;
          }
        }
        budget -= 1; // count line break
        result.push(slicedLine);
      }
      return result;
    }

    return parsedLines.slice(0, visibleCount);
  }, [parsedLines, isStreaming, autoPlay, isCharMode, visibleCharCount, visibleCount]);

  // Variant container styles
  const containerVariants = {
    default:
      "bg-zinc-50/90 dark:bg-zinc-950/90 border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-sm",
    glass:
      "bg-white/60 dark:bg-zinc-900/60 backdrop-blur-xl border-zinc-200/50 dark:border-zinc-800/50 text-zinc-900 dark:text-zinc-100 shadow-lg shadow-black/5 dark:shadow-black/20",
    minimal:
      "bg-transparent border-zinc-200/60 dark:border-zinc-800/60 text-zinc-900 dark:text-zinc-100",
    dark:
      "bg-zinc-950 border-zinc-800/90 text-zinc-100 shadow-md",
  };

  const headerVariants = {
    default: "border-b border-zinc-200/80 dark:border-zinc-800/80 bg-zinc-100/60 dark:bg-zinc-900/60",
    glass: "border-b border-zinc-200/40 dark:border-zinc-800/40 bg-white/40 dark:bg-zinc-900/40 backdrop-blur-md",
    minimal: "border-b border-zinc-200/60 dark:border-zinc-800/60 bg-transparent",
    dark: "border-b border-zinc-800/80 bg-zinc-900/70",
  };

  // Motion config for typingAnimation modes
  const getMotionProps = (mode: TypingAnimationMode): HTMLMotionProps<"div"> => {
    switch (mode) {
      case "charByChar":
        return {
          initial: { opacity: 0 },
          animate: { opacity: 1 },
          transition: { duration: 0.05 },
        };
      case "typewriter":
        return {
          initial: { opacity: 0 },
          animate: { opacity: 1 },
          transition: { duration: 0.03 },
        };
      case "fade":
        return {
          initial: { opacity: 0, filter: "blur(4px)" },
          animate: { opacity: 1, filter: "blur(0px)" },
          transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] as const },
        };
      case "slideIn":
        return {
          initial: { opacity: 0, x: -16 },
          animate: { opacity: 1, x: 0 },
          transition: { duration: 0.22, ease: [0.16, 1, 0.3, 1] as const },
        };
      case "lineByLine":
      default:
        return {
          initial: { opacity: 0, y: 4 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.18, ease: [0.16, 1, 0.3, 1] as const },
        };
    }
  };

  // Cursor style based on typingAnimation mode
  const renderCursor = (mode: TypingAnimationMode) => {
    switch (mode) {
      case "typewriter":
        return <span className="ml-0.5 inline-block h-4 w-2.5 bg-primarylw animate-pulse select-none font-bold">█</span>;
      case "charByChar":
        return (
          <span className="ml-0.5 inline-block h-3.5 w-1.5 rounded-full bg-primarylw animate-pulse shadow-[0_0_10px_rgba(59,130,246,0.9)]" />
        );
      case "fade":
        return <span className="ml-1 inline-block h-3.5 w-2 rounded bg-primarylw/80 animate-pulse" />;
      case "slideIn":
        return <span className="ml-1 inline-block h-3.5 w-0.5 bg-primarylw animate-pulse" />;
      case "lineByLine":
      default:
        return <span className="ml-1 inline-block h-3.5 w-[3px] translate-y-0.5 rounded-full bg-primarylw animate-pulse" />;
    }
  };

  return (
    <div
      className={cn(
        "relative w-full rounded-2xl border overflow-hidden transition-all duration-300 font-sans",
        containerVariants[variant],
        className
      )}
    >
      {/* Header Bar */}
      <div
        className={cn(
          "flex items-center justify-between px-4 py-3 select-none",
          headerVariants[variant]
        )}
      >
        {/* Left: Filename & Lightswind Badge */}
        <div className="flex items-center gap-2.5 min-w-0">
          <FileCode className="h-4 w-4 shrink-0 text-muted-foreground" />
          <span className="font-mono text-xs font-semibold tracking-tight text-foreground truncate">
            {filename}
          </span>
          {showLanguageBadge && (
            <Badge
              variant="secondary"
              shape="rounded"
              size="sm"
              className="font-mono font-medium text-[11px] bg-zinc-200/60 dark:bg-zinc-800/60 text-muted-foreground border-zinc-300/40 dark:border-zinc-700/40"
            >
              {language}
            </Badge>
          )}
        </div>

        {/* Right: Lightswind AI Status Badge & Control Buttons */}
        <div className="flex items-center gap-2 shrink-0">
          {showAiStatus && (
            <Badge
              variant="outline"
              shape="rounded"
              size="sm"
              className="gap-1.5 py-1 px-2.5 font-medium bg-zinc-200/50 dark:bg-zinc-800/50 text-foreground border-zinc-300/30 dark:border-zinc-700/30"
            >
              {aiIcon}
              <span className="hidden xs:inline text-[11px] text-muted-foreground font-mono">
                {!isDone ? "Writing code..." : aiAgentName}
              </span>
            </Badge>
          )}

          {showReplayButton && (
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 rounded-lg text-muted-foreground hover:text-foreground hover:bg-zinc-200/60 dark:hover:bg-zinc-800/60 transition-colors"
              onClick={handleReplay}
              title="Replay streaming animation"
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </Button>
          )}

          {showCopyButton && (
            <Button
              variant={copied ? "secondary" : "ghost"}
              size="sm"
              className={cn(
                "h-7 px-2.5 rounded-lg text-xs font-medium gap-1.5 transition-all duration-200",
                copied
                  ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20"
                  : "text-muted-foreground hover:text-foreground hover:bg-zinc-200/60 dark:hover:bg-zinc-800/60"
              )}
              onClick={handleCopy}
            >
              {copied ? (
                <>
                  <Check className="h-3.5 w-3.5 text-emerald-500" />
                  <span className="text-[11px] font-semibold">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="h-3.5 w-3.5" />
                  <span className="text-[11px] font-medium">Copy</span>
                </>
              )}
            </Button>
          )}
        </div>
      </div>

      {/* Code Body Container using OneDark Utility Tokens */}
      <div
        className={cn(
          "relative overflow-x-auto transition-all duration-300 font-mono text-xs sm:text-sm leading-relaxed p-4",
          maxHeight !== "none" && !isExpanded && "max-h-48 overflow-hidden"
        )}
        style={
          maxHeight !== "none" && isExpanded
            ? { maxHeight: `${maxHeight}px`, overflowY: "auto" }
            : {}
        }
      >
        {displayedLines.map((lineTokens, i) => {
          const lineNumber = i + 1;
          const isHighlighted = highlightLines.includes(lineNumber);
          const isCurrentLine = i === displayedLines.length - 1 && !isDone;
          const motionConfig = getMotionProps(typingAnimation);

          return (
            <motion.div
              key={i}
              {...motionConfig}
              className={cn(
                "group flex items-baseline rounded-md px-1.5 py-0.5 transition-colors",
                isHighlighted && "bg-amber-500/10 dark:bg-amber-500/15 border-l-2 border-amber-500 font-medium",
                "hover:bg-zinc-200/40 dark:hover:bg-zinc-800/40"
              )}
            >
              {/* Line Number */}
              {showLineNumbers && (
                <span className="w-7 shrink-0 text-right text-[11px] text-zinc-400 dark:text-zinc-600 select-none pr-3 font-mono">
                  {lineNumber}
                </span>
              )}

              {/* Code Tokens styled with OneDark utility */}
              <span className="pl-1 whitespace-pre flex-1 tracking-normal">
                {lineTokens.map((tok, j) => (
                  <span key={j} style={getOneDarkTokenStyle(tok.type)}>
                    {tok.text}
                  </span>
                ))}

                {/* Animated Typing Cursor */}
                {isCurrentLine && renderCursor(typingAnimation)}
              </span>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default AiCodeBlock;
