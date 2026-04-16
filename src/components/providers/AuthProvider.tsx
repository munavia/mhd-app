"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { onAuthStateChanged } from "firebase/auth";
import { toast } from "sonner";
import { auth } from "@/lib/firebase";
import { getUserProfile, signOut } from "@/lib/auth";
import { useAuthStore } from "@/stores/authStore";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const t = useTranslations("Common");
  const { setUser, clearUser, setHydrated } = useAuthStore();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const { role, status } = await getUserProfile(firebaseUser.uid);
        if (status === "blocked") {
          toast.error(t("accountBlocked"));
          try {
            await signOut();
          } catch {
            clearUser();
            setHydrated(true);
          }
          return;
        }
        setUser(
          {
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName,
            photoURL: firebaseUser.photoURL,
          },
          role,
          status
        );
      } else {
        clearUser();
      }
      setHydrated(true);
    });

    return () => unsubscribe();
  }, [setUser, clearUser, setHydrated, t]);

  return <>{children}</>;
}
