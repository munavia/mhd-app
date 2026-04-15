"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuth } from "@/hooks/useAuth";
import { getPost } from "@/services/postService";
import { PostEditorForm } from "../../_components/PostEditorForm";
import type { Post } from "@/types";

export default function EditPostPage() {
  const params = useParams();
  const id = String(params.id ?? "");
  const { user, can } = useAuth();
  const [post, setPost] = useState<Post | null | undefined>(undefined);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const p = await getPost(id);
        if (!cancelled) setPost(p);
      } catch {
        if (!cancelled) setPost(null);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (post === undefined) {
    return (
      <div className="mx-auto max-w-6xl space-y-4">
        <Skeleton className="h-8 w-48" />
        <div className="flex flex-col gap-6 lg:flex-row">
          <div className="flex-[0.65] space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-72 w-full" />
          </div>
          <div className="flex-[0.35]">
            <Skeleton className="h-96 w-full rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="mx-auto max-w-lg rounded-xl border border-border/60 bg-card p-8 text-center shadow-sm">
        <h1 className="font-heading text-xl font-semibold">Post not found</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          This post may have been deleted or the link is invalid.
        </p>
      </div>
    );
  }

  const canEdit =
    can("post:edit_any") ||
    (can("post:edit_own") && user && post.authorId === user.uid);

  if (!canEdit) {
    return (
      <div className="mx-auto max-w-lg rounded-xl border border-border/60 bg-card p-8 text-center shadow-sm">
        <h1 className="font-heading text-xl font-semibold">Access denied</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          You do not have permission to edit this post.
        </p>
      </div>
    );
  }

  return <PostEditorForm mode="edit" postId={id} initialPost={post} />;
}
