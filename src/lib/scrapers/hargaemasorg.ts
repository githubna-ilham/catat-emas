export async function scrapeHargaEmasOrg() {
  const res = await fetch("https://harga-emas.org", {
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      Accept: "text/html",
    },
  });

  if (!res.ok) throw new Error(`HTTP ${res.status}`);

  const html = await res.text();

  // Strip whitespace between tags
  const cleaned = html.replace(/>\s+</g, "><");

  // Parse Antam 1 gram sell price
  const rows = [
    ...cleaned.matchAll(
      /<td><p>([\d.]+)<\/p><\/td><td[^>]*>(?:<div[^>]*>)?<p>([\d.,]+)<\/p>/gi
    ),
  ];

  let sellPrice: number | null = null;
  for (const row of rows) {
    if (parseFloat(row[1]) === 1.0) {
      const price = parseInt(row[2].replace(/[.,\s]/g, ""), 10);
      if (price > 1000000) {
        sellPrice = price;
        break;
      }
    }
  }

  if (!sellPrice) throw new Error("Harga Antam 1 gram tidak ditemukan");

  // Parse buyback price
  let buyPrice: number | null = null;
  const buyMatch = html.match(/pembelian kembali.*?Rp([\d.]+)/is);
  if (buyMatch) {
    buyPrice = parseInt(buyMatch[1].replace(/[.,\s]/g, ""), 10);
  }

  return { sell_price: sellPrice, buy_price: buyPrice };
}
