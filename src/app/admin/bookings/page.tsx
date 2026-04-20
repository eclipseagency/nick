"use client";

import React, { useEffect, useState, useCallback } from "react";

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

  const fetchBookings = useCallback(() => {
    fetch("/api/bookings")
      .then((r) => r.json())
      .then((d) => {
        if (Array.isArray(d)) setBookings(d);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
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

  const filtered = bookings.filter((b) => {
    if (filter !== "all" && b.status !== filter) return false;
    if (search) {
      const q = search.toLowerCase();
      if (
        !b.customer_name.toLowerCase().includes(q) &&
        !b.customer_phone.includes(q)
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
  });

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
      "Confirmation#", "Customer Name", "Phone", "Car Make/Model", "Year", "Color",
      "Car Size", "Status", "Preferred Date",
      "Package", "Services", "Subtotal", "Discount", "Total",
      "Payment Method", "Date",
    ];
    const rows = filtered.map((b) => [
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
      new Date(b.created_at).toISOString().slice(0, 10),
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
            {b.preferred_date && (
              <div style={{ fontSize: 12, color: "#F6BE00", marginTop: 4 }}>
                Preferred: {new Date(b.preferred_date + "T00:00:00").toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
              </div>
            )}
          </div>

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
            <span style={{ fontSize: 13, color: "rgba(255,255,255,0.55)", textTransform: "capitalize" }}>{b.payment_method}</span>
            <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", marginTop: 4 }}>Locale: {b.locale?.toUpperCase()}</div>
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", paddingTop: 14, borderTop: "1px solid rgba(255,255,255,0.06)" }}>
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
              <option key={s} value={s}>{s.replace("_", " ")}</option>
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
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28, gap: 16, flexWrap: "wrap" }}>
          <div style={{ fontSize: 22, fontWeight: 800, color: "#f5f5f5" }}>Bookings</div>
          <button
            onClick={exportCSV}
            style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              padding: "10px 24px",
              background: "transparent",
              color: "#f5f5f5",
              border: "1.5px solid rgba(255,255,255,0.15)",
              borderRadius: 10, fontSize: 13, fontWeight: 600,
              cursor: "pointer", transition: "all 0.2s",
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(246,190,0,0.5)"; e.currentTarget.style.color = "#F6BE00"; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.15)"; e.currentTarget.style.color = "#f5f5f5"; }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Export CSV
          </button>
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
              placeholder="Search by name or phone..."
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
              <option value="" disabled>Set status…</option>
              {STATUSES.filter(s => s !== "all").map(s => (
                <option key={s} value={s}>{s.replace("_", " ")}</option>
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
        {filtered.length === 0 ? (
          <div style={{ background: "#111111", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 16, padding: "60px 20px", textAlign: "center" }}>
            <div style={{ fontSize: 40, marginBottom: 12, opacity: 0.15 }}>📋</div>
            <p style={{ fontSize: 14, color: "rgba(255,255,255,0.3)", margin: 0 }}>No bookings found</p>
          </div>
        ) : (
          <>
            {/* Desktop table */}
            <div className="admin-booking-table" style={{ background: "#111111", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 16, overflow: "hidden" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr>
                    <th style={{ ...thStyle, width: 36, padding: "10px 0 10px 12px" }}>
                      <input
                        type="checkbox"
                        checked={filtered.length > 0 && filtered.every(b => selected.has(b.id))}
                        onChange={() => toggleSelectAll(filtered.map(b => b.id))}
                        style={{ accentColor: "#F6BE00", cursor: "pointer" }}
                        aria-label="Select all"
                      />
                    </th>
                    <th style={thStyle}>Customer</th>
                    <th style={thStyle}>Vehicle</th>
                    <th style={thStyle}>Services</th>
                    <th style={thStyle}>Status</th>
                    <th style={thStyle}>Total</th>
                    <th style={thStyle}>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((b) => {
                    const expanded = expandedId === b.id;
                    return (
                      <React.Fragment key={b.id}>
                        <tr
                          className="booking-row"
                          onClick={() => setExpandedId(expanded ? null : b.id)}
                          style={{ cursor: "pointer", transition: "background 0.15s" }}
                        >
                          <td style={{ ...tdStyle, padding: "12px 0 12px 12px" }} onClick={(e) => { e.stopPropagation(); toggleSelect(b.id); }}>
                            <input
                              type="checkbox"
                              checked={selected.has(b.id)}
                              onChange={() => toggleSelect(b.id)}
                              onClick={(e) => e.stopPropagation()}
                              style={{ accentColor: "#F6BE00", cursor: "pointer" }}
                              aria-label={`Select booking ${b.customer_name}`}
                            />
                          </td>
                          <td style={tdStyle}>
                            <span style={{ color: "#f5f5f5", fontWeight: 600, fontSize: 13 }}>{b.customer_name}</span>
                            <br />
                            <span style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}>{b.customer_phone}</span>
                          </td>
                          <td style={tdStyle}>{b.car_size}</td>
                          <td style={tdStyle}>
                            {b.service_ids?.length || 0} service{(b.service_ids?.length || 0) !== 1 ? "s" : ""}
                          </td>
                          <td style={tdStyle}>
                            <span style={badgeStyle(b.status)}>{b.status.replace("_", " ")}</span>
                          </td>
                          <td style={tdStyle}>
                            <span style={{ fontWeight: 600, color: "#f5f5f5" }}>
                              {(b.total || 0).toLocaleString()} SAR
                            </span>
                          </td>
                          <td style={{ ...tdStyle, whiteSpace: "nowrap" }}>{formatDate(b.created_at)}</td>
                        </tr>
                        {expanded && (
                          <tr>
                            <td colSpan={7} style={{ padding: 0 }}>
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

            {/* Mobile cards */}
            <div className="admin-booking-cards" style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {filtered.map((b) => {
                const expanded = expandedId === b.id;
                return (
                  <div
                    key={b.id}
                    style={{
                      background: "#111111",
                      border: "1px solid rgba(255,255,255,0.06)",
                      borderRadius: 14,
                      overflow: "hidden",
                    }}
                  >
                    <div
                      onClick={() => setExpandedId(expanded ? null : b.id)}
                      style={{
                        display: "flex", alignItems: "center", justifyContent: "space-between",
                        padding: "14px 16px", cursor: "pointer",
                      }}
                    >
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <div style={{ fontSize: 14, fontWeight: 600, color: "#f5f5f5", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          {b.customer_name}
                        </div>
                        <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginTop: 3 }}>
                          {b.customer_phone} · {(b.total || 0).toLocaleString()} SAR
                        </div>
                      </div>
                      <span style={{ ...badgeStyle(b.status), flexShrink: 0, marginLeft: 10 }}>
                        {b.status.replace("_", " ")}
                      </span>
                    </div>
                    {expanded && <ExpandedDetails b={b} />}
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>
    </>
  );
}
