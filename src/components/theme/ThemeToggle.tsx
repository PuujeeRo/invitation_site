"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "naashir_theme";

function getCurrentTheme(): "light" | "dark" {
  if (typeof document === "undefined") return "light";
  return document.documentElement.classList.contains("dark") ? "dark" : "light";
}

// Single circular toggle. The no-flash script in layout.tsx already resolved
// system vs stored preference and set the .dark class before paint -- this
// component just reflects/toggles that class, it doesn't decide the initial value.
export function ThemeToggle() {
  const [theme, setTheme] = useState<"light" | "dark" | null>(null);

  useEffect(() => {
    // Legitimate exception to the no-setState-in-effect rule: the real theme
    // is a DOM class set by the no-flash inline script (outside React, before
    // hydration), not derived from any prop/state -- it genuinely can't be
    // known during the render that must match SSR output, only read after mount.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTheme(getCurrentTheme());
  }, []);

  function toggle() {
    const next = getCurrentTheme() === "dark" ? "light" : "dark";
    document.documentElement.classList.toggle("dark", next === "dark");
    window.localStorage.setItem(STORAGE_KEY, next);
    setTheme(next);
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label="Toggle theme"
      className="flex h-8 w-8 items-center justify-center rounded-full border border-zinc-300 text-zinc-700 transition-colors hover:border-zinc-500 dark:border-zinc-700 dark:text-zinc-300 dark:hover:border-zinc-500"
    >
      {theme === "dark" ? <MoonIcon /> : <SunIcon />}
    </button>
  );
}

function SunIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="4" />
      <path
        strokeLinecap="round"
        d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"
      />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.354 15.354A9 9 0 0 1 8.646 3.646 9.003 9.003 0 1 0 20.354 15.354Z" />
    </svg>
  );
}
