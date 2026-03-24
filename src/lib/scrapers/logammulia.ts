import * as cheerio from "cheerio";

export async function scrapeLogamMulia() {
  const headers = {
    "User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36",
    Accept: "text/html",
  };

  // Harga jual dari halaman utama
  const mainRes = await fetch("https://www.logammulia.com/id", { headers });
  if (!mainRes.ok) throw new Error(`HTTP ${mainRes.status}`);

  const mainHtml = await mainRes.text();
  const sellMatch = mainHtml.match(/Harga\/gram\s*Rp([\d.]+)/i);
  if (!sellMatch) throw new Error("Harga jual emas tidak ditemukan");

  const sellPrice = parseInt(sellMatch[1].replace(/\./g, ""), 10);

  // Harga buyback dari halaman sell/gold
  let buyPrice: number | null = null;
  try {
    const buyRes = await fetch("https://www.logammulia.com/id/sell/gold", { headers });
    if (buyRes.ok) {
      const buyHtml = await buyRes.text();
      const buyMatch = buyHtml.match(/Rp\s*([\d,]+)\s/i);
      if (buyMatch) {
        const parsed = parseInt(buyMatch[1].replace(/,/g, ""), 10);
        if (parsed > 1000000) buyPrice = parsed;
      }
    }
  } catch {
    // buyback price optional
  }

  return { sell_price: sellPrice, buy_price: buyPrice };
}
