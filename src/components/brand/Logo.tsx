// Naashir brand mark.
//
// Concept: an open invitation. The rounded card silhouette and the small
// diamond ornament deliberately echo the real invitation card (the inset frame
// and the "floral" ornament motif in components/templates), so the logo and the
// product look like the same thing rather than two unrelated designs.
//
// Drawn as pure geometry with no <text>, so it renders identically everywhere
// and stays legible down to favicon size. Uses currentColor -- it inherits the
// surrounding text color and therefore works in both light and dark themes.
export function LogoMark({ className = "h-6 w-6" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      role="img"
      aria-label="Naashir"
    >
      {/* envelope / card body */}
      <rect x="3.5" y="9" width="22" height="16.5" rx="3.5" />
      {/* open flap, folding inward -- "come in" */}
      <path d="M5.2 11.2 L14.5 17.6 L23.8 11.2" />
      {/* ornament sparkle, same four-point diamond used on the card */}
      <path
        d="M27 2.3 Q27.8 4.7 30.2 5.5 Q27.8 6.3 27 8.7 Q26.2 6.3 23.8 5.5 Q26.2 4.7 27 2.3 Z"
        fill="currentColor"
        stroke="none"
      />
    </svg>
  );
}

// Mark + wordmark lockup. The wordmark uses the app's already-loaded Playfair
// Display (font-display), matching invitation headings -- which is why this is a
// component rather than a standalone .svg with <text> in it, since an SVG file
// can't rely on a font being present.
export function Logo({
  className = "",
  markClassName = "h-5 w-5",
  textClassName = "text-base",
}: {
  className?: string;
  markClassName?: string;
  textClassName?: string;
}) {
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <LogoMark className={markClassName} />
      <span className={`font-display font-medium tracking-tight ${textClassName}`}>Naashir</span>
    </span>
  );
}
