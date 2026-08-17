import { LogEmailProvider } from "./log";
import { ResendEmailProvider } from "./resend";
import type { EmailProvider } from "./types";

export function getEmailProvider(): EmailProvider {
  return process.env.RESEND_API_KEY ? new ResendEmailProvider() : new LogEmailProvider();
}

export type { EmailProvider, SendInviteParams } from "./types";
