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
import { extractYoutubeVideoId, youtubeThumbnailUrl } from "@/lib/youtube";
import type { Sermon } from "@/types";

const COLLECTION = "sermons";

function docToSermon(id: string, data: Record<string, unknown>): Sermon {
  return {
    id,
    title: String(data.title ?? ""),
    speaker: String(data.speaker ?? ""),
    youtubeUrl: String(data.youtubeUrl ?? ""),
    videoId: String(data.videoId ?? ""),
    thumbnailUrl: data.thumbnailUrl ? String(data.thumbnailUrl) : undefined,
    sortOrder: typeof data.sortOrder === "number" ? data.sortOrder : 0,
    createdAt: data.createdAt as Timestamp,
    updatedAt: data.updatedAt as Timestamp,
  };
}

export async function listSermonsOrdered(): Promise<Sermon[]> {
  const q = query(collection(db, COLLECTION), orderBy("sortOrder", "asc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => docToSermon(d.id, d.data() as Record<string, unknown>));
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

export async function createSermon(data: {
  title: string;
  speaker: string;
  youtubeUrl: string;
  thumbnailUrl?: string;
}): Promise<string> {
  const videoId = extractYoutubeVideoId(data.youtubeUrl);
  if (!videoId) {
    throw new Error("Invalid YouTube URL or video ID");
  }

  const thumb =
    data.thumbnailUrl?.trim() || youtubeThumbnailUrl(videoId, "hq");

  const docRef = await addDoc(collection(db, COLLECTION), {
    title: data.title.trim(),
    speaker: data.speaker.trim(),
    youtubeUrl: data.youtubeUrl.trim(),
    videoId,
    thumbnailUrl: thumb,
    sortOrder: await nextSortOrder(),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
}

export async function updateSermon(
  sermonId: string,
  data: {
    title: string;
    speaker: string;
    youtubeUrl: string;
    thumbnailUrl?: string;
  }
): Promise<void> {
  const videoId = extractYoutubeVideoId(data.youtubeUrl);
  if (!videoId) {
    throw new Error("Invalid YouTube URL or video ID");
  }

  const thumbInput = data.thumbnailUrl?.trim();
  const thumbnailUrl =
    thumbInput && thumbInput.length > 0
      ? thumbInput
      : youtubeThumbnailUrl(videoId, "hq");

  await updateDoc(doc(db, COLLECTION, sermonId), {
    title: data.title.trim(),
    speaker: data.speaker.trim(),
    youtubeUrl: data.youtubeUrl.trim(),
    videoId,
    thumbnailUrl,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteSermon(sermonId: string): Promise<void> {
  await deleteDoc(doc(db, COLLECTION, sermonId));
}

export async function moveSermon(
  sermonId: string,
  direction: "up" | "down"
): Promise<void> {
  const sermons = await listSermonsOrdered();
  const idx = sermons.findIndex((s) => s.id === sermonId);
  if (idx === -1) return;
  const swapIdx = direction === "up" ? idx - 1 : idx + 1;
  if (swapIdx < 0 || swapIdx >= sermons.length) return;

  const a = sermons[idx];
  const b = sermons[swapIdx];
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
