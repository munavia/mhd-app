import { ref, uploadBytes, getDownloadURL, deleteObject } from "firebase/storage";
import { storage } from "@/lib/firebase";
import imageCompression from "browser-image-compression";

/** Max size after compression, before upload (bytes) */
export const FEATURED_IMAGE_MAX_BYTES = 150 * 1024;

export const FEATURED_IMAGE_SQUOOSH_URL = "https://squoosh.app/";

export const FEATURED_IMAGE_HELP_TEXT =
  `Featured image: max ${FEATURED_IMAGE_MAX_BYTES / 1024}KB (JPEG, PNG, WebP, or GIF). ` +
  `If your file is too large, compress it with ${FEATURED_IMAGE_SQUOOSH_URL} (works in the browser) then upload again.`;

const ALLOWED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
]);

const COMPRESSION_OPTIONS = {
  maxSizeMB: FEATURED_IMAGE_MAX_BYTES / (1024 * 1024),
  maxWidthOrHeight: 1920,
  useWebWorker: true,
};

export async function uploadImage(
  file: File,
  path: string
): Promise<string> {
  if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
    throw new Error(
      "Please use a JPEG, PNG, WebP, or GIF image. " +
        `For smaller files try ${FEATURED_IMAGE_SQUOOSH_URL}`
    );
  }

  const compressed = await imageCompression(file, COMPRESSION_OPTIONS);

  if (compressed.size > FEATURED_IMAGE_MAX_BYTES) {
    throw new Error(
      `Image is still larger than ${FEATURED_IMAGE_MAX_BYTES / 1024}KB after compression. ` +
        `Try reducing dimensions or quality in ${FEATURED_IMAGE_SQUOOSH_URL} before uploading.`
    );
  }

  const storageRef = ref(storage, path);
  const snapshot = await uploadBytes(storageRef, compressed);
  return getDownloadURL(snapshot.ref);
}

export async function deleteImage(path: string): Promise<void> {
  const storageRef = ref(storage, path);
  await deleteObject(storageRef);
}
