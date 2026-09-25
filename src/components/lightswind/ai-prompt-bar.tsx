"use client";

import React, { useState, useRef, useEffect, useLayoutEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Paperclip, AudioLines, ArrowUp, ChevronDown, Globe, Database, X, FileText, Command as CommandIcon, Code, Mail, FileSpreadsheet, Sparkles, Zap, Cpu, Brain } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/lightswind/button";

export interface AiModel {
  id: string;
  name: string;
  tag?: string;
  icon?: React.ReactNode;
}

export interface AiSource {
  id: string;
  name: string;
  desc: string;
  icon: React.ReactNode;
  brand?: "figma" | "slack" | "gmail" | "github" | "notion" | "drive";
  connected?: boolean;
  attach?: boolean;
}

export interface AiCommand {
  id: string;
  name: string;
  desc: string;
  icon?: React.ReactNode;
}

export interface AiPromptBarProps {
  placeholder?: string;
  variant?: "rounded" | "pill" | "glass" | "minimal";
  models?: AiModel[];
  defaultModelId?: string;
  sources?: AiSource[];
  commands?: AiCommand[];
  onSend?: (payload: { text: string; model: AiModel; attachments: string[] }) => void;
  className?: string;
  disabled?: boolean;
}

/* Crisp Brand SVG Icons */
const BRAND_ICONS = {
  figma: (
    <svg width="14" height="14" viewBox="0 0 38 57" fill="none" aria-hidden="true">
      <path d="M9.5 57A9.5 9.5 0 0 0 19 47.5V38H9.5a9.5 9.5 0 0 0 0 19z" fill="#0ACF83" />
      <path d="M0 28.5A9.5 9.5 0 0 1 9.5 19H19v19H9.5A9.5 9.5 0 0 1 0 28.5z" fill="#A259FF" />
      <path d="M0 9.5A9.5 9.5 0 0 1 9.5 0H19v19H9.5A9.5 9.5 0 0 1 0 9.5z" fill="#F24E1E" />
      <path d="M19 0h9.5a9.5 9.5 0 1 1 0 19H19V0z" fill="#FF7262" />
      <path d="M38 28.5a9.5 9.5 0 1 1-19 0 9.5 9.5 0 0 1 19 0z" fill="#1ABCFE" />
    </svg>
  ),
  slack: (
    <svg width="15" height="15" viewBox="0 0 127 127" fill="none" aria-hidden="true">
      <path d="M27.2 80c0 7.3-5.9 13.2-13.2 13.2C6.7 93.2.8 87.3.8 80c0-7.3 5.9-13.2 13.2-13.2h13.2V80zm6.6 0c0-7.3 5.9-13.2 13.2-13.2 7.3 0 13.2 5.9 13.2 13.2v33c0 7.3-5.9 13.2-13.2 13.2-7.3 0-13.2-5.9-13.2-13.2V80z" fill="#E01E5A" />
      <path d="M47 27.2c-7.3 0-13.2-5.9-13.2-13.2C33.8 6.7 39.7.8 47 .8c7.3 0 13.2 5.9 13.2 13.2v13.2H47zm0 6.7c7.3 0 13.2 5.9 13.2 13.2 0 7.3-5.9 13.2-13.2 13.2H13.9C6.6 60.3.7 54.4.7 47.1c0-7.3 5.9-13.2 13.2-13.2H47z" fill="#36C5F0" />
      <path d="M99.9 47.1c0-7.3 5.9-13.2 13.2-13.2 7.3 0 13.2 5.9 13.2 13.2 0 7.3-5.9 13.2-13.2 13.2H99.9V47.1zm-6.6 0c0 7.3-5.9 13.2-13.2 13.2-7.3 0-13.2-5.9-13.2-13.2V13.9C66.9 6.6 72.8.7 80.1.7c7.3 0 13.2 5.9 13.2 13.2v33.2z" fill="#2EB67D" />
      <path d="M80.1 99.8c7.3 0 13.2 5.9 13.2 13.2 0 7.3-5.9 13.2-13.2 13.2-7.3 0-13.2-5.9-13.2-13.2V99.8h13.2zm0-6.6c-7.3 0-13.2-5.9-13.2-13.2 0-7.3 5.9-13.2 13.2-13.2h33.1c7.3 0 13.2 5.9 13.2 13.2 0 7.3-5.9 13.2-13.2 13.2H80.1z" fill="#ECB22E" />
    </svg>
  ),
  github: (
    <svg width="15" height="15" viewBox="0 0 98 96" fill="currentColor" aria-hidden="true">
      <path fillRule="evenodd" clipRule="evenodd" d="M48.854 0C21.839 0 0 22 0 49.217c0 21.756 13.993 40.172 33.405 46.69 2.427.49 3.316-1.059 3.316-2.362 0-1.141-.08-5.052-.08-9.127-13.59 2.938-16.42-5.867-16.42-5.867-2.184-5.704-5.42-7.17-5.42-7.17-4.448-3.015.324-3.015.324-3.015 4.934.326 7.523 5.052 7.523 5.052 4.367 7.496 11.404 5.378 14.235 4.074.404-3.178 1.699-5.378 3.074-6.6-10.839-1.141-22.243-5.378-22.243-24.283 0-5.378 1.94-9.778 5.014-13.2-.485-1.222-2.184-6.275.486-13.038 0 0 4.125-1.304 13.426 5.052a46.97 46.97 0 0 1 12.214-1.63c4.125 0 8.33.571 12.213 1.63 9.302-6.356 13.427-5.052 13.427-5.052 2.67 6.763.97 11.816.485 13.038 3.155 3.422 5.015 7.822 5.015 13.2 0 18.905-11.404 23.06-22.324 24.283 1.78 1.548 3.316 4.481 3.316 9.126 0 6.6-.08 11.897-.08 13.526 0 1.304.89 2.853 3.316 2.364 19.412-6.52 33.405-24.935 33.405-46.691C97.707 22 75.869 0 48.854 0z" />
    </svg>
  ),
  notion: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M4.459 4.208c.746.606 1.026.56 2.428.466l13.215-.793c.28 0 .047-.28-.047-.326L17.86 1.777c-.467-.373-1.213-.653-2.006-.56L2.92 2.244c-.373.047-.467.233-.327.467l1.866 1.497zm1.587 4.155v13.626c0 .84.42 1.307 1.493 1.213l13.727-.793c.84-.047 1.167-.56 1.167-1.353V6.822c0-.793-.373-1.167-1.073-1.12L7.333 6.449c-.84.047-1.287.513-1.287 1.914zm12.934 1.493l.093 11.197c.047.513-.187.793-.653.84l-2.006.14-5.226-7.886v7.373l1.866.14c.42.047.513.327.513.746l-4.573.28c-.373.047-.56-.233-.56-.653V10.749c0-.467.233-.7.746-.746l2.1-.14 5.087 7.746V10.75l-1.633-.14c-.42-.047-.513-.327-.513-.746l4.573-.28c.373-.047.467.28.467.606z" />
    </svg>
  ),
  drive: (
    <svg width="15" height="13" viewBox="0 0 87.3 78" fill="none" aria-hidden="true">
      <path d="m6.6 66.85 3.85 6.65c.8 1.4 1.95 2.5 3.3 3.3l13.75-23.8H0c0 1.55.4 3.1 1.2 4.5l5.4 9.35z" fill="#0066DA" />
      <path d="M43.65 25 29.9 1.2c-1.35.8-2.5 1.9-3.3 3.3l-25.4 44c-.8 1.4-1.2 2.95-1.2 4.5h27.5L43.65 25z" fill="#00AC47" />
      <path d="M73.55 76.8c1.35-.8 2.5-1.9 3.3-3.3l5.4-9.35c.8-1.4 1.2-2.95 1.2-4.5H55.95l6.85 11.85 10.75 5.3z" fill="#EA4335" />
      <path d="M43.65 25 57.4 1.2C56.05.4 54.5 0 52.95 0H34.35c-1.55 0-3.1.4-4.45 1.2L43.65 25z" fill="#00832D" />
      <path d="M55.95 53 42.2 29.2l-13.75 23.8h27.5z" fill="#2684FC" />
      <path d="M73.55 76.8 59.8 53H32.3l13.75 23.8h27.5c1.55 0 3.1-.4 4.45-1.25z" fill="#FFBA00" />
    </svg>
  ),
  gmail: (
    <svg width="15" height="12" viewBox="0 0 256 193" fill="none" aria-hidden="true">
      <path d="M58.182 192.05V93.14L27.507 65.077 0 49.504v125.091c0 9.658 7.825 17.455 17.455 17.455h40.727Z" fill="#4285F4" />
      <path d="M197.818 192.05h40.727c9.659 0 17.455-7.826 17.455-17.455V49.505l-31.156 17.837-27.026 25.798v98.91Z" fill="#34A853" />
      <path d="m58.182 93.14-4.174-38.647 4.174-36.989L128 69.868l69.818-52.364 4.669 34.992-4.669 40.644L128 145.504 58.182 93.14Z" fill="#EA4335" />
      <path d="M197.818 17.504V93.14L256 49.504V26.231c0-21.585-24.64-33.89-41.89-20.945l-16.292 12.218Z" fill="#FBBC04" />
      <path d="m0 49.504 26.759 20.07L58.182 93.14V17.504L41.89 5.286C24.61-7.66 0 4.646 0 26.23v23.273Z" fill="#C5221F" />
    </svg>
  ),
};

