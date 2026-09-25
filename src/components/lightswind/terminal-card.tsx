"use client";

import React, { useEffect, useState } from "react";
import { Copy, Terminal, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { toast } from "sonner";

type TerminalCardProps = {
  command: string;
  language?: string;
  className?: string;
};

const TerminalCard: React.FC<TerminalCardProps> = ({ command, className }) => {
  const [copied, setCopied] = useState(false);
  const [displayedText, setDisplayedText] = useState("");
  const [index, setIndex] = useState(0);
  const [isComplete, setIsComplete] = useState(false);

  // Typing animation logic
  useEffect(() => {
    let timeout: NodeJS.Timeout;

    if (index < command.length) {
      timeout = setTimeout(() => {
        setDisplayedText((prev) => prev + command.charAt(index));
        setIndex((prev) => prev + 1);
      }, 40); // typing speed
    } else {
      setIsComplete(true);
      timeout = setTimeout(() => {
        setDisplayedText("");
        setIndex(0);
        setIsComplete(false);
      }, 2000); // restart delay
    }

    return () => clearTimeout(timeout);
  }, [index, command]);

  // Copy handler
  const handleCopy = () => {
    navigator.clipboard.writeText(command);
    setCopied(true);
    toast.success("Copied to clipboard");
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div
      className={cn(
        "border rounded-xl backdrop-blur-md min-w-[300px] max-w-full overflow-hidden shadow-sm",
        "bg-zinc-50 border-zinc-200 text-zinc-900",
        "dark:bg-zinc-950 dark:border-zinc-800 dark:text-zinc-100",
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-3.5 py-2.5 bg-zinc-100/70 dark:bg-zinc-900/70 border-b border-zinc-200 dark:border-zinc-800 text-xs font-semibold text-zinc-600 dark:text-zinc-400">
        <div className="flex items-center gap-2">
          <Terminal className="w-3.5 h-3.5 text-primarylw" />
          <span>Terminal</span>
        </div>
        <button
          className="p-1 rounded-md transition hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
          onClick={handleCopy}
          aria-label="Copy to clipboard"
        >
          {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Content */}
      <div className="text-xs font-mono p-3.5 bg-zinc-900 text-zinc-100 dark:bg-zinc-950 max-h-[300px] overflow-auto select-text">
        {isComplete ? (
          <pre className="whitespace-pre-wrap m-0 p-0 font-mono text-xs">
            <span className="text-emerald-400 mr-2">$</span>
            {command}
          </pre>
        ) : (
          <motion.pre className="whitespace-pre-wrap m-0 p-0 font-mono text-xs">
            <span className="text-emerald-400 mr-2">$</span>
            {displayedText}
            <motion.span
              className="inline-block w-1.5 h-3.5 bg-emerald-400 ml-1 align-middle"
              animate={{ opacity: [0, 1] }}
              transition={{ duration: 0.6, repeat: Infinity }}
            />
          </motion.pre>
        )}
      </div>
    </div>
  );
};

export default TerminalCard;
