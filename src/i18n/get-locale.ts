import { cookies } from "next/headers";
import { LOCALE_COOKIE, parseLocale, type Locale } from "./locale";

export async function getLocale(): Promise<Locale> {
  const cookieStore = await cookies();
  return parseLocale(cookieStore.get(LOCALE_COOKIE)?.value);
}
