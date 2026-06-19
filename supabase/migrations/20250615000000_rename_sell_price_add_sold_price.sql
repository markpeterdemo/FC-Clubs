ALTER TABLE skin_inventory RENAME COLUMN target_sell_price TO sell_price;
ALTER TABLE skin_inventory ADD COLUMN sold_price NUMERIC NOT NULL DEFAULT 0 CHECK (sold_price >= 0);
