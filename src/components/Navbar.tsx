"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", fn);
    return () => window.removeEventListener("scroll", fn);
  }, []);

  const links = [
    { t: "Home", h: "#hero" },
    { t: "About", h: "#about" },
    { t: "Services", h: "#services" },
    { t: "Gallery", h: "#gallery" },
    { t: "Book", h: "#booking" },
    { t: "Contact", h: "#contact" },
  ];

  return (
    <nav style={{
      position: "fixed", top: 0, left: 0, right: 0, zIndex: 50,
      padding: scrolled ? "12px 0" : "20px 0",
      background: scrolled ? "rgba(5,5,5,0.95)" : "transparent",
      backdropFilter: scrolled ? "blur(20px)" : "none",
      borderBottom: scrolled ? "1px solid rgba(246,190,0,0.08)" : "none",
      transition: "all 0.4s",
    }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Link href="#hero">
          <Image src="/images/logo-white.png" alt="NICK" width={110} height={36} priority style={{ opacity: 0.95 }} />
        </Link>

        {/* Desktop */}
        <div className="hidden lg:flex" style={{ alignItems: "center", gap: 32 }}>
          {links.map((l) => (
            <Link key={l.t} href={l.h} style={{ color: "rgba(255,255,255,0.6)", fontSize: 13, fontWeight: 500, letterSpacing: "0.05em", textTransform: "uppercase" as const, textDecoration: "none", transition: "color 0.3s" }}
              onMouseEnter={e => (e.currentTarget.style.color = "#F6BE00")}
              onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.6)")}
            >{l.t}</Link>
          ))}
          <Link href="https://nick.sa" target="_blank" className="btn-gold" style={{ padding: "10px 20px", fontSize: 12 }}>Shop</Link>
        </div>

        {/* Mobile toggle */}
        <button onClick={() => setOpen(!open)} className="lg:hidden" style={{ background: "none", border: "none", cursor: "pointer", padding: 8, display: "flex", flexDirection: "column" as const, gap: 5 }}>
          <span style={{ width: 24, height: 2, background: "#F6BE00", transition: "all 0.3s", transform: open ? "rotate(45deg) translateY(7px)" : "none" }} />
          <span style={{ width: 24, height: 2, background: "#F6BE00", transition: "all 0.3s", opacity: open ? 0 : 1 }} />
          <span style={{ width: 24, height: 2, background: "#F6BE00", transition: "all 0.3s", transform: open ? "rotate(-45deg) translateY(-7px)" : "none" }} />
        </button>
      </div>

      {/* Mobile menu */}
      <div style={{
        maxHeight: open ? 400 : 0, overflow: "hidden", transition: "max-height 0.4s",
        background: "rgba(5,5,5,0.98)", borderTop: open ? "1px solid rgba(246,190,0,0.08)" : "none",
      }} className="lg:hidden">
        <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column" as const, gap: 16 }}>
          {links.map((l) => (
            <Link key={l.t} href={l.h} onClick={() => setOpen(false)} style={{ color: "rgba(255,255,255,0.6)", fontSize: 16, textDecoration: "none" }}>{l.t}</Link>
          ))}
        </div>
      </div>
    </nav>
  );
}
