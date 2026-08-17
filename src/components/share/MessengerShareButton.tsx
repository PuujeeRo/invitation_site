"use client";

import { useState } from "react";
import { useI18n } from "@/i18n/I18nProvider";

export function MessengerShareButton({ url, title }: { url: string; title: string }) {
  const { dict: t } = useI18n();
  const [copiedFallback, setCopiedFallback] = useState(false);

  async function handleShare() {
    // Web Share API surfaces Messenger as a native share target on mobile --
    // no Facebook App ID needed, unlike the fb-messenger send dialog.
    if (navigator.share) {
      try {
        await navigator.share({ title, url });
        return;
      } catch {
        // User cancelled the share sheet -- nothing to do.
        return;
      }
    }

    try {
      await navigator.clipboard.writeText(url);
      setCopiedFallback(true);
      setTimeout(() => setCopiedFallback(false), 2500);
    } catch {
      // Ignore -- link is still shown on the page for manual copy.
    }
  }

  return (
    <button
      type="button"
      onClick={handleShare}
      className="rounded-lg bg-[#0084FF] px-4 py-2 text-sm font-medium text-white hover:bg-[#006fd6]"
    >
      {copiedFallback ? t.eventOverview.messengerCopied : t.eventOverview.messengerShare}
    </button>
  );
}
