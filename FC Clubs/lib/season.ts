import { query } from "@/lib/db";

export async function getActiveSeason(): Promise<string> {
  try {
    const result = await query("SELECT season FROM leagues WHERE is_active = true LIMIT 1");
    if (result.rows.length > 0) {
      return result.rows[0].season;
    }
  } catch {
    // fall through to default
  }
  return "Spring 2025";
}
