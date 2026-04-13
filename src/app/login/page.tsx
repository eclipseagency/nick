"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";

function EyeIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function EyeOffIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
      <line x1="1" y1="1" x2="23" y2="23" />
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
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-5">
      <form
        onSubmit={handleSubmit}
        className="bg-[#111] border border-white/[0.06] rounded-2xl p-10 w-full max-w-[400px]"
      >
        <div className="text-center mb-8">
          <h1 className="text-[28px] font-extrabold text-gold tracking-widest mb-2">
            NICK
          </h1>
          <p className="text-white/50 text-sm">Admin Dashboard</p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg px-3.5 py-2.5 mb-5 text-red-500 text-sm">
            {error}
          </div>
        )}

        <div className="mb-4">
          <label className="block text-xs text-white/50 mb-1.5 uppercase tracking-wider">
            Username
          </label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            autoFocus
            className="w-full px-3.5 py-3 bg-[#050505] border border-white/10 rounded-xl text-white text-sm outline-none transition focus:border-gold/50 focus:ring-1 focus:ring-gold/20"
          />
        </div>

        <div className="mb-6">
          <label className="block text-xs text-white/50 mb-1.5 uppercase tracking-wider">
            Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-3.5 py-3 pr-11 bg-[#050505] border border-white/10 rounded-xl text-white text-sm outline-none transition focus:border-gold/50 focus:ring-1 focus:ring-gold/20"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute inset-y-0 right-0 flex items-center px-3 text-white/40 hover:text-white/70 transition"
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
          className="w-full py-3.5 px-7 bg-gold hover:bg-gold-light text-black font-bold text-sm uppercase tracking-wider rounded-xl border-none cursor-pointer transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Signing in..." : "Sign In"}
        </button>
      </form>
    </div>
  );
}
