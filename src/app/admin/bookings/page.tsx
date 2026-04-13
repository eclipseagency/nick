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

function statusBadgeClasses(status: string): string {
  const colors: Record<string, string> = {
    pending: "bg-amber-500/10 text-amber-500",
    confirmed: "bg-blue-500/10 text-blue-500",
    in_progress: "bg-orange-500/10 text-orange-500",
    completed: "bg-green-500/10 text-green-500",
    cancelled: "bg-red-500/10 text-red-500",
  };
  return `inline-block px-2.5 py-0.5 rounded-full text-[11px] font-semibold capitalize whitespace-nowrap ${colors[status] || "bg-white/10 text-white/50"}`;
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

  const [deletingId, setDeletingId] = useState<string | null>(null);

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
      <div className="space-y-5">
        <div className="admin-skeleton h-8 w-40 rounded-lg" />
        <div className="flex flex-wrap gap-2">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="admin-skeleton h-9 w-24 rounded-full" />
          ))}
        </div>
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="admin-skeleton h-20 rounded-xl" />
        ))}
      </div>
    );
  }

  /* ── Expanded detail panel (shared between desktop and mobile) ── */
  function ExpandedDetails({ b }: { b: Booking }) {
    return (
      <div className="px-4 pb-4 border-t border-white/[0.06]">
        <div className="grid grid-cols-1 sm:grid-cols-2 min-[900px]:grid-cols-3 gap-4 pt-4">
          {/* Services */}
          <div>
            <div className="text-[10px] uppercase tracking-wider text-white/35 mb-1.5">Services</div>
            {b.service_ids?.length > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {b.service_ids.map((sid) => (
                  <span key={sid} className="bg-white/5 rounded-md px-2.5 py-1 text-xs text-white/70">
                    {getServiceName(sid)}
                  </span>
                ))}
              </div>
            ) : (
              <span className="text-sm text-white/30">None</span>
            )}
          </div>

          {/* Package */}
          <div>
            <div className="text-[10px] uppercase tracking-wider text-white/35 mb-1.5">Package</div>
            <span className={`text-sm ${b.package_id ? "text-white" : "text-white/30"}`}>
              {b.package_id ? getPackageName(b.package_id) : "None"}
            </span>
          </div>

          {/* Car Details */}
          <div>
            <div className="text-[10px] uppercase tracking-wider text-white/35 mb-1.5">Car Details</div>
            <div className="text-sm text-white/60">
              {b.car_make || "—"}
              {b.car_year && <span> &middot; {b.car_year}</span>}
              {b.car_color && <span> &middot; {b.car_color}</span>}
            </div>
            {b.preferred_date && (
              <div className="text-xs text-gold mt-1">
                Preferred: {new Date(b.preferred_date + "T00:00:00").toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
              </div>
            )}
          </div>

          {/* Addons */}
          <div>
            <div className="text-[10px] uppercase tracking-wider text-white/35 mb-1.5">Add-ons</div>
            <div className="text-sm text-white/60">
              {(() => {
                const raw = b.addon_ids;
                const parsed: Record<string, unknown> | null = typeof raw === "string" ? (() => { try { return JSON.parse(raw); } catch { return null; } })() : raw;
                if (!parsed || typeof parsed !== "object" || Object.keys(parsed).length === 0) return "None";
                return Object.entries(parsed).map(([svcId, addonIds]) => (
                  <div key={svcId} className="mb-1">
                    <span className="text-gold text-[11px]">{SERVICE_NAMES[svcId] || svcId}:</span>{" "}
                    {Array.isArray(addonIds) ? addonIds.map(a => ADDON_NAMES[a as string] || a).join(", ") : String(addonIds)}
                  </div>
                ));
              })()}
            </div>
          </div>

          {/* Pricing */}
          <div>
            <div className="text-[10px] uppercase tracking-wider text-white/35 mb-1.5">Pricing</div>
            <div className="text-sm text-white/60">Subtotal: {(b.subtotal || 0).toLocaleString()} SAR</div>
            {b.discount > 0 && (
              <div className="text-sm text-green-500">Discount: -{(b.discount || 0).toLocaleString()} SAR</div>
            )}
            <div className="text-sm font-bold text-white mt-1">Total: {(b.total || 0).toLocaleString()} SAR</div>
          </div>

          {/* Notes */}
          <div>
            <div className="text-[10px] uppercase tracking-wider text-white/35 mb-1.5">Notes</div>
            <span className={`text-sm ${b.customer_notes ? "text-white/60" : "text-white/30"}`}>
              {b.customer_notes || "None"}
            </span>
          </div>

          {/* Payment */}
          <div>
            <div className="text-[10px] uppercase tracking-wider text-white/35 mb-1.5">Payment</div>
            <span className="text-sm text-white/60 capitalize">{b.payment_method}</span>
            <div className="text-[11px] text-white/30 mt-1">Locale: {b.locale?.toUpperCase()}</div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 flex-wrap mt-4 pt-4 border-t border-white/[0.06]">
          <a
            href={`tel:${b.customer_phone}`}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-500/10 border border-blue-500/30 rounded-lg text-blue-500 text-sm font-medium no-underline"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
            </svg>
            Call
          </a>
          <a
            href={`https://wa.me/${b.customer_phone.replace(/[^0-9]/g, "")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-green-500/10 border border-green-500/30 rounded-lg text-green-500 text-sm font-medium no-underline"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
            </svg>
            WhatsApp
          </a>
          <div className="flex-1" />
          <label className="text-xs text-white/40">Status:</label>
          <select
            value={b.status}
            disabled={updatingId === b.id}
            onChange={(e) => updateStatus(b.id, e.target.value)}
            className="px-3 py-2 bg-[#050505] border border-white/10 rounded-lg text-white text-sm outline-none cursor-pointer"
          >
            {STATUSES.filter((s) => s !== "all").map((s) => (
              <option key={s} value={s}>
                {s.replace("_", " ")}
              </option>
            ))}
          </select>
          {updatingId === b.id && (
            <span className="text-xs text-white/30">Saving...</span>
          )}
          <button
            onClick={() => deleteBooking(b.id)}
            disabled={deletingId === b.id}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-red-500/[0.08] border border-red-500/20 rounded-lg text-red-500 text-xs font-medium cursor-pointer hover:bg-red-500/[0.15] transition disabled:opacity-50"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
            </svg>
            {deletingId === b.id ? "..." : "Delete"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-6 flex-wrap gap-3">
        <h1 className="text-2xl font-bold text-white m-0">Bookings</h1>
        <button
          onClick={exportCSV}
          className="flex items-center gap-1.5 px-4 py-2 border border-white/[0.15] rounded-lg text-white/70 text-sm font-medium cursor-pointer transition bg-transparent hover:border-gold hover:text-gold"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          Export CSV
        </button>
      </div>

      {/* Status filter pills */}
      <div className="flex flex-wrap gap-2 mb-5">
        {STATUSES.map((s) => {
          const active = filter === s;
          const count = s === "all" ? bookings.length : bookings.filter((b) => b.status === s).length;
          return (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-4 py-1.5 rounded-full border text-sm cursor-pointer transition capitalize
                ${active
                  ? "border-gold bg-gold/10 text-gold font-semibold"
                  : "border-white/10 text-white/50 hover:border-white/20 bg-transparent"
                }`}
            >
              {s.replace("_", " ")} ({count})
            </button>
          );
        })}
      </div>

      {/* Search + date filters */}
      <div className="flex flex-wrap gap-2.5 mb-5 items-center">
        <input
          type="text"
          placeholder="Search by name or phone..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-[280px] px-3.5 py-2.5 bg-[#111] border border-white/10 rounded-lg text-white text-sm placeholder:text-white/25 outline-none focus:border-gold/50 transition"
        />
        <div className="flex items-center gap-1.5">
          <label className="text-xs text-white/40 whitespace-nowrap">From</label>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="px-3 py-2 bg-[#050505] border border-white/10 rounded-lg text-white text-sm outline-none [color-scheme:dark]"
          />
        </div>
        <div className="flex items-center gap-1.5">
          <label className="text-xs text-white/40 whitespace-nowrap">To</label>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="px-3 py-2 bg-[#050505] border border-white/10 rounded-lg text-white text-sm outline-none [color-scheme:dark]"
          />
        </div>
        {(dateFrom || dateTo) && (
          <button
            onClick={() => { setDateFrom(""); setDateTo(""); }}
            className="px-3 py-2 border border-white/10 rounded-lg text-white/40 text-xs cursor-pointer hover:text-white/60 transition bg-transparent"
          >
            Clear dates
          </button>
        )}
      </div>

      {/* Bookings list */}
      {filtered.length === 0 ? (
        <div className="bg-[#111] rounded-xl py-16 text-center">
          <svg className="w-10 h-10 mx-auto text-white/15 mb-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <rect x="3" y="4" width="18" height="18" rx="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
          <p className="text-white/30 text-sm">No bookings found</p>
        </div>
      ) : (
        <>
          {/* Desktop layout (lg+) */}
          <div className="hidden lg:block space-y-2">
            {filtered.map((b) => {
              const expanded = expandedId === b.id;
              return (
                <div
                  key={b.id}
                  className="bg-[#111] border border-white/[0.06] rounded-xl overflow-hidden"
                >
                  <div
                    onClick={() => setExpandedId(expanded ? null : b.id)}
                    className="grid grid-cols-[1fr_auto_auto_auto_auto_auto] gap-3 items-center px-4 py-3.5 cursor-pointer hover:bg-white/[0.02] transition"
                  >
                    <div>
                      <div className="text-sm font-semibold text-white">{b.customer_name}</div>
                      <div className="text-xs text-white/40 mt-0.5">{b.customer_phone}</div>
                    </div>
                    <div className="text-sm text-white/50 capitalize whitespace-nowrap">{b.car_size}</div>
                    <div className="text-xs text-white/40 whitespace-nowrap">
                      {b.service_ids?.length || 0} service{(b.service_ids?.length || 0) !== 1 ? "s" : ""}
                    </div>
                    <div className="text-sm font-semibold text-white whitespace-nowrap">
                      {(b.total || 0).toLocaleString()} SAR
                    </div>
                    <span className={statusBadgeClasses(b.status)}>{b.status.replace("_", " ")}</span>
                    <div className="text-xs text-white/35 whitespace-nowrap">{formatDate(b.created_at)}</div>
                  </div>
                  {expanded && <ExpandedDetails b={b} />}
                </div>
              );
            })}
          </div>

          {/* Mobile layout (below lg) */}
          <div className="lg:hidden space-y-2">
            {filtered.map((b) => {
              const expanded = expandedId === b.id;
              return (
                <div
                  key={b.id}
                  className="bg-[#111] border border-white/[0.06] rounded-xl overflow-hidden"
                >
                  <div
                    onClick={() => setExpandedId(expanded ? null : b.id)}
                    className="flex items-center justify-between px-4 py-3 cursor-pointer active:bg-white/[0.02]"
                  >
                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-white truncate">{b.customer_name}</div>
                      <div className="text-xs text-white/40 mt-0.5">
                        {b.customer_phone} · {(b.total || 0).toLocaleString()} SAR
                      </div>
                    </div>
                    <span className={`${statusBadgeClasses(b.status)} shrink-0 ml-2`}>
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
  );
}
