import Link from "next/link";
import { getLocale } from "@/i18n/get-locale";
import { getDictionary } from "@/i18n/dictionaries";
import { TopControls } from "@/components/theme/TopControls";

export default async function Home() {
  const locale = await getLocale();
  const t = getDictionary(locale);

  return (
    <div className="flex flex-1 flex-col">
      <header className="flex items-center justify-between px-6 py-4">
        <span className="text-sm font-semibold tracking-tight">{t.common.appName}</span>
        <TopControls />
      </header>
      <div className="flex flex-1 flex-col items-center justify-center bg-zinc-50 px-6 text-center dark:bg-black">
        <p className="text-sm font-medium tracking-wide text-zinc-500 uppercase dark:text-zinc-500">
          {t.landing.eyebrow}
        </p>
        <h1 className="mt-3 max-w-xl text-4xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          {t.landing.title}
        </h1>
        <p className="mt-4 max-w-md text-lg text-zinc-600 dark:text-zinc-400">{t.landing.subtitle}</p>
        <Link
          href="/login"
          className="mt-8 rounded-full bg-zinc-900 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-zinc-700 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
        >
          {t.landing.cta}
        </Link>
      </div>
    </div>
  );
}
