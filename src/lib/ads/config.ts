export interface AdSenseConfig {
  clientId: string; // e.g. "ca-pub-XXXXXXXXXXXXXXXX"
  inviteSlotId: string; // ad unit ("slot") id for the free-plan invitation page placement
}

// Returns null until both env vars are set -- every ad-slot component checks
// this and renders nothing (or a dev-only placeholder) instead of a broken
// unit, so the app works fine with no AdSense account at all, same as the
// payments/email providers.
export function getAdSenseConfig(): AdSenseConfig | null {
  const clientId = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID;
  const inviteSlotId = process.env.NEXT_PUBLIC_ADSENSE_INVITE_SLOT_ID;
  if (!clientId || !inviteSlotId) return null;
  return { clientId, inviteSlotId };
}
