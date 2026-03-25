import { scrapeAnekalogam } from "./anekalogam";
import { scrapeGaleri24 } from "./galeri24";
import { scrapeLogamMulia } from "./logammulia";
import { scrapeHargaEmasOrg } from "./hargaemasorg";
import { scrapeHrtaGold } from "./hrtagold";

export const scrapers: Record<string, () => Promise<{ sell_price: number; buy_price: number | null }>> = {
  anekalogam: scrapeAnekalogam,
  galeri24: scrapeGaleri24,
  logammulia: scrapeLogamMulia,
  "harga-emas-org": scrapeHargaEmasOrg,
  hrtagold: scrapeHrtaGold,
};
