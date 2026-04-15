"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Calendar } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function EventsPage() {
  const t = useTranslations("Events");

  return (
    <>
      <Navbar />
      <main className="flex-1 pt-16">
        <section className="min-h-[70vh] flex items-center justify-center bg-gradient-to-b from-primary/12 via-background to-muted/30 py-16">
          <div className="container mx-auto px-4">
            <Card className="mx-auto max-w-lg border-border/60 bg-card/90 text-center shadow-lg backdrop-blur-sm">
              <CardHeader className="pb-2">
                <div className="mx-auto mb-4 flex size-16 items-center justify-center rounded-2xl bg-primary/10 text-primary ring-1 ring-primary/20">
                  <Calendar className="size-8" aria-hidden />
                </div>
                <CardTitle className="font-heading text-3xl md:text-4xl">
                  {t("title")}
                </CardTitle>
                <CardDescription className="text-base leading-relaxed pt-2">
                  {t("description")}
                </CardDescription>
              </CardHeader>
              <CardContent className="pb-10 pt-2">
                <Link
                  href="/blog"
                  className={cn(buttonVariants({ size: "lg" }), "gap-2 inline-flex")}
                >
                  {t("visitBlog")}
                </Link>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
