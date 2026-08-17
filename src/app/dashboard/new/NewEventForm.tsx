"use client";

import { useActionState } from "react";
import { EVENT_TYPES } from "@/lib/event-types";
import { TEMPLATES } from "@/lib/templates";
import { createEvent, type CreateEventState } from "./actions";

const initialState: CreateEventState = {};

export function NewEventForm() {
  const [state, formAction, isPending] = useActionState(createEvent, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-10">
      <section>
        <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">1. Event type</h2>
        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {EVENT_TYPES.map((type, i) => (
            <label
              key={type.id}
              className="flex cursor-pointer flex-col gap-1 rounded-xl border border-zinc-300 px-4 py-3 text-sm has-checked:border-zinc-900 has-checked:ring-1 has-checked:ring-zinc-900 dark:border-zinc-700 dark:has-checked:border-zinc-50 dark:has-checked:ring-zinc-50"
            >
              <input
                type="radio"
                name="event_type"
                value={type.id}
                defaultChecked={i === 0}
                className="sr-only"
              />
              <span className="font-medium text-zinc-900 dark:text-zinc-50">{type.labelMn}</span>
              <span className="text-xs text-zinc-500">{type.label}</span>
            </label>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">2. Details</h2>
        <div className="mt-3 flex flex-col gap-3">
          <Field label="Name (e.g. Bat & Dorj, or Bat-Erdene's Birthday)">
            <input name="name" required maxLength={80} className={inputClass} />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Date">
              <input type="date" name="event_date" required className={inputClass} />
            </Field>
            <Field label="Time">
              <input type="time" name="event_time" className={inputClass} />
            </Field>
          </div>
          <Field label="Location">
            <input name="location" maxLength={140} className={inputClass} />
          </Field>
          <Field label="Short description">
            <textarea name="description" maxLength={400} rows={3} className={inputClass} />
          </Field>
          <Field label="Photo">
            <input type="file" name="photo" accept="image/*" className="text-sm" />
          </Field>
        </div>
      </section>

      <section>
        <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">3. Template</h2>
        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {TEMPLATES.map((template, i) => (
            <label
              key={template.id}
              className="cursor-pointer overflow-hidden rounded-xl border border-zinc-300 has-checked:border-zinc-900 has-checked:ring-1 has-checked:ring-zinc-900 dark:border-zinc-700 dark:has-checked:border-zinc-50 dark:has-checked:ring-zinc-50"
            >
              <input
                type="radio"
                name="template_id"
                value={template.id}
                defaultChecked={i === 0}
                className="sr-only"
              />
              <div className={`h-16 w-full bg-gradient-to-br ${template.gradient}`} />
              <div className="px-3 py-2">
                <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50">{template.name}</p>
                <p className="text-xs text-zinc-500">{template.description}</p>
              </div>
            </label>
          ))}
        </div>
      </section>

      {state.error && (
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="self-start rounded-lg bg-zinc-900 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-700 disabled:opacity-60 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
      >
        {isPending ? "Creating…" : "Create invitation"}
      </button>
    </form>
  );
}

const inputClass =
  "rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 outline-none focus:border-zinc-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400">{label}</span>
      {children}
    </label>
  );
}
