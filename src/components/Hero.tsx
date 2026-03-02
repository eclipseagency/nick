"use client";

import Image from "next/image";
import Link from "next/link";
import { useLanguage } from "@/i18n/LanguageContext";

export default function Hero() {
  const { t, locale } = useLanguage();
  const isAr = locale === "ar";
  const fontDisplay = isAr ? "var(--font-ar)" : "var(--font-display)";

  return (
    <section id="hero" style={{ position: "relative", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
      {/* Background */}
      <div style={{ position: "absolute", inset: 0 }}>
        <Image
          src="/images/DSC03064.jpg"
          alt="NICK - Jetour in studio"
          fill
          style={{ objectFit: "cover", objectPosition: "center" }}
          priority
          quality={90}
        />
        <div style={{ position: "absolute", inset: 0, background: "rgba(5,5,5,0.65)" }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(5,5,5,1) 0%, transparent 35%, transparent 80%, rgba(5,5,5,0.5) 100%)" }} />
      </div>

      {/* Content */}
      <div style={{ position: "relative", zIndex: 10, width: "100%", maxWidth: 700, margin: "0 auto", padding: "140px 24px 100px", textAlign: "center" }}>
        {/* Badge */}
        <div className="anim-1" style={{ display: "inline-flex", alignItems: "center", gap: 10, marginBottom: 32 }}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#F6BE00" }} />
          <span style={{ color: "#F6BE00", fontSize: 13, fontWeight: 600, letterSpacing: isAr ? "0" : "0.1em", textTransform: isAr ? "none" : "uppercase" as const, fontFamily: isAr ? fontDisplay : undefined }}>
            {t.hero.badge}
          </span>
        </div>

        {/* Heading */}
        <h1 className="anim-2" style={{ fontFamily: fontDisplay, fontSize: "clamp(52px, 12vw, 100px)", fontWeight: 800, lineHeight: 0.92, letterSpacing: isAr ? "0" : "-0.03em", marginBottom: 28 }}>
          <span style={{ color: "#fff" }}>{t.hero.line1}</span><br />
          <span className="gold-text">{t.hero.line2}</span><br />
          <span style={{ color: "#fff" }}>{t.hero.line3}</span>
        </h1>

        {/* Subtitle */}
        <p className="anim-3" style={{ color: "rgba(255,255,255,0.55)", fontSize: 17, lineHeight: 1.75, maxWidth: 480, margin: "0 auto 40px", fontFamily: isAr ? fontDisplay : undefined }}>
          {t.hero.subtitle}
        </p>

        {/* Buttons */}
        <div className="anim-4" style={{ display: "flex", flexWrap: "wrap" as const, gap: 12, justifyContent: "center", marginBottom: 56 }}>
          <Link href="#booking" className="btn-gold">{t.hero.cta1}</Link>
          <Link href="#services" className="btn-outline">{t.hero.cta2}</Link>
        </div>

        {/* Stats */}
        <div className="anim-4" style={{ display: "flex", justifyContent: "center", gap: 40, paddingTop: 32, borderTop: "1px solid rgba(255,255,255,0.1)" }}>
          {[
            { n: t.hero.stat1n, l: t.hero.stat1l },
            { n: t.hero.stat2n, l: t.hero.stat2l },
            { n: t.hero.stat3n, l: t.hero.stat3l },
          ].map((s) => (
            <div key={s.l} style={{ textAlign: "center" }}>
              <div className="gold-text" style={{ fontFamily: fontDisplay, fontSize: 26, fontWeight: 700 }}>{s.n}</div>
              <div style={{ color: "rgba(255,255,255,0.35)", fontSize: 12, marginTop: 4 }}>{s.l}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
