"use client";

import { useTranslations } from "next-intl";
import { Target, Eye } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { SectionWrapper } from "@/components/shared/SectionWrapper";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function AboutPage() {
  const t = useTranslations("About");

  return (
    <>
      <Navbar />
      <main className="flex-1 pt-16">
        <section className="relative overflow-hidden border-b border-border/40 bg-gradient-to-b from-primary/10 via-background to-background">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_50%_-10%,hsl(var(--primary)/0.12),transparent)]" />
          <div className="container relative mx-auto px-4 py-16 md:py-24">
            <div className="mx-auto max-w-3xl text-center">
              <h1 className="font-heading text-4xl font-bold tracking-tight text-foreground md:text-5xl">
                {t("title")}
              </h1>
              <p className="mt-4 text-lg text-muted-foreground md:text-xl">
                {t("subtitle")}
              </p>
            </div>
          </div>
        </section>

        <SectionWrapper className="bg-background">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-3xl">
              <Card className="border-border/60 bg-card/90 shadow-sm backdrop-blur-sm">
                <CardHeader>
                  <div className="mb-2 flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Target className="size-7" aria-hidden />
                  </div>
                  <CardTitle className="font-heading text-2xl md:text-3xl">
                    {t("missionTitle")}
                  </CardTitle>
                  <CardDescription className="sr-only">
                    {t("missionSr")}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-base leading-relaxed text-muted-foreground md:text-lg">
                    {t("missionBody")}
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </SectionWrapper>

        <SectionWrapper className="border-t border-border/40 bg-muted/20">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-3xl">
              <Card className="border-border/60 bg-card/90 shadow-sm backdrop-blur-sm">
                <CardHeader>
                  <div className="mb-2 flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Eye className="size-7" aria-hidden />
                  </div>
                  <CardTitle className="font-heading text-2xl md:text-3xl">
                    {t("visionTitle")}
                  </CardTitle>
                  <CardDescription className="sr-only">
                    {t("visionSr")}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-base leading-relaxed text-muted-foreground md:text-lg">
                    {t("visionBody")}
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </SectionWrapper>
      </main>
      <Footer />
    </>
  );
}
