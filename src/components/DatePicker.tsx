"use client";

import { useState, useMemo, useEffect } from "react";

interface Props {
  value: string;
  onChange: (date: string) => void;
  unavailableDates?: string[];
  minDate?: string;
  isAr?: boolean;
  placeholder?: string;
}

const enMonths = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const arMonths = ["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو", "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"];
const enDows = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const arDows = ["أحد", "اثن", "ثلا", "أرب", "خمي", "جمع", "سبت"];

const fmt = (d: Date) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
};

export default function DatePicker({ value, onChange, unavailableDates = [], minDate, isAr = false, placeholder }: Props) {
  const [open, setOpen] = useState(false);
  const initial = value ? new Date(value + "T00:00:00") : new Date();
  const [view, setView] = useState({ y: initial.getFullYear(), m: initial.getMonth() });

  useEffect(() => {
    if (!open) return;
    const close = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest("[data-datepicker]")) setOpen(false);
    };
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, [open]);

  const minDateObj = useMemo(() => (minDate ? new Date(minDate + "T00:00:00") : null), [minDate]);
  const unavailableSet = useMemo(() => new Set(unavailableDates), [unavailableDates]);

  const cells = useMemo(() => {
    const first = new Date(view.y, view.m, 1);
    const startDow = first.getDay();
    const daysInMonth = new Date(view.y, view.m + 1, 0).getDate();
    const arr: { date: Date | null; iso: string; disabled: boolean; unavailable: boolean }[] = [];
    for (let i = 0; i < startDow; i++) arr.push({ date: null, iso: "", disabled: true, unavailable: false });
    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(view.y, view.m, d);
      const iso = fmt(date);
      const past = minDateObj ? date < minDateObj : false;
      const unavailable = unavailableSet.has(iso);
      arr.push({ date, iso, disabled: past || unavailable, unavailable });
    }
    return arr;
  }, [view, minDateObj, unavailableSet]);

  const months = isAr ? arMonths : enMonths;
  const dows = isAr ? arDows : enDows;

  const goPrev = () => {
    setView(v => v.m === 0 ? { y: v.y - 1, m: 11 } : { y: v.y, m: v.m - 1 });
  };
  const goNext = () => {
    setView(v => v.m === 11 ? { y: v.y + 1, m: 0 } : { y: v.y, m: v.m + 1 });
  };

  const display = value || (placeholder ?? (isAr ? "اختر التاريخ" : "Pick a date"));

  return (
    <div data-datepicker style={{ position: "relative" }} dir={isAr ? "rtl" : "ltr"}>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        style={{
          width: "100%", padding: "14px 18px", borderRadius: 12,
          background: "#111", border: "1px solid rgba(255,255,255,0.08)",
          color: value ? "#fff" : "rgba(255,255,255,0.35)", fontSize: 15,
          textAlign: isAr ? "right" : "left", cursor: "pointer",
          display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10,
          transition: "border-color 0.2s",
        }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(246,190,0,0.3)"; }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"; }}
      >
        <span>{display}</span>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#F6BE00" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="4" width="18" height="18" rx="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
      </button>

      {open && (
        <div
          style={{
            position: "absolute", top: "calc(100% + 6px)", left: 0, right: 0, zIndex: 50,
            background: "#0a0a0a", border: "1px solid rgba(246,190,0,0.2)",
            borderRadius: 14, padding: 14,
            boxShadow: "0 12px 40px rgba(0,0,0,0.6)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
            <button type="button" onClick={goPrev} style={navBtn}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d={isAr ? "M9 18l6-6-6-6" : "M15 18l-6-6 6-6"} />
              </svg>
            </button>
            <div style={{ color: "#fff", fontSize: 14, fontWeight: 600 }}>
              {months[view.m]} {view.y}
            </div>
            <button type="button" onClick={goNext} style={navBtn}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d={isAr ? "M15 18l-6-6 6-6" : "M9 18l6-6-6-6"} />
              </svg>
            </button>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4, marginBottom: 6 }}>
            {dows.map(d => (
              <div key={d} style={{ textAlign: "center", color: "rgba(255,255,255,0.35)", fontSize: 10, fontWeight: 600, padding: "6px 0" }}>{d}</div>
            ))}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 4 }}>
            {cells.map((c, i) => {
              if (!c.date) return <div key={i} />;
              const isSelected = c.iso === value;
              const day = c.date.getDate();
              return (
                <button
                  key={c.iso}
                  type="button"
                  disabled={c.disabled}
                  onClick={() => { if (!c.disabled) { onChange(c.iso); setOpen(false); } }}
                  title={c.unavailable ? (isAr ? "محجوز بالكامل" : "Fully booked") : undefined}
                  style={{
                    aspectRatio: "1",
                    borderRadius: 8,
                    border: "1px solid transparent",
                    background: isSelected ? "#F6BE00" : c.unavailable ? "rgba(244,67,54,0.08)" : "rgba(255,255,255,0.03)",
                    color: isSelected ? "#000" : c.disabled ? "rgba(255,255,255,0.2)" : "#fff",
                    fontSize: 13,
                    fontWeight: isSelected ? 700 : 500,
                    cursor: c.disabled ? "not-allowed" : "pointer",
                    textDecoration: c.unavailable ? "line-through" : "none",
                    transition: "all 0.15s",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    position: "relative",
                  }}
                  onMouseEnter={e => {
                    if (!c.disabled && !isSelected) {
                      e.currentTarget.style.background = "rgba(246,190,0,0.15)";
                      e.currentTarget.style.borderColor = "rgba(246,190,0,0.3)";
                    }
                  }}
                  onMouseLeave={e => {
                    if (!c.disabled && !isSelected) {
                      e.currentTarget.style.background = "rgba(255,255,255,0.03)";
                      e.currentTarget.style.borderColor = "transparent";
                    }
                  }}
                >
                  {day}
                  {c.unavailable && (
                    <span style={{
                      position: "absolute", bottom: 2, left: "50%", transform: "translateX(-50%)",
                      width: 4, height: 4, borderRadius: "50%", background: "#f44336",
                    }} />
                  )}
                </button>
              );
            })}
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 12, paddingTop: 10, borderTop: "1px solid rgba(255,255,255,0.06)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 10, color: "rgba(255,255,255,0.4)" }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: "#f44336" }} />
              {isAr ? "محجوز" : "Booked"}
            </div>
            <button
              type="button"
              onClick={() => setOpen(false)}
              style={{
                background: "none", border: "none", color: "#F6BE00",
                fontSize: 12, fontWeight: 600, cursor: "pointer", padding: "4px 10px",
              }}
            >
              {isAr ? "إغلاق" : "Close"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

const navBtn: React.CSSProperties = {
  width: 32, height: 32, borderRadius: 8,
  background: "rgba(246,190,0,0.08)", border: "1px solid rgba(246,190,0,0.2)",
  color: "#F6BE00", cursor: "pointer",
  display: "flex", alignItems: "center", justifyContent: "center",
  transition: "background 0.2s",
};
