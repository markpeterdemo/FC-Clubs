'use client';

'use client';

import { useState } from 'react';
import type { SkinInventory, SkinFormData, SkinStatus } from '@/lib/types';
import { useInventory, useSaveItem, useDeleteItem, useUpdateStatus } from '@/lib/hooks';
import MetricsBar from '@/components/MetricsBar';
import SkinLogger from '@/components/SkinLogger';
import InventoryTable from '@/components/InventoryTable';
import SteamImporter from '@/components/SteamImporter';
import QuickCalculator from '@/components/QuickCalculator';
import LoadingSkeleton from '@/components/LoadingSkeleton';

interface Props {
  initialItems: SkinInventory[];
  serverError?: string;
}

export default function DashboardClient({ initialItems, serverError }: Props) {
  const [editingItem, setEditingItem] = useState<SkinInventory | null>(null);
  const [showSteamImport, setShowSteamImport] = useState(false);

  const { data: items, isLoading, error: queryError } = useInventory();

  const displayItems = items ?? initialItems;
  const errorMessage = serverError ?? (queryError ? 'Failed to load inventory' : null);

  const saveMutation = useSaveItem();
  const deleteMutation = useDeleteItem();
  const statusMutation = useUpdateStatus();

  async function handleSave(form: SkinFormData, editingId?: string) {
    await saveMutation.mutateAsync({ form, editingId });
    setEditingItem(null);
  }

  async function handleStatusChange(
    id: string,
    status: SkinStatus,
    overrides?: { sell_price?: number; sold_price?: number },
  ) {
    const item = displayItems.find((i) => i.id === id);
    if (!item) return;
    await statusMutation.mutateAsync({ item, status, ...overrides });
  }

  async function handleDelete(id: string) {
    await deleteMutation.mutateAsync(id);
  }

  return (
    <div className="min-h-screen overflow-x-hidden bg-slate-950">
      <div className="h-[3px] bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500" />

      <header className="border-b border-slate-800/60 bg-slate-950/80 px-6 py-4 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white">
              CS2 Skin Portfolio
            </h1>
            <p className="text-xs text-slate-500">
              {isLoading ? 'Loading...' : `${displayItems.length} item${displayItems.length !== 1 && 's'} tracked`}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowSteamImport(true)}
              className="rounded-lg bg-slate-800 px-3 py-1.5 text-xs font-medium text-cyan-400 transition-colors hover:bg-slate-700"
            >
              Import from Steam
            </button>
            <div className="flex items-center gap-2 rounded-full bg-slate-900 px-3 py-1.5 text-xs text-slate-400">
              <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" />
              Local DB
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl space-y-5 px-6 py-6">
        {errorMessage && (
          <div className="rounded-lg border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-400">
            {errorMessage}
          </div>
        )}

        {isLoading ? (
          <LoadingSkeleton />
        ) : (
          <>
            <MetricsBar items={displayItems} />

            <div className="grid grid-cols-[380px_minmax(0,1fr)] gap-5">
              <div className="flex flex-col gap-3">
                <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-5 shadow-lg shadow-black/10 backdrop-blur-sm">
                  <SkinLogger
                    key={editingItem?.id ?? 'new'}
                    onSave={handleSave}
                    editItem={editingItem}
                    onCancelEdit={() => setEditingItem(null)}
                    saving={saveMutation.isPending}
                  />
                </div>
                <QuickCalculator />
              </div>

              <div className="min-w-0 rounded-xl border border-slate-800 bg-slate-900/60 p-5 shadow-lg shadow-black/10 backdrop-blur-sm">
                <h2 className="mb-4 text-sm font-semibold text-white">
                  Inventory{' '}
                  <span className="ml-1.5 rounded-md bg-slate-800 px-1.5 py-0.5 text-xs tabular-nums text-slate-400">
                    {displayItems.length}
                  </span>
                </h2>
                <InventoryTable
                  items={displayItems}
                  onStatusChange={handleStatusChange}
                  onDelete={handleDelete}
                  onEdit={setEditingItem}
                />
              </div>
            </div>
          </>
        )}
      </main>

      {showSteamImport && (
        <SteamImporter
          onClose={() => setShowSteamImport(false)}
          onImported={() => {
            setShowSteamImport(false);
          }}
        />
      )}
    </div>
  );
}
