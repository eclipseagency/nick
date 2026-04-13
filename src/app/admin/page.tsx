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
      <div className="space-y-5">
        <div className="admin-skeleton h-7 w-32 rounded-lg" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4">
          {[1, 2, 3, 4].map(i => <div key={i} className="admin-skeleton h-24 rounded-xl" />)}
        </div>
        <div className="admin-skeleton h-40 rounded-xl" />
        <div className="admin-skeleton h-80 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="max-w-full overflow-x-hidden">
      <h1 className="text-xl font-bold text-white mb-5">Dashboard</h1>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4 mb-5">
        {[
          { label: "Bookings", value: bookings.length, colorClass: "text-white" },
          { label: "Revenue", value: totalRevenue.toLocaleString(), colorClass: "text-white", sub: "SAR" },
          { label: "Pending", value: pendingCount, colorClass: "text-amber-500" },
          { label: "Confirmed", value: confirmedCount, colorClass: "text-blue-500" },
        ].map((s) => (
          <div key={s.label} className="bg-[#111] border border-white/[0.06] rounded-xl p-4">
            <div className="text-[10px] uppercase tracking-wider text-white/40 mb-1.5">{s.label}</div>
            <div className={`text-[28px] font-extrabold leading-none ${s.colorClass}`}>{s.value}</div>
            {s.sub && <div className="text-[10px] text-white/30 mt-1">{s.sub}</div>}
          </div>
        ))}
      </div>

      {/* Revenue Chart */}
      <div className="bg-[#111] border border-white/[0.06] rounded-xl p-4 mb-5">
        <h2 className="text-sm font-semibold text-white mb-4">Weekly Revenue</h2>
        <div className="flex items-end gap-1.5 h-[120px]">
          {(() => {
            const maxRev = Math.max(...weeklyRevenue.map((w) => w.revenue), 1);
            return weeklyRevenue.map((w) => (
              <div key={w.label} className="flex-1 flex flex-col items-center gap-1">
                {w.revenue > 0 && (
                  <span className="text-[9px] text-white/40 whitespace-nowrap">
                    {(w.revenue / 1000).toFixed(w.revenue >= 1000 ? 1 : 0)}k
                  </span>
                )}
                <div
                  title={`${w.label}: ${w.revenue.toLocaleString()} SAR (${w.bookings} bookings)`}
                  className="w-full max-w-[40px] rounded-t transition-all duration-500 min-h-[4px]"
                  style={{
                    height: `${Math.max((w.revenue / maxRev) * 90, 4)}%`,
                    background: w.revenue > 0
                      ? "linear-gradient(to top, rgba(246,190,0,0.3), rgba(246,190,0,0.7))"
                      : "rgba(255,255,255,0.05)",
                  }}
                />
                <span className="text-[9px] text-white/30">{w.label}</span>
              </div>
            ));
          })()}
        </div>
      </div>

      {/* Calendar + Detail */}
      <div className="grid grid-cols-1 min-[900px]:grid-cols-[1fr_360px] gap-3">
        {/* Calendar */}
        <div className="bg-[#111] border border-white/[0.06] rounded-xl p-4">
          {/* Month navigation */}
          <div className="flex items-center justify-between mb-3.5">
            <div className="flex items-center gap-2">
              <button
                onClick={prevMonth}
                className="p-1.5 border border-white/10 rounded-lg text-white/60 hover:text-white transition bg-transparent cursor-pointer inline-flex items-center justify-center"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="15 18 9 12 15 6"/>
                </svg>
              </button>
              <h2 className="text-[15px] font-bold text-white min-w-[150px] text-center m-0">
                {MONTHS[currentMonth.getMonth()]} {currentMonth.getFullYear()}
              </h2>
              <button
                onClick={nextMonth}
                className="p-1.5 border border-white/10 rounded-lg text-white/60 hover:text-white transition bg-transparent cursor-pointer inline-flex items-center justify-center"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="9 18 15 12 9 6"/>
                </svg>
              </button>
            </div>
            <button
              onClick={goToday}
              className="px-3 py-1.5 border border-gold/30 rounded-lg text-[11px] text-gold hover:bg-gold/5 transition bg-transparent cursor-pointer"
            >
              Today
            </button>
          </div>

          {/* Day headers */}
          <div className="grid grid-cols-7 gap-0.5 mb-0.5">
            {DAYS.map((d) => (
              <div key={d} className="text-center text-[10px] text-white/30 py-1 font-semibold">
                {d}
              </div>
            ))}
          </div>

          {/* Day cells */}
          <div className="grid grid-cols-7 gap-0.5">
            {calendarDays.map((cell) => {
              const dayBookings = bookingsByDate[cell.date] || [];
              const hasBookings = dayBookings.length > 0;
              const isSelected = selectedDate === cell.date;
              const statusCounts = dayBookings.reduce((acc, b) => {
                acc[b.status] = (acc[b.status] || 0) + 1;
                return acc;
              }, {} as Record<string, number>);

              let cellClasses = "flex flex-col items-center justify-center gap-0.5 py-1.5 px-0.5 rounded-lg text-[13px] min-h-[42px] cursor-pointer transition border bg-transparent";

              if (isSelected) {
                cellClasses += " bg-gold/15 border-gold/50 text-gold font-bold";
              } else if (cell.isToday) {
                cellClasses += " bg-gold/[0.06] border-gold/20 text-gold font-bold";
              } else if (cell.isCurrentMonth) {
                cellClasses += " border-white/[0.04] text-white font-medium";
              } else {
                cellClasses += " border-transparent text-white/15";
              }

              return (
                <button
                  key={cell.date}
                  onClick={() => setSelectedDate(isSelected ? null : cell.date)}
                  className={cellClasses}
                >
                  <span>{cell.day}</span>
                  {hasBookings && cell.isCurrentMonth && (
                    <div className="flex gap-0.5 justify-center">
                      {Object.entries(statusCounts).slice(0, 3).map(([status]) => (
                        <div
                          key={status}
                          className="w-[5px] h-[5px] rounded-full"
                          style={{ background: STATUS_COLORS[status] || "#666" }}
                        />
                      ))}
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Legend */}
          <div className="flex flex-wrap gap-2.5 mt-3 pt-2.5 border-t border-white/[0.06]">
            {Object.entries(STATUS_COLORS).map(([status, color]) => (
              <div key={status} className="flex items-center gap-1">
                <div className="w-1.5 h-1.5 rounded-full" style={{ background: color }} />
                <span className="text-[10px] text-white/35 capitalize">
                  {status.replace("_", " ")}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Side panel */}
        {selectedBookings && (
          <div className="bg-[#111] border border-white/[0.06] rounded-xl p-4 max-h-[60vh] min-[900px]:max-h-[calc(100vh-280px)] overflow-y-auto">
            <div className="flex items-center justify-between mb-3.5">
              <h3 className="text-sm font-semibold text-white m-0">
                {new Date(selectedDate + "T00:00:00").toLocaleDateString("en-GB", {
                  weekday: "short",
                  day: "numeric",
                  month: "short",
                })}
              </h3>
              <button
                onClick={() => setSelectedDate(null)}
                className="text-white/30 text-lg hover:text-white/60 cursor-pointer bg-transparent border-none leading-none"
              >
                &times;
              </button>
            </div>

            {selectedBookings.length === 0 ? (
              <div className="text-white/25 text-sm py-5 text-center">No bookings</div>
            ) : (
              <div className="flex flex-col gap-2">
                {selectedBookings.map((b) => (
                  <div
                    key={b.id}
                    className="p-3 bg-white/[0.03] border border-white/[0.06] rounded-xl border-l-[3px]"
                    style={{ borderLeftColor: STATUS_COLORS[b.status] || "#666" }}
                  >
                    <div className="flex justify-between items-start mb-1.5">
                      <div className="text-[13px] font-semibold text-white">{b.customer_name}</div>
                      <span
                        className="px-[7px] py-0.5 rounded-xl text-[9px] font-semibold capitalize whitespace-nowrap shrink-0 ml-1.5"
                        style={{
                          background: `${STATUS_COLORS[b.status] || "#666"}20`,
                          color: STATUS_COLORS[b.status] || "#666",
                        }}
                      >
                        {b.status.replace("_", " ")}
                      </span>
                    </div>
                    <div className="text-[11px] text-white/50 mb-0.5">{b.customer_phone}</div>
                    {b.car_make && (
                      <div className="text-[11px] text-white/40">
                        {b.car_make} &middot; {b.car_size}
                      </div>
                    )}
                    <div className="flex justify-between items-center mt-2">
                      <span className="text-[13px] font-bold text-white">
                        {(b.total || 0).toLocaleString()} SAR
                      </span>
                      <div className="flex gap-1.5">
                        <a
                          href={`tel:${b.customer_phone}`}
                          title="Call"
                          className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-500"
                        >
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>
                          </svg>
                        </a>
                        <a
                          href={`https://wa.me/${b.customer_phone.replace(/[^0-9]/g, "")}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="WhatsApp"
                          className="inline-flex items-center justify-center w-7 h-7 rounded-lg bg-green-500/10 border border-green-500/20 text-green-500"
                        >
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
        <div className="bg-[#111] border border-white/[0.06] rounded-xl p-4 mt-3">
          <h2 className="text-sm font-semibold text-gold mb-3">
            {"Today's Bookings"} ({todayBookings.length})
          </h2>
          <div className="flex flex-col gap-2">
            {todayBookings.map((b) => (
              <div
                key={b.id}
                className="p-3 bg-white/[0.03] border border-white/[0.06] rounded-xl border-l-[3px] flex justify-between items-center gap-2"
                style={{ borderLeftColor: STATUS_COLORS[b.status] || "#666" }}
              >
                <div className="min-w-0">
                  <div className="text-[13px] font-semibold text-white overflow-hidden text-ellipsis whitespace-nowrap">
                    {b.customer_name}
                  </div>
                  <div className="text-[11px] text-white/40 mt-0.5">
                    {b.car_make || b.car_size} &middot; {(b.total || 0).toLocaleString()} SAR
                  </div>
                </div>
                <span
                  className="px-2 py-0.5 rounded-xl text-[9px] font-semibold capitalize whitespace-nowrap shrink-0"
                  style={{
                    background: `${STATUS_COLORS[b.status] || "#666"}20`,
                    color: STATUS_COLORS[b.status] || "#666",
                  }}
                >
                  {b.status.replace("_", " ")}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
