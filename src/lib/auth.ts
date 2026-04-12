import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut as firebaseSignOut,
  sendEmailVerification as firebaseSendEmailVerification,
  sendPasswordResetEmail as firebaseSendPasswordResetEmail,
  updateProfile,
  type User as FirebaseUser,
} from "firebase/auth";
import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { auth, db } from "./firebase";
import type { Role } from "@/types";

const googleProvider = new GoogleAuthProvider();

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
    photoURL: credential.user.photoURL || "",
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });

  await firebaseSendEmailVerification(credential.user);
  // Sign out immediately -- user must verify email before gaining a session
  await firebaseSignOut(auth);
  return credential.user;
}

export async function signIn(email: string, password: string) {
  const credential = await signInWithEmailAndPassword(auth, email, password);

  if (!credential.user.emailVerified) {
    await firebaseSendEmailVerification(credential.user);
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
  await firebaseSendPasswordResetEmail(auth, email);
}

export async function resendVerificationEmail() {
  if (auth.currentUser) {
    await firebaseSendEmailVerification(auth.currentUser);
  }
}

export async function getUserRole(uid: string): Promise<Role> {
  const userDoc = await getDoc(doc(db, "users", uid));
  if (userDoc.exists()) {
    return (userDoc.data().role as Role) || "user";
  }
  return "user";
}
