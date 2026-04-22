import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { parseCallbackResponse } from "@/lib/neoleap";

async function handleCallback(params: URLSearchParams): Promise<NextResponse> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://nick.sa";

  try {
    const result = parseCallbackResponse(params);
    const bookingId = result.trackId || result.udf1 || "";
    const isSuccess = result.result === "CAPTURED";
    console.log("[PAYMENT] Neoleap callback:", JSON.stringify({
      bookingId, result: result.result, authRespCode: result.authRespCode,
      error: result.error, errorText: result.errorText, actionCode: result.actionCode,
    }));

    if (bookingId) {
      // Update booking status
      const updateData: Record<string, unknown> = {
        status: isSuccess ? "confirmed" : "payment_failed",
        updated_at: new Date().toISOString(),
      };

      await supabase
        .from("nick_bookings")
        .update(updateData)
        .eq("id", bookingId);

      // Get confirmation number for redirect
      const { data: booking } = await supabase
        .from("nick_bookings")
        .select("confirmation_number, locale")
        .eq("id", bookingId)
        .single();

      const cn = booking?.confirmation_number || "";
      const locale = booking?.locale || "en";

      if (isSuccess) {
        return NextResponse.redirect(
          `${siteUrl}/payment/result?status=success&cn=${cn}&lang=${locale}`,
          303
        );
      } else {
        const errorTag = result.error || result.authRespCode || result.result;
        const errorDetail = result.errorText || "";
        return NextResponse.redirect(
          `${siteUrl}/payment/result?status=failed&cn=${cn}&lang=${locale}&error=${encodeURIComponent(errorTag)}&detail=${encodeURIComponent(errorDetail)}`,
          303
        );
      }
    }

    return NextResponse.redirect(`${siteUrl}/payment/result?status=failed&error=missing_booking`, 303);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    console.error("[PAYMENT] Callback error:", msg);
    return NextResponse.redirect(
      `${siteUrl}/payment/result?status=failed&error=${encodeURIComponent(msg)}`,
      303
    );
  }
}

// Neoleap may redirect via GET (URL params) or POST (form body)
export async function GET(req: NextRequest) {
  return handleCallback(req.nextUrl.searchParams);
}

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const params = new URLSearchParams();
  formData.forEach((value, key) => params.set(key, value.toString()));
  return handleCallback(params);
}
