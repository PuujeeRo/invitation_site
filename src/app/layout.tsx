import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";
import { getLocale } from "@/i18n/get-locale";
import { getDictionary } from "@/i18n/dictionaries";
import { I18nProvider } from "@/i18n/I18nProvider";

// Both fonts load the Cyrillic subset explicitly -- almost all real content
// here is Mongolian Cyrillic, and a Latin-only font (the previous Geist) makes
// the browser silently fall back to a system font for every Cyrillic glyph,
// which is why headings looked inconsistent across machines.
const sans = Inter({
  variable: "--font-sans-custom",
  subsets: ["latin", "cyrillic"],
  display: "swap",
});

// Serif display face for invitation headings -- the single biggest lever on
// making an invitation feel like an invitation rather than a web form.
const display = Playfair_Display({
  variable: "--font-display-custom",
  subsets: ["latin", "cyrillic"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Naashir — Send invitations, get RSVPs",
  description:
    "Create an animated event invitation, share it on Messenger, and watch RSVPs come in live.",
};

// Runs before paint, outside React, so the correct theme is applied with no
// flash: prefers a stored choice, otherwise falls back to the OS preference.
const NO_FLASH_THEME_SCRIPT = `
(function () {
  try {
    var stored = localStorage.getItem("naashir_theme");
    var dark = stored ? stored === "dark" : window.matchMedia("(prefers-color-scheme: dark)").matches;
    document.documentElement.classList.toggle("dark", dark);
  } catch (e) {}
})();
`;

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const locale = await getLocale();
  const dict = getDictionary(locale);

  return (
    <html
      lang={locale}
      className={`${sans.variable} ${display.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: NO_FLASH_THEME_SCRIPT }} />
      </head>
      {/* Background/text color come from the body { background/color: var(...) }
          rule in globals.css, not a hardcoded bg-white/dark:bg-black pair here --
          one source of truth for the theme background instead of two values that
          have to be kept in sync by hand. */}
      <body className="flex min-h-full flex-col">
        <I18nProvider locale={locale} dict={dict}>
          {children}
        </I18nProvider>
      </body>
    </html>
  );
}
