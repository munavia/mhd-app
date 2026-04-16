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
import type { Program } from "@/types";

const COLLECTION = "programs";

/** Split comma/semicolon/newline-separated platform labels into a clean list. */
export function parsePlatformsInput(input: string): string[] {
  return input
    .split(/[,;\n]+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function docToProgram(id: string, data: Record<string, unknown>): Program {
  const platforms = data.platforms;
  return {
    id,
    title: String(data.title ?? ""),
    description: String(data.description ?? ""),
    scheduleShort: String(data.scheduleShort ?? ""),
    schedule: String(data.schedule ?? ""),
    host: String(data.host ?? ""),
    platforms: Array.isArray(platforms)
      ? (platforms as unknown[]).map((p) => String(p))
      : [],
    contactPhone:
      data.contactPhone && String(data.contactPhone).trim()
        ? String(data.contactPhone).trim()
        : undefined,
    website:
      data.website && String(data.website).trim()
        ? String(data.website).trim()
        : undefined,
    imageUrl: String(data.imageUrl ?? ""),
    sortOrder: typeof data.sortOrder === "number" ? data.sortOrder : 0,
    createdAt: data.createdAt as Timestamp,
    updatedAt: data.updatedAt as Timestamp,
  };
}

export async function listProgramsOrdered(): Promise<Program[]> {
  const q = query(collection(db, COLLECTION), orderBy("sortOrder", "asc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) =>
    docToProgram(d.id, d.data() as Record<string, unknown>)
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

export type ProgramWriteInput = {
  title: string;
  description: string;
  scheduleShort: string;
  schedule: string;
  host: string;
  platforms: string[];
  contactPhone?: string;
  website?: string;
  imageUrl: string;
};

export async function createProgram(data: ProgramWriteInput): Promise<string> {
  if (!data.imageUrl.trim()) {
    throw new Error("Program image is required");
  }

  const docRef = await addDoc(collection(db, COLLECTION), {
    title: data.title.trim(),
    description: data.description.trim(),
    scheduleShort: data.scheduleShort.trim(),
    schedule: data.schedule.trim(),
    host: data.host.trim(),
    platforms: data.platforms,
    contactPhone: data.contactPhone?.trim() || "",
    website: data.website?.trim() || "",
    imageUrl: data.imageUrl.trim(),
    sortOrder: await nextSortOrder(),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
}

export async function updateProgram(
  programId: string,
  data: ProgramWriteInput
): Promise<void> {
  if (!data.imageUrl.trim()) {
    throw new Error("Program image is required");
  }

  await updateDoc(doc(db, COLLECTION, programId), {
    title: data.title.trim(),
    description: data.description.trim(),
    scheduleShort: data.scheduleShort.trim(),
    schedule: data.schedule.trim(),
    host: data.host.trim(),
    platforms: data.platforms,
    contactPhone: data.contactPhone?.trim() || "",
    website: data.website?.trim() || "",
    imageUrl: data.imageUrl.trim(),
    updatedAt: serverTimestamp(),
  });
}

export async function deleteProgram(programId: string): Promise<void> {
  await deleteDoc(doc(db, COLLECTION, programId));
}

export async function moveProgram(
  programId: string,
  direction: "up" | "down"
): Promise<void> {
  const programs = await listProgramsOrdered();
  const idx = programs.findIndex((p) => p.id === programId);
  if (idx === -1) return;
  const swapIdx = direction === "up" ? idx - 1 : idx + 1;
  if (swapIdx < 0 || swapIdx >= programs.length) return;

  const a = programs[idx];
  const b = programs[swapIdx];
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
