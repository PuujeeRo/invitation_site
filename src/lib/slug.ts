// Mongolian Cyrillic -> Latin transliteration (MNS 5217-style), used so a slug like
// naashir.com/bat-dorj-4x9k reads naturally even when the organizer typed a
// Cyrillic name. Falls back to a plain random slug if nothing transliterates.
const CYRILLIC_TO_LATIN: Record<string, string> = {
  а: "a", б: "b", в: "v", г: "g", д: "d", е: "ye", ё: "yo", ж: "j", з: "z",
  и: "i", й: "i", к: "k", л: "l", м: "m", н: "n", о: "o", ө: "o", п: "p",
  р: "r", с: "s", т: "t", у: "u", ү: "u", ф: "f", х: "h", ц: "ts", ч: "ch",
  ш: "sh", щ: "sh", ъ: "", ы: "i", ь: "", э: "e", ю: "yu", я: "ya",
};

function transliterate(input: string): string {
  return input
    .toLowerCase()
    .split("")
    .map((ch) => CYRILLIC_TO_LATIN[ch] ?? ch)
    .join("");
}

export function slugify(name: string): string {
  const base = transliterate(name)
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);

  return base || "invite";
}

const SUFFIX_ALPHABET = "abcdefghijklmnopqrstuvwxyz0123456789";

export function randomSuffix(length = 4): string {
  let out = "";
  for (let i = 0; i < length; i++) {
    out += SUFFIX_ALPHABET[Math.floor(Math.random() * SUFFIX_ALPHABET.length)];
  }
  return out;
}

export function candidateSlug(name: string, suffixLength = 4): string {
  return `${slugify(name)}-${randomSuffix(suffixLength)}`;
}
