"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

const NAV_ITEMS = [
  { label: "Dashboard", href: "/admin", icon: "grid" },
  { label: "Bookings", href: "/admin/bookings", icon: "calendar" },
  { label: "Services", href: "/admin/services", icon: "layers" },
  { label: "Packages", href: "/admin/packages", icon: "package" },
  { label: "Settings", href: "/admin/settings", icon: "settings" },
];

function NavIcon({ icon, size = 18 }: { icon: string; size?: number }) {
  const s = { width: size, height: size, strokeWidth: 1.5, fill: "none", stroke: "currentColor" };
  switch (icon) {
    case "grid":
      return (
        <svg {...s} viewBox="0 0 24 24">
          <rect x="3" y="3" width="7" height="7" rx="1.5" />
          <rect x="14" y="3" width="7" height="7" rx="1.5" />
          <rect x="3" y="14" width="7" height="7" rx="1.5" />
          <rect x="14" y="14" width="7" height="7" rx="1.5" />
        </svg>
      );
    case "calendar":
      return (
        <svg {...s} viewBox="0 0 24 24">
          <rect x="3" y="4" width="18" height="18" rx="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
      );
    case "layers":
      return (
        <svg {...s} viewBox="0 0 24 24">
          <polygon points="12 2 2 7 12 12 22 7 12 2" />
          <polyline points="2 17 12 22 22 17" />
          <polyline points="2 12 12 17 22 12" />
        </svg>
      );
    case "package":
      return (
        <svg {...s} viewBox="0 0 24 24">
          <path d="M16.5 9.4l-9-5.19M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z" />
          <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
          <line x1="12" y1="22.08" x2="12" y2="12" />
        </svg>
      );
    case "settings":
      return (
        <svg {...s} viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
        </svg>
      );
    default:
      return null;
  }
}

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
          background: "#050505",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "rgba(255,255,255,0.4)",
          fontSize: 14,
        }}
      >
        Loading...
      </div>
    );
  }

  function isActive(href: string) {
    if (href === "/admin") return pathname === "/admin";
    return pathname.startsWith(href);
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#050505" }}>
      {/* Mobile overlay */}
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
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          bottom: 0,
          width: 240,
          background: "#111",
          borderRight: "1px solid rgba(255,255,255,0.06)",
          zIndex: 50,
          transition: "transform 0.2s ease",
          display: "flex",
          flexDirection: "column",
        }}
        className={`admin-sidebar${sidebarOpen ? " admin-sidebar-open" : ""}`}
      >
        <div
          style={{
            padding: "24px 20px",
            borderBottom: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          <span
            style={{
              fontSize: 22,
              fontWeight: 800,
              color: "#F6BE00",
              letterSpacing: "0.08em",
            }}
          >
            NICK
          </span>
          <span
            style={{
              fontSize: 11,
              color: "rgba(255,255,255,0.4)",
              marginLeft: 8,
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            }}
          >
            Admin
          </span>
        </div>

        <nav style={{ flex: 1, padding: "12px 10px" }}>
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
                  gap: 12,
                  padding: "10px 14px",
                  borderRadius: 10,
                  marginBottom: 4,
                  fontSize: 14,
                  fontWeight: active ? 600 : 400,
                  color: active ? "#F6BE00" : "rgba(255,255,255,0.6)",
                  background: active ? "rgba(246,190,0,0.08)" : "transparent",
                  textDecoration: "none",
                  transition: "all 0.15s",
                  cursor: "pointer",
                }}
              >
                <NavIcon icon={item.icon} />
                {item.label}
              </a>
            );
          })}
        </nav>

        <div style={{ padding: "16px 10px", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
          <button
            onClick={handleLogout}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              width: "100%",
              padding: "10px 14px",
              background: "transparent",
              border: "none",
              borderRadius: 10,
              color: "rgba(255,255,255,0.5)",
              fontSize: 14,
              cursor: "pointer",
              transition: "color 0.15s",
            }}
          >
            <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            Logout
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div style={{ flex: 1, marginLeft: 240, minWidth: 0 }} className="admin-main">
        {/* Top bar (mobile) */}
        <div
          className="admin-topbar"
          style={{
            display: "none",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "12px 16px",
            background: "#111",
            borderBottom: "1px solid rgba(255,255,255,0.06)",
            position: "sticky",
            top: 0,
            zIndex: 30,
          }}
        >
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            style={{
              background: "transparent",
              border: "none",
              color: "#fff",
              cursor: "pointer",
              padding: 4,
            }}
          >
            <svg width={24} height={24} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
          <span style={{ fontWeight: 700, color: "#F6BE00", letterSpacing: "0.05em" }}>
            NICK Admin
          </span>
          <button
            onClick={handleLogout}
            style={{
              background: "transparent",
              border: "none",
              color: "rgba(255,255,255,0.5)",
              cursor: "pointer",
              fontSize: 12,
              textTransform: "uppercase",
            }}
          >
            Logout
          </button>
        </div>

        <main style={{ padding: 24 }}>{children}</main>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .admin-sidebar {
            transform: translateX(-100%);
          }
          .admin-sidebar-open {
            transform: translateX(0) !important;
          }
          .admin-main {
            margin-left: 0 !important;
          }
          .admin-topbar {
            display: flex !important;
          }
        }
      `}</style>
    </div>
  );
}
