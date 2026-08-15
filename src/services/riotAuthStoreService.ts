export interface RiotAuthResult {
  accessToken: string;
  idToken: string;
  requires2FA?: boolean;
  error?: string;
}

export interface UserInfoResult {
  puuid: string;
  country?: string;
  sub: string;
}

export interface DailyStoreRawOffer {
  OfferID: string;
  IsAvailable: boolean;
  Cost: Record<string, number>;
}

export interface DailyStoreRawResult {
  singleItemOffers: string[];
  remainingDurationInSeconds: number;
  rawOffers: DailyStoreRawOffer[];
  detectedRegion?: string;
}

const PROXY_ENDPOINT = '/api/proxy';

const SHARD_MAP: Record<string, string> = {
  eu: 'eu',
  na: 'na',
  ap: 'ap',
  kr: 'kr',
  latam: 'na',
  br: 'na',
  pbe: 'pbe',
};

// Official Riot Client Platform base64 string
const CLIENT_PLATFORM_BASE64 =
  'ew0KCSJwbGF0Zm9ybVR5cGUiOiAiUEMiLA0KCSJwbGF0Zm9ybU9TIjogIldpbmRvd3MiLA0KCSJwbGF0Zm9ybU9TVmVyc2lvbiI6ICIxMC4wLjE5MDQyLjEuMjU2LjY0Yml0IiwNCgkicGxhdGZvcm1DaGlwc2V0IjoiVW5rbm93biJ9';

const SHOOTER_GAME_USER_AGENT = 'ShooterGame/13 Windows/10.0.19042.1.256.64bit';

/**
 * Safely parses JSON response with clear error context
 */
async function parseJsonResponse<T>(res: Response, fallbackMessage: string): Promise<T> {
  const text = await res.text();
  if (!text || !text.trim()) {
    throw new Error(`${fallbackMessage} (Boş yanıt alındı)`);
  }
  try {
    return JSON.parse(text) as T;
  } catch {
    throw new Error(`${fallbackMessage} (Geçersiz yanıt: ${text.substring(0, 120)})`);
  }
}

/**
 * Safely extracts access_token and id_token from pasted URL or raw input
 */
