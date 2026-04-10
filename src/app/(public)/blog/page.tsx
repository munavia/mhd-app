"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { DocumentSnapshot } from "firebase/firestore";
import { BookOpen, Search } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { PostCard } from "@/components/blog/PostCard";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { getPublishedPosts } from "@/services/postService";
import { getAllCategories } from "@/services/categoryService";
import type { Post } from "@/types";
import type { Category } from "@/types";

const PAGE_SIZE = 9;

function PostCardSkeleton() {
  return (
    <div className="flex flex-col overflow-hidden rounded-xl border border-border/60 bg-card ring-1 ring-foreground/10">
      <Skeleton className="aspect-[16/10] w-full rounded-none" />
      <div className="space-y-3 p-4">
        <div className="flex gap-2">
          <Skeleton className="h-5 w-16 rounded-full" />
          <Skeleton className="h-5 w-20 rounded-full" />
        </div>
        <Skeleton className="h-6 w-4/5" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
      </div>
      <div className="mt-auto flex gap-4 border-t bg-muted/50 p-4">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-3 w-20" />
      </div>
    </div>
  );
}

export default function BlogPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [cursor, setCursor] = useState<DocumentSnapshot | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    void getAllCategories().then(setCategories).catch(() => setCategories([]));
  }, []);

  const fetchFirstPage = useCallback(async () => {
    setLoading(true);
    setPosts([]);
    setCursor(null);
    try {
      const { posts: batch, lastDoc } = await getPublishedPosts({
        pageSize: PAGE_SIZE,
        category: selectedCategory ?? undefined,
      });
      setPosts(batch);
      setCursor(lastDoc);
      setHasMore(batch.length === PAGE_SIZE);
    } catch {
      setPosts([]);
      setCursor(null);
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  }, [selectedCategory]);

  useEffect(() => {
    void fetchFirstPage();
  }, [fetchFirstPage]);

  const loadMore = useCallback(async () => {
    if (!cursor || loadingMore || loading) return;
    setLoadingMore(true);
    try {
      const { posts: batch, lastDoc } = await getPublishedPosts({
        pageSize: PAGE_SIZE,
        cursor,
        category: selectedCategory ?? undefined,
      });
      setPosts((prev) => [...prev, ...batch]);
      setCursor(lastDoc);
      setHasMore(batch.length === PAGE_SIZE);
    } catch {
      setHasMore(false);
    } finally {
      setLoadingMore(false);
    }
  }, [cursor, loadingMore, loading, selectedCategory]);

  const filteredPosts = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return posts;
    return posts.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        (p.excerpt || "").toLowerCase().includes(q)
    );
  }, [posts, searchQuery]);

  const showEmpty = !loading && filteredPosts.length === 0;

  return (
    <>
      <Navbar />
      <main className="flex-1 pt-16">
        <section className="border-b border-border/40 bg-gradient-to-b from-primary/10 via-background to-background">
          <div className="container mx-auto px-4 py-14 md:py-20">
            <div className="mx-auto max-w-3xl text-center">
              <div className="mx-auto mb-6 flex size-16 items-center justify-center rounded-2xl bg-primary/10 text-primary ring-1 ring-primary/20">
                <BookOpen className="size-8" aria-hidden />
              </div>
              <h1 className="font-heading text-4xl font-bold tracking-tight md:text-5xl">
                Blog
              </h1>
              <p className="mt-4 text-lg text-muted-foreground">
                Teachings, stories, and encouragement from our community. Read, reflect,
                and share the journey of faith and healing.
              </p>
            </div>
          </div>
        </section>

        <section className="container mx-auto px-4 py-12 md:py-16">
          <div className="mx-auto mb-10 flex max-w-2xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative flex-1">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden
              />
              <Input
                type="search"
                placeholder="Search by title or excerpt…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
                aria-label="Search posts"
              />
            </div>
          </div>

          <div className="mb-8 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setSelectedCategory(null)}
              className={cn(
                buttonVariants({
                  variant: selectedCategory === null ? "default" : "outline",
                  size: "sm",
                })
              )}
            >
              All
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.name)}
                className={cn(
                  buttonVariants({
                    variant: selectedCategory === cat.name ? "default" : "outline",
                    size: "sm",
                  })
                )}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {loading && posts.length === 0 ? (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <PostCardSkeleton key={i} />
              ))}
            </div>
          ) : showEmpty ? (
            <div className="rounded-xl border border-dashed border-border/60 bg-muted/20 px-6 py-16 text-center">
              <p className="font-heading text-lg font-medium text-foreground">
                No posts found
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                {searchQuery.trim()
                  ? "Try a different search or clear the filter."
                  : "Check back soon for new articles."}
              </p>
              {searchQuery.trim() ? (
                <Button
                  type="button"
                  variant="outline"
                  className="mt-6"
                  onClick={() => setSearchQuery("")}
                >
                  Clear search
                </Button>
              ) : null}
            </div>
          ) : (
            <>
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {filteredPosts.map((post) => (
                  <PostCard key={post.id} post={post} />
                ))}
              </div>

              {hasMore && (
                <div className="mt-10 flex justify-center">
                  <Button
                    type="button"
                    variant="outline"
                    size="lg"
                    onClick={() => void loadMore()}
                    disabled={loadingMore}
                  >
                    {loadingMore ? "Loading…" : "Load more"}
                  </Button>
                </div>
              )}
            </>
          )}
        </section>
      </main>
      <Footer />
    </>
  );
}
