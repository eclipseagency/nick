"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import DatePicker from "@/components/DatePicker";
import { useLanguage } from "@/i18n/LanguageContext";

const TIME_SLOTS = ["09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00"];

const formatTimeLabel = (slot: string, isAr: boolean) => {
  const [h] = slot.split(":");
  const hour = parseInt(h, 10);
  const ampm = hour >= 12 ? (isAr ? "م" : "PM") : (isAr ? "ص" : "AM");
  const display = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
  return `${display}:00 ${ampm}`;
};

interface Booking {
  id: string;
  confirmation_number: string | null;
  customer_name: string;
  customer_phone: string;
  preferred_date: string | null;
  car_size: string;
  car_make: string | null;
  service_ids: string[];
  total: number;
  status: string;
  payment_method: string;
}

const STATUS_COLORS: Record<string, string> = {
  pending: "#FBBF24",
  confirmed: "#60A5FA",
  in_progress: "#F59E0B",
  completed: "#34D399",
  cancelled: "#FCA5A5",
  pending_payment: "#9CA3AF",
};

export default function TrackPage() {
  const { locale } = useLanguage();
  const isAr = locale === "ar";
  const dir = isAr ? "rtl" : "ltr";
  const [conf, setConf] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [booking, setBooking] = useState<Booking | null>(null);
  const [view, setView] = useState<"lookup" | "details" | "reschedule">("lookup");
  const [newDate, setNewDate] = useState("");
  const [newTime, setNewTime] = useState("");
  const [unavailableDates, setUnavailableDates] = useState<string[]>([]);
  const [actionBusy, setActionBusy] = useState(false);
  const [minDate, setMinDate] = useState("");

  useEffect(() => {
    setMinDate(new Date().toISOString().slice(0, 10));
    fetch("/api/track/availability").then(r => r.json()).then(d => {
      if (d.unavailable) setUnavailableDates(d.unavailable);
    }).catch(() => {});
  }, []);

  async function lookup(e?: React.FormEvent) {
    e?.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ confirmation_number: conf, phone }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || (isAr ? "لم نجد الحجز" : "Booking not found"));
        return;
      }
      setBooking(data.booking);
      setView("details");
    } catch {
      setError(isAr ? "حدث خطأ. حاول مرة أخرى." : "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function reschedule() {
    if (!newDate || !newTime) {
      setError(isAr ? "اختر التاريخ والوقت" : "Pick a date and time");
      return;
    }
    setActionBusy(true);
    setError("");
    try {
      const res = await fetch("/api/track", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          confirmation_number: conf,
          phone,
          action: "reschedule",
          preferred_date: newDate,
          preferred_time: newTime,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || (isAr ? "تعذر تعديل الموعد" : "Failed to reschedule"));
        return;
      }
      setBooking(data.booking);
      setView("details");
      setNewDate(""); setNewTime("");
    } finally {
      setActionBusy(false);
    }
  }

  async function cancel() {
    if (!confirm(isAr ? "هل أنت متأكد من إلغاء الحجز؟" : "Are you sure you want to cancel this booking?")) return;
    setActionBusy(true);
    setError("");
    try {
      const res = await fetch("/api/track", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ confirmation_number: conf, phone, action: "cancel" }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || (isAr ? "تعذر إلغاء الحجز" : "Failed to cancel"));
        return;
      }
      setBooking(data.booking);
    } finally {
      setActionBusy(false);
    }
  }

  function downloadIcs() {
    if (!booking?.confirmation_number) return;
    const url = `/api/booking/calendar?conf=${encodeURIComponent(booking.confirmation_number)}&phone=${encodeURIComponent(phone)}`;
    window.location.href = url;
  }

  const formattedPref = (() => {
    if (!booking?.preferred_date) return { date: "—", time: "" };
    const [datePart, timePart] = booking.preferred_date.trim().split(/\s+/);
    let date = "—";
    try {
      date = new Date(datePart + "T00:00:00").toLocaleDateString(isAr ? "ar-SA" : "en-GB", {
        weekday: "long", day: "numeric", month: "long", year: "numeric",
      });
    } catch { /* ignore */ }
    let time = "";
    if (timePart) {
      const [h, m] = timePart.split(":");
      const hr = parseInt(h, 10);
      const ampm = hr >= 12 ? (isAr ? "م" : "PM") : (isAr ? "ص" : "AM");
      const display = hr === 0 ? 12 : hr > 12 ? hr - 12 : hr;
      time = `${display}:${m} ${ampm}`;
    }
    return { date, time };
  })();

  return (
    <main dir={dir}>
      <Navbar />
      <section style={{ padding: "120px 0 80px", background: "#050505", minHeight: "100vh" }}>
        <div style={{ maxWidth: 560, margin: "0 auto", padding: "0 24px" }}>
          <h1 style={{
            fontFamily: isAr ? "var(--font-ar)" : "var(--font-display)",
            fontSize: "clamp(28px, 5vw, 40px)",
            fontWeight: 700, color: "#fff", marginBottom: 8,
          }}>
            {isAr ? "تتبع حجزك" : "Track Your Booking"}
          </h1>
          <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 14, marginBottom: 32 }}>
            {isAr ? "أدخل رقم الحجز ورقم الجوال للتحقق من حالة حجزك أو تعديله." : "Enter your confirmation number and phone to view, reschedule, or cancel your booking."}
          </p>

          {error && (
            <div style={{
              marginBottom: 18, padding: "12px 16px", borderRadius: 12,
              background: "rgba(244,67,54,0.1)", border: "1px solid rgba(244,67,54,0.3)",
              color: "#f44336", fontSize: 13,
            }}>{error}</div>
          )}

          {/* LOOKUP */}
          {view === "lookup" && (
            <form onSubmit={lookup} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <input
                type="text"
                value={conf}
                onChange={e => setConf(e.target.value.toUpperCase())}
                placeholder={isAr ? "رقم الحجز (مثال: NK-AB23CD)" : "Confirmation # (e.g. NK-AB23CD)"}
                aria-label={isAr ? "رقم الحجز" : "Confirmation number"}
                style={inputStyle}
                autoComplete="off"
              />
              <input
                type="tel"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder={isAr ? "رقم الجوال (05xxxxxxxx)" : "Phone (05xxxxxxxx)"}
                aria-label={isAr ? "رقم الجوال" : "Phone number"}
                style={{ ...inputStyle, textAlign: "left" as const, direction: "ltr" }}
                autoComplete="tel"
                dir="ltr"
              />
              <button
                type="submit"
                disabled={loading || !conf || !phone}
                className="btn-gold"
                style={{ padding: "14px 24px", opacity: (loading || !conf || !phone) ? 0.5 : 1 }}
              >
                {loading ? (isAr ? "جاري البحث..." : "Searching...") : (isAr ? "بحث" : "Look up")}
              </button>
            </form>
          )}

          {/* DETAILS */}
          {view === "details" && booking && (
            <div style={{
              background: "#111", border: "1px solid rgba(255,255,255,0.08)",
              borderLeft: `4px solid ${STATUS_COLORS[booking.status] || "#888"}`,
              borderRadius: 16, padding: 24,
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
                <div>
                  {booking.confirmation_number && (
                    <div style={{ fontFamily: "'Space Grotesk', sans-serif", color: "#F6BE00", fontSize: 22, fontWeight: 800, letterSpacing: "0.04em", marginBottom: 6 }}>
                      {booking.confirmation_number}
                    </div>
                  )}
                  <div style={{ color: "#fff", fontSize: 15, fontWeight: 600 }}>{booking.customer_name}</div>
                </div>
                <span style={{
                  padding: "5px 12px", borderRadius: 100,
                  background: `${STATUS_COLORS[booking.status] || "#888"}22`,
                  color: STATUS_COLORS[booking.status] || "#888",
                  fontSize: 11, fontWeight: 700, textTransform: "uppercase",
                }}>{booking.status.replace("_", " ")}</span>
              </div>

              <div style={{ display: "grid", gap: 12, marginBottom: 20 }}>
                <Row label={isAr ? "التاريخ" : "Date"} value={formattedPref.date} />
                {formattedPref.time && <Row label={isAr ? "الوقت" : "Time"} value={formattedPref.time} accent />}
                <Row label={isAr ? "السيارة" : "Vehicle"} value={`${booking.car_make || "—"} (${booking.car_size})`} />
                <Row label={isAr ? "الخدمات" : "Services"} value={`${booking.service_ids?.length || 0} ${isAr ? "خدمة" : "service(s)"}`} />
                <Row label={isAr ? "الإجمالي" : "Total"} value={`${booking.total.toLocaleString()} ${isAr ? "ر.س" : "SAR"}`} accent />
              </div>

              {booking.status !== "cancelled" && booking.status !== "completed" && (
                <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 14 }}>
                  <button
                    onClick={downloadIcs}
                    style={btnSecondary}
                  >
                    📅 {isAr ? "أضف للتقويم" : "Add to Calendar"}
                  </button>
                  <button
                    onClick={() => { setView("reschedule"); setError(""); }}
                    style={btnSecondary}
                  >
                    🔄 {isAr ? "تعديل الموعد" : "Reschedule"}
                  </button>
                  <button
                    onClick={cancel}
                    disabled={actionBusy}
                    style={btnDanger}
                  >
                    ✕ {isAr ? "إلغاء الحجز" : "Cancel Booking"}
                  </button>
                </div>
              )}

              <button
                onClick={() => { setView("lookup"); setBooking(null); setConf(""); setPhone(""); setError(""); }}
                style={{ background: "none", border: "none", color: "rgba(255,255,255,0.4)", fontSize: 12, cursor: "pointer", padding: 0, marginTop: 8 }}
              >
                ← {isAr ? "البحث عن حجز آخر" : "Look up another booking"}
              </button>
            </div>
          )}

          {/* RESCHEDULE */}
          {view === "reschedule" && booking && (
            <div style={{
              background: "#111", border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 16, padding: 24,
            }}>
              <h2 style={{ color: "#fff", fontSize: 18, fontWeight: 700, marginBottom: 16 }}>
                {isAr ? "اختر موعد جديد" : "Pick a new slot"}
              </h2>
              <div style={{ marginBottom: 14 }}>
                <label style={labelStyle}>{isAr ? "التاريخ الجديد" : "New date"}</label>
                <DatePicker
                  value={newDate}
                  onChange={setNewDate}
                  unavailableDates={unavailableDates}
                  minDate={minDate}
                  isAr={isAr}
                  placeholder={isAr ? "اختر التاريخ" : "Pick a date"}
                />
              </div>
              <div style={{ marginBottom: 18 }}>
                <label style={labelStyle}>{isAr ? "الوقت الجديد" : "New time"}</label>
                <select
                  value={newTime}
                  onChange={e => setNewTime(e.target.value)}
                  style={{ ...inputStyle, cursor: "pointer" }}
                >
                  <option value="" disabled style={{ background: "#0a0a0a", color: "#888" }}>{isAr ? "اختر الوقت" : "Pick a time"}</option>
                  {TIME_SLOTS.map(slot => (
                    <option key={slot} value={slot} style={{ background: "#0a0a0a", color: "#f5f5f5" }}>
                      {formatTimeLabel(slot, isAr)}
                    </option>
                  ))}
                </select>
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <button
                  onClick={reschedule}
                  disabled={actionBusy || !newDate || !newTime}
                  className="btn-gold"
                  style={{ flex: 1, padding: "12px", opacity: (actionBusy || !newDate || !newTime) ? 0.5 : 1 }}
                >
                  {actionBusy ? (isAr ? "جاري الحفظ..." : "Saving...") : (isAr ? "تأكيد التعديل" : "Confirm new slot")}
                </button>
                <button
                  onClick={() => { setView("details"); setError(""); }}
                  style={btnSecondary}
                >
                  {isAr ? "رجوع" : "Cancel"}
                </button>
              </div>
            </div>
          )}
        </div>
      </section>
      <Footer />
    </main>
  );
}

function Row({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
      <span style={{ color: "rgba(255,255,255,0.5)", fontSize: 13 }}>{label}</span>
      <span style={{ color: accent ? "#F6BE00" : "#fff", fontSize: 14, fontWeight: 600 }}>{value}</span>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%", padding: "14px 18px", borderRadius: 12,
  background: "#111", border: "1px solid rgba(255,255,255,0.08)",
  color: "#fff", fontSize: 15, outline: "none",
};

const labelStyle: React.CSSProperties = {
  display: "block", color: "rgba(255,255,255,0.5)", fontSize: 12, marginBottom: 6,
};

const btnSecondary: React.CSSProperties = {
  padding: "10px 18px", borderRadius: 10,
  background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)",
  color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer",
};

const btnDanger: React.CSSProperties = {
  padding: "10px 18px", borderRadius: 10,
  background: "rgba(244,67,54,0.08)", border: "1px solid rgba(244,67,54,0.3)",
  color: "#FCA5A5", fontSize: 13, fontWeight: 600, cursor: "pointer",
};
