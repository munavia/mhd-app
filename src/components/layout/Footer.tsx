"use client";

import { Link } from "@/i18n/navigation";
import { Church, Heart } from "lucide-react";
import { useTranslations } from "next-intl";
import { SocialLinks } from "@/components/social/SocialLinks";

const FOOTER_SECTIONS = [
  {
    titleKey: "categoryMinistry" as const,
    links: [
      { labelKey: "aboutUs" as const, href: "/about" },
      { labelKey: "blog" as const, href: "/blog" },
      { labelKey: "events" as const, href: "/events" },
    ],
  },
  {
    titleKey: "categoryConnect" as const,
    links: [
      { labelKey: "contact" as const, href: "/contact" },
      { labelKey: "prayerRequest" as const, href: "/prayer-request" },
      { labelKey: "give" as const, href: "/give" },
    ],
  },
  {
    titleKey: "categoryAccount" as const,
    links: [
      { labelKey: "signIn" as const, href: "/login" },
      { labelKey: "signUp" as const, href: "/signup" },
      { labelKey: "dashboard" as const, href: "/dashboard" },
    ],
  },
];

export function Footer() {
  const t = useTranslations("Footer");
  const tNav = useTranslations("Nav");

  return (
    <footer className="border-t bg-muted/30">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <Church className="h-6 w-6 text-primary" />
              <span className="font-bold text-lg">{tNav("brand")}</span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {t("tagline")}
            </p>
            <div className="mt-6">
              <h3 className="font-semibold text-sm mb-3">{t("followUs")}</h3>
              <SocialLinks variant="footer" />
            </div>
          </div>

          {FOOTER_SECTIONS.map((section) => (
            <div key={section.titleKey}>
              <h3 className="font-semibold text-sm mb-3">{t(section.titleKey)}</h3>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {t(link.labelKey)}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t mt-8 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} {t("rights")}
          </p>
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            {t("builtWith")}{" "}
            <Heart className="h-3 w-3 text-red-500 fill-red-500" aria-hidden />{" "}
            {t("andFaith")}
          </p>
        </div>
      </div>
    </footer>
  );
}
