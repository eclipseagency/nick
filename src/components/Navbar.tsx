"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useLanguage } from "@/i18n/LanguageContext";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { t, locale, toggleLocale } = useLanguage();

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  const links = [
    { t: t.nav.home, h: "/" },
    { t: t.nav.about, h: "/about" },
    { t: t.nav.services, h: "/services" },
    { t: t.nav.gallery, h: "/gallery" },
    { t: t.nav.contact, h: "/contact" },
    { t: t.nav.warranty, h: "/warranty" },
  ];

  const isAr = locale === "ar";
  const fontDisplay = isAr ? "var(--font-ar)" : "var(--font-display)";

  return (
    <nav style={{
      position: "fixed", top: 0, left: 0, right: 0, zIndex: 50,
      padding: scrolled ? "10px 0" : "14px 0",
      background: scrolled ? "rgba(5,5,5,0.95)" : "transparent",
      backdropFilter: scrolled ? "blur(20px)" : "none",
      borderBottom: scrolled ? "1px solid rgba(246,190,0,0.08)" : "none",
      transition: "all 0.4s",
    }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 clamp(16px, 4vw, 24px)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Link href="/" style={{ cursor: "pointer" }}>
          <Image src="/images/logo-white.png" alt="NICK" width={160} height={160} priority style={{ opacity: 0.95, height: 48, width: "auto" }} />
        </Link>

        {/* Desktop */}
        <div className="hidden lg:flex" style={{ alignItems: "center", gap: 32 }}>
          {links.map((l) => (
            <Link key={l.h} href={l.h} style={{ color: "rgba(255,255,255,0.6)", fontSize: 13, fontWeight: 500, letterSpacing: isAr ? "0" : "0.05em", textTransform: isAr ? "none" : "uppercase" as const, textDecoration: "none", transition: "color 0.3s", fontFamily: isAr ? fontDisplay : undefined }}
              onMouseEnter={e => (e.currentTarget.style.color = "#F6BE00")}
              onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.6)")}
            >{l.t}</Link>
          ))}
          {/* Language toggle */}
          <button onClick={toggleLocale} style={{
            background: "none", border: "1px solid rgba(246,190,0,0.3)", borderRadius: 8,
            padding: "6px 14px", color: "#F6BE00", fontSize: 12, fontWeight: 700,
            cursor: "pointer", transition: "all 0.3s", letterSpacing: "0.03em",
            fontFamily: isAr ? "var(--font-sans)" : "var(--font-ar)",
          }}
            onMouseEnter={e => { e.currentTarget.style.background = "rgba(246,190,0,0.1)"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "none"; }}
          >
            {isAr ? "EN" : "عربي"}
          </button>
          <Link href="/booking" className="btn-gold" style={{ padding: "10px 20px", fontSize: 12 }}>{t.nav.shop}</Link>
        </div>

        {/* Mobile toggle */}
        <button onClick={() => setOpen(!open)} className="lg:hidden flex flex-col" style={{ background: "none", border: "none", cursor: "pointer", padding: 8, gap: 5 }}>
          <span style={{ width: 24, height: 2, background: "#F6BE00", transition: "all 0.3s", transform: open ? "rotate(45deg) translateY(7px)" : "none" }} />
          <span style={{ width: 24, height: 2, background: "#F6BE00", transition: "all 0.3s", opacity: open ? 0 : 1 }} />
          <span style={{ width: 24, height: 2, background: "#F6BE00", transition: "all 0.3s", transform: open ? "rotate(-45deg) translateY(-7px)" : "none" }} />
        </button>
      </div>

      {/* Mobile menu */}
      <div style={{
        maxHeight: open ? 500 : 0, overflow: "hidden", transition: "max-height 0.4s",
        background: "rgba(5,5,5,0.98)", borderTop: open ? "1px solid rgba(246,190,0,0.08)" : "none",
      }} className="lg:hidden">
        <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column" as const, gap: 16 }}>
          {links.map((l) => (
            <Link key={l.h} href={l.h} onClick={() => setOpen(false)} style={{ color: "rgba(255,255,255,0.6)", fontSize: 16, textDecoration: "none", fontFamily: isAr ? fontDisplay : undefined }}>{l.t}</Link>
          ))}
          {/* Mobile language toggle */}
          <button onClick={() => { toggleLocale(); setOpen(false); }} style={{
            background: "none", border: "1px solid rgba(246,190,0,0.3)", borderRadius: 8,
            padding: "10px 18px", color: "#F6BE00", fontSize: 14, fontWeight: 700,
            cursor: "pointer", alignSelf: "flex-start",
            fontFamily: isAr ? "var(--font-sans)" : "var(--font-ar)",
          }}>
            {isAr ? "EN — English" : "عربي — Arabic"}
          </button>
        </div>
      </div>
    </nav>
  );
}
