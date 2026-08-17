const MN_WEEKDAYS = ["Ням", "Даваа", "Мягмар", "Лхагва", "Пүрэв", "Баасан", "Бямба"];

// Hardcoded Mongolian date formatting instead of relying on Intl's 'mn-MN' locale
// data (not guaranteed present in every Node/ICU build) -- keeps this deterministic.
export function formatEventDate(dateStr: string, timeStr?: string | null): string {
  const date = new Date(`${dateStr}T00:00:00`);
  if (Number.isNaN(date.getTime())) return dateStr;

  const weekday = MN_WEEKDAYS[date.getDay()];
  const formatted = `${date.getFullYear()} оны ${date.getMonth() + 1}-р сарын ${date.getDate()}, ${weekday}`;

  if (!timeStr) return formatted;
  return `${formatted}, ${timeStr.slice(0, 5)}`;
}

export function formatShortDate(dateStr: string): string {
  const date = new Date(`${dateStr}T00:00:00`);
  if (Number.isNaN(date.getTime())) return dateStr;
  return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, "0")}.${String(date.getDate()).padStart(2, "0")}`;
}
