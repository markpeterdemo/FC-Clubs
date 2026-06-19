export type SkinStatus = 'trade_locked' | 'unlisted' | 'listed' | 'sold';

export type Platform = 'csfloat' | 'csmoney';
export type WithdrawalMethod = 'csfloat' | 'csmoney';

export type SkinInventoryRow = {
  id: string;
  skin_name: string;
  buy_price: number | string;
  sell_price: number | string;
  sold_price: number | string;
  float_value: number | string;
  withdrawal_method: string;
  status: SkinStatus;
  notes: string;
  image_url: string;
  platform: string;
  created_at: string | Date;
};

export function toSkinInventory(row: SkinInventoryRow): SkinInventory {
  return {
    id: row.id,
    skin_name: row.skin_name,
    buy_price: Number(row.buy_price),
    sell_price: Number(row.sell_price),
    sold_price: Number(row.sold_price),
    float_value: row.float_value != null ? Number(row.float_value) : null,
    withdrawal_method: row.withdrawal_method as WithdrawalMethod ?? null,
    status: row.status,
    notes: row.notes,
    image_url: row.image_url ?? '',
    platform: (row.platform as Platform) ?? 'csfloat',
    created_at:
      row.created_at instanceof Date
        ? row.created_at.toISOString()
        : (row.created_at as string),
  };
}

export interface SkinInventory {
  id: string;
  skin_name: string;
  buy_price: number;
  sell_price: number;
  sold_price: number;
  float_value: number | null;
  withdrawal_method: WithdrawalMethod | null;
  status: SkinStatus;
  notes: string;
  image_url: string;
  platform: Platform;
  created_at: string;
}

export interface SkinFormData {
  skin_name: string;
  buy_price: string;
  sell_price: string;
  sold_price: string;
  float_value: string;
  withdrawal_method: string;
  status: SkinStatus;
  notes: string;
  image_url: string;
  platform: Platform;
}

export interface TradeCalculations {
  platform_fee_pct: number;
  platform_fixed_fee: number;
  platform_fee: number;
  withdrawal_fee_pct: number;
  withdrawal_fixed_fee: number;
  withdrawal_fee: number;
  true_net_payout: number;
  net_profit: number;
  roi_percent: number;
}
