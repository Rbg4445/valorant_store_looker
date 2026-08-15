import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
  'Access-Control-Expose-Headers': '*',
};

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: CORS_HEADERS,
  });
}

async function handleProxy(req: NextRequest) {
  try {
    const targetUrl = req.headers.get('x-target-url') || req.nextUrl.searchParams.get('url');

    if (!targetUrl) {
      return NextResponse.json(
        { error: 'Missing target URL. Provide x-target-url header or url search param.' },
        { status: 400, headers: CORS_HEADERS }
      );
    }

    console.log(`[PROXY ${req.method}] Target URL:`, targetUrl);

    const forwardHeaders: Record<string, string> = {};

    req.headers.forEach((value, key) => {
      const lower = key.toLowerCase();
      if (!['host', 'origin', 'x-target-url', 'content-length', 'connection'].includes(lower)) {
        if (lower === 'x-riot-entitlements-jwt') {
          forwardHeaders['X-Riot-Entitlements-JWT'] = value;
        } else if (lower === 'x-riot-clientversion') {
          forwardHeaders['X-Riot-ClientVersion'] = value;
        } else if (lower === 'x-riot-clientplatform') {
          forwardHeaders['X-Riot-ClientPlatform'] = value;
        } else if (lower === 'authorization') {
          forwardHeaders['Authorization'] = value;
        } else if (lower === 'content-type') {
          forwardHeaders['Content-Type'] = value;
        } else if (lower === 'user-agent') {
          forwardHeaders['User-Agent'] = value;
        } else {
          forwardHeaders[key] = value;
        }
      }
    });

    const customCookie = req.headers.get('x-riot-cookie');
    if (customCookie) {
      forwardHeaders['Cookie'] = customCookie;
    }

    // Default User-Agent for Valorant PVP API
    if (!forwardHeaders['User-Agent']) {
      forwardHeaders['User-Agent'] = 'ShooterGame/13 Windows/10.0.19042.1.256.64bit';
    }

    let body: string | undefined = undefined;
    if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
      body = await req.text();
    }

    const riotResponse = await fetch(targetUrl, {
      method: req.method,
      headers: forwardHeaders,
      body: body || undefined,
      redirect: 'manual',
    });

    const responseData = await riotResponse.arrayBuffer();
    const responseHeaders = new Headers(CORS_HEADERS);

    riotResponse.headers.forEach((val, key) => {
      const lowerKey = key.toLowerCase();
      if (!['content-encoding', 'transfer-encoding', 'content-length', 'set-cookie'].includes(lowerKey)) {
        responseHeaders.append(key, val);
      }
    });

    let setCookies: string[] = [];
    if (typeof riotResponse.headers.getSetCookie === 'function') {
      setCookies = riotResponse.headers.getSetCookie();
    } else {
      const sc = riotResponse.headers.get('set-cookie');
      if (sc) setCookies = [sc];
    }

    if (setCookies.length > 0) {
      const combined = setCookies
        .map((c) => c.split(';')[0].trim())
        .filter(Boolean)
        .join('; ');
      responseHeaders.set('x-riot-session-cookie', combined);
    }

    return new NextResponse(responseData, {
      status: riotResponse.status,
      statusText: riotResponse.statusText,
      headers: responseHeaders,
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Proxy hatası';
    return NextResponse.json({ error: errorMsg }, { status: 500, headers: CORS_HEADERS });
  }
}

export async function GET(req: NextRequest) {
  return handleProxy(req);
}

export async function POST(req: NextRequest) {
  return handleProxy(req);
}

export async function PUT(req: NextRequest) {
  return handleProxy(req);
}
