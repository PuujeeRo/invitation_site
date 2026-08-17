export type OrnamentMotif = "floral" | "rings" | "stars" | "confetti" | "leaf" | "tassel";

export interface Template {
  id: string;
  name: string;
  description: string;
  // Fixed free-plan palette. Paid plan can override the accent via events.theme.
  gradient: string; // tailwind gradient classes
  accent: string; // tailwind text color for the accent / eyebrow
  textOnGradient: string; // tailwind text color that reads on the gradient
  // Per-template personality -- these are what stop all six templates from
  // being the same card in six colors.
  display: "serif" | "sans"; // heading typeface
  ornament: OrnamentMotif; // decorative divider under the greeting
  frameBorder: string; // inset "card within a card" border color
  divider: string; // hairline rule color
  chip: string; // countdown chip background
  uppercaseName?: boolean; // tracked-out caps heading instead of a display serif
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
    display: "serif",
    ornament: "floral",
    frameBorder: "border-rose-900/15",
    divider: "bg-rose-900/15",
    chip: "bg-white/55",
  },
  {
    id: "elegant-gold",
    name: "Elegant Gold",
    description: "Soft gold tones for weddings and formal events.",
    gradient: "from-yellow-100 via-amber-50 to-orange-100",
    accent: "text-amber-700",
    textOnGradient: "text-zinc-900",
    display: "serif",
    ornament: "rings",
    frameBorder: "border-amber-800/20",
    divider: "bg-amber-800/20",
    chip: "bg-white/60",
  },
  {
    id: "midnight",
    name: "Midnight",
    description: "Deep navy with a modern, night-time feel.",
    gradient: "from-slate-900 via-indigo-950 to-slate-900",
    accent: "text-indigo-300",
    textOnGradient: "text-zinc-50",
    display: "sans",
    ornament: "stars",
    frameBorder: "border-indigo-200/20",
    divider: "bg-indigo-200/20",
    chip: "bg-white/10",
    uppercaseName: true,
  },
  {
    id: "playful-pastel",
    name: "Playful Pastel",
    description: "Bright and fun -- great for kids' birthdays.",
    gradient: "from-sky-100 via-pink-100 to-yellow-100",
    accent: "text-pink-600",
    textOnGradient: "text-zinc-900",
    display: "sans",
    ornament: "confetti",
    frameBorder: "border-pink-700/15",
    divider: "bg-pink-700/15",
    chip: "bg-white/60",
  },
  {
    id: "botanical",
    name: "Botanical",
    description: "Soft green, natural and calm.",
    gradient: "from-emerald-100 via-teal-50 to-emerald-50",
    accent: "text-emerald-700",
    textOnGradient: "text-zinc-900",
    display: "serif",
    ornament: "leaf",
    frameBorder: "border-emerald-900/15",
    divider: "bg-emerald-900/15",
    chip: "bg-white/55",
  },
  {
    id: "graduation-navy",
    name: "Cap & Gown",
    description: "Navy and gold, built for graduations.",
    gradient: "from-blue-950 via-slate-900 to-blue-950",
    accent: "text-yellow-400",
    textOnGradient: "text-zinc-50",
    display: "sans",
    ornament: "tassel",
    frameBorder: "border-yellow-200/25",
    divider: "bg-yellow-200/25",
    chip: "bg-white/10",
    uppercaseName: true,
  },
];

export function getTemplate(id: string): Template {
  return TEMPLATES.find((t) => t.id === id) ?? TEMPLATES[0];
}
