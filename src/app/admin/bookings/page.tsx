"use client";

import React, { useEffect, useState, useCallback, useMemo } from "react";

const ADDON_NAMES: Record<string, string> = {
  ozone: "Ozone Sanitization",
  "rim-ceramic": "Rim Ceramic",
  "engine-clean": "Engine Cleaning",
  "remove-tint": "Tint Removal",
  "remove-partial": "Partial Protection Removal",
  "remove-front": "Front Protection Removal",
  "remove-full": "Full Protection Removal",
};

const SERVICE_NAMES: Record<string, string> = {
  "ppf-color": "PPF Color", "ppf-clear75": "PPF Clear 75%", "ppf-clear85": "PPF Clear 85%", "ppf-matte": "PPF Matte",
  "ppf-front-rear": "PPF Front & Rear", "ppf-front": "PPF Front", "ppf-partial-rear": "PPF Partial Rear", "ppf-partial": "PPF Partial",
  "ppf-windshield": "PPF Windshield",
  "tint-full": "Full Tint", "tint-front": "Front Tint",
  "ceramic-int-1": "Interior Ceramic 1yr", "ceramic-int-3": "Interior Ceramic 3yr", "ceramic-int-5": "Interior Ceramic 5yr",
  "ceramic-ext-1": "Exterior Ceramic 1yr", "ceramic-ext-3": "Exterior Ceramic 3yr", "ceramic-ext-5": "Exterior Ceramic 5yr",
  "wrap-color": "Color Wrap", "wrap-chrome-delete": "Chrome Delete",
};

interface Booking {
  id: string;
  confirmation_number: string | null;
  customer_name: string;
  customer_phone: string;
  customer_notes: string | null;
  car_make: string | null;
  car_year: string | null;
  car_color: string | null;
  preferred_date: string | null;
  car_size: string;
  package_id: string | null;
  service_ids: string[];
  addon_ids: Record<string, unknown> | null;
  subtotal: number;
  discount: number;
  total: number;
  payment_method: string;
  status: string;
  locale: string;
  created_at: string;
  updated_at: string;
}

interface Service {
  id: string;
  name_en: string;
  name_ar: string;
  category: string;
}

interface Package {
  id: string;
  name_en: string;
  name_ar: string;
  tier: string;
}

const STATUSES = ["all", "pending", "confirmed", "in_progress", "completed", "cancelled"];

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// preferred_date may be "YYYY-MM-DD" (legacy) or "YYYY-MM-DD HH:MM" (with time slot)
function formatPreferred(raw: string | null) {
  if (!raw) return { date: "—", time: "" };
  const [datePart, timePart] = raw.trim().split(/\s+/);
  let dateStr = "—";
  try {
    dateStr = new Date(datePart + "T00:00:00").toLocaleDateString("en-GB", {
      weekday: "short", day: "numeric", month: "short", year: "numeric",
    });
  } catch { /* fallback */ }
  let timeStr = "";
  if (timePart) {
    const [h, m] = timePart.split(":");
    const hr = parseInt(h, 10);
    const ampm = hr >= 12 ? "PM" : "AM";
    const display = hr === 0 ? 12 : hr > 12 ? hr - 12 : hr;
    timeStr = `${display}:${m} ${ampm}`;
  }
  return { date: dateStr, time: timeStr };
}

const PAYMENT_LABELS: Record<string, string> = {
  cash: "Cash at Shop",
  online: "Card (Neoleap)",
  tabby: "Tabby (4×)",
  tamara: "Tamara (3×)",
};

const STATUS_STRIPE: Record<string, string> = {
  pending: "#FBBF24",
  confirmed: "#60A5FA",
  in_progress: "#F59E0B",
  completed: "#34D399",
  cancelled: "#FCA5A5",
  pending_payment: "#9CA3AF",
};

type SortKey = "newest" | "oldest" | "preferred-soonest" | "total-desc" | "total-asc";
type ViewMode = "table" | "cards";
type Bucket = "overdue" | "today" | "tomorrow" | "thisWeek" | "later" | "noDate" | "past";

const BUCKET_LABELS: Record<Bucket, string> = {
  overdue: "Overdue",
  today: "Today",
  tomorrow: "Tomorrow",
  thisWeek: "This Week",
  later: "Later",
  noDate: "No Preferred Date",
  past: "Past",
};

function getDateBucket(b: { preferred_date: string | null; status: string; created_at: string }): Bucket {
  const isPastStatus = b.status === "completed" || b.status === "cancelled";
  if (isPastStatus) return "past";
  if (!b.preferred_date) return "noDate";
  const datePart = b.preferred_date.trim().split(/\s+/)[0];
  const pref = new Date(datePart + "T00:00:00");
  if (isNaN(pref.getTime())) return "noDate";
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diffDays = Math.floor((pref.getTime() - today.getTime()) / 86400000);
  if (diffDays < 0) return "overdue";
  if (diffDays === 0) return "today";
  if (diffDays === 1) return "tomorrow";
  if (diffDays <= 7) return "thisWeek";
  return "later";
}

const BUCKET_ORDER: Bucket[] = ["overdue", "today", "tomorrow", "thisWeek", "later", "noDate", "past"];

const DAILY_CAPACITY = 5;

type WaTemplate = "confirm" | "remind" | "ready";

interface BookingForWa {
  customer_name: string;
  customer_phone: string;
  preferred_date: string | null;
  confirmation_number: string | null;
}

function buildWhatsAppLink(b: BookingForWa, template: WaTemplate): string {
  const pref = formatPreferred(b.preferred_date);
  const dateStr = pref.date !== "—" ? pref.date : "";
  const timeStr = pref.time;
  const conf = b.confirmation_number || "";
  const name = b.customer_name.split(/\s+/)[0]; // first name
  let msg = "";
  switch (template) {
    case "confirm":
      msg = `مرحباً ${name} 👋\n\nتم تأكيد حجزك في NICK Automotive Films ✅\n\n📋 رقم الحجز: ${conf}\n📅 التاريخ: ${dateStr}${timeStr ? `\n⏰ الوقت: ${timeStr}` : ""}\n📍 العنوان: حي النرجس، طريق أنس بن مالك، الرياض\n\nنشوفك قريب 🚗✨`;
      break;
    case "remind":
      msg = `مرحباً ${name} 👋\n\nتذكير ودي: عندك موعد بكرة في NICK ⏰${timeStr ? `\nالوقت: ${timeStr}` : ""}\n📋 رقم الحجز: ${conf}\n\nلو في أي تغيير، تواصل معنا على نفس الرقم 🙏`;
      break;
    case "ready":
      msg = `أهلاً ${name} 🎉\n\nسيارتك جاهزة للاستلام من NICK 🚗✨\n📋 رقم الحجز: ${conf}\n📍 حي النرجس، طريق أنس بن مالك، الرياض\n\nبانتظارك في أي وقت خلال ساعات العمل 🙏`;
      break;
  }
  const cleanedPhone = b.customer_phone.replace(/[^0-9]/g, "");
  return `https://wa.me/${cleanedPhone}?text=${encodeURIComponent(msg)}`;
}

function getCapacityForDate(bookings: { preferred_date: string | null; status: string }[], dateKey: string): number {
  return bookings.filter(b => b.preferred_date?.startsWith(dateKey) && b.status !== "cancelled").length;
}

// Notify on new bookings — sound chime + desktop notification
function notifyNewBookings(newBookings: { customer_name: string; confirmation_number: string | null; total: number }[]) {
  // Sound: short beep using Web Audio (no asset to ship)
  try {
    const Ctx = (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext);
    const ctx = new Ctx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain); gain.connect(ctx.destination);
    osc.type = "sine"; osc.frequency.value = 880;
    gain.gain.setValueAtTime(0.001, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.25, ctx.currentTime + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.6);
    osc.start();
    osc.stop(ctx.currentTime + 0.65);
    setTimeout(() => ctx.close().catch(() => {}), 1000);
  } catch { /* ignore */ }

  // Desktop notification
  if ("Notification" in window && Notification.permission === "granted") {
    const first = newBookings[0];
    const title = newBookings.length === 1
      ? `New booking · ${first.confirmation_number || ""}`
      : `${newBookings.length} new bookings`;
    const body = newBookings.length === 1
      ? `${first.customer_name} · ${(first.total || 0).toLocaleString()} SAR`
      : newBookings.map(b => `${b.customer_name} · ${(b.total || 0).toLocaleString()} SAR`).slice(0, 3).join("\n");
    try {
      new Notification(title, { body, icon: "/images/nick-logo.png", tag: "nick-new-booking" });
    } catch { /* ignore */ }
  }
}

