import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Timestamp } from "firebase/firestore";
import { getPostBySlug } from "@/services/postService";
import {
  blogPostAbsoluteUrl,
  postDescriptionForMeta,
  postOgImageUrl,
} from "@/lib/siteUrl";
import type { Post } from "@/types";
import BlogPostClient from "./BlogPostClient";

const SITE_NAME = "Ministry of Healing and Deliverance";

function timestampToIso(value: Post["publishedAt"] | Post["updatedAt"]): string | undefined {
  if (!value) return undefined;
  const v = value as Timestamp;
  if (typeof v?.toDate === "function") {
    return v.toDate().toISOString();
  }
  return undefined;
}

type Props = {
  params: Promise<{ locale: string; slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale, slug } = await params;

  const t = await getTranslations({ locale, namespace: "Blog" });

  try {
    const post = await getPostBySlug(slug);
    if (!post) {
      return { title: t("postNotFound") };
    }

    const description = postDescriptionForMeta(post);
    const url = blogPostAbsoluteUrl(post.slug, locale);
    const ogImage = postOgImageUrl(post);
    const published = timestampToIso(post.publishedAt);
    const modified = timestampToIso(post.updatedAt) ?? published;

    return {
      title: post.title,
      description,
      alternates: url ? { canonical: url } : undefined,
      openGraph: {
        type: "article",
        siteName: SITE_NAME,
        title: post.title,
        description,
        ...(url ? { url } : {}),
        ...(published ? { publishedTime: published } : {}),
        ...(modified ? { modifiedTime: modified } : {}),
        ...(ogImage ? { images: [{ url: ogImage, alt: post.title }] } : {}),
      },
      twitter: {
        card: "summary_large_image",
        title: post.title,
        description,
        ...(ogImage ? { images: [ogImage] } : {}),
      },
    };
  } catch {
    return { title: t("postNotFound") };
  }
}

export default async function BlogPostPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <BlogPostClient />;
}
