"use client";

import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Mail, MapPin, Phone, Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { contactSchema, type ContactFormData } from "@/lib/validations";
import { submitContactMessage } from "@/services/contactService";
import { MINISTRY_CONTACT } from "@/lib/ministryContact";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { PageHero } from "@/components/layout/PageHero";
import { heroImages } from "@/lib/heroImages";
import { SocialLinks } from "@/components/social/SocialLinks";
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

export default function ContactPage() {
  const t = useTranslations("Contact");
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
    defaultValues: { name: "", email: "", subject: "", message: "" },
  });

  const onSubmit = async (data: ContactFormData) => {
    try {
      await submitContactMessage(data);
      toast.success(t("toastSuccess"));
      reset();
    } catch (err) {
      const message =
        err instanceof Error && err.message
          ? err.message
          : t("toastError");
      toast.error(message);
    }
  };

  return (
    <>
      <Navbar />
      <main className="flex-1 pt-16">
        <PageHero imageSrc={heroImages.contact}>
          <div className="mx-auto max-w-2xl text-center">
            <h1 className="font-heading text-4xl font-bold tracking-tight md:text-5xl">
              {t("pageTitle")}
            </h1>
            <p className="mt-4 text-lg text-foreground/84 dark:text-zinc-200">
              {t("pageSubtitle")}
            </p>
          </div>
        </PageHero>

        <section className="py-14 md:py-20">
          <div className="container mx-auto px-4">
            <div className="grid gap-10 lg:grid-cols-2 lg:gap-12">
              <Card className="border-border/60 shadow-sm">
                <CardHeader>
                  <CardTitle className="font-heading text-2xl">
                    {t("formTitle")}
                  </CardTitle>
                  <CardDescription>
                    {t("formDesc")}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">{t("name")}</Label>
                      <Input
                        id="name"
                        autoComplete="name"
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
                      <Label htmlFor="email">{t("email")}</Label>
                      <Input
                        id="email"
                        type="email"
                        autoComplete="email"
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
                      <Label htmlFor="subject">{t("subject")}</Label>
                      <Input
                        id="subject"
                        disabled={isSubmitting}
                        aria-invalid={!!errors.subject}
                        {...register("subject")}
                      />
                      {errors.subject && (
                        <p className="text-xs text-destructive">
                          {errors.subject.message}
                        </p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="message">{t("message")}</Label>
                      <Textarea
                        id="message"
                        rows={6}
                        className="min-h-[140px] resize-y"
                        disabled={isSubmitting}
                        aria-invalid={!!errors.message}
                        {...register("message")}
                      />
                      {errors.message && (
                        <p className="text-xs text-destructive">
                          {errors.message.message}
                        </p>
                      )}
                    </div>
                    <Button
                      type="submit"
                      className="w-full gap-2 sm:w-auto"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <Loader2 className="size-4 animate-spin" aria-hidden />
                      ) : null}
                      {isSubmitting ? t("sending") : t("send")}
                    </Button>
                  </form>
                </CardContent>
              </Card>

              <ContactSidebar />
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

function ContactSidebar() {
  const t = useTranslations("Contact");
  return (
    <div className="flex flex-col gap-6">
      <Card className="border-border/60 bg-muted/20">
        <CardHeader>
          <CardTitle className="font-heading text-xl">{t("infoTitle")}</CardTitle>
          <CardDescription>{t("infoSubtitle")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-0 divide-y divide-border/60">
          <div className="flex gap-3 py-4 first:pt-0">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-muted text-foreground">
              <MapPin className="size-5" aria-hidden />
            </div>
            <div>
              <p className="text-sm text-foreground">
                {MINISTRY_CONTACT.addressLines.join(", ")}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">{t("addressLabel")}</p>
            </div>
          </div>
          <div className="flex gap-3 py-4">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-muted text-foreground">
              <Phone className="size-5" aria-hidden />
            </div>
            <div>
              <a
                href={MINISTRY_CONTACT.phoneHref}
                className="text-sm font-medium text-primary underline-offset-4 hover:underline"
              >
                {MINISTRY_CONTACT.phoneDisplay}
              </a>
              <p className="mt-1 text-xs text-muted-foreground">{t("mobileLabel")}</p>
            </div>
          </div>
          <div className="flex gap-3 py-4 last:pb-0">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-muted text-foreground">
              <Mail className="size-5" aria-hidden />
            </div>
            <div>
              <a
                href={`mailto:${MINISTRY_CONTACT.email}`}
                className="break-all text-sm font-medium text-primary underline-offset-4 hover:underline"
              >
                {MINISTRY_CONTACT.email}
              </a>
              <p className="mt-1 text-xs text-muted-foreground">{t("emailLabel")}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/60">
        <CardHeader>
          <CardTitle className="font-heading text-xl">{t("followTitle")}</CardTitle>
          <CardDescription>{t("followSubtitle")}</CardDescription>
        </CardHeader>
        <CardContent>
          <SocialLinks variant="inline" />
        </CardContent>
      </Card>
    </div>
  );
}
