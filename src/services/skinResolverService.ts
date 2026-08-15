import { DailyStoreRawOffer } from './riotAuthStoreService';

export interface ResolvedSkinOffer {
  uuid: string;
  displayName: string;
  displayIcon: string;
  streamedVideo: string | null;
  vpCost: number;
  contentTierUuid?: string;
  tierColorHex?: string;
  tierName?: string;
}

const VP_CURRENCY_UUID = '85f06242-41c3-4225-a5f8-418b23528b4d';

const TIER_COLORS: Record<string, { color: string; name: string }> = {
  '12664672-4ea8-002e-609f-38a49636d818': { color: '#5a9fe2', name: 'Select Tier' },
  '0ab84477-4460-1dd5-4b77-74b23835e577': { color: '#00d084', name: 'Deluxe Tier' },
  '60b37087-450f-62f9-b75c-7d9a103c8008': { color: '#d1548d', name: 'Premium Tier' },
  'e046854e-406c-37f4-6607-19a9ba8426fc': { color: '#f5a623', name: 'Exclusive Tier' },
  '411e4a5a-4e82-466b-94c3-c6b0b9b77519': { color: '#ef4444', name: 'Ultra Tier' },
};

/**
 * Executes a fetch request with a strict timeout to prevent app hanging
 */
async function fetchWithTimeout(url: string, timeoutMs = 3500): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timer);
    return res;
  } catch (err) {
    clearTimeout(timer);
    throw err;
  }
}

/**
 * Step 3: Resolves skin details (name, icon, video, VP price) from valorant-api.com
 */
export async function resolveSkinOffers(
  skinUuids: string[],
  rawOffers: DailyStoreRawOffer[]
): Promise<ResolvedSkinOffer[]> {
  const promises = skinUuids.map(async (uuid) => {
    try {
      const matchingOffer = rawOffers.find(
        (offer) => offer.OfferID.toLowerCase() === uuid.toLowerCase()
      );

      let vpCost = 0;
      if (matchingOffer && matchingOffer.Cost) {
        vpCost = matchingOffer.Cost[VP_CURRENCY_UUID] || Object.values(matchingOffer.Cost)[0] || 0;
      }

      let displayName = 'Valorant Silah Kaplaması';
      let displayIcon = '';
      let streamedVideo: string | null = null;
      let contentTierUuid: string | undefined = undefined;
      let tierColorHex = '#ff4655';
      let tierName = 'Valorant Skin';

      try {
        const res = await fetchWithTimeout(
          `https://valorant-api.com/v1/weapons/skinlevels/${uuid}?language=tr-TR`,
          3500
        );
        if (res.ok) {
          const json = await res.json();
          const data = json.data;
          if (data) {
            displayName = data.displayName || displayName;
            displayIcon = data.displayIcon || '';
            streamedVideo = data.streamedVideo || null;
            displayName = displayName.replace(/\s+Seviye\s+\d+/i, '').replace(/\s+Level\s+\d+/i, '');

            if (!displayIcon && data.swatch) {
              displayIcon = data.swatch;
            }
          }
        }
      } catch {
        // Fallback gracefully on timeout
      }

      if (!displayIcon) {
        try {
          const skinRes = await fetchWithTimeout(
            `https://valorant-api.com/v1/weapons/skins/${uuid}`,
            2500
          );
          if (skinRes.ok) {
            const skinJson = await skinRes.json();
            if (skinJson.data) {
              displayIcon = skinJson.data.displayIcon || displayIcon;
              displayName = skinJson.data.displayName || displayName;
              contentTierUuid = skinJson.data.contentTierUuid;
            }
          }
        } catch {
          // Fallback gracefully on timeout
        }
      }

      if (contentTierUuid && TIER_COLORS[contentTierUuid]) {
        tierColorHex = TIER_COLORS[contentTierUuid].color;
        tierName = TIER_COLORS[contentTierUuid].name;
      }

      return {
        uuid,
        displayName,
        displayIcon,
        streamedVideo,
        vpCost,
        contentTierUuid,
        tierColorHex,
        tierName,
      };
    } catch {
      return {
        uuid,
        displayName: 'Valorant Silah Kaplaması',
        displayIcon: '',
        streamedVideo: null,
        vpCost: 0,
        tierColorHex: '#ff4655',
        tierName: 'Standart',
      };
    }
  });

  return Promise.all(promises);
}
