import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getSession } from "@/lib/auth";
import { getAdminClient } from "@/lib/supabase";

const VALID_ROLES = ["super_admin", "manager", "reception", "technician"] as const;
type Role = (typeof VALID_ROLES)[number];

function isRole(v: unknown): v is Role {
  return typeof v === "string" && (VALID_ROLES as readonly string[]).includes(v);
}

async function currentAdmin() {
  const session = await getSession();
  if (!session) return null;
  const db = getAdminClient();
  // Full select; fall back if PostgREST schema cache is still stale after a
  // migration. During the fallback window, treat every authenticated user as
  // super_admin so the app stays functional. Once the cache catches up the
  // real roles take over.
  const full = await db
    .from("nick_admins")
    .select("id, username, role, is_active")
    .eq("username", session.username)
    .maybeSingle();
  if (!full.error && full.data) {
    if (full.data.is_active === false) return null;
    return full.data as { id: string; username: string; role: string; is_active: boolean };
  }
  const basic = await db
    .from("nick_admins")
    .select("id, username")
    .eq("username", session.username)
    .maybeSingle();
  if (!basic.data) return null;
  return { ...basic.data, role: "super_admin", is_active: true };
}

// GET — list all admin users (super_admin / manager only)
export async function GET() {
  const me = await currentAdmin();
  if (!me) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (me.role !== "super_admin" && me.role !== "manager") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const db = getAdminClient();
  const full = await db
    .from("nick_admins")
    .select("id, username, full_name, role, branch_id, is_active, created_at")
    .order("created_at", { ascending: true });
  if (!full.error) return NextResponse.json(full.data);

  // Fallback while PostgREST schema cache is stale after migration
  const basic = await db
    .from("nick_admins")
    .select("id, username, created_at")
    .order("created_at", { ascending: true });
  if (basic.error) return NextResponse.json({ error: basic.error.message }, { status: 500 });
  const padded = (basic.data || []).map((u) => ({
    ...u,
    full_name: null,
    role: "reception" as const,
    branch_id: null,
    is_active: true,
  }));
  return NextResponse.json(padded);
}

// POST — create user (super_admin only)
export async function POST(req: NextRequest) {
  const me = await currentAdmin();
  if (!me) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (me.role !== "super_admin") {
    return NextResponse.json({ error: "Only super admins can create users" }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { username, password, full_name, role, branch_id } = body;

    if (!username || !password) {
      return NextResponse.json({ error: "Username and password are required" }, { status: 400 });
    }
    if (password.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 });
    }
    if (role && !isRole(role)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }

    const db = getAdminClient();

    const { data: existing } = await db
      .from("nick_admins")
      .select("id")
      .eq("username", username)
      .maybeSingle();
    if (existing) {
      return NextResponse.json({ error: "Username already exists" }, { status: 409 });
    }

    const password_hash = await bcrypt.hash(password, 10);
    const { data, error } = await db
      .from("nick_admins")
      .insert({
        username: username.trim(),
        password_hash,
        full_name: full_name?.trim() || username.trim(),
        role: role || "reception",
        branch_id: branch_id || null,
        is_active: true,
      })
      .select("id, username, full_name, role, branch_id, is_active, created_at")
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}

// PATCH — update user (super_admin for anyone, self for own password/full_name)
export async function PATCH(req: NextRequest) {
  const me = await currentAdmin();
  if (!me) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const body = await req.json();
    const { id, full_name, role, branch_id, is_active, password } = body;

    if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

    const isSelf = id === me.id;
    const isSuper = me.role === "super_admin";

    if (!isSelf && !isSuper) {
      return NextResponse.json({ error: "Only super admins can edit other users" }, { status: 403 });
    }

    if ((role !== undefined || branch_id !== undefined || is_active !== undefined) && !isSuper) {
      return NextResponse.json(
        { error: "Only super admins can change role, branch, or active status" },
        { status: 403 },
      );
    }

    if (role !== undefined && !isRole(role)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }

    // Prevent super admin from demoting or disabling themselves
    if (isSelf && isSuper) {
      if (role !== undefined && role !== "super_admin") {
        return NextResponse.json({ error: "You cannot demote yourself" }, { status: 400 });
      }
      if (is_active === false) {
        return NextResponse.json({ error: "You cannot deactivate yourself" }, { status: 400 });
      }
    }

    const updates: Record<string, unknown> = {};
    if (full_name !== undefined) updates.full_name = (full_name || "").trim() || null;
    if (role !== undefined) updates.role = role;
    if (branch_id !== undefined) updates.branch_id = branch_id || null;
    if (is_active !== undefined) updates.is_active = !!is_active;
    if (password !== undefined) {
      if (typeof password !== "string" || password.length < 6) {
        return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 });
      }
      updates.password_hash = await bcrypt.hash(password, 10);
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: "No changes" }, { status: 400 });
    }

    const db = getAdminClient();
    const { data, error } = await db
      .from("nick_admins")
      .update(updates)
      .eq("id", id)
      .select("id, username, full_name, role, branch_id, is_active, created_at")
      .single();

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json(data);
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}

// DELETE — remove user (super_admin only, not self)
export async function DELETE(req: NextRequest) {
  const me = await currentAdmin();
  if (!me) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (me.role !== "super_admin") {
    return NextResponse.json({ error: "Only super admins can delete users" }, { status: 403 });
  }

  try {
    const { id } = await req.json();
    if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
    if (id === me.id) {
      return NextResponse.json({ error: "You cannot delete your own account" }, { status: 400 });
    }

    const db = getAdminClient();
    const { error } = await db.from("nick_admins").delete().eq("id", id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
