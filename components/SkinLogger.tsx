'use client';

/* eslint-disable @next/next/no-img-element, jsx-a11y/alt-text -- user-supplied URLs, icon component */

import { useState, useMemo } from 'react';
import { Plus, RotateCw, Image, X } from 'lucide-react';
import type { SkinFormData, SkinStatus, SkinInventory, Platform, WithdrawalMethod } from '@/lib/types';
import { computeFeesPreview, computeTrade, getPlatformLabel, getPlatformFee } from '@/lib/calculations';

interface Props {
  onSave: (data: SkinFormData, editingId?: string) => Promise<void>;
  editItem?: SkinInventory | null;
  onCancelEdit?: () => void;
  saving?: boolean;
}

const EMPTY_FORM: SkinFormData = {
  skin_name: '',
  buy_price: '',
  sell_price: '',
  sold_price: '',
  float_value: '',
  withdrawal_method: '',
  status: 'trade_locked',
  notes: '',
  image_url: '',
  platform: 'csfloat',
};

function itemToForm(item: SkinInventory): SkinFormData {
  return {
    skin_name: item.skin_name,
    buy_price: String(item.buy_price),
    sell_price: String(item.sell_price),
    sold_price: String(item.sold_price || ''),
    float_value: item.float_value != null ? String(item.float_value) : '',
    withdrawal_method: item.withdrawal_method || '',
    status: item.status,
    notes: item.notes,
    image_url: item.image_url || '',
    platform: item.platform,
  };
}

const inputBase =
  'mt-1.5 w-full rounded-lg border border-slate-700 bg-slate-800/50 px-3 py-2.5 text-sm text-white placeholder-slate-600 transition-all duration-150 focus:border-indigo-500/50 focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20';

