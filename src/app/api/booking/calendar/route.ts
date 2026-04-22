import { NextRequest, NextResponse } from "next/server";
import { getAdminClient } from "@/lib/supabase";

function normalizePhone(p: string): string {
  return p.replace(/[^0-9]/g, "");
}

function phoneMatches(stored: string, supplied: string): boolean {
  const s = normalizePhone(stored);
  const u = normalizePhone(supplied);
  if (!s || !u) return false;
  return s === u || s.endsWith(u) || u.endsWith(s);
}

function escapeIcs(text: string): string {
  return text.replace(/\\/g, "\\\\").replace(/\n/g, "\\n").replace(/,/g, "\\,").replace(/;/g, "\\;");
}

function pad(n: number): string {
  return n < 10 ? `0${n}` : String(n);
}

function toIcsDate(d: Date): string {
  return `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}00Z`;
}

export async function GET(req: NextRequest) {
  const conf = req.nextUrl.searchParams.get("conf");
  const phone = req.nextUrl.searchParams.get("phone");
  if (!conf || !phone) {
    return NextResponse.json({ error: "Missing conf or phone" }, { status: 400 });
  }
  const admin = getAdminClient();
  const { data, error } = await admin
    .from("nick_bookings")
    .select("*")
    .eq("confirmation_number", conf.trim().toUpperCase())
    .maybeSingle();
  if (error || !data || !phoneMatches(data.customer_phone, phone)) {
    return NextResponse.json({ error: "Booking not found" }, { status: 404 });
  }
  if (!data.preferred_date) {
    return NextResponse.json({ error: "Booking has no scheduled date" }, { status: 400 });
  }
  const [datePart, timePart] = (data.preferred_date as string).trim().split(/\s+/);
  const time = timePart || "10:00";
  const start = new Date(`${datePart}T${time}:00+03:00`); // Riyadh local time
  const end = new Date(start.getTime() + 2 * 60 * 60 * 1000); // assume 2h slot
  const dtstamp = toIcsDate(new Date());
  const summary = escapeIcs(`NICK Booking ${data.confirmation_number || ""}`);
  const description = escapeIcs(`Booking at NICK Automotive Films\nConfirmation: ${data.confirmation_number || ""}\nCustomer: ${data.customer_name}\nPhone: ${data.customer_phone}\nTotal: ${data.total} SAR\n\nLocation: Anas Ibn Malik Rd, Al-Nargis District, Riyadh\nPhone: +966 54 300 0055`);
  const location = escapeIcs("NICK Automotive Films, Anas Ibn Malik Rd, Al-Nargis, Riyadh");

  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//NICK Automotive Films//Booking//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:${data.id}@nick.sa`,
    `DTSTAMP:${dtstamp}`,
    `DTSTART:${toIcsDate(start)}`,
    `DTEND:${toIcsDate(end)}`,
    `SUMMARY:${summary}`,
    `DESCRIPTION:${description}`,
    `LOCATION:${location}`,
    "STATUS:CONFIRMED",
    "BEGIN:VALARM",
    "TRIGGER:-PT24H",
    "ACTION:DISPLAY",
    `DESCRIPTION:${escapeIcs("Reminder: NICK appointment tomorrow")}`,
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR",
  ];
  const ics = lines.join("\r\n");
  return new NextResponse(ics, {
    status: 200,
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": `attachment; filename="nick-${data.confirmation_number || data.id}.ics"`,
      "Cache-Control": "no-store",
    },
  });
}
