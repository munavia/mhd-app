"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Heart } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import {
  hasUserLiked,
  toggleLike,
} from "@/services/postService";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface LikeButtonProps {
  postId: string;
  initialLikesCount: number;
}

export function LikeButton({ postId, initialLikesCount }: LikeButtonProps) {
  const t = useTranslations("Blog");
  const { user, isAuthenticated } = useAuth();
  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(initialLikesCount);
  const [pending, setPending] = useState(false);

  useEffect(() => {
    setLikesCount(initialLikesCount);
  }, [initialLikesCount]);

  useEffect(() => {
    if (!user?.uid) {
      setLiked(false);
      return;
    }
    let cancelled = false;
    void (async () => {
      try {
        const v = await hasUserLiked(postId, user.uid);
        if (!cancelled) setLiked(v);
      } catch {
        if (!cancelled) setLiked(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [postId, user?.uid]);

  const onToggle = useCallback(async () => {
    if (!isAuthenticated || !user?.uid) {
      toast.error(t("signInToLike"));
      return;
    }
    if (pending) return;

    const prevLiked = liked;
    const prevCount = likesCount;
    setLiked(!prevLiked);
    setLikesCount((c) => (prevLiked ? c - 1 : c + 1));
    setPending(true);

    try {
      const result = await toggleLike(postId, user.uid);
      setLiked(result);
      if (result !== !prevLiked) {
        setLikesCount(
          prevCount + (result && !prevLiked ? 1 : 0) + (!result && prevLiked ? -1 : 0)
        );
      }
    } catch {
      setLiked(prevLiked);
      setLikesCount(prevCount);
      toast.error(t("likeError"));
    } finally {
      setPending(false);
    }
  }, [isAuthenticated, user?.uid, pending, liked, likesCount, postId, t]);

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      className={cn("gap-2", liked && "border-primary/40 bg-primary/5")}
      onClick={onToggle}
      disabled={pending}
      aria-pressed={liked}
    >
      <Heart
        className={cn("size-4", liked && "fill-primary text-primary")}
        aria-hidden
      />
      <span>{likesCount}</span>
    </Button>
  );
}
