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
        className="flex w-full items-center justify-between rounded-lg border border-border bg-surface-2 px-3 py-2.5 text-sm text-text-primary transition-colors hover:border-border-light"
      >
        <span className={cn(!selected && "text-text-muted")}>
          {selected ? selected.label : placeholder}
        </span>
        <ChevronDown size={16} className={cn("text-text-muted transition-transform", open && "rotate-180")} />
      </button>
      {open && (
        <div className="absolute z-50 mt-1 w-full rounded-lg border border-border bg-card py-1 shadow-xl animate-fade-in">
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => {
                onChange(option.value);
                setOpen(false);
              }}
              className={cn(
                "w-full px-3 py-2 text-left text-sm transition-colors hover:bg-surface-2",
                option.value === value ? "text-pitch-400" : "text-text-primary"
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
        className="flex w-full items-center justify-between rounded-lg border border-border bg-surface-2 px-3 py-2.5 text-sm text-text-primary transition-colors hover:border-border-light"
      >
        <span className={cn(!value && "text-text-muted")}>
          {value || "Select position..."}
        </span>
        <ChevronDown size={16} className={cn("text-text-muted transition-transform", open && "rotate-180")} />
      </button>
      {open && (
        <div className="absolute z-50 mt-1 w-full rounded-lg border border-border bg-card py-1 shadow-xl animate-fade-in max-h-72 overflow-y-auto">
          {groups.map((group) => (
            <div key={group.label}>
              <div className="px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-text-muted">
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
                    "w-full px-3 py-2 text-left text-sm transition-colors hover:bg-surface-2",
                    value === pos ? "text-pitch-400" : "text-text-primary"
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
