// events.theme / events.custom_text are untyped jsonb columns -- these helpers
// keep the handful of keys we actually use in one place instead of scattering
// `as` casts across components.

export interface EventTheme {
  accentColor?: string; // hex, paid-only override of the template's accent color
}

export interface EventCustomText {
  greetingOverride?: string; // paid-only, replaces the auto-generated greeting sentence
}

export function readTheme(value: Record<string, unknown> | null | undefined): EventTheme {
  if (!value) return {};
  const accentColor = value.accentColor;
  return typeof accentColor === "string" ? { accentColor } : {};
}

export function readCustomText(value: Record<string, unknown> | null | undefined): EventCustomText {
  if (!value) return {};
  const greetingOverride = value.greetingOverride;
  return typeof greetingOverride === "string" && greetingOverride.trim()
    ? { greetingOverride }
    : {};
}
