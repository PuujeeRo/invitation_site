import type { EventType } from "@/lib/supabase/types";

export interface SampleEvent {
  id: string;
  eventType: EventType;
  name: string;
  location: string;
  description: string;
  defaultTemplateId: string;
  photoEmoji: string;
  photoColors: [string, string];
}

// No database yet at /demo -- this is fully static, illustrative data only.
export const SAMPLE_EVENTS: SampleEvent[] = [
  {
    id: "wedding",
    eventType: "wedding",
    name: "Бат & Сараа",
    location: "Улаанбаатар, Blue Sky Tower",
    description: "Бидний тусгай өдрийг тэмдэглэхэд бидэнтэй нэгдээрэй.",
    defaultTemplateId: "elegant-gold",
    photoEmoji: "💍",
    photoColors: ["#fde68a", "#fdba74"],
  },
  {
    id: "birthday",
    eventType: "kids_first_birthday",
    name: "Төгөлдөрийн 1 нас",
    location: "Улаанбаатар, Naadamchid center",
    description: "Манай гэрэлт хүүгийн анхны төрсөн өдөрт ирж баярыг хуваалцаарай!",
    defaultTemplateId: "playful-pastel",
    photoEmoji: "🎂",
    photoColors: ["#bae6fd", "#fbcfe8"],
  },
  {
    id: "graduation",
    eventType: "graduation",
    name: "Төгсөлтийн баяр 2026",
    location: "Улаанбаатар, Их сургууль",
    description: "Дөрвөн жилийн хүчин чармайлт өнөөдөр бүтэлгүй боллоо. Бидэнтэй хамт баярлацгаая.",
    defaultTemplateId: "graduation-navy",
    photoEmoji: "🎓",
    photoColors: ["#1e3a8a", "#0f172a"],
  },
];

export function demoPhotoDataUri(emoji: string, [from, to]: [string, string]): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="480" height="360">
    <defs>
      <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="${from}"/>
        <stop offset="100%" stop-color="${to}"/>
      </linearGradient>
    </defs>
    <rect width="480" height="360" fill="url(#g)"/>
    <text x="50%" y="54%" font-size="130" text-anchor="middle" dominant-baseline="middle">${emoji}</text>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

// A date that's always "coming up" relative to whenever the demo is viewed,
// so the countdown timer preview never shows a stale or past date.
export function demoEventDate(daysFromNow: number): { date: string; time: string } {
  const d = new Date();
  d.setDate(d.getDate() + daysFromNow);
  return { date: d.toISOString().slice(0, 10), time: "18:00" };
}
