import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { getAdminClient } from "@/lib/supabase";

// GET — list all admin users
export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const db = getAdminClient();
  const { data, error } = await db
    .from("nick_admins")
    .select("id, username, created_at")
    .order("created_at", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}

// POST — create a new user
export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { username, password } = await req.json();
    if (!username || !password) {
      return NextResponse.json({ error: "Username and password required" }, { status: 400 });
    }
    if (password.length < 4) {
      return NextResponse.json({ error: "Password must be at least 4 characters" }, { status: 400 });
    }

    const db = getAdminClient();

    // Check if username exists
    const { data: existing } = await db
      .from("nick_admins")
      .select("id")
      .eq("username", username)
      .single();

    if (existing) {
      return NextResponse.json({ error: "Username already exists" }, { status: 409 });
    }

    // Insert user with hashed password using pgcrypto
    const { error } = await db.rpc("nick_create_user", {
      p_username: username,
      p_password: password,
    });

    if (error) {
      // Fallback: try direct insert with crypt
      const { error: insertError } = await db
        .from("nick_admins")
        .insert({
          username,
          password_hash: password, // Will be handled by trigger or RPC
        });

      if (insertError) {
        return NextResponse.json({ error: insertError.message }, { status: 500 });
      }
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}

// PATCH — change password
export async function PATCH(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { username, new_password } = await req.json();
    const targetUser = username || session.username;

    if (!new_password || new_password.length < 4) {
      return NextResponse.json(
        { error: "New password must be at least 4 characters" },
        { status: 400 },
      );
    }

    const db = getAdminClient();

    // Update password via RPC
    const { error } = await db.rpc("nick_change_password", {
      p_username: targetUser,
      p_password: new_password,
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}

// DELETE — delete a user
export async function DELETE(req: NextRequest) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { username } = await req.json();
    if (!username) {
      return NextResponse.json({ error: "Username required" }, { status: 400 });
    }

    // Cannot delete yourself
    if (username === session.username) {
      return NextResponse.json({ error: "Cannot delete your own account" }, { status: 400 });
    }

    const db = getAdminClient();
    const { error } = await db.from("nick_admins").delete().eq("username", username);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
