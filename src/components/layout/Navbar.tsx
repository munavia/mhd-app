"use client";

import { useState, useEffect } from "react";
import { Link } from "@/i18n/navigation";
import { usePathname, useRouter } from "@/i18n/navigation";
import { useTheme } from "next-themes";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sun,
  Moon,
  Menu,
  X,
  LogIn,
  LogOut,
  LayoutDashboard,
} from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { useTranslations } from "next-intl";
import { useAuth } from "@/hooks/useAuth";
import { signOut } from "@/lib/auth";
import { getInitials } from "@/lib/utils";
import { toast } from "sonner";
import { LanguageSwitcher } from "@/components/layout/LanguageSwitcher";

const NAV_LINKS = [
  { navKey: "home" as const, href: "/" },
  { navKey: "about" as const, href: "/about" },
  { navKey: "blog" as const, href: "/blog" },
  { navKey: "events" as const, href: "/events" },
  { navKey: "give" as const, href: "/give" },
  { navKey: "contact" as const, href: "/contact" },
];

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const { user, isAuthenticated } = useAuth();
  const t = useTranslations("Nav");
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success("Signed out successfully");
    } catch {
      toast.error("Failed to sign out");
    }
  };

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={cn(
        "fixed left-0 right-0 top-0 z-50 border-b border-border/70 transition-[background-color,box-shadow,backdrop-filter] duration-300",
        "bg-background/90 shadow-sm backdrop-blur-md supports-[backdrop-filter]:bg-background/78",
        scrolled && "shadow-md bg-background/95 supports-[backdrop-filter]:bg-background/88"
      )}
    >
      <nav className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link
          href="/"
          className="group min-w-0 shrink font-heading text-sm font-bold leading-snug tracking-tight text-foreground transition-colors hover:text-primary md:text-base"
        >
          <span className="inline-block max-w-[min(100vw-5rem,18rem)] sm:max-w-[22rem] lg:max-w-[28rem]">
            {t("brand")}
          </span>
        </Link>

        <div className="hidden lg:flex items-center gap-1">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                pathname === link.href
                  ? "bg-primary/12 text-primary"
                  : "text-foreground/82 hover:bg-muted/90 hover:text-foreground dark:text-zinc-200/90 dark:hover:text-zinc-50"
              }`}
            >
              {t(link.navKey)}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            aria-label={t("toggleTheme")}
          >
            <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          </Button>

          {isAuthenticated && user ? (
            <DropdownMenu>
              <DropdownMenuTrigger
                className={cn(
                  buttonVariants({ variant: "ghost" }),
                  "relative h-9 w-9 shrink-0 rounded-full"
                )}
              >
                <Avatar className="h-9 w-9">
                  <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                    {getInitials(user.displayName || user.email || "U")}
                  </AvatarFallback>
                </Avatar>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="px-2 py-1.5">
                  <p className="text-sm font-medium">{user.displayName}</p>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="cursor-pointer"
                  onClick={() => router.push("/dashboard")}
                >
                  <LayoutDashboard className="mr-2 h-4 w-4" />
                  {t("dashboard")}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleSignOut}
                  className="cursor-pointer text-destructive"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  {t("signOut")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="hidden sm:flex items-center gap-2">
              <Link
                href="/login"
                className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
              >
                {t("signIn")}
              </Link>
              <Link
                href="/signup"
                className={cn(buttonVariants({ size: "sm" }))}
              >
                {t("getStarted")}
              </Link>
            </div>
          )}

          <LanguageSwitcher className="shrink-0" />

          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger
              className={cn(
                buttonVariants({ variant: "ghost", size: "icon" }),
                "lg:hidden"
              )}
              aria-label={t("openMenu")}
            >
              <Menu className="h-5 w-5" />
            </SheetTrigger>
            <SheetContent side="right" className="w-72">
              <SheetTitle className="sr-only">{t("navMenu")}</SheetTitle>
              <div className="flex flex-col gap-4 mt-8">
                {NAV_LINKS.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className={`rounded-md px-3 py-2 text-base font-medium transition-colors ${
                      pathname === link.href
                        ? "bg-primary/12 text-primary"
                        : "text-foreground/82 hover:bg-muted/90 hover:text-foreground dark:text-zinc-200/90 dark:hover:text-zinc-50"
                    }`}
                  >
                    {t(link.navKey)}
                  </Link>
                ))}
                <div className="border-t pt-4 mt-2">
                  {isAuthenticated ? (
                    <>
                      <Link
                        href="/dashboard"
                        onClick={() => setMobileOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 text-base font-medium text-muted-foreground hover:text-foreground"
                      >
                        <LayoutDashboard className="h-4 w-4" />
                        {t("dashboard")}
                      </Link>
                      <button
                        onClick={() => {
                          handleSignOut();
                          setMobileOpen(false);
                        }}
                        className="flex items-center gap-2 px-3 py-2 text-base font-medium text-destructive w-full text-left"
                      >
                        <LogOut className="h-4 w-4" />
                        {t("signOut")}
                      </button>
                    </>
                  ) : (
                    <>
                      <Link
                        href="/login"
                        onClick={() => setMobileOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 text-base font-medium text-muted-foreground hover:text-foreground"
                      >
                        <LogIn className="h-4 w-4" />
                        {t("signIn")}
                      </Link>
                      <Link
                        href="/signup"
                        onClick={() => setMobileOpen(false)}
                        className={cn(buttonVariants(), "mt-2 w-full justify-center")}
                      >
                        {t("getStarted")}
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </nav>
    </motion.header>
  );
}
