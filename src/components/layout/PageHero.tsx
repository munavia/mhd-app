"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";

type PageHeroProps = {
  /** Public path (`/images/...`) or `https://` URL (allowed in `next.config` `images.remotePatterns`). */
  imageSrc: string;
  children: React.ReactNode;
  /** `full` = home-style tall hero; `compact` = inner pages. */
  size?: "full" | "compact";
  className?: string;
  contentClassName?: string;
  /**
   * `true` (default): fetch with high priority and emit preload for LCP.
   * Set `false` only if the hero is not the first paint (e.g. below another hero).
   */
  priority?: boolean;
};

export function PageHero({
  imageSrc,
  children,
  size = "compact",
  className,
  contentClassName,
  priority = true,
}: PageHeroProps) {
  return (
    <section
      className={cn(
        "relative isolate overflow-hidden border-b border-border/40",
        size === "full" &&
          "flex min-h-screen flex-col justify-center pt-16",
        className
      )}
    >
      <div className="absolute inset-0 bg-muted" aria-hidden>
        <Image
          src={imageSrc}
          alt=""
          fill
          priority={priority}
          sizes="100vw"
          className="object-cover object-center"
        />
      </div>
      {/* Light: avoid heavy white wash; dark: avoid crushing the photo — tune with dark: */}
      <div
        className="pointer-events-none absolute inset-0 bg-gradient-to-b from-background/45 via-background/24 to-background dark:from-background/28 dark:via-background/14 dark:to-background"
        aria-hidden
      />
      <div
        className={cn(
          "relative z-10 mx-auto w-full max-w-6xl px-4",
          size === "full" ? "py-20 md:py-28" : "py-14 md:py-20",
          // Headings stay legible on bright or dark areas of photos
          "[&_h1]:text-foreground [&_h1]:[text-shadow:0_0_2px_rgba(255,255,255,0.95),0_2px_8px_rgba(255,255,255,0.55)]",
          "dark:[&_h1]:text-zinc-50 dark:[&_h1]:[text-shadow:0_2px_20px_rgba(0,0,0,0.7)]",
          contentClassName
        )}
      >
        {children}
      </div>
    </section>
  );
}
