"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { listUpcomingEventsOrdered } from "@/services/upcomingEventService";
import type { UpcomingEvent } from "@/types";

export function UpcomingEventsSection() {
  const t = useTranslations("Events");
  const locale = useLocale();
  const [events, setEvents] = useState<UpcomingEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<UpcomingEvent | null>(null);

  const dateFormatter = useMemo(
    () =>
      new Intl.DateTimeFormat(locale, {
        dateStyle: "full",
        timeStyle: "short",
      }),
    [locale]
  );

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await listUpcomingEventsOrdered();
      setEvents(data);
    } catch {
      setEvents([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  return (
    <>
      <div className="mx-auto max-w-[100rem]">
        {loading ? (
          <ul className="grid list-none gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <li key={i} className="space-y-3">
                <Skeleton className="aspect-[16/10] w-full rounded-2xl" />
                <Skeleton className="h-6 w-4/5" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-1/3" />
              </li>
            ))}
          </ul>
        ) : events.length === 0 ? (
          <p className="text-center text-muted-foreground">{t("noEvents")}</p>
        ) : (
          <ul className="grid list-none gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {events.map((ev, index) => (
              <li key={ev.id}>
                <button
                  type="button"
                  onClick={() => setSelected(ev)}
                  className={cn(
                    "group w-full overflow-hidden rounded-2xl border border-border/60 bg-card text-left shadow-sm",
                    "ring-offset-background transition hover:border-primary/40 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  )}
                  aria-label={t("openEvent", { title: ev.title })}
                >
                  <div className="relative aspect-[16/10] w-full overflow-hidden bg-muted/40">
                    {ev.imageUrl ? (
                      <Image
                        src={ev.imageUrl}
                        alt={ev.title}
                        fill
                        unoptimized
                        priority={index === 0}
                        className="object-cover transition duration-300 group-hover:scale-[1.02]"
                        sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 34vw"
                      />
                    ) : null}
                  </div>
                  <div className="p-4">
                    <p className="font-heading text-lg font-semibold leading-snug text-foreground">
                      {ev.title}
                    </p>
                    <p className="mt-2 line-clamp-3 text-sm text-muted-foreground">
                      {ev.description}
                    </p>
                    <p className="mt-3 text-sm font-medium text-primary">
                      {dateFormatter.format(ev.startsAt.toDate())}
                    </p>
                    {ev.host ? (
                      <p className="mt-1 text-xs text-muted-foreground">
                        <span className="font-medium text-foreground/80">
                          {t("hostsLabel")}:{" "}
                        </span>
                        {ev.host}
                      </p>
                    ) : null}
                    {ev.location ? (
                      <p className="mt-1 text-xs text-muted-foreground">
                        <span className="font-medium text-foreground/80">
                          {t("locationLabel")}:{" "}
                        </span>
                        {ev.location}
                      </p>
                    ) : null}
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
                <div className="relative mb-4 aspect-[16/10] w-full overflow-hidden rounded-lg border border-border/60 bg-muted/40">
                  {selected.imageUrl ? (
                    <Image
                      src={selected.imageUrl}
                      alt={selected.title}
                      fill
                      unoptimized
                      className="object-cover"
                      sizes="(max-width: 1024px) 100vw, 896px"
                    />
                  ) : null}
                </div>
                <DialogTitle className="text-center text-xl sm:text-2xl">
                  {selected.title}
                </DialogTitle>
                <DialogDescription className="text-center text-base leading-relaxed">
                  {selected.description}
                </DialogDescription>
              </DialogHeader>

              <dl className="mt-4 space-y-3 text-sm">
                <div>
                  <dt className="font-medium text-foreground">
                    {t("eventWhen")}
                  </dt>
                  <dd className="text-muted-foreground">
                    {dateFormatter.format(selected.startsAt.toDate())}
                  </dd>
                </div>
                {selected.host ? (
                  <div>
                    <dt className="font-medium text-foreground">
                      {t("hostsLabel")}
                    </dt>
                    <dd className="text-muted-foreground">{selected.host}</dd>
                  </div>
                ) : null}
                {selected.location ? (
                  <div>
                    <dt className="font-medium text-foreground">
                      {t("locationLabel")}
                    </dt>
                    <dd className="text-muted-foreground">{selected.location}</dd>
                  </div>
                ) : null}
              </dl>
            </>
          ) : null}
        </DialogContent>
      </Dialog>
    </>
  );
}
