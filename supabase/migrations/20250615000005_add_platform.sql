ALTER TABLE skin_inventory
  ADD COLUMN platform TEXT NOT NULL DEFAULT 'csfloat'
  CHECK (platform IN ('csfloat', 'skinport', 'dmarket', 'custom'));
