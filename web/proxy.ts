import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

/**
 * Proxy (formerly Middleware in Next.js <16).
 * Refreshes the Supabase session on every request and guards app routes.
 */
/** Refresh this many seconds before the access token actually expires. */
const REFRESH_MARGIN_SECONDS = 120;

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  const userId = await resolveUserId(supabase);

  const { pathname } = request.nextUrl;
  const isAuthRoute = pathname.startsWith('/login');
  const isPublicRoute = pathname === '/' || isAuthRoute;

  // Unauthenticated users trying to reach the app → login
  if (!userId && !isPublicRoute) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    return NextResponse.redirect(url);
  }

  // Authenticated users on the login page → the Manor
  if (userId && isAuthRoute) {
    const url = request.nextUrl.clone();
    url.pathname = '/manor';
    return NextResponse.redirect(url);
  }

  return response;
}


/**
 * Refresh the access token only when it actually needs refreshing.
 *
 * getUser() is a network round trip to Supabase — measured at ~210ms from
 * here, on EVERY request, and it was the single largest fixed cost of a page
 * navigation. The only reason it has to run in the proxy is to refresh an
 * expiring token and write the new cookie via setAll().
 *
 * So verify locally first. The project signs sessions with ES256 and publishes
 * a JWKS, so getClaims() checks the signature against the cached public key
 * with no network call. If the token is valid and not close to expiry, that is
 * all we need and the round trip is skipped.
 *
 * Anything else — no token, a token we cannot verify, or one inside the expiry
 * margin — falls through to getUser(), which performs the refresh. Getting
 * this wrong logs people out mid-session, so the fallback is deliberately
 * broad: we only skip on a positive, in-date verification.
 */
async function resolveUserId(
  supabase: ReturnType<typeof createServerClient>,
): Promise<string | null> {
  try {
    const { data, error } = await supabase.auth.getClaims();
    const claims = data?.claims;
    if (!error && claims?.sub && typeof claims.exp === 'number') {
      const secondsLeft = claims.exp - Math.floor(Date.now() / 1000);
      if (secondsLeft > REFRESH_MARGIN_SECONDS) {
        return claims.sub;
      }
    }
  } catch {
    // Fall through to the authoritative check below.
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user?.id ?? null;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};
