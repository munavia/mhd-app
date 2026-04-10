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
import type { PrayerRequest } from "@/types";

const COLLECTION = "prayerRequests";

export async function submitPrayerRequest(data: {
  name: string;
  email?: string;
  request: string;
}): Promise<string> {
  const docRef = await addDoc(collection(db, COLLECTION), {
    ...data,
    email: data.email || "",
    prayedFor: false,
    createdAt: serverTimestamp(),
  });
  return docRef.id;
}

export async function getAllPrayerRequests(): Promise<PrayerRequest[]> {
  const q = query(collection(db, COLLECTION), orderBy("createdAt", "desc"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(
    (d) => ({ id: d.id, ...d.data() }) as PrayerRequest
  );
}

export async function markAsPrayedFor(
  requestId: string,
  adminUserId: string
): Promise<void> {
  await updateDoc(doc(db, COLLECTION, requestId), {
    prayedFor: true,
    prayedForBy: adminUserId,
  });
}

export async function unmarkPrayedFor(requestId: string): Promise<void> {
  await updateDoc(doc(db, COLLECTION, requestId), {
    prayedFor: false,
    prayedForBy: null,
  });
}

export async function deletePrayerRequest(requestId: string): Promise<void> {
  await deleteDoc(doc(db, COLLECTION, requestId));
}
