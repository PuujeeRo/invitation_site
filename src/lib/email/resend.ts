import { Resend } from "resend";
import type { EmailProvider, SendInviteParams } from "./types";

export class ResendEmailProvider implements EmailProvider {
  name = "resend" as const;
  private client: Resend;
  private from: string;

  constructor() {
    const apiKey = process.env.RESEND_API_KEY;
    if (!apiKey) throw new Error("Missing RESEND_API_KEY");
    this.client = new Resend(apiKey);
    this.from = process.env.RESEND_FROM_EMAIL ?? "Naashir <invites@naashir.com>";
  }

  async send({ to, subject, html, text }: SendInviteParams): Promise<{ ok: boolean }> {
    const { error } = await this.client.emails.send({
      from: this.from,
      to,
      subject,
      html,
      text,
    });
    return { ok: !error };
  }
}
