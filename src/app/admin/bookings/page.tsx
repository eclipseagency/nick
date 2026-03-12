"use client";

import { useEffect, useState, useCallback } from "react";

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

const STATUS_COLORS: Record<string, string> = {
  pending: "#F6BE00",
  confirmed: "#2196F3",
  in_progress: "#FF9800",
  completed: "#4CAF50",
  cancelled: "#f44336",
};

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

  if (loading) {
    return (
      <div style={{ color: "rgba(255,255,255,0.4)", padding: 40, textAlign: "center" }}>
        Loading bookings...
      </div>
    );
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: "#fff", margin: 0 }}>
          Bookings
        </h1>
        <button
          onClick={exportCSV}
          style={{
            padding: "8px 18px",
            background: "transparent",
            border: "1px solid rgba(255,255,255,0.15)",
            borderRadius: 8,
            color: "rgba(255,255,255,0.7)",
            fontSize: 13,
            fontWeight: 500,
            cursor: "pointer",
            transition: "all 0.15s",
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = "#F6BE00";
            e.currentTarget.style.color = "#F6BE00";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = "rgba(255,255,255,0.15)";
            e.currentTarget.style.color = "rgba(255,255,255,0.7)";
          }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          Export CSV
        </button>
      </div>

      {/* Filters */}
      <div style={{ marginBottom: 20, display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
        {STATUSES.map((s) => {
          const active = filter === s;
          const count = s === "all" ? bookings.length : bookings.filter((b) => b.status === s).length;
          return (
            <button
              key={s}
              onClick={() => setFilter(s)}
              style={{
                padding: "6px 16px",
                borderRadius: 20,
                border: "1px solid",
                borderColor: active ? "#F6BE00" : "rgba(255,255,255,0.1)",
                background: active ? "rgba(246,190,0,0.1)" : "transparent",
                color: active ? "#F6BE00" : "rgba(255,255,255,0.5)",
                fontSize: 13,
                fontWeight: active ? 600 : 400,
                cursor: "pointer",
                textTransform: "capitalize",
                transition: "all 0.15s",
              }}
            >
              {s.replace("_", " ")} ({count})
            </button>
          );
        })}
      </div>

      {/* Search & Date Filters */}
      <div style={{ marginBottom: 20, display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center" }}>
        <input
          type="text"
          placeholder="Search by name or phone..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            width: "100%",
            maxWidth: 280,
            padding: "10px 14px",
            background: "#111",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: 8,
            color: "#fff",
            fontSize: 14,
            outline: "none",
          }}
        />
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <label style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", whiteSpace: "nowrap" }}>From</label>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            style={{
              padding: "9px 12px",
              background: "#050505",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 8,
              color: "#fff",
              fontSize: 13,
              outline: "none",
              colorScheme: "dark",
            }}
          />
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <label style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", whiteSpace: "nowrap" }}>To</label>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            style={{
              padding: "9px 12px",
              background: "#050505",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 8,
              color: "#fff",
              fontSize: 13,
              outline: "none",
              colorScheme: "dark",
            }}
          />
        </div>
        {(dateFrom || dateTo) && (
          <button
            onClick={() => { setDateFrom(""); setDateTo(""); }}
            style={{
              padding: "8px 12px",
              background: "transparent",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 8,
              color: "rgba(255,255,255,0.4)",
              fontSize: 12,
              cursor: "pointer",
            }}
          >
            Clear dates
          </button>
        )}
      </div>

      {/* Bookings list */}
      {filtered.length === 0 ? (
        <div
          style={{
            background: "#111",
            borderRadius: 14,
            padding: 40,
            textAlign: "center",
            color: "rgba(255,255,255,0.3)",
            fontSize: 14,
          }}
        >
          No bookings found
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {filtered.map((b) => {
            const expanded = expandedId === b.id;
            return (
              <div
                key={b.id}
                style={{
                  background: "#111",
                  border: "1px solid rgba(255,255,255,0.06)",
                  borderRadius: 14,
                  overflow: "hidden",
                }}
              >
                {/* Row */}
                <div
                  onClick={() => setExpandedId(expanded ? null : b.id)}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr auto auto auto auto auto",
                    alignItems: "center",
                    gap: 12,
                    padding: "14px 18px",
                    cursor: "pointer",
                    transition: "background 0.1s",
                  }}
                  className="booking-row"
                >
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: "#fff" }}>
                      {b.customer_name}
                    </div>
                    <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginTop: 2 }}>
                      {b.customer_phone}
                    </div>
                  </div>
                  <div style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", textTransform: "capitalize", whiteSpace: "nowrap" }}>
                    {b.car_size}
                  </div>
                  <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", whiteSpace: "nowrap" }}>
                    {b.service_ids?.length || 0} service{(b.service_ids?.length || 0) !== 1 ? "s" : ""}
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: "#fff", whiteSpace: "nowrap" }}>
                    {(b.total || 0).toLocaleString()} SAR
                  </div>
                  <span
                    style={{
                      display: "inline-block",
                      padding: "3px 10px",
                      borderRadius: 20,
                      fontSize: 11,
                      fontWeight: 600,
                      textTransform: "capitalize",
                      background: `${STATUS_COLORS[b.status] || "#666"}20`,
                      color: STATUS_COLORS[b.status] || "#666",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {b.status.replace("_", " ")}
                  </span>
                  <div style={{ fontSize: 12, color: "rgba(255,255,255,0.35)", whiteSpace: "nowrap" }}>
                    {formatDate(b.created_at)}
                  </div>
                </div>

                {/* Expanded details */}
                {expanded && (
                  <div
                    style={{
                      padding: "0 18px 18px",
                      borderTop: "1px solid rgba(255,255,255,0.06)",
                    }}
                  >
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                        gap: 16,
                        paddingTop: 16,
                      }}
                    >
                      {/* Services */}
                      <div>
                        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>
                          Services
                        </div>
                        {b.service_ids?.length > 0 ? (
                          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                            {b.service_ids.map((sid) => (
                              <span
                                key={sid}
                                style={{
                                  padding: "3px 10px",
                                  background: "rgba(255,255,255,0.05)",
                                  borderRadius: 6,
                                  fontSize: 12,
                                  color: "rgba(255,255,255,0.7)",
                                }}
                              >
                                {getServiceName(sid)}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span style={{ fontSize: 13, color: "rgba(255,255,255,0.3)" }}>None</span>
                        )}
                      </div>

                      {/* Package */}
                      <div>
                        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>
                          Package
                        </div>
                        <span style={{ fontSize: 13, color: b.package_id ? "#fff" : "rgba(255,255,255,0.3)" }}>
                          {b.package_id ? getPackageName(b.package_id) : "None"}
                        </span>
                      </div>

                      {/* Car Details */}
                      <div>
                        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>
                          Car Details
                        </div>
                        <div style={{ fontSize: 13, color: "rgba(255,255,255,0.6)" }}>
                          {b.car_make || "—"}
                          {b.car_year && <span> &middot; {b.car_year}</span>}
                          {b.car_color && <span> &middot; {b.car_color}</span>}
                        </div>
                        {b.preferred_date && (
                          <div style={{ fontSize: 12, color: "#F6BE00", marginTop: 4 }}>
                            Preferred: {new Date(b.preferred_date + "T00:00:00").toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
                          </div>
                        )}
                      </div>

                      {/* Addons */}
                      <div>
                        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>
                          Add-ons
                        </div>
                        <div style={{ fontSize: 13, color: "rgba(255,255,255,0.6)" }}>
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
                        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>
                          Pricing
                        </div>
                        <div style={{ fontSize: 13, color: "rgba(255,255,255,0.6)" }}>
                          Subtotal: {(b.subtotal || 0).toLocaleString()} SAR
                        </div>
                        {b.discount > 0 && (
                          <div style={{ fontSize: 13, color: "#4CAF50" }}>
                            Discount: -{(b.discount || 0).toLocaleString()} SAR
                          </div>
                        )}
                        <div style={{ fontSize: 14, fontWeight: 700, color: "#fff", marginTop: 4 }}>
                          Total: {(b.total || 0).toLocaleString()} SAR
                        </div>
                      </div>

                      {/* Notes */}
                      <div>
                        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>
                          Notes
                        </div>
                        <span style={{ fontSize: 13, color: b.customer_notes ? "rgba(255,255,255,0.6)" : "rgba(255,255,255,0.3)" }}>
                          {b.customer_notes || "None"}
                        </span>
                      </div>

                      {/* Payment & Locale */}
                      <div>
                        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>
                          Payment
                        </div>
                        <span style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", textTransform: "capitalize" }}>
                          {b.payment_method}
                        </span>
                        <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", marginTop: 4 }}>
                          Locale: {b.locale?.toUpperCase()}
                        </div>
                      </div>
                    </div>

                    {/* Status update */}
                    <div
                      style={{
                        marginTop: 16,
                        paddingTop: 16,
                        borderTop: "1px solid rgba(255,255,255,0.06)",
                        display: "flex",
                        alignItems: "center",
                        gap: 12,
                      }}
                    >
                      <label style={{ fontSize: 12, color: "rgba(255,255,255,0.4)" }}>
                        Update Status:
                      </label>
                      <select
                        value={b.status}
                        disabled={updatingId === b.id}
                        onChange={(e) => updateStatus(b.id, e.target.value)}
                        style={{
                          padding: "8px 12px",
                          background: "#050505",
                          border: "1px solid rgba(255,255,255,0.1)",
                          borderRadius: 8,
                          color: "#fff",
                          fontSize: 13,
                          outline: "none",
                          cursor: "pointer",
                        }}
                      >
                        {STATUSES.filter((s) => s !== "all").map((s) => (
                          <option key={s} value={s}>
                            {s.replace("_", " ")}
                          </option>
                        ))}
                      </select>
                      {updatingId === b.id && (
                        <span style={{ fontSize: 12, color: "rgba(255,255,255,0.3)" }}>
                          Saving...
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      <style>{`
        .booking-row:hover {
          background: rgba(255,255,255,0.02);
        }
        @media (max-width: 768px) {
          .booking-row {
            grid-template-columns: 1fr auto !important;
            grid-template-rows: auto auto auto;
          }
        }
      `}</style>
    </div>
  );
}
