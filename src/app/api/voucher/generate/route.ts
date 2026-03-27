import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import { generateVoucherCode } from "@/lib/voucher";

const VALID_TYPES = ["premium_lifetime", "premium_30d", "premium_365d"];

export async function POST(request: NextRequest) {
  // Admin auth via CRON_SECRET
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  let body: { type?: string; count?: number; prefix?: string; expires_at?: string; max_usage?: number };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, error: "Request body tidak valid" },
      { status: 400 }
    );
  }

  const { type, count = 1, prefix = "EMAS", expires_at, max_usage = 1 } = body;

  if (!type || !VALID_TYPES.includes(type)) {
    return NextResponse.json(
      { success: false, error: `Type harus salah satu dari: ${VALID_TYPES.join(", ")}` },
      { status: 400 }
    );
  }

  if (count < 1 || count > 100) {
    return NextResponse.json(
      { success: false, error: "Count harus antara 1 - 100" },
      { status: 400 }
    );
  }

  if (max_usage < 1 || max_usage > 10000) {
    return NextResponse.json(
      { success: false, error: "max_usage harus antara 1 - 10000" },
      { status: 400 }
    );
  }

  const supabase = getSupabase();
  const codes: string[] = [];
  const rows = [];

  for (let i = 0; i < count; i++) {
    const code = generateVoucherCode(prefix.toUpperCase());
    codes.push(code);
    rows.push({
      code,
      type,
      max_usage,
      used_count: 0,
      expires_at: expires_at ?? null,
    });
  }

  const { error } = await supabase.from("vouchers").insert(rows);

  if (error) {
    return NextResponse.json(
      { success: false, error: `Gagal generate voucher: ${error.message}` },
      { status: 500 }
    );
  }

  return NextResponse.json({
    success: true,
    data: { codes },
  });
}
