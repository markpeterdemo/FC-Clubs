import type { TradeCalculations, Platform, SkinStatus, WithdrawalMethod } from './types';

const PLATFORM_FEES: Record<Platform, { fee_pct: number; fixed_fee: number; label: string }> = {
  csfloat: { fee_pct: 2, fixed_fee: 0, label: 'CSFloat' },
  csmoney: { fee_pct: 1.5, fixed_fee: 1.2, label: 'CS.Money' },
};

const WITHDRAWAL_FEES: Record<WithdrawalMethod, { fee_pct: number; fixed_fee: number; label: string }> = {
  csfloat: { fee_pct: 2.5, fixed_fee: 0, label: 'CSFloat' },
  csmoney: { fee_pct: 2.7, fixed_fee: 0, label: 'CS.Money' },
};

export function getPlatformFee(platform: Platform): { fee_pct: number; fixed_fee: number } {
  const p = PLATFORM_FEES[platform];
  return p ?? { fee_pct: 2, fixed_fee: 0 };
}

export function getPlatformLabel(platform: Platform): string {
  return PLATFORM_FEES[platform]?.label ?? 'CSFloat';
}

export function getWithdrawalFee(withdrawalMethod: WithdrawalMethod | null): { fee_pct: number; fixed_fee: number; label: string } {
  if (withdrawalMethod && WITHDRAWAL_FEES[withdrawalMethod]) {
    return WITHDRAWAL_FEES[withdrawalMethod];
  }
  return { fee_pct: 0, fixed_fee: 0, label: 'None' };
}

export function getWithdrawalLabel(withdrawalMethod: WithdrawalMethod | null): string {
  return getWithdrawalFee(withdrawalMethod).label;
}

export function computeFeesPreview(
  sellPrice: number,
  platform: Platform = 'csfloat',
  withdrawalMethod: WithdrawalMethod | null = null,
): TradeCalculations {
  const pf = getPlatformFee(platform);
  const platform_fee = sellPrice * (pf.fee_pct / 100) + pf.fixed_fee;
  const wf = getWithdrawalFee(withdrawalMethod);
  const withdrawal_fee = sellPrice * (wf.fee_pct / 100) + wf.fixed_fee;
  const true_net_payout = sellPrice - platform_fee - withdrawal_fee;
  return {
    platform_fee_pct: pf.fee_pct,
    platform_fixed_fee: pf.fixed_fee,
    platform_fee: round2(platform_fee),
    withdrawal_fee_pct: wf.fee_pct,
    withdrawal_fixed_fee: wf.fixed_fee,
    withdrawal_fee: round2(withdrawal_fee),
    true_net_payout: round2(true_net_payout),
    net_profit: 0,
    roi_percent: 0,
  };
}

export function computeTrade(
  buyPrice: number,
  effectiveSellPrice: number,
  platform: Platform = 'csfloat',
  withdrawalMethod: WithdrawalMethod | null = null,
): TradeCalculations {
  const pf = getPlatformFee(platform);
  const platform_fee = effectiveSellPrice * (pf.fee_pct / 100) + pf.fixed_fee;
  const wf = getWithdrawalFee(withdrawalMethod);
  const withdrawal_fee = effectiveSellPrice * (wf.fee_pct / 100) + wf.fixed_fee;
  const true_net_payout = effectiveSellPrice - platform_fee - withdrawal_fee;
  const net_profit = true_net_payout - buyPrice;
  const roi_percent = buyPrice > 0 ? (net_profit / buyPrice) * 100 : 0;

  return {
    platform_fee_pct: pf.fee_pct,
    platform_fixed_fee: pf.fixed_fee,
    platform_fee: round2(platform_fee),
    withdrawal_fee_pct: wf.fee_pct,
    withdrawal_fixed_fee: wf.fixed_fee,
    withdrawal_fee: round2(withdrawal_fee),
    true_net_payout: round2(true_net_payout),
    net_profit: round2(net_profit),
    roi_percent: round2(roi_percent),
  };
}

export function effectiveSellPrice(item: {
  status: SkinStatus;
  sell_price: number;
  sold_price: number;
}): number {
  return item.status === 'sold' ? item.sold_price : item.sell_price;
}

export function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
