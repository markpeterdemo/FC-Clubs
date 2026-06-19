'use client';

/* eslint-disable @next/next/no-img-element -- user-supplied URLs */

import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import {
  Search,
  Check,
  Copy,
  ChevronUp,
  ChevronDown,
  ArrowUpDown,
  Clock,
  Pencil,
  Trash2,
  X,
  CheckCheck,
} from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import type { SkinInventory, SkinStatus, Platform } from '@/lib/types';
import {
  computeTrade,
  effectiveSellPrice,
} from '@/lib/calculations';

interface PriceOverrides {
  sell_price?: number;
  sold_price?: number;
}

interface Props {
  items: SkinInventory[];
  onStatusChange: (
    id: string,
    status: SkinStatus,
    overrides?: PriceOverrides,
  ) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onEdit: (item: SkinInventory) => void;
}

type SortKey =
  | 'skin_name'
  | 'buy_price'
  | 'sell_price'
  | 'profit'
  | 'roi'
  | 'status'
  | 'created_at'
  | 'platform';
type SortDir = 'asc' | 'desc';

const STATUS_FILTERS: Array<{ label: string; value: string }> = [
  { label: 'All', value: 'all' },
  { label: 'Listed', value: 'listed' },
  { label: 'Unlisted', value: 'unlisted' },
  { label: 'Locked', value: 'trade_locked' },
  { label: 'Sold', value: 'sold' },
];

const statusConfig: Record<
  SkinStatus,
  { bg: string; label: string; dot: string }
> = {
  trade_locked: {
    bg: 'bg-amber-500/10 text-amber-400',
    label: 'Locked',
    dot: 'bg-amber-400',
  },
  unlisted: {
    bg: 'bg-slate-500/10 text-slate-400',
    label: 'Unlisted',
    dot: 'bg-slate-400',
  },
  listed: {
    bg: 'bg-sky-500/10 text-sky-400',
    label: 'Listed',
    dot: 'bg-sky-400',
  },
  sold: {
    bg: 'bg-emerald-500/10 text-emerald-400',
    label: 'Sold',
    dot: 'bg-emerald-400',
  },
};

const platformBadge: Record<Platform, { bg: string; label: string }> = {
  csfloat: {
    bg: 'bg-indigo-500/10 text-indigo-400 ring-indigo-500/20',
    label: 'CSFloat',
  },
  csmoney: {
    bg: 'bg-cyan-500/10 text-cyan-400 ring-cyan-500/20',
    label: 'CS.Money',
  },
};

function getTradeLockEnd(createdAt: string): Date {
  const d = new Date(createdAt);
  d.setDate(d.getDate() + 7);
  return d;
}

function TradeLockCountdown({ createdAt }: { createdAt: string }) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 60_000);
    return () => clearInterval(id);
  }, []);

  const unlockDate = getTradeLockEnd(createdAt);
  const remaining = unlockDate.getTime() - now;
  const days = Math.max(0, Math.floor(remaining / 86_400_000));
  const hours = Math.max(0, Math.floor((remaining % 86_400_000) / 3_600_000));

  if (remaining <= 0) return null;

  return (
    <span className="inline-flex items-center gap-1 text-[11px] text-amber-500/70">
      <Clock className="h-3 w-3" />
      {days > 0 ? `${days}d ` : ''}
      {hours}h
    </span>
  );
}

function SortIcon({
  column,
  currentKey,
  direction,
}: {
  column: SortKey;
  currentKey: SortKey | null;
  direction: SortDir;
}) {
  if (column !== currentKey)
    return <ArrowUpDown className="ml-1 h-3 w-3 text-slate-600" />;
  return direction === 'asc' ? (
    <ChevronUp className="ml-1 h-3 w-3 text-indigo-400" />
  ) : (
    <ChevronDown className="ml-1 h-3 w-3 text-indigo-400" />
  );
}

