import { TopControls } from "@/components/theme/TopControls";
import { DemoClient } from "./DemoClient";

export default function DemoPage() {
  return (
    <div className="flex flex-1 flex-col bg-zinc-50 dark:bg-black">
      <header className="flex justify-end px-4 py-3">
        <TopControls />
      </header>
      <DemoClient />
    </div>
  );
}