export function extractTokens(input: string): { accessToken: string; idToken: string } {
  if (!input) return { accessToken: '', idToken: '' };
  const trimmed = input.trim();

  let accessToken = '';
  let idToken = '';

  if (trimmed.includes('access_token=') || trimmed.includes('id_token=')) {
    const normalized = trimmed.replace(/#/g, '&');
    const params = new URLSearchParams(
      normalized.substring(normalized.indexOf('access_token='))
    );
    accessToken = params.get('access_token') || '';
    idToken = params.get('id_token') || '';
  }

  if (!accessToken) {
    const match = trimmed.match(/access_token=([^&\s#"]+)/);
    if (match && match[1]) accessToken = match[1];
  }
  if (!idToken) {
    const match = trimmed.match(/id_token=([^&\s#"]+)/);
    if (match && match[1]) idToken = match[1];
  }

  if (!accessToken && trimmed.length > 50) {
    accessToken = trimmed;
  }

  return { accessToken: accessToken.trim(), idToken: idToken.trim() };
}

/**
 * Extracts PUUID directly from JWT id_token or access_token payload
 */
export function extractPuuidFromJwt(token: string): string | null {
  try {
    const parts = token.split('.');
    if (parts.length < 2) return null;
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const json = JSON.parse(
      typeof atob === 'function'
        ? atob(base64)
        : Buffer.from(base64, 'base64').toString('utf8')
    );
    return json.sub || null;
  } catch {
    return null;
  }
}

/**
 * Executes a proxied fetch request to a target Riot endpoint
 */
async function proxyFetch(targetUrl: string, options: RequestInit = {}) {
  const headers = new Headers(options.headers || {});
  headers.set('x-target-url', targetUrl);

  const res = await fetch(PROXY_ENDPOINT, {
    ...options,
    headers,
  });

  return res;
}

/**
 * Step 2.1: Authenticate with Riot Games using official riot-client parameters
 */
export async function authenticate(
  username?: string,
  password?: string,
  multifactorCode?: string
): Promise<RiotAuthResult> {
  try {
    const initRes = await proxyFetch('https://auth.riotgames.com/api/v1/authorization', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': SHOOTER_GAME_USER_AGENT,
      },
      body: JSON.stringify({
        client_id: 'riot-client',
        nonce: '1',
        redirect_uri: 'http://localhost/redirect',
        response_type: 'token id_token',
        scope: 'openid link ban lol_region',
      }),
    });

    if (!initRes.ok) {
      throw new Error(`Auth başlatılamadı (HTTP ${initRes.status})`);
    }

    const sessionCookie = initRes.headers.get('x-riot-session-cookie') || '';

    let putBody: Record<string, unknown> = {};
    if (multifactorCode) {
      putBody = {
        type: 'multifactor',
        code: multifactorCode,
        remember: true,
      };
    } else {
      putBody = {
        type: 'auth',
        username,
        password,
        remember: true,
      };
    }

    const authHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      'User-Agent': SHOOTER_GAME_USER_AGENT,
    };
    if (sessionCookie) {
      authHeaders['x-riot-cookie'] = sessionCookie;
    }

    const authRes = await proxyFetch('https://auth.riotgames.com/api/v1/authorization', {
      method: 'PUT',
      headers: authHeaders,
      body: JSON.stringify(putBody),
    });

    const data = await parseJsonResponse<Record<string, unknown>>(authRes, 'Riot yanıtı okunamadı');

    if (data.type === 'multifactor') {
      return { accessToken: '', idToken: '', requires2FA: true };
    }

    if (data.error === 'auth_failure') {
      const fallbackRes = await fetch('/api/riot/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, code: multifactorCode }),
      });
      const fallbackData = await parseJsonResponse<Record<string, unknown>>(
        fallbackRes,
        'Sunucu auth yanıtı okunamadı'
      );

      if (!fallbackRes.ok) {
        throw new Error((fallbackData.error as string) || 'Kullanıcı adı veya şifre hatalı!');
      }

      if (fallbackData.requires2FA) {
        return { accessToken: '', idToken: '', requires2FA: true };
      }

      return {
        accessToken: fallbackData.accessToken as string,
        idToken: fallbackData.idToken as string,
        requires2FA: false,
      };
    }

    if (data.error) {
      throw new Error(`Giriş hatası: ${data.error}`);
    }

    const redirectUri: string = (data?.response as Record<string, Record<string, string>>)?.parameters?.uri || '';
    if (!redirectUri) {
      throw new Error('Erişim anahtarı alınamadı.');
    }

    const hashParams = new URLSearchParams(redirectUri.split('#')[1] || '');
    const accessToken = hashParams.get('access_token');
    const idToken = hashParams.get('id_token');

    if (!accessToken || !idToken) {
      throw new Error('Erişim tokenları ayrıştırılamadı.');
    }

    return {
      accessToken,
      idToken,
      requires2FA: false,
    };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Giriş işlemi başarısız.';
    return {
      accessToken: '',
      idToken: '',
      error: errorMsg,
    };
  }
}

/**
 * Step 2.2: Fetch Entitlements Token using Access Token
 */
export async function getEntitlementsToken(accessToken: string): Promise<string> {
  const { accessToken: cleanToken } = extractTokens(accessToken);

  const res = await proxyFetch('https://entitlements.auth.riotgames.com/api/token/v1', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${cleanToken}`,
      'Content-Type': 'application/json',
      'User-Agent': SHOOTER_GAME_USER_AGENT,
    },
    body: JSON.stringify({}),
  });

  if (!res.ok) {
    const errBody = await res.text();
    throw new Error(`Entitlements token alınamadı (HTTP ${res.status}): ${errBody}`);
  }

  const data = await parseJsonResponse<Record<string, string>>(res, 'Entitlements verisi ayrıştırılamadı');
  if (!data.entitlements_token) {
    throw new Error('Yanıtta entitlements_token bulunamadı.');
  }

  return data.entitlements_token;
}

/**
 * Step 2.3: Fetch User Info (PUUID from sub)
 */
export async function getUserInfo(accessToken: string, idToken?: string): Promise<UserInfoResult> {
  const { accessToken: cleanToken } = extractTokens(accessToken);

  let puuid = extractPuuidFromJwt(idToken || '') || extractPuuidFromJwt(cleanToken);

  try {
    const res = await proxyFetch('https://auth.riotgames.com/userinfo', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${cleanToken}`,
        'User-Agent': SHOOTER_GAME_USER_AGENT,
      },
    });

    if (res.ok) {
      const data = await res.json();
      if (data.sub) {
        puuid = data.sub;
      }
      return {
        puuid: puuid || data.sub,
        country: data.country,
        sub: puuid || data.sub,
      };
    }
  } catch {}

  if (puuid) {
    return { puuid, sub: puuid };
  }

  throw new Error('Kullanıcı PUUID (sub) bilgisi tespit edilemedi.');
}

/**
 * Discovers account game region/affinity via Riot PAS Service
 */
