"use client";

import { useEffect, useState } from "react";
import { Link } from "@/i18n/navigation";
import { useRouter } from "@/i18n/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { ChevronLeft } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { postSchema, type PostFormData } from "@/lib/validations";
import { useAuth } from "@/hooks/useAuth";
import { getAllCategories } from "@/services/categoryService";
import {
  uploadImage,
  FEATURED_IMAGE_HELP_TEXT,
} from "@/services/storageService";
import { createPost, updatePost } from "@/services/postService";
import type { Category, Post } from "@/types";

type Mode = "create" | "edit";

export function PostEditorForm({
  mode,
  postId,
  initialPost,
}: {
  mode: Mode;
  postId?: string;
  initialPost?: Post | null;
}) {
  const router = useRouter();
  const { user, can } = useAuth();
  const [categories, setCategories] = useState<Category[]>([]);
  const [tagsInput, setTagsInput] = useState("");
  const [featuredUrl, setFeaturedUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<PostFormData>({
    resolver: zodResolver(postSchema),
    defaultValues: {
      title: "",
      content: "",
      excerpt: "",
      categories: [],
      tags: [],
      status: "draft",
    },
  });

  const status = watch("status");
  const selectedCategories = watch("categories") ?? [];

  useEffect(() => {
    void (async () => {
      try {
        const cats = await getAllCategories();
        setCategories(cats);
      } catch (e) {
        toast.error(
          e instanceof Error ? e.message : "Failed to load categories"
        );
      }
    })();
  }, []);

  useEffect(() => {
    if (mode === "edit" && initialPost) {
      reset({
        title: initialPost.title,
        content: initialPost.content,
        excerpt: initialPost.excerpt || "",
        categories: initialPost.categories ?? [],
        tags: initialPost.tags ?? [],
        status: initialPost.status,
      });
      setTagsInput((initialPost.tags ?? []).join(", "));
      setFeaturedUrl(initialPost.featuredImage?.trim() ?? "");
    }
  }, [mode, initialPost, reset]);

  const toggleCategory = (slug: string) => {
    const next = selectedCategories.includes(slug)
      ? selectedCategories.filter((c) => c !== slug)
      : [...selectedCategories, slug];
    setValue("categories", next, { shouldValidate: true });
  };

  const onFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    setUploading(true);
    try {
      const path = `posts/featured/${user.uid}/${Date.now()}-${file.name.replace(/\s+/g, "_")}`;
      const url = await uploadImage(file, path);
      setFeaturedUrl(url);
      toast.success("Image uploaded");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to upload image"
      );
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const onSave = handleSubmit(async (data) => {
    if (!user) return;
    const tags = tagsInput
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
    const parsed = postSchema.safeParse({ ...data, tags });
    if (!parsed.success) {
      const msg = parsed.error.issues[0]?.message ?? "Invalid form";
      toast.error(msg);
      return;
    }

    const authorName =
      user.displayName || user.email || "Author";

    setSaving(true);
    try {
      if (mode === "create") {
        await createPost({
          title: parsed.data.title,
          content: parsed.data.content,
          excerpt: parsed.data.excerpt || "",
          authorId: user.uid,
          authorName,
          categories: parsed.data.categories,
          tags: parsed.data.tags,
          status: parsed.data.status,
          featuredImage: featuredUrl || undefined,
        });
        toast.success("Post created");
        router.push("/dashboard/posts");
      } else if (postId) {
        await updatePost(postId, {
          title: parsed.data.title,
          content: parsed.data.content,
          excerpt: parsed.data.excerpt || "",
          categories: parsed.data.categories,
          tags: parsed.data.tags,
          status: parsed.data.status,
          featuredImage: featuredUrl,
        });
        toast.success("Post updated");
        router.push("/dashboard/posts");
      }
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Something went wrong"
      );
    } finally {
      setSaving(false);
    }
  });

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <Link
        href="/dashboard/posts"
        className={cn(
          buttonVariants({ variant: "ghost", size: "sm" }),
          "inline-flex gap-1 text-muted-foreground"
        )}
      >
        <ChevronLeft className="size-4" />
        Back to posts
      </Link>

      <h1 className="font-heading text-2xl font-semibold tracking-tight">
        {mode === "create" ? "New post" : "Edit post"}
      </h1>

      <form onSubmit={onSave} className="flex flex-col gap-6 lg:flex-row">
        <div className="min-w-0 flex-[0.65] space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              placeholder="Post title"
              aria-invalid={!!errors.title}
              {...register("title")}
            />
            {errors.title && (
              <p className="text-xs text-destructive">{errors.title.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="content">Content</Label>
            {/* Replace with TipTap editor */}
            <Textarea
              id="content"
              placeholder="Write your post…"
              className="min-h-[320px] resize-y font-mono text-sm"
              aria-invalid={!!errors.content}
              {...register("content")}
            />
            {errors.content && (
              <p className="text-xs text-destructive">
                {errors.content.message}
              </p>
            )}
          </div>
        </div>

        <div className="min-w-0 flex-[0.35] space-y-4">
          <Card className="border-border/60 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Publish</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Status</Label>
                <Select
                  value={status}
                  onValueChange={(v) => {
                    if (v === "published" && !can("post:publish")) {
                      toast.error("You do not have permission to publish");
                      return;
                    }
                    setValue("status", v as PostFormData["status"], {
                      shouldValidate: true,
                    });
                  }}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem
                      value="published"
                      disabled={!can("post:publish")}
                    >
                      Published
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="excerpt">Excerpt</Label>
                <Textarea
                  id="excerpt"
                  placeholder="Short summary for listings"
                  rows={4}
                  {...register("excerpt")}
                />
                {errors.excerpt && (
                  <p className="text-xs text-destructive">
                    {errors.excerpt.message}
                  </p>
                )}
              </div>

              <Separator />

              <div className="space-y-2">
                <Label>Categories</Label>
                <div className="max-h-40 space-y-2 overflow-y-auto rounded-lg border border-border p-3">
                  {categories.length === 0 ? (
                    <p className="text-xs text-muted-foreground">
                      No categories yet. Add some in Settings.
                    </p>
                  ) : (
                    categories.map((cat) => (
                      <label
                        key={cat.id}
                        className="flex cursor-pointer items-center gap-2 text-sm"
                      >
                        <input
                          type="checkbox"
                          className="size-4 rounded border-input"
                          checked={selectedCategories.includes(cat.slug)}
                          onChange={() => toggleCategory(cat.slug)}
                        />
                        <span>{cat.name}</span>
                      </label>
                    ))
                  )}
                </div>
                {errors.categories && (
                  <p className="text-xs text-destructive">
                    {errors.categories.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="tags">Tags</Label>
                <Input
                  id="tags"
                  placeholder="faith, community, prayer"
                  value={tagsInput}
                  onChange={(e) => setTagsInput(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Comma-separated
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="featured">Featured image</Label>
                <p className="text-xs leading-relaxed text-muted-foreground">
                  {FEATURED_IMAGE_HELP_TEXT}
                </p>
                <Input
                  id="featured"
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  disabled={uploading}
                  onChange={(e) => void onFileChange(e)}
                />
                {uploading && (
                  <p className="text-xs text-muted-foreground">Uploading…</p>
                )}
                {featuredUrl ? (
                  <div className="relative mt-2 aspect-video overflow-hidden rounded-lg border border-border bg-muted">
                    <img
                      src={featuredUrl}
                      alt=""
                      className="size-full object-cover"
                    />
                  </div>
                ) : null}
              </div>

              <Button type="submit" className="w-full" disabled={saving}>
                {saving
                  ? "Saving…"
                  : mode === "create"
                    ? "Create post"
                    : "Save changes"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </form>
    </div>
  );
}
