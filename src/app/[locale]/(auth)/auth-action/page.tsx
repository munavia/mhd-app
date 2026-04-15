"use client";

import { Suspense, useEffect, useState } from "react";
import { Link } from "@/i18n/navigation";
import { useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  applyActionCode,
  confirmPasswordReset,
  verifyPasswordResetCode,
} from "firebase/auth";
import {
  Loader2,
  Check,
  X,
  ShieldCheck,
  MailCheck,
  AlertTriangle,
} from "lucide-react";
import { auth } from "@/lib/firebase";
import { newPasswordSchema, type NewPasswordFormData } from "@/lib/validations";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
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

type ActionMode = "resetPassword" | "verifyEmail" | null;
type ViewState =
  | "loading"
  | "reset-form"
  | "reset-success"
  | "verify-success"
  | "error";

export default function AuthActionPage() {
  return (
    <Suspense
      fallback={
        <Wrapper>
          <div className="flex flex-col items-center gap-3 py-8">
            <Loader2 className="size-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Loading…</p>
          </div>
        </Wrapper>
      }
    >
      <AuthActionContent />
    </Suspense>
  );
}

function AuthActionContent() {
  const searchParams = useSearchParams();
  const mode = searchParams.get("mode") as ActionMode;
  const oobCode = searchParams.get("oobCode") ?? "";

  const [view, setView] = useState<ViewState>("loading");
  const [email, setEmail] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<NewPasswordFormData>({
    resolver: zodResolver(newPasswordSchema),
    defaultValues: { password: "", confirmPassword: "" },
  });

  const passwordValue = watch("password", "");

  useEffect(() => {
    if (!oobCode || !mode) {
      setErrorMessage("Invalid or missing action link.");
      setView("error");
      return;
    }

    if (mode === "resetPassword") {
      verifyPasswordResetCode(auth, oobCode)
        .then((userEmail) => {
          setEmail(userEmail);
          setView("reset-form");
        })
        .catch(() => {
          setErrorMessage(
            "This password reset link has expired or already been used."
          );
          setView("error");
        });
    } else if (mode === "verifyEmail") {
      applyActionCode(auth, oobCode)
        .then(() => setView("verify-success"))
        .catch(() => {
          setErrorMessage(
            "This verification link has expired or already been used."
          );
          setView("error");
        });
    } else {
      setErrorMessage("Unsupported action.");
      setView("error");
    }
  }, [mode, oobCode]);

  const onSubmitNewPassword = async (data: NewPasswordFormData) => {
    try {
      await confirmPasswordReset(auth, oobCode, data.password);
      setView("reset-success");
    } catch {
      toast.error("Failed to reset password. The link may have expired.");
    }
  };

  if (view === "loading") {
    return (
      <Wrapper>
        <div className="flex flex-col items-center gap-3 py-8">
          <Loader2 className="size-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Verifying…</p>
        </div>
      </Wrapper>
    );
  }

  if (view === "error") {
    return (
      <Wrapper>
        <CardHeader className="space-y-1 text-center">
          <div className="mx-auto mb-2 flex size-12 items-center justify-center rounded-full bg-destructive/10">
            <AlertTriangle className="size-6 text-destructive" />
          </div>
          <CardTitle className="font-heading text-2xl">Link expired</CardTitle>
          <CardDescription>{errorMessage}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Link
            href="/forgot-password"
            className={buttonVariants({ className: "w-full" })}
          >
            Request a new link
          </Link>
          <Link
            href="/login"
            className={buttonVariants({
              variant: "outline",
              className: "w-full",
            })}
          >
            Back to Sign in
          </Link>
        </CardContent>
      </Wrapper>
    );
  }

  if (view === "verify-success") {
    return (
      <Wrapper>
        <CardHeader className="space-y-1 text-center">
          <div className="mx-auto mb-2 flex size-12 items-center justify-center rounded-full bg-emerald-500/10">
            <MailCheck className="size-6 text-emerald-600 dark:text-emerald-400" />
          </div>
          <CardTitle className="font-heading text-2xl">Email verified</CardTitle>
          <CardDescription>
            Your email has been confirmed. You can now sign in to your account.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Link
            href="/login"
            className={buttonVariants({ className: "w-full" })}
          >
            Go to Sign in
          </Link>
        </CardContent>
      </Wrapper>
    );
  }

  if (view === "reset-success") {
    return (
      <Wrapper>
        <CardHeader className="space-y-1 text-center">
          <div className="mx-auto mb-2 flex size-12 items-center justify-center rounded-full bg-emerald-500/10">
            <ShieldCheck className="size-6 text-emerald-600 dark:text-emerald-400" />
          </div>
          <CardTitle className="font-heading text-2xl">Password changed</CardTitle>
          <CardDescription>
            Your password has been reset successfully. You can now sign in with
            your new password.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Link
            href="/login"
            className={buttonVariants({ className: "w-full" })}
          >
            Go to Sign in
          </Link>
        </CardContent>
      </Wrapper>
    );
  }

  return (
    <Wrapper>
      <CardHeader className="space-y-1 text-center">
        <CardTitle className="font-heading text-2xl">Set new password</CardTitle>
        <CardDescription>
          Choose a new password for{" "}
          <span className="font-medium text-foreground">{email}</span>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form
          onSubmit={handleSubmit(onSubmitNewPassword)}
          className="space-y-4"
        >
          <div className="space-y-2">
            <Label htmlFor="password">New password</Label>
            <Input
              id="password"
              type="password"
              autoComplete="new-password"
              disabled={isSubmitting}
              aria-invalid={!!errors.password}
              {...register("password")}
            />
            {errors.password && (
              <p className="text-xs text-destructive">
                {errors.password.message}
              </p>
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
            <Label htmlFor="confirmPassword">Confirm new password</Label>
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
          <Button
            type="submit"
            className="w-full gap-2"
            disabled={isSubmitting}
          >
            {isSubmitting && <Loader2 className="size-4 animate-spin" />}
            {isSubmitting ? "Resetting…" : "Reset password"}
          </Button>
        </form>
      </CardContent>
    </Wrapper>
  );
}

function Wrapper({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-primary/5 via-background to-background">
      <Card className="w-full max-w-md border-border/60 shadow-lg shadow-primary/5">
        {children}
      </Card>
    </div>
  );
}
