'use client';

import { Briefcase, Lock, ChartBar, TrendingUp } from 'lucide-react';
import type { SkinInventory } from '@/lib/types';
import { computeTrade, effectiveSellPrice } from '@/lib/calculations';

interface Props {
  items: SkinInventory[];
}

function classNameForProfit(profit: number) {
  if (profit > 0) return 'text-emerald-400';
  if (profit < 0) return 'text-rose-400';
  return 'text-slate-300';
}

function profitBg(profit: number) {
  if (profit > 0) return 'bg-emerald-500/10 border-emerald-500/20';
  if (profit < 0) return 'bg-rose-500/10 border-rose-500/20';
  return 'bg-slate-800/50 border-slate-700/50';
}

const iconMap = {
  briefcase: Briefcase,
  lock: Lock,
  chart: ChartBar,
  trending: TrendingUp,
} as const;

export default function MetricsBar({ items }: Props) {
  const activeItems = items.filter(
    (i) =>
      i.status === 'trade_locked' ||
      i.status === 'unlisted' ||
      i.status === 'listed',
  );
  const lockedItems = items.filter((i) => i.status === 'trade_locked');
  const soldItems = items.filter((i) => i.status === 'sold');

  const totalActiveCapital = activeItems.reduce((s, i) => s + i.buy_price, 0);
  const lockedCapital = lockedItems.reduce((s, i) => s + i.buy_price, 0);

  const realizedTrades = soldItems.map((i) =>
    computeTrade(i.buy_price, effectiveSellPrice(i), i.platform, i.withdrawal_method),
  );

  const totalRealizedProfit = realizedTrades.reduce(
    (s, t) => s + t.net_profit,
    0,
  );
  const avgROI =
    realizedTrades.length > 0
      ? realizedTrades.reduce((s, t) => s + t.roi_percent, 0) /
        realizedTrades.length
      : 0;

  const cards: Array<{
    label: string;
    value: string;
    profit?: number;
    icon: keyof typeof iconMap;
  }> = [
    {
      label: 'Active Capital',
      value: `$${totalActiveCapital.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
      icon: 'briefcase',
    },
    {
      label: 'Locked Capital',
      value: `$${lockedCapital.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
      icon: 'lock',
    },
    {
      label: 'Realized Net Profit',
      value: `$${totalRealizedProfit.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
      profit: totalRealizedProfit,
      icon: 'chart',
    },
    {
      label: 'Avg ROI',
      value: `${avgROI.toFixed(2)}%`,
      profit: avgROI,
      icon: 'trending',
    },
  ];

  return (
    <div className="grid grid-cols-4 gap-4 min-w-0">
      {cards.map((card) => (
        <MetricCard key={card.label} {...card} />
      ))}
    </div>
  );
}

function MetricCard({
  label,
  value,
  profit,
  icon,
}: {
  label: string;
  value: string;
  profit?: number;
  icon: keyof typeof iconMap;
}) {
  const Icon = iconMap[icon];

  return (
    <div
      className={`group relative overflow-hidden rounded-xl border p-4 transition-all duration-200 hover:scale-[1.02] ${
        profit !== undefined
          ? profitBg(profit)
          : 'border-slate-700/50 bg-slate-800/50'
      }`}
    >
      <div
        className={`absolute inset-x-0 bottom-0 h-[2px] ${
          profit !== undefined
            ? profit >= 0
              ? 'bg-gradient-to-r from-emerald-500 to-emerald-400'
              : 'bg-gradient-to-r from-rose-500 to-rose-400'
            : 'bg-gradient-to-r from-slate-600 to-slate-500'
        }`}
      />

      <div className="flex items-start justify-between">
        <p className="text-xs font-medium uppercase tracking-widest text-slate-400">
          {label}
        </p>
        <Icon className="h-4 w-4 text-slate-500" />
      </div>
      <p
        className={`mt-2 text-2xl font-bold tabular-nums tracking-tight ${
          profit !== undefined ? classNameForProfit(profit) : 'text-white'
        }`}
      >
        {value.startsWith('-') ? value : value}
      </p>
    </div>
  );
}
