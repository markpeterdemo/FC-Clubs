"use client";

import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";
import { useState, useRef, useEffect, type ReactNode } from "react";

interface Option {
  value: string;
  label: string;
}

interface SelectProps {
  value: string;
  onChange: (value: string) => void;
  options: Option[];
  placeholder?: string;
  className?: string;
}

export function Select({ value, onChange, options, placeholder = "Select...", className }: SelectProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selected = options.find((o) => o.value === value);

  return (
    <div ref={ref} className={cn("relative", className)}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between rounded-xl border border-border bg-surface-2/50 px-3.5 py-2.5 text-sm text-text-primary transition-all duration-200 hover:border-border-light hover:bg-surface-2 backdrop-blur-sm"
      >
        <span className={cn(!selected && "text-text-muted")}>
          {selected ? selected.label : placeholder}
        </span>
        <ChevronDown size={16} className={cn("text-text-muted transition-all duration-200", open && "rotate-180")} />
      </button>
      {open && (
        <div className="absolute z-50 mt-1.5 w-full rounded-xl border border-border glass py-1 shadow-elevated animate-scale-in origin-top">
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => {
                onChange(option.value);
                setOpen(false);
              }}
              className={cn(
                "w-full px-3.5 py-2 text-left text-sm transition-all duration-150 first:rounded-t-lg last:rounded-b-lg",
                option.value === value
                  ? "text-pitch-400 bg-pitch-500/5"
                  : "text-text-primary hover:bg-surface-2/50"
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

interface PositionSelectProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export function PositionSelect({ value, onChange, className, label }: PositionSelectProps & { label?: string }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const groups = [
    { label: "Goalkeepers", positions: ["GK"] },
    { label: "Defenders", positions: ["CB", "LB", "RB"] },
    { label: "Midfielders", positions: ["CDM", "CM", "CAM", "LAM", "RAM", "LM", "RM"] },
    { label: "Forwards", positions: ["LW", "RW", "ST"] },
  ];

  return (
    <div ref={ref} className={cn("relative", className)}>
      {label && <label className="mb-1.5 block text-sm font-medium text-text-secondary">{label}</label>}
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between rounded-xl border border-border bg-surface-2/50 px-3.5 py-2.5 text-sm text-text-primary transition-all duration-200 hover:border-border-light hover:bg-surface-2 backdrop-blur-sm"
      >
        <span className={cn(!value && "text-text-muted")}>
          {value || "Select position..."}
        </span>
        <ChevronDown size={16} className={cn("text-text-muted transition-all duration-200", open && "rotate-180")} />
      </button>
      {open && (
        <div className="absolute z-50 mt-1.5 w-full rounded-xl border border-border glass py-1 shadow-elevated animate-scale-in origin-top max-h-72 overflow-y-auto">
          {groups.map((group) => (
            <div key={group.label}>
              <div className="px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider text-text-muted">
                {group.label}
              </div>
              {group.positions.map((pos) => (
                <button
                  key={pos}
                  type="button"
                  onClick={() => {
                    onChange(pos);
                    setOpen(false);
                  }}
                  className={cn(
                    "w-full px-3.5 py-2 text-left text-sm transition-all duration-150 first:rounded-t-lg last:rounded-b-lg",
                    value === pos
                      ? "text-pitch-400 bg-pitch-500/5"
                      : "text-text-primary hover:bg-surface-2/50"
                  )}
                >
                  {pos}
                </button>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
