import { getLocale } from "@/i18n/get-locale";
import { getDictionary } from "@/i18n/dictionaries";
import { PageContainer } from "@/components/layout/PageContainer";
import { NewEventForm } from "./NewEventForm";

export default async function NewEventPage() {
  const locale = await getLocale();
  const t = getDictionary(locale);

  return (
    <PageContainer maxWidth="lg">
      <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">{t.newEvent.title}</h1>
      <div className="mt-8">
        <NewEventForm />
      </div>
    </PageContainer>
  );
}
