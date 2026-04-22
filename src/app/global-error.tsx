"use client";

import * as Sentry from "@sentry/nextjs";
import { useEffect, useState } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const [isAr, setIsAr] = useState(false);
  useEffect(() => {
    Sentry.captureException(error);
    try {
      const lang = new URLSearchParams(location.search).get("lang") || localStorage.getItem("nick-lang");
      setIsAr(lang === "ar");
    } catch { /* ignore */ }
  }, [error]);

  return (
    <html lang={isAr ? "ar" : "en"} dir={isAr ? "rtl" : "ltr"}>
      <body style={{ margin: 0 }}>
        <main
          style={{
            minHeight: "100vh",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            background: "#050505",
            color: "#fff",
            padding: "40px 24px",
            textAlign: "center",
            fontFamily: "system-ui, -apple-system, sans-serif",
          }}
        >
          <div
            style={{
              width: 72, height: 72, borderRadius: "50%",
              background: "rgba(244,67,54,0.1)", border: "1px solid rgba(244,67,54,0.3)",
              display: "flex", alignItems: "center", justifyContent: "center",
              marginBottom: 20,
            }}
          >
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#FCA5A5" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>
          <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 10 }}>
            {isAr ? "حدث خطأ غير متوقع" : "Something went wrong"}
          </h1>
          <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 14, maxWidth: 420, marginBottom: 24, lineHeight: 1.6 }}>
            {isAr ? "تم إخطار فريقنا. حاول إعادة تحميل الصفحة، وإذا استمرت المشكلة تواصل معنا." : "Our team has been notified. Please try refreshing — if the issue persists, contact us."}
          </p>
          {error.digest && (
            <code style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", marginBottom: 20, fontFamily: "monospace" }}>
              {isAr ? "رقم المرجع" : "Ref"}: {error.digest}
            </code>
          )}
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center" }}>
            <button
              onClick={reset}
              style={{
                padding: "12px 26px", borderRadius: 10, cursor: "pointer",
                background: "#F6BE00", border: "none", color: "#000",
                fontSize: 13, fontWeight: 700,
              }}
            >
              {isAr ? "حاول مرة أخرى" : "Try Again"}
            </button>
            <a
              href="/"
              style={{
                padding: "12px 26px", borderRadius: 10,
                background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.15)",
                color: "#fff", fontSize: 13, fontWeight: 600, textDecoration: "none",
              }}
            >
              {isAr ? "الرئيسية" : "Go Home"}
            </a>
          </div>
        </main>
      </body>
    </html>
  );
}
