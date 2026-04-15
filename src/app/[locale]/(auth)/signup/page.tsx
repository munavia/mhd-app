"use client";

import { Suspense, useMemo, useState } from "react";
import { Link } from "@/i18n/navigation";
import { useSearchParams } from "next/navigation";
import { useRouter } from "@/i18n/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { ArrowLeft, Loader2, Check, X } from "lucide-react";
import { signupSchema, type SignupFormData } from "@/lib/validations";
import { signUp } from "@/lib/auth";
import { getSafeRedirectPath } from "@/lib/safeRedirect";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const PASSWORD_RULES = [
  { label: "At least 8 characters", test: (v: string) => v.length >= 8 },
  { label: "Uppercase letter", test: (v: string) => /[A-Z]/.test(v) },
  { label: "Lowercase letter", test: (v: string) => /[a-z]/.test(v) },
  { label: "Number", test: (v: string) => /[0-9]/.test(v) },
  { label: "Symbol (!@#$%...)", test: (v: string) => /[^a-zA-Z0-9]/.test(v) },
] as const;

const SIGNUP_ERROR_KEYS: Record<string, string> = {
  "auth/email-already-in-use": "signupErrors.emailInUse",
  "auth/invalid-email": "signupErrors.invalidEmail",
  "auth/weak-password": "signupErrors.weakPassword",
  "auth/popup-closed-by-user": "errors.popupClosed",
  "auth/unauthorized-domain": "errors.unauthorizedDomain",
};

function signupErrorKey(err: unknown): string {
  if (err && typeof err === "object" && "code" in err) {
    const code = String((err as { code?: string }).code);
    if (code in SIGNUP_ERROR_KEYS) return SIGNUP_ERROR_KEYS[code];
  }
  return "errors.generic";
}

function SignupPageContent() {
  const t = useTranslations("Auth");
  const router = useRouter();
  const searchParams = useSearchParams();
  const afterAuthPath = useMemo(
    () => getSafeRedirectPath(searchParams.get("redirect")),
    [searchParams]
  );
  const loginHref = afterAuthPath
    ? `/login?redirect=${encodeURIComponent(afterAuthPath)}`
    : "/login";
  const [showVerifyBanner, setShowVerifyBanner] = useState(false);
  const [verifiedEmail, setVerifiedEmail] = useState("");

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const passwordValue = watch("password", "");

  const onSubmit = async (data: SignupFormData) => {
    try {
      await signUp(data.name, data.email, data.password);
      setVerifiedEmail(data.email);
      setShowVerifyBanner(true);
      toast.success(t("accountCreated"));
    } catch (err) {
      toast.error(t(signupErrorKey(err)));
    }
  };

  if (showVerifyBanner) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-primary/5 via-background to-background">
        <Card className="w-full max-w-md border-border/60 shadow-lg shadow-primary/5">
          <CardHeader className="space-y-1">
            <Link
              href="/"
              className="mb-2 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
            >
              <ArrowLeft className="size-4 shrink-0" aria-hidden />
              {t("backHome")}
            </Link>
            <div className="space-y-1 text-center">
              <CardTitle className="font-heading text-2xl">{t("verifyTitle")}</CardTitle>
              <CardDescription>
                {t("verifyDesc", { email: verifiedEmail })}
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 text-center">
            <p className="text-sm text-muted-foreground">
              {t("verifyHint")}
            </p>
            <Button className="w-full" onClick={() => router.push(loginHref)}>
              {t("goSignIn")}
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-primary/5 via-background to-background">
      <Card className="w-full max-w-md border-border/60 shadow-lg shadow-primary/5">
        <CardHeader className="space-y-1">
          <Link
            href="/"
            className="mb-2 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="size-4 shrink-0" aria-hidden />
            {t("backHome")}
          </Link>
          <div className="space-y-1 text-center">
            <CardTitle className="font-heading text-2xl">{t("signupTitle")}</CardTitle>
            <CardDescription>
              {t("signupSubtitle")}
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">{t("fullName")}</Label>
              <Input
                id="name"
                autoComplete="name"
                placeholder={t("namePlaceholder")}
                disabled={isSubmitting}
                aria-invalid={!!errors.name}
                {...register("name")}
              />
              {errors.name && (
                <p className="text-xs text-destructive">{errors.name.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">{t("email")}</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                disabled={isSubmitting}
                aria-invalid={!!errors.email}
                {...register("email")}
              />
              {errors.email && (
                <p className="text-xs text-destructive">{errors.email.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">{t("password")}</Label>
              <Input
                id="password"
                type="password"
                autoComplete="new-password"
                disabled={isSubmitting}
                aria-invalid={!!errors.password}
                {...register("password")}
              />
              {errors.password && (
                <p className="text-xs text-destructive">{errors.password.message}</p>
              )}
              {passwordValue.length > 0 && (
                <ul className="mt-1.5 space-y-0.5">
                  {PASSWORD_RULES.map((rule) => {
                    const pass = rule.test(passwordValue);
                    return (
                      <li
                        key={rule.label}
                        className={`flex items-center gap-1.5 text-xs ${pass ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground"}`}
                      >
                        {pass ? (
                          <Check className="size-3" />
                        ) : (
                          <X className="size-3" />
                        )}
                        {rule.label}
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">{t("confirmPassword")}</Label>
              <Input
                id="confirmPassword"
                type="password"
                autoComplete="new-password"
                disabled={isSubmitting}
                aria-invalid={!!errors.confirmPassword}
                {...register("confirmPassword")}
              />
              {errors.confirmPassword && (
                <p className="text-xs text-destructive">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>
            <Button type="submit" className="w-full gap-2" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="size-4 animate-spin" />}
              {isSubmitting ? t("creating") : t("createAccount")}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col gap-2 border-t-0 pt-0">
          <p className="text-center text-sm text-muted-foreground">
            {t("haveAccount")}{" "}
            <Link
              href={loginHref}
              className="font-medium text-primary underline-offset-4 hover:underline"
            >
              {t("signIn")}
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}

function SignupPageFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary/5 via-background to-background p-4">
      <Loader2
        className="size-8 animate-spin text-primary"
        aria-label="Loading"
      />
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={<SignupPageFallback />}>
      <SignupPageContent />
    </Suspense>
  );
}
