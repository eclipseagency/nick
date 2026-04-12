import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import crypto from "crypto";

// ─── Rate limiter (in-memory, per IP) ────────────────────────────────
const rateLimitMap = new Map<string, { count: number; reset: number }>();
const RATE_LIMIT = 5; // max bookings per window
const RATE_WINDOW = 60 * 60 * 1000; // 1 hour

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now > entry.reset) {
    rateLimitMap.set(ip, { count: 1, reset: now + RATE_WINDOW });
    return false;
  }
  entry.count++;
  return entry.count > RATE_LIMIT;
}

// Hardcoded addon prices (mirrors client-side Booking.tsx)
// addonTier "low" → p.small, addonTier "high" → p.large
const ADDON_PRICES: Record<string, { small: number; large: number }> = {
  ozone: { small: 100, large: 150 },
  "rim-ceramic": { small: 400, large: 400 },
  "engine-clean": { small: 100, large: 150 },
  "remove-tint": { small: 200, large: 300 },
  "remove-partial": { small: 250, large: 350 },
  "remove-front": { small: 400, large: 500 },
  "remove-full": { small: 1200, large: 1400 },
};

// Service → addon tier mapping (mirrors client-side)
const SERVICE_ADDON_TIER: Record<string, "low" | "high"> = {
  "ppf-color": "high",
  "ppf-clear75": "low",
  "ppf-clear85": "low",
  "ppf-matte": "low",
  "wrapping": "low",
  "ppf-front": "high",
  "ppf-partial": "low",
  "ppf-interior": "low",
  "tint-plus": "low",
  "tint-flex": "low",
  "tint-lite": "low",
  "tint-front-max": "high",
  "tint-front-pro": "high",
  "tint-front-plus": "high",
  "tint-front-flex": "high",
  "tint-front-lite": "high",
  "ceramic-int-1": "low",
  "ceramic-ext-1": "high",
  "ceramic-ext-3": "low",
  "ceramic-ext-5": "low",
};

function generateConfirmationNumber(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // no I/O/0/1 to avoid confusion
  let code = "";
  const bytes = crypto.randomBytes(6);
  for (let i = 0; i < 6; i++) {
    code += chars[bytes[i] % chars.length];
  }
  return `NK-${code}`;
}

function getAddonPrice(
  addonId: string,
  addonTier: "low" | "high",
): number {
  const prices = ADDON_PRICES[addonId];
  if (!prices) return 0;
  return addonTier === "high" ? prices.large : prices.small;
}

