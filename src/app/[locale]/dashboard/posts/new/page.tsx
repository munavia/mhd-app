"use client";

import { useEffect } from "react";
import { useRouter } from "@/i18n/navigation";
import { useAuth } from "@/hooks/useAuth";
import { Skeleton } from "@/components/ui/skeleton";
import { PostEditorForm } from "../_components/PostEditorForm";

export default function NewPostPage() {
  const router = useRouter();
  const { can, hydrated } = useAuth();

  useEffect(() => {
    if (!hydrated) return;
    if (!can("post:create")) {
      router.replace("/dashboard");
    }
  }, [hydrated, can, router]);

  if (!hydrated) {
    return (
      <div className="mx-auto max-w-6xl space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-[400px] w-full" />
      </div>
    );
  }

  if (!can("post:create")) {
    return null;
  }

  return <PostEditorForm mode="create" />;
}
