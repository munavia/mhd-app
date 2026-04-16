"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { SectionWrapper } from "@/components/shared/SectionWrapper";
import { FeatureCarousel } from "@/components/home/FeatureCarousel";
import { ProgramsLivestreamsSection } from "@/components/events/ProgramsLivestreamsSection";
import { SermonsSection } from "@/components/sermons/SermonsSection";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import {
  Sparkles,
  Leaf,
  Users,
  BookOpen,
  Calendar,
  Handshake,
  Star,
  Flame,
  Heart,
  ArrowRight,
  Church,
} from "lucide-react";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.08 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] as const },
  },
};

export default function HomePage() {
  const t = useTranslations("Home");

  const featureCards = useMemo(
    () =>
      [
        { icon: Sparkles, titleKey: "f1Title" as const, descKey: "f1Desc" as const },
        { icon: Leaf, titleKey: "f2Title" as const, descKey: "f2Desc" as const },
        { icon: Users, titleKey: "f3Title" as const, descKey: "f3Desc" as const },
        { icon: BookOpen, titleKey: "f4Title" as const, descKey: "f4Desc" as const },
        { icon: Calendar, titleKey: "f5Title" as const, descKey: "f5Desc" as const },
        { icon: Handshake, titleKey: "f6Title" as const, descKey: "f6Desc" as const },
      ] as const,
    []
  );

  const ctaColumns = useMemo(
    () =>
      [
        {
          icon: Church,
          titleKey: "ctaJoinTitle" as const,
          descKey: "ctaJoinDesc" as const,
          labelKey: "ctaJoinLabel" as const,
          href: "/signup",
        },
        {
          icon: Heart,
          titleKey: "ctaPrayTitle" as const,
          descKey: "ctaPrayDesc" as const,
          labelKey: "ctaPrayLabel" as const,
          href: "/prayer-request",
        },
        {
          icon: Star,
          titleKey: "ctaGiveTitle" as const,
          descKey: "ctaGiveDesc" as const,
          labelKey: "ctaGiveLabel" as const,
          href: "/give",
        },
      ] as const,
    []
  );

  return (
    <>
      <Navbar />
      <main className="flex-1">
        <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-b from-primary/10 via-background to-background pt-16">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,hsl(var(--primary)/0.15),transparent)]" />
          <div className="container relative z-10 mx-auto px-4 py-20 md:py-28">
            <motion.div
              className="mx-auto max-w-3xl text-center"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
              <motion.h1
                variants={itemVariants}
                className="font-heading text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl md:leading-[1.1]"
              >
                {t("heroTitle")}
              </motion.h1>
              <motion.p
                variants={itemVariants}
                className="mt-4 text-lg font-medium text-primary md:text-xl"
              >
                {t("heroSubtitle")}
              </motion.p>
              <motion.p
                variants={itemVariants}
                className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground md:text-xl"
              >
                {t("heroBody")}
              </motion.p>
              <motion.div
                variants={itemVariants}
                className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
              >
                <Button
                  size="lg"
                  className="min-w-[160px] gap-2"
                  nativeButton={false}
                  render={(props) => <Link href="/signup" {...props} />}
                >
                  {t("joinUs")}
                  <ArrowRight className="size-4" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="min-w-[160px]"
                  nativeButton={false}
                  render={(props) => (
                    <Link href="/prayer-request" {...props} />
                  )}
                >
                  {t("prayerRequest")}
                </Button>
              </motion.div>
            </motion.div>
          </div>
        </section>

        <SectionWrapper className="bg-background">
          <div className="container mx-auto max-w-6xl px-4">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            >
              <FeatureCarousel cards={featureCards} />
            </motion.div>
          </div>
        </SectionWrapper>

        <SectionWrapper className="border-y border-border/40 bg-muted/20">
          <div className="container mx-auto px-4">
            <motion.div
              className="grid grid-cols-1 gap-10 md:grid-cols-3 md:gap-8"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-80px" }}
              variants={containerVariants}
            >
              {ctaColumns.map(
                ({ icon: Icon, titleKey, descKey, labelKey, href }) => (
                <motion.div
                  key={titleKey}
                  variants={itemVariants}
                  className="flex flex-col items-center text-center"
                >
                  <div className="mb-5 flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Icon className="size-7" aria-hidden />
                  </div>
                  <h3 className="font-heading text-xl font-bold">{t(titleKey)}</h3>
                  <p className="mt-3 max-w-xs text-sm leading-relaxed text-muted-foreground">
                    {t(descKey)}
                  </p>
                  <Button
                    className="mt-6"
                    nativeButton={false}
                    render={(props) => <Link href={href} {...props} />}
                  >
                    {t(labelKey)}
                  </Button>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </SectionWrapper>

        <SermonsSection />

        <SectionWrapper className="pb-24 md:pb-32">
          <div className="container mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] as const }}
            >
              <Card className="overflow-hidden border-0 bg-gradient-to-br from-primary/20 via-primary/5 to-background ring-1 ring-primary/20">
                <CardContent className="flex flex-col items-center px-6 py-14 text-center md:px-12 md:py-16">
                  <div className="mb-6 flex size-16 items-center justify-center rounded-full bg-primary/15 text-primary">
                    <Flame className="size-8" aria-hidden />
                  </div>
                  <h2 className="font-heading text-3xl font-bold tracking-tight md:text-4xl">
                    {t("finalTitle")}
                  </h2>
                  <p className="mx-auto mt-5 max-w-2xl text-muted-foreground md:text-lg">
                    {t("finalBody")}
                  </p>
                  <Button
                    size="lg"
                    className="mt-10 gap-2"
                    nativeButton={false}
                    render={(props) => <Link href="/signup" {...props} />}
                  >
                    {t("finalCta")}
                    <ArrowRight className="size-4" />
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </SectionWrapper>

        <SectionWrapper
          id="programs"
          className="border-t border-border/40 bg-gradient-to-b from-primary/10 via-background to-muted/20"
        >
          <div className="container mx-auto px-4">
            <ProgramsLivestreamsSection />
          </div>
        </SectionWrapper>
      </main>
      <Footer />
    </>
  );
}
