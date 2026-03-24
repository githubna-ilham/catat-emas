interface Galeri24Result {
  vendorName: string;
  denomination: string;
  sellingPrice: string;
  buybackPrice: string;
  date: string;
}

interface Galeri24Response {
  results: Galeri24Result[];
  next: string | null;
}

export async function scrapeGaleri24() {
  const today = new Date().toISOString().split("T")[0];
  const allResults: Galeri24Result[] = [];
  let page = 1;
  const maxPages = 20;

  while (page <= maxPages) {
    const res = await fetch(
      `https://galeri24.co.id/api/gold-prices?date=${today}&page=${page}`
    );

    if (!res.ok) throw new Error("Tidak bisa mengakses Galeri24 API (kemungkinan IP diblokir)");

    const contentType = res.headers.get("content-type") || "";
    if (!contentType.includes("application/json")) {
      throw new Error("Tidak bisa mengakses Galeri24 API (kemungkinan IP diblokir)");
    }

    const json: Galeri24Response = await res.json();
    if (!json.results) break;

    allResults.push(...json.results);

    if (!json.next) break;
    page++;
  }

  const oneGram = allResults.find(
    (item) => item.vendorName === "GALERI 24" && parseFloat(item.denomination) === 1
  );

  if (!oneGram) throw new Error("Harga 1 gram tidak ditemukan");

  return {
    sell_price: parseInt(oneGram.sellingPrice, 10),
    buy_price: parseInt(oneGram.buybackPrice, 10),
  };
}
