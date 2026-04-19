"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, Lock, ArrowRight, ArrowLeft, AlertCircle, Loader2 } from "lucide-react";

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
    <div className="admin-theme relative min-h-screen flex items-center justify-center p-6 overflow-hidden">
      {/* Ambient gold orb (single, subtle) */}
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 w-[700px] h-[700px] rounded-full blur-3xl opacity-[0.06]"
        style={{
          background: "radial-gradient(circle, #F6BE00 0%, transparent 65%)",
          transform: "translate(-50%, -50%)",
        }}
      />
      {/* Subtle grid */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "linear-gradient(var(--ad-border) 1px, transparent 1px), linear-gradient(90deg, var(--ad-border) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      <form
        onSubmit={handleSubmit}
        className="relative z-10 w-full max-w-[420px] bg-[var(--ad-surface)] border border-[var(--ad-border)] rounded-[16px] p-7 sm:p-9"
        style={{
          boxShadow:
            "0 40px 120px rgba(0,0,0,0.65), 0 0 0 1px rgba(255,255,255,0.02), inset 0 1px 0 rgba(255,255,255,0.04)",
        }}
      >
        {/* Brand + lock chip */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-3 mb-5">
            <span
              className="text-[26px] font-bold text-[var(--ad-accent)] tracking-tight leading-none"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              NICK
            </span>
            <span className="w-px h-5 bg-[var(--ad-border-strong)]" />
            <span className="text-[11px] uppercase tracking-[0.22em] font-semibold text-[var(--ad-fg-muted)]">
              Admin
            </span>
          </Link>
          <div className="inline-flex items-center gap-1.5 px-3 h-6 rounded-full bg-[var(--ad-accent-bg)] border border-[var(--ad-border-accent)] text-[var(--ad-accent)] mb-4">
            <Lock className="w-3 h-3" />
            <span className="text-[10px] font-semibold tracking-[0.18em] uppercase">Secure Access</span>
          </div>
          <h1 className="text-[22px] font-semibold tracking-tight text-[var(--ad-fg)]">Sign in</h1>
          <p className="mt-1.5 text-[13px] text-[var(--ad-fg-muted)]">
            Manage bookings, team, and content
          </p>
        </div>

        {error && (
          <div className="mb-5 flex items-start gap-2.5 px-3.5 py-3 rounded-[10px] bg-[var(--ad-danger-bg)] border border-[color:rgba(239,68,68,0.25)] text-[var(--ad-danger)] text-[13px]">
            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="space-y-5">
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wide text-[var(--ad-fg-subtle)] mb-2">
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
              className="w-full h-11 px-3.5 text-[14px] rounded-[10px] bg-[var(--ad-surface-2)] border border-[var(--ad-border)] text-[var(--ad-fg)] placeholder:text-[var(--ad-fg-faint)] transition-colors hover:border-[var(--ad-border-strong)] focus:border-[var(--ad-accent)] focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wide text-[var(--ad-fg-subtle)] mb-2">
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
                className="w-full h-11 px-3.5 pr-11 text-[14px] rounded-[10px] bg-[var(--ad-surface-2)] border border-[var(--ad-border)] text-[var(--ad-fg)] placeholder:text-[var(--ad-fg-faint)] transition-colors hover:border-[var(--ad-border-strong)] focus:border-[var(--ad-accent)] focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute inset-y-0 right-0 flex items-center px-3.5 text-[var(--ad-fg-subtle)] hover:text-[var(--ad-accent)] transition-colors"
                tabIndex={-1}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || !username || !password}
          className="mt-7 w-full h-11 flex items-center justify-center gap-2 rounded-[10px] text-[13px] font-semibold text-black bg-[var(--ad-accent)] hover:bg-[var(--ad-accent-hover)] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          style={{ boxShadow: "0 8px 22px rgba(246,190,0,0.18)" }}
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Signing in…
            </>
          ) : (
            <>
              Sign in
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>

        <div className="mt-6 pt-5 border-t border-[var(--ad-border)] text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-[12px] text-[var(--ad-fg-subtle)] hover:text-[var(--ad-accent)] transition-colors"
          >
            <ArrowLeft className="w-3 h-3" />
            Back to nick.sa
          </Link>
        </div>
      </form>
    </div>
  );
}
