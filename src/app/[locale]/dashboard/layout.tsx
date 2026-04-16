"use client";

import { useEffect, useMemo, useState } from "react";
import { Link } from "@/i18n/navigation";
import { usePathname, useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { useTheme } from "next-themes";
import {
  LayoutDashboard,
  FileText,
  MessageSquare,
  Heart,
  Mail,
  Users,
  Settings,
  Menu,
  LogOut,
  ChevronLeft,
  PanelLeftClose,
  PanelLeft,
  Sun,
  Moon,
  Video,
  Clapperboard,
  CalendarDays,
} from "lucide-react";
import { toast } from "sonner";
import { buttonVariants } from "@/components/ui/button";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { cn, getInitials } from "@/lib/utils";
import { getDashboardNavItems } from "@/lib/permissions";
import { useAuth } from "@/hooks/useAuth";
import { useUIStore } from "@/stores/uiStore";
import { signOut } from "@/lib/auth";
import type { Role } from "@/types";

const ICON_MAP = {
  LayoutDashboard,
  FileText,
  MessageSquare,
  Heart,
  Mail,
  Users,
  Settings,
  Video,
  Clapperboard,
  CalendarDays,
} as const;

function NavLinks({
  role,
  onNavigate,
  collapsed,
}: {
  role: Role;
  onNavigate?: () => void;
  collapsed?: boolean;
}) {
  const pathname = usePathname();
  const tNav = useTranslations("Dashboard.nav");
  const items = useMemo(() => getDashboardNavItems(role), [role]);

  const isActive = (href: string) => {
    if (href === "/dashboard") {
      return pathname === "/dashboard";
    }
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <nav className="flex flex-1 flex-col gap-1 px-2 py-4">
      {items.map((item) => {
        const Icon =
          ICON_MAP[item.icon as keyof typeof ICON_MAP] ?? LayoutDashboard;
        const active = isActive(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            title={collapsed ? tNav(item.navKey) : undefined}
            className={cn(
              buttonVariants({ variant: "ghost", size: "sm" }),
              "w-full justify-start gap-3 px-3",
              collapsed && "justify-center px-0",
              active
                ? "bg-primary/10 text-primary hover:bg-primary/15 hover:text-primary"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <Icon className="size-4 shrink-0" aria-hidden />
            {!collapsed && (
              <span className="truncate">{tNav(item.navKey)}</span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const t = useTranslations("Dashboard.layout");
  const tCommon = useTranslations("Common");
  const router = useRouter();
  const { user, role, hydrated, isAuthenticated } = useAuth();
  const { sidebarOpen, toggleSidebar } = useUIStore();
  const { theme, setTheme } = useTheme();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (hydrated && !isAuthenticated) {
      router.replace("/login");
    }
  }, [hydrated, isAuthenticated, router]);

  const dashboardRole: Role = role ?? "user";

  const handleLogout = async () => {
    try {
      await signOut();
      toast.success(tCommon("signedOutSuccess"));
      router.push("/login");
    } catch {
      toast.error(tCommon("signOutFailed"));
    }
  };

  if (!hydrated) {
    return (
      <div className="flex min-h-screen bg-muted/30">
        <div className="hidden w-60 border-r border-border bg-card md:block">
          <div className="flex flex-col gap-4 p-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
          </div>
        </div>
        <div className="flex flex-1 flex-col">
          <div className="flex h-14 items-center gap-4 border-b border-border bg-card px-4">
            <Skeleton className="h-8 w-8 rounded-full" />
            <Skeleton className="h-4 w-48" />
            <Skeleton className="ml-auto h-8 w-8 rounded-full" />
          </div>
          <div className="flex-1 space-y-4 p-6">
            <Skeleton className="h-10 w-64" />
            <div className="grid gap-4 md:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-28 rounded-xl" />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  const displayName = user.displayName || user.email || "User";

  const sidebarInner = (opts: { collapsed?: boolean; onNavigate?: () => void }) => (
    <>
      <Link
        href="/"
        className={cn(
          "flex items-center border-b border-border px-3 py-4 transition-colors hover:bg-muted/50",
          opts.collapsed ? "flex-col justify-center px-2" : "gap-0"
        )}
      >
        {opts.collapsed ? (
          <span className="font-heading text-[10px] font-bold uppercase leading-tight text-primary">
            MHD
          </span>
        ) : (
          <div className="min-w-0 flex-1">
            <p className="font-heading text-sm font-semibold leading-tight">
              {t("mhdDashboard")}
            </p>
            <p className="truncate text-xs text-muted-foreground">{displayName}</p>
          </div>
        )}
      </Link>
      <NavLinks
        role={dashboardRole}
        collapsed={opts.collapsed}
        onNavigate={opts.onNavigate}
      />
      <div className="mt-auto border-t border-border p-2">
        <div
          className={cn(
            "hidden md:flex",
            opts.collapsed ? "justify-center" : "gap-2"
          )}
        >
          <Button
            type="button"
            variant="outline"
            size="icon-sm"
            className={cn(!opts.collapsed && "shrink-0")}
            onClick={toggleSidebar}
            aria-label={sidebarOpen ? t("collapseSidebar") : t("expandSidebar")}
          >
            {sidebarOpen ? (
              <PanelLeftClose className="size-4" />
            ) : (
              <PanelLeft className="size-4" />
            )}
          </Button>
        </div>
        <Button
          type="button"
          variant="ghost"
          className={cn(
            "mt-2 w-full justify-start gap-2 text-destructive hover:bg-destructive/10 hover:text-destructive",
            opts.collapsed && "justify-center px-0"
          )}
          onClick={() => {
            opts.onNavigate?.();
            void handleLogout();
          }}
        >
          <LogOut className="size-4 shrink-0" />
          {!opts.collapsed && t("logOut")}
        </Button>
      </div>
    </>
  );

  return (
    <div className="flex min-h-screen bg-muted/30">
      <aside
        className={cn(
          "relative hidden shrink-0 flex-col border-r border-border bg-card transition-[width] duration-200 md:flex",
          sidebarOpen ? "w-60" : "w-[4.5rem]"
        )}
      >
        {sidebarInner({ collapsed: !sidebarOpen })}
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-40 flex h-14 shrink-0 items-center gap-3 border-b border-border bg-card/95 px-3 backdrop-blur supports-backdrop-filter:bg-card/80 md:px-4">
          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger
              className={cn(
                buttonVariants({ variant: "ghost", size: "icon" }),
                "md:hidden"
              )}
              aria-label={t("openNavigation")}
            >
              <Menu className="size-5" />
            </SheetTrigger>
            <SheetContent side="left" className="w-72 p-0">
              <SheetTitle className="sr-only">{t("sheetTitle")}</SheetTitle>
              <div className="flex h-full flex-col">{sidebarInner({ onNavigate: () => setMobileOpen(false) })}</div>
            </SheetContent>
          </Sheet>

          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="hidden text-muted-foreground md:inline-flex"
            onClick={() => router.back()}
            aria-label={t("goBack")}
          >
            <ChevronLeft className="size-4" />
          </Button>

          <Separator orientation="vertical" className="hidden h-6 md:block" />

          <span className="text-sm text-muted-foreground">{t("title")}</span>

          <div className="ml-auto flex items-center gap-2">
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              aria-label={t("toggleTheme")}
            >
              <Sun className="size-4 rotate-0 scale-100 transition-transform dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute size-4 rotate-90 scale-0 transition-transform dark:rotate-0 dark:scale-100" />
            </Button>
            <Avatar className="size-8">
              {user.photoURL ? (
                <AvatarImage src={user.photoURL} alt="" />
              ) : null}
              <AvatarFallback className="bg-primary text-xs text-primary-foreground">
                {getInitials(displayName)}
              </AvatarFallback>
            </Avatar>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