export async function getPASAffinity(idToken: string): Promise<string | null> {
  try {
    if (!idToken) return null;
    const res = await proxyFetch('https://riot-geo.pas.riotgames.com/pas/v1/product/valorant', {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${idToken}`,
        'Content-Type': 'application/json',
        'User-Agent': SHOOTER_GAME_USER_AGENT,
      },
      body: JSON.stringify({ id_token: idToken }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data?.affinities?.live) {
        return data.affinities.live;
      }
    }
  } catch {}
  return null;
}

/**
 * Step 2.4: Fetch Daily Store Offers supporting POST/GET on v3 & v2
 */
export async function getDailyStore(
  region: string,
  puuid: string,
  accessToken: string,
  entitlementsToken: string,
  idToken?: string
): Promise<DailyStoreRawResult> {
  const { accessToken: cleanAccessToken, idToken: cleanIdToken } = extractTokens(
    accessToken || idToken || ''
  );
  const activeAccessToken = cleanAccessToken || accessToken;
  const activeIdToken = cleanIdToken || idToken || '';

  if (!puuid || typeof puuid !== 'string' || puuid.trim() === '') {
    throw new Error('Geçerli bir PUUID bulunamadı.');
  }

  // 1. Shard Tespiti (PAS)
  let primaryShard = region.toLowerCase();
  if (activeIdToken) {
    const pasAffinity = await getPASAffinity(activeIdToken);
    if (pasAffinity) {
      primaryShard = SHARD_MAP[pasAffinity.toLowerCase()] || pasAffinity.toLowerCase();
    }
  }

  const allShards = Array.from(new Set([primaryShard, 'eu', 'na', 'ap', 'kr']));

  // 2. Dinamik Client Version
  let clientVersion = 'release-13.02-shipping-17-5277781';
  try {
    const vRes = await fetch('https://valorant-api.com/v1/version');
    if (vRes.ok) {
      const vData = await vRes.json();
      if (vData?.data?.riotClientVersion) {
        clientVersion = vData.data.riotClientVersion;
      }
    }
  } catch {}

  let diagDetails = '';

  for (const shard of allShards) {
    const candidateRequests = [
      { url: `https://pd.${shard}.a.pvp.net/store/v3/storefront/${puuid}`, method: 'POST', body: '{}' },
      { url: `https://pd.${shard}.a.pvp.net/store/v2/storefront/${puuid}`, method: 'POST', body: '{}' },
      { url: `https://pd.${shard}.a.pvp.net/store/v3/storefront/${puuid}`, method: 'GET', body: undefined },
      { url: `https://pd.${shard}.a.pvp.net/store/v2/storefront/${puuid}`, method: 'GET', body: undefined },
    ];

    for (const req of candidateRequests) {
      try {
        const reqHeaders: Record<string, string> = {
          'Authorization': `Bearer ${activeAccessToken}`,
          'X-Riot-Entitlements-JWT': entitlementsToken,
          'X-Riot-ClientPlatform': CLIENT_PLATFORM_BASE64,
          'X-Riot-ClientVersion': clientVersion,
          'User-Agent': SHOOTER_GAME_USER_AGENT,
        };
        if (req.method === 'POST') {
          reqHeaders['Content-Type'] = 'application/json';
        }

        const res = await proxyFetch(req.url, {
          method: req.method,
          headers: reqHeaders,
          body: req.body,
        });

        if (res.ok) {
          const data = await parseJsonResponse<Record<string, unknown>>(res, 'Mağaza verisi ayrıştırılamadı');
          const skinsPanel = data?.SkinsPanelLayout as Record<string, unknown>;

          if (skinsPanel) {
            const singleItemOffers: string[] = (skinsPanel.SingleItemOffers as string[]) || [];
            const remainingDurationInSeconds: number =
              (skinsPanel.SingleItemOffersRemainingDurationInSeconds as number) || 0;
            const rawOffers: DailyStoreRawOffer[] = (skinsPanel.SingleItemStoreOffers as DailyStoreRawOffer[]) || [];

            return {
              singleItemOffers,
              remainingDurationInSeconds,
              rawOffers,
              detectedRegion: shard.toUpperCase(),
            };
          }
        } else {
          const errText = await res.text();
          diagDetails += `[${shard.toUpperCase()} ${req.method} ${req.url.includes('v3') ? 'v3' : 'v2'}: HTTP ${res.status} ${errText.substring(0, 30)}] `;
        }
      } catch (err) {
        const errMsg = err instanceof Error ? err.message : 'Hata';
        diagDetails += `[${shard.toUpperCase()}: ${errMsg}] `;
      }
    }
  }

  throw new Error(`Mağaza sunucusu yanıtı: ${diagDetails}`);
}
