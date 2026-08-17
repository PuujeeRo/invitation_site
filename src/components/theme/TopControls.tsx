import { LocaleSwitcher } from "@/i18n/LocaleSwitcher";
import { ThemeToggle } from "./ThemeToggle";

export function TopControls() {
  return (
    <div className="flex items-center gap-2">
      <LocaleSwitcher />
      <ThemeToggle />
    </div>
  );
}