export default function SkinLogger({ onSave, editItem, onCancelEdit, saving: externalSaving }: Props) {
  const [form, setForm] = useState<SkinFormData>(
    editItem ? itemToForm(editItem) : EMPTY_FORM,
  );
  const [localSaving, setLocalSaving] = useState(false);
  const saving = localSaving || (externalSaving ?? false);

  const buy = parseFloat(form.buy_price) || 0;
  const sell = parseFloat(form.sell_price) || 0;
  const platform = form.platform;
  const isSold = form.status === 'sold';
  const showSellFields =
    form.status === 'listed' || form.status === 'sold';
  const withdrawalMethod = (form.withdrawal_method || null) as WithdrawalMethod | null;

  const feeBreakdown = useMemo(
    () => computeFeesPreview(sell, platform, withdrawalMethod),
    [sell, platform, withdrawalMethod],
  );
  const fullCalc = useMemo(
    () => computeTrade(buy, sell, platform, withdrawalMethod),
    [buy, sell, platform, withdrawalMethod],
  );

  function update<K extends keyof SkinFormData>(
    key: K,
    value: SkinFormData[K],
  ) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLocalSaving(true);
    try {
      await onSave(form, editItem?.id);
      setForm(EMPTY_FORM);
    } finally {
      setLocalSaving(false);
    }
  }

  const isEditing = !!editItem;
  const platformLabel = getPlatformLabel(form.platform);
  const platformFee = getPlatformFee(platform);

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-indigo-500/10">
            <Plus className="h-3.5 w-3.5 text-indigo-400" />
          </div>
          <h2 className="text-sm font-semibold text-white">
            {isEditing ? 'Edit Skin' : 'Add Skin'}
          </h2>
        </div>
        {isEditing && (
          <button
            type="button"
            onClick={onCancelEdit}
            className="rounded-md px-2 py-1 text-xs text-slate-400 transition-colors hover:bg-slate-800 hover:text-white"
          >
            Cancel
          </button>
        )}
      </div>

      {/* Image Paste Zone */}
      <div>
        <label className="block text-xs font-medium uppercase tracking-widest text-slate-400">
          Weapon Image
        </label>
        <div
          className={`relative mt-1.5 flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-3 transition-colors ${
            form.image_url
              ? 'border-slate-600 bg-slate-800/30'
              : 'border-slate-700 bg-slate-800/10 hover:border-indigo-500/30'
          }`}
        >
          {form.image_url ? (
            <div className="relative w-full">
              <img
                src={form.image_url}
                alt="Skin preview"
                className="mx-auto h-20 w-20 rounded-md object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).src =
                    'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80"><rect width="80" height="80" fill="%23334155" rx="6"/><text x="50%" y="50%" dominant-baseline="central" text-anchor="middle" fill="%2364788b" font-size="28">?</text></svg>';
                }}
              />
              <button
                type="button"
                onClick={() => update('image_url', '')}
                className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-slate-600 text-xs text-white transition-colors hover:bg-slate-500"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ) : (
            <Image className="mb-1 h-7 w-7 text-slate-500" />
          )}
          <input
            type="url"
            value={form.image_url}
            onChange={(e) => update('image_url', e.target.value)}
            placeholder="Paste image URL..."
            className="mt-1 w-full rounded border border-slate-700 bg-slate-800 px-2 py-1.5 text-center text-xs text-slate-300 placeholder-slate-600 focus:border-indigo-500/50 focus:outline-none"
          />
          <p className="mt-1 text-[10px] text-slate-600">
            Right-click a skin image &rarr; Copy Image Address
          </p>
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium uppercase tracking-widest text-slate-400">
          Skin Name
        </label>
        <input
          type="text"
          value={form.skin_name}
          onChange={(e) => update('skin_name', e.target.value)}
          placeholder="e.g. AK-47 | Redline (FT)"
          required
          className={inputBase}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium uppercase tracking-widest text-slate-400">
            Buy Price ($)
          </label>
          <input
            type="number"
            step="0.01"
            min="0"
            value={form.buy_price}
            onChange={(e) => update('buy_price', e.target.value)}
            required
            className={inputBase}
          />
        </div>
        <div>
          <label className="block text-xs font-medium uppercase tracking-widest text-slate-400">
            Float
          </label>
          <input
            type="number"
            step="0.0001"
            min="0"
            max="1"
            value={form.float_value}
            onChange={(e) => update('float_value', e.target.value)}
            placeholder="0.0000"
            className={inputBase}
          />
        </div>
      </div>

      {showSellFields && (
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium uppercase tracking-widest text-slate-400">
              Sell Price ($)
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={form.sell_price}
              onChange={(e) => update('sell_price', e.target.value)}
              className={inputBase}
            />
          </div>
          {isSold ? (
            <div>
              <label className="block text-xs font-medium uppercase tracking-widest text-slate-400">
                Sold For ($)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={form.sold_price}
                onChange={(e) => update('sold_price', e.target.value)}
                className={inputBase}
              />
            </div>
          ) : (
            <div>
              <label className="block text-xs font-medium uppercase tracking-widest text-slate-400">
                Withdrawal
              </label>
              <select
                value={form.withdrawal_method}
                onChange={(e) => update('withdrawal_method', e.target.value)}
                className={inputBase}
              >
                <option value="">Pick method...</option>
                <option value="csfloat">CSFloat (2.5%)</option>
                <option value="csmoney">CS.Money (2.7%)</option>
              </select>
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium uppercase tracking-widest text-slate-400">
            Marketplace
          </label>
          <select
            value={form.platform}
            onChange={(e) => update('platform', e.target.value as Platform)}
            className={inputBase}
          >
            <option value="csfloat">CSFloat</option>
            <option value="csmoney">CS.Money</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium uppercase tracking-widest text-slate-400">
            Status
          </label>
          <select
            value={form.status}
            onChange={(e) => update('status', e.target.value as SkinStatus)}
            className={inputBase}
          >
            <option value="trade_locked">Trade Locked</option>
            <option value="unlisted">Unlisted</option>
            <option value="listed">Listed</option>
            <option value="sold">Sold</option>
          </select>
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium uppercase tracking-widest text-slate-400">
          Notes
        </label>
        <textarea
          value={form.notes}
          onChange={(e) => update('notes', e.target.value)}
          rows={2}
          className={inputBase}
        />
      </div>

      {/* Live Fee Breakdown */}
      {showSellFields && sell > 0 && (
        <div className="overflow-hidden rounded-lg border border-slate-700/50 bg-slate-800/30">
          <div className="border-b border-slate-700/50 bg-slate-800/50 px-3 py-2">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">
              {platformLabel} Fees
            </p>
          </div>
            <div className="space-y-1.5 px-3 py-2.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">{platformLabel} Fee ({platformFee.fee_pct}%{platformFee.fixed_fee > 0 ? ` + $${platformFee.fixed_fee.toFixed(2)}` : ''})</span>
                <span className="font-mono text-slate-200">
                  -${feeBreakdown.platform_fee.toFixed(2)}
                </span>
              </div>
              {withdrawalMethod && (
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">
                    Withdrawal Fee ({feeBreakdown.withdrawal_fee_pct}%{feeBreakdown.withdrawal_fixed_fee > 0 ? ` + $${feeBreakdown.withdrawal_fixed_fee.toFixed(2)}` : ''})
                  </span>
                  <span className="font-mono text-slate-200">
                    -${feeBreakdown.withdrawal_fee.toFixed(2)}
                  </span>
                </div>
              )}
              <hr className="border-slate-700/50" />
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Net Payout</span>
              <span className="font-mono font-medium text-white">
                ${feeBreakdown.true_net_payout.toFixed(2)}
              </span>
            </div>
            {buy > 0 && (
              <>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">Net Profit</span>
                  <span
                    className={`font-mono font-medium ${
                      fullCalc.net_profit >= 0
                        ? 'text-emerald-400'
                        : 'text-rose-400'
                    }`}
                  >
                    ${fullCalc.net_profit.toFixed(2)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400">ROI</span>
                  <span
                    className={`font-mono font-medium ${
                      fullCalc.roi_percent >= 0
                        ? 'text-emerald-400'
                        : 'text-rose-400'
                    }`}
                  >
                    {fullCalc.roi_percent.toFixed(2)}%
                  </span>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      <button
        type="submit"
        disabled={saving}
        className="w-full rounded-lg bg-gradient-to-r from-indigo-600 to-indigo-500 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-all duration-150 hover:from-indigo-500 hover:to-indigo-400 hover:shadow-indigo-500/20 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {saving ? (
          <span className="flex items-center justify-center gap-2">
            <RotateCw className="h-4 w-4 animate-spin" />
            Saving...
          </span>
        ) : isEditing ? (
          'Update Item'
        ) : (
          'Save to Inventory'
        )}
      </button>
    </form>
  );
}
