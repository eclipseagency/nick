import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { supabase, getAdminClient } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  const all = req.nextUrl.searchParams.get("all") === "true";
  let query = supabase
    .from("nick_packages")
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
    const { name_en, name_ar, desc_en, desc_ar, tier, discount, warranty_en, warranty_ar, service_ids, active } = body;

    if (!name_en || !name_ar) {
      return NextResponse.json(
        { error: "Missing required fields: name_en, name_ar" },
        { status: 400 },
      );
    }

    const admin = getAdminClient();

    // Get max sort_order
    const { data: maxRow } = await admin
      .from("nick_packages")
      .select("sort_order")
      .order("sort_order", { ascending: false })
      .limit(1)
      .single();

    const sort_order = (maxRow?.sort_order ?? 0) + 1;

    const { data, error } = await admin
      .from("nick_packages")
      .insert({
        name_en,
        name_ar,
        desc_en: desc_en || null,
        desc_ar: desc_ar || null,
        tier: tier || "basic",
        discount: discount || 0,
        warranty_en: warranty_en || null,
        warranty_ar: warranty_ar || null,
        service_ids: service_ids || [],
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
      .from("nick_packages")
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
