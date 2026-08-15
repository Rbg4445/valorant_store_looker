import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const { username, password, code } = await req.json();

    if (!username && !code) {
      return NextResponse.json(
        { error: 'Lütfen kullanıcı adınızı ve şifrenizi giriniz.' },
        { status: 400 }
      );
    }

    const userAgent =
      'RiotClient/93.0.1.2582.3551 rso-auth (Windows; 10; WinNT; x64)';

    // Step 1: Initial POST using official Riot Client SSO parameters
    const initRes = await fetch(
      'https://auth.riotgames.com/api/v1/authorization',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': userAgent,
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          client_id: 'riot-client',
          nonce: '1',
          redirect_uri: 'http://localhost/redirect',
          response_type: 'token id_token',
          scope: 'openid account valorant hextech',
        }),
      }
    );

    if (!initRes.ok) {
      const errText = await initRes.text();
      return NextResponse.json(
        { error: `Riot sunucusuna bağlanılamadı (HTTP ${initRes.status}): ${errText}` },
        { status: initRes.status }
      );
    }

    // Extract set-cookie headers from Riot's response
    let cookieHeaders: string[] = [];
    if (typeof initRes.headers.getSetCookie === 'function') {
      cookieHeaders = initRes.headers.getSetCookie();
    } else {
      const setCookie = initRes.headers.get('set-cookie');
      if (setCookie) cookieHeaders = [setCookie];
    }

    const cookieString = cookieHeaders
      .map((c) => c.split(';')[0].trim())
      .filter(Boolean)
      .join('; ');

    // Step 2: PUT request with credentials or 2FA verification code
    let putBody: Record<string, unknown> = {};
    if (code) {
      putBody = {
        type: 'multifactor',
        code: String(code).trim(),
        remember: true,
      };
    } else {
      putBody = {
        type: 'auth',
        username: String(username).trim(),
        password: String(password),
        remember: true,
      };
    }

    const authRes = await fetch(
      'https://auth.riotgames.com/api/v1/authorization',
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'User-Agent': userAgent,
          'Accept': 'application/json',
          'Cookie': cookieString,
        },
        body: JSON.stringify(putBody),
      }
    );

    const data = await authRes.json();

    // Check for 2FA requirement
    if (data.type === 'multifactor') {
      return NextResponse.json({ requires2FA: true });
    }

    // Check for authentication error
    if (data.error) {
      if (data.error === 'auth_failure') {
        return NextResponse.json(
          {
            error:
              'Kullanıcı adı veya şifre hatalı! (Not: Lütfen e-posta veya OyuncuAdı#TR1 DEĞİL, hesaba giriş kullanıcı adınızı yazdığınızdan emin olun)',
            rawError: data.error,
          },
          { status: 400 }
        );
      } else if (data.error === 'rate_limited') {
        return NextResponse.json(
          {
            error:
              'Çok fazla deneme yapıldı. Riot Games güvenlik nedeniyle geçici engel koydu. Lütfen 10-15 dakika bekleyin.',
            rawError: data.error,
          },
          { status: 429 }
        );
      } else if (data.error === 'multifactor_attempt_failed') {
        return NextResponse.json(
          {
            error: 'Girdiğiniz 2FA doğrulama kodu hatalı veya süresi dolmuş.',
            rawError: data.error,
          },
          { status: 400 }
        );
      }
      return NextResponse.json(
        { error: `Giriş hatası (${data.error})`, rawError: data.error },
        { status: 400 }
      );
    }

    // Extract tokens from redirect URI
    const redirectUri: string = data?.response?.parameters?.uri || '';
    if (!redirectUri) {
      return NextResponse.json(
        { error: 'Riot sunucusu doğrulama anahtarı döndürmedi.' },
        { status: 400 }
      );
    }

    const hashParams = new URLSearchParams(redirectUri.split('#')[1] || '');
    const accessToken = hashParams.get('access_token');
    const idToken = hashParams.get('id_token');

    if (!accessToken || !idToken) {
      return NextResponse.json(
        { error: 'Erişim anahtarları ayrıştırılamadı.' },
        { status: 400 }
      );
    }

    return NextResponse.json({ accessToken, idToken });
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : 'Giriş işlemi başarısız.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
