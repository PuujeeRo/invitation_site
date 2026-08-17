import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "./actions";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="flex flex-1 flex-col">
      <header className="flex items-center justify-between border-b border-zinc-200 px-6 py-4 dark:border-zinc-800">
        <Link href="/dashboard" className="text-sm font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          Naashir
        </Link>
        <div className="flex items-center gap-4 text-sm text-zinc-600 dark:text-zinc-400">
          <span>{user.email}</span>
          <form action={signOut}>
            <button type="submit" className="hover:text-zinc-900 dark:hover:text-zinc-50">
              Sign out
            </button>
          </form>
        </div>
      </header>
      <main className="flex flex-1 flex-col">{children}</main>
    </div>
  );
}