function formatRelativeTime(ts: number): string {
  const diffSec = Math.floor((Date.now() - ts) / 1000);
  if (diffSec < 5) return "just now";
  if (diffSec < 60) return `${diffSec}s ago`;
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffH = Math.floor(diffMin / 60);
  return `${diffH}h ago`;
}

function badgeStyle(status: string): React.CSSProperties {
  const colors: Record<string, [string, string]> = {
    pending: ["rgba(246,190,0,0.15)", "#FBBF24"],
    confirmed: ["rgba(59,130,246,0.15)", "#60A5FA"],
    in_progress: ["rgba(245,158,11,0.15)", "#FBBF24"],
    completed: ["rgba(16,185,129,0.15)", "#34D399"],
    cancelled: ["rgba(239,68,68,0.15)", "#FCA5A5"],
  };
  const [bg, color] = colors[status] || ["rgba(107,114,128,0.15)", "#9CA3AF"];
  return {
    display: "inline-flex",
    padding: "4px 10px",
    borderRadius: 100,
    fontSize: 11,
    fontWeight: 700,
    background: bg,
    color,
    textTransform: "capitalize",
    whiteSpace: "nowrap",
  };
}

const thStyle: React.CSSProperties = {
  fontSize: 11.5,
  fontWeight: 600,
  color: "rgba(255,255,255,0.3)",
  textAlign: "left",
  padding: "10px 12px",
  borderBottom: "1px solid rgba(255,255,255,0.06)",
  letterSpacing: "0.02em",
};

const tdStyle: React.CSSProperties = {
  fontSize: 13,
  padding: "12px",
  borderBottom: "1px solid rgba(255,255,255,0.03)",
  color: "rgba(255,255,255,0.55)",
};

function InlineStatusActions({ status, onUpdate, updating }: { status: string; onUpdate: (s: string) => void; updating: boolean }) {
  const steps: { from: string; to: string; label: string; color: string }[] = [
    { from: "pending", to: "confirmed", label: "Confirm", color: "#60A5FA" },
    { from: "confirmed", to: "in_progress", label: "Start", color: "#F59E0B" },
    { from: "in_progress", to: "completed", label: "Done", color: "#34D399" },
  ];
  const step = steps.find(s => s.from === status);
  const canCancel = status !== "cancelled" && status !== "completed";
  return (
    <span style={{ display: "inline-flex", gap: 4 }} onClick={e => e.stopPropagation()}>
      {step && (
        <button
          onClick={() => onUpdate(step.to)}
          disabled={updating}
          title={step.label}
          style={{
            padding: "4px 9px", borderRadius: 7, cursor: updating ? "wait" : "pointer",
            background: `${step.color}22`, border: `1px solid ${step.color}55`,
            color: step.color, fontSize: 11, fontWeight: 700,
          }}
        >
          {step.label}
        </button>
      )}
      {canCancel && (
        <button
          onClick={() => onUpdate("cancelled")}
          disabled={updating}
          title="Cancel"
          style={{
            padding: "4px 8px", borderRadius: 7, cursor: updating ? "wait" : "pointer",
            background: "transparent", border: "1px solid rgba(239,68,68,0.25)",
            color: "#FCA5A5", fontSize: 11, fontWeight: 600,
          }}
        >
          ✕
        </button>
      )}
    </span>
  );
}

interface BookingTableProps {
  items: Booking[];
  selected: Set<string>;
  expandedId: string | null;
  onToggleSelect: (id: string) => void;
  onToggleSelectAll: (ids: string[]) => void;
  onToggleExpand: (id: string) => void;
  onUpdateStatus: (id: string, status: string) => void;
  updatingId: string | null;
  ExpandedDetails: React.ComponentType<{ b: Booking }>;
}

