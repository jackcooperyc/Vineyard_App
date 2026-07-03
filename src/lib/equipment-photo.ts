import { del, put } from "@vercel/blob";
import { mkdir, unlink, writeFile } from "fs/promises";
import path from "path";

const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const MAX_SIZE_BYTES = 5 * 1024 * 1024;

function extensionForMime(type: string): string {
  if (type === "image/png") return "png";
  if (type === "image/webp") return "webp";
  return "jpg";
}

export function getPhotoFromFormData(formData: FormData): File | null {
  const photo = formData.get("photo");
  if (!photo || !(photo instanceof File) || photo.size === 0) {
    return null;
  }
  return photo;
}

export function shouldClearPhoto(formData: FormData): boolean {
  return formData.get("clearPhoto") === "true";
}

export function validateEquipmentPhoto(file: File): string | null {
  if (!ALLOWED_TYPES.has(file.type)) {
    return "Photo must be JPEG, PNG, or WebP";
  }
  if (file.size > MAX_SIZE_BYTES) {
    return "Photo must be 5 MB or smaller";
  }
  return null;
}

export async function uploadEquipmentPhoto(
  file: File,
  equipmentId: string,
): Promise<string> {
  const ext = extensionForMime(file.type);
  const pathname = `equipment/${equipmentId}/${Date.now()}.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const blob = await put(pathname, buffer, {
      access: "public",
      contentType: file.type,
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });
    return blob.url;
  }

  const uploadsDir = path.join(
    process.cwd(),
    "public",
    "uploads",
    "equipment",
    equipmentId,
  );
  await mkdir(uploadsDir, { recursive: true });
  const filename = `${Date.now()}.${ext}`;
  await writeFile(path.join(uploadsDir, filename), buffer);
  return `/uploads/equipment/${equipmentId}/${filename}`;
}

export async function deleteEquipmentPhoto(
  photoUrl: string | null | undefined,
): Promise<void> {
  if (!photoUrl) return;

  if (photoUrl.startsWith("/uploads/")) {
    try {
      await unlink(path.join(process.cwd(), "public", photoUrl));
    } catch {
      // File may already be gone.
    }
    return;
  }

  if (
    process.env.BLOB_READ_WRITE_TOKEN &&
    photoUrl.includes("blob.vercel-storage.com")
  ) {
    try {
      await del(photoUrl, { token: process.env.BLOB_READ_WRITE_TOKEN });
    } catch {
      // Blob may already be gone.
    }
  }
}
