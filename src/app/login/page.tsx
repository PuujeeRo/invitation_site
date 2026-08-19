import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getLocale } from "@/i18n/get-locale";
import { getDictionary } from "@/i18n/dictionaries";
import { TopControls } from "@/components/theme/TopControls";
import { Logo } from "@/components/brand/Logo";
import { PageContainer } from "@/components/layout/PageContainer";
import { HeaderRow } from "@/components/layout/HeaderRow";
import { LoginForm } from "./login-form";

export default async function LoginPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/dashboard");
  }

  const locale = await getLocale();
  const t = getDictionary(locale);

  return (
    <div className="flex flex-1 flex-col">
      <header className="px-4 py-4 sm:px-6">
        <HeaderRow maxWidth="md">
          <Link href="/" className="text-zinc-900 dark:text-zinc-50">
            <Logo markClassName="h-5 w-5" textClassName="text-base" />
          </Link>
          <TopControls />
        </HeaderRow>
      </header>
      <PageContainer maxWidth="md" className="flex flex-col items-center justify-center">
        <div className="w-full">
          <h1 className="font-display text-2xl font-medium tracking-tight text-zinc-900 dark:text-zinc-50">
            {t.login.heading}
          </h1>
          <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">{t.login.subtitle}</p>
          <LoginForm />
        </div>
      </PageContainer>
    </div>
  );
}
