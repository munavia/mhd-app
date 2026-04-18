"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { PageHero } from "@/components/layout/PageHero";
import { heroImages } from "@/lib/heroImages";
import { LikeButton } from "@/components/blog/LikeButton";
import { CommentSection } from "@/components/blog/CommentSection";
import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn, formatDate, getInitials } from "@/lib/utils";
import { sanitizeHtml } from "@/lib/sanitize";
import { getPostBySlug } from "@/services/postService";
import type { Post } from "@/types";

const BLOG_CONTENT_CLASS =
  "max-w-none text-base leading-relaxed [&_h1]:text-3xl [&_h1]:font-bold [&_h1]:mb-4 [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:mb-3 [&_h3]:text-xl [&_h3]:font-bold [&_h3]:mb-2 [&_p]:mb-4 [&_p]:leading-relaxed [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:mb-4 [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:mb-4 [&_li]:mb-1 [&_a]:text-primary [&_a]:underline [&_blockquote]:border-l-4 [&_blockquote]:border-primary/30 [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:my-4 [&_img]:rounded-lg [&_img]:my-4 [&_pre]:bg-muted [&_pre]:p-4 [&_pre]:rounded-lg [&_pre]:overflow-x-auto [&_code]:bg-muted [&_code]:px-1 [&_code]:rounded";

export default function BlogPostPage() {
  const t = useTranslations("Blog");
  const params = useParams();
  const slug = typeof params.slug === "string" ? params.slug : "";

  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [safeHtml, setSafeHtml] = useState("");

  useEffect(() => {
    if (!slug) {
      setLoading(false);
      setNotFound(true);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setNotFound(false);

    void (async () => {
      try {
        const data = await getPostBySlug(slug);
        if (cancelled) return;
        if (!data || data.status !== "published") {
          setPost(null);
          setNotFound(true);
          setSafeHtml("");
        } else {
          setPost(data);
          setNotFound(false);
        }
      } catch {
        if (!cancelled) {
          setPost(null);
          setNotFound(true);
          setSafeHtml("");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [slug]);

  useEffect(() => {
    if (!post?.content) {
      setSafeHtml("");
      return;
    }
    setSafeHtml(sanitizeHtml(post.content));
  }, [post?.content]);

  const imageUrl = post?.featuredImage?.trim();
  const displayDate = post ? post.publishedAt ?? post.createdAt : undefined;

  return (
    <>
      <Navbar />
      <main className="flex-1 pt-16">
        {loading ? (
          <div className="container mx-auto max-w-3xl px-4 py-12">
            <Skeleton className="mb-6 h-9 w-32" />
            <Skeleton className="h-52 w-full rounded-xl md:h-64" />
            <div className="mt-8 space-y-3">
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          </div>
        ) : notFound || !post ? (
          <div className="container mx-auto max-w-lg px-4 py-24 text-center">
            <h1 className="font-heading text-3xl font-bold">{t("postNotFound")}</h1>
            <p className="mt-3 text-muted-foreground">
              {t("postMoved")}
            </p>
            <Link
              href="/blog"
              className={cn(buttonVariants({ size: "lg" }), "mt-8 inline-flex gap-2")}
            >
              <ArrowLeft className="size-4" aria-hidden />
              {t("backToBlog")}
            </Link>
          </div>
        ) : (
          <article className="pb-20">
            <PageHero
              imageSrc={imageUrl || heroImages.blogPostFallback}
            >
              <div className="mx-auto max-w-3xl">
                <Link
                  href="/blog"
                  className={cn(
                    buttonVariants({ variant: "ghost", size: "sm" }),
                    "mb-6 -ml-2 gap-2 text-foreground/78 hover:text-foreground dark:text-zinc-300 dark:hover:text-zinc-50"
                  )}
                >
                  <ArrowLeft className="size-4" aria-hidden />
                  {t("allPosts")}
                </Link>

                {post.categories.length > 0 && (
                  <div className="mb-4 flex flex-wrap gap-2">
                    {post.categories.map((cat) => (
                      <Badge key={cat} variant="secondary">
                        {cat}
                      </Badge>
                    ))}
                  </div>
                )}

                <h1 className="font-heading text-3xl font-bold tracking-tight md:text-4xl lg:text-5xl">
                  {post.title}
                </h1>

                <div className="mt-8 flex flex-wrap items-center gap-4">
                  <div className="flex items-center gap-3 rounded-xl border border-border/60 bg-card/80 px-4 py-3">
                    <Avatar size="lg">
                      <AvatarFallback>{getInitials(post.authorName)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium leading-none">{post.authorName}</p>
                      <p className="mt-1 text-sm text-foreground/75 dark:text-zinc-300">
                        {formatDate(displayDate)}
                      </p>
                    </div>
                  </div>
                  <LikeButton postId={post.id} initialLikesCount={post.likesCount ?? 0} />
                </div>
              </div>
            </PageHero>

            <div className="container mx-auto max-w-3xl px-4 py-10">
              <div
                className={cn(BLOG_CONTENT_CLASS)}
                dangerouslySetInnerHTML={{ __html: safeHtml }}
              />

              <Separator className="my-12" />

              <CommentSection postId={post.id} />
            </div>
          </article>
        )}
      </main>
      <Footer />
    </>
  );
}
