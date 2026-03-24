export function formatRupiah(value: number | null): string | null {
  if (!value) return null;
  return "Rp " + value.toLocaleString("id-ID");
}
