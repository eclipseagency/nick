"use client";

import { useEffect, useState } from "react";

interface Booking {
  id: string;
  customer_name: string;
  customer_phone: string;
  car_size: string;
  service_ids: string[];
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

function formatDate(d: string) {
  const date = new Date(d);
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function timeAgo(d: string) {
  const now = Date.now();
  const diff = now - new Date(d).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return formatDate(d);
}

export default function AdminDashboard() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/bookings")
      .then((r) => r.json())
      .then((d) => {
        if (Array.isArray(d)) setBookings(d);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const totalRevenue = bookings
    .filter((b) => b.status !== "cancelled")
    .reduce((s, b) => s + (b.total || 0), 0);

  const pendingCount = bookings.filter((b) => b.status === "pending").length;

  const today = new Date().toDateString();
  const todayBookings = bookings.filter(
    (b) => new Date(b.created_at).toDateString() === today
  );

  const recent = bookings.slice(0, 5);

  const cardStyle: React.CSSProperties = {
    background: "#111",
    border: "1px solid rgba(246,190,0,0.15)",
    borderRadius: 14,
    padding: 24,
  };

  if (loading) {
    return (
      <div style={{ color: "rgba(255,255,255,0.4)", padding: 40, textAlign: "center" }}>
        Loading dashboard...
      </div>
    );
  }

  return (
    <div>
      <h1
        style={{
          fontSize: 24,
          fontWeight: 700,
          color: "#fff",
          marginBottom: 24,
        }}
      >
        Dashboard
      </h1>

      {/* Stats grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: 16,
          marginBottom: 32,
        }}
      >
        <div style={cardStyle}>
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8 }}>
            Total Bookings
          </div>
          <div style={{ fontSize: 36, fontWeight: 800, color: "#fff" }}>
            {bookings.length}
          </div>
          {pendingCount > 0 && (
            <div style={{ fontSize: 12, color: "#F6BE00", marginTop: 6 }}>
              {pendingCount} pending
            </div>
          )}
        </div>

        <div style={cardStyle}>
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8 }}>
            Total Revenue
          </div>
          <div style={{ fontSize: 36, fontWeight: 800, color: "#fff" }}>
            {totalRevenue.toLocaleString()}
          </div>
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginTop: 6 }}>
            SAR
          </div>
        </div>

        <div style={cardStyle}>
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 8 }}>
            {"Today's Bookings"}
          </div>
          <div style={{ fontSize: 36, fontWeight: 800, color: "#fff" }}>
            {todayBookings.length}
          </div>
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", marginTop: 6 }}>
            {new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "short" })}
          </div>
        </div>
      </div>

      {/* Recent bookings */}
      <div style={cardStyle}>
        <h2
          style={{
            fontSize: 16,
            fontWeight: 600,
            color: "#fff",
            marginBottom: 16,
          }}
        >
          Recent Bookings
        </h2>

        {recent.length === 0 ? (
          <div style={{ color: "rgba(255,255,255,0.3)", fontSize: 14, padding: "20px 0" }}>
            No bookings yet
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  {["Customer", "Phone", "Car", "Total", "Status", "Date"].map((h) => (
                    <th
                      key={h}
                      style={{
                        textAlign: "left",
                        padding: "8px 12px",
                        fontSize: 11,
                        color: "rgba(255,255,255,0.35)",
                        textTransform: "uppercase",
                        letterSpacing: "0.05em",
                        borderBottom: "1px solid rgba(255,255,255,0.06)",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {recent.map((b) => (
                  <tr key={b.id}>
                    <td style={{ padding: "10px 12px", fontSize: 14, color: "#fff" }}>
                      {b.customer_name}
                    </td>
                    <td style={{ padding: "10px 12px", fontSize: 13, color: "rgba(255,255,255,0.6)" }}>
                      {b.customer_phone}
                    </td>
                    <td style={{ padding: "10px 12px", fontSize: 13, color: "rgba(255,255,255,0.6)", textTransform: "capitalize" }}>
                      {b.car_size}
                    </td>
                    <td style={{ padding: "10px 12px", fontSize: 13, color: "#fff", whiteSpace: "nowrap" }}>
                      {(b.total || 0).toLocaleString()} SAR
                    </td>
                    <td style={{ padding: "10px 12px" }}>
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
                        }}
                      >
                        {b.status.replace("_", " ")}
                      </span>
                    </td>
                    <td style={{ padding: "10px 12px", fontSize: 12, color: "rgba(255,255,255,0.4)", whiteSpace: "nowrap" }}>
                      {timeAgo(b.created_at)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
