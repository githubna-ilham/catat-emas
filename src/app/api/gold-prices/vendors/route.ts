import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import { verifyApiKey } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const authError = verifyApiKey(request);
  if (authError) return authError;

  const { data, error } = await getSupabase()
    .from("gold_price_sources")
    .select("key, name")
    .eq("is_active", true)
    .order("name");

  if (error) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }

  return NextResponse.json({ success: true, data });
}
