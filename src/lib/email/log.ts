import type { EmailProvider, SendInviteParams } from "./types";

// Dev fallback used when RESEND_API_KEY is absent -- logs instead of sending,
// so the invite/send flow can be exercised without an email provider configured.
export class LogEmailProvider implements EmailProvider {
  name = "log" as const;

  async send({ to, subject }: SendInviteParams): Promise<{ ok: boolean }> {
    console.log(`[email:log] Would send "${subject}" to ${to} (RESEND_API_KEY not set)`);
    return { ok: true };
  }
}
