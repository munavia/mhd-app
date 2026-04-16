"use client";

import { useCallback } from "react";
import { useAuthStore } from "@/stores/authStore";
import { hasPermission } from "@/lib/permissions";
import type { Action } from "@/types";

export function useAuth() {
  const { user, role, accountStatus, loading, hydrated } = useAuthStore();

  const can = useCallback(
    (action: Action) => hasPermission(role ?? undefined, action),
    [role]
  );

  return {
    user,
    role,
    accountStatus,
    loading,
    hydrated,
    isAuthenticated: !!user,
    isAdmin: role === "admin",
    can,
  };
}
