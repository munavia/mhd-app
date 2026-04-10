import type { Metadata } from "next";
import {
  Building2,
  HeartHandshake,
  Landmark,
  Sparkles,
  Users,
  Zap,
  Gift,
  CalendarHeart,
  Sprout,
} from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Give",
};

const whyPartner = [
  {
    icon: Sparkles,
    title: "Transform Lives",
    description:
      "Your generosity helps us share the gospel of healing and deliverance with those who need it most—online and around the world.",
  },
  {
    icon: Users,
    title: "Build Community",
    description:
      "Partners strengthen our fellowship: prayer, teaching, and encouragement that unite believers across every border.",
  },
  {
    icon: Zap,
    title: "Empower Others",
    description:
      "Every gift equips resources, outreach, and care so people can grow in faith and walk in lasting freedom.",
  },
] as const;

const waysToPartner = [
  {
    icon: Gift,
    title: "One-Time Gift",
    description:
      "Make a single contribution today and plant a seed toward spiritual transformation and practical ministry impact.",
  },
  {
    icon: HeartHandshake,
    title: "Monthly Partnership",
    description:
      "Join as a monthly partner for steady support that sustains teaching, community, and pastoral care all year long.",
  },
  {
    icon: CalendarHeart,
    title: "Special Projects",
    description:
      "Designate your giving toward initiatives such as events, outreach, or resource development as announced by the ministry.",
  },
] as const;

export default function GivePage() {
  return (
    <>
      <Navbar />
      <main className="flex-1 pt-16">
        <section className="relative overflow-hidden border-b border-border/40 bg-gradient-to-br from-primary/15 via-background to-accent/5">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_0%,hsl(var(--primary)/0.18),transparent)]" />
          <div className="container relative mx-auto px-4 py-16 md:py-24">
            <div className="mx-auto max-w-3xl text-center">
              <h1 className="font-heading text-4xl font-bold tracking-tight text-foreground md:text-5xl">
                Partner with Purpose: Ignite Transformation Together!
              </h1>
              <p className="mt-6 text-lg leading-relaxed text-muted-foreground md:text-xl">
                When you give, you help us steward a sacred online space for
                healing, deliverance, and spiritual growth. Your partnership
                extends hope, disciples believers, and carries the ministry
                forward in faith and love.
              </p>
            </div>
          </div>
        </section>

        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4">
            <div className="mx-auto mb-12 max-w-2xl text-center">
              <h2 className="font-heading text-3xl font-bold md:text-4xl">Why Partner</h2>
              <p className="mt-3 text-muted-foreground">
                Three ways your generosity multiplies in the kingdom—and in
                people&apos;s lives.
              </p>
            </div>
            <ul className="grid gap-6 md:grid-cols-3">
              {whyPartner.map(({ icon: Icon, title, description }) => (
                <li key={title}>
                  <Card className="h-full border-border/60 bg-card/80 shadow-sm transition-shadow hover:shadow-md">
                    <CardHeader>
                      <div className="mb-2 flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                        <Icon className="size-6" aria-hidden />
                      </div>
                      <CardTitle className="font-heading text-xl">{title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="text-sm leading-relaxed">
                        {description}
                      </CardDescription>
                    </CardContent>
                  </Card>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="border-y border-border/40 bg-muted/25 py-16 md:py-24">
          <div className="container mx-auto px-4">
            <div className="mx-auto mb-12 max-w-2xl text-center">
              <h2 className="font-heading text-3xl font-bold md:text-4xl">Ways to Partner</h2>
              <p className="mt-3 text-muted-foreground">
                Choose the rhythm of giving that fits your heart and capacity.
              </p>
            </div>
            <ul className="grid gap-6 md:grid-cols-3">
              {waysToPartner.map(({ icon: Icon, title, description }) => (
                <li key={title}>
                  <Card className="h-full border-border/60 bg-card shadow-sm transition-shadow hover:shadow-md">
                    <CardHeader>
                      <div className="mb-2 flex size-12 items-center justify-center rounded-full bg-accent/15 text-accent-foreground">
                        <Icon className="size-6" aria-hidden />
                      </div>
                      <CardTitle className="font-heading text-xl">{title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="text-sm leading-relaxed">
                        {description}
                      </CardDescription>
                    </CardContent>
                  </Card>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-2xl">
              <Card className="overflow-hidden border-primary/20 bg-gradient-to-br from-card via-card to-primary/5 ring-1 ring-primary/15">
                <CardHeader className="border-b border-border/50 bg-muted/30">
                  <div className="flex items-center gap-3">
                    <div className="flex size-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Landmark className="size-5" aria-hidden />
                    </div>
                    <div>
                      <CardTitle className="font-heading text-xl md:text-2xl">
                        Bank details
                      </CardTitle>
                      <CardDescription>
                        Transfer directly to our ministry account
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4 pt-6">
                  <div className="grid gap-3 rounded-lg border border-border/60 bg-background/80 p-4 text-sm">
                    <div className="flex items-start gap-2">
                      <Building2 className="mt-0.5 size-4 shrink-0 text-primary" />
                      <div>
                        <p className="font-medium text-foreground">Bank Name</p>
                        <p className="text-muted-foreground">Barclays</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="mt-0.5 flex size-4 shrink-0 items-center justify-center font-mono text-xs text-primary">
                        #
                      </span>
                      <div>
                        <p className="font-medium text-foreground">Sort code</p>
                        <p className="font-mono text-muted-foreground">20 02 25</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="mt-0.5 flex size-4 shrink-0 items-center justify-center font-mono text-xs text-primary">
                        #
                      </span>
                      <div>
                        <p className="font-medium text-foreground">Account</p>
                        <p className="font-mono text-muted-foreground">93374408</p>
                      </div>
                    </div>
                    <div className="border-t border-border/50 pt-3">
                      <p className="font-medium text-foreground">International</p>
                      <p className="mt-1 font-mono text-sm text-muted-foreground">
                        IBAN: GB15UKB20022593374408
                      </p>
                      <p className="font-mono text-sm text-muted-foreground">
                        SWIFT/BIC: BUKBGB22
                      </p>
                    </div>
                  </div>
                  <Card className="border-dashed border-primary/25 bg-primary/5">
                    <CardContent className="flex gap-3 pt-4">
                      <Sprout className="size-5 shrink-0 text-primary" aria-hidden />
                      <p className="text-sm leading-relaxed text-muted-foreground">
                        Every dollar you contribute is a seed sown into the fertile
                        ground of spiritual transformation...
                      </p>
                    </CardContent>
                  </Card>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
