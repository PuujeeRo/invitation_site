import Link from "next/link";
import { getLocale } from "@/i18n/get-locale";
import { getDictionary } from "@/i18n/dictionaries";
import { TopControls } from "@/components/theme/TopControls";
import { Logo } from "@/components/brand/Logo";
import { HeaderRow } from "@/components/layout/HeaderRow";
import { InvitationCard } from "@/components/templates/InvitationCard";
import { countdownLabelsFrom } from "@/lib/countdown-labels";
import { SAMPLE_EVENTS, demoPhotoDataUri, demoEventDate } from "@/lib/demo-data";

export default async function Home() {
  const locale = await getLocale();
  const t = getDictionary(locale);

  // Show the product itself in the hero rather than describing it -- reuses the
  // same card component and sample data the /demo page uses.
  const hero = SAMPLE_EVENTS[0];
  const { date, time } = demoEventDate(21);

  const steps = [
    { n: "1", title: t.landing.step1Title, body: t.landing.step1Body },
    { n: "2", title: t.landing.step2Title, body: t.landing.step2Body },
    { n: "3", title: t.landing.step3Title, body: t.landing.step3Body },
  ];

  const pricingRows = [
    { label: t.landing.featureWatermark, free: t.landing.valueYes, paid: t.landing.valueNo },
    { label: t.landing.featureGuestLimit, free: t.landing.valueByType, paid: t.landing.valueUnlimited },
    { label: t.landing.featureDesign, free: t.landing.valueNo, paid: t.landing.valueYes },
    { label: t.landing.featureExtras, free: t.landing.valueNo, paid: t.landing.valueYes },
  ];

  return (
    <div className="flex flex-1 flex-col">
      <header className="px-4 py-4 sm:px-6">
        <HeaderRow maxWidth="3xl">
          <Logo markClassName="h-5 w-5" textClassName="text-base sm:text-lg" />
          <TopControls />
        </HeaderRow>
      </header>

      {/* hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-rose-50/60 via-white to-white px-4 pt-8 pb-14 sm:px-6 sm:pt-12 dark:from-indigo-950/40 dark:via-black dark:to-black">
        <div className="mx-auto flex max-w-7xl flex-col items-center gap-10 lg:flex-row lg:items-center lg:justify-between lg:gap-12">
          <div className="flex max-w-xl flex-col items-center text-center lg:items-start lg:text-left">
            <p className="text-xs font-medium tracking-[0.2em] text-zinc-500 uppercase dark:text-zinc-500">
              {t.landing.eyebrow}
            </p>
            <h1 className="font-display mt-3 text-3xl font-medium text-balance text-zinc-900 sm:text-5xl dark:text-zinc-50">
              {t.landing.title}
            </h1>
            <p className="mt-4 max-w-md text-base text-pretty text-zinc-600 sm:text-lg dark:text-zinc-400">
              {t.landing.subtitle}
            </p>
            <div className="mt-7 flex flex-col items-center gap-3 sm:flex-row">
              <Link
                href="/login"
                className="w-full rounded-full bg-zinc-900 px-6 py-3 text-center text-sm font-medium text-white visited:text-white transition-colors hover:bg-zinc-700 sm:w-auto dark:bg-zinc-50 dark:text-zinc-900 dark:visited:text-zinc-900 dark:hover:bg-zinc-200"
              >
                {t.landing.cta}
              </Link>
              <Link
                href="/demo"
                className="w-full rounded-full border border-zinc-300 px-6 py-3 text-center text-sm font-medium text-zinc-700 visited:text-zinc-700 transition-colors hover:border-zinc-500 sm:w-auto dark:border-zinc-700 dark:text-zinc-300 dark:visited:text-zinc-300"
              >
                {t.landing.demoCta}
              </Link>
            </div>
          </div>

          <div className="animate-drift w-full max-w-xs sm:max-w-sm lg:shrink-0">
            <InvitationCard
              eventName={hero.name}
              eventType={hero.eventType}
              eventDate={date}
              eventTime={time}
              location={hero.location}
              description={hero.description}
              photoUrl={demoPhotoDataUri(hero.photoEmoji, hero.photoColors)}
              templateId={hero.defaultTemplateId}
              isPaid
              countdownEnabled
              mapLinkLabel={t.invite.viewMap}
              watermarkText={t.invite.watermark}
              countdownLabels={countdownLabelsFrom(t)}
            />
          </div>
        </div>
      </section>

      {/* how it works */}
      <section className="px-4 py-14 sm:px-6">
        <div className="mx-auto grid max-w-4xl gap-6 sm:grid-cols-3 sm:gap-8">
          {steps.map((step) => (
            <div key={step.n} className="flex flex-col items-center text-center sm:items-start sm:text-left">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-900 text-xs font-semibold text-white dark:bg-zinc-50 dark:text-zinc-900">
                {step.n}
              </span>
              <h2 className="mt-3 text-sm font-semibold text-zinc-900 dark:text-zinc-50">{step.title}</h2>
              <p className="mt-1 text-sm text-pretty text-zinc-600 dark:text-zinc-400">{step.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* pricing */}
      <section className="border-t border-zinc-200 px-4 py-14 sm:px-6 dark:border-zinc-800">
        <div className="mx-auto max-w-2xl">
          <h2 className="font-display text-center text-2xl font-medium text-zinc-900 sm:text-3xl dark:text-zinc-50">
            {t.landing.pricingTitle}
          </h2>

          <div className="mt-8 overflow-hidden rounded-2xl border border-zinc-200 dark:border-zinc-800">
            <div className="grid grid-cols-3 gap-1 border-b border-zinc-200 bg-zinc-50 px-3 py-3 text-center sm:px-4 dark:border-zinc-800 dark:bg-zinc-900">
              <div />
              <div>
                <p className="text-xs font-semibold text-zinc-900 sm:text-sm dark:text-zinc-50">
                  {t.landing.planFree}
                </p>
                <p className="text-[10px] text-zinc-500 sm:text-xs">{t.landing.planFreeNote}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-zinc-900 sm:text-sm dark:text-zinc-50">
                  {t.landing.planPaid}
                </p>
                <p className="text-[10px] text-zinc-500 sm:text-xs">{t.landing.planPaidNote}</p>
              </div>
            </div>

            {pricingRows.map((row) => (
              <div
                key={row.label}
                className="grid grid-cols-3 items-center gap-1 border-b border-zinc-100 px-3 py-3 text-center last:border-b-0 sm:px-4 dark:border-zinc-800/60"
              >
                <p className="text-left text-[11px] text-zinc-700 sm:text-sm dark:text-zinc-300">{row.label}</p>
                <p className="text-[11px] text-zinc-500 sm:text-sm">{row.free}</p>
                <p className="text-[11px] font-medium text-zinc-900 sm:text-sm dark:text-zinc-50">{row.paid}</p>
              </div>
            ))}
          </div>

          <div className="mt-8 flex justify-center">
            <Link
              href="/login"
              className="rounded-full bg-zinc-900 px-6 py-3 text-sm font-medium text-white visited:text-white transition-colors hover:bg-zinc-700 dark:bg-zinc-50 dark:text-zinc-900 dark:visited:text-zinc-900 dark:hover:bg-zinc-200"
            >
              {t.landing.cta}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
