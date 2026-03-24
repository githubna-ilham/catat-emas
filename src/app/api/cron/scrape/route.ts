import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import { scrapers } from "@/lib/scrapers";

export const maxDuration = 60;

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 }
    );
  }

  const supabase = getSupabase();

  const { data: sources } = await supabase
    .from("gold_price_sources")
    .select("key, name, is_active");

  if (!sources) {
    return NextResponse.json(
      { success: false, message: "Tidak ada sumber data" },
      { status: 500 }
    );
  }

  const results: { source: string; status: string; message: string }[] = [];

  for (const source of sources) {
    if (!source.is_active) {
      results.push({ source: source.key, status: "skipped", message: "Nonaktif" });
      continue;
    }

    const scraper = scrapers[source.key];
    if (!scraper) {
      results.push({ source: source.key, status: "error", message: "Scraper tidak ditemukan" });
      continue;
    }

    try {
      const price = await scraper();

      await supabase
        .from("gold_price_sources")
        .update({
          sell_price: price.sell_price,
          buy_price: price.buy_price,
          price_date: new Date().toISOString(),
        })
        .eq("key", source.key);

      results.push({ source: source.key, status: "ok", message: "OK" });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      results.push({ source: source.key, status: "error", message });
    }
  }

  return NextResponse.json({ success: true, results });
}
