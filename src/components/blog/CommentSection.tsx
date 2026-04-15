"use client";

import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { useForm, type FieldErrors, type UseFormRegister } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { MessageCircle, Reply, Trash2 } from "lucide-react";
import type { Comment } from "@/types";
import { useAuth } from "@/hooks/useAuth";
import { commentSchema, type CommentFormData } from "@/lib/validations";
import {
  addComment,
  deleteComment,
  subscribeToComments,
} from "@/services/commentService";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { formatDate, getInitials, cn } from "@/lib/utils";

interface CommentSectionProps {
  postId: string;
}

function CommentBody({
  comment,
  postId,
  depth,
  replyingTo,
  setReplyingTo,
  replyRegister,
  replyErrors,
  replySubmitting,
  onReplySubmit,
  resetReply,
}: {
  comment: Comment;
  postId: string;
  depth: number;
  replyingTo: string | null;
  setReplyingTo: (id: string | null) => void;
  replyRegister: UseFormRegister<CommentFormData>;
  replyErrors: FieldErrors<CommentFormData>;
  replySubmitting: boolean;
  onReplySubmit: (e?: React.BaseSyntheticEvent) => Promise<void>;
  resetReply: () => void;
}) {
  const t = useTranslations("Comments");
  const { user, isAuthenticated } = useAuth();
  const isOwn = !!user?.uid && comment.userId === user.uid;
  const showReplyForm = depth === 0 && replyingTo === comment.id;

  return (
    <div
      className={cn(
        "rounded-lg border border-border/60 bg-card/50 p-4",
        depth > 0 && "ml-6 border-l-2 border-l-primary/25 pl-4"
      )}
    >
      <div className="flex gap-3">
        <Avatar size="sm">
          {comment.userPhotoURL ? (
            <AvatarImage src={comment.userPhotoURL} alt="" />
          ) : null}
          <AvatarFallback className="text-xs">
            {getInitials(comment.userName || "?")}
          </AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-medium text-foreground">{comment.userName}</span>
            <span className="text-xs text-muted-foreground">
              {formatDate(comment.createdAt)}
            </span>
          </div>
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground/90">
            {comment.content}
          </p>
          <div className="flex flex-wrap items-center gap-2">
            {depth === 0 && isAuthenticated && (
              <Button
                type="button"
                variant="ghost"
                size="xs"
                className="gap-1 text-muted-foreground"
                onClick={() => setReplyingTo(showReplyForm ? null : comment.id)}
              >
                <Reply className="size-3.5" aria-hidden />
                {t("reply")}
              </Button>
            )}
            {isOwn && (
              <Button
                type="button"
                variant="ghost"
                size="xs"
                className="gap-1 text-destructive hover:text-destructive"
                onClick={async () => {
                  try {
                    await deleteComment(comment.id, postId);
                    toast.success(t("removed"));
                  } catch {
                    toast.error(t("deleteError"));
                  }
                }}
              >
                <Trash2 className="size-3.5" aria-hidden />
                {t("delete")}
              </Button>
            )}
          </div>
          {showReplyForm && (
            <form
              onSubmit={onReplySubmit}
              className="mt-3 space-y-2 rounded-md border border-border/60 bg-muted/30 p-3"
            >
              <Label htmlFor={`reply-${comment.id}`} className="text-xs">
                {t("replyTo", { name: comment.userName })}
              </Label>
              <Textarea
                id={`reply-${comment.id}`}
                placeholder={t("replyPlaceholder")}
                rows={3}
                className="resize-none"
                {...replyRegister("content")}
              />
              {replyErrors.content && (
                <p className="text-xs text-destructive">{replyErrors.content.message}</p>
              )}
              <div className="flex gap-2">
                <Button type="submit" size="sm" disabled={replySubmitting}>
                  {replySubmitting ? t("posting") : t("postReply")}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    resetReply();
                    setReplyingTo(null);
                  }}
                >
                  {t("cancel")}
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export function CommentSection({ postId }: CommentSectionProps) {
  const t = useTranslations("Comments");
  const tCommon = useTranslations("Common");
  const { user, isAuthenticated } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);

  const mainForm = useForm<CommentFormData>({
    resolver: zodResolver(commentSchema),
    defaultValues: { content: "" },
  });

  const replyForm = useForm<CommentFormData>({
    resolver: zodResolver(commentSchema),
    defaultValues: { content: "" },
  });

  useEffect(() => {
    const unsub = subscribeToComments(postId, setComments);
    return () => unsub();
  }, [postId]);

  const { roots, replyMap } = useMemo(() => {
    const roots: Comment[] = [];
    const replyMap = new Map<string, Comment[]>();
    for (const c of comments) {
      if (!c.parentId) {
        roots.push(c);
      } else {
        const list = replyMap.get(c.parentId) ?? [];
        list.push(c);
        replyMap.set(c.parentId, list);
      }
    }
    return { roots, replyMap };
  }, [comments]);

  const onSubmitMain = mainForm.handleSubmit(async (data) => {
    if (!user?.uid) {
      toast.error(t("signInToComment"));
      return;
    }
    try {
      await addComment({
        postId,
        userId: user.uid,
        userName: user.displayName || user.email || tCommon("member"),
        userPhotoURL: user.photoURL || undefined,
        content: data.content.trim(),
      });
      mainForm.reset();
      toast.success(t("posted"));
    } catch {
      toast.error(t("postError"));
    }
  });

  const onSubmitReply = replyForm.handleSubmit(async (data) => {
    if (!user?.uid || !replyingTo) {
      toast.error(t("signInToReply"));
      return;
    }
    try {
      await addComment({
        postId,
        userId: user.uid,
        userName: user.displayName || user.email || tCommon("member"),
        userPhotoURL: user.photoURL || undefined,
        content: data.content.trim(),
        parentId: replyingTo,
      });
      replyForm.reset();
      setReplyingTo(null);
      toast.success(t("replyPosted"));
    } catch {
      toast.error(t("replyError"));
    }
  });

  return (
    <section className="space-y-6" aria-labelledby="comments-heading">
      <div className="flex items-center gap-2">
        <MessageCircle className="size-5 text-primary" aria-hidden />
        <h2 id="comments-heading" className="font-heading text-xl font-semibold">
          {t("title")}
        </h2>
        <span className="text-sm text-muted-foreground">({comments.length})</span>
      </div>

      {isAuthenticated ? (
        <form onSubmit={onSubmitMain} className="space-y-3">
          <Label htmlFor="new-comment">{t("addLabel")}</Label>
          <Textarea
            id="new-comment"
            placeholder={t("placeholder")}
            rows={4}
            className="resize-none"
            {...mainForm.register("content")}
          />
          {mainForm.formState.errors.content && (
            <p className="text-sm text-destructive">
              {mainForm.formState.errors.content.message}
            </p>
          )}
          <Button type="submit" disabled={mainForm.formState.isSubmitting}>
            {mainForm.formState.isSubmitting ? t("posting") : t("postComment")}
          </Button>
        </form>
      ) : (
        <p className="rounded-lg border border-dashed border-border/60 bg-muted/20 px-4 py-3 text-sm text-muted-foreground">
          {t("signInPrompt")}
        </p>
      )}

      <Separator />

      {roots.length === 0 ? (
        <p className="text-sm text-muted-foreground">{t("empty")}</p>
      ) : (
        <ul className="space-y-4">
          {roots.map((root) => (
            <li key={root.id} className="space-y-3">
              <CommentBody
                comment={root}
                postId={postId}
                depth={0}
                replyingTo={replyingTo}
                setReplyingTo={setReplyingTo}
                replyRegister={replyForm.register}
                replyErrors={replyForm.formState.errors}
                replySubmitting={replyForm.formState.isSubmitting}
                onReplySubmit={onSubmitReply}
                resetReply={() => replyForm.reset()}
              />
              {(replyMap.get(root.id) ?? []).map((reply) => (
                <CommentBody
                  key={reply.id}
                  comment={reply}
                  postId={postId}
                  depth={1}
                  replyingTo={replyingTo}
                  setReplyingTo={setReplyingTo}
                  replyRegister={replyForm.register}
                  replyErrors={replyForm.formState.errors}
                  replySubmitting={replyForm.formState.isSubmitting}
                  onReplySubmit={onSubmitReply}
                  resetReply={() => replyForm.reset()}
                />
              ))}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
