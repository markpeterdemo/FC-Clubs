'use client';

import { useState, useMemo } from 'react';
import { Calculator } from 'lucide-react';
import type { Platform, WithdrawalMethod } from '@/lib/types';
import { computeTrade, getPlatformLabel } from '@/lib/calculations';

const inputBase =
  'w-full rounded-lg border border-slate-700 bg-slate-800/50 px-3 py-2 text-sm text-white placeholder-slate-600 transition-all focus:border-indigo-500/50 focus:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20';

export default function QuickCalculator() {
  const [open, setOpen] = useState(false);
  const [buy, setBuy] = useState('');
  const [sell, setSell] = useState('');
  const [platform, setPlatform] = useState<Platform>('csfloat');
  const [withdrawal, setWithdrawal] = useState<WithdrawalMethod | ''>('');

  const buyNum = parseFloat(buy) || 0;
  const sellNum = parseFloat(sell) || 0;

  const calc = useMemo(() => {
    if (sellNum <= 0) return null;
    return computeTrade(buyNum, sellNum, platform, withdrawal || null);
  }, [buyNum, sellNum, platform, withdrawal]);

  return (
    <div className="overflow-hidden rounded-lg border border-slate-700/50 bg-slate-800/20">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center gap-2 px-3 py-2.5 text-xs font-semibold uppercase tracking-widest text-slate-400 transition-colors hover:bg-slate-800/40 hover:text-slate-300"
      >
        <Calculator className="h-3.5 w-3.5" />
        Quick Calculator
        <span className="ml-auto text-slate-600">{open ? '−' : '+'}</span>
      </button>

      {open && (
        <div className="space-y-3 border-t border-slate-700/50 px-3 py-3">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[10px] font-medium uppercase tracking-widest text-slate-500">
                Buy Price
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={buy}
                onChange={(e) => setBuy(e.target.value)}
                placeholder="0.00"
                className={inputBase}
              />
            </div>
            <div>
              <label className="block text-[10px] font-medium uppercase tracking-widest text-slate-500">
                Sell Price
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={sell}
                onChange={(e) => setSell(e.target.value)}
                placeholder="0.00"
                className={inputBase}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[10px] font-medium uppercase tracking-widest text-slate-500">
                Marketplace
              </label>
              <select
                value={platform}
                onChange={(e) => setPlatform(e.target.value as Platform)}
                className={inputBase}
              >
                <option value="csfloat">CSFloat (2%)</option>
                <option value="csmoney">CS.Money (1.5% + $1.20)</option>
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-medium uppercase tracking-widest text-slate-500">
                Withdrawal
              </label>
              <select
                value={withdrawal}
                onChange={(e) => setWithdrawal(e.target.value as WithdrawalMethod | '')}
                className={inputBase}
              >
                <option value="">None</option>
                <option value="csfloat">CSFloat (2.5%)</option>
                <option value="csmoney">CS.Money (2.7%)</option>
              </select>
            </div>
          </div>

          {calc && (
            <div className="space-y-1 rounded-lg bg-slate-800/40 px-2.5 py-2 text-xs">
              <div className="flex items-center justify-between text-slate-400">
                <span>{getPlatformLabel(platform)} Fee ({calc.platform_fee_pct}%{calc.platform_fixed_fee > 0 ? ` + $${calc.platform_fixed_fee.toFixed(2)}` : ''})</span>
                <span className="font-mono text-slate-200">-${calc.platform_fee.toFixed(2)}</span>
              </div>
              {withdrawal && (
                <div className="flex items-center justify-between text-slate-400">
                  <span>
                    Withdrawal ({calc.withdrawal_fee_pct}%{calc.withdrawal_fixed_fee > 0 ? ` + $${calc.withdrawal_fixed_fee.toFixed(2)}` : ''})
                  </span>
                  <span className="font-mono text-slate-200">-${calc.withdrawal_fee.toFixed(2)}</span>
                </div>
              )}
              <hr className="border-slate-700/50" />
              <div className="flex items-center justify-between text-slate-400">
                <span>Net Payout</span>
                <span className="font-mono font-medium text-white">${calc.true_net_payout.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Net Profit</span>
                <span className={`font-mono font-medium ${calc.net_profit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  ${calc.net_profit.toFixed(2)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">ROI</span>
                <span className={`font-mono font-medium ${calc.roi_percent >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {calc.roi_percent.toFixed(2)}%
                </span>
              </div>
            </div>
          )}

          {!calc && sellNum <= 0 && (
            <p className="text-center text-[10px] text-slate-600">
              Enter a sell price to see the breakdown
            </p>
          )}
        </div>
      )}
    </div>
  );
}
