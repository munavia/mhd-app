"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FileText, MessageSquare, Users, Heart, Plus } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn, formatDate } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { getAllPosts } from "@/services/postService";
import { getAllComments } from "@/services/commentService";
import { getAllUsers } from "@/services/userService";
import { getAllPrayerRequests } from "@/services/prayerService";
import { getUserPosts } from "@/services/postService";
import type { Post } from "@/types";
import { toast } from "sonner";

export default function DashboardHomePage() {
  const { user, isAdmin, role, can } = useAuth();
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState<Post[]>([]);
  const [commentCount, setCommentCount] = useState(0);
  const [userCount, setUserCount] = useState(0);
  const [prayerCount, setPrayerCount] = useState(0);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (!user) return;
      setLoading(true);
      try {
        const postsData =
          role === "contributor"
            ? await getUserPosts(user.uid)
            : role === "admin" || role === "editor"
              ? await getAllPosts()
              : [];

        const comments = await getAllComments();

        let usersLen = 0;
        let prayersLen = 0;
        if (isAdmin) {
          const [users, prayers] = await Promise.all([
            getAllUsers(),
            getAllPrayerRequests(),
          ]);
          usersLen = users.length;
          prayersLen = prayers.length;
        }

        if (!cancelled) {
          setPosts(postsData);
          setCommentCount(comments.length);
          setUserCount(usersLen);
          setPrayerCount(prayersLen);
        }
      } catch (e) {
        if (!cancelled) {
          toast.error(
            e instanceof Error ? e.message : "Failed to load dashboard data"
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [user, isAdmin, role]);

  const displayName = user?.displayName || user?.email || "there";
  const recent = posts.slice(0, 5);
  const totalPosts = posts.length;

  return (
    <div className="mx-auto max-w-6xl space-y-8">
      <div>
        <h1 className="font-heading text-2xl font-semibold tracking-tight md:text-3xl">
          Welcome back, {displayName}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Here is a quick snapshot of your ministry site.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {loading ? (
          <>
            <Skeleton className="h-28 rounded-xl" />
            <Skeleton className="h-28 rounded-xl" />
            {isAdmin && (
              <>
                <Skeleton className="h-28 rounded-xl" />
                <Skeleton className="h-28 rounded-xl" />
              </>
            )}
          </>
        ) : (
          <>
            <Card className="border-border/60 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total posts</CardTitle>
                <FileText className="size-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{totalPosts}</p>
              </CardContent>
            </Card>
            <Card className="border-border/60 shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total comments
                </CardTitle>
                <MessageSquare className="size-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{commentCount}</p>
              </CardContent>
            </Card>
            {isAdmin && (
              <>
                <Card className="border-border/60 shadow-sm">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Total users
                    </CardTitle>
                    <Users className="size-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold">{userCount}</p>
                  </CardContent>
                </Card>
                <Card className="border-border/60 shadow-sm">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">
                      Prayer requests
                    </CardTitle>
                    <Heart className="size-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold">{prayerCount}</p>
                  </CardContent>
                </Card>
              </>
            )}
          </>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        {can("post:create") && (
          <Link
            href="/dashboard/posts/new"
            className={cn(buttonVariants({ variant: "default" }), "gap-2")}
          >
            <Plus className="size-4" />
            New post
          </Link>
        )}
        {can("post:create") && (
          <Link
            href="/dashboard/posts"
            className={cn(buttonVariants({ variant: "outline" }))}
          >
            Manage posts
          </Link>
        )}
      </div>

      <Card className="border-border/60 shadow-sm">
        <CardHeader>
          <CardTitle className="font-heading text-lg">Recent posts</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="space-y-2 p-6">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          ) : recent.length === 0 ? (
            <p className="p-6 text-sm text-muted-foreground">No posts yet.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="hidden sm:table-cell">Updated</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recent.map((post) => (
                  <TableRow key={post.id}>
                    <TableCell className="font-medium">
                      <Link
                        href={`/dashboard/posts/${post.id}/edit`}
                        className="text-primary hover:underline"
                      >
                        {post.title}
                      </Link>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          post.status === "published" ? "default" : "secondary"
                        }
                      >
                        {post.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden text-muted-foreground sm:table-cell">
                      {formatDate(post.updatedAt)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
