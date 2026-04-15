"use client";

import { useEffect } from "react";
import { useLocale } from "next-intl";

const LANG_MAP: Record<string, string> = {
  en: "en",
  pt: "pt",
  es: "es",
};

/** Keeps <html lang> in sync with the URL locale (root layout is locale-agnostic). */
export function DocumentLang() {
  const locale = useLocale();

  useEffect(() => {
    document.documentElement.lang = LANG_MAP[locale] ?? locale;
  }, [locale]);

  return null;
}
