"use client";

import { useState } from "react";
import { useI18n } from "@/i18n/I18nProvider";

export function CopyLinkButton({ url, label }: { url: string; label?: string }) {
  const { dict: t } = useI18n();
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API unavailable (very old browser / non-HTTPS context) -- ignore.
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="rounded-lg border border-zinc-300 px-3 py-1.5 text-xs font-medium text-zinc-700 hover:border-zinc-500 dark:border-zinc-700 dark:text-zinc-300"
    >
      {copied ? t.eventOverview.copied : (label ?? t.eventOverview.copy)}
    </button>
  );
}
