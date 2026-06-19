import { NextRequest, NextResponse } from 'next/server';
import { pool } from '@/lib/db';
import {
  toSkinInventory,
  type SkinInventory,
  type SkinInventoryRow,
  type SkinStatus,
  type Platform,
} from '@/lib/types';

export async function GET() {
  const result = await pool.query(
    'SELECT * FROM skin_inventory ORDER BY created_at DESC',
  );
  const items = (result.rows as SkinInventoryRow[]).map(toSkinInventory);
  return NextResponse.json(items satisfies SkinInventory[]);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const {
    id,
    skin_name,
    buy_price,
    sell_price,
    sold_price,
    float_value,
    withdrawal_method,
    status,
    notes,
    image_url,
    platform,
  } = body;

  if (!skin_name || buy_price == null) {
    return NextResponse.json(
      { error: 'skin_name and buy_price are required' },
      { status: 400 },
    );
  }

  const s = (status ?? 'trade_locked') as SkinStatus;
  const p = (platform ?? 'csfloat') as Platform;

  let result;
  if (id) {
    result = await pool.query(
      `UPDATE skin_inventory
       SET skin_name = $1, buy_price = $2, sell_price = $3, sold_price = $4,
           float_value = $5, withdrawal_method = $6, status = $7,
           notes = $8, image_url = $9, platform = $10
       WHERE id = $11
       RETURNING *`,
      [
        skin_name,
        Number(buy_price),
        Number(sell_price ?? 0),
        Number(sold_price ?? 0),
        float_value != null ? Number(float_value) : null,
        withdrawal_method || null,
        s,
        notes ?? '',
        image_url ?? '',
        p,
        id,
      ],
    );
    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'not found' }, { status: 404 });
    }
  } else {
    result = await pool.query(
      `INSERT INTO skin_inventory (skin_name, buy_price, sell_price, sold_price, float_value, withdrawal_method, status, notes, image_url, platform)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING *`,
      [
        skin_name,
        Number(buy_price),
        Number(sell_price ?? 0),
        Number(sold_price ?? 0),
        float_value != null ? Number(float_value) : null,
        withdrawal_method || null,
        s,
        notes ?? '',
        image_url ?? '',
        p,
      ],
    );
  }

  return NextResponse.json(
    toSkinInventory(result.rows[0] as SkinInventoryRow) satisfies SkinInventory,
    { status: id ? 200 : 201 },
  );
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json(
      { error: 'id query param is required' },
      { status: 400 },
    );
  }

  await pool.query('DELETE FROM skin_inventory WHERE id = $1', [id]);
  return NextResponse.json({ success: true });
}
