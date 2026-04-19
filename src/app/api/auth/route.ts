import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getAdminClient } from "@/lib/supabase";
import { signToken, getSession, COOKIE_NAME } from "@/lib/auth";

export async function POST(req: NextRequest) {
  const { username, password } = await req.json();
  if (!username || !password) {
    return NextResponse.json({ error: "Missing credentials" }, { status: 400 });
  }

  const db = getAdminClient();
  const { data: admin } = await db
    .from("nick_admins")
    .select("username, password_hash, is_active")
    .eq("username", username)
    .maybeSingle();

  if (!admin || admin.is_active === false || !(await bcrypt.compare(password, admin.password_hash))) {
    return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
  }

  const token = await signToken(admin.username);
  const res = NextResponse.json({ ok: true });
  res.cookies.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });
  return res;
}

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  const db = getAdminClient();
  const { data: me } = await db
    .from("nick_admins")
    .select("id, username, role, full_name, branch_id, is_active")
    .eq("username", session.username)
    .maybeSingle();

  if (!me || me.is_active === false) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  return NextResponse.json({
    authenticated: true,
    username: me.username,
    id: me.id,
    role: me.role,
    full_name: me.full_name,
    branch_id: me.branch_id,
  });
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.set(COOKIE_NAME, "", { maxAge: 0, path: "/" });
  return res;
}
