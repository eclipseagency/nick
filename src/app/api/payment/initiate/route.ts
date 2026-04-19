import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { initiatePayment } from "@/lib/neoleap";
import crypto from "crypto";

function generateConfirmationNumber(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  const bytes = crypto.randomBytes(6);
  for (let i = 0; i < 6; i++) code += chars[bytes[i] % chars.length];
  return `NK-${code}`;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      customer_name, customer_phone, customer_notes,
      car_make, car_year, car_color, preferred_date,
      car_size, package_id, service_ids, addon_ids,
      subtotal, discount, total, locale,
    } = body;

    if (!customer_name || !customer_phone || !car_size || !car_make || !preferred_date) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    if (typeof total !== "number" || total <= 0) {
      return NextResponse.json({ error: "Invalid total amount" }, { status: 400 });
    }

    const confirmation_number = generateConfirmationNumber();

    // Insert booking with pending_payment status
    const { data: booking, error: dbError } = await supabase
      .from("nick_bookings")
      .insert({
        customer_name,
        customer_phone,
        customer_notes: customer_notes || null,
        car_make: car_make || null,
        car_year: car_year || null,
        car_color: car_color || null,
        preferred_date: preferred_date || null,
        car_size,
        package_id: package_id || null,
        service_ids: service_ids || [],
        addon_ids: addon_ids || {},
        subtotal,
        discount: discount || 0,
        total,
        payment_method: "online",
        locale: locale || "en",
        confirmation_number,
        status: "pending_payment",
      })
      .select()
      .single();

    if (dbError) {
      return NextResponse.json({ error: dbError.message }, { status: 500 });
    }

    // Build callback URLs
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://nick.sa";
    const callbackUrl = `${siteUrl}/api/payment/callback`;

    const customerIp = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
      || req.headers.get("x-real-ip") || "127.0.0.1";

    const { paymentUrl } = await initiatePayment({
      amount: total,
      trackId: booking.id,
      customerIp,
      locale: locale || "en",
      responseURL: callbackUrl,
      errorURL: callbackUrl,
    });

    // Store payment URL reference (optional: could store paymentId too)
    return NextResponse.json({
      paymentUrl,
      bookingId: booking.id,
      confirmation_number,
    }, { status: 201 });

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Payment initiation failed";
    console.error("[PAYMENT] Initiation error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
