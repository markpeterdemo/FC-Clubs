import { pool } from '@/lib/db';
import { toSkinInventory, type SkinInventoryRow } from '@/lib/types';
import DashboardClient from '@/components/DashboardClient';

export const dynamic = 'force-dynamic';

export default async function Page() {
  let items: ReturnType<typeof toSkinInventory>[] = [];
  let serverError: string | undefined;

  try {
    const result = await pool.query(
      'SELECT * FROM skin_inventory ORDER BY created_at DESC',
    );
    items = (result.rows as SkinInventoryRow[]).map(toSkinInventory);
  } catch {
    serverError = 'Database connection failed. Check your DATABASE_URL.';
  }

  return <DashboardClient initialItems={items} serverError={serverError} />;
}
