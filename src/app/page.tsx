import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center bg-zinc-50 px-6 text-center dark:bg-black">
      <p className="text-sm font-medium tracking-wide text-zinc-500 uppercase dark:text-zinc-500">Naashir</p>
      <h1 className="mt-3 max-w-xl text-4xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50">
        Send a beautiful invitation in a few clicks
      </h1>
      <p className="mt-4 max-w-md text-lg text-zinc-600 dark:text-zinc-400">
        Create an animated invitation, share the link on Messenger, and watch RSVPs come in live.
      </p>
      <Link
        href="/login"
        className="mt-8 rounded-full bg-zinc-900 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-zinc-700 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200"
      >
        Create an invitation
      </Link>
    </div>
  );
}
