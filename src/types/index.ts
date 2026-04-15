import { Timestamp } from "firebase/firestore";

export type Role = "admin" | "editor" | "contributor" | "user";

export type PostStatus = "draft" | "published";

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  photoURL?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface Post {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  authorId: string;
  authorName: string;
  status: PostStatus;
  featuredImage?: string;
  categories: string[];
  tags: string[];
  searchKeywords: string[];
  likesCount: number;
  commentsCount: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  publishedAt?: Timestamp;
}

export interface Comment {
  id: string;
  postId: string;
  userId: string;
  userName: string;
  userPhotoURL?: string;
  content: string;
  parentId?: string;
  createdAt: Timestamp;
}

export interface Like {
  id: string;
  postId: string;
  userId: string;
  createdAt: Timestamp;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  postCount: number;
}

export interface PrayerRequest {
  id: string;
  name: string;
  email?: string;
  request: string;
  prayedFor: boolean;
  prayedForBy?: string;
  createdAt: Timestamp;
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  userId?: string;
  read: boolean;
  createdAt: Timestamp;
}

export type Action =
  | "post:create"
  | "post:edit_own"
  | "post:edit_any"
  | "post:publish"
  | "post:delete_own"
  | "post:delete_any"
  | "comment:create"
  | "comment:delete_own"
  | "comment:moderate"
  | "user:manage"
  | "prayer:manage"
  | "contact:manage"
  | "settings:manage";
