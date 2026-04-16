import type { Action, Role } from "@/types";

const ADMIN_PERMISSIONS: Action[] = [
  "post:create",
  "post:edit_own",
  "post:edit_any",
  "post:publish",
  "post:delete_own",
  "post:delete_any",
  "comment:create",
  "comment:delete_own",
  "comment:moderate",
  "user:manage",
  "prayer:manage",
  "contact:manage",
  "settings:manage",
  "sermon:manage",
  "program:manage",
  "upcomingEvent:manage",
];

const ROLE_PERMISSIONS: Record<Role, Action[]> = {
  admin: ADMIN_PERMISSIONS,
  editor: [
    "post:create",
    "post:edit_own",
    "post:publish",
    "post:delete_own",
    "comment:create",
    "comment:delete_own",
    "comment:moderate",
    "sermon:manage",
    "program:manage",
  ],
  /** Same as admin except cannot assign or change roles (no `user:manage`). */
  contributor: ADMIN_PERMISSIONS.filter((a) => a !== "user:manage"),
  user: ["comment:create", "comment:delete_own"],
};

export function hasPermission(role: Role | undefined, action: Action): boolean {
  if (!role) return false;
  return ROLE_PERMISSIONS[role]?.includes(action) ?? false;
}

export type DashboardNavKey =
  | "overview"
  | "posts"
  | "comments"
  | "prayerRequests"
  | "messages"
  | "users"
  | "settings"
  | "sermons"
  | "programs"
  | "upcomingEvents";

export function getDashboardNavItems(role: Role): {
  navKey: DashboardNavKey;
  href: string;
  icon: string;
}[] {
  const items: {
    navKey: DashboardNavKey;
    href: string;
    icon: string;
  }[] = [
    { navKey: "overview", href: "/dashboard", icon: "LayoutDashboard" },
  ];

  if (hasPermission(role, "post:create")) {
    items.push({ navKey: "posts", href: "/dashboard/posts", icon: "FileText" });
  }

  if (hasPermission(role, "sermon:manage")) {
    items.push({
      navKey: "sermons",
      href: "/dashboard/sermons",
      icon: "Video",
    });
  }

  if (hasPermission(role, "program:manage")) {
    items.push({
      navKey: "programs",
      href: "/dashboard/programs",
      icon: "Clapperboard",
    });
  }

  if (hasPermission(role, "upcomingEvent:manage")) {
    items.push({
      navKey: "upcomingEvents",
      href: "/dashboard/upcoming-events",
      icon: "CalendarDays",
    });
  }

  if (hasPermission(role, "comment:moderate")) {
    items.push({
      navKey: "comments",
      href: "/dashboard/comments",
      icon: "MessageSquare",
    });
  }

  if (hasPermission(role, "prayer:manage")) {
    items.push({
      navKey: "prayerRequests",
      href: "/dashboard/prayer-requests",
      icon: "Heart",
    });
  }

  if (hasPermission(role, "contact:manage")) {
    items.push({
      navKey: "messages",
      href: "/dashboard/messages",
      icon: "Mail",
    });
  }

  if (hasPermission(role, "user:manage")) {
    items.push({ navKey: "users", href: "/dashboard/users", icon: "Users" });
  }

  if (hasPermission(role, "settings:manage")) {
    items.push({
      navKey: "settings",
      href: "/dashboard/settings",
      icon: "Settings",
    });
  }

  return items;
}
