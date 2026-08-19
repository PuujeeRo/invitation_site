import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";
import { isLocalDevMode } from "@/lib/supabase/local-dev";
import { getSiteUrl } from "@/lib/site-url";

export const EVENT_MEDIA_BUCKET = "event-media";

// Path convention enforced by the storage RLS policies in
// supabase/migrations/0002_storage.sql: first path segment must be the
// uploading organizer's auth.uid().
export function eventMediaPath(organizerId: string, eventId: string, file: File): string {
  const ext = file.name.split(".").pop()?.toLowerCase() ?? "bin";
  const safeExt = /^[a-z0-9]{1,8}$/.test(ext) ? ext : "bin";
  return `${organizerId}/${eventId}/${crypto.randomUUID()}.${safeExt}`;
}

export async function uploadEventPhoto(
  supabase: SupabaseClient<Database>,
  organizerId: string,
  eventId: string,
  file: File
): Promise<string> {
  const path = eventMediaPath(organizerId, eventId, file);

  // Local-dev-only (see lib/supabase/local-dev.ts): there is no storage-api
  // running (Node-based, so theoretically Docker-free, but standing up its own
  // migrations/bucket-backend config wasn't worth it just for photo upload) --
  // write straight to public/uploads instead, served by Next.js's own static
  // file handling. Never runs in production; that path is completely untouched.
  if (isLocalDevMode()) {
    return uploadEventPhotoLocalDisk(path, file);
  }

  const { error } = await supabase.storage.from(EVENT_MEDIA_BUCKET).upload(path, file, {
    cacheControl: "3600",
    upsert: false,
  });
  if (error) throw error;

  const { data } = supabase.storage.from(EVENT_MEDIA_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

async function uploadEventPhotoLocalDisk(path: string, file: File): Promise<string> {
  const { mkdir, writeFile } = await import("node:fs/promises");
  const { dirname, join } = await import("node:path");

  const diskPath = join(process.cwd(), "public", "uploads", path);
  await mkdir(dirname(diskPath), { recursive: true });
  await writeFile(diskPath, Buffer.from(await file.arrayBuffer()));

  return `${getSiteUrl()}/uploads/${path}`;
}
