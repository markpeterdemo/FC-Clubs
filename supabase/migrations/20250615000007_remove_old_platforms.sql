UPDATE skin_inventory SET platform = 'csfloat' WHERE platform NOT IN ('csfloat', 'csmoney');
ALTER TABLE skin_inventory DROP CONSTRAINT IF EXISTS skin_inventory_platform_check;
ALTER TABLE skin_inventory ADD CONSTRAINT skin_inventory_platform_check
  CHECK (platform = ANY (ARRAY['csfloat'::text, 'csmoney'::text]));
