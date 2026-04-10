import {
  collection,
  doc,
  getDoc,
  getDocs,
  updateDoc,
  query,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Role, User } from "@/types";

const USERS_COLLECTION = "users";

export async function getUser(userId: string): Promise<User | null> {
  const docSnap = await getDoc(doc(db, USERS_COLLECTION, userId));
  if (!docSnap.exists()) return null;
  return { id: docSnap.id, ...docSnap.data() } as User;
}

export async function getAllUsers(): Promise<User[]> {
  const q = query(
    collection(db, USERS_COLLECTION),
    orderBy("createdAt", "desc")
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }) as User);
}

export async function updateUserRole(
  userId: string,
  role: Role
): Promise<void> {
  await updateDoc(doc(db, USERS_COLLECTION, userId), {
    role,
    updatedAt: serverTimestamp(),
  });
}
