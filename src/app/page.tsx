import Link from "next/link";
import { CheckIcon, XIcon } from "@phosphor-icons/react/dist/ssr";
import { getLocale } from "@/i18n/get-locale";
import { getDictionary } from "@/i18n/dictionaries";
import { TopControls } from "@/components/theme/TopControls";
import { Logo } from "@/components/brand/Logo";
import { HeaderRow } from "@/components/layout/HeaderRow";
import { InvitationCard } from "@/components/templates/InvitationCard";
import { countdownLabelsFrom } from "@/lib/countdown-labels";
import { SAMPLE_EVENTS, demoPhotoDataUri, demoEventDate } from "@/lib/demo-data";

// Vertical stagger for the three steps at md and up. Literal class names (not
// interpolated) so Tailwind's scanner emits them, and md-prefixed so the
// mobile layout stays a plain single column.
const STEP_OFFSET = ["", "md:mt-10", "md:mt-20"] as const;

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

  // Same four comparison points as before, but carried per plan instead of as a
  // row-per-feature matrix. `has` drives a check/cross where the answer is
  // genuinely boolean; the guest-limit row has a real value on both sides, so
  // it prints that value rather than pretending to be yes/no.
  const planFeatures = [
    { label: t.landing.featureWatermark, free: t.landing.valueYes, paid: t.landing.valueNo, freeHas: false, paidHas: true },
    { label: t.landing.featureGuestLimit, free: t.landing.valueByType, paid: t.landing.valueUnlimited, freeHas: null, paidHas: null },
    { label: t.landing.featureDesign, free: t.landing.valueNo, paid: t.landing.valueYes, freeHas: false, paidHas: true },
    { label: t.landing.featureExtras, free: t.landing.valueNo, paid: t.landing.valueYes, freeHas: false, paidHas: true },
  ];

  return (
    <div className="flex flex-1 flex-col">
      <header className="px-4 py-4 sm:px-6">
        <HeaderRow maxWidth="3xl">
          <Logo markClassName="h-5 w-5" textClassName="text-base sm:text-lg" />
          <TopControls />
        </HeaderRow>
      </header>

      {/* Hero. Asymmetric split: message left, the product itself right.
          The tint is amber in BOTH themes and fades to transparent rather than
          to a colour of its own, so it never bands against the page background
          and the accent hue does not change between light and dark. */}
      <section className="relative overflow-hidden bg-gradient-to-b from-amber-100/50 to-transparent px-4 pt-6 pb-16 sm:px-6 sm:pt-10 dark:from-amber-950/25">
        <div className="mx-auto flex max-w-7xl flex-col items-center gap-10 lg:flex-row lg:items-center lg:justify-between lg:gap-16">
          <div className="flex max-w-xl flex-col items-center text-center lg:items-start lg:text-left">
            <h1 className="font-display text-3xl font-medium text-balance text-zinc-900 sm:text-5xl dark:text-zinc-50">
              {t.landing.title}
            </h1>
            <p className="mt-4 max-w-md text-base text-pretty text-zinc-600 sm:text-lg dark:text-zinc-400">
              {t.landing.subtitle}
            </p>
            <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row">
              <Link
                href="/login"
                className="w-full rounded-full bg-zinc-900 px-6 py-3 text-center text-sm font-medium text-white transition-transform visited:text-white hover:bg-zinc-700 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-zinc-900 focus-visible:ring-offset-2 focus-visible:outline-none sm:w-auto dark:bg-zinc-50 dark:text-zinc-900 dark:visited:text-zinc-900 dark:hover:bg-zinc-200 dark:focus-visible:ring-zinc-100"
              >
                {t.landing.cta}
              </Link>
              <Link
                href="/demo"
                className="w-full rounded-full border border-zinc-300 px-6 py-3 text-center text-sm font-medium text-zinc-700 transition-transform visited:text-zinc-700 hover:border-zinc-500 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-zinc-900 focus-visible:ring-offset-2 focus-visible:outline-none sm:w-auto dark:border-zinc-700 dark:text-zinc-300 dark:visited:text-zinc-300 dark:hover:border-zinc-500 dark:focus-visible:ring-zinc-100"
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

      {/* How it works. Three steps, but deliberately not three identical
          columns: each step sits lower than the one before it on desktop, so
          the eye reads them as a sequence rather than scanning them as a menu
          of equal options. No boxes: the numbers and the spacing carry it. */}
      <section className="reveal px-4 py-16 sm:px-6">
        <div className="mx-auto max-w-5xl">
          <ol className="grid gap-10 md:grid-cols-3 md:gap-8">
            {steps.map((step, i) => (
              <li
                key={step.n}
                className={`relative flex flex-col items-center text-center md:items-start md:text-left ${STEP_OFFSET[i]}`}
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-zinc-900 text-xs font-semibold text-white dark:bg-zinc-50 dark:text-zinc-900">
                  {step.n}
                </span>
                <h2 className="mt-4 text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                  {step.title}
                </h2>
                <p className="mt-1.5 max-w-[34ch] text-sm text-pretty text-zinc-600 dark:text-zinc-400">
                  {step.body}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Pricing. Two plan cards rather than a feature matrix: the old table put
          a hairline under every row and made four small comparisons compete
          with each other, when the real decision is only ever "free or 999". */}
      <section className="reveal border-t border-zinc-200 px-4 py-16 sm:px-6 dark:border-zinc-800">
        <div className="mx-auto max-w-3xl">
          <h2 className="font-display text-center text-2xl font-medium text-zinc-900 sm:text-3xl dark:text-zinc-50">
            {t.landing.pricingTitle}
          </h2>

          <div className="mt-10 grid gap-4 sm:grid-cols-2">
            {/* Free */}
            <div className="rounded-2xl border border-zinc-200 p-6 dark:border-zinc-800">
              <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                {t.landing.planFree}
              </p>
              <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                {t.landing.planFreeNote}
              </p>
              <ul className="mt-6 space-y-3">
                {planFeatures.map((f) => (
                  <li key={f.label} className="flex items-start gap-2.5 text-sm">
                    <PlanMark has={f.freeHas} />
                    <span className="text-zinc-600 dark:text-zinc-400">
                      {f.label}
                      {f.freeHas === null && (
                        <span className="text-zinc-900 dark:text-zinc-200">: {f.free}</span>
                      )}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Paid. Carries the page's one accent, so the recommended plan is
                the only amber thing in the section. */}
            <div className="rounded-2xl border border-amber-300 bg-amber-50/40 p-6 dark:border-amber-900 dark:bg-amber-950/20">
              <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                {t.landing.planPaid}
              </p>
              <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
                {t.landing.planPaidNote}
              </p>
              <ul className="mt-6 space-y-3">
                {planFeatures.map((f) => (
                  <li key={f.label} className="flex items-start gap-2.5 text-sm">
                    <PlanMark has={f.paidHas} />
                    <span className="text-zinc-700 dark:text-zinc-300">
                      {f.label}
                      {f.paidHas === null && (
                        <span className="font-medium text-zinc-900 dark:text-zinc-100">
                          : {f.paid}
                        </span>
                      )}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-10 flex justify-center">
            <Link
              href="/login"
              className="rounded-full bg-zinc-900 px-6 py-3 text-sm font-medium text-white transition-transform visited:text-white hover:bg-zinc-700 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-zinc-900 focus-visible:ring-offset-2 focus-visible:outline-none dark:bg-zinc-50 dark:text-zinc-900 dark:visited:text-zinc-900 dark:hover:bg-zinc-200 dark:focus-visible:ring-zinc-100"
            >
              {t.landing.cta}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}

// `null` means the row carries a real value on both plans rather than a
// yes/no, so no mark is drawn and the value is printed inline instead.
function PlanMark({ has }: { has: boolean | null }) {
  if (has === null) {
    return <span aria-hidden="true" className="mt-2 h-1 w-1 shrink-0 rounded-full bg-zinc-400" />;
  }
  return has ? (
    <CheckIcon
      weight="bold"
      aria-hidden="true"
      className="mt-0.5 h-4 w-4 shrink-0 text-zinc-900 dark:text-zinc-100"
    />
  ) : (
    <XIcon
      weight="bold"
      aria-hidden="true"
      className="mt-0.5 h-4 w-4 shrink-0 text-zinc-400 dark:text-zinc-600"
    />
  );
}
