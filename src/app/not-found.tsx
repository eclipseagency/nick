"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function NotFound() {
  const [isAr, setIsAr] = useState(false);
  useEffect(() => {
    try {
      const lang = new URLSearchParams(location.search).get("lang") || localStorage.getItem("nick-lang");
      setIsAr(lang === "ar");
    } catch { /* ignore */ }
  }, []);

  return (
    <main
      dir={isAr ? "rtl" : "ltr"}
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
        fontFamily: isAr ? "var(--font-ar)" : "var(--font-display)",
      }}
    >
      <div
        style={{
          fontSize: "clamp(80px, 18vw, 160px)",
          fontWeight: 900,
          background: "linear-gradient(135deg, #F6BE00, #D4A300)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          lineHeight: 1,
          letterSpacing: "-0.05em",
        }}
      >
        404
      </div>
      <h1 style={{ fontSize: "clamp(20px, 4vw, 28px)", fontWeight: 700, marginTop: 16, marginBottom: 10 }}>
        {isAr ? "الصفحة غير موجودة" : "Page Not Found"}
      </h1>
      <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 14, maxWidth: 420, marginBottom: 28, lineHeight: 1.6 }}>
        {isAr
          ? "الرابط الذي اتبعته لا يعمل أو تم نقله. تأكد من صحة الرابط أو ارجع للرئيسية."
          : "The link you followed doesn't work or has been moved. Check the URL or head back home."}
      </p>
      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center" }}>
        <Link href="/" className="btn-gold" style={{ padding: "12px 26px", textDecoration: "none" }}>
          {isAr ? "الرئيسية" : "Go Home"}
        </Link>
        <Link
          href="/booking"
          style={{
            padding: "12px 26px", borderRadius: 10,
            background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.15)",
            color: "#fff", fontSize: 13, fontWeight: 600, textDecoration: "none",
          }}
        >
          {isAr ? "احجز خدمة" : "Book a Service"}
        </Link>
        <Link
          href="/track"
          style={{
            padding: "12px 26px", borderRadius: 10,
            background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.15)",
            color: "#fff", fontSize: 13, fontWeight: 600, textDecoration: "none",
          }}
        >
          {isAr ? "تتبع حجز" : "Track Booking"}
        </Link>
      </div>
    </main>
  );
}
