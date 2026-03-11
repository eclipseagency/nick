import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { supabase, getAdminClient } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  const all = req.nextUrl.searchParams.get("all") === "true";
  let query = supabase
    .from("nick_services")
    .select("*")
    .order("sort_order", { ascending: true });

  if (!all) {
    query = query.eq("active", true);
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { category, name_en, name_ar, price_small, price_large, warranty, image, image_small, image_large, popular, active } = body;

    if (!category || !name_en || !name_ar) {
      return NextResponse.json(
        { error: "Missing required fields: category, name_en, name_ar" },
        { status: 400 },
      );
    }

    const admin = getAdminClient();

    // Get max sort_order
    const { data: maxRow } = await admin
      .from("nick_services")
      .select("sort_order")
      .order("sort_order", { ascending: false })
      .limit(1)
      .single();

    const sort_order = (maxRow?.sort_order ?? 0) + 1;

    const { data, error } = await admin
      .from("nick_services")
      .insert({
        category,
        name_en,
        name_ar,
        price_small: price_small || 0,
        price_large: price_large || 0,
        warranty: warranty || null,
        image: image || null,
        image_small: image_small || null,
        image_large: image_large || null,
        popular: popular || false,
        active: active !== undefined ? active : true,
        sort_order,
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

export async function PUT(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Missing required field: id" },
        { status: 400 },
      );
    }

    const admin = getAdminClient();

    const { data, error } = await admin
      .from("nick_services")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 },
    );
  }
}
