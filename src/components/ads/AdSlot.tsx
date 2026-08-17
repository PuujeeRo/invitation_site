"use client";

import { useEffect } from "react";

declare global {
  interface Window {
    adsbygoogle?: Record<string, unknown>[];
  }
}

export function AdSlot({ clientId, slotId }: { clientId: string; slotId: string }) {
  useEffect(() => {
    try {
      (window.adsbygoogle = window.adsbygoogle ?? []).push({});
    } catch {
      // adsbygoogle.js hasn't loaded yet (slow network) or is blocked by an ad
      // blocker -- either way the <ins> just stays empty, nothing to handle.
    }
  }, []);

  return (
    <ins
      className="adsbygoogle block w-full"
      style={{ display: "block" }}
      data-ad-client={clientId}
      data-ad-slot={slotId}
      data-ad-format="auto"
      data-full-width-responsive="true"
    />
  );
}
