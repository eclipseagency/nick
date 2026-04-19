"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

function EyeIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Login failed");
        setLoading(false);
        return;
      }

      router.push("/admin");
    } catch {
      setError("Network error. Please try again.");
      setLoading(false);
    }
  }

  return (
    <div className="relative min-h-screen bg-[#050505] flex items-center justify-center p-5 overflow-hidden">
      {/* Ambient gold orbs */}
      <div
        className="pointer-events-none absolute -top-40 -left-40 w-[520px] h-[520px] rounded-full blur-3xl opacity-[0.18]"
        style={{ background: "radial-gradient(circle, #F6BE00 0%, transparent 70%)" }}
      />
      <div
        className="pointer-events-none absolute -bottom-40 -right-40 w-[520px] h-[520px] rounded-full blur-3xl opacity-[0.12]"
        style={{ background: "radial-gradient(circle, #D4A300 0%, transparent 70%)" }}
      />
      {/* Subtle grid */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      <form
        onSubmit={handleSubmit}
        className="relative z-10 w-full max-w-[420px] rounded-3xl p-9 sm:p-10 backdrop-blur-xl"
        style={{
          background: "linear-gradient(180deg, rgba(22,22,22,0.85) 0%, rgba(12,12,12,0.9) 100%)",
          border: "1px solid rgba(246,190,0,0.14)",
          boxShadow:
            "0 40px 100px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.02), inset 0 1px 0 rgba(255,255,255,0.04)",
        }}
      >
        {/* Top gold hairline */}
        <div
          className="absolute top-0 left-10 right-10 h-px"
          style={{
            background:
              "linear-gradient(90deg, transparent 0%, rgba(246,190,0,0.6) 50%, transparent 100%)",
          }}
        />

        {/* Logo + heading */}
        <div className="text-center mb-10">
          <Link href="/" className="inline-block mb-7 group">
            <Image
              src="/images/logo-white.png"
              alt="NICK"
              width={120}
              height={40}
              priority
              className="h-10 w-auto mx-auto transition-opacity duration-300 group-hover:opacity-80"
            />
          </Link>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full mb-4"
            style={{
              background: "rgba(246,190,0,0.08)",
              border: "1px solid rgba(246,190,0,0.2)",
              color: "#F6BE00",
            }}
          >
            <LockIcon />
            <span className="text-[10px] font-semibold tracking-[0.18em] uppercase">
              Secure Access
            </span>
          </div>
          <h1 className="text-2xl sm:text-[26px] font-bold text-white mb-1.5 tracking-tight">
            Admin Dashboard
          </h1>
          <p className="text-white/45 text-[13px]">
            Sign in to manage bookings & services
          </p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/25 rounded-xl px-4 py-3 mb-5 text-red-400 text-sm flex items-start gap-2">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 shrink-0">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        <div className="mb-5">
          <label className="block text-[11px] text-white/55 mb-2 uppercase tracking-[0.14em] font-semibold">
            Username
          </label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            autoFocus
            autoComplete="username"
            placeholder="admin"
            className="w-full px-4 py-3.5 bg-black/40 border border-white/[0.08] rounded-xl text-white text-sm outline-none transition-all duration-200 placeholder:text-white/20 focus:border-gold/40 focus:ring-2 focus:ring-gold/10 focus:bg-black/60"
          />
        </div>

        <div className="mb-7">
          <label className="block text-[11px] text-white/55 mb-2 uppercase tracking-[0.14em] font-semibold">
            Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              placeholder="••••••••"
              className="w-full px-4 py-3.5 pr-12 bg-black/40 border border-white/[0.08] rounded-xl text-white text-sm outline-none transition-all duration-200 placeholder:text-white/20 focus:border-gold/40 focus:ring-2 focus:ring-gold/10 focus:bg-black/60"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute inset-y-0 right-0 flex items-center px-4 text-white/35 hover:text-gold transition-colors"
              tabIndex={-1}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOffIcon /> : <EyeIcon />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="relative w-full py-3.5 px-7 text-black font-bold text-sm uppercase tracking-[0.12em] rounded-xl cursor-pointer transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden group"
          style={{
            background: "linear-gradient(135deg, #F6BE00 0%, #FFD54F 50%, #F6BE00 100%)",
            boxShadow: "0 10px 30px rgba(246,190,0,0.25), inset 0 1px 0 rgba(255,255,255,0.3)",
          }}
        >
          <span className="relative z-10 inline-flex items-center justify-center gap-2">
            {loading ? (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="animate-spin">
                  <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2.5" strokeOpacity="0.25" />
                  <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                </svg>
                Signing in…
              </>
            ) : (
              <>
                Sign In
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M5 3L9 7L5 11" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </>
            )}
          </span>
        </button>

        <div className="mt-8 pt-6 text-center border-t border-white/[0.05]">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-[11px] text-white/40 hover:text-gold transition-colors uppercase tracking-[0.14em]"
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M8 2L4 6L8 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Back to nick.sa
          </Link>
        </div>
      </form>
    </div>
  );
}