function SortableHeader({
  label,
  sort,
  currentKey,
  direction,
  onSort,
}: {
  label: string;
  sort: SortKey;
  currentKey: SortKey | null;
  direction: SortDir;
  onSort: (key: SortKey) => void;
}) {
  return (
    <th
      className="cursor-pointer select-none whitespace-nowrap px-3 py-3 text-[10px] font-semibold uppercase tracking-widest text-slate-500 transition-colors hover:text-slate-300"
      onClick={() => onSort(sort)}
    >
      <span className="inline-flex items-center gap-0.5">
        {label}
        <SortIcon
          column={sort}
          currentKey={currentKey}
          direction={direction}
        />
      </span>
    </th>
  );
}

function ProfitBar({ value, maxAbs }: { value: number; maxAbs: number }) {
  const pct = maxAbs > 0 ? Math.min(Math.abs(value) / maxAbs, 1) : 0;
  const isPositive = value >= 0;

  if (value === 0) return null;

  return (
    <div className="absolute bottom-0 left-0 right-0 h-[2.5px] overflow-hidden rounded-b-lg bg-slate-800">
      <div
        className={`h-full transition-all duration-500 ${
          isPositive ? 'bg-emerald-500/60' : 'bg-rose-500/60'
        }`}
        style={{ width: `${pct * 100}%` }}
      />
    </div>
  );
}

