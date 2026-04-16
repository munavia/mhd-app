"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Loader2, Play } from "lucide-react";
import { listSermonsOrdered } from "@/services/sermonService";
import { youtubeEmbedUrl } from "@/lib/youtube";
import type { Sermon } from "@/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { SectionWrapper } from "@/components/shared/SectionWrapper";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export function SermonsSection() {
  const t = useTranslations("Home");
  const [sermons, setSermons] = useState<Sermon[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Sermon | null>(null);
  const [iframeLoaded, setIframeLoaded] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const data = await listSermonsOrdered();
      setSermons(data);
    } catch {
      setSermons([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (selected) setIframeLoaded(false);
  }, [selected]);

  if (!loading && sermons.length === 0) return null;

  return (
    <>
      <SectionWrapper className="bg-background">
        <div className="container mx-auto px-4">
          <h2 className="font-heading text-center text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            {t("sermonsTitle")}
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-center text-muted-foreground md:text-lg">
            {t("sermonsSubtitle")}
          </p>

          {loading ? (
            <ul className="mt-12 grid list-none gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <li key={i} className="space-y-3">
                  <Skeleton className="aspect-video w-full rounded-xl" />
                  <Skeleton className="h-6 w-4/5" />
                  <Skeleton className="h-4 w-1/2" />
                </li>
              ))}
            </ul>
          ) : (
            <ul className="mt-12 grid list-none gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {sermons.map((s, index) => (
                <li key={s.id}>
                  <button
                    type="button"
                    onClick={() => setSelected(s)}
                    className="group w-full text-left"
                    aria-label={t("openSermon", { title: s.title })}
                  >
                    <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-border/60 bg-muted shadow-sm ring-1 ring-foreground/5 transition hover:border-primary/40 hover:shadow-md">
                      {s.thumbnailUrl ? (
                        <Image
                          src={s.thumbnailUrl}
                          alt=""
                          fill
                          priority={index === 0}
                          className="object-cover transition duration-300 group-hover:scale-[1.02]"
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        />
                      ) : null}
                      <span className="absolute inset-0 flex items-center justify-center bg-black/25 transition group-hover:bg-black/35">
                        <span className="flex size-14 items-center justify-center rounded-full bg-white/95 text-primary shadow-lg ring-2 ring-white/80">
                          <Play
                            className="size-7 translate-x-0.5 fill-primary text-primary"
                            aria-hidden
                          />
                        </span>
                      </span>
                    </div>
                    <h3 className="font-heading mt-4 text-lg font-semibold text-foreground">
                      {s.title}
                    </h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {s.speaker}
                    </p>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </SectionWrapper>

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
                <DialogTitle className="text-center text-xl sm:text-2xl">
                  {selected.title}
                </DialogTitle>
              </DialogHeader>
              <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-muted">
                {!iframeLoaded && (
                  <div className="absolute inset-0 z-10 flex items-center justify-center bg-muted">
                    <Loader2 className="size-10 animate-spin text-muted-foreground" />
                  </div>
                )}
                <iframe
                  title={selected.title}
                  src={youtubeEmbedUrl(selected.videoId)}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                  className={cn(
                    "absolute inset-0 h-full w-full border-0",
                    !iframeLoaded && "opacity-0"
                  )}
                  onLoad={() => setIframeLoaded(true)}
                />
              </div>
              <p className="text-center text-sm text-muted-foreground">
                {selected.speaker}
              </p>
            </>
          ) : null}
        </DialogContent>
      </Dialog>
    </>
  );
}
