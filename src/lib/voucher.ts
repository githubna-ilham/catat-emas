export function generateVoucherCode(prefix: string): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no 0/O/1/I to avoid confusion
  const segment = () =>
    Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
  return `${prefix}-${segment()}-${segment()}`;
}

export function computeExpiresAt(type: string, from: Date): string | null {
  if (type === "premium_lifetime") return null;

  const days = type === "premium_30d" ? 30 : type === "premium_365d" ? 365 : 0;
  if (days === 0) return null;

  const expires = new Date(from);
  expires.setDate(expires.getDate() + days);
  return expires.toISOString();
}