const DEFAULT_MODELS: AiModel[] = [
  { id: "claude-3-7-sonnet", name: "Claude 3.7 Sonnet", tag: "Thinking", icon: <Brain className="w-3.5 h-3.5" /> },
  { id: "gpt-4o", name: "GPT-4o", tag: "Omni", icon: <Sparkles className="w-3.5 h-3.5" /> },
  { id: "claude-3-5-sonnet", name: "Claude 3.5 Sonnet", tag: "Artifacts", icon: <Zap className="w-3.5 h-3.5" /> },
  { id: "gemini-1-5-pro", name: "Gemini 1.5 Pro", tag: "Multimodal", icon: <Sparkles className="w-3.5 h-3.5" /> },
  { id: "deepseek-r1", name: "DeepSeek R1", tag: "Reasoning", icon: <Cpu className="w-3.5 h-3.5" /> },
  { id: "llama-3-3", name: "Llama 3.3 70B", tag: "Open Source", icon: <Cpu className="w-3.5 h-3.5" /> },
];

const DEFAULT_SOURCES: AiSource[] = [
  { id: "attach", name: "Add photos & files", desc: "Upload from your computer", icon: <Paperclip className="w-4 h-4" />, attach: true },
  { id: "web", name: "Web search", desc: "Real-time Google search & news", icon: <Globe className="w-4 h-4" /> },
  { id: "github", name: "GitHub Repos", desc: "Search code, issues & PRs", brand: "github", icon: null },
  { id: "figma", name: "Figma Components", desc: "Design-to-code & UI tokens", brand: "figma", icon: null },
  { id: "slack", name: "Slack Channels", desc: "Thread context & team chats", brand: "slack", connected: true, icon: null },
  { id: "notion", name: "Notion Pages", desc: "Docs, wikis & workspace notes", brand: "notion", icon: null },
  { id: "drive", name: "Google Drive", desc: "Read files & Google Sheets", brand: "drive", icon: null },
  { id: "db", name: "Database Context", desc: "PostgreSQL & Supabase schemas", icon: <Database className="w-4 h-4" /> },
];

