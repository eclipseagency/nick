"use client";

import Image from "next/image";
import Link from "next/link";
import { useReveal } from "@/hooks/useReveal";
import { useLanguage } from "@/i18n/LanguageContext";

export default function Contact() {
  const ref = useReveal();
  const { t, locale, dir } = useLanguage();
  const isAr = locale === "ar";
  const fontDisplay = isAr ? "var(--font-ar)" : "var(--font-display)";

  const gradientDir = dir === "rtl" ? "to left" : "to right";

  return (
    <section id="contact" ref={ref} style={{ padding: "96px 0" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px" }}>
        <div className="reveal" style={{ position: "relative", borderRadius: 20, overflow: "hidden" }}>
          <div style={{ position: "absolute", inset: 0 }}>
            <Image src="/images/DSC03261.jpg" alt="NICK team" fill className="object-cover" />
            <div style={{ position: "absolute", inset: 0, background: `linear-gradient(${gradientDir}, rgba(5,5,5,0.95), rgba(5,5,5,0.75), rgba(5,5,5,0.4))` }} />
          </div>
          <div style={{ position: "relative", zIndex: 1, padding: "clamp(40px, 6vw, 80px)" }}>
            <div style={{ maxWidth: 480 }}>
              <h2 style={{ fontFamily: fontDisplay, fontSize: "clamp(28px, 5vw, 44px)", fontWeight: 700, lineHeight: 1.15, marginBottom: 20 }}>
                <span style={{ color: "#fff" }}>{t.contact.heading1}</span><span className="gold-text">{t.contact.heading2}</span>
              </h2>
              <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 16, lineHeight: 1.7, marginBottom: 32 }}>
                {t.contact.subtitle}
              </p>
              <div style={{ display: "flex", flexWrap: "wrap" as const, gap: 12, marginBottom: 40 }}>
                <Link href="https://nick.sa" target="_blank" className="btn-gold">{t.contact.cta1}</Link>
                <Link href="#booking" className="btn-outline">{t.contact.cta2}</Link>
              </div>
              <div className="grid grid-cols-3 gap-4" style={{ paddingTop: 24, borderTop: "1px solid rgba(255,255,255,0.1)" }}>
                {[
                  { l: t.contact.locationLabel, v: t.contact.locationValue },
                  { l: t.contact.websiteLabel, v: "nick.sa" },
                  { l: t.contact.sinceLabel, v: "1999" },
                ].map(c => (
                  <div key={c.l}>
                    <div style={{ color: "#F6BE00", fontSize: 11, fontWeight: 600, textTransform: isAr ? "none" : "uppercase" as const, letterSpacing: isAr ? "0" : "0.08em", marginBottom: 4 }}>{c.l}</div>
                    <div style={{ color: "rgba(255,255,255,0.45)", fontSize: 13 }}>{c.v}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
