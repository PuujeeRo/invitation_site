export function AstronautIllustration({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 240 240"
      className={className}
      role="img"
      aria-label="An astronaut floating and drifting off, tethered by a loose cord"
    >
      <defs>
        <linearGradient id="visor" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#818cf8" />
          <stop offset="100%" stopColor="#4338ca" />
        </linearGradient>
        <linearGradient id="suit" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#f8fafc" />
          <stop offset="100%" stopColor="#e2e8f0" />
        </linearGradient>
      </defs>

      {/* drifting tether cord */}
      <path
        d="M132 150 C 160 168, 150 195, 178 205"
        fill="none"
        stroke="#94a3b8"
        strokeWidth="3"
        strokeLinecap="round"
        strokeDasharray="1 10"
      />

      {/* backpack */}
      <rect x="86" y="96" width="34" height="56" rx="10" fill="#cbd5e1" />

      {/* legs */}
      <rect x="92" y="150" width="18" height="40" rx="9" fill="url(#suit)" />
      <rect x="122" y="150" width="18" height="40" rx="9" fill="url(#suit)" />
      <rect x="88" y="184" width="26" height="16" rx="7" fill="#475569" />
      <rect x="118" y="184" width="26" height="16" rx="7" fill="#475569" />

      {/* arms */}
      <path d="M92 118 C 66 122, 58 100, 66 82" fill="none" stroke="url(#suit)" strokeWidth="20" strokeLinecap="round" />
      <path d="M140 122 C 162 132, 168 112, 158 96" fill="none" stroke="url(#suit)" strokeWidth="20" strokeLinecap="round" />
      <circle cx="65" cy="80" r="11" fill="#e2e8f0" />
      <circle cx="159" cy="94" r="11" fill="#e2e8f0" />

      {/* torso */}
      <rect x="82" y="108" width="66" height="66" rx="30" fill="url(#suit)" />
      <rect x="102" y="130" width="26" height="18" rx="6" fill="#a5b4fc" />
      <circle cx="96" cy="150" r="4" fill="#94a3b8" />
      <circle cx="134" cy="150" r="4" fill="#94a3b8" />

      {/* helmet */}
      <circle cx="115" cy="82" r="40" fill="#f1f5f9" stroke="#cbd5e1" strokeWidth="4" />
      <ellipse cx="118" cy="84" rx="24" ry="22" fill="url(#visor)" />
      <ellipse cx="109" cy="75" rx="6" ry="4" fill="#ffffff" opacity="0.8" />

      {/* scattered stars */}
      <g fill="currentColor" className="text-amber-300">
        <circle cx="45" cy="40" r="2.5" className="animate-twinkle" style={{ animationDelay: "0s" }} />
        <circle cx="190" cy="60" r="2" className="animate-twinkle" style={{ animationDelay: "0.6s" }} />
        <circle cx="200" cy="150" r="2.5" className="animate-twinkle" style={{ animationDelay: "1.1s" }} />
        <circle cx="30" cy="140" r="2" className="animate-twinkle" style={{ animationDelay: "1.6s" }} />
        <circle cx="60" cy="200" r="2" className="animate-twinkle" style={{ animationDelay: "0.3s" }} />
      </g>
    </svg>
  );
}
