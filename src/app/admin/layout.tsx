"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  LayoutDashboard,
  CalendarCheck,
  Wrench,
  Package,
  Settings,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { ToastProvider } from "./_ui";

type Role = "super_admin" | "manager" | "reception" | "technician";

interface Me {
  username: string;
  full_name: string | null;
  role: Role;
}

const ROLE_LABELS: Record<Role, string> = {
  super_admin: "Super Admin",
  manager: "Manager",
  reception: "Reception",
  technician: "Technician",
};

const NAV_ITEMS = [
  { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { label: "Bookings", href: "/admin/bookings", icon: CalendarCheck },
  { label: "Services", href: "/admin/services", icon: Wrench },
  { label: "Packages", href: "/admin/packages", icon: Package },
  { label: "Settings", href: "/admin/settings", icon: Settings },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [checking, setChecking] = useState(true);
  const [authed, setAuthed] = useState(false);
  const [me, setMe] = useState<Me | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    fetch("/api/auth")
      .then(async (r) => {
        if (!r.ok) {
          router.replace("/login");
          return;
        }
        const data = await r.json();
        setMe(data);
        setAuthed(true);
      })
      .catch(() => router.replace("/login"))
      .finally(() => setChecking(false));
  }, [router]);

  async function handleLogout() {
    await fetch("/api/auth", { method: "DELETE" });
    router.replace("/login");
  }

  if (checking || !authed || !me) {
    return (
      <div className="admin-theme min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div
            className="w-8 h-8 rounded-full border-2 border-[color:rgba(246,190,0,0.25)] border-t-[var(--ad-accent)]"
            style={{ animation: "spin 0.8s linear infinite" }}
          />
          <span className="text-[13px] text-[var(--ad-fg-subtle)]">Loading...</span>
        </div>
      </div>
    );
  }

  function isActive(href: string) {
    if (href === "/admin") return pathname === "/admin";
    return pathname.startsWith(href);
  }

  const initials = (me.full_name || me.username).trim().split(/\s+/).map((p) => p[0]).slice(0, 2).join("").toUpperCase() || "A";

  return (
    <ToastProvider>
      <div dir="ltr" className="admin-theme flex min-h-screen">
        {/* Mobile backdrop */}
        {sidebarOpen && (
          <div
            onClick={() => setSidebarOpen(false)}
            className="fixed inset-0 bg-black/60 z-40 lg:hidden"
          />
        )}

        {/* Sidebar */}
        <aside
          className={`fixed top-0 left-0 bottom-0 z-50 w-[220px] flex flex-col bg-[var(--ad-surface)] border-r border-[var(--ad-border)] admin-sidebar-hidden admin-sidebar-visible${sidebarOpen ? " admin-sidebar-show" : ""}`}
          style={{ transition: "transform 0.2s ease-out" }}
        >
          {/* Logo */}
          <div className="px-6 pt-6 pb-7">
            <span
              className="block text-[26px] font-bold text-[var(--ad-accent)] tracking-tight"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              NICK
            </span>
            <span className="block text-[11px] uppercase tracking-[0.2em] text-[var(--ad-fg-faint)] mt-0.5">
              Admin
            </span>
          </div>

          {/* Nav */}
          <nav className="flex-1 px-3 flex flex-col gap-1">
            {NAV_ITEMS.map((item) => {
              const active = isActive(item.href);
              const Icon = item.icon;
              return (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={(e) => {
                    e.preventDefault();
                    router.push(item.href);
                    setSidebarOpen(false);
                  }}
                  className={`flex items-center gap-3 h-10 px-3 rounded-[8px] text-[13px] font-medium transition-colors ${
                    active
                      ? "bg-[var(--ad-accent-bg)] text-[var(--ad-accent)]"
                      : "text-[var(--ad-fg-muted)] hover:text-[var(--ad-fg)] hover:bg-[var(--ad-surface-2)]"
                  }`}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  {item.label}
                </a>
              );
            })}
          </nav>

          {/* User identity at bottom */}
          <div className="mx-3 mb-4 p-3 rounded-[10px] bg-[var(--ad-surface-2)] border border-[var(--ad-border)]">
            <div className="flex items-center gap-2.5">
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center text-[13px] font-bold text-black flex-shrink-0"
                style={{ background: "linear-gradient(135deg, #F6BE00, #D4A300)" }}
              >
                {initials}
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-[13px] font-medium text-[var(--ad-fg)] truncate">
                  {me.full_name || me.username}
                </div>
                <div className="text-[11px] text-[var(--ad-fg-subtle)] truncate">
                  {ROLE_LABELS[me.role]}
                </div>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="mt-2.5 w-full flex items-center justify-center gap-2 h-8 rounded-[6px] text-[12px] font-medium text-[var(--ad-fg-muted)] hover:text-[var(--ad-fg)] hover:bg-[var(--ad-surface-hover)] border border-[var(--ad-border)] transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              Sign out
            </button>
          </div>
        </aside>

        {/* Main */}
        <div className="flex-1 min-w-0 admin-content">
          {/* Mobile topbar */}
          <div className="admin-topbar sticky top-0 z-30 flex items-center justify-between px-4 py-3 bg-[var(--ad-surface)] border-b border-[var(--ad-border)]">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="text-[var(--ad-fg)] w-9 h-9 inline-flex items-center justify-center rounded-[8px] hover:bg-[var(--ad-surface-2)]"
              aria-label="Open menu"
            >
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <span className="text-[14px] font-bold text-[var(--ad-accent)] tracking-wider">NICK Admin</span>
            <div className="w-9 h-9" />
          </div>

          {/* Page content */}
          <main className="px-6 lg:px-8 pb-12">{children}</main>
        </div>
      </div>
    </ToastProvider>
  );
}
