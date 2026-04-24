"use client";

import { useTranslations } from "next-intl";
import { ExternalLink, Mail } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  buildGmailComposeUrl,
  buildMailtoReply,
  isValidReplyEmail,
} from "@/lib/emailReply";

type EmailReplyActionsProps = {
  email: string;
  subject: string;
  body: string;
  /** Compact icon-only row (table). */
  variant: "icons" | "dialog";
  className?: string;
};

export function EmailReplyActions({
  email,
  subject,
  body,
  variant,
  className,
}: EmailReplyActionsProps) {
  const t = useTranslations("Dashboard.emailReply");
  if (!isValidReplyEmail(email)) return null;

  const to = email.trim();
  const gmailHref = buildGmailComposeUrl(to, subject, body);
  const mailtoHref = buildMailtoReply(to, subject, body);

  if (variant === "icons") {
    return (
      <div className={cn("inline-flex items-center gap-0.5", className)}>
        <a
          href={gmailHref}
          target="_blank"
          rel="noopener noreferrer"
          className={buttonVariants({ variant: "ghost", size: "icon-sm" })}
          title={t("openGmail")}
          aria-label={t("openGmailAria")}
        >
          <ExternalLink className="size-4" aria-hidden />
        </a>
        <a
          href={mailtoHref}
          className={buttonVariants({ variant: "ghost", size: "icon-sm" })}
          title={t("openMailApp")}
          aria-label={t("openMailAppAria")}
        >
          <Mail className="size-4" aria-hidden />
        </a>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "inline-flex min-w-0 max-w-full flex-row flex-nowrap items-center justify-start gap-2",
        className
      )}
    >
      <a
        href={gmailHref}
        target="_blank"
        rel="noopener noreferrer"
        className={buttonVariants({ variant: "default", size: "default" })}
      >
        {t("openGmailLong")}
      </a>
      <a
        href={mailtoHref}
        className={buttonVariants({ variant: "outline", size: "default" })}
      >
        {t("openMailAppLong")}
      </a>
    </div>
  );
}
