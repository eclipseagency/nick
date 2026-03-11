import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

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

    const { data, error } = await supabase
      .from("nick_bookings")
      .insert({
        customer_name,
        customer_phone,
        customer_notes: customer_notes || null,
        car_size,
        package_id: package_id || null,
        service_ids: service_ids || [],
        addon_ids: addon_ids || {},
        subtotal,
        discount: discount || 0,
        total,
        payment_method,
        locale: locale || "en",
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 },
    );
  }
}
