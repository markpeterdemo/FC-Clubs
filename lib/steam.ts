const STEAM_INVENTORY_URL = 'https://steamcommunity.com/inventory';
const STEAM_IMAGE_BASE =
  'https://community.cloudflare.steamstatic.com/economy/image/';
const CS2_APPID = 730;
const CS2_CONTEXTID = '2';

interface SteamAsset {
  appid: number;
  contextid: string;
  assetid: string;
  classid: string;
  instanceid: string;
  amount: string;
}

interface SteamDescription {
  classid: string;
  instanceid: string;
  name: string;
  market_hash_name: string;
  icon_url: string;
  type: string;
}

interface SteamInventoryResponse {
  success: boolean;
  assets: SteamAsset[];
  descriptions: SteamDescription[];
  total_inventory_count?: number;
  more_items?: boolean;
  last_assetid?: string;
}

export interface SteamInventoryItem {
  id: string;
  classId: string;
  instanceId: string;
  name: string;
  marketHashName: string;
  iconUrl: string;
  quantity: number;
}

export async function fetchCS2Inventory(
  steamId: string,
): Promise<SteamInventoryItem[]> {
  const items = new Map<string, SteamInventoryItem>();
  let startAssetId: string | undefined;

  do {
    const params = new URLSearchParams({ l: 'en', count: '500' });
    if (startAssetId) params.set('start_assetid', startAssetId);

    const url = `${STEAM_INVENTORY_URL}/${steamId}/${CS2_APPID}/${CS2_CONTEXTID}?${params}`;

    const res = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0' },
    });

    if (!res.ok) {
      throw new Error(
        `Steam API returned ${res.status}. Make sure the Steam ID is correct.`,
      );
    }

    const data: SteamInventoryResponse = await res.json();

    if (!data.success) {
      throw new Error(
        'Steam rejected the request. The inventory may be private or the ID is invalid.',
      );
    }

    if (!data.assets || !data.descriptions) break;

    const descMap = new Map<string, SteamDescription>();
    for (const desc of data.descriptions) {
      descMap.set(`${desc.classid}_${desc.instanceid}`, desc);
    }

    for (const asset of data.assets) {
      if (asset.appid !== CS2_APPID) continue;
      const key = `${asset.classid}_${asset.instanceid}`;
      const desc = descMap.get(key);
      if (!desc) continue;

      const existing = items.get(key);
      if (existing) {
        existing.quantity += parseInt(asset.amount, 10) || 1;
      } else {
        items.set(key, {
          id: key,
          classId: asset.classid,
          instanceId: asset.instanceid,
          name: desc.name,
          marketHashName: desc.market_hash_name || desc.name,
          iconUrl: desc.icon_url
            ? `${STEAM_IMAGE_BASE}${desc.icon_url}`
            : '',
          quantity: parseInt(asset.amount, 10) || 1,
        });
      }
    }

    startAssetId = data.more_items ? data.last_assetid : undefined;
  } while (startAssetId);

  return Array.from(items.values());
}
