import { NextResponse } from "next/server";
import { getAdminClient } from "@/lib/supabase";

// Reuse the booking availability logic — list dates fully booked
// (matches what /api/availability returns for the booking flow).
export async function GET() {
  try {
    const admin = getAdminClient();
    const { data, error } = await admin
      .from("nick_bookings")
      .select("preferred_date, status")
      .neq("status", "cancelled");
    if (error) {
      return NextResponse.json({ unavailable: [] });
    }
    const counts = new Map<string, number>();
    for (const b of data || []) {
      const dp = (b.preferred_date as string | null)?.trim().split(/\s+/)[0];
      if (!dp) continue;
      counts.set(dp, (counts.get(dp) || 0) + 1);
    }
    const CAPACITY = 5;
    const unavailable = Array.from(counts.entries())
      .filter(([, n]) => n >= CAPACITY)
      .map(([d]) => d);
    return NextResponse.json({ unavailable });
  } catch {
    return NextResponse.json({ unavailable: [] });
  }
}
