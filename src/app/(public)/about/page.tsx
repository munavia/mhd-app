import type { Metadata } from "next";
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

export const metadata: Metadata = {
  title: "About Us",
};

const missionText =
  "At the Ministry of Healing and Deliverance, our mission is to provide a sacred online space dedicated to fostering spiritual growth, healing, and deliverance. Rooted in the teachings of love, compassion, and faith, we aim to empower individuals on their journey towards wholeness, encouraging them to experience divine healing and deliverance from various life challenges. Through the dissemination of inspirational resources, transformative teachings, and a supportive community, we strive to be a beacon of hope, guiding people towards a life filled with spiritual abundance and freedom.";

const visionText =
  "Our vision is to create a global online sanctuary where individuals from all walks of life can find solace, restoration, and spiritual empowerment. We aspire to build a community that transcends geographical boundaries, fostering connections and unity among those seeking healing and deliverance. Through the Ministry of Healing and Deliverance website, we envision a world where people are transformed, equipped, and inspired to live purposeful lives, radiating the light of love and compassion. Together, we aim to build a resilient, compassionate, and spiritually awakened global family, grounded in the principles of divine healing and deliverance.";

export default function AboutPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1 pt-16">
        <section className="relative overflow-hidden border-b border-border/40 bg-gradient-to-b from-primary/10 via-background to-background">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_50%_-10%,hsl(var(--primary)/0.12),transparent)]" />
          <div className="container relative mx-auto px-4 py-16 md:py-24">
            <div className="mx-auto max-w-3xl text-center">
              <h1 className="font-heading text-4xl font-bold tracking-tight text-foreground md:text-5xl">
                About the Ministry
              </h1>
              <p className="mt-4 text-lg text-muted-foreground md:text-xl">
                Ministry of Healing and Deliverance — faith, compassion, and a
                global community walking together toward wholeness.
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
                    Mission Statement
                  </CardTitle>
                  <CardDescription className="sr-only">
                    Our mission as a ministry
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-base leading-relaxed text-muted-foreground md:text-lg">
                    {missionText}
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
                    Vision Statement
                  </CardTitle>
                  <CardDescription className="sr-only">
                    Our vision for the future
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-base leading-relaxed text-muted-foreground md:text-lg">
                    {visionText}
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