export async function POST(req: NextRequest) {
  // Rate limit check
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "unknown";
  if (isRateLimited(ip)) {
    return NextResponse.json(
      { error: "Too many booking requests. Please try again later." },
      { status: 429 },
    );
  }

  try {
    const body = await req.json();

    const {
      customer_name,
      customer_phone,
      customer_notes,
      car_make,
      car_year,
      car_color,
      preferred_date,
      car_size,
      package_id,
      service_ids,
      addon_ids,
      subtotal,
      discount,
      total,
      payment_method,
      locale,
    } = body;

    if (!customer_name || !customer_phone || !car_size || !payment_method || !car_make || !preferred_date) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    if (car_size !== "small" && car_size !== "large") {
      return NextResponse.json(
        { error: "Invalid car_size, must be 'small' or 'large'" },
        { status: 400 },
      );
    }

    const svcIds: string[] = service_ids || [];
    const addonMap: Record<string, string[]> = addon_ids || {};

    // ─── 1. Server-side price validation ───────────────────────────────
    if (svcIds.length > 0) {
      const priceField = car_size === "small" ? "price_small" : "price_large";

      const { data: dbServices, error: svcError } = await supabase
        .from("nick_services")
        .select(`id, ${priceField}`)
        .in("id", svcIds);

      if (svcError) {
        console.error("Failed to fetch services for validation:", svcError.message);
        // Non-blocking: proceed without validation if DB query fails
      } else if (dbServices) {
        const priceMap = new Map(
          dbServices.map((s: Record<string, unknown>) => [s.id as string, (s[priceField] as number) || 0]),
        );

        // Sum service prices
        let expectedSubtotal = 0;
        for (const id of svcIds) {
          expectedSubtotal += priceMap.get(id) || 0;
        }

        // Sum addon prices
        for (const [svcId, addons] of Object.entries(addonMap)) {
          const tier = SERVICE_ADDON_TIER[svcId] || "low";
          for (const addonId of addons) {
            expectedSubtotal += getAddonPrice(addonId, tier);
          }
        }

        // Check subtotal mismatch (allow up to 10%)
        const clientSubtotal = typeof subtotal === "number" ? subtotal : 0;
        if (expectedSubtotal > 0 && clientSubtotal > 0) {
          const diff = Math.abs(expectedSubtotal - clientSubtotal);
          const threshold = expectedSubtotal * 0.1;
          if (diff > threshold) {
            return NextResponse.json(
              {
                error: "Price mismatch detected. Please refresh and try again.",
                expected: expectedSubtotal,
                received: clientSubtotal,
              },
              { status: 400 },
            );
          }
        }
      }
    }

    // ─── 2. Duplicate booking detection ────────────────────────────────
    const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000).toISOString();

    const { data: existing } = await supabase
      .from("nick_bookings")
      .select("id, confirmation_number")
      .eq("customer_phone", customer_phone)
      .contains("service_ids", svcIds)
      .gte("created_at", twoMinutesAgo)
      .limit(1)
      .maybeSingle();

    if (existing) {
      return NextResponse.json(
        {
          error: "Duplicate booking detected",
          confirmation_number: existing.confirmation_number,
          booking_id: existing.id,
        },
        { status: 409 },
      );
    }

    // ─── 3. Generate confirmation number & insert ──────────────────────
    const confirmation_number = generateConfirmationNumber();

    const { data, error } = await supabase
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
        service_ids: svcIds,
        addon_ids: addonMap,
        subtotal,
        discount: discount || 0,
        total,
        payment_method,
        locale: locale || "en",
        confirmation_number,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // ─── 4. Email notification (fire-and-forget) ────────────────────────
    const notifyEmails = ["s.mohammed@nick.sa", "m.halawa@nick.sa"];
    const serviceList = svcIds.join(", ") || "—";
    const addonList = Object.values(addonMap).flat().join(", ") || "—";
    const emailSubject = `New Booking ${confirmation_number} — ${customer_name}`;
    const emailBody = [
      `<div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:24px;background:#0a0a0a;color:#f5f5f5;border-radius:12px;">`,
      `<div style="text-align:center;margin-bottom:20px;"><img src="https://nick.sa/images/nick-logo.png" alt="NICK" width="80" /></div>`,
      `<h2 style="color:#F6BE00;margin:0 0 16px;">New Booking Received</h2>`,
      `<table style="width:100%;border-collapse:collapse;font-size:14px;">`,
      `<tr><td style="padding:8px 0;color:#999;">Confirmation</td><td style="padding:8px 0;font-weight:bold;color:#F6BE00;">${confirmation_number}</td></tr>`,
      `<tr><td style="padding:8px 0;color:#999;">Customer</td><td style="padding:8px 0;">${customer_name}</td></tr>`,
      `<tr><td style="padding:8px 0;color:#999;">Phone</td><td style="padding:8px 0;"><a href="tel:${customer_phone}" style="color:#F6BE00;">${customer_phone}</a></td></tr>`,
      `<tr><td style="padding:8px 0;color:#999;">Car</td><td style="padding:8px 0;">${car_make || "—"} ${car_year || ""} ${car_color || ""} (${car_size})</td></tr>`,
      `<tr><td style="padding:8px 0;color:#999;">Preferred Date</td><td style="padding:8px 0;">${preferred_date || "—"}</td></tr>`,
      `<tr><td style="padding:8px 0;color:#999;">Services</td><td style="padding:8px 0;">${serviceList}</td></tr>`,
      `<tr><td style="padding:8px 0;color:#999;">Addons</td><td style="padding:8px 0;">${addonList}</td></tr>`,
      `<tr><td style="padding:8px 0;color:#999;">Total</td><td style="padding:8px 0;font-weight:bold;font-size:18px;color:#F6BE00;">${total?.toLocaleString()} SAR</td></tr>`,
      `<tr><td style="padding:8px 0;color:#999;">Payment</td><td style="padding:8px 0;">${payment_method}</td></tr>`,
      customer_notes ? `<tr><td style="padding:8px 0;color:#999;">Notes</td><td style="padding:8px 0;">${customer_notes}</td></tr>` : "",
      `</table>`,
      `<p style="margin-top:20px;font-size:12px;color:#666;">Sent from nick.sa booking system</p>`,
      `</div>`,
    ].join("");

    // Send via Resend API (Vercel-friendly, no SMTP needed)
    const resendKey = process.env.RESEND_API_KEY;
    if (resendKey) {
      fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${resendKey}`,
        },
        body: JSON.stringify({
          from: "NICK Bookings <bookings@nick.sa>",
          to: notifyEmails,
          subject: emailSubject,
          html: emailBody,
        }),
      }).catch((err) => {
        console.error("Email notification failed:", err.message);
      });
    } else {
      console.log(`[BOOKING] No RESEND_API_KEY set — skipping email notification for ${confirmation_number}`);
    }

    // ─── 5. Webhook notification (fire-and-forget) ─────────────────────
    const webhookUrl = process.env.BOOKING_WEBHOOK_URL;
    if (webhookUrl) {
      fetch(webhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          event: "new_booking",
          confirmation_number,
          customer_name,
          customer_phone,
          car_make: car_make || null,
          car_year: car_year || null,
          car_color: car_color || null,
          preferred_date: preferred_date || null,
          car_size,
          package_id: package_id || null,
          service_ids: svcIds,
          addon_ids: addonMap,
          subtotal,
          discount: discount || 0,
          total,
          payment_method,
          locale: locale || "en",
          created_at: data.created_at,
        }),
      }).catch((err) => {
        console.error("Webhook notification failed:", err.message);
      });
    } else {
      console.log(
        `[BOOKING] New booking ${confirmation_number} | ${customer_name} | ${customer_phone} | Total: ${total} SAR`,
      );
    }

    return NextResponse.json(
      { ...data, confirmation_number },
      { status: 201 },
    );
  } catch {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 },
    );
  }
}
