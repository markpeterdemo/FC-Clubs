CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE skin_inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  skin_name TEXT NOT NULL,
  buy_price NUMERIC NOT NULL CHECK (buy_price >= 0),
  target_sell_price NUMERIC NOT NULL CHECK (target_sell_price >= 0),
  custom_withdrawal_tier NUMERIC NOT NULL DEFAULT 2.5 CHECK (custom_withdrawal_tier >= 0),
  status TEXT NOT NULL DEFAULT 'trade_locked'
    CHECK (status IN ('trade_locked', 'listed', 'sold', 'cashed_out')),
  notes TEXT DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_skin_inventory_status ON skin_inventory (status);
CREATE INDEX idx_skin_inventory_created_at ON skin_inventory (created_at DESC);
