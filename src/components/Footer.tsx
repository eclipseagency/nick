"use client";

import Image from "next/image";
import Link from "next/link";
import { useLanguage } from "@/i18n/LanguageContext";

export default function Footer() {
  const { t, locale } = useLanguage();
  const isAr = locale === "ar";

  const services = [t.footer.s1, t.footer.s2, t.footer.s3, t.footer.s4];
  const company = [
    { l: t.footer.about, h: "#about" },
    { l: t.footer.galleryLink, h: "#gallery" },
    { l: t.footer.bookNow, h: "#booking" },
    { l: t.footer.store, h: "https://nick.sa" },
  ];

  return (
    <footer style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "48px 24px" }}>
        <div className="grid md:grid-cols-4 gap-10">
          <div>
            <Image src="/images/logo-white.png" alt="NICK" width={120} height={40} style={{ marginBottom: 16 }} />
            <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 13, lineHeight: 1.7, maxWidth: 360, marginBottom: 16 }}>
              {t.footer.desc}
            </p>
            <div style={{ display: "flex", gap: 10 }}>
              <a href="https://www.instagram.com/nick_saudi" target="_blank" rel="noopener noreferrer" aria-label="Instagram" style={{ color: "rgba(255,255,255,0.3)", transition: "color 0.2s" }} onMouseEnter={e => (e.currentTarget.style.color = "#E4405F")} onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.3)")}>
                <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
              </a>
              <a href="https://x.com/nick__saudi" target="_blank" rel="noopener noreferrer" aria-label="X" style={{ color: "rgba(255,255,255,0.3)", transition: "color 0.2s" }} onMouseEnter={e => (e.currentTarget.style.color = "#fff")} onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.3)")}>
                <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
              </a>
              <a href="https://www.tiktok.com/@nick_saudi" target="_blank" rel="noopener noreferrer" aria-label="TikTok" style={{ color: "rgba(255,255,255,0.3)", transition: "color 0.2s" }} onMouseEnter={e => (e.currentTarget.style.color = "#00f2ea")} onMouseLeave={e => (e.currentTarget.style.color = "rgba(255,255,255,0.3)")}>
                <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 00-.79-.05A6.34 6.34 0 003.15 15.2a6.34 6.34 0 0010.86 4.46V13a8.28 8.28 0 005.58 2.15v-3.44a4.85 4.85 0 01-1.99-.43 4.83 4.83 0 01-1.79-1.38V6.69h3.78z"/></svg>
              </a>
            </div>
          </div>
          <div>
            <h4 style={{ color: "#fff", fontWeight: 700, fontSize: 12, letterSpacing: isAr ? "0" : "0.1em", textTransform: isAr ? "none" : "uppercase" as const, marginBottom: 16 }}>{t.footer.servicesTitle}</h4>
            {services.map(s => (
              <Link key={s} href="#services" style={{ display: "block", color: "rgba(255,255,255,0.3)", fontSize: 13, marginBottom: 8, textDecoration: "none" }}>{s}</Link>
            ))}
          </div>
          <div>
            <h4 style={{ color: "#fff", fontWeight: 700, fontSize: 12, letterSpacing: isAr ? "0" : "0.1em", textTransform: isAr ? "none" : "uppercase" as const, marginBottom: 16 }}>{t.footer.companyTitle}</h4>
            {company.map(s => (
              <Link key={s.l} href={s.h} style={{ display: "block", color: "rgba(255,255,255,0.3)", fontSize: 13, marginBottom: 8, textDecoration: "none" }}>{s.l}</Link>
            ))}
          </div>
          <div>
            <h4 style={{ color: "#fff", fontWeight: 700, fontSize: 12, letterSpacing: isAr ? "0" : "0.1em", textTransform: isAr ? "none" : "uppercase" as const, marginBottom: 16 }}>{t.contact.heading1}{t.contact.heading2}</h4>
            <a href="tel:+966543000055" dir="ltr" style={{ display: "block", color: "rgba(255,255,255,0.3)", fontSize: 13, marginBottom: 8, textDecoration: "none" }}>{t.footer.phone}</a>
            <a href="mailto:info@nick.sa" style={{ display: "block", color: "rgba(255,255,255,0.3)", fontSize: 13, marginBottom: 8, textDecoration: "none" }}>{t.footer.email}</a>
            <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 13, marginBottom: 8 }}>{t.footer.address}</p>
          </div>
        </div>
        <div style={{ marginTop: 40, paddingTop: 20, borderTop: "1px solid rgba(255,255,255,0.05)", display: "flex", justifyContent: "space-between", flexWrap: "wrap" as const, gap: 8 }}>
          <p style={{ color: "rgba(255,255,255,0.2)", fontSize: 12 }}>&copy; {new Date().getFullYear()} NICK. {t.footer.rights}</p>
          <p style={{ color: "rgba(255,255,255,0.12)", fontSize: 11 }}>{t.footer.location}</p>
        </div>
      </div>
    </footer>
  );
}