function BookingTable({ items, selected, expandedId, onToggleSelect, onToggleSelectAll, onToggleExpand, onUpdateStatus, updatingId, ExpandedDetails }: BookingTableProps) {
  return (
    <div style={{ background: "#111111", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 14, overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 720 }}>
        <thead>
          <tr>
            <th style={{ ...thStyle, width: 36, padding: "10px 0 10px 12px" }}>
              <input
                type="checkbox"
                checked={items.length > 0 && items.every(b => selected.has(b.id))}
                onChange={() => onToggleSelectAll(items.map(b => b.id))}
                style={{ accentColor: "#F6BE00", cursor: "pointer" }}
                aria-label="Select all in section"
              />
            </th>
            <th style={thStyle}>Confirmation</th>
            <th style={thStyle}>Customer</th>
            <th style={thStyle}>Vehicle</th>
            <th style={thStyle}>Preferred</th>
            <th style={thStyle}>Status</th>
            <th style={thStyle}>Total</th>
            <th style={thStyle}></th>
          </tr>
        </thead>
        <tbody>
          {items.map(b => {
            const expanded = expandedId === b.id;
            const pref = formatPreferred(b.preferred_date);
            const stripe = STATUS_STRIPE[b.status] || "#9CA3AF";
            return (
              <React.Fragment key={b.id}>
                <tr
                  className="booking-row"
                  onClick={() => onToggleExpand(b.id)}
                  style={{ cursor: "pointer", transition: "background 0.15s", boxShadow: `inset 3px 0 0 ${stripe}` }}
                >
                  <td style={{ ...tdStyle, padding: "12px 0 12px 12px" }} onClick={(e) => { e.stopPropagation(); onToggleSelect(b.id); }}>
                    <input
                      type="checkbox"
                      checked={selected.has(b.id)}
                      onChange={() => onToggleSelect(b.id)}
                      onClick={(e) => e.stopPropagation()}
                      style={{ accentColor: "#F6BE00", cursor: "pointer" }}
                      aria-label={`Select booking ${b.customer_name}`}
                    />
                  </td>
                  <td style={tdStyle}>
                    {b.confirmation_number ? (
                      <span
                        onClick={(e) => { e.stopPropagation(); navigator.clipboard?.writeText(b.confirmation_number!); }}
                        title="Click to copy"
                        style={{ fontFamily: "'Space Grotesk', sans-serif", color: "#F6BE00", fontWeight: 700, fontSize: 12, letterSpacing: "0.04em", cursor: "copy" }}
                      >
                        {b.confirmation_number}
                      </span>
                    ) : (
                      <span style={{ fontSize: 11, color: "rgba(255,255,255,0.2)" }}>—</span>
                    )}
                    <br />
                    <span style={{ fontSize: 10, color: "rgba(255,255,255,0.3)" }}>{PAYMENT_LABELS[b.payment_method] || b.payment_method}</span>
                  </td>
                  <td style={tdStyle}>
                    <span style={{ color: "#f5f5f5", fontWeight: 600, fontSize: 13 }}>{b.customer_name}</span>
                    <br />
                    <span style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}>{b.customer_phone}</span>
                  </td>
                  <td style={tdStyle}>
                    <span style={{ color: "#f5f5f5", fontSize: 12 }}>{b.car_make || "—"}</span>
                    {(b.car_year || b.car_color) && (
                      <><br /><span style={{ fontSize: 10, color: "rgba(255,255,255,0.3)" }}>{[b.car_year, b.car_color].filter(Boolean).join(" · ")}</span></>
                    )}
                    <br /><span style={{ fontSize: 10, color: "rgba(246,190,0,0.5)", textTransform: "capitalize" }}>{b.car_size} · {b.service_ids?.length || 0} svc</span>
                  </td>
                  <td style={{ ...tdStyle, whiteSpace: "nowrap" }}>
                    <span style={{ color: "#f5f5f5", fontSize: 12 }}>{pref.date}</span>
                    {pref.time && <><br /><span style={{ fontSize: 10, color: "#F6BE00" }}>{pref.time}</span></>}
                  </td>
                  <td style={tdStyle}>
                    <span style={badgeStyle(b.status)}>{b.status.replace("_", " ")}</span>
                  </td>
                  <td style={tdStyle}>
                    <span style={{ fontWeight: 600, color: "#f5f5f5" }}>
                      {(b.total || 0).toLocaleString()} SAR
                    </span>
                  </td>
                  <td style={{ ...tdStyle, whiteSpace: "nowrap" }}>
                    <InlineStatusActions status={b.status} onUpdate={(s) => onUpdateStatus(b.id, s)} updating={updatingId === b.id} />
                  </td>
                </tr>
                {expanded && (
                  <tr>
                    <td colSpan={8} style={{ padding: 0 }}>
                      <ExpandedDetails b={b} />
                    </td>
                  </tr>
                )}
              </React.Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

interface BookingCardProps {
  b: Booking;
  selected: boolean;
  expanded: boolean;
  onToggleSelect: () => void;
  onToggleExpand: () => void;
  onUpdateStatus: (id: string, status: string) => void;
  updating: boolean;
  ExpandedDetails: React.ComponentType<{ b: Booking }>;
}

function BookingCard({ b, selected, expanded, onToggleSelect, onToggleExpand, onUpdateStatus, updating, ExpandedDetails }: BookingCardProps) {
  const pref = formatPreferred(b.preferred_date);
  const stripe = STATUS_STRIPE[b.status] || "#9CA3AF";
  return (
    <div
      style={{
        background: "#111", border: "1px solid rgba(255,255,255,0.06)",
        borderLeft: `3px solid ${stripe}`,
        borderRadius: 12, overflow: "hidden",
      }}
    >
      <div onClick={onToggleExpand} style={{ padding: "12px 14px", cursor: "pointer" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6, gap: 8 }}>
          <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
            <input
              type="checkbox"
              checked={selected}
              onChange={onToggleSelect}
              onClick={e => e.stopPropagation()}
              style={{ accentColor: "#F6BE00", cursor: "pointer" }}
              aria-label={`Select ${b.customer_name}`}
            />
            {b.confirmation_number && (
              <span
                onClick={(e) => { e.stopPropagation(); navigator.clipboard?.writeText(b.confirmation_number!); }}
                title="Click to copy"
                style={{ fontFamily: "'Space Grotesk', sans-serif", color: "#F6BE00", fontWeight: 700, fontSize: 11, letterSpacing: "0.04em", cursor: "copy" }}
              >
                {b.confirmation_number}
              </span>
            )}
          </span>
          <span style={{ ...badgeStyle(b.status), flexShrink: 0 }}>{b.status.replace("_", " ")}</span>
        </div>
        <div style={{ fontSize: 14, fontWeight: 600, color: "#f5f5f5", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
          {b.customer_name}
        </div>
        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginTop: 2 }}>
          {b.customer_phone}
        </div>
        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", marginTop: 4 }}>
          {b.car_make || b.car_size} · {b.service_ids?.length || 0} svc
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 8, paddingTop: 8, borderTop: "1px solid rgba(255,255,255,0.04)" }}>
          <span style={{ fontSize: 11, color: "rgba(255,255,255,0.55)" }}>
            {pref.date}{pref.time ? ` · ${pref.time}` : ""}
          </span>
          <span style={{ fontSize: 13, fontWeight: 700, color: "#f5f5f5" }}>
            {(b.total || 0).toLocaleString()} SAR
          </span>
        </div>
        <div style={{ marginTop: 8 }}>
          <InlineStatusActions status={b.status} onUpdate={(s) => onUpdateStatus(b.id, s)} updating={updating} />
        </div>
      </div>
      {expanded && <ExpandedDetails b={b} />}
    </div>
  );
}

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkBusy, setBulkBusy] = useState(false);
  const [sortBy, setSortBy] = useState<SortKey>("preferred-soonest");
  const [viewMode, setViewMode] = useState<ViewMode>("table");
  const [collapsedBuckets, setCollapsedBuckets] = useState<Set<Bucket>>(new Set(["past"]));
  const [profilePhone, setProfilePhone] = useState<string | null>(null);
  const [printingId, setPrintingId] = useState<string | null>(null);
  const [lastRefreshed, setLastRefreshed] = useState<number>(Date.now());
  const [autoRefresh, setAutoRefresh] = useState(true);

  const fetchBookings = useCallback((silent = false) => {
    if (!silent) setLoading(true);
    fetch("/api/bookings")
      .then((r) => r.json())
      .then((d) => {
        if (Array.isArray(d)) {
          setBookings(prev => {
            // Detect newly arrived bookings (silent refresh only)
            if (silent && prev.length > 0) {
              const prevIds = new Set(prev.map(b => b.id));
              const newOnes = (d as Booking[]).filter(b => !prevIds.has(b.id));
              if (newOnes.length > 0) notifyNewBookings(newOnes);
            }
            return d;
          });
          setLastRefreshed(Date.now());
        }
      })
      .catch(() => {})
      .finally(() => { if (!silent) setLoading(false); });
  }, []);

  // Notification permission prompt — once
  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      // Defer prompt to first user interaction to avoid being intrusive
      const ask = () => { Notification.requestPermission().catch(() => {}); window.removeEventListener("click", ask); };
      window.addEventListener("click", ask, { once: true });
      return () => window.removeEventListener("click", ask);
    }
  }, []);

  useEffect(() => {
    fetchBookings();
    fetch("/api/services?all=true")
      .then((r) => r.json())
      .then((d) => { if (Array.isArray(d)) setServices(d); })
      .catch(() => {});
    fetch("/api/packages?all=true")
      .then((r) => r.json())
      .then((d) => { if (Array.isArray(d)) setPackages(d); })
      .catch(() => {});
  }, [fetchBookings]);

  // Auto-refresh every 60s while tab is visible
  useEffect(() => {
    if (!autoRefresh) return;
    const id = setInterval(() => {
      if (document.visibilityState === "visible") fetchBookings(true);
    }, 60_000);
    return () => clearInterval(id);
  }, [autoRefresh, fetchBookings]);

  // Tick to refresh "X seconds ago" label every 10s
  const [, forceTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => forceTick(t => t + 1), 10_000);
    return () => clearInterval(id);
  }, []);

  async function deleteBooking(id: string) {
    if (!confirm("Delete this booking permanently?")) return;
    setDeletingId(id);
    try {
      const res = await fetch("/api/bookings", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (res.ok) {
        setBookings((prev) => prev.filter((b) => b.id !== id));
        setExpandedId(null);
      }
    } catch { /* ignore */ }
    setDeletingId(null);
  }

  async function updateStatus(id: string, status: string) {
    setUpdatingId(id);
    try {
      const res = await fetch("/api/bookings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      if (res.ok) {
        setBookings((prev) =>
          prev.map((b) => (b.id === id ? { ...b, status } : b))
        );
      }
    } catch {
      // ignore
    }
    setUpdatingId(null);
  }

  function getServiceName(id: string) {
    const s = services.find((sv) => sv.id === id);
    return s ? s.name_en : id;
  }

  function getPackageName(id: string) {
    const p = packages.find((pk) => pk.id === id);
    return p ? `${p.name_en} (${p.tier})` : id;
  }

  const filtered = useMemo(() => bookings.filter((b) => {
    if (filter !== "all" && b.status !== filter) return false;
    if (search) {
      const q = search.toLowerCase();
      if (
        !b.customer_name.toLowerCase().includes(q) &&
        !b.customer_phone.includes(q) &&
        !(b.confirmation_number || "").toLowerCase().includes(q) &&
        !(b.car_make || "").toLowerCase().includes(q)
      )
        return false;
    }
    if (dateFrom) {
      const bookingDate = new Date(b.created_at).toISOString().slice(0, 10);
      if (bookingDate < dateFrom) return false;
    }
    if (dateTo) {
      const bookingDate = new Date(b.created_at).toISOString().slice(0, 10);
      if (bookingDate > dateTo) return false;
    }
    return true;
  }), [bookings, filter, search, dateFrom, dateTo]);

  const sorted = useMemo(() => {
    const arr = [...filtered];
    const prefTime = (b: Booking) => {
      if (!b.preferred_date) return Number.MAX_SAFE_INTEGER;
      const datePart = b.preferred_date.trim().split(/\s+/)[0];
      const t = new Date(datePart + "T00:00:00").getTime();
      return isNaN(t) ? Number.MAX_SAFE_INTEGER : t;
    };
    switch (sortBy) {
      case "newest": arr.sort((a, b) => +new Date(b.created_at) - +new Date(a.created_at)); break;
      case "oldest": arr.sort((a, b) => +new Date(a.created_at) - +new Date(b.created_at)); break;
      case "preferred-soonest": arr.sort((a, b) => prefTime(a) - prefTime(b)); break;
      case "total-desc": arr.sort((a, b) => (b.total || 0) - (a.total || 0)); break;
      case "total-asc": arr.sort((a, b) => (a.total || 0) - (b.total || 0)); break;
    }
    return arr;
  }, [filtered, sortBy]);

  const groups = useMemo(() => {
    const map = new Map<Bucket, Booking[]>();
    for (const b of sorted) {
      const k = getDateBucket(b);
      if (!map.has(k)) map.set(k, []);
      map.get(k)!.push(b);
    }
    return BUCKET_ORDER
      .filter(k => map.has(k))
      .map(k => ({ key: k, label: BUCKET_LABELS[k], items: map.get(k)! }));
  }, [sorted]);

  const summaryStats = useMemo(() => {
    const todayKey = new Date().toISOString().slice(0, 10);
    const tomorrowKey = new Date(Date.now() + 86400000).toISOString().slice(0, 10);
    const today = bookings.filter(b => b.preferred_date?.startsWith(todayKey) && b.status !== "cancelled");
    const tomorrow = bookings.filter(b => b.preferred_date?.startsWith(tomorrowKey) && b.status !== "cancelled");
    const sum = (arr: Booking[]) => arr.reduce((s, b) => s + (b.total || 0), 0);
    return {
      todayCount: today.length, todayRevenue: sum(today),
      tomorrowCount: tomorrow.length, tomorrowRevenue: sum(tomorrow),
      pendingCount: bookings.filter(b => b.status === "pending").length,
      totalRevenue: sum(bookings.filter(b => b.status !== "cancelled")),
    };
  }, [bookings]);

  function toggleBucket(k: Bucket) {
    setCollapsedBuckets(prev => {
      const next = new Set(prev);
      if (next.has(k)) next.delete(k); else next.add(k);
      return next;
    });
  }

  // Saved view presets — sets multiple filters at once
  function applyPreset(name: "todayOnly" | "weekPending" | "completedRecent" | "reset") {
    const today = new Date().toISOString().slice(0, 10);
    switch (name) {
      case "todayOnly":
        setFilter("all"); setSearch(""); setDateFrom(""); setDateTo("");
        setSortBy("preferred-soonest");
        setCollapsedBuckets(new Set(["overdue", "tomorrow", "thisWeek", "later", "noDate", "past"]));
        break;
      case "weekPending":
        setFilter("pending"); setSearch(""); setDateFrom(""); setDateTo("");
        setSortBy("preferred-soonest");
        setCollapsedBuckets(new Set(["past"]));
        break;
      case "completedRecent":
        setFilter("completed"); setSearch(""); setDateFrom(today); setDateTo("");
        setSortBy("newest");
        setCollapsedBuckets(new Set());
        break;
      case "reset":
        setFilter("all"); setSearch(""); setDateFrom(""); setDateTo("");
        setSortBy("preferred-soonest");
        setCollapsedBuckets(new Set(["past"]));
        break;
    }
  }

  // Customer profile — all bookings by phone
  const profileData = useMemo(() => {
    if (!profilePhone) return null;
    const list = bookings.filter(b => b.customer_phone === profilePhone)
      .sort((a, b) => +new Date(b.created_at) - +new Date(a.created_at));
    const totalSpent = list.filter(b => b.status !== "cancelled").reduce((s, b) => s + (b.total || 0), 0);
    return {
      phone: profilePhone,
      name: list[0]?.customer_name || "—",
      bookings: list,
      totalSpent,
      isReturning: list.length > 1,
      firstBooking: list[list.length - 1]?.created_at,
      lastBooking: list[0]?.created_at,
    };
  }, [profilePhone, bookings]);

  function printWorkOrder(b: Booking) {
    setPrintingId(b.id);
    const pref = formatPreferred(b.preferred_date);
    const svcList = (b.service_ids || []).map(id => getServiceName(id));
    const pkgName = b.package_id ? getPackageName(b.package_id) : null;
    const addonsBlock = (() => {
      const raw = b.addon_ids;
      const parsed: Record<string, unknown> | null = typeof raw === "string" ? (() => { try { return JSON.parse(raw); } catch { return null; } })() : raw;
      if (!parsed || typeof parsed !== "object" || Object.keys(parsed).length === 0) return "";
      return Object.entries(parsed).map(([svcId, addonIds]) => {
        const addons = Array.isArray(addonIds) ? (addonIds as string[]).join(", ") : String(addonIds);
        return `<div><strong>${getServiceName(svcId)}:</strong> ${addons}</div>`;
      }).join("");
    })();
    const html = `<!doctype html>
<html><head><meta charset="utf-8"><title>Work Order ${b.confirmation_number || b.id.slice(0, 8)}</title>
<style>
  *{box-sizing:border-box} body{font-family:Arial,sans-serif;max-width:720px;margin:30px auto;padding:0 20px;color:#000}
  h1{font-size:24px;margin:0 0 6px;color:#000}
  .brand{font-size:14px;color:#888;margin-bottom:24px}
  .conf{display:inline-block;padding:8px 16px;background:#F6BE00;color:#000;border-radius:8px;font-weight:bold;font-size:18px;letter-spacing:.04em;margin-bottom:18px}
  .grid{display:grid;grid-template-columns:1fr 1fr;gap:14px;margin-bottom:18px;border:1px solid #eee;padding:14px;border-radius:8px}
  .label{font-size:11px;color:#888;text-transform:uppercase;letter-spacing:.06em;margin-bottom:3px}
  .val{font-size:14px;font-weight:600}
  .section{border-top:1px solid #eee;padding-top:14px;margin-top:14px}
  .section h3{font-size:12px;text-transform:uppercase;color:#888;margin:0 0 8px;letter-spacing:.06em}
  ul{margin:0;padding-left:20px}li{margin-bottom:4px;font-size:14px}
  .total{font-size:24px;font-weight:bold;text-align:right;margin-top:14px;padding-top:14px;border-top:2px solid #000}
  .signbox{margin-top:30px;display:flex;gap:30px}
  .sigline{flex:1;border-top:1px solid #000;padding-top:6px;font-size:11px;color:#888}
  @media print { body{margin:0} .noprint{display:none} }
</style>
</head><body>
  <h1>NICK Automotive Films</h1>
  <div class="brand">Work Order · nick.sa · +966 54 300 0055</div>
  <div class="conf">${b.confirmation_number || b.id.slice(0, 8).toUpperCase()}</div>
  <div class="grid">
    <div><div class="label">Customer</div><div class="val">${b.customer_name}</div></div>
    <div><div class="label">Phone</div><div class="val">${b.customer_phone}</div></div>
    <div><div class="label">Vehicle</div><div class="val">${b.car_make || "—"}${b.car_year ? " · " + b.car_year : ""}${b.car_color ? " · " + b.car_color : ""}</div></div>
    <div><div class="label">Size</div><div class="val" style="text-transform:capitalize">${b.car_size}</div></div>
    <div><div class="label">Preferred Date</div><div class="val">${pref.date}${pref.time ? " · " + pref.time : ""}</div></div>
    <div><div class="label">Payment</div><div class="val">${PAYMENT_LABELS[b.payment_method] || b.payment_method}</div></div>
  </div>
  ${pkgName ? `<div class="section"><h3>Package</h3>${pkgName}</div>` : ""}
  ${svcList.length ? `<div class="section"><h3>Services (${svcList.length})</h3><ul>${svcList.map(s => `<li>${s}</li>`).join("")}</ul></div>` : ""}
  ${addonsBlock ? `<div class="section"><h3>Add-ons</h3>${addonsBlock}</div>` : ""}
  ${b.customer_notes ? `<div class="section"><h3>Customer Notes</h3>${b.customer_notes}</div>` : ""}
  <div class="section"><h3>Pricing</h3>
    <div>Subtotal: ${(b.subtotal || 0).toLocaleString()} SAR</div>
    ${b.discount > 0 ? `<div>Discount: -${(b.discount).toLocaleString()} SAR</div>` : ""}
    <div class="total">Total: ${(b.total || 0).toLocaleString()} SAR</div>
  </div>
  <div class="signbox">
    <div class="sigline">Customer Signature</div>
    <div class="sigline">Technician</div>
  </div>
  <script>window.onload=function(){window.print();}</script>
</body></html>`;
    const w = window.open("", "_blank", "width=800,height=900");
    if (w) {
      w.document.open();
      w.document.write(html);
      w.document.close();
    }
    setTimeout(() => setPrintingId(null), 1000);
  }

  function toggleSelect(id: string) {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  function toggleSelectAll(ids: string[]) {
    setSelected(prev => {
      const allSelected = ids.every(id => prev.has(id));
      const next = new Set(prev);
      if (allSelected) ids.forEach(id => next.delete(id));
      else ids.forEach(id => next.add(id));
      return next;
    });
  }

  async function bulkStatus(status: string) {
    if (selected.size === 0 || bulkBusy) return;
    setBulkBusy(true);
    const ids = Array.from(selected);
    await Promise.all(ids.map(id =>
      fetch("/api/bookings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      }).catch(() => null)
    ));
    setBookings(prev => prev.map(b => selected.has(b.id) ? { ...b, status } : b));
    setSelected(new Set());
    setBulkBusy(false);
  }

  async function bulkDelete() {
    if (selected.size === 0 || bulkBusy) return;
    if (!confirm(`Delete ${selected.size} booking${selected.size > 1 ? "s" : ""} permanently?`)) return;
    setBulkBusy(true);
    const ids = Array.from(selected);
    await Promise.all(ids.map(id =>
      fetch("/api/bookings", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      }).catch(() => null)
    ));
    setBookings(prev => prev.filter(b => !selected.has(b.id)));
    setSelected(new Set());
    setBulkBusy(false);
  }

  function exportCSV() {
    const escapeCSV = (val: string) => {
      if (val.includes(",") || val.includes('"') || val.includes("\n")) {
        return `"${val.replace(/"/g, '""')}"`;
      }
      return val;
    };
    const headers = [
      "Confirmation#", "Booking ID", "Customer Name", "Phone", "Car Make/Model", "Year", "Color",
      "Car Size", "Status", "Preferred Date",
      "Package", "Services", "Subtotal", "Discount", "Total",
      "Payment Method", "Locale", "Created", "Updated",
    ];
    const rows = sorted.map((b) => [
      b.confirmation_number || "",
      b.id,
      b.customer_name,
      b.customer_phone,
      b.car_make || "",
      b.car_year || "",
      b.car_color || "",
      b.car_size,
      b.status.replace("_", " "),
      b.preferred_date || "",
      b.package_id ? getPackageName(b.package_id) : "",
      (b.service_ids || []).map((sid) => getServiceName(sid)).join("; "),
      String(b.subtotal || 0),
      String(b.discount || 0),
      String(b.total || 0),
      b.payment_method,
      b.locale || "",
      new Date(b.created_at).toISOString(),
      new Date(b.updated_at).toISOString(),
    ]);
    const csv = [headers, ...rows].map((row) => row.map(escapeCSV).join(",")).join("\n");
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const today = new Date().toISOString().slice(0, 10);
    a.href = url;
    a.download = `nick-bookings-${today}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  /* ── Loading skeleton ── */
  if (loading) {
    return (
      <div style={{ position: "relative", zIndex: 1 }}>
        <div className="admin-skeleton" style={{ height: 28, width: 140, borderRadius: 8, marginBottom: 28 }} />
        <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="admin-skeleton" style={{ height: 32, width: 80, borderRadius: 100 }} />
          ))}
        </div>
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="admin-skeleton" style={{ height: 64, borderRadius: 12, marginBottom: 8 }} />
        ))}
      </div>
    );
  }

  /* ── Expanded detail panel ── */
  function ExpandedDetails({ b }: { b: Booking }) {
    const sectionLabel: React.CSSProperties = {
      fontSize: 11,
      fontWeight: 600,
      color: "rgba(255,255,255,0.3)",
      letterSpacing: "0.06em",
      textTransform: "uppercase",
      marginBottom: 8,
    };
    const serviceTag: React.CSSProperties = {
      padding: "4px 10px",
      borderRadius: 6,
      fontSize: 12,
      background: "rgba(255,255,255,0.04)",
      color: "rgba(255,255,255,0.55)",
    };

    return (
      <div style={{ padding: "16px 20px", borderTop: "1px solid rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.01)" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 20, marginBottom: 16 }}>
          {/* Services */}
          <div>
            <div style={sectionLabel}>Services</div>
            {b.service_ids?.length > 0 ? (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {b.service_ids.map((sid) => (
                  <span key={sid} style={serviceTag}>{getServiceName(sid)}</span>
                ))}
              </div>
            ) : (
              <span style={{ fontSize: 13, color: "rgba(255,255,255,0.3)" }}>None</span>
            )}
          </div>

          {/* Package */}
          <div>
            <div style={sectionLabel}>Package</div>
            <span style={{ fontSize: 13, color: b.package_id ? "#f5f5f5" : "rgba(255,255,255,0.3)" }}>
              {b.package_id ? getPackageName(b.package_id) : "None"}
            </span>
          </div>

          {/* Car Details */}
          <div>
            <div style={sectionLabel}>Car Details</div>
            <div style={{ fontSize: 13, color: "rgba(255,255,255,0.55)" }}>
              {b.car_make || "—"}
              {b.car_year && <span> · {b.car_year}</span>}
              {b.car_color && <span> · {b.car_color}</span>}
            </div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", marginTop: 4, textTransform: "capitalize" }}>Size: {b.car_size}</div>
          </div>

          {/* Preferred date+time */}
          {b.preferred_date && (() => {
            const p = formatPreferred(b.preferred_date);
            return (
              <div>
                <div style={sectionLabel}>Preferred Slot</div>
                <div style={{ fontSize: 13, color: "#F6BE00", fontWeight: 600 }}>{p.date}</div>
                {p.time && <div style={{ fontSize: 12, color: "#F6BE00", marginTop: 2 }}>{p.time}</div>}
              </div>
            );
          })()}

          {/* Addons */}
          <div>
            <div style={sectionLabel}>Add-ons</div>
            <div style={{ fontSize: 13, color: "rgba(255,255,255,0.55)" }}>
              {(() => {
                const raw = b.addon_ids;
                const parsed: Record<string, unknown> | null = typeof raw === "string" ? (() => { try { return JSON.parse(raw); } catch { return null; } })() : raw;
                if (!parsed || typeof parsed !== "object" || Object.keys(parsed).length === 0) return "None";
                return Object.entries(parsed).map(([svcId, addonIds]) => (
                  <div key={svcId} style={{ marginBottom: 4 }}>
                    <span style={{ color: "#F6BE00", fontSize: 11 }}>{SERVICE_NAMES[svcId] || svcId}:</span>{" "}
                    {Array.isArray(addonIds) ? addonIds.map(a => ADDON_NAMES[a as string] || a).join(", ") : String(addonIds)}
                  </div>
                ));
              })()}
            </div>
          </div>

          {/* Pricing */}
          <div>
            <div style={sectionLabel}>Pricing</div>
            <div style={{ fontSize: 13, color: "rgba(255,255,255,0.55)" }}>Subtotal: {(b.subtotal || 0).toLocaleString()} SAR</div>
            {b.discount > 0 && (
              <div style={{ fontSize: 13, color: "#34D399" }}>Discount: -{(b.discount || 0).toLocaleString()} SAR</div>
            )}
            <div style={{ fontSize: 13, fontWeight: 700, color: "#f5f5f5", marginTop: 4 }}>Total: {(b.total || 0).toLocaleString()} SAR</div>
          </div>

          {/* Notes */}
          <div>
            <div style={sectionLabel}>Notes</div>
            <span style={{ fontSize: 13, color: b.customer_notes ? "rgba(255,255,255,0.55)" : "rgba(255,255,255,0.3)" }}>
              {b.customer_notes || "None"}
            </span>
          </div>

          {/* Payment */}
          <div>
            <div style={sectionLabel}>Payment</div>
            <span style={{ fontSize: 13, color: "rgba(255,255,255,0.55)" }}>{PAYMENT_LABELS[b.payment_method] || b.payment_method}</span>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", marginTop: 4 }}>Locale: {b.locale?.toUpperCase() || "—"}</div>
          </div>

          {/* Confirmation + Booking ID */}
          <div>
            <div style={sectionLabel}>Reference</div>
            {b.confirmation_number && (
              <div
                onClick={() => navigator.clipboard?.writeText(b.confirmation_number!)}
                title="Click to copy"
                style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 13, color: "#F6BE00", fontWeight: 700, letterSpacing: "0.04em", cursor: "copy", marginBottom: 4 }}
              >
                {b.confirmation_number}
              </div>
            )}
            <div
              onClick={() => navigator.clipboard?.writeText(b.id)}
              title="Click to copy full booking ID"
              style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", fontFamily: "monospace", cursor: "copy" }}
            >
              {b.id.slice(0, 8)}…{b.id.slice(-4)}
            </div>
          </div>

          {/* Timestamps */}
          <div>
            <div style={sectionLabel}>Timestamps</div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)" }}>
              Created: <span style={{ color: "rgba(255,255,255,0.7)" }}>{formatDate(b.created_at)}</span>
            </div>
            {b.updated_at && b.updated_at !== b.created_at && (
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", marginTop: 2 }}>
                Updated: <span style={{ color: "rgba(255,255,255,0.7)" }}>{formatDate(b.updated_at)}</span>
              </div>
            )}
          </div>
        </div>

        {/* WhatsApp templates row */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", paddingTop: 14, borderTop: "1px solid rgba(255,255,255,0.06)", marginBottom: 10 }}>
          <span style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>Send WhatsApp:</span>
          {([
            { key: "confirm" as const, label: "✓ Confirmation", color: "#34D399" },
            { key: "remind" as const, label: "⏰ Reminder", color: "#FBBF24" },
            { key: "ready" as const, label: "🚗 Ready to pickup", color: "#60A5FA" },
          ]).map(tpl => (
            <a
              key={tpl.key}
              href={buildWhatsAppLink(b, tpl.key)}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: "inline-flex", alignItems: "center", gap: 6,
                padding: "6px 12px", borderRadius: 8,
                background: `${tpl.color}15`, border: `1px solid ${tpl.color}40`,
                color: tpl.color, fontSize: 12, fontWeight: 600, textDecoration: "none",
              }}
            >
              {tpl.label}
            </a>
          ))}
          <button
            onClick={() => printWorkOrder(b)}
            disabled={printingId === b.id}
            style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              padding: "6px 12px", borderRadius: 8,
              background: "rgba(246,190,0,0.1)", border: "1px solid rgba(246,190,0,0.3)",
              color: "#F6BE00", fontSize: 12, fontWeight: 600, cursor: "pointer",
              opacity: printingId === b.id ? 0.5 : 1,
            }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
            Print Work Order
          </button>
          <button
            onClick={() => setProfilePhone(b.customer_phone)}
            style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              padding: "6px 12px", borderRadius: 8,
              background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)",
              color: "rgba(255,255,255,0.7)", fontSize: 12, fontWeight: 600, cursor: "pointer",
            }}
          >
            👤 Customer profile
          </button>
        </div>

        {/* Actions */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          <a
            href={`tel:${b.customer_phone}`}
            style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              padding: "8px 16px",
              background: "rgba(59,130,246,0.08)",
              border: "1px solid rgba(59,130,246,0.25)",
              borderRadius: 8,
              color: "#60A5FA",
              fontSize: 13, fontWeight: 500,
              textDecoration: "none",
            }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
            </svg>
            Call
          </a>
          <a
            href={`https://wa.me/${b.customer_phone.replace(/[^0-9]/g, "")}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              padding: "8px 16px",
              background: "rgba(16,185,129,0.08)",
              border: "1px solid rgba(16,185,129,0.25)",
              borderRadius: 8,
              color: "#34D399",
              fontSize: 13, fontWeight: 500,
              textDecoration: "none",
            }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
            WhatsApp
          </a>

          <div style={{ flex: 1 }} />

          <label style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>Status:</label>
          <select
            value={b.status}
            disabled={updatingId === b.id}
            onChange={(e) => updateStatus(b.id, e.target.value)}
            style={{
              padding: "7px 12px",
              background: "#0a0a0a",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 8,
              color: "#f5f5f5",
              fontSize: 13,
              outline: "none",
              cursor: "pointer",
            }}
          >
            {STATUSES.filter((s) => s !== "all").map((s) => (
              <option key={s} value={s} style={{ background: "#0a0a0a", color: "#f5f5f5" }}>{s.replace("_", " ")}</option>
            ))}
          </select>
          {updatingId === b.id && (
            <span style={{ fontSize: 12, color: "rgba(255,255,255,0.3)" }}>Saving...</span>
          )}

          <button
            onClick={() => deleteBooking(b.id)}
            disabled={deletingId === b.id}
            style={{
              display: "inline-flex", alignItems: "center", gap: 6,
              padding: "7px 14px",
              background: "rgba(239,68,68,0.08)",
              border: "1px solid rgba(239,68,68,0.2)",
              borderRadius: 8,
              color: "#FCA5A5",
              fontSize: 12, fontWeight: 500,
              cursor: deletingId === b.id ? "not-allowed" : "pointer",
              opacity: deletingId === b.id ? 0.5 : 1,
              transition: "all 0.2s",
            }}
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
            </svg>
            {deletingId === b.id ? "..." : "Delete"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <style>{`
        .admin-booking-table { display: block; }
        .admin-booking-cards { display: none; }
        @media (max-width: 767px) {
          .admin-booking-table { display: none !important; }
          .admin-booking-cards { display: block !important; }
        }
        .booking-row:hover td { background: rgba(255,255,255,0.02); }
      `}</style>

      <div style={{ position: "relative", zIndex: 1 }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, gap: 16, flexWrap: "wrap" }}>
          <div>
            <div style={{ fontSize: 22, fontWeight: 800, color: "#f5f5f5" }}>Bookings</div>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", marginTop: 4, display: "inline-flex", alignItems: "center", gap: 8 }}>
              <span style={{ display: "inline-block", width: 6, height: 6, borderRadius: "50%", background: autoRefresh ? "#34D399" : "rgba(255,255,255,0.2)", animation: autoRefresh ? "pulse 2s infinite" : undefined }} />
              <span>Updated {formatRelativeTime(lastRefreshed)}</span>
              <button
                onClick={() => fetchBookings(true)}
                title="Refresh now"
                style={{ background: "transparent", border: "none", color: "#F6BE00", cursor: "pointer", fontSize: 11, padding: 0 }}
              >
                ↻ refresh
              </button>
              <button
                onClick={() => setAutoRefresh(a => !a)}
                style={{ background: "transparent", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.4)", cursor: "pointer", fontSize: 10, padding: "2px 8px", borderRadius: 6 }}
              >
                Auto: {autoRefresh ? "on" : "off"}
              </button>
            </div>
          </div>
          <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
            {/* View toggle */}
            <div style={{ display: "inline-flex", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, overflow: "hidden" }}>
              {(["table", "cards"] as ViewMode[]).map(v => (
                <button
                  key={v}
                  onClick={() => setViewMode(v)}
                  title={v === "table" ? "Table view" : "Card view"}
                  style={{
                    padding: "8px 12px",
                    background: viewMode === v ? "rgba(246,190,0,0.12)" : "transparent",
                    color: viewMode === v ? "#F6BE00" : "rgba(255,255,255,0.5)",
                    border: "none", cursor: "pointer", fontSize: 12, fontWeight: 600,
                    display: "inline-flex", alignItems: "center", gap: 6,
                  }}
                >
                  {v === "table" ? (
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
                  ) : (
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>
                  )}
                  {v === "table" ? "Table" : "Cards"}
                </button>
              ))}
            </div>
            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortKey)}
              style={{
                padding: "8px 12px", background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10,
                color: "#f5f5f5", fontSize: 12, fontWeight: 600, cursor: "pointer",
              }}
            >
              <option value="preferred-soonest" style={{ background: "#0a0a0a", color: "#f5f5f5" }}>Soonest preferred date</option>
              <option value="newest" style={{ background: "#0a0a0a", color: "#f5f5f5" }}>Newest created</option>
              <option value="oldest" style={{ background: "#0a0a0a", color: "#f5f5f5" }}>Oldest created</option>
              <option value="total-desc" style={{ background: "#0a0a0a", color: "#f5f5f5" }}>Highest revenue</option>
              <option value="total-asc" style={{ background: "#0a0a0a", color: "#f5f5f5" }}>Lowest revenue</option>
            </select>
            <button
              onClick={exportCSV}
              style={{
                display: "inline-flex", alignItems: "center", gap: 8,
                padding: "8px 18px",
                background: "transparent",
                color: "#f5f5f5",
                border: "1px solid rgba(255,255,255,0.15)",
                borderRadius: 10, fontSize: 12, fontWeight: 600,
                cursor: "pointer", transition: "all 0.2s",
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(246,190,0,0.5)"; e.currentTarget.style.color = "#F6BE00"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.15)"; e.currentTarget.style.color = "#f5f5f5"; }}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              CSV
            </button>
          </div>
        </div>

        {/* Summary cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 12, marginBottom: 24 }}>
          {[
            { label: "Today", count: summaryStats.todayCount, sub: `${summaryStats.todayRevenue.toLocaleString()} SAR`, color: "#F6BE00" },
            { label: "Tomorrow", count: summaryStats.tomorrowCount, sub: `${summaryStats.tomorrowRevenue.toLocaleString()} SAR`, color: "#60A5FA" },
            { label: "Pending", count: summaryStats.pendingCount, sub: "awaiting confirm", color: "#FBBF24" },
            { label: "Total Revenue", count: summaryStats.totalRevenue.toLocaleString(), sub: "SAR (excl. cancelled)", color: "#34D399" },
          ].map(card => (
            <div
              key={card.label}
              style={{
                background: "#111", border: "1px solid rgba(255,255,255,0.06)",
                borderLeft: `3px solid ${card.color}`,
                borderRadius: 12, padding: "14px 16px",
              }}
            >
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>{card.label}</div>
              <div style={{ fontSize: 22, fontWeight: 700, color: "#f5f5f5", marginTop: 4, fontFamily: "'Space Grotesk', sans-serif" }}>{card.count}</div>
              <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", marginTop: 2 }}>{card.sub}</div>
            </div>
          ))}
        </div>

        {/* Saved view presets */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 14 }}>
          <span style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", alignSelf: "center", marginRight: 4, fontWeight: 600 }}>QUICK VIEWS:</span>
          {[
            { key: "todayOnly", label: "📅 Today only" },
            { key: "weekPending", label: "⏳ Pending (soonest)" },
            { key: "completedRecent", label: "✓ Completed today+" },
            { key: "reset", label: "↻ Reset" },
          ].map(p => (
            <button
              key={p.key}
              onClick={() => applyPreset(p.key as Parameters<typeof applyPreset>[0])}
              style={{
                padding: "5px 11px", borderRadius: 100, fontSize: 11, fontWeight: 600,
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
                color: "rgba(255,255,255,0.65)", cursor: "pointer",
              }}
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* Status filter badges */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 20 }}>
          {STATUSES.map((s) => {
            const active = filter === s;
            const count = s === "all" ? bookings.length : bookings.filter((b) => b.status === s).length;
            const colors: Record<string, [string, string]> = {
              all: ["rgba(255,255,255,0.08)", "#f5f5f5"],
              pending: ["rgba(246,190,0,0.15)", "#FBBF24"],
              confirmed: ["rgba(59,130,246,0.15)", "#60A5FA"],
              in_progress: ["rgba(245,158,11,0.15)", "#FBBF24"],
              completed: ["rgba(16,185,129,0.15)", "#34D399"],
              cancelled: ["rgba(239,68,68,0.15)", "#FCA5A5"],
            };
            const [bg, color] = active ? (colors[s] || colors.all) : ["transparent", "rgba(255,255,255,0.3)"];
            return (
              <button
                key={s}
                onClick={() => setFilter(s)}
                style={{
                  display: "inline-flex",
                  padding: "5px 12px",
                  borderRadius: 100,
                  fontSize: 11, fontWeight: 700,
                  textTransform: "capitalize",
                  background: bg, color,
                  border: active ? "none" : "1px solid rgba(255,255,255,0.06)",
                  cursor: "pointer", transition: "all 0.2s",
                }}
              >
                {s.replace("_", " ")} ({count})
              </button>
            );
          })}
        </div>

        {/* Search + date filters */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 24, alignItems: "center" }}>
          <div style={{
            display: "flex", alignItems: "center", gap: 8,
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.06)",
            borderRadius: 8, padding: "8px 14px", minWidth: 220,
          }}>
            <span style={{ color: "rgba(255,255,255,0.3)", fontSize: 14 }}>🔍</span>
            <input
              type="text"
              placeholder="Search by name, phone, confirmation #, car..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                background: "transparent", border: "none", outline: "none",
                color: "#f5f5f5", fontSize: 13, width: "100%",
              }}
            />
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <label style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", whiteSpace: "nowrap" }}>From</label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              style={{
                padding: "8px 12px",
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.06)",
                borderRadius: 8,
                color: "#f5f5f5", fontSize: 13,
                outline: "none",
                colorScheme: "dark",
              } as React.CSSProperties}
            />
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <label style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", whiteSpace: "nowrap" }}>To</label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              style={{
                padding: "8px 12px",
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.06)",
                borderRadius: 8,
                color: "#f5f5f5", fontSize: 13,
                outline: "none",
                colorScheme: "dark",
              } as React.CSSProperties}
            />
          </div>
          {(dateFrom || dateTo) && (
            <button
              onClick={() => { setDateFrom(""); setDateTo(""); }}
              style={{
                padding: "8px 12px",
                background: "transparent",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 8,
                color: "rgba(255,255,255,0.4)",
                fontSize: 12, cursor: "pointer",
                transition: "all 0.2s",
              }}
            >
              Clear dates
            </button>
          )}
        </div>

        {/* Bulk action bar */}
        {selected.size > 0 && (
          <div style={{
            display: "flex", flexWrap: "wrap", alignItems: "center", gap: 10,
            padding: "10px 14px", marginBottom: 14,
            background: "rgba(246,190,0,0.08)",
            border: "1px solid rgba(246,190,0,0.25)",
            borderRadius: 12,
          }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: "#F6BE00" }}>
              {selected.size} selected
            </span>
            <div style={{ flex: 1 }} />
            <select
              disabled={bulkBusy}
              defaultValue=""
              onChange={(e) => { if (e.target.value) { bulkStatus(e.target.value); e.target.value = ""; } }}
              style={{
                padding: "7px 12px", background: "#0a0a0a",
                border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8,
                color: "#f5f5f5", fontSize: 13, cursor: "pointer",
              }}
            >
              <option value="" disabled style={{ background: "#0a0a0a", color: "#888" }}>Set status…</option>
              {STATUSES.filter(s => s !== "all").map(s => (
                <option key={s} value={s} style={{ background: "#0a0a0a", color: "#f5f5f5" }}>{s.replace("_", " ")}</option>
              ))}
            </select>
            <button
              onClick={bulkDelete}
              disabled={bulkBusy}
              style={{
                padding: "7px 14px",
                background: "rgba(239,68,68,0.1)",
                border: "1px solid rgba(239,68,68,0.25)",
                borderRadius: 8, color: "#FCA5A5",
                fontSize: 12, fontWeight: 600, cursor: bulkBusy ? "not-allowed" : "pointer",
                opacity: bulkBusy ? 0.5 : 1,
              }}
            >
              Delete
            </button>
            <button
              onClick={() => setSelected(new Set())}
              disabled={bulkBusy}
              style={{
                padding: "7px 12px", background: "transparent",
                border: "1px solid rgba(255,255,255,0.12)", borderRadius: 8,
                color: "rgba(255,255,255,0.5)", fontSize: 12, cursor: "pointer",
              }}
            >
              Clear
            </button>
          </div>
        )}

        {/* Empty state */}
        {sorted.length === 0 ? (
          <div style={{ background: "#111111", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 16, padding: "60px 20px", textAlign: "center" }}>
            <div style={{ fontSize: 40, marginBottom: 12, opacity: 0.15 }}>📋</div>
            <p style={{ fontSize: 14, color: "rgba(255,255,255,0.3)", margin: 0 }}>No bookings found</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
            {groups.map(group => {
              const collapsed = collapsedBuckets.has(group.key);
              const sectionRevenue = group.items.filter(b => b.status !== "cancelled").reduce((s, b) => s + (b.total || 0), 0);
              const accentColor = group.key === "today" ? "#F6BE00"
                : group.key === "overdue" ? "#FCA5A5"
                : group.key === "tomorrow" ? "#60A5FA"
                : "rgba(255,255,255,0.3)";
              // Capacity warning for today/tomorrow
              const activeCount = group.items.filter(b => b.status !== "cancelled").length;
              const overCapacity = (group.key === "today" || group.key === "tomorrow") && activeCount > DAILY_CAPACITY;
              const nearCapacity = (group.key === "today" || group.key === "tomorrow") && activeCount === DAILY_CAPACITY;
              return (
                <section key={group.key}>
                  {/* Group header */}
                  <button
                    onClick={() => toggleBucket(group.key)}
                    style={{
                      display: "flex", alignItems: "center", gap: 10, width: "100%",
                      padding: "10px 14px", marginBottom: 8,
                      background: overCapacity ? "rgba(244,67,54,0.06)" : "rgba(255,255,255,0.02)",
                      border: `1px solid ${overCapacity ? "rgba(244,67,54,0.3)" : "rgba(255,255,255,0.06)"}`,
                      borderLeft: `3px solid ${accentColor}`,
                      borderRadius: 10, cursor: "pointer",
                      color: "#f5f5f5", fontSize: 13, fontWeight: 700, textAlign: "left",
                    }}
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ transform: collapsed ? "rotate(-90deg)" : "rotate(0)", transition: "transform 0.15s" }}>
                      <polyline points="6 9 12 15 18 9"/>
                    </svg>
                    <span>{group.label}</span>
                    <span style={{ color: "rgba(255,255,255,0.4)", fontWeight: 500, fontSize: 12 }}>
                      ({group.items.length} · {sectionRevenue.toLocaleString()} SAR)
                    </span>
                    {(group.key === "today" || group.key === "tomorrow") && (
                      <span style={{
                        marginLeft: "auto",
                        padding: "3px 9px", borderRadius: 100, fontSize: 10, fontWeight: 700,
                        background: overCapacity ? "rgba(244,67,54,0.15)" : nearCapacity ? "rgba(246,190,0,0.15)" : "rgba(52,211,153,0.12)",
                        color: overCapacity ? "#FCA5A5" : nearCapacity ? "#FBBF24" : "#34D399",
                        textTransform: "uppercase", letterSpacing: "0.05em",
                      }}>
                        {overCapacity ? `OVER CAPACITY · ${activeCount}/${DAILY_CAPACITY}` : nearCapacity ? `FULL · ${activeCount}/${DAILY_CAPACITY}` : `${activeCount}/${DAILY_CAPACITY} slots`}
                      </span>
                    )}
                  </button>

                  {!collapsed && (viewMode === "table" ? (
                    <BookingTable
                      items={group.items}
                      selected={selected}
                      expandedId={expandedId}
                      onToggleSelect={toggleSelect}
                      onToggleSelectAll={toggleSelectAll}
                      onToggleExpand={(id) => setExpandedId(expandedId === id ? null : id)}
                      onUpdateStatus={updateStatus}
                      updatingId={updatingId}
                      ExpandedDetails={ExpandedDetails}
                    />
                  ) : (
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 10 }}>
                      {group.items.map(b => (
                        <BookingCard
                          key={b.id}
                          b={b}
                          selected={selected.has(b.id)}
                          expanded={expandedId === b.id}
                          onToggleSelect={() => toggleSelect(b.id)}
                          onToggleExpand={() => setExpandedId(expandedId === b.id ? null : b.id)}
                          onUpdateStatus={updateStatus}
                          updating={updatingId === b.id}
                          ExpandedDetails={ExpandedDetails}
                        />
                      ))}
                    </div>
                  ))}
                </section>
              );
            })}
          </div>
        )}
      </div>

      {/* Customer profile modal */}
      {profileData && (
        <div
          onClick={() => setProfilePhone(null)}
          style={{
            position: "fixed", inset: 0, zIndex: 100,
            background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)",
            display: "flex", alignItems: "center", justifyContent: "center",
            padding: 16,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "#0a0a0a", border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 16, maxWidth: 600, width: "100%",
              maxHeight: "85vh", overflowY: "auto",
              padding: 24,
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
              <div>
                <div style={{ display: "inline-flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                  <h2 style={{ fontSize: 18, fontWeight: 700, color: "#f5f5f5", margin: 0 }}>{profileData.name}</h2>
                  {profileData.isReturning && (
                    <span style={{ padding: "3px 9px", borderRadius: 100, background: "rgba(246,190,0,0.15)", color: "#F6BE00", fontSize: 10, fontWeight: 700, textTransform: "uppercase" }}>Returning</span>
                  )}
                </div>
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)" }}>{profileData.phone}</div>
              </div>
              <button
                onClick={() => setProfilePhone(null)}
                style={{ background: "transparent", border: "none", color: "rgba(255,255,255,0.5)", fontSize: 22, cursor: "pointer" }}
              >
                ×
              </button>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, marginBottom: 20 }}>
              <div style={{ background: "rgba(255,255,255,0.04)", padding: "10px 12px", borderRadius: 10 }}>
                <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.06em" }}>Bookings</div>
                <div style={{ fontSize: 20, fontWeight: 700, color: "#f5f5f5", marginTop: 2 }}>{profileData.bookings.length}</div>
              </div>
              <div style={{ background: "rgba(255,255,255,0.04)", padding: "10px 12px", borderRadius: 10 }}>
                <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.06em" }}>Lifetime</div>
                <div style={{ fontSize: 20, fontWeight: 700, color: "#34D399", marginTop: 2 }}>{profileData.totalSpent.toLocaleString()}</div>
                <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)" }}>SAR</div>
              </div>
              <div style={{ background: "rgba(255,255,255,0.04)", padding: "10px 12px", borderRadius: 10 }}>
                <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.06em" }}>First Visit</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#f5f5f5", marginTop: 4 }}>
                  {profileData.firstBooking ? new Date(profileData.firstBooking).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" }) : "—"}
                </div>
              </div>
            </div>

            <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
              <a
                href={`tel:${profileData.phone}`}
                style={{ flex: 1, textAlign: "center", padding: "10px", background: "rgba(59,130,246,0.1)", border: "1px solid rgba(59,130,246,0.25)", borderRadius: 10, color: "#60A5FA", fontSize: 13, fontWeight: 600, textDecoration: "none" }}
              >
                📞 Call
              </a>
              <a
                href={`https://wa.me/${profileData.phone.replace(/[^0-9]/g, "")}`}
                target="_blank" rel="noopener noreferrer"
                style={{ flex: 1, textAlign: "center", padding: "10px", background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.25)", borderRadius: 10, color: "#34D399", fontSize: 13, fontWeight: 600, textDecoration: "none" }}
              >
                💬 WhatsApp
              </a>
            </div>

            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8, fontWeight: 600 }}>Booking History</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {profileData.bookings.map(bk => {
                const p = formatPreferred(bk.preferred_date);
                const stripe = STATUS_STRIPE[bk.status] || "#9CA3AF";
                return (
                  <div
                    key={bk.id}
                    style={{
                      background: "rgba(255,255,255,0.03)",
                      border: "1px solid rgba(255,255,255,0.06)",
                      borderLeft: `3px solid ${stripe}`,
                      borderRadius: 10, padding: "10px 14px",
                      display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, flexWrap: "wrap",
                    }}
                  >
                    <div>
                      <div style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                        {bk.confirmation_number && (
                          <span style={{ fontFamily: "'Space Grotesk', sans-serif", color: "#F6BE00", fontWeight: 700, fontSize: 11, letterSpacing: "0.04em" }}>{bk.confirmation_number}</span>
                        )}
                        <span style={badgeStyle(bk.status)}>{bk.status.replace("_", " ")}</span>
                      </div>
                      <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", marginTop: 4 }}>
                        {p.date}{p.time ? ` · ${p.time}` : ""} · {bk.car_make || bk.car_size}
                      </div>
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "#f5f5f5" }}>{(bk.total || 0).toLocaleString()} SAR</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes pulse { 0%,100% { opacity: 1 } 50% { opacity: 0.4 } }
      `}</style>
    </>
  );
}
