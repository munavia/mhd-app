"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { Heart, Sparkles, Loader2, LogIn } from "lucide-react";
import { prayerRequestSchema, type PrayerRequestFormData } from "@/lib/validations";
import { submitPrayerRequest } from "@/services/prayerService";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

export default function PrayerRequestPage() {
  const t = useTranslations("PrayerRequest");
  const { user, isAuthenticated, hydrated } = useAuth();
  const [submitted, setSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<PrayerRequestFormData>({
    resolver: zodResolver(prayerRequestSchema),
    defaultValues: { name: "", email: "", request: "" },
  });

  useEffect(() => {
    if (!hydrated || !isAuthenticated || !user?.displayName?.trim()) return;
    if (getValues("name")?.trim()) return;
    reset({
      name: user.displayName.trim(),
      email: getValues("email"),
      request: getValues("request"),
    });
  }, [hydrated, isAuthenticated, user?.displayName, getValues, reset]);

  const onSubmit = async (data: PrayerRequestFormData) => {
    try {
      await submitPrayerRequest({
        name: data.name,
        request: data.request,
        email: data.email?.trim() ? data.email.trim() : undefined,
      });
      setSubmitted(true);
    } catch {
      toast.error(t("submitError"));
    }
  };

  const loginHref = "/login?redirect=%2Fprayer-request";
  const signupHref = "/signup?redirect=%2Fprayer-request";

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
                {t("title")}
              </h1>
              <p className="mt-4 text-lg text-muted-foreground">
                {t("subtitle")}
              </p>
            </div>
          </div>
        </section>

        <section className="py-14 md:py-20">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-xl">
              {!hydrated ? (
                <Card className="border-border/60 shadow-md">
                  <CardHeader>
                    <Skeleton className="h-7 w-48" />
                    <Skeleton className="h-4 w-full" />
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-40 w-full" />
                    <Skeleton className="h-10 w-full" />
                  </CardContent>
                </Card>
              ) : !isAuthenticated ? (
                <Card className="border-border/60 shadow-md">
                  <CardHeader className="text-center">
                    <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <LogIn className="size-7" aria-hidden />
                    </div>
                    <CardTitle className="font-heading text-2xl">
                      {t("gateTitle")}
                    </CardTitle>
                    <CardDescription className="text-base">
                      {t("gateDesc")}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex flex-col gap-3 sm:flex-row sm:justify-center">
                    <Link href={loginHref} className={cn(buttonVariants(), "gap-2")}>
                      <LogIn className="size-4" />
                      Sign in
                    </Link>
                    <Link
                      href={signupHref}
                      className={cn(buttonVariants({ variant: "outline" }))}
                    >
                      {t("createAccount")}
                    </Link>
                  </CardContent>
                </Card>
              ) : (
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
                            {t("thanksTitle")}
                          </CardTitle>
                          <CardDescription className="text-base text-muted-foreground">
                            {t("thanksDesc")}
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="text-center pb-8">
                          <p className="text-sm text-muted-foreground">
                            {t("verse")}
                          </p>
                          <p className="mt-2 text-xs font-medium text-primary">
                            {t("verseRef")}
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
                          <CardTitle className="flex items-center gap-2 font-heading text-xl">
                            <Heart className="size-5 shrink-0 text-primary" aria-hidden />
                            {t("formTitle")}
                          </CardTitle>
                          <CardDescription>
                            {t("formDesc")}
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                            <div className="space-y-2">
                              <Label htmlFor="prayer-name">{t("labelName")}</Label>
                              <Input
                                id="prayer-name"
                                autoComplete="name"
                                placeholder={t("namePlaceholder")}
                                disabled={isSubmitting}
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
                                {t("labelEmail")}{" "}
                                <span className="text-muted-foreground">({t("optional")})</span>
                              </Label>
                              <Input
                                id="prayer-email"
                                type="email"
                                autoComplete="email"
                                placeholder={t("emailPlaceholder")}
                                disabled={isSubmitting}
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
                              <Label htmlFor="prayer-request">{t("labelRequest")}</Label>
                              <Textarea
                                id="prayer-request"
                                rows={7}
                                className="min-h-[160px] resize-y"
                                placeholder={t("requestPlaceholder")}
                                disabled={isSubmitting}
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
                              {isSubmitting ? (
                                <Loader2 className="size-4 animate-spin" aria-hidden />
                              ) : (
                                <Heart className="size-4" aria-hidden />
                              )}
                              {isSubmitting ? t("submitting") : t("submit")}
                            </Button>
                          </form>
                        </CardContent>
                      </Card>
                    </motion.div>
                  )}
                </AnimatePresence>
              )}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
