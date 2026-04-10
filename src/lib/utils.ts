import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { Timestamp } from "firebase/firestore";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function formatDate(
  timestamp: Timestamp | Date | undefined,
  options?: Intl.DateTimeFormatOptions
): string {
  if (!timestamp) return "";
  const date =
    timestamp instanceof Timestamp ? timestamp.toDate() : timestamp;
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    ...options,
  });
}

export function generateSearchKeywords(title: string): string[] {
  const words = title.toLowerCase().split(/\s+/).filter(Boolean);
  const keywords: string[] = [];
  for (const word of words) {
    const cleaned = word.replace(/[^\w]/g, "");
    if (cleaned.length > 1) {
      keywords.push(cleaned);
    }
  }
  return [...new Set(keywords)];
}

export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trimEnd() + "...";
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}
