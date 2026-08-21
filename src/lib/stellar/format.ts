/**
 * Amount helpers. Stellar amounts are integers of 1/10^7 units ("stroops"), and
 * every amount stays a **string** end to end — `Number` silently rounds past 15
 * significant digits, which is inside the range a token supply can reach.
 */
export const STELLAR_DECIMALS = 7;

/** int64 max in stroops → the largest amount a classic asset can represent. */
export const MAX_STROOPS = 9_223_372_036_854_775_807n;
export const MAX_AMOUNT_DISPLAY = "922,337,203,685.4775807";

/** `"12.5"` → `125000000n` */
export function toStroops(amount: string): bigint {
  const trimmed = amount.trim().replace(/,/g, "");
  if (!/^\d+(\.\d+)?$/.test(trimmed)) {
    throw new Error(`Not a positive decimal amount: ${amount}`);
  }
  const [whole, fraction = ""] = trimmed.split(".");
  if (fraction.length > STELLAR_DECIMALS) {
    throw new Error(`At most ${STELLAR_DECIMALS} decimal places are allowed`);
  }
  return BigInt(whole + fraction.padEnd(STELLAR_DECIMALS, "0"));
}

/** `125000000n` → `"12.5"` */
export function fromStroops(stroops: bigint): string {
  const negative = stroops < 0n;
  const abs = negative ? -stroops : stroops;
  const base = 10n ** BigInt(STELLAR_DECIMALS);
  const whole = abs / base;
  const fraction = (abs % base).toString().padStart(STELLAR_DECIMALS, "0").replace(/0+$/, "");
  return `${negative ? "-" : ""}${whole}${fraction ? `.${fraction}` : ""}`;
}

/**
 * Group thousands and clamp to `maxFractionDigits` for reading. Never used for
 * the confirmation screen — that one shows the exact value.
 */
export function formatAmount(amount: string, maxFractionDigits = 4): string {
  const [whole, fraction = ""] = amount.split(".");
  const grouped = whole.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  if (!fraction) return grouped;

  const clamped = fraction.slice(0, maxFractionDigits).replace(/0+$/, "");
  if (!clamped) return grouped;
  // Don't render a real, non-zero balance as a rounded "0.00".
  if (whole === "0" && Number(clamped) === 0) return `< 0.${"0".repeat(maxFractionDigits - 1)}1`;
  return `${grouped}.${clamped}`;
}

/** `GABC…X7QK` — for glancing only; confirmation screens show the full value. */
export function truncateAddress(address: string, lead = 4, tail = 4): string {
  if (address.length <= lead + tail + 1) return address;
  return `${address.slice(0, lead)}…${address.slice(-tail)}`;
}

export function truncateHash(hash: string): string {
  return truncateAddress(hash, 6, 6);
}

/** Canonical `CODE:ISSUER` identifier — an asset code alone is never enough. */
export function assetId(code: string, issuer: string): string {
  return `${code}:${issuer}`;
}
