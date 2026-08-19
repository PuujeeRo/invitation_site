import { TopControls } from "@/components/theme/TopControls";
import { HeaderRow } from "@/components/layout/HeaderRow";
import { DemoClient } from "./DemoClient";

export default function DemoPage() {
  return (
    <div className="flex flex-1 flex-col bg-zinc-50 dark:bg-background">
      <header className="px-4 py-3">
        <HeaderRow maxWidth="3xl" justify="end">
          <TopControls />
        </HeaderRow>
      </header>
      <DemoClient />
    </div>
  );
}
