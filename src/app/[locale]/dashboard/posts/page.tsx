"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useRouter } from "@/i18n/navigation";
import { Pencil, Trash2, Plus } from "lucide-react";
import { toast } from "sonner";
import { buttonVariants } from "@/components/ui/button";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn, formatDate } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { getAllPosts, getUserPosts, deletePost } from "@/services/postService";
import type { Post } from "@/types";

export default function DashboardPostsPage() {
  const t = useTranslations("Dashboard.posts");
  const tCommon = useTranslations("Common");
  const router = useRouter();
  const { user, role, can } = useAuth();
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState<Post[]>([]);
  const [tab, setTab] = useState<"all" | "published" | "drafts">("all");
  const [deleteTarget, setDeleteTarget] = useState<Post | null>(null);
  const [deleting, setDeleting] = useState(false);

  const loadPosts = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data =
        can("post:edit_any") || role === "editor"
          ? await getAllPosts()
          : can("post:create")
            ? await getUserPosts(user.uid)
            : [];
      setPosts(data);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t("loadError"));
    } finally {
      setLoading(false);
    }
  }, [user, role, can]);

  useEffect(() => {
    void loadPosts();
  }, [loadPosts]);

  const filtered = useMemo(() => {
    if (tab === "published") {
      return posts.filter((p) => p.status === "published");
    }
    if (tab === "drafts") {
      return posts.filter((p) => p.status === "draft");
    }
    return posts;
  }, [posts, tab]);

  const canDelete = (post: Post) => {
    if (can("post:delete_any")) return true;
    if (can("post:delete_own") && user && post.authorId === user.uid) return true;
    return false;
  };

  const canEdit = (post: Post) => {
    if (can("post:edit_any")) return true;
    if (can("post:edit_own") && user && post.authorId === user.uid) return true;
    return false;
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deletePost(deleteTarget.id);
      toast.success(t("deleted"));
      setDeleteTarget(null);
      await loadPosts();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : t("deleteError"));
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="font-heading text-2xl font-semibold tracking-tight">
          {t("title")}
        </h1>
        {can("post:create") && (
          <Link
            href="/dashboard/posts/new"
            className={cn(
              buttonVariants({ variant: "default" }),
              "w-full gap-2 sm:w-auto"
            )}
          >
            <Plus className="size-4" />
            {t("newPost")}
          </Link>
        )}
      </div>

      <Tabs
        value={tab}
        onValueChange={(v) => setTab(v as typeof tab)}
        className="gap-4"
      >
        <TabsList>
          <TabsTrigger value="all">{t("tabAll")}</TabsTrigger>
          <TabsTrigger value="published">{t("tabPublished")}</TabsTrigger>
          <TabsTrigger value="drafts">{t("tabDrafts")}</TabsTrigger>
        </TabsList>

        <TabsContent value={tab} className="mt-0">
          <div className="rounded-xl border border-border/60 bg-card shadow-sm">
            {loading ? (
              <div className="space-y-3 p-6">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{tCommon("title")}</TableHead>
                    <TableHead>{tCommon("status")}</TableHead>
                    <TableHead className="hidden lg:table-cell">
                      {tCommon("categories")}
                    </TableHead>
                    <TableHead className="hidden md:table-cell">{tCommon("date")}</TableHead>
                    <TableHead className="text-right">{tCommon("actions")}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className="py-10 text-center text-muted-foreground"
                      >
                        {t("emptyView")}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filtered.map((post) => (
                      <TableRow key={post.id}>
                        <TableCell className="max-w-[200px] font-medium">
                          <span className="line-clamp-2">{post.title}</span>
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              post.status === "published"
                                ? "default"
                                : "secondary"
                            }
                          >
                            {post.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">
                          <div className="flex flex-wrap gap-1">
                            {post.categories.slice(0, 4).map((c) => (
                              <Badge key={c} variant="outline" className="text-xs">
                                {c}
                              </Badge>
                            ))}
                            {post.categories.length === 0 && (
                              <span className="text-muted-foreground">—</span>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="hidden text-muted-foreground md:table-cell">
                          {formatDate(post.updatedAt)}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            {canEdit(post) && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon-sm"
                                aria-label={t("editAria")}
                                onClick={() =>
                                  router.push(`/dashboard/posts/${post.id}/edit`)
                                }
                              >
                                <Pencil className="size-4" />
                              </Button>
                            )}
                            {canDelete(post) && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon-sm"
                                className="text-destructive hover:text-destructive"
                                aria-label={t("deleteAria")}
                                onClick={() => setDeleteTarget(post)}
                              >
                                <Trash2 className="size-4" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            )}
          </div>
        </TabsContent>
      </Tabs>

      <Dialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{t("deleteTitle")}</DialogTitle>
            <DialogDescription>
              {t("deleteDescription", { title: deleteTarget?.title ?? "" })}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => setDeleteTarget(null)}
              disabled={deleting}
            >
              {tCommon("cancel")}
            </Button>
            <Button
              type="button"
              variant="destructive"
              onClick={() => void confirmDelete()}
              disabled={deleting}
            >
              {deleting ? t("deleting") : tCommon("delete")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
