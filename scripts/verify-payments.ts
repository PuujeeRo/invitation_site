// Verifies the pure payment logic that has no UI and is dangerous to get wrong:
// currency minor-unit conversion (a bad x100 misbills by 100x) and provider
// selection (a silent fallback to the mock provider would hand out free
// upgrades). Needs no Stripe/QPay account -- it never makes a network call.
//
//   npx tsx scripts/verify-payments.ts
//
// Exits non-zero on any failure.
import { toStripeMinorUnits } from "@/lib/payments/stripe";
import { getPaymentProvider } from "@/lib/payments";

let fails = 0;
function check(label: string, actual: unknown, expected: unknown) {
  const ok = JSON.stringify(actual) === JSON.stringify(expected);
  if (!ok) fails++;
  console.log(`${ok ? "PASS" : "FAIL"}  ${label}  got=${JSON.stringify(actual)} want=${JSON.stringify(expected)}`);
}

console.log("--- toStripeMinorUnits ---");
check("999 MNT (2-decimal per Stripe)", toStripeMinorUnits(999, "MNT"), 99900);
check("999 JPY (zero-decimal)", toStripeMinorUnits(999, "JPY"), 999);
check("lowercase jpy", toStripeMinorUnits(999, "jpy"), 999);
check("10.5 USD", toStripeMinorUnits(10.5, "USD"), 1050);
check("49000 MNT (yearly plan)", toStripeMinorUnits(49000, "MNT"), 4900000);
check("float rounding 0.29 USD", toStripeMinorUnits(0.29, "USD"), 29);

console.log("\n--- getPaymentProvider selection ---");
function withEnv(env: Record<string, string | undefined>, fn: () => void) {
  const keys = ["PAYMENT_PROVIDER","QPAY_CLIENT_ID","QPAY_CLIENT_SECRET","QPAY_INVOICE_CODE","STRIPE_SECRET_KEY","STRIPE_CURRENCY"];
  const saved: Record<string, string | undefined> = {};
  for (const k of keys) { saved[k] = process.env[k]; delete process.env[k]; }
  Object.entries(env).forEach(([k, v]) => { if (v !== undefined) process.env[k] = v; });
  try { fn(); } finally { for (const k of keys) { delete process.env[k]; if (saved[k] !== undefined) process.env[k] = saved[k]; } }
}
const QPAY = { QPAY_CLIENT_ID: "a", QPAY_CLIENT_SECRET: "b", QPAY_INVOICE_CODE: "c" };
const STRIPE = { STRIPE_SECRET_KEY: "sk_test_fake" };

withEnv({}, () => check("no config -> mock", getPaymentProvider().name, "mock"));
withEnv(QPAY, () => check("qpay configured -> qpay", getPaymentProvider().name, "qpay"));
withEnv(STRIPE, () => check("stripe only -> stripe", getPaymentProvider().name, "stripe"));
withEnv({ ...QPAY, ...STRIPE }, () => check("both -> qpay preferred", getPaymentProvider().name, "qpay"));
withEnv({ ...QPAY, ...STRIPE, PAYMENT_PROVIDER: "stripe" }, () => check("pin stripe -> stripe", getPaymentProvider().name, "stripe"));
withEnv({ ...QPAY, PAYMENT_PROVIDER: "mock" }, () => check("pin mock -> mock", getPaymentProvider().name, "mock"));
withEnv(STRIPE, () => check("stripe currency default", getPaymentProvider().currency, "MNT"));
withEnv({ ...STRIPE, STRIPE_CURRENCY: "usd" }, () => check("stripe currency uppercased", getPaymentProvider().currency, "USD"));

// misconfiguration must throw, not silently fall back to mock (free upgrades)
function expectThrow(label: string, fn: () => void) {
  try { fn(); console.log(`FAIL  ${label}  (did not throw)`); fails++; }
  catch { console.log(`PASS  ${label}  (threw as expected)`); }
}
withEnv({ PAYMENT_PROVIDER: "stripe" }, () => expectThrow("pin stripe w/o key throws", () => getPaymentProvider()));
withEnv({ PAYMENT_PROVIDER: "qpay" }, () => expectThrow("pin qpay w/o creds throws", () => getPaymentProvider()));
withEnv({ PAYMENT_PROVIDER: "paypal" }, () => expectThrow("unknown provider throws", () => getPaymentProvider()));

console.log(fails === 0 ? "\nALL PASS" : `\n${fails} FAILURE(S)`);
process.exit(fails === 0 ? 0 : 1);
