import { NextRequest, NextResponse } from "next/server";
import { getAdminClient } from "@/lib/supabase";

const TIME_SLOTS = ["09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00"];

function normalizePhone(p: string): string {
  return p.replace(/[^0-9]/g, "");
}

function phoneMatches(stored: string, supplied: string): boolean {
  const s = normalizePhone(stored);
  const u = normalizePhone(supplied);
  if (!s || !u) return false;
  // Allow either full match or last-4 match
  return s === u || s.endsWith(u) || u.endsWith(s);
}

async function findBooking(confirmation_number: string, phone: string) {
  const admin = getAdminClient();
  const { data, error } = await admin
    .from("nick_bookings")
    .select("*")
    .eq("confirmation_number", confirmation_number.trim().toUpperCase())
    .maybeSingle();
  if (error || !data) return null;
  if (!phoneMatches(data.customer_phone, phone)) return null;
  return data;
}

// Lookup
export async function POST(req: NextRequest) {
  try {
    const { confirmation_number, phone } = await req.json();
    if (!confirmation_number || !phone) {
      return NextResponse.json({ error: "Missing confirmation number or phone" }, { status: 400 });
    }
    const booking = await findBooking(confirmation_number, phone);
    if (!booking) {
      return NextResponse.json({ error: "Booking not found. Check the confirmation number and phone number." }, { status: 404 });
    }
    return NextResponse.json({ booking });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}

// Reschedule or cancel
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { confirmation_number, phone, action, preferred_date, preferred_time } = body;

    if (!confirmation_number || !phone || !action) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const booking = await findBooking(confirmation_number, phone);
    if (!booking) {
      return NextResponse.json({ error: "Booking not found" }, { status: 404 });
    }

    // Block destructive actions on completed/cancelled bookings
    if (booking.status === "completed" || booking.status === "cancelled") {
      return NextResponse.json({ error: `Booking already ${booking.status}` }, { status: 400 });
    }

    const admin = getAdminClient();

    if (action === "cancel") {
      const { data, error } = await admin
        .from("nick_bookings")
        .update({ status: "cancelled", updated_at: new Date().toISOString() })
        .eq("id", booking.id)
        .select()
        .single();
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ booking: data });
    }

    if (action === "reschedule") {
      if (!preferred_date || !preferred_time) {
        return NextResponse.json({ error: "Date and time required" }, { status: 400 });
      }
      // Validate date format YYYY-MM-DD
      if (!/^\d{4}-\d{2}-\d{2}$/.test(preferred_date)) {
        return NextResponse.json({ error: "Invalid date format" }, { status: 400 });
      }
      if (!TIME_SLOTS.includes(preferred_time)) {
        return NextResponse.json({ error: "Invalid time slot" }, { status: 400 });
      }
      // Disallow past dates
      const picked = new Date(preferred_date + "T00:00:00");
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (picked < today) {
        return NextResponse.json({ error: "Cannot reschedule to a past date" }, { status: 400 });
      }
      const newPref = `${preferred_date} ${preferred_time}`;
      // Reset confirmed → pending after reschedule so admin re-confirms
      const newStatus = booking.status === "confirmed" ? "pending" : booking.status;
      const { data, error } = await admin
        .from("nick_bookings")
        .update({
          preferred_date: newPref,
          status: newStatus,
          updated_at: new Date().toISOString(),
        })
        .eq("id", booking.id)
        .select()
        .single();
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      return NextResponse.json({ booking: data });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch {
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }
}
