export interface Template {
  id: string;
  name: string;
  description: string;
  // Fixed free-plan palette. Paid plan can override via events.theme.
  gradient: string; // tailwind gradient classes
  accent: string; // tailwind text/border color for the accent
  textOnGradient: string; // tailwind text color that reads on the gradient
}

// 6 templates for v1 -- fewer, nicer, per the product doc.
export const TEMPLATES: Template[] = [
  {
    id: "classic",
    name: "Classic",
    description: "Warm and simple, works for any event.",
    gradient: "from-amber-100 via-rose-100 to-amber-50",
    accent: "text-rose-600",
    textOnGradient: "text-zinc-900",
  },
  {
    id: "elegant-gold",
    name: "Elegant Gold",
    description: "Soft gold tones for weddings and formal events.",
    gradient: "from-yellow-100 via-amber-50 to-orange-100",
    accent: "text-amber-700",
    textOnGradient: "text-zinc-900",
  },
  {
    id: "midnight",
    name: "Midnight",
    description: "Deep navy with a modern, night-time feel.",
    gradient: "from-slate-900 via-indigo-950 to-slate-900",
    accent: "text-indigo-300",
    textOnGradient: "text-zinc-50",
  },
  {
    id: "playful-pastel",
    name: "Playful Pastel",
    description: "Bright and fun -- great for kids' birthdays.",
    gradient: "from-sky-100 via-pink-100 to-yellow-100",
    accent: "text-pink-600",
    textOnGradient: "text-zinc-900",
  },
  {
    id: "botanical",
    name: "Botanical",
    description: "Soft green, natural and calm.",
    gradient: "from-emerald-100 via-teal-50 to-emerald-50",
    accent: "text-emerald-700",
    textOnGradient: "text-zinc-900",
  },
  {
    id: "graduation-navy",
    name: "Cap & Gown",
    description: "Navy and gold, built for graduations.",
    gradient: "from-blue-950 via-slate-900 to-blue-950",
    accent: "text-yellow-400",
    textOnGradient: "text-zinc-50",
  },
];

export function getTemplate(id: string): Template {
  return TEMPLATES.find((t) => t.id === id) ?? TEMPLATES[0];
}