export default function InventoryTable({
  items,
  onStatusChange,
  onDelete,
  onEdit,
}: Props) {
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState<SortKey | null>('created_at');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [promptItem, setPromptItem] = useState<SkinInventory | null>(null);
  const [promptStatus, setPromptStatus] = useState<SkinStatus | null>(null);
  const [promptSell, setPromptSell] = useState('');
  const [promptSold, setPromptSold] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const copyTimer = useRef<ReturnType<typeof setTimeout>>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const [statusOpen, setStatusOpen] = useState<string | null>(null);
  const statusRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        statusRef.current &&
        !statusRef.current.contains(e.target as Node)
      ) {
        setStatusOpen(null);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCopyName = useCallback(async (id: string, name: string) => {
    try {
      await navigator.clipboard.writeText(name);
      setCopiedId(id);
      if (copyTimer.current) clearTimeout(copyTimer.current);
      copyTimer.current = setTimeout(() => setCopiedId(null), 1200);
    } catch {
      /* noop */
    }
  }, []);

  useEffect(() => {
    return () => {
      if (copyTimer.current) clearTimeout(copyTimer.current);
    };
  }, []);

  function handleSort(key: SortKey) {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortKey(key);
      setSortDir(key === 'created_at' ? 'desc' : 'asc');
    }
  }

  const processed = useMemo(() => {
    let result = [...items];

    if (filter !== 'all') {
      result = result.filter((i) => i.status === filter);
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter((i) => i.skin_name.toLowerCase().includes(q));
    }

    if (sortKey) {
      result.sort((a, b) => {
        let cmp = 0;
        switch (sortKey) {
          case 'skin_name':
            cmp = a.skin_name.localeCompare(b.skin_name);
            break;
          case 'buy_price':
            cmp = a.buy_price - b.buy_price;
            break;
          case 'sell_price':
            cmp =
              (a.status === 'sold' ? a.sold_price : a.sell_price) -
              (b.status === 'sold' ? b.sold_price : b.sell_price);
            break;
          case 'profit': {
            const pa = computeTrade(a.buy_price, effectiveSellPrice(a), a.platform, a.withdrawal_method).net_profit;
            const pb = computeTrade(b.buy_price, effectiveSellPrice(b), b.platform, b.withdrawal_method).net_profit;
            cmp = pa - pb;
            break;
          }
          case 'roi': {
            const ra = computeTrade(a.buy_price, effectiveSellPrice(a), a.platform, a.withdrawal_method).roi_percent;
            const rb = computeTrade(b.buy_price, effectiveSellPrice(b), b.platform, b.withdrawal_method).roi_percent;
            cmp = ra - rb;
            break;
          }
          case 'status':
            cmp = a.status.localeCompare(b.status);
            break;
          case 'platform':
            cmp = a.platform.localeCompare(b.platform);
            break;
          case 'created_at':
            cmp =
              new Date(a.created_at).getTime() -
              new Date(b.created_at).getTime();
            break;
        }
        return sortDir === 'asc' ? cmp : -cmp;
      });
    }

    return result;
  }, [items, filter, search, sortKey, sortDir]);

  const summary = useMemo(() => {
    const totals = { invested: 0, payout: 0, profit: 0 };
    processed.forEach((item) => {
      const eff = effectiveSellPrice(item);
      const calc = computeTrade(item.buy_price, eff, item.platform, item.withdrawal_method);
      totals.invested += item.buy_price;
      totals.payout += calc.true_net_payout;
      totals.profit += calc.net_profit;
    });
    return totals;
  }, [processed]);

  const maxProfitAbs = useMemo(() => {
    let max = 0;
    processed.forEach((item) => {
      const eff = effectiveSellPrice(item);
      const calc = computeTrade(item.buy_price, eff, item.platform, item.withdrawal_method);
      const abs = Math.abs(calc.net_profit);
      if (abs > max) max = abs;
    });
    return max;
  }, [processed]);

  function handleStatusSelect(item: SkinInventory, newStatus: SkinStatus) {
    setStatusOpen(null);
    const needsPrice =
      newStatus !== 'trade_locked' && item.sell_price === 0;
    const needsSoldPrice = newStatus === 'sold' && item.sold_price === 0;

    if (needsPrice || needsSoldPrice) {
      setPromptItem(item);
      setPromptStatus(newStatus);
      setPromptSell(item.sell_price > 0 ? String(item.sell_price) : '');
      setPromptSold(item.sold_price > 0 ? String(item.sold_price) : '');
      return;
    }
    onStatusChange(item.id, newStatus);
  }

  async function handlePromptConfirm() {
    if (!promptItem || !promptStatus) return;
    const overrides: PriceOverrides = {};
    if (promptSell) overrides.sell_price = parseFloat(promptSell);
    if (promptSold) overrides.sold_price = parseFloat(promptSold);
    await onStatusChange(promptItem.id, promptStatus, overrides);
    setPromptItem(null);
    setPromptStatus(null);
  }

  async function handleDeleteClick(id: string) {
    setDeletingId(id);
  }

  async function confirmDelete(id: string) {
    setDeletingId(null);
    await onDelete(id);
  }

  const needsSold = promptStatus === 'sold';

  const statusOptions: Array<{ value: SkinStatus; label: string }> = [
    { value: 'trade_locked', label: 'Locked' },
    { value: 'unlisted', label: 'Unlisted' },
    { value: 'listed', label: 'Listed' },
    { value: 'sold', label: 'Sold' },
  ];

  return (
    <div>
      {/* Search + Filter */}
      <div className="mb-4 flex items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-600" />
          <input
            ref={searchRef}
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search skins..."
            className="w-full rounded-lg border border-slate-700/50 bg-slate-800/30 py-1.5 pl-8 pr-3 text-sm text-white placeholder-slate-600 transition-all focus:border-indigo-500/50 focus:bg-slate-800/60 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>
        <div className="flex flex-wrap gap-1">
          {STATUS_FILTERS.map((f) => {
            const count =
              f.value === 'all'
                ? items.length
                : items.filter((i) => i.status === f.value).length;
            return (
              <button
                key={f.value}
                onClick={() => setFilter(f.value)}
                className={`relative rounded-lg px-2.5 py-1 text-xs font-medium transition-all duration-150 ${
                  filter === f.value
                    ? 'bg-indigo-500/15 text-indigo-300 ring-1 ring-indigo-500/30'
                    : 'text-slate-500 hover:bg-slate-800/60 hover:text-slate-300'
                }`}
              >
                {f.label}
                <span
                  className={`ml-1.5 rounded px-1 py-[1px] text-[10px] tabular-nums ${
                    filter === f.value
                      ? 'bg-indigo-500/20 text-indigo-400'
                      : 'bg-slate-800 text-slate-600'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-700/50 bg-slate-900/40">
        <table className="w-full table-fixed text-left text-sm">
          <colgroup>
            <col className="w-auto" />
            <col className="w-[75px]" />
            <col className="w-[80px]" />
            <col className="w-[80px]" />
            <col className="w-[80px]" />
            <col className="w-[65px]" />
            <col className="w-[70px]" />
            <col className="w-[90px]" />
            <col className="w-[70px]" />
          </colgroup>
          <thead>
            <tr className="border-b border-slate-700/50 bg-slate-800/40">
              <SortableHeader
                label="Skin"
                sort="skin_name"
                currentKey={sortKey}
                direction={sortDir}
                onSort={handleSort}
              />
              <SortableHeader
                label="Buy"
                sort="buy_price"
                currentKey={sortKey}
                direction={sortDir}
                onSort={handleSort}
              />
              <SortableHeader
                label="Sell"
                sort="sell_price"
                currentKey={sortKey}
                direction={sortDir}
                onSort={handleSort}
              />
              <SortableHeader
                label="Payout"
                sort="profit"
                currentKey={sortKey}
                direction={sortDir}
                onSort={handleSort}
              />
              <SortableHeader
                label="Profit"
                sort="profit"
                currentKey={sortKey}
                direction={sortDir}
                onSort={handleSort}
              />
              <SortableHeader
                label="ROI"
                sort="roi"
                currentKey={sortKey}
                direction={sortDir}
                onSort={handleSort}
              />
              <SortableHeader
                label="Market"
                sort="platform"
                currentKey={sortKey}
                direction={sortDir}
                onSort={handleSort}
              />
              <SortableHeader
                label="Status"
                sort="status"
                currentKey={sortKey}
                direction={sortDir}
                onSort={handleSort}
              />
              <th className="w-[70px] px-3 py-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/40">
            {processed.length === 0 && (
              <tr>
                <td
                  colSpan={9}
                  className="px-4 py-16 text-center text-sm text-slate-600"
                >
                  <div className="flex flex-col items-center gap-2">
                    {search ? (
                      <>
                        <Search className="h-8 w-8 text-slate-700" />
                        <p>No items match &quot;{search}&quot;.</p>
                      </>
                    ) : (
                      <>
                        <svg
                          className="h-8 w-8"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1}
                            d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                          />
                        </svg>
                        <p>No items match this filter.</p>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            )}
            {processed.map((item) => {
              const effectivePrice = effectiveSellPrice(item);
              const calc = computeTrade(
                item.buy_price,
                effectivePrice,
                item.platform,
                item.withdrawal_method,
              );
              const profitColor =
                calc.net_profit > 0
                  ? 'text-emerald-400'
                  : calc.net_profit < 0
                    ? 'text-rose-400'
                    : 'text-slate-400';
              const isActualSell = item.status === 'sold';
              const sc = statusConfig[item.status];
              const pBadge =
                platformBadge[item.platform] ?? platformBadge.csfloat;
              const isLocked = item.status === 'trade_locked';
              const isDeleting = deletingId === item.id;

              return (
                <tr
                  key={item.id}
                  className={`group relative transition-all duration-150 ${
                    isDeleting
                      ? 'bg-rose-500/5'
                      : 'bg-slate-900/20 hover:bg-slate-800/30'
                  }`}
                >
                  <td className="w-full max-w-0 px-3 py-2">
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() =>
                          handleCopyName(item.id, item.skin_name)
                        }
                        className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg bg-slate-800 ring-1 ring-slate-700/50 transition-all hover:ring-indigo-500/40"
                      >
                        {item.image_url ? (
                          <img
                            src={item.image_url}
                            alt={item.skin_name}
                            className="h-full w-full object-contain"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src =
                                'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><rect width="48" height="48" fill="%23334155" rx="6"/><text x="50%" y="50%" dominant-baseline="central" text-anchor="middle" fill="%2364788b" font-size="20">?</text></svg>';
                            }}
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-slate-600">
                            <svg
                              className="h-5 w-5"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={1.5}
                                d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z"
                              />
                            </svg>
                          </div>
                        )}
                      </button>
                      <div className="min-w-0 flex-1">
                        <button
                          onClick={() =>
                            handleCopyName(item.id, item.skin_name)
                          }
                          className="group/name flex w-full items-center gap-1.5 text-sm font-medium text-white transition-colors hover:text-indigo-300"
                        >
                          <span className="truncate">{item.skin_name}</span>
                          {copiedId === item.id ? (
                            <Check className="h-3 w-3 flex-shrink-0 text-emerald-400" />
                          ) : (
                            <Copy className="hidden h-3 w-3 flex-shrink-0 text-slate-600 group-hover/name:block group-hover/name:text-indigo-400" />
                          )}
                        </button>
                        <div className="mt-0.5 flex items-center gap-2">
                          {isLocked && (
                            <TradeLockCountdown createdAt={item.created_at} />
                          )}
                          {item.float_value != null && (
                            <span
                              className="rounded bg-slate-800 px-1 py-[1px] text-[10px] tabular-nums text-slate-500"
                              title="Float value"
                            >
                              {item.float_value.toFixed(4)}
                            </span>
                          )}
                          <span
                            className="text-[10px] text-slate-600"
                            title={format(
                              new Date(item.created_at),
                              'MMM d, yyyy h:mm a',
                            )}
                          >
                            {formatDistanceToNow(
                              new Date(item.created_at),
                              { addSuffix: true },
                            )}
                          </span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-2 font-mono text-sm tabular-nums text-slate-300">
                    ${item.buy_price.toFixed(2)}
                  </td>
                  <td className="px-3 py-2 font-mono text-sm tabular-nums">
                    {isActualSell ? (
                      <div className="flex items-center gap-1">
                        <span className="text-xs text-slate-600 line-through">
                          ${item.sell_price.toFixed(2)}
                        </span>
                        <span className="text-white">
                          ${item.sold_price.toFixed(2)}
                        </span>
                      </div>
                    ) : (
                      <span className="text-slate-300">
                        ${item.sell_price.toFixed(2)}
                      </span>
                    )}
                  </td>
                  <td className="px-3 py-2 font-mono text-sm tabular-nums text-slate-400">
                    ${calc.true_net_payout.toFixed(2)}
                  </td>
                  <td className="relative px-3 py-2 font-mono text-sm tabular-nums font-medium">
                    <span className={profitColor}>
                      ${calc.net_profit.toFixed(2)}
                    </span>
                    <ProfitBar value={calc.net_profit} maxAbs={maxProfitAbs} />
                  </td>
                  <td
                    className={`px-3 py-2 font-mono text-sm tabular-nums font-medium ${profitColor}`}
                  >
                    {calc.roi_percent.toFixed(2)}%
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex flex-col items-start gap-1">
                      <span
                        className={`inline-flex rounded-md px-1.5 py-0.5 text-[10px] font-medium ring-1 ${pBadge.bg}`}
                      >
                        {pBadge.label}
                      </span>
                      {item.withdrawal_method && (
                        <span className="rounded-md bg-slate-700/40 px-1.5 py-[1px] text-[9px] font-medium text-slate-500">
                          Withdraw: {item.withdrawal_method === 'csfloat' ? '2.5%' : '2.7%'}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    <div className="relative" ref={statusRef}>
                      <button
                        onClick={() =>
                          setStatusOpen(
                            statusOpen === item.id ? null : item.id,
                          )
                        }
                        className={`inline-flex items-center gap-1.5 rounded-md border-0 px-2 py-1 text-xs font-medium transition-all ${sc.bg} hover:brightness-125`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${sc.dot}`}
                        />
                        {sc.label}
                      </button>
                      {statusOpen === item.id && (
                        <div className="absolute right-0 top-full z-30 mt-1 w-32 overflow-hidden rounded-lg border border-slate-700 bg-slate-900 shadow-xl shadow-black/30">
                          {statusOptions.map((opt) => {
                            const oc = statusConfig[opt.value];
                            return (
                              <button
                                key={opt.value}
                                onClick={() =>
                                  handleStatusSelect(item, opt.value)
                                }
                                className={`flex w-full items-center gap-2 px-3 py-2 text-left text-xs transition-colors hover:bg-slate-800 ${
                                  item.status === opt.value
                                    ? 'text-white'
                                    : 'text-slate-400'
                                }`}
                              >
                                <span
                                  className={`h-1.5 w-1.5 rounded-full ${oc.dot}`}
                                />
                                {opt.label}
                                {item.status === opt.value && (
                                  <CheckCheck className="ml-auto h-3 w-3 text-indigo-400" />
                                )}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-3 py-2">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => onEdit(item)}
                        className="rounded-md p-1.5 text-slate-600 transition-colors hover:bg-slate-800 hover:text-sky-400"
                        title="Edit"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      {isDeleting ? (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => confirmDelete(item.id)}
                            className="rounded-md bg-rose-500/20 p-1.5 text-rose-400 transition-colors hover:bg-rose-500/30"
                            title="Confirm delete"
                          >
                            <Check className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={() => setDeletingId(null)}
                            className="rounded-md p-1.5 text-slate-600 transition-colors hover:bg-slate-800 hover:text-slate-300"
                            title="Cancel"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleDeleteClick(item.id)}
                          className="rounded-md p-1.5 text-slate-600 transition-colors hover:bg-slate-800 hover:text-rose-400"
                          title="Delete"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* Summary row */}
        {processed.length > 0 && (
          <div className="flex items-center justify-between border-t border-slate-700/50 bg-slate-800/30 px-4 py-2.5">
            <span className="text-xs text-slate-500">
              {processed.length} item{processed.length !== 1 && 's'}
            </span>
            <div className="flex items-center gap-6">
              <div className="text-right">
                <span className="text-[10px] uppercase tracking-wider text-slate-600">
                  Invested
                </span>
                <p className="font-mono text-sm tabular-nums text-slate-300">
                  ${summary.invested.toFixed(2)}
                </p>
              </div>
              <div className="text-right">
                <span className="text-[10px] uppercase tracking-wider text-slate-600">
                  Payout
                </span>
                <p className="font-mono text-sm tabular-nums text-slate-300">
                  ${summary.payout.toFixed(2)}
                </p>
              </div>
              <div className="text-right">
                <span className="text-[10px] uppercase tracking-wider text-slate-600">
                  Total
                </span>
                <p
                  className={`font-mono text-sm tabular-nums font-medium ${
                    summary.profit >= 0 ? 'text-emerald-400' : 'text-rose-400'
                  }`}
                >
                  ${summary.profit.toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Price Prompt Modal */}
      {promptItem && promptStatus && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div
            className="w-full max-w-sm rounded-xl border border-slate-700 bg-slate-900 p-6 shadow-2xl"
            onKeyDown={(e) => {
              if (e.key === 'Escape') {
                setPromptItem(null);
                setPromptStatus(null);
              }
            }}
          >
            <h3 className="text-sm font-semibold text-white">
              Set price for{' '}
              <span className="text-indigo-400">{promptItem.skin_name}</span>
            </h3>
            <p className="mt-1 text-xs text-slate-500">
              {needsSold
                ? 'Enter the listing price and actual sale amount.'
                : 'Enter the listing price for the marketplace.'}
            </p>

            <div className="mt-4 space-y-3">
              <div>
                <label className="block text-[11px] font-medium uppercase tracking-widest text-slate-400">
                  Sell Price ($)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={promptSell}
                  onChange={(e) => setPromptSell(e.target.value)}
                  placeholder="0.00"
                  className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-800/50 px-3 py-2 text-sm text-white placeholder-slate-600 focus:border-indigo-500/50 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              {needsSold && (
                <div>
                  <label className="block text-[11px] font-medium uppercase tracking-widest text-slate-400">
                    Actual Sold Price ($)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={promptSold}
                    onChange={(e) => setPromptSold(e.target.value)}
                    placeholder="0.00"
                    className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-800/50 px-3 py-2 text-sm text-white placeholder-slate-600 focus:border-indigo-500/50 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>
              )}
            </div>

            <div className="mt-5 flex gap-2">
              <button
                onClick={() => {
                  setPromptItem(null);
                  setPromptStatus(null);
                }}
                className="flex-1 rounded-lg border border-slate-700 px-4 py-2 text-xs font-medium text-slate-400 transition-colors hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                onClick={handlePromptConfirm}
                disabled={!promptSell || parseFloat(promptSell) <= 0}
                className="flex-1 cursor-pointer rounded-lg bg-indigo-600 px-4 py-2 text-xs font-medium text-white transition-colors hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
