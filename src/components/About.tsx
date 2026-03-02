"use client";

import Image from "next/image";
import { useReveal } from "@/hooks/useReveal";
import { useLanguage } from "@/i18n/LanguageContext";

export default function About() {
  const { t, locale, dir } = useLanguage();
  const ref = useReveal([locale]);
  const isAr = locale === "ar";
  const fontDisplay = isAr ? "var(--font-ar)" : "var(--font-display)";

  const features = [
    { t: t.about.feat1t, d: t.about.feat1d },
    { t: t.about.feat2t, d: t.about.feat2d },
    { t: t.about.feat3t, d: t.about.feat3d },
    { t: t.about.feat4t, d: t.about.feat4d },
  ];

  return (
    <section id="about" ref={ref} style={{ padding: "96px 0", overflow: "hidden" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px" }}>
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Image */}
          <div className="reveal" style={{ position: "relative" }}>
            <div style={{ position: "relative", aspectRatio: "4/5", borderRadius: 16, overflow: "hidden", boxShadow: "0 0 40px rgba(246,190,0,0.08)" }}>
              <Image src="/images/DSC02995.jpg" alt="NICK team" fill className="object-cover" style={{ transition: "transform 0.8s ease" }} />
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(5,5,5,0.5), transparent)" }} />
            </div>
            <div style={{
              position: "absolute", bottom: -20,
              ...(dir === "rtl" ? { left: -20 } : { right: -20 }),
              background: "#111", border: "1px solid rgba(246,190,0,0.2)", borderRadius: 14, padding: "20px 24px", boxShadow: "0 0 20px rgba(246,190,0,0.08)",
            }}>
              <div className="gold-text" style={{ fontFamily: fontDisplay, fontSize: 32, fontWeight: 700 }}>{t.about.year}</div>
              <div style={{ color: "rgba(255,255,255,0.45)", fontSize: 13, marginTop: 2 }}>{t.about.established}</div>
            </div>
          </div>

          {/* Text */}
          <div className="reveal reveal-delay-2">
            <span className="section-badge">{t.about.badge}</span>
            <h2 style={{ fontFamily: fontDisplay, fontSize: "clamp(28px, 5vw, 44px)", fontWeight: 700, lineHeight: 1.15, marginBottom: 24 }}>
              <span style={{ color: "#fff" }}>{t.about.heading1}</span>
              <span className="gold-text">{t.about.heading2}</span>
            </h2>
            <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 17, lineHeight: 1.7, marginBottom: 20 }}>
              {t.about.p1}
            </p>
            <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 15, lineHeight: 1.7, marginBottom: 36 }}>
              {t.about.p2}
            </p>

            <div className="grid grid-cols-2 gap-5">
              {features.map((i, idx) => (
                <div key={idx} style={{ display: "flex", gap: 12 }}>
                  <div style={{ width: 3, borderRadius: 2, background: "rgba(246,190,0,0.3)", flexShrink: 0, transition: "background 0.3s" }} />
                  <div>
                    <div style={{ color: "#fff", fontWeight: 600, fontSize: 14 }}>{i.t}</div>
                    <div style={{ color: "rgba(255,255,255,0.35)", fontSize: 13 }}>{i.d}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
