import Script from "next/script";

// Loaded per-page (not globally in the root layout) so pages that never show
// an ad -- the dashboard, builder, paid invitations -- never pay for it.
export function AdSenseScript({ clientId }: { clientId: string }) {
  return (
    <Script
      async
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${clientId}`}
      crossOrigin="anonymous"
      strategy="afterInteractive"
    />
  );
}
