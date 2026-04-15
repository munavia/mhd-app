import { NextRequest, NextResponse } from "next/server";
import {
  authMiddleware,
} from "next-firebase-auth-edge";
import createIntlMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

const intlMiddleware = createIntlMiddleware(routing);

/** Match first path segment when it is a locale (including `en` — next-intl may use /en/... before rewrite). */
const LOCALE_SEGMENT_RE = /^\/(en|pt|es)(\/|$)/;

function stripLocale(pathname: string): string {
  const next = pathname.replace(LOCALE_SEGMENT_RE, "/");
  return next === "" ? "/" : next;
}

/** Prefix for redirects: default locale `en` uses no prefix (`localePrefix: 'as-needed'`). */
function getLocalePrefix(pathname: string): string {
  const m = pathname.match(/^\/(en|pt|es)(?=\/|$)/);
  if (!m) return "";
  if (m[1] === "en") return "";
  return `/${m[1]}`;
}

const PUBLIC_PATHS = [
  "/",
  "/about",
  "/blog",
  "/events",
  "/give",
  "/contact",
  "/prayer-request",
  "/login",
  "/signup",
  "/forgot-password",
  "/auth-action",
];

function isPublicPath(pathname: string): boolean {
  if (PUBLIC_PATHS.includes(pathname)) return true;
  if (pathname.startsWith("/blog/")) return true;
  if (pathname.startsWith("/_next/")) return true;
  if (pathname.startsWith("/api/")) return true;
  if (pathname.includes(".")) return true;
  return false;
}

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  if (pathname.startsWith("/_next/") || pathname.includes(".")) {
    return NextResponse.next();
  }

  const bare = stripLocale(pathname);
  const localePrefix = getLocalePrefix(pathname);

  return authMiddleware(request, {
    loginPath: "/api/login",
    logoutPath: "/api/logout",
    apiKey: process.env.FIREBASE_API_KEY!,
    cookieName: "AuthToken",
    cookieSignatureKeys: [
      process.env.COOKIE_SECRET_CURRENT!,
      process.env.COOKIE_SECRET_PREVIOUS!,
    ],
    cookieSerializeOptions: {
      path: "/",
      httpOnly: true,
      secure: process.env.USE_SECURE_COOKIES === "true",
      sameSite: "lax",
      maxAge: 12 * 60 * 60 * 24,
    },
    serviceAccount: {
      projectId: process.env.FIREBASE_ADMIN_PROJECT_ID!,
      clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL!,
      privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY!.replace(
        /\\n/g,
        "\n"
      ),
    },
    handleValidToken: async ({ decodedToken }, headers) => {
      if (bare === "/login" || bare === "/signup") {
        return NextResponse.redirect(
          new URL(`${localePrefix}/`, request.url)
        );
      }

      const intlResponse = intlMiddleware(request);
      for (const [key, value] of headers.entries()) {
        intlResponse.headers.set(key, value);
      }
      return intlResponse;
    },
    handleInvalidToken: async (_reason) => {
      if (isPublicPath(bare)) {
        return intlMiddleware(request);
      }

      return NextResponse.redirect(
        new URL(`${localePrefix}/login`, request.url)
      );
    },
    handleError: async (_error) => {
      if (isPublicPath(bare)) {
        return intlMiddleware(request);
      }

      return NextResponse.redirect(
        new URL(`${localePrefix}/login`, request.url)
      );
    },
  });
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.).*)",
    "/api/login",
    "/api/logout",
  ],
};
