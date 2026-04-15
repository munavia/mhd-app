"use client";

import { Languages } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { buttonVariants } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { usePathname, useRouter } from "@/i18n/navigation";
import { locales, type Locale } from "@/i18n/routing";

const LOCALE_LABELS: Record<Locale, string> = {
  en: "en",
  pt: "pt",
  es: "es",
};

export function LanguageSwitcher({ className }: { className?: string }) {
  const locale = useLocale() as Locale;
  const router = useRouter();
  const pathname = usePathname();
  const t = useTranslations("Language");

  function switchLocale(next: Locale) {
    router.replace(pathname, { locale: next });
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className={cn(
          buttonVariants({ variant: "ghost", size: "sm" }),
          "gap-1.5 px-2",
          className
        )}
        aria-label={t("menuLabel")}
      >
        <Languages className="size-4 shrink-0" aria-hidden />
        <span className="hidden text-xs font-semibold uppercase tabular-nums sm:inline">
          {locale}
        </span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[10rem]">
        {locales.map((value) => (
          <DropdownMenuItem
            key={value}
            className={cn(
              "cursor-pointer",
              locale === value && "bg-primary/10 font-medium text-primary"
            )}
            onClick={() => switchLocale(value)}
          >
            {t(LOCALE_LABELS[value])}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
