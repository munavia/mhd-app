import {
  collection,
  doc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  limit,
  serverTimestamp,
  writeBatch,
  Timestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { UpcomingEvent } from "@/types";

const COLLECTION = "upcomingEvents";

/** For `<input type="datetime-local" />` when editing an event. */
export function timestampToDatetimeLocal(ts: Timestamp): string {
  const d = ts.toDate();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function docToEvent(id: string, data: Record<string, unknown>): UpcomingEvent {
  return {
    id,
    title: String(data.title ?? ""),
    description: String(data.description ?? ""),
    imageUrl: String(data.imageUrl ?? ""),
    startsAt: data.startsAt as Timestamp,
    host: data.host && String(data.host).trim() ? String(data.host).trim() : undefined,
    location:
      data.location && String(data.location).trim()
        ? String(data.location).trim()
        : undefined,
    sortOrder: typeof data.sortOrder === "number" ? data.sortOrder : 0,
    createdAt: data.createdAt as Timestamp,
    updatedAt: data.updatedAt as Timestamp,
  };
}

export async function listUpcomingEventsOrdered(): Promise<UpcomingEvent[]> {
  const q = query(collection(db, COLLECTION), orderBy("sortOrder", "asc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) =>
    docToEvent(d.id, d.data() as Record<string, unknown>)
  );
}

async function nextSortOrder(): Promise<number> {
  const q = query(
    collection(db, COLLECTION),
    orderBy("sortOrder", "desc"),
    limit(1)
  );
  const snap = await getDocs(q);
  if (snap.empty) return 0;
  const top = snap.docs[0].data().sortOrder;
  return typeof top === "number" ? top + 1 : 0;
}

export type UpcomingEventWriteInput = {
  title: string;
  description: string;
  imageUrl: string;
  startsAt: Date;
  host?: string;
  location?: string;
};

export async function createUpcomingEvent(
  data: UpcomingEventWriteInput
): Promise<string> {
  if (!data.imageUrl.trim()) {
    throw new Error("Event image is required");
  }

  const docRef = await addDoc(collection(db, COLLECTION), {
    title: data.title.trim(),
    description: data.description.trim(),
    imageUrl: data.imageUrl.trim(),
    startsAt: Timestamp.fromDate(data.startsAt),
    host: data.host?.trim() || "",
    location: data.location?.trim() || "",
    sortOrder: await nextSortOrder(),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
}

export async function updateUpcomingEvent(
  eventId: string,
  data: UpcomingEventWriteInput
): Promise<void> {
  if (!data.imageUrl.trim()) {
    throw new Error("Event image is required");
  }

  await updateDoc(doc(db, COLLECTION, eventId), {
    title: data.title.trim(),
    description: data.description.trim(),
    imageUrl: data.imageUrl.trim(),
    startsAt: Timestamp.fromDate(data.startsAt),
    host: data.host?.trim() || "",
    location: data.location?.trim() || "",
    updatedAt: serverTimestamp(),
  });
}

export async function deleteUpcomingEvent(eventId: string): Promise<void> {
  await deleteDoc(doc(db, COLLECTION, eventId));
}

export async function moveUpcomingEvent(
  eventId: string,
  direction: "up" | "down"
): Promise<void> {
  const events = await listUpcomingEventsOrdered();
  const idx = events.findIndex((e) => e.id === eventId);
  if (idx === -1) return;
  const swapIdx = direction === "up" ? idx - 1 : idx + 1;
  if (swapIdx < 0 || swapIdx >= events.length) return;

  const a = events[idx];
  const b = events[swapIdx];
  const batch = writeBatch(db);
  batch.update(doc(db, COLLECTION, a.id), {
    sortOrder: b.sortOrder,
    updatedAt: serverTimestamp(),
  });
  batch.update(doc(db, COLLECTION, b.id), {
    sortOrder: a.sortOrder,
    updatedAt: serverTimestamp(),
  });
  await batch.commit();
}
