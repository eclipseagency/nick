import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getAdminClient } from "@/lib/supabase";

async function requireSuper() {
  const session = await getSession();
  if (!session) return null;
  const db = getAdminClient();
  const { data } = await db
    .from("nick_admins")
    .select("id, role, is_active")
    .eq("username", session.username)
    .maybeSingle();
  if (!data || data.is_active === false) return null;
  return data;
}

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const db = getAdminClient();
  const { data, error } = await db
    .from("nick_branches")
    .select("id, name_en, name_ar, address, phone, is_active, created_at")
    .order("created_at", { ascending: true });

  if (error) {
    // PostgREST schema cache may not yet know the new table right after the
    // migration. Return an empty list so the UI renders cleanly until the
    // cache refreshes (normally within a few minutes).
    if (error.message?.toLowerCase().includes("schema cache")) {
      return NextResponse.json([]);
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  const me = await requireSuper();
  if (!me) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (me.role !== "super_admin") {
    return NextResponse.json({ error: "Only super admins can manage branches" }, { status: 403 });
  }

  try {
    const { name_en, name_ar, address, phone } = await req.json();
    if (!name_en?.trim() || !name_ar?.trim()) {
      return NextResponse.json({ error: "English and Arabic names are required" }, { status: 400 });
    }
    const db = getAdminClient();
    const { data, error } = await db
      .from("nick_branches")
      .insert({
        name_en: name_en.trim(),
        name_ar: name_ar.trim(),
        address: address?.trim() || null,
        phone: phone?.trim() || null,
      })
      .select("id, name_en, name_ar, address, phone, is_active, created_at")
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}

export async function PATCH(req: NextRequest) {
  const me = await requireSuper();
  if (!me) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (me.role !== "super_admin") {
    return NextResponse.json({ error: "Only super admins can manage branches" }, { status: 403 });
  }

  try {
    const { id, name_en, name_ar, address, phone, is_active } = await req.json();
    if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

    const updates: Record<string, unknown> = {};
    if (name_en !== undefined) updates.name_en = name_en?.trim() || null;
    if (name_ar !== undefined) updates.name_ar = name_ar?.trim() || null;
    if (address !== undefined) updates.address = address?.trim() || null;
    if (phone !== undefined) updates.phone = phone?.trim() || null;
    if (is_active !== undefined) updates.is_active = !!is_active;
    updates.updated_at = new Date().toISOString();

    const db = getAdminClient();
    const { data, error } = await db
      .from("nick_branches")
      .update(updates)
      .eq("id", id)
      .select("id, name_en, name_ar, address, phone, is_active, created_at")
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest) {
  const me = await requireSuper();
  if (!me) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (me.role !== "super_admin") {
    return NextResponse.json({ error: "Only super admins can manage branches" }, { status: 403 });
  }

  try {
    const { id } = await req.json();
    if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

    const db = getAdminClient();
    // Block delete if any user or booking still references the branch
    const { count: userCount } = await db
      .from("nick_admins")
      .select("id", { count: "exact", head: true })
      .eq("branch_id", id);
    const { count: bookingCount } = await db
      .from("nick_bookings")
      .select("id", { count: "exact", head: true })
      .eq("branch_id", id);

    if ((userCount || 0) > 0 || (bookingCount || 0) > 0) {
      return NextResponse.json(
        {
          error:
            "Branch is in use. Reassign all users and bookings, or deactivate the branch instead.",
        },
        { status: 409 },
      );
    }

    const { error } = await db.from("nick_branches").delete().eq("id", id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
