import type { OrnamentMotif } from "@/lib/templates";

// Decorative divider under the greeting. Pure currentColor SVG so it inherits
// the template accent (or the paid custom accent) with no extra plumbing.
export function Ornament({ motif, className = "" }: { motif: OrnamentMotif; className?: string }) {
  return (
    <svg
      viewBox="0 0 140 14"
      className={`h-3 w-24 sm:w-32 ${className}`}
      fill="none"
      stroke="currentColor"
      aria-hidden="true"
      focusable="false"
    >
      {/* flanking hairlines, shared by every motif */}
      <path d="M2 7 H52" strokeWidth="1" opacity="0.5" strokeLinecap="round" />
      <path d="M88 7 H138" strokeWidth="1" opacity="0.5" strokeLinecap="round" />
      <Motif motif={motif} />
    </svg>
  );
}

function Motif({ motif }: { motif: OrnamentMotif }) {
  switch (motif) {
    case "rings":
      return (
        <>
          <circle cx="64" cy="7" r="5" strokeWidth="1.2" />
          <circle cx="76" cy="7" r="5" strokeWidth="1.2" />
        </>
      );
    case "stars":
      return (
        <>
          <path d="M70 1 L71.6 5.4 L76 7 L71.6 8.6 L70 13 L68.4 8.6 L64 7 L68.4 5.4 Z" fill="currentColor" stroke="none" />
          <circle cx="58" cy="7" r="1.3" fill="currentColor" stroke="none" />
          <circle cx="82" cy="7" r="1.3" fill="currentColor" stroke="none" />
        </>
      );
    case "confetti":
      return (
        <>
          <circle cx="60" cy="5" r="1.6" fill="currentColor" stroke="none" />
          <rect x="67" y="3" width="3" height="3" rx="0.6" fill="currentColor" stroke="none" transform="rotate(20 68.5 4.5)" />
          <circle cx="78" cy="6" r="1.6" fill="currentColor" stroke="none" />
          <rect x="62" y="9" width="3" height="3" rx="0.6" fill="currentColor" stroke="none" transform="rotate(-15 63.5 10.5)" />
          <circle cx="74" cy="11" r="1.3" fill="currentColor" stroke="none" />
        </>
      );
    case "leaf":
      return (
        <>
          <path d="M70 13 V2" strokeWidth="1" strokeLinecap="round" />
          <path d="M70 5 C 65 3, 62 5, 62 7 C 65 8, 69 7, 70 5 Z" strokeWidth="1" />
          <path d="M70 5 C 75 3, 78 5, 78 7 C 75 8, 71 7, 70 5 Z" strokeWidth="1" />
          <path d="M70 9 C 66.5 8, 64.5 9.5, 64.5 11 C 67 11.5, 69.5 10.5, 70 9 Z" strokeWidth="1" />
        </>
      );
    case "tassel":
      return (
        <>
          <path d="M62 5 L70 2 L78 5 L70 8 Z" strokeWidth="1.1" />
          <path d="M76 6 V10" strokeWidth="1" strokeLinecap="round" />
          <circle cx="76" cy="11.5" r="1.4" fill="currentColor" stroke="none" />
        </>
      );
    case "floral":
    default:
      return (
        <>
          <path d="M70 2 L72.5 7 L70 12 L67.5 7 Z" strokeWidth="1.1" />
          <circle cx="60" cy="7" r="1.4" fill="currentColor" stroke="none" />
          <circle cx="80" cy="7" r="1.4" fill="currentColor" stroke="none" />
        </>
      );
  }
}
