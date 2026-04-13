"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

const NAV_ITEMS = [
  { label: "Dashboard", href: "/admin" },
  { label: "Bookings", href: "/admin/bookings" },
  { label: "Services", href: "/admin/services" },
  { label: "Settings", href: "/admin/settings" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [authed, setAuthed] = useState(false);
  const [checking, setChecking] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    fetch("/api/auth")
      .then((r) => {
        if (!r.ok) {
          router.replace("/login");
          return;
        }
        setAuthed(true);
      })
      .catch(() => router.replace("/login"))
      .finally(() => setChecking(false));
  }, [router]);

  async function handleLogout() {
    await fetch("/api/auth", { method: "DELETE" });
    router.replace("/login");
  }

  if (checking || !authed) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#020202",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
          <div
            style={{
              width: 32,
              height: 32,
              border: "2px solid rgba(246,190,0,0.3)",
              borderTopColor: "#F6BE00",
              borderRadius: "50%",
              animation: "spin 0.8s linear infinite",
            }}
          />
          <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 14 }}>Loading...</span>
        </div>
      </div>
    );
  }

  function isActive(href: string) {
    if (href === "/admin") return pathname === "/admin";
    return pathname.startsWith(href);
  }

  return (
    <div dir="ltr" className="flex min-h-screen" style={{ background: "#020202" }}>
      {/* Mobile overlay backdrop */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.6)",
            zIndex: 40,
          }}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 bottom-0 z-50 flex flex-col admin-sidebar-hidden admin-sidebar-visible${sidebarOpen ? " admin-sidebar-show" : ""}`}
        style={{
          width: 220,
          background: "#0a0a0a",
          borderRight: "1px solid rgba(255,255,255,0.06)",
          transition: "transform 0.2s ease-out",
        }}
      >
        {/* Logo */}
        <div style={{ padding: "8px 24px 28px" }}>
          <span
            style={{
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: 28,
              fontWeight: 700,
              color: "#F6BE00",
              display: "block",
            }}
          >
            NICK
          </span>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, display: "flex", flexDirection: "column", gap: 2 }}>
          {NAV_ITEMS.map((item) => {
            const active = isActive(item.href);
            return (
              <a
                key={item.href}
                href={item.href}
                onClick={(e) => {
                  e.preventDefault();
                  router.push(item.href);
                  setSidebarOpen(false);
                }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "10px 24px",
                  fontSize: 13.5,
                  fontWeight: active ? 700 : 500,
                  color: active ? "#F6BE00" : "rgba(255,255,255,0.55)",
                  background: active ? "rgba(246,190,0,0.08)" : "transparent",
                  borderLeft: `3px solid ${active ? "#F6BE00" : "transparent"}`,
                  textDecoration: "none",
                  transition: "all 0.2s",
                  cursor: "pointer",
                }}
                onMouseEnter={(e) => {
                  if (!active) {
                    (e.currentTarget as HTMLAnchorElement).style.color = "#ffffff";
                    (e.currentTarget as HTMLAnchorElement).style.background = "rgba(255,255,255,0.02)";
                  }
                }}
                onMouseLeave={(e) => {
                  if (!active) {
                    (e.currentTarget as HTMLAnchorElement).style.color = "rgba(255,255,255,0.55)";
                    (e.currentTarget as HTMLAnchorElement).style.background = "transparent";
                  }
                }}
              >
                <span
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: 3,
                    flexShrink: 0,
                    background: active ? "#F6BE00" : "rgba(255,255,255,0.1)",
                    transition: "background 0.2s",
                  }}
                />
                {item.label}
              </a>
            );
          })}
        </nav>

        {/* Bottom status */}
        <div
          style={{
            padding: "16px 24px",
            borderTop: "1px solid rgba(255,255,255,0.06)",
            fontSize: 12,
            color: "rgba(255,255,255,0.3)",
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: "#10B981",
              flexShrink: 0,
            }}
          />
          Connected
        </div>
      </aside>

      {/* Main area */}
      <div className="flex-1 min-w-0 admin-content">
        {/* Mobile top bar — hidden on desktop via admin-topbar class */}
        <div
          className="admin-topbar"
          style={{
            position: "sticky",
            top: 0,
            zIndex: 30,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "12px 16px",
            background: "#0a0a0a",
            borderBottom: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            style={{
              background: "transparent",
              border: "none",
              color: "#ffffff",
              cursor: "pointer",
              padding: 4,
              display: "flex",
              alignItems: "center",
            }}
          >
            <svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
          <span style={{ fontWeight: 700, color: "#F6BE00", letterSpacing: "0.05em" }}>NICK Admin</span>
          <button
            onClick={handleLogout}
            style={{
              background: "transparent",
              border: "none",
              color: "rgba(255,255,255,0.5)",
              cursor: "pointer",
              fontSize: 11,
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            }}
          >
            Logout
          </button>
        </div>

        {/* Desktop top bar — hidden on mobile via admin-desktop-topbar class */}
        <div
          className="admin-desktop-topbar"
          style={{
            alignItems: "center",
            justifyContent: "flex-end",
            padding: "16px 28px",
            gap: 12,
            position: "relative",
            zIndex: 1,
          }}
        >
          {/* Search */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.06)",
              borderRadius: 8,
              padding: "8px 14px",
              minWidth: 200,
            }}
          >
            <span style={{ color: "rgba(255,255,255,0.3)", fontSize: 13 }}>🔍 Search...</span>
          </div>

          {/* Notification bell */}
          <div
            style={{
              position: "relative",
              width: 36,
              height: 36,
              borderRadius: 8,
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.06)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "rgba(255,255,255,0.55)",
              fontSize: 16,
              cursor: "pointer",
              flexShrink: 0,
            }}
          >
            🔔
            <span
              style={{
                position: "absolute",
                top: 6,
                right: 6,
                width: 7,
                height: 7,
                borderRadius: "50%",
                background: "#ef4444",
              }}
            />
          </div>

          {/* User pill */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.06)",
              borderRadius: 8,
              padding: "6px 12px 6px 8px",
              cursor: "pointer",
            }}
          >
            <div
              style={{
                width: 28,
                height: 28,
                borderRadius: "50%",
                background: "linear-gradient(135deg, #F6BE00, #D4A300)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 12,
                fontWeight: 700,
                color: "#000",
                flexShrink: 0,
              }}
            >
              A
            </div>
            <span style={{ fontSize: 13, color: "rgba(255,255,255,0.55)" }}>Admin</span>
          </div>

          {/* Logout */}
          <button
            onClick={handleLogout}
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.06)",
              borderRadius: 8,
              padding: "8px 14px",
              fontSize: 13,
              color: "rgba(255,255,255,0.4)",
              cursor: "pointer",
              transition: "all 0.2s",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.color = "#ffffff";
              (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(255,255,255,0.15)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.color = "rgba(255,255,255,0.4)";
              (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(255,255,255,0.06)";
            }}
          >
            Logout
          </button>
        </div>

        {/* Page content */}
        <main style={{ padding: "0 28px 28px", position: "relative", zIndex: 1 }}>
          {children}
        </main>
      </div>
    </div>
  );
}
