"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { InvitationCard } from "@/components/templates/InvitationCard";
import { DemoRsvpWidget } from "@/components/rsvp/DemoRsvpWidget";
import { TEMPLATES } from "@/lib/templates";
import { SAMPLE_EVENTS, demoPhotoDataUri, demoEventDate } from "@/lib/demo-data";
import { useI18n } from "@/i18n/I18nProvider";

export function DemoClient() {
  const { dict: t } = useI18n();
  const [sampleId, setSampleId] = useState(SAMPLE_EVENTS[0].id);
  const [templateId, setTemplateId] = useState(SAMPLE_EVENTS[0].defaultTemplateId);
  const [paidPreview, setPaidPreview] = useState(false);

  const sample = SAMPLE_EVENTS.find((s) => s.id === sampleId) ?? SAMPLE_EVENTS[0];
  const { date, time } = useMemo(() => demoEventDate(21), []);

  function selectSample(id: string) {
    setSampleId(id);
    const next = SAMPLE_EVENTS.find((s) => s.id === id);
    if (next) setTemplateId(next.defaultTemplateId);
  }

  return (
    <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col items-center px-4 pb-16">
      <h1 className="mt-4 text-center text-2xl font-semibold text-zinc-900 dark:text-zinc-50">{t.demo.title}</h1>
      <p className="mt-2 max-w-md text-center text-sm text-zinc-600 dark:text-zinc-400">{t.demo.subtitle}</p>

      <div className="mt-8 flex flex-col items-center gap-6 lg:flex-row lg:items-start lg:justify-center">
        <div className="flex flex-col items-center gap-6">
          <InvitationCard
            eventName={sample.name}
            eventType={sample.eventType}
            eventDate={date}
            eventTime={time}
            location={sample.location}
            description={sample.description}
            photoUrl={demoPhotoDataUri(sample.photoEmoji, sample.photoColors)}
            templateId={templateId}
            isPaid={paidPreview}
            countdownEnabled
            mapLink={paidPreview ? "https://maps.google.com" : null}
            mapLinkLabel={t.invite.viewMap}
            watermarkText={t.invite.watermark}
            theme={paidPreview ? { accentColor: sample.photoColors[1] } : undefined}
          />
          <DemoRsvpWidget />
        </div>

        <div className="flex w-full max-w-xs flex-col gap-6">
          <div>
            <p className="text-xs font-medium text-zinc-600 dark:text-zinc-400">{t.demo.sampleEventLabel}</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {SAMPLE_EVENTS.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  onClick={() => selectSample(s.id)}
                  className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                    s.id === sampleId
                      ? "border-zinc-900 bg-zinc-900 text-white dark:border-zinc-50 dark:bg-zinc-50 dark:text-zinc-900"
                      : "border-zinc-300 text-zinc-700 hover:border-zinc-500 dark:border-zinc-700 dark:text-zinc-300"
                  }`}
                >
                  {s.photoEmoji} {s.name}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs font-medium text-zinc-600 dark:text-zinc-400">{t.demo.templateLabel}</p>
            <div className="mt-2 grid grid-cols-3 gap-2">
              {TEMPLATES.map((template) => (
                <button
                  key={template.id}
                  type="button"
                  onClick={() => setTemplateId(template.id)}
                  className={`overflow-hidden rounded-lg border ${
                    template.id === templateId
                      ? "border-zinc-900 ring-1 ring-zinc-900 dark:border-zinc-50 dark:ring-zinc-50"
                      : "border-zinc-300 dark:border-zinc-700"
                  }`}
                  title={template.name}
                >
                  <div className={`h-8 w-full bg-gradient-to-br ${template.gradient}`} />
                </button>
              ))}
            </div>
          </div>

          <label className="flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-300">
            <input
              type="checkbox"
              checked={paidPreview}
              onChange={(e) => setPaidPreview(e.target.checked)}
            />
            {t.demo.paidToggleLabel}
          </label>

          <Link
            href="/login"
            className="rounded-lg bg-zinc-900 px-4 py-2.5 text-center text-sm font-medium text-white visited:text-white hover:bg-zinc-700 dark:bg-zinc-50 dark:text-zinc-900 dark:visited:text-zinc-900 dark:hover:bg-zinc-200"
          >
            {t.demo.cta}
          </Link>
        </div>
      </div>
    </div>
  );
}
