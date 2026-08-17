import { NewEventForm } from "./NewEventForm";

export default function NewEventPage() {
  return (
    <div className="mx-auto w-full max-w-2xl flex-1 px-6 py-10">
      <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">New invitation</h1>
      <div className="mt-8">
        <NewEventForm />
      </div>
    </div>
  );
}
