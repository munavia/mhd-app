"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Calendar } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ProgramsLivestreamsSection } from "@/components/events/ProgramsLivestreamsSection";
import { UpcomingEventsSection } from "@/components/events/UpcomingEventsSection";

export default function EventsPage() {
  const t = useTranslations("Events");

  return (
    <>
      <Navbar />
      <main className="flex-1 pt-16">
        <section className="bg-gradient-to-b from-primary/12 via-background to-muted/30 py-16">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-3xl text-center">
              <div className="mx-auto mb-6 flex size-16 items-center justify-center rounded-2xl bg-primary/10 text-primary ring-1 ring-primary/20">
                <Calendar className="size-8" aria-hidden />
              </div>
              <h1 className="font-heading text-3xl font-bold tracking-tight md:text-4xl">
                {t("title")}
              </h1>
              <p className="mt-4 text-base leading-relaxed text-muted-foreground">
                {t("description")}
              </p>
            </div>

            <div className="mx-auto mt-12 max-w-[100rem]">
              <UpcomingEventsSection />
            </div>

            <div className="mx-auto mt-10 flex justify-center">
              <Link
                href="/blog"
                className={cn(
                  buttonVariants({ size: "lg" }),
                  "gap-2 inline-flex"
                )}
              >
                {t("visitBlog")}
              </Link>
            </div>

            <ProgramsLivestreamsSection className="mt-16" />
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
