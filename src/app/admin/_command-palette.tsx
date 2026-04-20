"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";

interface BookingHit {
  id: string;
  confirmation_number: string | null;
  customer_name: string;
  customer_phone: string;
  total: number;
  status: string;
}

interface Action {
  id: string;
  label: string;
  shortcut?: string;
  hint?: string;
  perform: () => void;
}

const NAV_ACTIONS = (router: ReturnType<typeof useRouter>): Action[] => [
  { id: "nav-dash", label: "Go to Dashboard", hint: "/admin", perform: () => router.push("/admin") },
  { id: "nav-book", label: "Go to Bookings", hint: "/admin/bookings", perform: () => router.push("/admin/bookings") },
  { id: "nav-svc", label: "Go to Services", hint: "/admin/services", perform: () => router.push("/admin/services") },
  { id: "nav-pkg", label: "Go to Packages", hint: "/admin/packages", perform: () => router.push("/admin/packages") },
  { id: "nav-set", label: "Go to Settings", hint: "/admin/settings", perform: () => router.push("/admin/settings") },
];

export default function CommandPalette() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [bookings, setBookings] = useState<BookingHit[]>([]);
  const [activeIdx, setActiveIdx] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Global hotkey: Cmd+K / Ctrl+K
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen(o => !o);
      }
      if (e.key === "Escape" && open) setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  // Fetch bookings on open (lightweight in-memory search)
  useEffect(() => {
    if (!open) return;
    fetch("/api/bookings").then(r => r.json()).then((d: BookingHit[]) => {
      if (Array.isArray(d)) setBookings(d);
    }).catch(() => {});
    setTimeout(() => inputRef.current?.focus(), 50);
  }, [open]);

  const navActions = useMemo(() => NAV_ACTIONS(router), [router]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    const navMatches = q
      ? navActions.filter(a => a.label.toLowerCase().includes(q))
      : navActions;
    let bookingMatches: Action[] = [];
    if (q.length >= 2) {
      bookingMatches = bookings
        .filter(b =>
          (b.confirmation_number || "").toLowerCase().includes(q) ||
          b.customer_name.toLowerCase().includes(q) ||
          b.customer_phone.includes(q),
        )
        .slice(0, 8)
        .map(b => ({
          id: `b-${b.id}`,
          label: `${b.confirmation_number || b.id.slice(0, 8)} · ${b.customer_name}`,
          hint: `${b.customer_phone} · ${b.total.toLocaleString()} SAR · ${b.status}`,
          perform: () => router.push(`/admin/bookings#${b.id}`),
        }));
    }
    return [...bookingMatches, ...navMatches];
  }, [query, bookings, navActions, router]);

  useEffect(() => { setActiveIdx(0); }, [query]);

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") { e.preventDefault(); setActiveIdx(i => Math.min(i + 1, results.length - 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setActiveIdx(i => Math.max(i - 1, 0)); }
    else if (e.key === "Enter") {
      e.preventDefault();
      const action = results[activeIdx];
      if (action) { action.perform(); setOpen(false); setQuery(""); }
    }
  }

  if (!open) return null;

  return (
    <div
      onClick={() => setOpen(false)}
      style={{
        position: "fixed", inset: 0, zIndex: 200,
        background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)",
        display: "flex", alignItems: "flex-start", justifyContent: "center",
        paddingTop: "12vh", paddingLeft: 16, paddingRight: 16,
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: "#0a0a0a", border: "1px solid rgba(246,190,0,0.25)",
          borderRadius: 14, width: "100%", maxWidth: 560,
          boxShadow: "0 20px 80px rgba(0,0,0,0.7)",
          overflow: "hidden",
        }}
      >
        <div style={{ padding: "12px 16px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
          <input
            ref={inputRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Search bookings, navigate…"
            style={{
              width: "100%", background: "transparent", border: "none", outline: "none",
              color: "#f5f5f5", fontSize: 16,
            }}
          />
        </div>
        <div style={{ maxHeight: "50vh", overflowY: "auto", padding: 6 }}>
          {results.length === 0 && (
            <div style={{ padding: "20px 14px", color: "rgba(255,255,255,0.4)", fontSize: 13, textAlign: "center" }}>
              No results
            </div>
          )}
          {results.map((a, i) => (
            <button
              key={a.id}
              onMouseEnter={() => setActiveIdx(i)}
              onClick={() => { a.perform(); setOpen(false); setQuery(""); }}
              style={{
                display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12,
                width: "100%", padding: "10px 12px", borderRadius: 8,
                background: i === activeIdx ? "rgba(246,190,0,0.1)" : "transparent",
                border: "none", cursor: "pointer", textAlign: "left",
                color: "#f5f5f5", fontSize: 13,
              }}
            >
              <span style={{ fontWeight: 600 }}>{a.label}</span>
              {a.hint && <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 11, fontFamily: "'Space Grotesk', sans-serif" }}>{a.hint}</span>}
            </button>
          ))}
        </div>
        <div style={{ padding: "8px 14px", borderTop: "1px solid rgba(255,255,255,0.06)", display: "flex", gap: 14, color: "rgba(255,255,255,0.35)", fontSize: 10 }}>
          <span>↑↓ navigate</span><span>↵ open</span><span>esc close</span>
          <span style={{ marginLeft: "auto" }}>⌘K toggle</span>
        </div>
      </div>
    </div>
  );
}
