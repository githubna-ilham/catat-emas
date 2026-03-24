import * as cheerio from "cheerio";

export async function scrapeAnekalogam() {
  const res = await fetch("https://www.anekalogam.co.id/id", {
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      Accept: "text/html",
    },
  });

  if (!res.ok) throw new Error(`HTTP ${res.status}`);

  const html = await res.text();
  const $ = cheerio.load(html);

  let sellPrice: number | null = null;
  let buyPrice: number | null = null;

  $("tr").each((_, row) => {
    const link = $(row).find("a.view-product");
    if (link.text().trim() === "1gram") {
      const prices = $(row).find(".lm-price span:last-child");
      if (prices.length >= 2) {
        sellPrice = parsePrice(prices.eq(0).text());
        buyPrice = parsePrice(prices.eq(1).text());
      }
    }
  });

  if (!sellPrice) throw new Error("Harga 1 gram tidak ditemukan");

  return { sell_price: sellPrice, buy_price: buyPrice };
}

function parsePrice(text: string): number {
  return parseInt(text.replace(/[.\s,]/g, ""), 10);
}
