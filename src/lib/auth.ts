import { NextRequest, NextResponse } from "next/server";

export function verifyApiKey(request: NextRequest): NextResponse | null {
  const apiKey = request.headers.get("x-api-key");

  if (!apiKey || apiKey !== process.env.API_KEY) {
    return NextResponse.json(
      { success: false, message: "Unauthorized. Invalid or missing API Key." },
      { status: 401 }
    );
  }

  return null;
}
