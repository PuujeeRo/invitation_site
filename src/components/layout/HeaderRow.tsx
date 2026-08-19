import type { ReactNode } from "react";
import { MAX_WIDTH, type PageMaxWidth } from "./PageContainer";

// The inner content row for every <header>. The <header> element itself stays
// full-width (its background/border should span edge-to-edge), but its content
// is centered and capped to line up with the page content below it -- without
// this, `justify-between` pins the logo and controls to the raw viewport edges
// on a wide screen while everything else on the page is centered and capped.
export function HeaderRow({
  maxWidth = "2xl",
  justify = "between",
  className = "",
  children,
}: {
  maxWidth?: PageMaxWidth;
  justify?: "between" | "end";
  className?: string;
  children: ReactNode;
}) {
  const justifyClass = justify === "end" ? "justify-end" : "justify-between";
  return (
    <div className={`mx-auto flex w-full items-center ${justifyClass} ${MAX_WIDTH[maxWidth]} ${className}`}>
      {children}
    </div>
  );
}
