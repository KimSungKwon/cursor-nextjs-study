import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";
import { getPublicEnv } from "@/commons/config/env";
import {
  AUTH_URLS,
  COMMERCE_URLS,
  getAccessPolicy,
  type AccessPolicy,
} from "@/commons/constants/url";
import type { Database } from "@/types/supabase";

const STATIC_PATH_PREFIXES = ["/_next", "/images", "/icons", "/favicon.ico"];

const isStaticOrExemptPath = (pathname: string): boolean => {
  return STATIC_PATH_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
};

const copyCookies = (from: NextResponse, to: NextResponse): NextResponse => {
  from.cookies.getAll().forEach((cookie) => {
    to.cookies.set(cookie.name, cookie.value);
  });
  return to;
};

const redirectWithCookies = (
  req: NextRequest,
  pathname: string,
  supabaseResponse: NextResponse,
): NextResponse => {
  const url = req.nextUrl.clone();
  url.pathname = pathname;
  url.search = "";
  return copyCookies(supabaseResponse, NextResponse.redirect(url));
};

const createSupabaseProxyClient = (req: NextRequest, res: NextResponse) => {
  const { supabase } = getPublicEnv();
  let response = res;

  const supabaseClient = createServerClient<Database>(
    supabase.url,
    supabase.publishableKey,
    {
      cookies: {
        getAll() {
          return req.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => {
            req.cookies.set(name, value);
          });
          response = NextResponse.next({ request: req });
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        },
      },
    },
  );

  return {
    supabaseClient,
    getResponse: () => response,
  };
};

const resolveUserRole = async (
  supabaseClient: ReturnType<typeof createServerClient<Database>>,
  userId: string,
): Promise<string | null> => {
  const { data } = await supabaseClient
    .from("users")
    .select("role")
    .eq("id", userId)
    .maybeSingle();

  const row = data as { role?: string } | null;
  return row?.role ?? null;
};

const enforceAccessPolicy = async ({
  req,
  policy,
  userId,
  supabaseClient,
  supabaseResponse,
}: {
  req: NextRequest;
  policy: AccessPolicy;
  userId: string | null;
  supabaseClient: ReturnType<typeof createServerClient<Database>>;
  supabaseResponse: NextResponse;
}): Promise<NextResponse | null> => {
  switch (policy) {
    case "guest-only": {
      if (userId) {
        return redirectWithCookies(req, COMMERCE_URLS.HOME, supabaseResponse);
      }
      return null;
    }
    case "member-only": {
      if (!userId) {
        return redirectWithCookies(req, AUTH_URLS.LOGIN, supabaseResponse);
      }
      return null;
    }
    case "super-admin-only": {
      if (!userId) {
        return redirectWithCookies(req, AUTH_URLS.LOGIN, supabaseResponse);
      }

      const role = await resolveUserRole(supabaseClient, userId);
      if (role !== "admin") {
        return redirectWithCookies(req, COMMERCE_URLS.HOME, supabaseResponse);
      }
      return null;
    }
    case "public":
    default:
      return null;
  }
};

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (isStaticOrExemptPath(pathname)) {
    return NextResponse.next();
  }

  let supabaseResponse = NextResponse.next({ request: req });
  const { supabaseClient, getResponse } = createSupabaseProxyClient(
    req,
    supabaseResponse,
  );

  const {
    data: { user },
  } = await supabaseClient.auth.getUser();

  supabaseResponse = getResponse();

  const policy = getAccessPolicy(pathname);
  const redirected = await enforceAccessPolicy({
    req,
    policy,
    userId: user?.id ?? null,
    supabaseClient,
    supabaseResponse,
  });

  if (redirected) {
    return redirected;
  }

  return getResponse();
}

export const config = {
  matcher: [
    /*
     * API routes, Next.js 내부 경로, 정적 파일 확장자 제외
     */
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js|map|txt|xml|woff2?)$).*)",
  ],
};