const DEFAULT_COMMANDS: AiCommand[] = [
  { id: "summarize", name: "/summarize", desc: "Digest current context or thread", icon: <FileText className="w-4 h-4" /> },
  { id: "code-review", name: "/code-review", desc: "Audit code quality, bugs & performance", icon: <Code className="w-4 h-4" /> },
  { id: "draft-email", name: "/draft-email", desc: "Draft formal response or status update", icon: <Mail className="w-4 h-4" /> },
  { id: "generate-spec", name: "/generate-spec", desc: "Create technical PRD & API specs", icon: <FileSpreadsheet className="w-4 h-4" /> },
];

const MOCK_FILES = ["architecture-spec.pdf", "user-churn-q3.csv", "ui-kit-v2.fig"];

const VARIANT_MAP = {
  rounded: "rounded-2xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800",
  pill: "rounded-full px-3 py-1 bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md border border-zinc-200/80 dark:border-zinc-800/80 shadow-md",
  glass: "rounded-2xl bg-white/80 dark:bg-zinc-950/80 backdrop-blur-md border border-zinc-200/80 dark:border-zinc-800/80 shadow-md",
  minimal: "rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-transparent hover:border-zinc-200 dark:hover:border-zinc-800",
};

export const AiPromptBar: React.FC<AiPromptBarProps> = ({
  placeholder = "Ask AI, type @ or /…",
  variant = "rounded",
  models = DEFAULT_MODELS,
  defaultModelId = "claude-3-7-sonnet",
  sources = DEFAULT_SOURCES,
  commands = DEFAULT_COMMANDS,
  onSend,
  className,
  disabled = false,
}) => {
  const [draft, setDraft] = useState("");
  const [selectedModel, setSelectedModel] = useState<AiModel>(
    models.find((m) => m.id === defaultModelId) || models[0]
  );
  const [attachments, setAttachments] = useState<string[]>([]);
  const [plusOpen, setPlusOpen] = useState(false);
  const [modelOpen, setModelOpen] = useState(false);
  const [listening, setListening] = useState(false);
  const [menuActiveIndex, setMenuActiveIndex] = useState(0);

  const inputRef = useRef<HTMLTextAreaElement>(null);
  const controlsRef = useRef<HTMLDivElement>(null);

  // Extract token query for @ or /
  const tokenMatch = /(^|\s)([@/])([\w-]*)$/.exec(draft);
  const lastWord = draft.split(/\s+/).pop() || "";

  const tokenKind = plusOpen ? "at" : tokenMatch ? (tokenMatch[2] === "@" ? "at" : "slash") : null;
  
  // Real-time search query calculation
  const tokenQuery = plusOpen
    ? (tokenMatch ? tokenMatch[3].toLowerCase() : lastWord.startsWith("@") ? lastWord.slice(1).toLowerCase() : lastWord.toLowerCase())
    : (tokenMatch ? tokenMatch[3].toLowerCase() : "");

  const menuRows = tokenKind === "at"
    ? sources.filter((s) => s.name.toLowerCase().includes(tokenQuery) || s.desc.toLowerCase().includes(tokenQuery))
    : tokenKind === "slash"
      ? commands.filter((c) => c.name.toLowerCase().includes(tokenQuery) || c.desc.toLowerCase().includes(tokenQuery))
      : [];

  useEffect(() => {
    setMenuActiveIndex(0);
  }, [tokenKind, tokenQuery]);

  // Auto grow input
  useLayoutEffect(() => {
    const input = inputRef.current;
    if (!input) return;

    if (!draft) {
      input.style.height = "24px";
    } else {
      input.style.height = "0px";
      const scrollH = input.scrollHeight;
      input.style.height = `${Math.min(Math.max(scrollH, 24), 120)}px`;
    }
  }, [draft]);

  // Dictation mock
  useEffect(() => {
    if (!listening) return;
    const timer = setTimeout(() => {
      setDraft((prev) => (prev ? `${prev.trim()} Audit user retention trends for Q3` : "Audit user retention trends for Q3"));
      setListening(false);
      inputRef.current?.focus();
    }, 2200);
    return () => clearTimeout(timer);
  }, [listening]);

  const handleSelectModel = (m: AiModel) => {
    setSelectedModel(m);
    setModelOpen(false);
  };

  const handlePickRow = (item: AiSource | AiCommand) => {
    if ("attach" in item && item.attach) {
      const nextFile = MOCK_FILES[attachments.length % MOCK_FILES.length];
      setAttachments((prev) => [...prev, nextFile]);
      if (tokenMatch) {
        setDraft(draft.slice(0, tokenMatch.index + tokenMatch[1].length));
      }
    } else {
      const isAt = tokenKind === "at";
      const prefix = isAt ? "@" : "";
      
      if (tokenMatch) {
        const base = draft.slice(0, tokenMatch.index + tokenMatch[1].length);
        setDraft(`${base}${prefix}${item.name} `);
      } else {
        // Strip trailing search word if user typed query after clicking plus
        const words = draft.trimEnd().split(/\s+/);
        if (words.length > 0 && !draft.endsWith(" ")) {
          words.pop();
        }
        const base = words.length > 0 ? words.join(" ") + " " : "";
        setDraft(`${base}${prefix}${item.name} `);
      }
    }
    setPlusOpen(false);
    setTimeout(() => inputRef.current?.focus(), 10);
  };

  const handleSend = () => {
    if ((!draft.trim() && attachments.length === 0) || disabled) return;
    if (onSend) {
      onSend({ text: draft.trim(), model: selectedModel, attachments });
    }
    setDraft("");
    setAttachments([]);
    setPlusOpen(false);
    setModelOpen(false);
  };

  const isPill = variant === "pill";
  const roundedClass = isPill ? "rounded-full" : variant === "minimal" ? "rounded-xl" : "rounded-2xl";

  return (
    <div className={cn("relative w-full max-w-xl mx-auto font-sans text-zinc-900 dark:text-zinc-100", roundedClass, className)}>
      {/* ── Dropdown Menus ── */}
      <AnimatePresence>
        {/* @ or / Menu */}
        {tokenKind && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.98 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute bottom-full left-0 right-0 z-50 mb-2 rounded-2xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shadow-xl overflow-hidden"
          >
            <div className="max-h-56 overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden p-1 space-y-0.5">
              {menuRows.map((row, i) => {
                const isActive = i === menuActiveIndex;
                const source = tokenKind === "at" ? (row as AiSource) : undefined;
                return (
                  <button
                    key={row.id}
                    type="button"
                    onMouseEnter={() => setMenuActiveIndex(i)}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      handlePickRow(row);
                    }}
                    className={cn(
                      "w-full flex items-center justify-between gap-3 px-3 py-2 rounded-xl text-left text-xs transition-all duration-150 cursor-pointer",
                      isActive
                        ? "bg-zinc-100 dark:bg-zinc-850 font-semibold"
                        : "hover:bg-zinc-50 dark:hover:bg-zinc-900/60"
                    )}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="shrink-0 w-5 h-5 flex items-center justify-center text-zinc-600 dark:text-zinc-400">
                        {source?.brand ? BRAND_ICONS[source.brand] : (row.icon || <Paperclip className="w-4 h-4" />)}
                      </div>
                      <span className="font-bold text-zinc-900 dark:text-white shrink-0">{row.name}</span>
                      <span className="text-[12px] text-zinc-400 dark:text-zinc-500 truncate">{row.desc}</span>
                    </div>

                    {source?.connected ? (
                      <span className="text-[12px] font-medium text-emerald-600 dark:text-emerald-400 shrink-0">
                        Connected
                      </span>
                    ) : isActive ? (
                      <CommandIcon className="w-3.5 h-3.5 shrink-0 text-zinc-400" />
                    ) : null}
                  </button>
                );
              })}
              {menuRows.length === 0 && (
                <div className="px-3 py-3 text-center text-xs text-zinc-400 dark:text-zinc-500">
                  No matches for &quot;{tokenQuery}&quot;
                </div>
              )}
            </div>
            <div className="px-3 py-2 border-t border-zinc-100 dark:border-zinc-900 text-[11px] text-zinc-400 dark:text-zinc-500">
              {tokenKind === "at" ? "Type to search sources & files" : "Type to search commands"}
            </div>
          </motion.div>
        )}

        {/* Model Menu */}
        {modelOpen && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.96 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute bottom-full right-0 z-50 mb-2 w-52 p-1.5 rounded-2xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 shadow-xl overflow-hidden"
          >
            <div className="px-2.5 py-1 text-[10px] font-mono tracking-wider uppercase text-zinc-400 dark:text-zinc-500 border-b border-zinc-100 dark:border-zinc-900 mb-1">
              Trending AI Models
            </div>
            <div className="py-0.5 space-y-0.5 max-h-56 overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
              {models.map((m) => {
                const isSelected = m.id === selectedModel.id;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      handleSelectModel(m);
                    }}
                    className={cn(
                      "w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs text-left transition-colors duration-150 cursor-pointer",
                      isSelected
                        ? "bg-zinc-100 dark:bg-zinc-800 font-semibold text-zinc-900 dark:text-white"
                        : "hover:bg-zinc-50 dark:hover:bg-zinc-900 text-zinc-700 dark:text-zinc-300"
                    )}
                  >
                    <div className="flex items-center gap-2">
                      {m.icon}
                      <span>{m.name}</span>
                    </div>
                    {m.tag && (
                      <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-normal">
                        {m.tag}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Main Composer Container ── */}
      <div
        className={cn(
          "relative flex flex-col gap-1.5 p-1.5 transition-all duration-200",
          VARIANT_MAP[variant] || VARIANT_MAP.rounded
        )}
      >
        {/* Attachments */}
        <AnimatePresence>
          {attachments.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="flex flex-wrap gap-1.5 px-2 pt-1"
            >
              {attachments.map((file, idx) => (
                <motion.span
                  key={`${file}-${idx}`}
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs bg-zinc-100 dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 border border-zinc-200/60 dark:border-zinc-800/60"
                >
                  <Paperclip className="w-3 h-3 text-zinc-400" />
                  <span className="max-w-[140px] truncate">{file}</span>
                  <button
                    type="button"
                    onClick={() => setAttachments((prev) => prev.filter((_, i) => i !== idx))}
                    className="p-0.5 rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-100 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </motion.span>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Controls Row */}
        <div ref={controlsRef} className="flex items-center gap-2 w-full px-1">
          {/* Plus icon Button */}
          <Button
            type="button"
            variant={plusOpen ? "default" : "ghost"}
            size="icon"
            aria-label="Add attachment"
            onClick={() => {
              setModelOpen(false);
              setPlusOpen((prev) => !prev);
              inputRef.current?.focus();
            }}
            className={cn("w-8 h-8 shrink-0 p-0", isPill ? "rounded-full" : "rounded-xl")}
          >
            <Plus className="w-4 h-4" />
          </Button>

          {/* Textarea */}
          <textarea
            ref={inputRef}
            rows={1}
            value={draft}
            disabled={disabled}
            onChange={(e) => {
              setDraft(e.target.value);
            }}
            onKeyDown={(e) => {
              if (tokenKind && menuRows.length > 0) {
                if (e.key === "ArrowDown" || e.key === "ArrowUp") {
                  e.preventDefault();
                  setMenuActiveIndex((prev) => (prev + (e.key === "ArrowDown" ? 1 : menuRows.length - 1)) % menuRows.length);
                  return;
                }
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handlePickRow(menuRows[menuActiveIndex]);
                  return;
                }
              }
              if (e.key === "Escape") {
                setPlusOpen(false);
                setModelOpen(false);
                return;
              }
              if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
                e.preventDefault();
                handleSend();
              }
            }}
            placeholder={listening ? "Listening…" : placeholder}
            className="flex-1 min-h-[28px] max-h-[120px] py-1 px-1 bg-transparent border-none outline-none ring-0 ring-offset-0 shadow-none focus:border-none focus:outline-none focus:ring-0 focus:ring-offset-0 focus:shadow-none focus-visible:border-none focus-visible:outline-none focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:shadow-none text-sm leading-relaxed text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 dark:placeholder:text-zinc-500 resize-none overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
          />

          {/* Model Selector Button */}
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => {
              setPlusOpen(false);
              setModelOpen((prev) => !prev);
            }}
            className="flex items-center gap-1 px-2.5 py-1 h-8 rounded-lg text-xs font-medium text-zinc-600 dark:text-zinc-300 shrink-0"
          >
            <span>{selectedModel.name}</span>
            <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />
          </Button>

          {/* Dictation Button */}
          <Button
            type="button"
            variant={listening ? "default" : "ghost"}
            size="icon"
            aria-label={listening ? "Stop dictation" : "Start dictation"}
            onClick={() => setListening((prev) => !prev)}
            className={cn("w-8 h-8 shrink-0 p-0", isPill ? "rounded-full" : "rounded-xl")}
          >
            <AudioLines className="w-4 h-4" />
          </Button>

          {/* Send Button */}
          <Button
            type="button"
            variant={draft.trim() || attachments.length > 0 ? "default" : "secondary"}
            size="icon"
            disabled={(!draft.trim() && attachments.length === 0) || disabled}
            onClick={handleSend}
            className={cn("w-8 h-8 shrink-0 p-0", isPill ? "rounded-full" : "rounded-xl")}
          >
            <ArrowUp className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default AiPromptBar;
