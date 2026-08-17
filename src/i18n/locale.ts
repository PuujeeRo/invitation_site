export type Locale = "en" | "mn";

export const LOCALE_COOKIE = "naashir_locale";
export const DEFAULT_LOCALE: Locale = "mn";

export function parseLocale(value: string | undefined): Locale {
  return value === "en" ? "en" : DEFAULT_LOCALE;
}
