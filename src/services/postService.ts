import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  serverTimestamp,
  increment,
  DocumentSnapshot,
  Timestamp,
  type QueryConstraint,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { slugify, generateSearchKeywords } from "@/lib/utils";
import type { Post, PostStatus } from "@/types";

const POSTS_COLLECTION = "posts";

export async function createPost(data: {
  title: string;
  content: string;
  excerpt?: string;
  authorId: string;
  authorName: string;
  categories: string[];
  tags: string[];
  status: PostStatus;
  featuredImage?: string;
}): Promise<string> {
  const slug = await generateUniqueSlug(data.title);

  const postData = {
    ...data,
    slug,
    excerpt: data.excerpt || "",
    featuredImage: data.featuredImage || "",
    searchKeywords: generateSearchKeywords(data.title),
    likesCount: 0,
    commentsCount: 0,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    ...(data.status === "published" ? { publishedAt: serverTimestamp() } : {}),
  };

  const docRef = await addDoc(collection(db, POSTS_COLLECTION), postData);
  return docRef.id;
}

export async function updatePost(
  postId: string,
  data: Partial<{
    title: string;
    content: string;
    excerpt: string;
    categories: string[];
    tags: string[];
    status: PostStatus;
    featuredImage: string;
  }>
): Promise<void> {
  const updateData: Record<string, unknown> = {
    ...data,
    updatedAt: serverTimestamp(),
  };

  if (data.title) {
    updateData.searchKeywords = generateSearchKeywords(data.title);
  }

  if (data.status === "published") {
    updateData.publishedAt = serverTimestamp();
  }

  await updateDoc(doc(db, POSTS_COLLECTION, postId), updateData);
}

export async function deletePost(postId: string): Promise<void> {
  await deleteDoc(doc(db, POSTS_COLLECTION, postId));
}

export async function getPost(postId: string): Promise<Post | null> {
  const docSnap = await getDoc(doc(db, POSTS_COLLECTION, postId));
  if (!docSnap.exists()) return null;
  return { id: docSnap.id, ...docSnap.data() } as Post;
}

export async function getPostBySlug(slug: string): Promise<Post | null> {
  const q = query(
    collection(db, POSTS_COLLECTION),
    where("slug", "==", slug),
    limit(1)
  );
  const snapshot = await getDocs(q);
  if (snapshot.empty) return null;
  const docSnap = snapshot.docs[0];
  return { id: docSnap.id, ...docSnap.data() } as Post;
}

export async function getPublishedPosts(options?: {
  pageSize?: number;
  cursor?: DocumentSnapshot;
  category?: string;
}): Promise<{ posts: Post[]; lastDoc: DocumentSnapshot | null }> {
  const pageSize = options?.pageSize ?? 9;
  const constraints: QueryConstraint[] = [
    where("status", "==", "published"),
    orderBy("publishedAt", "desc"),
    limit(pageSize),
  ];

  if (options?.category) {
    constraints.unshift(where("categories", "array-contains", options.category));
  }

  if (options?.cursor) {
    constraints.push(startAfter(options.cursor));
  }

  const q = query(collection(db, POSTS_COLLECTION), ...constraints);
  const snapshot = await getDocs(q);
  const posts = snapshot.docs.map(
    (d) => ({ id: d.id, ...d.data() }) as Post
  );
  const lastDoc = snapshot.docs[snapshot.docs.length - 1] || null;

  return { posts, lastDoc };
}

export async function getUserPosts(
  authorId: string,
  status?: PostStatus
): Promise<Post[]> {
  const constraints = [
    where("authorId", "==", authorId),
    orderBy("createdAt", "desc"),
  ];

  if (status) {
    constraints.push(where("status", "==", status));
  }

  const q = query(collection(db, POSTS_COLLECTION), ...constraints);
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }) as Post);
}

export async function getAllPosts(): Promise<Post[]> {
  const q = query(
    collection(db, POSTS_COLLECTION),
    orderBy("createdAt", "desc")
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }) as Post);
}

async function generateUniqueSlug(title: string): Promise<string> {
  let slug = slugify(title);
  let suffix = 0;
  let candidate = slug;

  while (true) {
    const existing = await getPostBySlug(candidate);
    if (!existing) return candidate;
    suffix++;
    candidate = `${slug}-${suffix}`;
  }
}

export async function toggleLike(
  postId: string,
  userId: string
): Promise<boolean> {
  const likeId = `${postId}_${userId}`;
  const likeRef = doc(db, "likes", likeId);
  const likeSnap = await getDoc(likeRef);

  if (likeSnap.exists()) {
    await deleteDoc(likeRef);
    await updateDoc(doc(db, POSTS_COLLECTION, postId), {
      likesCount: increment(-1),
    });
    return false;
  } else {
    const { setDoc } = await import("firebase/firestore");
    await setDoc(likeRef, {
      postId,
      userId,
      createdAt: Timestamp.now(),
    });
    await updateDoc(doc(db, POSTS_COLLECTION, postId), {
      likesCount: increment(1),
    });
    return true;
  }
}

export async function hasUserLiked(
  postId: string,
  userId: string
): Promise<boolean> {
  const likeId = `${postId}_${userId}`;
  const likeRef = doc(db, "likes", likeId);
  const likeSnap = await getDoc(likeRef);
  return likeSnap.exists();
}
