"use client";

import { useEffect } from "react";
import { useParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const params = useParams();
  const locale = typeof params?.locale === "string" ? params.locale : "en";
  const t = useTranslations("Error");

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4" lang={locale}>
      <div className="max-w-md text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10 text-destructive">
          <AlertTriangle className="h-8 w-8" aria-hidden />
        </div>
        <h2 className="mb-2 text-2xl font-bold">{t("title")}</h2>
        <p className="mb-6 text-muted-foreground">
          {t("description")}
        </p>
        <Button onClick={reset} size="lg">
          {t("tryAgain")}
        </Button>
      </div>
    </div>
  );
}
