import {
  collection,
  doc,
  addDoc,
  deleteDoc,
  getDocs,
  query,
  orderBy,
  where,
  limit,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { slugify } from "@/lib/utils";
import type { Category } from "@/types";

const COLLECTION = "categories";

export async function createCategory(name: string): Promise<string> {
  const slug = slugify(name);

  const existing = await getCategoryBySlug(slug);
  if (existing) throw new Error("Category already exists");

  const docRef = await addDoc(collection(db, COLLECTION), {
    name,
    slug,
    postCount: 0,
  });
  return docRef.id;
}

export async function deleteCategory(categoryId: string): Promise<void> {
  await deleteDoc(doc(db, COLLECTION, categoryId));
}

export async function getAllCategories(): Promise<Category[]> {
  const q = query(collection(db, COLLECTION), orderBy("name", "asc"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }) as Category);
}

async function getCategoryBySlug(slug: string): Promise<Category | null> {
  const q = query(
    collection(db, COLLECTION),
    where("slug", "==", slug),
    limit(1)
  );
  const snapshot = await getDocs(q);
  if (snapshot.empty) return null;
  const docSnap = snapshot.docs[0];
  return { id: docSnap.id, ...docSnap.data() } as Category;
}
