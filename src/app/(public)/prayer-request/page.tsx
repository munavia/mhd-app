"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { Heart, Sparkles } from "lucide-react";
import { prayerRequestSchema, type PrayerRequestFormData } from "@/lib/validations";
import { submitPrayerRequest } from "@/services/prayerService";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function PrayerRequestPage() {
  const [submitted, setSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<PrayerRequestFormData>({
    resolver: zodResolver(prayerRequestSchema),
    defaultValues: { name: "", email: "", request: "" },
  });

  const onSubmit = async (data: PrayerRequestFormData) => {
    try {
      await submitPrayerRequest({
        name: data.name,
        request: data.request,
        email: data.email?.trim() ? data.email.trim() : undefined,
      });
      setSubmitted(true);
    } catch {
      toast.error("We couldn't submit your request. Please try again.");
    }
  };

  return (
    <>
      <Navbar />
      <main className="flex-1 pt-16">
        <section className="relative overflow-hidden border-b border-border/40 bg-gradient-to-br from-rose-500/10 via-primary/8 to-background">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_50%_-10%,hsl(var(--primary)/0.15),transparent)]" />
          <div className="container relative mx-auto px-4 py-14 md:py-20">
            <div className="mx-auto max-w-2xl text-center">
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] as const }}
                className="mx-auto mb-6 flex size-16 items-center justify-center rounded-full bg-primary/15 text-primary ring-4 ring-primary/10"
              >
                <Heart className="size-8 fill-primary/20" aria-hidden />
              </motion.div>
              <h1 className="font-heading text-4xl font-bold tracking-tight md:text-5xl">
                Prayer Request
              </h1>
              <p className="mt-4 text-lg text-muted-foreground">
                You are not alone. Share your heart with us—we believe in the power
                of prayer and the comfort of community standing with you in faith.
              </p>
            </div>
          </div>
        </section>

        <section className="py-14 md:py-20">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-xl">
              <AnimatePresence mode="wait">
                {submitted ? (
                  <motion.div
                    key="thanks"
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.4 }}
                  >
                    <Card className="overflow-hidden border-primary/20 bg-gradient-to-b from-card to-primary/5 shadow-lg ring-1 ring-primary/10">
                      <CardHeader className="text-center pb-2">
                        <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary">
                          <Sparkles className="size-7" aria-hidden />
                        </div>
                        <CardTitle className="font-heading text-2xl md:text-3xl">
                          Thank you
                        </CardTitle>
                        <CardDescription className="text-base text-muted-foreground">
                          Your request has been received. Our team and community will
                          lift you up in prayer. May you know peace, strength, and
                          the nearness of God today.
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="text-center pb-8">
                        <p className="text-sm text-muted-foreground">
                          &ldquo;Do not be anxious about anything, but in every
                          situation, by prayer and petition, with thanksgiving,
                          present your requests to God.&rdquo;
                        </p>
                        <p className="mt-2 text-xs font-medium text-primary">
                          Philippians 4:6 (NIV)
                        </p>
                      </CardContent>
                    </Card>
                  </motion.div>
                ) : (
                  <motion.div
                    key="form"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.35 }}
                  >
                    <Card className="border-border/60 shadow-md">
                      <CardHeader>
                        <CardTitle className="font-heading text-xl flex items-center gap-2">
                          <Heart className="size-5 text-primary shrink-0" aria-hidden />
                          Share your prayer need
                        </CardTitle>
                        <CardDescription>
                          Your details are handled with care. Email is optional if
                          you prefer to remain more private.
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                          <div className="space-y-2">
                            <Label htmlFor="prayer-name">Name</Label>
                            <Input
                              id="prayer-name"
                              autoComplete="name"
                              placeholder="How we may address you"
                              aria-invalid={!!errors.name}
                              {...register("name")}
                            />
                            {errors.name && (
                              <p className="text-xs text-destructive">
                                {errors.name.message}
                              </p>
                            )}
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="prayer-email">
                              Email <span className="text-muted-foreground">(optional)</span>
                            </Label>
                            <Input
                              id="prayer-email"
                              type="email"
                              autoComplete="email"
                              placeholder="For a reply, if you wish"
                              aria-invalid={!!errors.email}
                              {...register("email")}
                            />
                            {errors.email && (
                              <p className="text-xs text-destructive">
                                {errors.email.message}
                              </p>
                            )}
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="prayer-request">Prayer request</Label>
                            <Textarea
                              id="prayer-request"
                              rows={7}
                              className="min-h-[160px] resize-y"
                              placeholder="Share what's on your heart—we're praying with you."
                              aria-invalid={!!errors.request}
                              {...register("request")}
                            />
                            {errors.request && (
                              <p className="text-xs text-destructive">
                                {errors.request.message}
                              </p>
                            )}
                          </div>
                          <Button
                            type="submit"
                            className="w-full gap-2"
                            disabled={isSubmitting}
                          >
                            <Heart className="size-4" aria-hidden />
                            {isSubmitting ? "Submitting…" : "Submit prayer request"}
                          </Button>
                        </form>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
