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
  confirmed: "#2196F3",
  in_progress: "#FF9800",
  completed: "#4CAF50",
  cancelled: "#f44336",
};

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
const DAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

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

  if (loading) {
    return (
      <div style={{ color: "rgba(255,255,255,0.4)", padding: 40, textAlign: "center" }}>
        Loading dashboard...
      </div>
    );
  }

  return (
    <div className="dash-root">
      <h1 style={{ fontSize: 20, fontWeight: 700, color: "#fff", marginBottom: 20 }}>
        Dashboard
      </h1>

      {/* Stats */}
      <div className="dash-stats">
        {[
          { label: "Bookings", value: bookings.length, color: "#fff" },
          { label: "Revenue", value: totalRevenue.toLocaleString(), color: "#fff", sub: "SAR" },
          { label: "Pending", value: pendingCount, color: "#F6BE00" },
          { label: "Confirmed", value: confirmedCount, color: "#2196F3" },
        ].map((s) => (
          <div key={s.label} className="dash-card">
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>
              {s.label}
            </div>
            <div style={{ fontSize: 28, fontWeight: 800, color: s.color, lineHeight: 1 }}>
              {s.value}
            </div>
            {s.sub && <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", marginTop: 3 }}>{s.sub}</div>}
          </div>
        ))}
      </div>

      {/* Revenue Chart */}
      <div className="dash-card" style={{ marginBottom: 20, padding: 16 }}>
        <h2 style={{ fontSize: 13, fontWeight: 600, color: "#fff", marginBottom: 16 }}>Weekly Revenue</h2>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 6, height: 120 }}>
          {(() => {
            const maxRev = Math.max(...weeklyRevenue.map((w) => w.revenue), 1);
            return weeklyRevenue.map((w) => (
              <div key={w.label} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                {w.revenue > 0 && (
                  <span style={{ fontSize: 9, color: "rgba(255,255,255,0.4)", whiteSpace: "nowrap" }}>
                    {(w.revenue / 1000).toFixed(w.revenue >= 1000 ? 1 : 0)}k
                  </span>
                )}
                <div
                  title={`${w.label}: ${w.revenue.toLocaleString()} SAR (${w.bookings} bookings)`}
                  style={{
                    width: "100%",
                    maxWidth: 40,
                    height: `${Math.max((w.revenue / maxRev) * 90, 4)}%`,
                    background: w.revenue > 0 ? "linear-gradient(to top, rgba(246,190,0,0.3), rgba(246,190,0,0.7))" : "rgba(255,255,255,0.05)",
                    borderRadius: "4px 4px 0 0",
                    transition: "height 0.5s ease",
                    minHeight: 4,
                  }}
                />
                <span style={{ fontSize: 9, color: "rgba(255,255,255,0.3)" }}>{w.label}</span>
              </div>
            ));
          })()}
        </div>
      </div>

      {/* Calendar + Detail */}
      <div className="dash-calendar-wrap">
        {/* Calendar */}
        <div className="dash-card" style={{ padding: 16 }}>
          {/* Header */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <button onClick={prevMonth} className="dash-nav-btn">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
              </button>
              <h2 className="dash-month-title">
                {MONTHS[currentMonth.getMonth()]} {currentMonth.getFullYear()}
              </h2>
              <button onClick={nextMonth} className="dash-nav-btn">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
              </button>
            </div>
            <button onClick={goToday} className="dash-nav-btn" style={{ padding: "5px 12px", fontSize: 11, color: "#F6BE00", borderColor: "rgba(246,190,0,0.3)" }}>
              Today
            </button>
          </div>

          {/* Day headers */}
          <div className="dash-cal-grid" style={{ marginBottom: 2 }}>
            {DAYS.map((d) => (
              <div key={d} style={{ textAlign: "center", fontSize: 10, color: "rgba(255,255,255,0.3)", padding: "4px 0", fontWeight: 600 }}>
                {d}
              </div>
            ))}
          </div>

          {/* Days */}
          <div className="dash-cal-grid">
            {calendarDays.map((cell) => {
              const dayBookings = bookingsByDate[cell.date] || [];
              const hasBookings = dayBookings.length > 0;
              const isSelected = selectedDate === cell.date;
              const statusCounts = dayBookings.reduce((acc, b) => {
                acc[b.status] = (acc[b.status] || 0) + 1;
                return acc;
              }, {} as Record<string, number>);

              return (
                <button
                  key={cell.date}
                  onClick={() => setSelectedDate(isSelected ? null : cell.date)}
                  className="dash-cal-cell"
                  style={{
                    background: isSelected
                      ? "rgba(246,190,0,0.15)"
                      : cell.isToday
                      ? "rgba(246,190,0,0.06)"
                      : "transparent",
                    border: isSelected
                      ? "1px solid rgba(246,190,0,0.5)"
                      : cell.isToday
                      ? "1px solid rgba(246,190,0,0.2)"
                      : "1px solid rgba(255,255,255,0.04)",
                    color: !cell.isCurrentMonth
                      ? "rgba(255,255,255,0.15)"
                      : cell.isToday
                      ? "#F6BE00"
                      : "#fff",
                    fontWeight: cell.isToday ? 700 : 500,
                  }}
                >
                  <span>{cell.day}</span>
                  {hasBookings && cell.isCurrentMonth && (
                    <div style={{ display: "flex", gap: 2, justifyContent: "center" }}>
                      {Object.entries(statusCounts).slice(0, 3).map(([status]) => (
                        <div
                          key={status}
                          style={{
                            width: 5,
                            height: 5,
                            borderRadius: 3,
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
          <div style={{ display: "flex", flexWrap: "wrap", gap: 10, marginTop: 12, paddingTop: 10, borderTop: "1px solid rgba(255,255,255,0.06)" }}>
            {Object.entries(STATUS_COLORS).map(([status, color]) => (
              <div key={status} style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <div style={{ width: 6, height: 6, borderRadius: 3, background: color }} />
                <span style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", textTransform: "capitalize" }}>
                  {status.replace("_", " ")}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Side panel */}
        {selectedBookings && (
          <div className="dash-card dash-side-panel">
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
              <h3 style={{ fontSize: 13, fontWeight: 600, color: "#fff", margin: 0 }}>
                {new Date(selectedDate + "T00:00:00").toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" })}
              </h3>
              <button
                onClick={() => setSelectedDate(null)}
                style={{ background: "none", border: "none", color: "rgba(255,255,255,0.3)", cursor: "pointer", fontSize: 18, padding: 0, lineHeight: 1 }}
              >
                &times;
              </button>
            </div>

            {selectedBookings.length === 0 ? (
              <div style={{ color: "rgba(255,255,255,0.25)", fontSize: 13, padding: "20px 0", textAlign: "center" }}>
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
                      borderRadius: 10,
                      borderLeft: `3px solid ${STATUS_COLORS[b.status] || "#666"}`,
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: 6 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: "#fff" }}>
                        {b.customer_name}
                      </div>
                      <span
                        style={{
                          padding: "2px 7px",
                          borderRadius: 12,
                          fontSize: 9,
                          fontWeight: 600,
                          textTransform: "capitalize",
                          background: `${STATUS_COLORS[b.status] || "#666"}20`,
                          color: STATUS_COLORS[b.status] || "#666",
                          whiteSpace: "nowrap",
                          flexShrink: 0,
                          marginLeft: 6,
                        }}
                      >
                        {b.status.replace("_", " ")}
                      </span>
                    </div>
                    <div style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", marginBottom: 3 }}>
                      {b.customer_phone}
                    </div>
                    {b.car_make && (
                      <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>
                        {b.car_make} &middot; {b.car_size}
                      </div>
                    )}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 8 }}>
                      <span style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>
                        {(b.total || 0).toLocaleString()} SAR
                      </span>
                      <div style={{ display: "flex", gap: 5 }}>
                        <a href={`tel:${b.customer_phone}`} className="dash-action-btn dash-action-call" title="Call">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
                          </svg>
                        </a>
                        <a href={`https://wa.me/${b.customer_phone.replace(/[^0-9]/g, "")}`} target="_blank" rel="noopener noreferrer" className="dash-action-btn dash-action-wa" title="WhatsApp">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
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

      {/* Today's bookings */}
      {todayBookings.length > 0 && !selectedDate && (
        <div className="dash-card" style={{ marginTop: 16 }}>
          <h2 style={{ fontSize: 14, fontWeight: 600, color: "#F6BE00", marginBottom: 12 }}>
            {"Today's Bookings"} ({todayBookings.length})
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {todayBookings.map((b) => (
              <div
                key={b.id}
                style={{
                  padding: 12,
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.06)",
                  borderRadius: 10,
                  borderLeft: `3px solid ${STATUS_COLORS[b.status] || "#666"}`,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "#fff", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{b.customer_name}</div>
                  <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginTop: 2 }}>
                    {b.car_make || b.car_size} &middot; {(b.total || 0).toLocaleString()} SAR
                  </div>
                </div>
                <span
                  style={{
                    padding: "3px 8px",
                    borderRadius: 12,
                    fontSize: 9,
                    fontWeight: 600,
                    textTransform: "capitalize",
                    background: `${STATUS_COLORS[b.status] || "#666"}20`,
                    color: STATUS_COLORS[b.status] || "#666",
                    whiteSpace: "nowrap",
                    flexShrink: 0,
                  }}
                >
                  {b.status.replace("_", " ")}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <style>{`
        .dash-root { max-width: 100%; overflow-x: hidden; }
        .dash-card {
          background: #111;
          border: 1px solid rgba(246,190,0,0.15);
          border-radius: 12px;
          padding: 16px;
        }
        .dash-stats {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 10px;
          margin-bottom: 20px;
        }
        .dash-calendar-wrap {
          display: grid;
          grid-template-columns: 1fr;
          gap: 12px;
        }
        .dash-cal-grid {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          gap: 2px;
        }
        .dash-cal-cell {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 2px;
          padding: 6px 2px;
          border-radius: 8px;
          font-size: 13px;
          cursor: pointer;
          transition: all 0.15s;
          min-height: 42px;
        }
        .dash-cal-cell:active {
          transform: scale(0.95);
        }
        .dash-nav-btn {
          background: transparent;
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 8px;
          color: rgba(255,255,255,0.6);
          cursor: pointer;
          padding: 5px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
        }
        .dash-month-title {
          font-size: 15px;
          font-weight: 700;
          color: #fff;
          margin: 0;
          min-width: 150px;
          text-align: center;
        }
        .dash-side-panel {
          max-height: 60vh;
          overflow-y: auto;
          -webkit-overflow-scrolling: touch;
        }
        .dash-action-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 28px;
          height: 28px;
          border-radius: 7px;
          text-decoration: none;
        }
        .dash-action-call {
          background: rgba(33,150,243,0.1);
          border: 1px solid rgba(33,150,243,0.2);
          color: #2196F3;
        }
        .dash-action-wa {
          background: rgba(37,211,102,0.1);
          border: 1px solid rgba(37,211,102,0.2);
          color: #25D366;
        }

        /* Mobile: 2x2 stats, stacked layout */
        @media (max-width: 640px) {
          .dash-stats {
            grid-template-columns: repeat(2, 1fr);
            gap: 8px;
          }
          .dash-card { padding: 12px; border-radius: 10px; }
          .dash-cal-cell {
            font-size: 12px;
            min-height: 38px;
            padding: 4px 1px;
            border-radius: 6px;
          }
          .dash-month-title {
            font-size: 14px;
            min-width: 130px;
          }
        }

        /* Tablet+: side panel next to calendar */
        @media (min-width: 900px) {
          .dash-calendar-wrap {
            grid-template-columns: 1fr 360px;
          }
          .dash-side-panel {
            max-height: calc(100vh - 280px);
          }
        }
      `}</style>
    </div>
  );
}
