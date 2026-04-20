"use client";

import { useState } from "react";
import DatePicker from "./DatePicker";
import type { Dictionary } from "@/i18n/types";

export interface BookingFormData {
  name: string;
  phone: string;
  notes: string;
  preferredDate: string;
}

export type PaymentMethod = "cash" | "online" | "tabby" | "tamara";

interface Props {
  t: Dictionary;
  isAr: boolean;
  isMobile: boolean;
  dir: "ltr" | "rtl";
  cur: string;
  total: number;
  displayTotal: number;
  unavailableDates: string[];
  minDate: string;
  bookingError: string;
  submitting: boolean;
  onSubmit: (data: BookingFormData, method: PaymentMethod) => void;
}

const isValidPhone = (phone: string) => {
  const cleaned = phone.replace(/[\s\-()]/g, "");
  return /^(\+966|966|05|5)\d{8}$/.test(cleaned);
};

const bnplBase: React.CSSProperties = {
  display: "flex", alignItems: "center", justifyContent: "space-between",
  width: "100%", padding: "16px 20px", borderRadius: 12,
  textDecoration: "none", transition: "all 0.3s", border: "none",
};

const TIME_SLOTS = ["09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00", "19:00", "20:00"];

const formatTimeLabel = (slot: string, isAr: boolean) => {
  const [h] = slot.split(":");
  const hour = parseInt(h, 10);
  const ampm = hour >= 12 ? (isAr ? "م" : "PM") : (isAr ? "ص" : "AM");
  const display = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour;
  return `${display}:00 ${ampm}`;
};

