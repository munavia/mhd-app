"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { SectionWrapper } from "@/components/shared/SectionWrapper";
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

const featureCards = [
  {
    icon: Sparkles,
    title: "Embrace Divine Healing",
    description:
      "Experience the transformative power of faith and discover your path to wholeness through powerful teachings and timeless wisdom.",
  },
  {
    icon: Leaf,
    title: "Discover Your Path",
    description:
      "Embark on a journey of spiritual growth and personal transformation with practical guidance that illuminates your way.",
  },
  {
    icon: Users,
    title: "Global Community",
    description:
      "Join a supportive community of kindred spirits from around the world. Share experiences and celebrate victories together.",
  },
  {
    icon: BookOpen,
    title: "Empowering Resources",
    description:
      "Access inspirational articles, impactful videos, uplifting affirmations, and guided meditations for your daily life.",
  },
  {
    icon: Calendar,
    title: "Transformative Events",
    description:
      "Participate in virtual events and workshops designed to deepen your connection with the divine.",
  },
  {
    icon: Handshake,
    title: "Personalized Prayer",
    description:
      "Submit your prayer requests and let our community surround you with love, support, and intercession.",
  },
] as const;

const ctaColumns = [
  {
    icon: Church,
    title: "Join",
    description:
      "Become part of our fellowship and grow in faith alongside believers who walk this path with you.",
    href: "/signup",
    label: "Join Us",
  },
  {
    icon: Heart,
    title: "Pray",
    description:
      "Lift your burdens in prayer and invite our community to stand with you in faith and compassion.",
    href: "/prayer-request",
    label: "Prayer Request",
  },
  {
    icon: Star,
    title: "Give",
    description:
      "Support the ministry’s mission with a generous heart and help us reach more lives with hope.",
    href: "/give",
    label: "Give Today",
  },
] as const;

export default function HomePage() {
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
                Welcome to the Ministry of Healing and Deliverance
              </motion.h1>
              <motion.p
                variants={itemVariants}
                className="mt-4 text-lg font-medium text-primary md:text-xl"
              >
                Your Sanctuary of Spiritual Transformation
              </motion.p>
              <motion.p
                variants={itemVariants}
                className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground md:text-xl"
              >
                At the Ministry of Healing and Deliverance, we believe in the
                transformative power of faith, love, and spiritual connection.
                Step into our online sanctuary, a sacred space where healing
                miracles unfold, and lives are forever changed.
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
                  Join Us
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
                  Prayer Request
                </Button>
              </motion.div>
            </motion.div>
          </div>
        </section>

        <SectionWrapper className="bg-background">
          <div className="container mx-auto px-4">
            <motion.ul
              className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: "-60px" }}
              variants={containerVariants}
            >
              {featureCards.map(({ icon: Icon, title, description }) => (
                <motion.li key={title} variants={itemVariants}>
                  <Card className="h-full border-border/60 bg-card/80 shadow-sm backdrop-blur-sm transition-shadow hover:shadow-md">
                    <CardContent className="flex flex-col gap-4 pt-6">
                      <div className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                        <Icon className="size-6" aria-hidden />
                      </div>
                      <h3 className="text-lg font-bold text-foreground">
                        {title}
                      </h3>
                      <p className="text-sm leading-relaxed text-muted-foreground">
                        {description}
                      </p>
                    </CardContent>
                  </Card>
                </motion.li>
              ))}
            </motion.ul>
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
              {ctaColumns.map(({ icon: Icon, title, description, href, label }) => (
                <motion.div
                  key={title}
                  variants={itemVariants}
                  className="flex flex-col items-center text-center"
                >
                  <div className="mb-5 flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Icon className="size-7" aria-hidden />
                  </div>
                  <h3 className="font-heading text-xl font-bold">{title}</h3>
                  <p className="mt-3 max-w-xs text-sm leading-relaxed text-muted-foreground">
                    {description}
                  </p>
                  <Button
                    className="mt-6"
                    nativeButton={false}
                    render={(props) => <Link href={href} {...props} />}
                  >
                    {label}
                  </Button>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </SectionWrapper>

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
                    Ignite Your Spiritual Flame
                  </h2>
                  <p className="mx-auto mt-5 max-w-2xl text-muted-foreground md:text-lg">
                    Are you ready to ignite the flame within your soul? Step into
                    the Ministry of Healing and Deliverance – a sacred space
                    where miracles happen, hearts are healed, and spirits are set
                    free.
                  </p>
                  <Button
                    size="lg"
                    className="mt-10 gap-2"
                    nativeButton={false}
                    render={(props) => <Link href="/signup" {...props} />}
                  >
                    Begin Your Journey
                    <ArrowRight className="size-4" />
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </SectionWrapper>
      </main>
      <Footer />
    </>
  );
}
