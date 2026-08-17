import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { LoginForm } from "./login-form";

export default async function LoginPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    redirect("/dashboard");
  }

  return (
    <div className="flex flex-1 items-center justify-center px-6 py-24">
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
          Sign in to Naashir
        </h1>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          We&apos;ll email you a magic link — no password needed.
        </p>
        <LoginForm />
      </div>
    </div>
  );
}
