"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export type FeatureCardDef = {
  icon: LucideIcon;
  titleKey:
    | "f1Title"
    | "f2Title"
    | "f3Title"
    | "f4Title"
    | "f5Title"
    | "f6Title";
  descKey:
    | "f1Desc"
    | "f2Desc"
    | "f3Desc"
    | "f4Desc"
    | "f5Desc"
    | "f6Desc";
};

type FeatureCarouselProps = {
  cards: readonly FeatureCardDef[];
};

/** Autoplay interval in milliseconds */
const AUTOPLAY_DELAY_MS = 5000;

export function FeatureCarousel({ cards }: FeatureCarouselProps) {
  const t = useTranslations("Home");

  const plugins = useMemo(
    () => [
      Autoplay({
        delay: AUTOPLAY_DELAY_MS,
        stopOnMouseEnter: true,
        stopOnInteraction: false,
        playOnInit: true,
      }),
    ],
    []
  );

  const [emblaRef, emblaApi] = useEmblaCarousel(
    {
      loop: true,
      align: "start",
      skipSnaps: false,
    },
    plugins
  );
  const [selectedIndex, setSelectedIndex] = useState(0);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on("reInit", onSelect);
    emblaApi.on("select", onSelect);
    return () => {
      emblaApi.off("reInit", onSelect);
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi, onSelect]);

  return (
    <div className="relative">
      <div className="overflow-hidden pb-1" ref={emblaRef}>
        <div className="flex touch-pan-y -ml-4">
          {cards.map(({ icon: Icon, titleKey, descKey }) => (
            <div
              key={titleKey}
              className="min-w-0 shrink-0 grow-0 basis-full pl-4 md:basis-1/2 lg:basis-1/3"
            >
              <Card className="h-full border-border/60 bg-card/80 shadow-sm backdrop-blur-sm transition-shadow hover:shadow-md">
                <CardContent className="flex flex-col gap-4 pt-6">
                  <div className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Icon className="size-6" aria-hidden />
                  </div>
                  <h3 className="text-lg font-bold text-foreground">
                    {t(titleKey)}
                  </h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {t(descKey)}
                  </p>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-8 flex flex-col items-center gap-6 sm:flex-row sm:justify-center sm:gap-8">
        <Button
          type="button"
          variant="outline"
          size="icon"
          className="shrink-0 rounded-full"
          onClick={scrollPrev}
          aria-label={t("carouselPrev")}
        >
          <ChevronLeft className="size-5" aria-hidden />
        </Button>

        <nav
          className="flex flex-wrap justify-center gap-2"
          aria-label={t("carouselDotsLabel")}
        >
          {cards.map((c, i) => (
            <button
              key={c.titleKey}
              type="button"
              aria-current={i === selectedIndex ? "true" : undefined}
              aria-label={t("carouselSlide", {
                current: i + 1,
                total: cards.length,
              })}
              className={cn(
                "size-2.5 rounded-full transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                i === selectedIndex
                  ? "bg-primary"
                  : "bg-muted-foreground/35 hover:bg-muted-foreground/55"
              )}
              onClick={() => emblaApi?.scrollTo(i)}
            />
          ))}
        </nav>

        <Button
          type="button"
          variant="outline"
          size="icon"
          className="shrink-0 rounded-full"
          onClick={scrollNext}
          aria-label={t("carouselNext")}
        >
          <ChevronRight className="size-5" aria-hidden />
        </Button>
      </div>
    </div>
  );
}
