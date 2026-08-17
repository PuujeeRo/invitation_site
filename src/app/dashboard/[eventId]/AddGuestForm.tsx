"use client";

import { useActionState } from "react";
import { useI18n } from "@/i18n/I18nProvider";
import { addNamedGuest, type AddGuestState } from "./actions";

const initialState: AddGuestState = {};

const ERROR_KEY = {
  missing_event: "guestErrorMissingEvent",
  required: "guestErrorRequired",
  generic: "guestErrorGeneric",
} as const;

export function AddGuestForm({ eventId }: { eventId: string }) {
  const { dict: t } = useI18n();
  const [state, formAction, isPending] = useActionState(addNamedGuest, initialState);

  return (
    <form action={formAction} className="flex flex-wrap items-end gap-2">
      <input type="hidden" name="event_id" value={eventId} />
      <div className="flex flex-col gap-1">
        <label className="text-xs text-zinc-600 dark:text-zinc-400">{t.eventOverview.firstNameLabel}</label>
        <input name="first_name" required className={inputClass} />
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-xs text-zinc-600 dark:text-zinc-400">{t.eventOverview.lastNameLabel}</label>
        <input name="last_name" className={inputClass} />
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-xs text-zinc-600 dark:text-zinc-400">{t.eventOverview.emailLabel}</label>
        <input name="email" type="email" className={inputClass} />
      </div>
      <button
        type="submit"
        disabled={isPending}
        className="rounded-lg bg-zinc-900 px-4 py-2 text-sm font-medium text-white hover:bg-zinc-700 disabled:opacity-60 dark:bg-zinc-50 dark:text-zinc-900"
      >
        {isPending ? t.eventOverview.addingGuest : t.eventOverview.addGuest}
      </button>
      {state.error && (
        <p className="w-full text-xs text-red-600 dark:text-red-400">{t.eventOverview[ERROR_KEY[state.error]]}</p>
      )}
    </form>
  );
}

const inputClass =
  "rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50";
