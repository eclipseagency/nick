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
        <div className="grid md:grid-cols-3 gap-10">
          <div>
            <Image src="/images/logo-white.png" alt="NICK" width={120} height={40} style={{ marginBottom: 16 }} />
            <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 13, lineHeight: 1.7, maxWidth: 360 }}>
              {t.footer.desc}
            </p>
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
        </div>
        <div style={{ marginTop: 40, paddingTop: 20, borderTop: "1px solid rgba(255,255,255,0.05)", display: "flex", justifyContent: "space-between", flexWrap: "wrap" as const, gap: 8 }}>
          <p style={{ color: "rgba(255,255,255,0.2)", fontSize: 12 }}>&copy; {new Date().getFullYear()} NICK. {t.footer.rights}</p>
          <p style={{ color: "rgba(255,255,255,0.12)", fontSize: 11 }}>{t.footer.location}</p>
        </div>
      </div>
    </footer>
  );
}
