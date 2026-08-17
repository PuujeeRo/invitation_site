export function getSiteUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
}

export function invitationUrl(slug: string, guestToken?: string | null): string {
  const base = `${getSiteUrl()}/i/${slug}`;
  return guestToken ? `${base}?to=${guestToken}` : base;
}
