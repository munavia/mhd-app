"use client";

import { Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Link } from "@/i18n/navigation";
import { useSearchParams } from "next/navigation";
import { useRouter } from "@/i18n/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { ArrowLeft, Globe, Loader2 } from "lucide-react";
import { loginSchema, type LoginFormData } from "@/lib/validations";
import { signIn, signInWithGoogle, EmailNotVerifiedError } from "@/lib/auth";
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

const MAX_ATTEMPTS = 5;
const LOCKOUT_MS = 30 * 60 * 1000; // 30 minutes
const STORAGE_KEY = "mhd_login_attempts";

interface AttemptsState {
  count: number;
  lockedUntil: number | null;
}

function getAttempts(): AttemptsState {
  if (typeof window === "undefined") return { count: 0, lockedUntil: null };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { count: 0, lockedUntil: null };
    return JSON.parse(raw) as AttemptsState;
  } catch {
    return { count: 0, lockedUntil: null };
  }
}

function saveAttempts(state: AttemptsState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function clearAttempts() {
  localStorage.removeItem(STORAGE_KEY);
}

const AUTH_ERROR_KEYS: Record<string, string> = {
  "auth/invalid-credential": "errors.invalidCredential",
  "auth/wrong-password": "errors.invalidCredential",
  "auth/user-not-found": "errors.userNotFound",
  "auth/too-many-requests": "errors.tooManyRequests",
  "auth/popup-closed-by-user": "errors.popupClosed",
  "auth/unauthorized-domain": "errors.unauthorizedDomain",
};

function authErrorKey(err: unknown): string {
  if (err && typeof err === "object" && "code" in err) {
    const code = String((err as { code?: string }).code);
    if (code in AUTH_ERROR_KEYS) return AUTH_ERROR_KEYS[code];
  }
  return "errors.generic";
}

function LoginPageContent() {
  const t = useTranslations("Auth");
  const router = useRouter();
  const searchParams = useSearchParams();
  const afterAuthPath = useMemo(
    () => getSafeRedirectPath(searchParams.get("redirect")),
    [searchParams]
  );
  const signupHref = afterAuthPath
    ? `/signup?redirect=${encodeURIComponent(afterAuthPath)}`
    : "/signup";
  const [oauthLoading, setOauthLoading] = useState(false);
  const [lockoutRemaining, setLockoutRemaining] = useState<number>(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  useEffect(() => {
    const { lockedUntil } = getAttempts();
    if (lockedUntil && lockedUntil > Date.now()) {
      setLockoutRemaining(lockedUntil - Date.now());
      timerRef.current = setInterval(() => {
        const remaining = (lockedUntil ?? 0) - Date.now();
        if (remaining <= 0) {
          clearAttempts();
          setLockoutRemaining(0);
          if (timerRef.current) clearInterval(timerRef.current);
        } else {
          setLockoutRemaining(remaining);
        }
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const isLockedOut = lockoutRemaining > 0;
  const lockoutMinutes = Math.ceil(lockoutRemaining / 60_000);

  function recordFailedAttempt() {
    const state = getAttempts();
    state.count += 1;
    if (state.count >= MAX_ATTEMPTS) {
      state.lockedUntil = Date.now() + LOCKOUT_MS;
      setLockoutRemaining(LOCKOUT_MS);
      timerRef.current = setInterval(() => {
        const remaining = (state.lockedUntil ?? 0) - Date.now();
        if (remaining <= 0) {
          clearAttempts();
          setLockoutRemaining(0);
          if (timerRef.current) clearInterval(timerRef.current);
        } else {
          setLockoutRemaining(remaining);
        }
      }, 1000);
    }
    saveAttempts(state);
  }

  const onSubmit = async (data: LoginFormData) => {
    if (isLockedOut) return;
    try {
      await signIn(data.email, data.password);
      clearAttempts();
      toast.success(t("welcomeBack"));
      router.refresh();
      router.replace(afterAuthPath ?? "/dashboard");
    } catch (err) {
      if (err instanceof EmailNotVerifiedError) {
        toast.warning(t("verifyWarning"), { duration: 8000 });
        return;
      }
      recordFailedAttempt();
      const state = getAttempts();
      if (state.lockedUntil && state.lockedUntil > Date.now()) {
        toast.error(
          t("tooManyLockout", { minutes: Math.ceil(LOCKOUT_MS / 60_000) })
        );
      } else {
        toast.error(
          t("attemptsRemaining", {
            message: t(authErrorKey(err)),
            remaining: MAX_ATTEMPTS - state.count,
          })
        );
      }
    }
  };

  const handleGoogle = async () => {
    setOauthLoading(true);
    try {
      await signInWithGoogle();
      clearAttempts();
      toast.success(t("googleWelcome"));
      router.refresh();
      router.replace(afterAuthPath ?? "/dashboard");
    } catch (err) {
      toast.error(t(authErrorKey(err)));
    } finally {
      setOauthLoading(false);
    }
  };

  const busy = isSubmitting || oauthLoading;

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
            <CardTitle className="font-heading text-2xl">{t("loginTitle")}</CardTitle>
            <CardDescription>
              {t("loginSubtitle")}
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {isLockedOut && (
            <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-center text-sm text-destructive">
              {t("lockout", { minutes: lockoutMinutes })}{" "}
              <Link href="/forgot-password" className="underline underline-offset-2">
                {t("resetPassword")}
              </Link>.
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">{t("email")}</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                disabled={busy || isLockedOut}
                aria-invalid={!!errors.email}
                {...register("email")}
              />
              {errors.email && (
                <p className="text-xs text-destructive">{errors.email.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">{t("password")}</Label>
                <Link
                  href="/forgot-password"
                  className="text-xs text-muted-foreground hover:text-primary transition-colors"
                >
                  {t("forgotPassword")}
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                disabled={busy || isLockedOut}
                aria-invalid={!!errors.password}
                {...register("password")}
              />
              {errors.password && (
                <p className="text-xs text-destructive">{errors.password.message}</p>
              )}
            </div>
            <Button
              type="submit"
              className="w-full gap-2"
              disabled={busy || isLockedOut}
            >
              {isSubmitting && <Loader2 className="size-4 animate-spin" />}
              {isSubmitting ? t("signingIn") : t("signIn")}
            </Button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">{t("orContinue")}</span>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            className="w-full gap-2"
            onClick={handleGoogle}
            disabled={busy || isLockedOut}
          >
            {oauthLoading ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Globe className="size-4" aria-hidden />
            )}
            {oauthLoading ? t("googleConnecting") : t("googleSignIn")}
          </Button>
        </CardContent>
        <CardFooter className="flex flex-col gap-2 border-t-0 pt-0">
          <p className="text-center text-sm text-muted-foreground">
            {t("noAccount")}{" "}
            <Link
              href={signupHref}
              className="font-medium text-primary underline-offset-4 hover:underline"
            >
              {t("createOne")}
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}

function LoginPageFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-primary/5 via-background to-background p-4">
      <Loader2
        className="size-8 animate-spin text-primary"
        aria-label="Loading"
      />
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<LoginPageFallback />}>
      <LoginPageContent />
    </Suspense>
  );
}
