"use client";

import { cn } from "@/lib/utils";
import { ChevronUp, ChevronDown, ChevronsUpDown, Search } from "lucide-react";
import { useState, useMemo, type ReactNode } from "react";
import { motion } from "framer-motion";

export interface Column<T> {
  key: string;
  header: string;
  cell: (item: T) => ReactNode;
  sortable?: boolean;
  sortFn?: (a: T, b: T) => number;
  className?: string;
  headerClassName?: string;
  hideOnMobile?: boolean;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  keyField: keyof T;
  searchable?: boolean;
  searchPlaceholder?: string;
  onRowClick?: (item: T) => void;
  emptyState?: ReactNode;
  className?: string;
}

export function DataTable<T extends Record<string, unknown>>({
  columns,
  data,
  keyField,
  searchable = false,
  searchPlaceholder = "Search...",
  onRowClick,
  emptyState,
  className,
}: DataTableProps<T>) {
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    if (!search.trim()) return data;
    const q = search.toLowerCase();
    return data.filter((item) =>
      columns.some((col) => {
        const val = item[col.key];
        return val != null && String(val).toLowerCase().includes(q);
      })
    );
  }, [data, search, columns]);

  const sorted = useMemo(() => {
    if (!sortKey) return filtered;
    const col = columns.find((c) => c.key === sortKey);
    if (!col) return filtered;
    return [...filtered].sort((a, b) => {
      const dir = sortDir === "asc" ? 1 : -1;
      if (col.sortFn) return col.sortFn(a, b) * dir;
      const va = a[sortKey];
      const vb = b[sortKey];
      if (va == null) return 1;
      if (vb == null) return -1;
      return String(va).localeCompare(String(vb)) * dir;
    });
  }, [filtered, sortKey, sortDir, columns]);

  function handleSort(key: string) {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  }

  return (
    <div className={cn("w-full", className)}>
      {searchable && (
        <div className="relative mb-4">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={searchPlaceholder}
            className="w-full rounded-xl border border-border bg-surface-2/50 pl-9 pr-3.5 py-2 text-sm text-text-primary placeholder:text-text-muted focus:border-pitch-500/50 focus:outline-none focus:ring-2 focus:ring-pitch-500/15 transition-all duration-200"
          />
        </div>
      )}

      <div className="rounded-2xl border border-border glass overflow-hidden">
        <div className="hidden md:block">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                {columns.map((col) => (
                  <th
                    key={col.key}
                    className={cn(
                      "px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-text-muted",
                      col.sortable && "cursor-pointer hover:text-text-secondary select-none",
                      col.headerClassName
                    )}
                    onClick={() => col.sortable && handleSort(col.key)}
                  >
                    <span className="flex items-center gap-1.5">
                      {col.header}
                      {col.sortable && (
                        <span className="text-text-muted">
                          {sortKey === col.key ? (
                            sortDir === "asc" ? <ChevronUp size={14} /> : <ChevronDown size={14} />
                          ) : (
                            <ChevronsUpDown size={14} />
                          )}
                        </span>
                      )}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sorted.map((item, i) => (
                <motion.tr
                  key={String(item[keyField])}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03, duration: 0.2 }}
                  className={cn(
                    "border-b border-border/50 last:border-b-0 transition-colors duration-150",
                    onRowClick && "cursor-pointer hover:bg-surface-2/30"
                  )}
                  onClick={() => onRowClick?.(item)}
                >
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className={cn(
                        "px-4 py-3 text-sm text-text-primary",
                        col.hideOnMobile && "hidden md:table-cell",
                        col.className
                      )}
                    >
                      {col.cell(item)}
                    </td>
                  ))}
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="md:hidden divide-y divide-border">
          {sorted.map((item, i) => (
            <motion.div
              key={String(item[keyField])}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03, duration: 0.2 }}
              className={cn(
                "p-4 space-y-2",
                onRowClick && "cursor-pointer hover:bg-surface-2/30"
              )}
              onClick={() => onRowClick?.(item)}
            >
              {columns
                .filter((c) => !c.hideOnMobile)
                .map((col) => (
                  <div key={col.key} className="flex items-center justify-between">
                    <span className="text-xs text-text-muted font-medium">{col.header}</span>
                    <span className="text-sm text-text-primary">{col.cell(item)}</span>
                  </div>
                ))}
            </motion.div>
          ))}
        </div>
      </div>

      {sorted.length === 0 && (
        <div className="py-12 text-center">
          {emptyState || (
            <div>
              <p className="text-text-muted text-sm">No results found</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}