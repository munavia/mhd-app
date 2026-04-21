"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Copy } from "lucide-react";
import { toast } from "sonner";
import { routing } from "@/i18n/routing";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M20.52 3.48A12 12 0 0 0 12 0C5.37 0 0 5.37 0 12c0 2.12.55 4.1 1.52 5.83L0 24l6.33-1.66A11.99 11.99 0 0 0 12 24c6.63 0 12-5.37 12-12 0-3.2-1.25-6.11-3.28-8.28zM12 22.01c-1.86 0-3.59-.52-5.07-1.42l-.36-.21-3.76.99.99-3.66-.24-.38A9.95 9.95 0 0 1 2 12c0-5.52 4.48-10 10-10s10 4.48 10 10-4.48 10-10 10zm5.4-7.49c-.3-.15-1.77-.87-2.04-.97-.28-.1-.48-.15-.69.15-.21.3-.8.98-.98 1.18-.18.2-.36.22-.66.08-.3-.15-1.27-.47-2.42-1.48-.89-.79-1.49-1.77-1.67-2.07-.17-.3-.02-.46.13-.61.13-.14.3-.36.45-.54.15-.18.2-.3.3-.5.1-.2.05-.38-.02-.53-.08-.15-.69-1.67-.95-2.29-.25-.6-.5-.52-.69-.53-.18-.01-.38-.01-.58-.01-.2 0-.53.08-.81.38-.28.3-1.06 1.03-1.06 2.51 0 1.48 1.08 2.91 1.23 3.12.15.21 2.14 3.27 5.18 4.57.73.32 1.3.51 1.74.65.73.23 1.39.2 1.91.12.58-.09 1.77-.73 2.02-1.44.25-.71.25-1.32.18-1.44-.07-.12-.26-.2-.56-.35z" />
    </svg>
  );
}

function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

function buildLocalizedPostPath(slug: string, locale: string) {
  const path = `/blog/${slug}`;
  const prefix =
    routing.localePrefix === "as-needed" && locale === routing.defaultLocale
      ? ""
      : `/${locale}`;
  return `${prefix}${path}`;
}

function useAbsolutePostUrl(slug: string) {
  const locale = useLocale();
  const [url, setUrl] = useState("");

  useEffect(() => {
    const path = buildLocalizedPostPath(slug, locale);
    // Absolute URL needs `window.location.origin`; empty on SSR to avoid hydration mismatch.
    // eslint-disable-next-line react-hooks/set-state-in-effect -- sync URL after mount only
    setUrl(`${window.location.origin}${path}`);
  }, [slug, locale]);

  return url;
}

interface PostShareButtonsProps {
  title: string;
  slug: string;
  /** Tighter layout for blog cards */
  compact?: boolean;
  className?: string;
}

export function PostShareButtons({ title, slug, compact = false, className }: PostShareButtonsProps) {
  const t = useTranslations("Blog");
  const shareUrl = useAbsolutePostUrl(slug);
  const iconClass = compact ? "size-3.5" : "size-4";
  const btnSize = compact ? "icon-xs" : "icon-sm";

  const shareText = `${title}\n${shareUrl}`;

  const whatsappHref = shareUrl
    ? `https://wa.me/?text=${encodeURIComponent(shareText)}`
    : undefined;
  const facebookHref = shareUrl
    ? `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`
    : undefined;

  const copyLink = async () => {
    if (!shareUrl) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast.success(t("linkCopied"));
    } catch {
      toast.error(t("copyFailed"));
    }
  };

  const baseBtn = cn(
    buttonVariants({ variant: "ghost", size: btnSize }),
    "text-muted-foreground hover:text-foreground",
    !shareUrl && "pointer-events-none opacity-50"
  );

  return (
    <div
      className={cn("inline-flex items-center gap-0.5", className)}
      onClick={(e) => e.stopPropagation()}
      role="group"
      aria-label={t("shareGroup")}
    >
      <a
        href={whatsappHref || undefined}
        target="_blank"
        rel="noopener noreferrer"
        className={baseBtn}
        aria-label={t("shareWhatsApp")}
        onClick={(e) => !shareUrl && e.preventDefault()}
      >
        <WhatsAppIcon className={iconClass} />
      </a>
      <a
        href={facebookHref || undefined}
        target="_blank"
        rel="noopener noreferrer"
        className={baseBtn}
        aria-label={t("shareFacebook")}
        onClick={(e) => !shareUrl && e.preventDefault()}
      >
        <FacebookIcon className={iconClass} />
      </a>
      <button
        type="button"
        className={baseBtn}
        onClick={() => void copyLink()}
        disabled={!shareUrl}
        aria-label={t("copyLink")}
      >
        <Copy className={iconClass} aria-hidden />
      </button>
    </div>
  );
}
