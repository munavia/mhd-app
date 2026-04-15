"use client";

import NextTopLoader from "nextjs-toploader";

/**
 * Thin progress bar on route transitions (App Router).
 */
export function TopLoader() {
  return (
    <NextTopLoader
      color="hsl(var(--primary))"
      height={3}
      showSpinner={false}
      shadow="0 0 12px hsl(var(--primary) / 0.35)"
      zIndex={99999}
    />
  );
}
