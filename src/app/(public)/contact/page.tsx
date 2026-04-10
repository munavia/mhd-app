"use client";

import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Mail, MapPin, Share2, Camera, Video } from "lucide-react";
import { contactSchema, type ContactFormData } from "@/lib/validations";
import { submitContactMessage } from "@/services/contactService";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
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
      toast.success("Thank you! We'll get back to you soon.");
      reset();
    } catch (err) {
      const message =
        err instanceof Error && err.message
          ? err.message
          : "Could not send your message. Please try again later.";
      toast.error(message);
    }
  };

  return (
    <>
      <Navbar />
      <main className="flex-1 pt-16">
        <section className="border-b border-border/40 bg-gradient-to-b from-primary/10 via-background to-background">
          <div className="container mx-auto px-4 py-14 md:py-20">
            <div className="mx-auto max-w-2xl text-center">
              <h1 className="font-heading text-4xl font-bold tracking-tight md:text-5xl">
                Contact Us
              </h1>
              <p className="mt-4 text-lg text-muted-foreground">
                We&apos;d love to hear from you. Send a message and our team will
                respond as soon as we can.
              </p>
            </div>
          </div>
        </section>

        <section className="py-14 md:py-20">
          <div className="container mx-auto px-4">
            <div className="grid gap-10 lg:grid-cols-2 lg:gap-12">
              <Card className="border-border/60 shadow-sm">
                <CardHeader>
                  <CardTitle className="font-heading text-2xl">Send a message</CardTitle>
                  <CardDescription>
                    Fill out the form below and we&apos;ll be in touch.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Name</Label>
                      <Input
                        id="name"
                        autoComplete="name"
                        aria-invalid={!!errors.name}
                        {...register("name")}
                      />
                      {errors.name && (
                        <p className="text-xs text-destructive">{errors.name.message}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        autoComplete="email"
                        aria-invalid={!!errors.email}
                        {...register("email")}
                      />
                      {errors.email && (
                        <p className="text-xs text-destructive">{errors.email.message}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="subject">Subject</Label>
                      <Input
                        id="subject"
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
                      <Label htmlFor="message">Message</Label>
                      <Textarea
                        id="message"
                        rows={6}
                        className="min-h-[140px] resize-y"
                        aria-invalid={!!errors.message}
                        {...register("message")}
                      />
                      {errors.message && (
                        <p className="text-xs text-destructive">
                          {errors.message.message}
                        </p>
                      )}
                    </div>
                    <Button type="submit" className="w-full sm:w-auto" disabled={isSubmitting}>
                      {isSubmitting ? "Sending…" : "Send message"}
                    </Button>
                  </form>
                </CardContent>
              </Card>

              <div className="flex flex-col gap-6">
                <Card className="border-border/60 bg-muted/20">
                  <CardHeader>
                    <CardTitle className="font-heading text-xl">Get in touch</CardTitle>
                    <CardDescription>Other ways to reach the ministry</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-5">
                    <div className="flex gap-3">
                      <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <Mail className="size-5" aria-hidden />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">Email</p>
                        <a
                          href="mailto:hello@ministry.example"
                          className="text-sm text-primary underline-offset-4 hover:underline"
                        >
                          hello@ministry.example
                        </a>
                        <p className="mt-1 text-xs text-muted-foreground">
                          Replace with your ministry email when ready.
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <MapPin className="size-5" aria-hidden />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">Location</p>
                        <p className="text-sm text-muted-foreground">
                          Serving our global community online. Physical address
                          coming soon.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-border/60">
                  <CardHeader>
                    <CardTitle className="font-heading text-xl">Follow along</CardTitle>
                    <CardDescription>Social links (placeholders)</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      <Link
                        href="#"
                        aria-label="Facebook (placeholder)"
                        className={cn(
                          buttonVariants({ variant: "outline", size: "sm" }),
                          "gap-2"
                        )}
                      >
                        <Share2 className="size-4" />
                        Facebook
                      </Link>
                      <Link
                        href="#"
                        aria-label="Instagram (placeholder)"
                        className={cn(
                          buttonVariants({ variant: "outline", size: "sm" }),
                          "gap-2"
                        )}
                      >
                        <Camera className="size-4" />
                        Instagram
                      </Link>
                      <Link
                        href="#"
                        aria-label="YouTube (placeholder)"
                        className={cn(
                          buttonVariants({ variant: "outline", size: "sm" }),
                          "gap-2"
                        )}
                      >
                        <Video className="size-4" />
                        YouTube
                      </Link>
                    </div>
                    <p className="mt-3 text-xs text-muted-foreground">
                      Update these links in the code when your profiles are live.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
