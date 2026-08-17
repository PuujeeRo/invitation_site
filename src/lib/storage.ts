import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/types";

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
  const { error } = await supabase.storage.from(EVENT_MEDIA_BUCKET).upload(path, file, {
    cacheControl: "3600",
    upsert: false,
  });
  if (error) throw error;

  const { data } = supabase.storage.from(EVENT_MEDIA_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}
