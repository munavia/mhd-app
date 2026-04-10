import {
  collection,
  doc,
  addDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  serverTimestamp,
  updateDoc,
  increment,
  getDocs,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import type { Comment } from "@/types";

const COMMENTS_COLLECTION = "comments";

export async function addComment(data: {
  postId: string;
  userId: string;
  userName: string;
  userPhotoURL?: string;
  content: string;
  parentId?: string;
}): Promise<string> {
  const commentData = {
    ...data,
    userPhotoURL: data.userPhotoURL || "",
    createdAt: serverTimestamp(),
  };

  const docRef = await addDoc(collection(db, COMMENTS_COLLECTION), commentData);

  await updateDoc(doc(db, "posts", data.postId), {
    commentsCount: increment(1),
  });

  return docRef.id;
}

export async function deleteComment(
  commentId: string,
  postId: string
): Promise<void> {
  await deleteDoc(doc(db, COMMENTS_COLLECTION, commentId));
  await updateDoc(doc(db, "posts", postId), {
    commentsCount: increment(-1),
  });
}

export function subscribeToComments(
  postId: string,
  callback: (comments: Comment[]) => void
): () => void {
  const q = query(
    collection(db, COMMENTS_COLLECTION),
    where("postId", "==", postId),
    orderBy("createdAt", "asc")
  );

  return onSnapshot(q, (snapshot) => {
    const comments = snapshot.docs.map(
      (d) => ({ id: d.id, ...d.data() }) as Comment
    );
    callback(comments);
  });
}

export async function getAllComments(): Promise<Comment[]> {
  const q = query(
    collection(db, COMMENTS_COLLECTION),
    orderBy("createdAt", "desc")
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }) as Comment);
}

export async function getCommentsByPost(postId: string): Promise<Comment[]> {
  const q = query(
    collection(db, COMMENTS_COLLECTION),
    where("postId", "==", postId),
    orderBy("createdAt", "asc")
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }) as Comment);
}
