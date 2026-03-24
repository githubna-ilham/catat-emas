import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import { verifyApiKey } from "@/lib/auth";
import { formatRupiah } from "@/lib/format";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ key: string }> }
) {
  const authError = verifyApiKey(request);
  if (authError) return authError;

  const { key } = await params;

  const { data: source, error } = await getSupabase()
    .from("gold_price_sources")
    .select("*")
    .eq("key", key)
    .single();

  if (error || !source) {
    return NextResponse.json(
      { success: false, message: "Vendor tidak ditemukan." },
      { status: 404 }
    );
  }

  if (!source.is_active) {
    return NextResponse.json(
      { success: false, message: `${source.name} sedang nonaktif.` },
      { status: 503 }
    );
  }

  if (!source.sell_price) {
    return NextResponse.json(
      { success: false, message: "Belum ada data harga." },
      { status: 404 }
    );
  }

  return NextResponse.json({
    success: true,
    data: {
      key: source.key,
      name: source.name,
      sell_price: source.sell_price,
      buy_price: source.buy_price,
      formatted_sell_price: formatRupiah(source.sell_price),
      formatted_buy_price: formatRupiah(source.buy_price),
      price_date: source.price_date?.split("T")[0] ?? null,
    },
  });
}
