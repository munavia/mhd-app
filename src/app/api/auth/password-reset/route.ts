import { NextRequest, NextResponse } from "next/server";
import { adminAuth } from "@/lib/firebase-admin";

/**
 * Rewrites Firebase's default handler URL (firebaseapp.com/__/auth/action?...) to
 * our /auth-action route with the same query params so the in-app UI runs.
 */
function rewriteOobLinkToApp(firebaseLink: string, origin: string): string {
  const url = new URL(firebaseLink);
  const mode = url.searchParams.get("mode");
  const oobCode = url.searchParams.get("oobCode");
  const apiKey = url.searchParams.get("apiKey");
  const lang = url.searchParams.get("lang");
  if (!mode || !oobCode || !apiKey) {
    throw new Error("Malformed OOB link");
  }
  const base = origin.replace(/\/$/, "");
  const target = new URL(`${base}/auth-action`);
  target.searchParams.set("mode", mode);
  target.searchParams.set("oobCode", oobCode);
  target.searchParams.set("apiKey", apiKey);
  if (lang) target.searchParams.set("lang", lang);
  return target.toString();
}

function isLocalDevOrigin(origin: string): boolean {
  try {
    const u = new URL(origin);
    return u.hostname === "localhost" || u.hostname === "127.0.0.1";
  } catch {
    return false;
  }
}

/**
 * Development only: generates a password reset link with the Admin SDK, rewrites
 * it to http://localhost:.../auth-action so you skip Firebase's default form.
 *
 * Production: use the client sendPasswordReset flow and set the Firebase
 * template Action URL to https://<your-site>/auth-action so emails open your UI.
 */
export async function POST(req: NextRequest) {
  if (process.env.NODE_ENV !== "development") {
    return NextResponse.json({ error: "Not available" }, { status: 404 });
  }

  const origin =
    req.headers.get("x-auth-action-origin") ?? req.headers.get("origin") ?? "";
  if (!isLocalDevOrigin(origin)) {
    return NextResponse.json({ error: "Invalid origin" }, { status: 403 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const email =
    typeof body === "object" &&
    body !== null &&
    typeof (body as { email?: string }).email === "string"
      ? (body as { email: string }).email.trim()
      : "";
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Invalid email" }, { status: 400 });
  }

  try {
    const oobLink = await adminAuth.generatePasswordResetLink(email, {
      url: `${origin.replace(/\/$/, "")}/auth-action`,
      handleCodeInApp: false,
    });
    const resetUrl = rewriteOobLinkToApp(oobLink, origin);
    return NextResponse.json({ resetUrl });
  } catch {
    return NextResponse.json(
      { error: "Could not start password reset. Check the email address." },
      { status: 400 }
    );
  }
}
