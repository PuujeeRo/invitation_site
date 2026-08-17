import type { RsvpStatus } from "@/lib/supabase/types";

export const RSVP_EMOJI: Record<RsvpStatus, string> = {
  yes: "🎉",
  no: "😔",
  maybe: "🤔",
};

// Shared by the real RsvpWidget and the demo one so they can never drift apart.
// Emoji sits above the label rather than beside it: at 280px (Galaxy Fold) three
// side-by-side buttons get ~60px each, where "Ирэхгүй ❌" on one line would clip.
export function RsvpOptionButtons({
  options,
  selected,
  disabled,
  onSelect,
}: {
  options: { value: RsvpStatus; label: string }[];
  selected: RsvpStatus | null;
  disabled?: boolean;
  onSelect: (value: RsvpStatus) => void;
}) {
  return (
    <div className="mt-3 grid grid-cols-3 gap-1.5 sm:gap-2">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onSelect(opt.value)}
          disabled={disabled}
          aria-pressed={selected === opt.value}
          className={`flex min-w-0 flex-col items-center gap-1 rounded-xl border px-1 py-2.5 text-[11px] leading-tight font-medium transition-colors disabled:opacity-60 sm:px-2 sm:text-xs ${
            selected === opt.value
              ? "border-zinc-900 bg-zinc-900 text-white dark:border-zinc-50 dark:bg-zinc-50 dark:text-zinc-900"
              : "border-zinc-300 text-zinc-700 hover:border-zinc-500 dark:border-zinc-700 dark:text-zinc-300"
          }`}
        >
          <span aria-hidden="true" className="text-base leading-none sm:text-lg">
            {RSVP_EMOJI[opt.value]}
          </span>
          <span className="w-full text-balance">{opt.label}</span>
        </button>
      ))}
    </div>
  );
}
