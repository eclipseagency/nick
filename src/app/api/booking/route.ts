import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import crypto from "crypto";

// Hardcoded addon prices (mirrors client-side Booking.tsx)
// addonTier "low" → p.small, addonTier "high" → p.large
const ADDON_PRICES: Record<string, { small: number; large: number }> = {
  ozone: { small: 100, large: 150 },
  "rim-ceramic": { small: 600, large: 700 },
  "engine-clean": { small: 150, large: 200 },
  "remove-tint": { small: 200, large: 300 },
  "remove-partial": { small: 350, large: 450 },
  "remove-front": { small: 550, large: 650 },
  "remove-full": { small: 1250, large: 1450 },
};

// Service → addon tier mapping (mirrors client-side)
const SERVICE_ADDON_TIER: Record<string, "low" | "high"> = {
  "ppf-color": "high",
  "ppf-clear75": "low",
  "ppf-clear85": "low",
  "ppf-matte": "low",
  "ppf-front-rear": "high",
  "ppf-front": "high",
  "ppf-partial-rear": "low",
  "ppf-partial": "low",
  "ppf-windshield": "low",
  "tint-full": "low",
  "tint-front": "high",
  "ceramic-int-1": "low",
  "ceramic-int-3": "low",
  "ceramic-int-5": "low",
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
  try {
    const body = await req.json();

    const {
      customer_name,
      customer_phone,
      customer_notes,
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

    if (!customer_name || !customer_phone || !car_size || !payment_method) {
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

    // ─── 4. Webhook notification (fire-and-forget) ─────────────────────
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
