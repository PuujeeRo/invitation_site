"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { setLocale } from "./actions";
import { useI18n } from "./I18nProvider";
import type { Locale } from "./locale";

export function LocaleSwitcher() {
  const { locale } = useI18n();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function switchTo(next: Locale) {
    if (next === locale || isPending) return;
    startTransition(async () => {
      await setLocale(next);
      router.refresh();
    });
  }

  return (
    <div className="flex items-center rounded-full border border-zinc-300 p-0.5 text-xs font-medium dark:border-zinc-700">
      {(["en", "mn"] as const).map((code) => (
        <button
          key={code}
          type="button"
          onClick={() => switchTo(code)}
          disabled={isPending}
          className={`rounded-full px-2 py-1 uppercase transition-colors disabled:opacity-60 ${
            locale === code
              ? "bg-zinc-900 text-white dark:bg-zinc-50 dark:text-zinc-900"
              : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
          }`}
        >
          {code}
        </button>
      ))}
    </div>
  );
}
