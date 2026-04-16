"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { listProgramsOrdered } from "@/services/programService";
import type { Program } from "@/types";

type ProgramsLivestreamsSectionProps = {
  className?: string;
};

function externalUrl(href: string): string {
  const t = href.trim();
  if (!t) return "";
  if (/^https?:\/\//i.test(t)) return t;
  return `https://${t}`;
}

export function ProgramsLivestreamsSection({
  className,
}: ProgramsLivestreamsSectionProps) {
  const t = useTranslations("Events");
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Program | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await listProgramsOrdered();
      setPrograms(data);
    } catch {
      setPrograms([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  if (!loading && programs.length === 0) {
    return null;
  }

  return (
    <>
      <div className={cn("mx-auto max-w-[100rem] px-0 sm:px-2", className)}>
        <h2 className="font-heading text-center text-2xl font-semibold tracking-tight md:text-3xl">
          {t("programsTitle")}
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-center text-muted-foreground">
          {t("programsSubtitle")}
        </p>

        {loading ? (
          <ul className="mt-10 grid list-none gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <li key={i}>
                <Skeleton className="aspect-square w-full rounded-2xl" />
                <Skeleton className="mt-3 h-6 w-4/5" />
                <Skeleton className="mt-2 h-4 w-1/2" />
              </li>
            ))}
          </ul>
        ) : (
          <ul className="mt-10 grid list-none gap-6 sm:grid-cols-2 xl:grid-cols-3">
            {programs.map((event, index) => (
              <li key={event.id}>
                <button
                  type="button"
                  onClick={() => setSelected(event)}
                  className={cn(
                    "group w-full overflow-hidden rounded-2xl border border-border/60 bg-card text-left shadow-sm",
                    "ring-offset-background transition hover:border-primary/40 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  )}
                  aria-label={t("openDetails", { title: event.title })}
                >
                  <div className="relative aspect-square w-full overflow-hidden bg-muted/40">
                    {event.imageUrl ? (
                      <Image
                        src={event.imageUrl}
                        alt={event.title}
                        fill
                        unoptimized
                        priority={index === 0}
                        sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 34vw"
                        className="object-contain object-center transition duration-300 group-hover:scale-[1.02]"
                      />
                    ) : null}
                    <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
                    <div className="absolute inset-x-0 bottom-0 p-4 pt-12">
                      <p className="font-heading text-lg font-semibold leading-snug text-foreground">
                        {event.title}
                      </p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {event.scheduleShort}
                      </p>
                    </div>
                  </div>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <Dialog
        open={selected !== null}
        onOpenChange={(open) => {
          if (!open) setSelected(null);
        }}
      >
        <DialogContent
          className="max-h-[min(92vh,56rem)] w-[min(100vw-2rem,56rem)] max-w-[min(100vw-2rem,56rem)] overflow-y-auto p-5 sm:max-w-[min(100vw-2rem,56rem)] sm:p-6"
          showCloseButton
        >
          {selected ? (
            <>
              <DialogHeader>
                <div className="relative mb-4 aspect-square w-full overflow-hidden rounded-lg border border-border/60 bg-muted/40">
                  {selected.imageUrl ? (
                    <Image
                      src={selected.imageUrl}
                      alt={selected.title}
                      fill
                      unoptimized
                      className="object-contain object-center"
                      sizes="(max-width: 1024px) 100vw, 896px"
                    />
                  ) : null}
                </div>
                <DialogTitle className="text-center text-xl sm:text-2xl">
                  {selected.title}
                </DialogTitle>
                {selected.description ? (
                  <DialogDescription className="text-center text-base">
                    {selected.description}
                  </DialogDescription>
                ) : null}
              </DialogHeader>

              <dl className="mt-4 space-y-3 text-sm">
                <div>
                  <dt className="font-medium text-foreground">
                    {t("schedule")}
                  </dt>
                  <dd className="text-muted-foreground">{selected.schedule}</dd>
                </div>
                <div>
                  <dt className="font-medium text-foreground">{t("host")}</dt>
                  <dd className="text-muted-foreground">{selected.host}</dd>
                </div>
                <div>
                  <dt className="font-medium text-foreground">
                    {t("whereToWatch")}
                  </dt>
                  <dd className="text-muted-foreground">
                    {selected.platforms.join(" · ")}
                  </dd>
                </div>
                {(selected.contactPhone || selected.website) && (
                  <div>
                    <dt className="font-medium text-foreground">
                      {t("contact")}
                    </dt>
                    <dd className="space-y-1 text-muted-foreground">
                      {selected.contactPhone ? (
                        <a
                          href={`tel:${selected.contactPhone.replace(/\s/g, "")}`}
                          className="block font-medium text-primary underline underline-offset-4 hover:text-primary/90"
                        >
                          {selected.contactPhone}
                        </a>
                      ) : null}
                      {selected.website ? (
                        <a
                          href={externalUrl(selected.website)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block break-all font-medium text-primary underline underline-offset-4 hover:text-primary/90"
                        >
                          {selected.website}
                        </a>
                      ) : null}
                    </dd>
                  </div>
                )}
              </dl>
            </>
          ) : null}
        </DialogContent>
      </Dialog>
    </>
  );
}
