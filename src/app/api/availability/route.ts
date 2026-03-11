import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

/** Maximum bookings allowed per day before marking the date as unavailable */
const MAX_BOOKINGS_PER_DAY = 5;

/**
 * GET /api/availability
 *
 * Returns an array of fully-booked date strings (YYYY-MM-DD).
 * The booking form can call this to disable those dates.
 *
 * Query params (optional):
 *   from  – start date (default: today)
 *   to    – end date   (default: 60 days from today)
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const now = new Date();
    const fromParam = searchParams.get("from");
    const toParam = searchParams.get("to");

    const from = fromParam || now.toISOString().slice(0, 10);
    const to =
      toParam ||
      new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000)
        .toISOString()
        .slice(0, 10);

    // Fetch bookings in the date range by preferred_date
    const { data, error } = await supabase
      .from("nick_bookings")
      .select("preferred_date")
      .not("preferred_date", "is", null)
      .gte("preferred_date", from)
      .lte("preferred_date", to)
      .neq("status", "cancelled");

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Count bookings per day
    const countByDate: Record<string, number> = {};
    for (const row of data ?? []) {
      const date = row.preferred_date as string;
      if (date) {
        countByDate[date] = (countByDate[date] || 0) + 1;
      }
    }

    // Collect dates that hit the capacity limit
    const unavailable: string[] = [];
    for (const [date, count] of Object.entries(countByDate)) {
      if (count >= MAX_BOOKINGS_PER_DAY) {
        unavailable.push(date);
      }
    }

    unavailable.sort();

    return NextResponse.json({ unavailable });
  } catch {
    return NextResponse.json(
      { error: "Failed to check availability" },
      { status: 500 },
    );
  }
}
