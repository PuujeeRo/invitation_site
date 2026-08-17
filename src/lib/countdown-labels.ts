import type { Dictionary } from "@/i18n/dictionaries";
import type { CountdownLabels } from "@/components/templates/CountdownTimer";

export function countdownLabelsFrom(t: Dictionary): CountdownLabels {
  return {
    days: t.invite.countdownDays,
    hours: t.invite.countdownHours,
    minutes: t.invite.countdownMinutes,
    seconds: t.invite.countdownSeconds,
    started: t.invite.countdownStarted,
  };
}
