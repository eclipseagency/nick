"use client";

import { useEffect, useState, useMemo } from "react";

interface Booking {
  id: string;
  customer_name: string;
  customer_phone: string;
  car_make: string | null;
  car_size: string;
  service_ids: string[];
  preferred_date: string | null;
  total: number;
  status: string;
  created_at: string;
}

const STATUS_COLORS: Record<string, string> = {
  pending: "#F6BE00",
  confirmed: "#3B82F6",
  in_progress: "#F59E0B",
  completed: "#10B981",
  cancelled: "#ef4444",
};

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const DAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

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
  };
}

export default function AdminDashboard() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/bookings")
      .then((r) => r.json())
      .then((d) => {
        if (Array.isArray(d)) setBookings(d);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const bookingsByDate = useMemo(() => {
    const map: Record<string, Booking[]> = {};
    bookings.forEach((b) => {
      const dateKey = b.preferred_date || b.created_at.slice(0, 10);
      if (!map[dateKey]) map[dateKey] = [];
      map[dateKey].push(b);
    });
    return map;
  }, [bookings]);

  const calendarDays = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    const days: { date: string; day: number; isCurrentMonth: boolean; isToday: boolean }[] = [];

    for (let i = firstDay - 1; i >= 0; i--) {
      const d = daysInPrevMonth - i;
      const prevMonth = month === 0 ? 11 : month - 1;
      const prevYear = month === 0 ? year - 1 : year;
      const dateStr = `${prevYear}-${String(prevMonth + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      days.push({ date: dateStr, day: d, isCurrentMonth: false, isToday: false });
    }

    const todayStr = new Date().toISOString().slice(0, 10);
    for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      days.push({ date: dateStr, day: d, isCurrentMonth: true, isToday: dateStr === todayStr });
    }

    const remaining = 42 - days.length;
    for (let d = 1; d <= remaining; d++) {
      const nextMonth = month === 11 ? 0 : month + 1;
      const nextYear = month === 11 ? year + 1 : year;
      const dateStr = `${nextYear}-${String(nextMonth + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      days.push({ date: dateStr, day: d, isCurrentMonth: false, isToday: false });
    }

    return days;
  }, [currentMonth]);

  const totalRevenue = bookings
    .filter((b) => b.status !== "cancelled")
    .reduce((s, b) => s + (b.total || 0), 0);

  const pendingCount = bookings.filter((b) => b.status === "pending").length;
  const confirmedCount = bookings.filter((b) => b.status === "confirmed").length;

  // Weekly revenue data (last 8 weeks)
  const weeklyRevenue = useMemo(() => {
    const weeks: { label: string; revenue: number; bookings: number }[] = [];
    const now = new Date();
    for (let i = 7; i >= 0; i--) {
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - (i * 7) - now.getDay());
      weekStart.setHours(0, 0, 0, 0);
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);
      weekEnd.setHours(23, 59, 59, 999);

      const weekBookings = bookings.filter((b) => {
        const d = new Date(b.created_at);
        return d >= weekStart && d <= weekEnd && b.status !== "cancelled";
      });

      weeks.push({
        label: `${weekStart.getDate()}/${weekStart.getMonth() + 1}`,
        revenue: weekBookings.reduce((s, b) => s + (b.total || 0), 0),
        bookings: weekBookings.length,
      });
    }
    return weeks;
  }, [bookings]);

  const todayStr = new Date().toISOString().slice(0, 10);
  const todayBookings = bookingsByDate[todayStr] || [];

  const selectedBookings = selectedDate ? (bookingsByDate[selectedDate] || []) : null;

  function prevMonth() {
    setCurrentMonth((m) => new Date(m.getFullYear(), m.getMonth() - 1, 1));
    setSelectedDate(null);
  }
  function nextMonth() {
    setCurrentMonth((m) => new Date(m.getFullYear(), m.getMonth() + 1, 1));
    setSelectedDate(null);
  }
  function goToday() {
    const now = new Date();
    setCurrentMonth(new Date(now.getFullYear(), now.getMonth(), 1));
    setSelectedDate(todayStr);
  }

  const maxRev = Math.max(...weeklyRevenue.map((w) => w.revenue), 1);

  const stats = [
    { label: "Total Bookings", value: bookings.length.toString(), sub: undefined },
    { label: "Revenue", value: totalRevenue.toLocaleString(), sub: "SAR" },
    { label: "Pending", value: pendingCount.toString(), sub: undefined },
    { label: "Confirmed", value: confirmedCount.toString(), sub: undefined },
  ];

  if (loading) {
    return (
      <div style={{ position: "relative", zIndex: 1 }}>
        <div
          className="admin-skeleton"
          style={{ height: 28, width: 128, borderRadius: 8, marginBottom: 28 }}
        />
        <div
          className="admin-kpi-grid"
          style={{ display: "grid", gap: 16, marginBottom: 24 }}
        >
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="admin-skeleton" style={{ height: 96, borderRadius: 16 }} />
          ))}
        </div>
        <div
          className="admin-skeleton"
          style={{ height: 200, borderRadius: 16, marginBottom: 16 }}
        />
        <div className="admin-skeleton" style={{ height: 400, borderRadius: 16 }} />
      </div>
    );
  }

  return (
    <div style={{ position: "relative", zIndex: 1 }}>
      {/* Page Title */}
      <div style={{ fontSize: 22, fontWeight: 800, marginBottom: 28, color: "#f5f5f5" }}>
        Dashboard
      </div>

      {/* KPI Cards */}
      <div
        className="admin-kpi-grid"
        style={{ display: "grid", gap: 16, marginBottom: 24 }}
      >
        {stats.map((s) => (
          <div
            key={s.label}
            style={{
              background: "#111111",
              border: "1px solid rgba(255,255,255,0.06)",
              borderRadius: 16,
              padding: 20,
              position: "relative",
              overflow: "hidden",
            }}
          >
            {/* Gold radial glow top-right */}
            <div
              style={{
                position: "absolute",
                top: 0,
                right: 0,
                width: 80,
                height: 80,
                background:
                  "radial-gradient(circle at top right, rgba(246,190,0,0.06) 0%, transparent 70%)",
                pointerEvents: "none",
              }}
            />
            <div
              style={{
                fontSize: 12.5,
                color: "rgba(255,255,255,0.3)",
                marginBottom: 8,
                fontWeight: 500,
              }}
            >
              {s.label}
            </div>
            <div
              style={{
                fontFamily: "'Space Grotesk', sans-serif",
                fontSize: 28,
                fontWeight: 700,
                color: "#f5f5f5",
                marginBottom: 6,
              }}
            >
              {s.value}
              {s.sub && (
                <span
                  style={{
                    fontSize: 14,
                    color: "rgba(255,255,255,0.3)",
                    marginLeft: 4,
                  }}
                >
                  {s.sub}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Revenue Chart + Booking Status */}
      <div
        className="admin-dash-grid"
        style={{ display: "grid", gap: 16, marginBottom: 16 }}
      >
        {/* Weekly Revenue bar chart */}
        <div
          style={{
            background: "#111111",
            border: "1px solid rgba(255,255,255,0.06)",
            borderRadius: 16,
            padding: 20,
          }}
        >
          <div
            style={{
              fontSize: 14,
              fontWeight: 700,
              marginBottom: 16,
              display: "flex",
              justifyContent: "space-between",
              color: "#f5f5f5",
            }}
          >
            <span>Weekly Revenue</span>
            <span style={{ fontSize: 12, color: "#F6BE00", fontWeight: 600 }}>SAR</span>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "flex-end",
              gap: 10,
              height: 150,
              paddingBottom: 28,
              position: "relative",
            }}
          >
            {/* Baseline */}
            <div
              style={{
                position: "absolute",
                bottom: 28,
                left: 0,
                right: 0,
                height: 1,
                background: "rgba(255,255,255,0.06)",
              }}
            />
            {weeklyRevenue.map((w) => (
              <div
                key={w.label}
                style={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 6,
                  position: "relative",
                }}
              >
                <span
                  style={{
                    fontFamily: "'Inter', sans-serif",
                    fontSize: 10,
                    color: "rgba(255,255,255,0.3)",
                  }}
                >
                  {w.revenue > 0
                    ? `${(w.revenue / 1000).toFixed(w.revenue >= 1000 ? 1 : 0)}K`
                    : ""}
                </span>
                <div
                  title={`${w.label}: ${w.revenue.toLocaleString()} SAR (${w.bookings} bookings)`}
                  style={{
                    width: "100%",
                    maxWidth: 40,
                    height: `${Math.max((w.revenue / maxRev) * 100, 4)}%`,
                    borderRadius: "5px 5px 0 0",
                    background:
                      w.revenue > 0
                        ? "linear-gradient(180deg, #F6BE00 0%, #D4A300 100%)"
                        : "rgba(255,255,255,0.03)",
                    position: "relative",
                  }}
                >
                  {w.revenue > 0 && (
                    <div
                      style={{
                        position: "absolute",
                        inset: 0,
                        borderRadius: "inherit",
                        background:
                          "linear-gradient(180deg, rgba(255,255,255,0.15) 0%, transparent 50%)",
                      }}
                    />
                  )}
                </div>
                <span
                  style={{
                    position: "absolute",
                    bottom: -24,
                    fontSize: 10.5,
                    color: "rgba(255,255,255,0.3)",
                    whiteSpace: "nowrap",
                  }}
                >
                  {w.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Booking Status summary */}
        <div
          style={{
            background: "#111111",
            border: "1px solid rgba(255,255,255,0.06)",
            borderRadius: 16,
            padding: 20,
          }}
        >
          <div
            style={{ fontSize: 14, fontWeight: 700, marginBottom: 16, color: "#f5f5f5" }}
          >
            Booking Status
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {Object.entries(STATUS_COLORS).map(([status, color]) => {
              const count = bookings.filter((b) => b.status === status).length;
              return (
                <div
                  key={status}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    fontSize: 12.5,
                    color: "rgba(255,255,255,0.55)",
                  }}
                >
                  <span
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: 3,
                      background: color,
                      flexShrink: 0,
                    }}
                  />
                  <span style={{ flex: 1, textTransform: "capitalize" }}>
                    {status.replace("_", " ")}
                  </span>
                  <span
                    style={{
                      fontFamily: "'Inter', sans-serif",
                      fontWeight: 600,
                      color: "#f5f5f5",
                    }}
                  >
                    {count}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Calendar + Detail Panel */}
      <div style={{ display: "grid", gap: 16 }} className="admin-cal-grid">
        {/* Calendar card */}
        <div
          style={{
            background: "#111111",
            border: "1px solid rgba(255,255,255,0.06)",
            borderRadius: 16,
            padding: 20,
          }}
        >
          {/* Month navigation */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 14,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <button
                onClick={prevMonth}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  border: "1px solid rgba(255,255,255,0.1)",
                  background: "transparent",
                  color: "rgba(255,255,255,0.6)",
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="15 18 9 12 15 6" />
                </svg>
              </button>
              <h2
                style={{
                  fontSize: 15,
                  fontWeight: 700,
                  color: "#f5f5f5",
                  minWidth: 150,
                  textAlign: "center",
                  margin: 0,
                }}
              >
                {MONTHS[currentMonth.getMonth()]} {currentMonth.getFullYear()}
              </h2>
              <button
                onClick={nextMonth}
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  border: "1px solid rgba(255,255,255,0.1)",
                  background: "transparent",
                  color: "rgba(255,255,255,0.6)",
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>
            </div>
            <button
              onClick={goToday}
              style={{
                padding: "6px 12px",
                border: "1px solid rgba(246,190,0,0.3)",
                borderRadius: 8,
                fontSize: 11,
                color: "#F6BE00",
                background: "transparent",
                cursor: "pointer",
              }}
            >
              Today
            </button>
          </div>

          {/* Day headers */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(7, 1fr)",
              gap: 2,
              marginBottom: 2,
            }}
          >
            {DAYS.map((d) => (
              <div
                key={d}
                style={{
                  textAlign: "center",
                  fontSize: 10,
                  color: "rgba(255,255,255,0.3)",
                  padding: "4px 0",
                  fontWeight: 600,
                }}
              >
                {d}
              </div>
            ))}
          </div>

          {/* Day cells */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(7, 1fr)",
              gap: 2,
            }}
          >
            {calendarDays.map((cell) => {
              const dayBookings = bookingsByDate[cell.date] || [];
              const hasBookings = dayBookings.length > 0;
              const isSelected = selectedDate === cell.date;
              const statusCounts = dayBookings.reduce((acc, b) => {
                acc[b.status] = (acc[b.status] || 0) + 1;
                return acc;
              }, {} as Record<string, number>);

              let cellBg = "transparent";
              let cellBorder = "transparent";
              let cellColor = "rgba(255,255,255,0.15)";
              let cellFontWeight: number = 400;

              if (isSelected) {
                cellBg = "rgba(246,190,0,0.15)";
                cellBorder = "rgba(246,190,0,0.5)";
                cellColor = "#F6BE00";
                cellFontWeight = 700;
              } else if (cell.isToday) {
                cellBg = "rgba(246,190,0,0.06)";
                cellBorder = "rgba(246,190,0,0.2)";
                cellColor = "#F6BE00";
                cellFontWeight = 700;
              } else if (cell.isCurrentMonth) {
                cellBorder = "rgba(255,255,255,0.04)";
                cellColor = "#ffffff";
                cellFontWeight = 500;
              }

              return (
                <button
                  key={cell.date}
                  onClick={() => setSelectedDate(isSelected ? null : cell.date)}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 2,
                    padding: "6px 2px",
                    borderRadius: 8,
                    fontSize: 13,
                    minHeight: 48,
                    cursor: "pointer",
                    background: cellBg,
                    border: `1px solid ${cellBorder}`,
                    color: cellColor,
                    fontWeight: cellFontWeight,
                  }}
                >
                  <span>{cell.day}</span>
                  {hasBookings && cell.isCurrentMonth && (
                    <div style={{ display: "flex", gap: 2, justifyContent: "center" }}>
                      {Object.entries(statusCounts)
                        .slice(0, 3)
                        .map(([status]) => (
                          <div
                            key={status}
                            style={{
                              width: 5,
                              height: 5,
                              borderRadius: "50%",
                              background: STATUS_COLORS[status] || "#666",
                            }}
                          />
                        ))}
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Legend */}
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 10,
              marginTop: 12,
              paddingTop: 10,
              borderTop: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            {Object.entries(STATUS_COLORS).map(([status, color]) => (
              <div key={status} style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <div
                  style={{ width: 6, height: 6, borderRadius: "50%", background: color }}
                />
                <span
                  style={{
                    fontSize: 10,
                    color: "rgba(255,255,255,0.35)",
                    textTransform: "capitalize",
                  }}
                >
                  {status.replace("_", " ")}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Side panel — selected date bookings */}
        {selectedBookings && (
          <div
            style={{
              background: "#111111",
              border: "1px solid rgba(255,255,255,0.06)",
              borderRadius: 16,
              padding: 20,
              maxHeight: "60vh",
              overflowY: "auto",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 14,
              }}
            >
              <h3
                style={{
                  fontSize: 14,
                  fontWeight: 600,
                  color: "#f5f5f5",
                  margin: 0,
                }}
              >
                {new Date(selectedDate + "T00:00:00").toLocaleDateString("en-GB", {
                  weekday: "short",
                  day: "numeric",
                  month: "short",
                })}
              </h3>
              <button
                onClick={() => setSelectedDate(null)}
                style={{
                  color: "rgba(255,255,255,0.3)",
                  fontSize: 18,
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                  lineHeight: 1,
                }}
              >
                &times;
              </button>
            </div>

            {selectedBookings.length === 0 ? (
              <div
                style={{
                  color: "rgba(255,255,255,0.25)",
                  fontSize: 14,
                  padding: "20px 0",
                  textAlign: "center",
                }}
              >
                No bookings
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {selectedBookings.map((b) => (
                  <div
                    key={b.id}
                    style={{
                      padding: 12,
                      background: "rgba(255,255,255,0.03)",
                      border: "1px solid rgba(255,255,255,0.06)",
                      borderLeft: `3px solid ${STATUS_COLORS[b.status] || "#666"}`,
                      borderRadius: 12,
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        marginBottom: 6,
                      }}
                    >
                      <div
                        style={{ fontSize: 13, fontWeight: 600, color: "#f5f5f5" }}
                      >
                        {b.customer_name}
                      </div>
                      <span style={badgeStyle(b.status)}>
                        {b.status.replace("_", " ")}
                      </span>
                    </div>
                    <div
                      style={{
                        fontSize: 11,
                        color: "rgba(255,255,255,0.5)",
                        marginBottom: 2,
                      }}
                    >
                      {b.customer_phone}
                    </div>
                    {b.car_make && (
                      <div
                        style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}
                      >
                        {b.car_make} &middot; {b.car_size}
                      </div>
                    )}
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginTop: 8,
                      }}
                    >
                      <span
                        style={{ fontSize: 13, fontWeight: 700, color: "#f5f5f5" }}
                      >
                        {(b.total || 0).toLocaleString()} SAR
                      </span>
                      <div style={{ display: "flex", gap: 6 }}>
                        <a
                          href={`tel:${b.customer_phone}`}
                          title="Call"
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            width: 28,
                            height: 28,
                            borderRadius: 8,
                            background: "rgba(59,130,246,0.1)",
                            border: "1px solid rgba(59,130,246,0.2)",
                            color: "#3B82F6",
                          }}
                        >
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
                          </svg>
                        </a>
                        <a
                          href={`https://wa.me/${b.customer_phone.replace(/[^0-9]/g, "")}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="WhatsApp"
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            width: 28,
                            height: 28,
                            borderRadius: 8,
                            background: "rgba(16,185,129,0.1)",
                            border: "1px solid rgba(16,185,129,0.2)",
                            color: "#10B981",
                          }}
                        >
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                          </svg>
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Today's Bookings — table */}
      <div
        style={{
          background: "#111111",
          border: "1px solid rgba(255,255,255,0.06)",
          borderRadius: 16,
          padding: 20,
          marginTop: 16,
        }}
      >
        <div
          style={{
            fontSize: 14,
            fontWeight: 700,
            marginBottom: 16,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            color: "#f5f5f5",
          }}
        >
          <span>{"Today's Bookings"} ({todayBookings.length})</span>
          <a
            href="/admin/bookings"
            style={{
              fontSize: 12,
              color: "#F6BE00",
              fontWeight: 600,
              textDecoration: "none",
              cursor: "pointer",
            }}
          >
            View All →
          </a>
        </div>
        {todayBookings.length === 0 ? (
          <div
            style={{
              color: "rgba(255,255,255,0.25)",
              fontSize: 13,
              padding: "20px 0",
              textAlign: "center",
            }}
          >
            No bookings today
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th style={thStyle}>Customer</th>
                  <th style={thStyle}>Car</th>
                  <th style={thStyle}>Total</th>
                  <th style={thStyle}>Status</th>
                </tr>
              </thead>
              <tbody>
                {todayBookings.map((b) => (
                  <tr key={b.id}>
                    <td style={tdStyle}>
                      <span style={{ color: "#f5f5f5", fontWeight: 600, fontSize: 13 }}>
                        {b.customer_name}
                      </span>
                    </td>
                    <td style={tdStyle}>{b.car_make || b.car_size}</td>
                    <td style={tdStyle}>
                      <span
                        style={{
                          fontFamily: "'Inter', sans-serif",
                          fontWeight: 600,
                          color: "#f5f5f5",
                        }}
                      >
                        {(b.total || 0).toLocaleString()} SAR
                      </span>
                    </td>
                    <td style={tdStyle}>
                      <span style={badgeStyle(b.status)}>
                        {b.status.replace("_", " ")}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <style>{`
        .admin-kpi-grid { grid-template-columns: repeat(2, 1fr); }
        .admin-dash-grid { grid-template-columns: 1fr; }
        .admin-cal-grid { grid-template-columns: 1fr; }
        @media (min-width: 768px) {
          .admin-kpi-grid { grid-template-columns: repeat(4, 1fr); }
          .admin-dash-grid { grid-template-columns: 1.6fr 1fr; }
        }
        @media (min-width: 900px) {
          .admin-cal-grid { grid-template-columns: 1fr 360px; }
        }
      `}</style>
    </div>
  );
}
