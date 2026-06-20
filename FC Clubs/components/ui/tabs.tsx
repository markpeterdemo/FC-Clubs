"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { useState, type ReactNode } from "react";

interface Tab {
  id: string;
  label: string;
  icon?: ReactNode;
  count?: number;
}

interface TabsProps {
  tabs: Tab[];
  activeTab?: string;
  onChange?: (id: string) => void;
  className?: string;
  variant?: "underline" | "pill";
}

export function Tabs({ tabs, activeTab: controlledActive, onChange, className, variant = "pill" }: TabsProps) {
  const [internalActive, setInternalActive] = useState(tabs[0]?.id ?? "");
  const active = controlledActive ?? internalActive;

  function handleSelect(id: string) {
    if (!controlledActive) setInternalActive(id);
    onChange?.(id);
  }

  return (
    <div className={cn("flex gap-1", className)}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => handleSelect(tab.id)}
          className={cn(
            "relative flex items-center gap-2 px-4 py-2 text-sm font-medium transition-all duration-200 rounded-xl",
            active === tab.id
              ? "text-pitch-400"
              : "text-text-secondary hover:text-text-primary hover:bg-surface-2/50"
          )}
        >
          {active === tab.id && variant === "pill" && (
            <motion.span
              layoutId="tab-indicator"
              className="absolute inset-0 bg-pitch-500/10 rounded-xl border border-pitch-500/20"
              transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
            />
          )}
          {active === tab.id && variant === "underline" && (
            <motion.span
              layoutId="tab-underline"
              className="absolute bottom-0 left-0 right-0 h-0.5 bg-pitch-500 rounded-full"
              transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
            />
          )}
          <span className="relative z-10 flex items-center gap-2">
            {tab.icon}
            {tab.label}
            {tab.count !== undefined && (
              <span className={cn(
                "text-xs px-1.5 py-0.5 rounded-full",
                active === tab.id ? "bg-pitch-500/20" : "bg-surface-3"
              )}>
                {tab.count}
              </span>
            )}
          </span>
        </button>
      ))}
    </div>
  );
}

interface TabPanelProps {
  id: string;
  activeTab: string;
  children: ReactNode;
  className?: string;
}

export function TabPanel({ id, activeTab, children, className }: TabPanelProps) {
  if (id !== activeTab) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
      className={cn("mt-4", className)}
    >
      {children}
    </motion.div>
  );
}