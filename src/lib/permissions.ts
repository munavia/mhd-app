import type { Action, Role } from "@/types";

const ROLE_PERMISSIONS: Record<Role, Action[]> = {
  admin: [
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
  ],
  editor: [
    "post:create",
    "post:edit_own",
    "post:publish",
    "post:delete_own",
    "comment:create",
    "comment:delete_own",
    "comment:moderate",
  ],
  contributor: [
    "post:create",
    "post:edit_own",
    "comment:create",
    "comment:delete_own",
  ],
  user: ["comment:create", "comment:delete_own"],
};

export function hasPermission(role: Role | undefined, action: Action): boolean {
  if (!role) return false;
  return ROLE_PERMISSIONS[role]?.includes(action) ?? false;
}

export function getDashboardNavItems(role: Role) {
  const items = [{ label: "Overview", href: "/dashboard", icon: "LayoutDashboard" }];

  if (hasPermission(role, "post:create")) {
    items.push({ label: "Posts", href: "/dashboard/posts", icon: "FileText" });
  }

  if (hasPermission(role, "comment:moderate")) {
    items.push({
      label: "Comments",
      href: "/dashboard/comments",
      icon: "MessageSquare",
    });
  }

  if (hasPermission(role, "prayer:manage")) {
    items.push({
      label: "Prayer Requests",
      href: "/dashboard/prayer-requests",
      icon: "Heart",
    });
  }

  if (hasPermission(role, "contact:manage")) {
    items.push({
      label: "Messages",
      href: "/dashboard/messages",
      icon: "Mail",
    });
  }

  if (hasPermission(role, "user:manage")) {
    items.push({ label: "Users", href: "/dashboard/users", icon: "Users" });
  }

  if (hasPermission(role, "settings:manage")) {
    items.push({
      label: "Settings",
      href: "/dashboard/settings",
      icon: "Settings",
    });
  }

  return items;
}