export default function BookingForm({
  t, isAr, isMobile, dir, cur, total, displayTotal,
  unavailableDates, minDate, bookingError, submitting, onSubmit,
}: Props) {
  const [form, setForm] = useState<BookingFormData>({ name: "", phone: "", notes: "", preferredDate: "" });
  const [preferredTime, setPreferredTime] = useState<string>("");

  const formValid = form.name.trim().length >= 2 && isValidPhone(form.phone) && form.preferredDate.length > 0 && preferredTime.length > 0;
  const formMissing = !formValid ? [
    ...(form.name.trim().length < 2 ? [isAr ? "الاسم" : "Name"] : []),
    ...(!isValidPhone(form.phone) ? [isAr ? "رقم الجوال (مثال: 05xxxxxxxx)" : "Phone (e.g. 05xxxxxxxx)"] : []),
    ...(form.preferredDate.length === 0 ? [isAr ? "التاريخ" : "Date"] : []),
    ...(preferredTime.length === 0 ? [isAr ? "الوقت" : "Time"] : []),
  ] : [];

  const submit = (method: PaymentMethod) => {
    if (!formValid || submitting) return;
    onSubmit({ ...form, preferredDate: `${form.preferredDate} ${preferredTime}` }, method);
  };

  return (
    <>
      {/* Form section header */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 20 }}>
        <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#F6BE00" }} />
        <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 12, fontWeight: 600, letterSpacing: isAr ? "0" : "0.08em", textTransform: isAr ? "none" : "uppercase" as const }}>{isAr ? "بيانات الحجز" : "Booking Details"}</span>
        <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.06)" }} />
      </div>

      <div style={{ display: "flex", flexDirection: "column" as const, gap: 14, marginBottom: 32 }}>
        <input id="booking-name" type="text" value={form.name} onChange={e => setForm(f => ({...f, name: e.target.value}))}
          placeholder={t.booking.namePh} aria-label={t.booking.namePh} autoComplete="name"
          onFocus={e => { e.currentTarget.style.borderColor = "#F6BE00"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(246,190,0,0.1)"; }}
          onBlur={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"; e.currentTarget.style.boxShadow = "none"; }}
          style={{ width: "100%", padding: "14px 18px", borderRadius: 12, background: "#111", border: "1px solid rgba(255,255,255,0.08)", color: "#fff", fontSize: 15, outline: "none", transition: "border-color 0.2s, box-shadow 0.2s" }} />
        <div>
          <input id="booking-phone" type="tel" value={form.phone} onChange={e => setForm(f => ({...f, phone: e.target.value}))}
            placeholder={isAr ? "05xxxxxxxx :رقم الجوال" : "Phone: 05xxxxxxxx"} aria-label={t.booking.phonePh} autoComplete="tel" dir="ltr"
            onFocus={e => { e.currentTarget.style.borderColor = "#F6BE00"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(246,190,0,0.1)"; }}
            onBlur={e => { e.currentTarget.style.borderColor = form.phone && !isValidPhone(form.phone) ? "#f44336" : "rgba(255,255,255,0.08)"; e.currentTarget.style.boxShadow = "none"; }}
            style={{ width: "100%", padding: "14px 18px", borderRadius: 12, background: "#111", border: `1px solid ${form.phone && !isValidPhone(form.phone) ? "rgba(244,67,54,0.5)" : "rgba(255,255,255,0.08)"}`, color: "#fff", fontSize: 15, outline: "none", transition: "border-color 0.2s, box-shadow 0.2s", textAlign: "left" as const }} />
          {form.phone && !isValidPhone(form.phone) && (
            <p style={{ fontSize: 11, color: "#f44336", marginTop: 4 }}>
              {isAr ? "صيغة مقبولة: 05xxxxxxxx أو +966xxxxxxxxx" : "Accepted: 05xxxxxxxx or +966xxxxxxxxx"}
            </p>
          )}
        </div>
        {/* Preferred date picker */}
        <div>
          <label style={{ display: "block", color: "rgba(255,255,255,0.5)", fontSize: 12, marginBottom: 6 }}>{t.booking.preferredDateLabel}</label>
          <DatePicker
            value={form.preferredDate}
            onChange={(d) => setForm(f => ({...f, preferredDate: d}))}
            unavailableDates={unavailableDates}
            minDate={minDate}
            isAr={isAr}
            placeholder={t.booking.preferredDatePh}
          />
          {unavailableDates.length > 0 && (
            <p style={{ fontSize: 11, color: "rgba(255,255,255,0.25)", marginTop: 4 }}>
              {isAr ? "التواريخ المحجوزة معلّمة باللون الأحمر" : "Booked dates are marked in red"}
            </p>
          )}
        </div>
        {/* Preferred time slot */}
        <div>
          <label style={{ display: "block", color: "rgba(255,255,255,0.5)", fontSize: 12, marginBottom: 6 }}>
            {isAr ? "الوقت المفضل *" : "Preferred Time *"}
          </label>
          <select
            value={preferredTime}
            onChange={(e) => setPreferredTime(e.target.value)}
            aria-label={isAr ? "الوقت المفضل" : "Preferred time"}
            style={{
              width: "100%", padding: "14px 18px", borderRadius: 12,
              background: "#111", border: "1px solid rgba(255,255,255,0.08)",
              color: preferredTime ? "#fff" : "rgba(255,255,255,0.35)",
              fontSize: 15, outline: "none", cursor: "pointer",
              appearance: "none",
              backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='14' height='14' viewBox='0 0 24 24' fill='none' stroke='%23F6BE00' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round'><polyline points='6 9 12 15 18 9'/></svg>")`,
              backgroundRepeat: "no-repeat",
              backgroundPosition: isAr ? "left 18px center" : "right 18px center",
              paddingRight: isAr ? 18 : 44,
              paddingLeft: isAr ? 44 : 18,
            }}
          >
            <option value="" disabled>{isAr ? "اختر الوقت" : "Pick a time"}</option>
            {TIME_SLOTS.map(slot => (
              <option key={slot} value={slot}>{formatTimeLabel(slot, isAr)}</option>
            ))}
          </select>
        </div>
        <textarea id="booking-notes" aria-label={t.booking.notesPh} value={form.notes} onChange={e => setForm(f => ({...f, notes: e.target.value}))}
          placeholder={t.booking.notesPh} rows={3}
          onFocus={e => { e.currentTarget.style.borderColor = "#F6BE00"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(246,190,0,0.1)"; }}
          onBlur={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"; e.currentTarget.style.boxShadow = "none"; }}
          style={{ width: "100%", padding: "14px 18px", borderRadius: 12, background: "#111", border: "1px solid rgba(255,255,255,0.08)", color: "#fff", fontSize: 15, outline: "none", resize: "none" as const, transition: "border-color 0.2s, box-shadow 0.2s" }} />
      </div>

      <div style={{ marginBottom: 24 }}>
        <div style={{ color: "rgba(255,255,255,0.35)", fontSize: 12, textTransform: isAr ? "none" : "uppercase" as const, letterSpacing: isAr ? "0" : "0.08em", marginBottom: 16 }}>{t.booking.paymentMethod}</div>

        {/* Missing fields hint */}
        {formMissing.length > 0 && (
          <div style={{
            marginBottom: 14, padding: "10px 16px", borderRadius: 12,
            background: "rgba(246,190,0,0.06)", border: "1px solid rgba(246,190,0,0.15)",
            color: "rgba(246,190,0,0.8)", fontSize: 12, lineHeight: 1.5,
            display: "flex", alignItems: "center", gap: 8,
          }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            <span>{isAr ? "يرجى إكمال:" : "Please complete:"} {formMissing.join(", ")}</span>
          </div>
        )}

        {/* Error banner */}
        {bookingError && (
          <div style={{
            marginBottom: 14, padding: "12px 16px", borderRadius: 12,
            background: "rgba(244,67,54,0.1)", border: "1px solid rgba(244,67,54,0.3)",
            color: "#f44336", fontSize: 13, lineHeight: 1.5,
            display: "flex", alignItems: "center", gap: 10,
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
            <span>{bookingError}</span>
          </div>
        )}

        <div style={{ display: "flex", flexDirection: "column" as const, gap: 10 }}>
          {/* Pay at Shop — primary CTA */}
          <button
            onClick={() => submit("cash")}
            disabled={!formValid || submitting}
            style={{
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              width: "100%", padding: isMobile ? "14px 14px" : "16px 20px", borderRadius: 12, cursor: "pointer",
              background: (!formValid || submitting) ? "rgba(246,190,0,0.3)" : "#F6BE00",
              border: "none", color: "#000", fontSize: isMobile ? 13 : 15, fontWeight: 700,
              textAlign: "center" as const,
              transition: "all 0.3s",
              opacity: (!formValid || submitting) ? 0.4 : 1,
            }}
          >
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
            {submitting && <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" style={{ animation: "spin 1s linear infinite" }}><path d="M12 2a10 10 0 0 1 10 10" /></svg>}
            {submitting ? (isAr ? "جاري المعالجة..." : "Processing...") : (isAr ? `احجز وادفع في المعرض — ${displayTotal.toLocaleString()} ${cur}` : `Reserve & Pay at Shop — ${displayTotal.toLocaleString()} ${cur}`)}
          </button>

          {/* Pay Online — Neoleap */}
          <button
            onClick={() => submit("online")}
            disabled={!formValid || submitting}
            style={{
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
              width: "100%", padding: isMobile ? "14px 14px" : "16px 20px", borderRadius: 12, cursor: "pointer",
              background: (!formValid || submitting) ? "rgba(26,115,232,0.3)" : "linear-gradient(135deg, #1a73e8, #0d47a1)",
              border: "none", color: "#fff", fontSize: isMobile ? 13 : 15, fontWeight: 700,
              textAlign: "center" as const,
              transition: "all 0.3s",
              opacity: (!formValid || submitting) ? 0.4 : 1,
            }}
          >
            <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
              <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/>
            </svg>
            {submitting ? <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" style={{ animation: "spin 1s linear infinite" }}><path d="M12 2a10 10 0 0 1 10 10" /></svg> : null}
            {submitting ? t.booking.redirectingToPayment : (isAr ? `ادفع الآن بالبطاقة — ${displayTotal.toLocaleString()} ${cur}` : `Pay Now by Card — ${displayTotal.toLocaleString()} ${cur}`)}
          </button>

          <div style={{ display: "flex", alignItems: "center", gap: 14, margin: "6px 0" }}>
            <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.08)" }} />
            <span style={{ color: "rgba(255,255,255,0.2)", fontSize: 11 }}>{isAr ? "أو قسّط" : "or split payments"}</span>
            <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.08)" }} />
          </div>

          {/* Tabby */}
          <button
            onClick={() => submit("tabby")}
            disabled={!formValid || submitting}
            style={(!formValid || submitting) ? { ...bnplBase, background: "#003227", opacity: 0.3, cursor: "not-allowed" } : { ...bnplBase, background: "#003227", cursor: "pointer" }}>
            <span><svg width="60" height="20" viewBox="0 0 60 20" fill="none"><text x="0" y="16" fontFamily="system-ui, sans-serif" fontWeight="800" fontSize="18" letterSpacing="-0.5" fill="#3bff9d">tabby</text></svg></span>
            <span style={{ display: "flex", flexDirection: "column" as const, alignItems: dir === "rtl" ? "flex-start" : "flex-end" }}>
              {submitting ? <span style={{ color: "#fff", fontSize: 13, fontWeight: 700 }}>{isAr ? "جاري المعالجة..." : "Processing..."}</span> : <>
              <span style={{ color: "#fff", fontSize: 13, fontWeight: 700 }}>{Math.ceil(total / 4).toLocaleString()} {cur}<span style={{ fontWeight: 400, opacity: 0.6 }}>{t.booking.perMonth}</span></span>
              <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 11 }}>{t.booking.splitIn4}</span>
              </>}
            </span>
          </button>

          {/* Tamara */}
          <button
            onClick={() => submit("tamara")}
            disabled={!formValid || submitting}
            style={(!formValid || submitting) ? { ...bnplBase, background: "#250155", opacity: 0.3, cursor: "not-allowed" } : { ...bnplBase, background: "#250155", cursor: "pointer" }}>
            <span><svg width="72" height="20" viewBox="0 0 72 20" fill="none"><text x="0" y="16" fontFamily="system-ui, sans-serif" fontWeight="800" fontSize="18" letterSpacing="-0.5" fill="#c77dff">tamara</text></svg></span>
            <span style={{ display: "flex", flexDirection: "column" as const, alignItems: dir === "rtl" ? "flex-start" : "flex-end" }}>
              {submitting ? <span style={{ color: "#fff", fontSize: 13, fontWeight: 700 }}>{isAr ? "جاري المعالجة..." : "Processing..."}</span> : <>
              <span style={{ color: "#fff", fontSize: 13, fontWeight: 700 }}>{Math.ceil(total / 3).toLocaleString()} {cur}<span style={{ fontWeight: 400, opacity: 0.6 }}>{t.booking.perMonth}</span></span>
              <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 11 }}>{t.booking.splitIn3}</span>
              </>}
            </span>
          </button>
        </div>
      </div>

    </>
  );
}
