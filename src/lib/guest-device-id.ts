const STORAGE_KEY = "naashir_guest_id";

// One random id per browser, reused across every event this device RSVPs to.
// This is what the (event_id, device_guest_id) unique constraint keys off of --
// see the "Guest Counting Rule" in docs/Naashir_Product_Plan_v1.md.
export function getOrCreateGuestDeviceId(): string {
  if (typeof window === "undefined") return "";

  const existing = window.localStorage.getItem(STORAGE_KEY);
  if (existing) return existing;

  const id = crypto.randomUUID();
  window.localStorage.setItem(STORAGE_KEY, id);
  return id;
}
