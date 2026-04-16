import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut as firebaseSignOut,
  sendEmailVerification as firebaseSendEmailVerification,
  sendPasswordResetEmail as firebaseSendPasswordResetEmail,
  updateProfile,
  type ActionCodeSettings,
  type User as FirebaseUser,
} from "firebase/auth";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { auth, db } from "./firebase";
import type { AccountStatus, Role } from "@/types";

const googleProvider = new GoogleAuthProvider();

/**
 * Continue URL for password reset / email verification (client-sent emails).
 *
 * Important: If the Firebase template Action URL is the default
 * `https://<project>.firebaseapp.com/__/auth/action`, the user always sees
 * Firebase's hosted reset form first; `continueUrl` does not replace that page.
 *
 * For your custom `/auth-action` UI from email links, set each template's
 * Action URL to `https://<production-domain>/auth-action` (e.g. Netlify).
 *
 * Local dev: forgot-password uses `POST /api/auth/password-reset` (dev only) to
 * open `/auth-action` directly without the default Firebase screen.
 *
 * Optional override: NEXT_PUBLIC_AUTH_ACTION_ORIGIN when the browser origin is wrong.
 */
function getAuthActionOrigin(): string {
  const fromEnv =
    process.env.NEXT_PUBLIC_AUTH_ACTION_ORIGIN?.replace(/\/$/, "") ?? "";
  if (fromEnv) return fromEnv;
  if (typeof window !== "undefined") return window.location.origin;
  return (process.env.NEXT_PUBLIC_APP_URL ?? "").replace(/\/$/, "");
}

function getAuthActionCodeSettings(): ActionCodeSettings {
  const origin = getAuthActionOrigin();
  if (!origin) {
    throw new Error(
      "Auth emails: open the app in a browser, or set NEXT_PUBLIC_AUTH_ACTION_ORIGIN / NEXT_PUBLIC_APP_URL."
    );
  }
  return {
    url: `${origin}/auth-action`,
    // Web: false so the continue URL is applied correctly; true is aimed at mobile deep links.
    handleCodeInApp: false,
  };
}

async function setSessionCookie(user: FirebaseUser) {
  const idToken = await user.getIdToken();
  await fetch("/api/login", {
    method: "GET",
    headers: { Authorization: `Bearer ${idToken}` },
  });
}

async function clearSessionCookie() {
  await fetch("/api/logout", { method: "GET" });
}

export class EmailNotVerifiedError extends Error {
  constructor() {
    super("Please verify your email before signing in.");
    this.name = "EmailNotVerifiedError";
  }
}

export async function signUp(name: string, email: string, password: string) {
  const credential = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(credential.user, { displayName: name });

  await setDoc(doc(db, "users", credential.user.uid), {
    name,
    email,
    role: "user" as Role,
    status: "active" as AccountStatus,
    photoURL: credential.user.photoURL || "",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  await firebaseSendEmailVerification(
    credential.user,
    getAuthActionCodeSettings()
  );
  // Sign out immediately -- user must verify email before gaining a session
  await firebaseSignOut(auth);
  return credential.user;
}

export async function signIn(email: string, password: string) {
  const credential = await signInWithEmailAndPassword(auth, email, password);

  if (!credential.user.emailVerified) {
    await firebaseSendEmailVerification(
      credential.user,
      getAuthActionCodeSettings()
    );
    await firebaseSignOut(auth);
    throw new EmailNotVerifiedError();
  }

  await setSessionCookie(credential.user);
  return credential.user;
}

export async function signInWithGoogle() {
  const credential = await signInWithPopup(auth, googleProvider);
  const userDoc = await getDoc(doc(db, "users", credential.user.uid));

  if (!userDoc.exists()) {
    await setDoc(doc(db, "users", credential.user.uid), {
      name: credential.user.displayName || "User",
      email: credential.user.email,
      role: "user" as Role,
      status: "active" as AccountStatus,
      photoURL: credential.user.photoURL || "",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  }

  await setSessionCookie(credential.user);
  return credential.user;
}

export async function signOut() {
  await clearSessionCookie();
  await firebaseSignOut(auth);
}

export async function sendPasswordReset(email: string) {
  await firebaseSendPasswordResetEmail(
    auth,
    email,
    getAuthActionCodeSettings()
  );
}

export async function resendVerificationEmail() {
  if (auth.currentUser) {
    await firebaseSendEmailVerification(
      auth.currentUser,
      getAuthActionCodeSettings()
    );
  }
}

export async function getUserProfile(uid: string): Promise<{
  role: Role;
  status: AccountStatus;
}> {
  const userDoc = await getDoc(doc(db, "users", uid));
  if (userDoc.exists()) {
    const data = userDoc.data();
    const role = (data.role as Role) || "user";
    const raw = data.status as AccountStatus | undefined;
    const status: AccountStatus =
      raw === "blocked" ? "blocked" : "active";
    return { role, status };
  }
  return { role: "user", status: "active" };
}

export async function getUserRole(uid: string): Promise<Role> {
  const { role } = await getUserProfile(uid);
  return role;
}
