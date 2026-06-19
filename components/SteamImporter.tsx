'use client';

/* eslint-disable @next/next/no-img-element -- Steam CDN URLs */

import { useState, useEffect } from 'react';
import {
  Package,
  X,
  RotateCw,
  Search,
  ExternalLink,
} from 'lucide-react';
import { toast } from 'sonner';

interface SteamItem {
  id: string;
  classId: string;
  instanceId: string;
  name: string;
  marketHashName: string;
  iconUrl: string;
  quantity: number;
  alreadyTracked: boolean;
}

interface Props {
  onClose: () => void;
  onImported: () => void;
}

const CONCURRENCY = 5;

async function withConcurrency<T>(
  items: T[],
  fn: (item: T) => Promise<void>,
  concurrency: number,
): Promise<void> {
  const results: Promise<void>[] = [];
  for (let i = 0; i < items.length; i += concurrency) {
    const batch = items.slice(i, i + concurrency);
    results.push(...batch.map(fn));
    await Promise.allSettled(batch.map(fn));
  }
  await Promise.allSettled(results);
}

export default function SteamImporter({ onClose, onImported }: Props) {
  const [steamId, setSteamId] = useState('');
  const [loading, setLoading] = useState(false);
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [items, setItems] = useState<SteamItem[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [importProgress, setImportProgress] = useState(0);
  const [totalToImport, setTotalToImport] = useState(0);
  const [buyPrice, setBuyPrice] = useState('');

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handler);
    };
  }, [onClose]);

  async function handleFetch() {
    const trimmed = steamId.trim();
    if (!trimmed) {
      setError('Please enter your SteamID64.');
      return;
    }

    setError(null);
    setItems([]);
    setSelectedIds(new Set());
    setLoading(true);

    try {
      const res = await fetch(
        `/api/steam/inventory?steamId=${encodeURIComponent(trimmed)}`,
      );
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to fetch inventory');
      }

      setItems(data.items);
      const autoSelect = new Set<string>(
        data.items
          .filter((i: SteamItem) => !i.alreadyTracked)
          .map((i: SteamItem) => i.id),
      );
      setSelectedIds(autoSelect);

      if (data.items.length === 0) {
        toast.info('No CS2 items found in this inventory.');
      } else {
        toast.success(`Found ${data.items.length} CS2 item${data.items.length !== 1 ? 's' : ''}`);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  function toggleSelect(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  const itemCount = items.length;
  const selectedCount = selectedIds.size;
  const selectedItems = items.filter((i) => selectedIds.has(i.id) && !i.alreadyTracked);

  async function handleImport() {
    const toImport = selectedItems;
    if (toImport.length === 0) return;

    const defaultBuyPrice = parseFloat(buyPrice) || 0;

    setImporting(true);
    setImportProgress(0);
    setTotalToImport(toImport.length);

    let completed = 0;
    await withConcurrency(
      toImport,
      async (item) => {
        try {
          await fetch('/api/trades', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              skin_name: item.marketHashName,
              buy_price: defaultBuyPrice,
              sell_price: 0,
              sold_price: 0,
              status: 'trade_locked',
              notes: '',
              image_url: item.iconUrl,
              platform: 'csfloat',
            }),
          });
        } catch {
          /* skip individual failures */
        }
        completed++;
        setImportProgress(completed);
      },
      CONCURRENCY,
    );

    setImporting(false);
    toast.success(`Imported ${completed} item${completed !== 1 ? 's' : ''}`);
    onImported();
  }

  const inputBase =
    'w-full rounded-lg border border-slate-700 bg-slate-800/50 px-3 py-2.5 text-sm text-white placeholder-slate-600 transition-all duration-150 focus:border-indigo-500/50 focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="flex max-h-[85vh] w-full max-w-3xl flex-col rounded-xl border border-slate-700 bg-slate-900 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-700/50 px-6 py-4">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-cyan-500/10">
              <Package className="h-3.5 w-3.5 text-cyan-400" />
            </div>
            <h2 className="text-sm font-semibold text-white">
              Import from Steam
            </h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-md p-1 text-slate-500 transition-colors hover:bg-slate-800 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Input Section */}
        <div className="space-y-3 px-6 py-4">
          <div>
            <label className="block text-xs font-medium uppercase tracking-widest text-slate-400">
              Steam ID
            </label>
            <div className="mt-1.5 flex gap-2">
              <input
                type="text"
                value={steamId}
                onChange={(e) => setSteamId(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleFetch();
                }}
                placeholder="76561197960265729"
                className={inputBase}
                disabled={loading || importing}
              />
              <button
                onClick={handleFetch}
                disabled={loading || importing || !steamId.trim()}
                className="flex-shrink-0 rounded-lg bg-cyan-600 px-4 py-2.5 text-sm font-medium text-white transition-all hover:bg-cyan-500 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <RotateCw className="h-4 w-4 animate-spin" />
                    Fetching...
                  </span>
                ) : (
                  'Fetch'
                )}
              </button>
            </div>
            <p className="mt-1 text-[10px] text-slate-600">
              Find your 17-digit SteamID64 at{' '}
              <a
                href="https://steamid.io"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-0.5 text-cyan-500 underline-offset-2 hover:underline"
              >
                steamid.io
                <ExternalLink className="h-2.5 w-2.5" />
              </a>
            </p>
          </div>

          {items.length > 0 && (
            <div>
              <label className="block text-xs font-medium uppercase tracking-widest text-slate-400">
                Default Buy Price ($) <span className="font-normal lowercase text-slate-500">(applied to all imported items)</span>
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={buyPrice}
                onChange={(e) => setBuyPrice(e.target.value)}
                placeholder="0.00 — leave blank to set later"
                className={`${inputBase} mt-1.5`}
                disabled={importing}
              />
            </div>
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="mx-6 mb-2 rounded-lg border border-rose-500/20 bg-rose-500/10 px-4 py-2.5 text-xs text-rose-400">
            {error}
          </div>
        )}

        {/* Items Table */}
        {items.length > 0 && (
          <>
            <div className="flex-1 overflow-y-auto px-6">
              <div className="mb-3 flex items-center justify-between">
                <p className="text-xs text-slate-400">
                  {itemCount} item{itemCount !== 1 && 's'} found
                  {selectedCount > 0 && (
                    <span className="ml-1.5 rounded-md bg-indigo-500/10 px-1.5 py-0.5 text-indigo-400">
                      {selectedCount} selected
                    </span>
                  )}
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() =>
                      setSelectedIds(new Set(items.map((i) => i.id)))
                    }
                    disabled={importing}
                    className="rounded-md px-2 py-1 text-[11px] text-slate-500 transition-colors hover:bg-slate-800 hover:text-slate-300 disabled:opacity-50"
                  >
                    Select All
                  </button>
                  <button
                    onClick={() => setSelectedIds(new Set())}
                    disabled={importing}
                    className="rounded-md px-2 py-1 text-[11px] text-slate-500 transition-colors hover:bg-slate-800 hover:text-slate-300 disabled:opacity-50"
                  >
                    Deselect All
                  </button>
                </div>
              </div>

              <div className="overflow-hidden rounded-lg border border-slate-700/50">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-slate-700/50 bg-slate-800/60 text-[10px] font-semibold uppercase tracking-widest text-slate-500">
                      <th className="w-10 px-3 py-2.5" />
                      <th className="px-3 py-2.5">Skin</th>
                      <th className="w-20 px-3 py-2.5 text-center">Qty</th>
                      <th className="w-28 px-3 py-2.5 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {items.map((item) => {
                      const checked = selectedIds.has(item.id);
                      return (
                        <tr
                          key={item.id}
                          className={`transition-colors ${
                            item.alreadyTracked
                              ? 'opacity-50'
                              : 'hover:bg-slate-800/30'
                          } ${checked ? 'bg-indigo-500/5' : 'bg-slate-900/20'}`}
                        >
                          <td className="px-3 py-2">
                            <input
                              type="checkbox"
                              checked={checked}
                              disabled={importing || item.alreadyTracked}
                              onChange={() => toggleSelect(item.id)}
                              className="h-4 w-4 cursor-pointer rounded border-slate-600 bg-slate-800 text-indigo-500 focus:ring-indigo-500/30 disabled:cursor-not-allowed disabled:opacity-40"
                            />
                          </td>
                          <td className="px-3 py-2">
                            <div className="flex items-center gap-3">
                              <div className="h-8 w-8 flex-shrink-0 overflow-hidden rounded bg-slate-800 ring-1 ring-slate-700/50">
                                {item.iconUrl ? (
                                  <img
                                    src={item.iconUrl}
                                    alt=""
                                    className="h-full w-full object-contain"
                                  />
                                ) : (
                                  <div className="flex h-full w-full items-center justify-center text-slate-600">
                                    <Package className="h-4 w-4" />
                                  </div>
                                )}
                              </div>
                              <div className="min-w-0">
                                <p className="truncate text-sm font-medium text-white">
                                  {item.marketHashName}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-3 py-2 text-center font-mono text-sm tabular-nums text-slate-400">
                            {item.quantity}
                          </td>
                          <td className="px-3 py-2 text-right">
                            {item.alreadyTracked ? (
                              <span className="inline-block rounded-md bg-slate-500/10 px-2 py-0.5 text-[11px] font-medium text-slate-500">
                                Already tracked
                              </span>
                            ) : (
                              <span className="inline-block rounded-md bg-emerald-500/10 px-2 py-0.5 text-[11px] font-medium text-emerald-400">
                                New
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between border-t border-slate-700/50 px-6 py-4">
              <div className="flex-1">
                {importing && (
                  <div className="flex items-center gap-3">
                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-800">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-indigo-500 transition-all duration-300"
                        style={{
                          width: `${totalToImport > 0 ? (importProgress / totalToImport) * 100 : 0}%`,
                        }}
                      />
                    </div>
                    <span className="flex-shrink-0 text-xs tabular-nums text-slate-400">
                      {importProgress} / {totalToImport}
                    </span>
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={onClose}
                  disabled={importing}
                  className="rounded-lg border border-slate-700 px-4 py-2 text-xs font-medium text-slate-400 transition-colors hover:bg-slate-800 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleImport}
                  disabled={selectedItems.length === 0 || importing}
                  className="rounded-lg bg-gradient-to-r from-cyan-600 to-indigo-600 px-4 py-2 text-xs font-medium text-white shadow-sm transition-all hover:from-cyan-500 hover:to-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {importing ? (
                    <span className="flex items-center gap-2">
                      <RotateCw className="h-4 w-4 animate-spin" />
                      Importing...
                    </span>
                  ) : (
                    `Import${selectedItems.length > 0 ? ` (${selectedItems.length})` : ''}`
                  )}
                </button>
              </div>
            </div>
          </>
        )}

        {/* Empty state */}
        {!loading && !error && items.length === 0 && (
          <div className="flex flex-col items-center gap-2 px-6 py-12 text-center">
            <Search className="h-10 w-10 text-slate-700" />
            <p className="text-sm text-slate-500">
              Enter your SteamID64 and click Fetch to see your CS2 inventory.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
