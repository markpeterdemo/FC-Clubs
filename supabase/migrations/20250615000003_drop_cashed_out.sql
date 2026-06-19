ALTER TABLE skin_inventory DROP CONSTRAINT skin_inventory_status_check;
ALTER TABLE skin_inventory ADD CONSTRAINT skin_inventory_status_check
  CHECK (status IN ('trade_locked', 'listed', 'sold'));
UPDATE skin_inventory SET status = 'sold' WHERE status = 'cashed_out';
