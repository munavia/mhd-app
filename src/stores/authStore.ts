import { create } from "zustand";
import type { AccountStatus, Role } from "@/types";

interface AuthUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

interface AuthState {
  user: AuthUser | null;
  role: Role | null;
  accountStatus: AccountStatus | null;
  loading: boolean;
  hydrated: boolean;
  setUser: (
    user: AuthUser | null,
    role: Role | null,
    accountStatus?: AccountStatus | null
  ) => void;
  setLoading: (loading: boolean) => void;
  setHydrated: (hydrated: boolean) => void;
  clearUser: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  role: null,
  accountStatus: null,
  loading: true,
  hydrated: false,
  setUser: (user, role, accountStatus = null) =>
    set({
      user,
      role,
      accountStatus: user ? accountStatus ?? "active" : null,
      loading: false,
    }),
  setLoading: (loading) => set({ loading }),
  setHydrated: (hydrated) => set({ hydrated }),
  clearUser: () =>
    set({ user: null, role: null, accountStatus: null, loading: false }),
}));
