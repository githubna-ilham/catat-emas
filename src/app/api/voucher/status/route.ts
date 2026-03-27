import { NextRequest, NextResponse } from "next/server";
import { getSupabase } from "@/lib/supabase";
import { verifyApiKey } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const authError = verifyApiKey(request);
  if (authError) return authError;

  const deviceId = request.nextUrl.searchParams.get("device_id");

  if (!deviceId) {
    return NextResponse.json(
      { success: false, error: "Parameter device_id wajib diisi" },
      { status: 400 }
    );
  }

  const supabase = getSupabase();

  // Ambil semua subscription aktif untuk device ini
  const { data: subscriptions, error } = await supabase
    .from("device_subscriptions")
    .select("*")
    .eq("device_id", deviceId)
    .eq("is_active", true)
    .order("activated_at", { ascending: false });

  if (error) {
    return NextResponse.json(
      { success: false, error: "Gagal mengambil data subscription" },
      { status: 500 }
    );
  }

  if (!subscriptions || subscriptions.length === 0) {
    return NextResponse.json({
      success: true,
      data: {
        is_premium: false,
        type: null,
        expires_at: null,
        redeemed_at: null,
      },
    });
  }

  const now = new Date();

  // Cari subscription yang masih aktif (lifetime atau belum expired)
  const activeSub = subscriptions.find(
    (sub) => !sub.expires_at || new Date(sub.expires_at) > now
  );

  if (!activeSub) {
    // Deactivate semua subscription yang sudah expired
    await supabase
      .from("device_subscriptions")
      .update({ is_active: false })
      .eq("device_id", deviceId)
      .not("expires_at", "is", null)
      .lt("expires_at", now.toISOString());

    return NextResponse.json({
      success: true,
      data: {
        is_premium: false,
        type: null,
        expires_at: null,
        redeemed_at: null,
      },
    });
  }

  return NextResponse.json({
    success: true,
    data: {
      is_premium: true,
      type: activeSub.type,
      expires_at: activeSub.expires_at,
      redeemed_at: activeSub.activated_at,
    },
  });
}
