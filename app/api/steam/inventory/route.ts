import { NextRequest, NextResponse } from 'next/server';
import { fetchCS2Inventory } from '@/lib/steam';
import { pool } from '@/lib/db';

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const steamId = searchParams.get('steamId');

  if (!steamId || !/^\d{17}$/.test(steamId)) {
    return NextResponse.json(
      {
        error:
          'A valid SteamID64 (17 digits) is required. Find yours at steamid.io.',
      },
      { status: 400 },
    );
  }

  try {
    const items = await fetchCS2Inventory(steamId);

    const existingResult = await pool.query(
      'SELECT DISTINCT skin_name FROM skin_inventory',
    );
    const existingNames = new Set(
      (existingResult.rows as { skin_name: string }[]).map((r) =>
        r.skin_name.toLowerCase(),
      ),
    );

    const itemsWithStatus = items.map((item) => ({
      ...item,
      alreadyTracked: existingNames.has(item.marketHashName.toLowerCase()),
    }));

    return NextResponse.json({ items: itemsWithStatus });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'Failed to fetch inventory';
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
