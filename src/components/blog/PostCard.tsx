"use client";

import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { motion } from "framer-motion";
import { Heart, MessageSquare } from "lucide-react";
import type { Post } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { formatDate, truncate } from "@/lib/utils";
import { PostShareButtons } from "@/components/blog/PostShareButtons";

interface PostCardProps {
  post: Post;
  /** First grid items: improves LCP when this card is above the fold */
  priorityImage?: boolean;
}

export function PostCard({ post, priorityImage = false }: PostCardProps) {
  const imageUrl = post.featuredImage?.trim();
  const displayDate = post.publishedAt ?? post.createdAt;

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      transition={{ type: "spring", stiffness: 400, damping: 28 }}
      className="h-full"
    >
      <Card className="group flex h-full flex-col overflow-hidden border-border/60 shadow-sm transition-shadow duration-300 hover:shadow-lg">
        <Link href={`/blog/${post.slug}`} className="relative block aspect-[16/10] w-full shrink-0 overflow-hidden bg-muted">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={post.title}
              fill
              priority={priorityImage}
              loading={priorityImage ? "eager" : "lazy"}
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div
              className="absolute inset-0 bg-gradient-to-br from-primary/25 via-primary/10 to-muted"
              aria-hidden
            />
          )}
        </Link>
        <CardContent className="flex flex-1 flex-col gap-3 pt-4">
          {post.categories.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {post.categories.slice(0, 3).map((cat) => (
                <Badge key={cat} variant="secondary" className="font-normal">
                  {cat}
                </Badge>
              ))}
            </div>
          )}
          <Link
            href={`/blog/${post.slug}`}
            className="font-heading text-lg font-semibold leading-snug text-foreground transition-colors hover:text-primary"
          >
            {post.title}
          </Link>
          <p className="line-clamp-3 flex-1 text-sm text-muted-foreground">
            {truncate(post.excerpt || post.title, 120)}
          </p>
        </CardContent>
        <CardFooter className="mt-auto flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-border/60 bg-muted/30 text-xs text-muted-foreground">
          <span className="font-medium text-foreground/90">{post.authorName}</span>
          <span>{formatDate(displayDate)}</span>
          <span className="inline-flex items-center gap-1">
            <Heart className="size-3.5 text-primary/80" aria-hidden />
            {post.likesCount ?? 0}
          </span>
          <span className="inline-flex items-center gap-1">
            <MessageSquare className="size-3.5 text-primary/80" aria-hidden />
            {post.commentsCount ?? 0}
          </span>
          <PostShareButtons title={post.title} slug={post.slug} compact className="ml-auto" />
        </CardFooter>
      </Card>
    </motion.div>
  );
}
