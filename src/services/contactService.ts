import {
  collection,
  doc,
  addDoc,
  deleteDoc,
  getDocs,
  updateDoc,
  query,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { ContactMessage } from "@/types";

const COLLECTION = "contactMessages";

export async function submitContactMessage(data: {
  name: string;
  email: string;
  subject: string;
  message: string;
}): Promise<string> {
  const docRef = await addDoc(collection(db, COLLECTION), {
    ...data,
    read: false,
    createdAt: serverTimestamp(),
  });
  return docRef.id;
}

export async function getAllContactMessages(): Promise<ContactMessage[]> {
  const q = query(collection(db, COLLECTION), orderBy("createdAt", "desc"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(
    (d) => ({ id: d.id, ...d.data() }) as ContactMessage
  );
}

export async function markMessageAsRead(messageId: string): Promise<void> {
  await updateDoc(doc(db, COLLECTION, messageId), { read: true });
}

export async function deleteContactMessage(messageId: string): Promise<void> {
  await deleteDoc(doc(db, COLLECTION, messageId));
}
