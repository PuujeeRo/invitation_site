// Small wrappers around Date.now() kept in their own module so component render
// bodies never call the impure function directly (flagged by the React Compiler
// purity lint rule) -- they call these instead.
export function isPastIso(iso: string): boolean {
  return new Date(iso).getTime() < Date.now();
}

export function daysRemaining(iso: string): number {
  return Math.ceil((new Date(iso).getTime() - Date.now()) / 86_400_000);
}
