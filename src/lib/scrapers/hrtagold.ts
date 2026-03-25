export async function scrapeHrtaGold() {
  const res = await fetch("https://hrtagold.id/en/gold-price", {
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      Accept: "text/html",
    },
  });

  if (!res.ok) throw new Error(`HTTP ${res.status}`);

  const html = await res.text();

  // Parse from meta tags: "Beli: Rp 2.605.000 | Jual Rp 2.465.000"
  const buyMatch = html.match(/Beli:\s*Rp\s*([\d.]+)/);
  const sellMatch = html.match(/Jual\s*Rp\s*([\d.]+)/);

  if (!buyMatch) throw new Error("Harga beli tidak ditemukan");

  const sellPrice = parsePrice(buyMatch[1]);  // "Beli" di HRTA = harga jual ke customer
  const buyPrice = sellMatch ? parsePrice(sellMatch[1]) : null; // "Jual" di HRTA = harga buyback

  return { sell_price: sellPrice, buy_price: buyPrice };
}

function parsePrice(text: string): number {
  return parseInt(text.replace(/\./g, ""), 10);
}
