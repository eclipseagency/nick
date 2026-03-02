"use client";

import Image from "next/image";
import { useReveal } from "@/hooks/useReveal";
import { useLanguage } from "@/i18n/LanguageContext";

export default function Services() {
  const { t, locale, dir } = useLanguage();
  const ref = useReveal([locale]);
  const isAr = locale === "ar";
  const fontDisplay = isAr ? "var(--font-ar)" : "var(--font-display)";

  const services = [
    { title: t.services.s1title, tag: t.services.s1tag, desc: t.services.s1desc, image: "/images/DSC03279.jpg", feats: [t.services.s1f1, t.services.s1f2, t.services.s1f3] },
    { title: t.services.s2title, tag: t.services.s2tag, desc: t.services.s2desc, image: "/images/DSC03136.jpg", feats: [t.services.s2f1, t.services.s2f2, t.services.s2f3] },
    { title: t.services.s3title, tag: t.services.s3tag, desc: t.services.s3desc, image: "/images/DSC03018.jpg", feats: [t.services.s3f1, t.services.s3f2, t.services.s3f3] },
    { title: t.services.s4title, tag: t.services.s4tag, desc: t.services.s4desc, image: "/images/DSC03060.jpg", feats: [t.services.s4f1, t.services.s4f2, t.services.s4f3] },
  ];

  return (
    <section id="services" ref={ref} style={{ padding: "96px 0", background: "linear-gradient(180deg, #050505, #0a0a0a, #050505)" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px" }}>
        <div className="reveal" style={{ textAlign: "center", maxWidth: 560, margin: "0 auto 56px" }}>
          <span className="section-badge">{t.services.badge}</span>
          <h2 style={{ fontFamily: fontDisplay, fontSize: "clamp(28px, 5vw, 44px)", fontWeight: 700, marginBottom: 12 }}>
            <span style={{ color: "#fff" }}>{t.services.heading1}</span>
            <span className="gold-text">{t.services.heading2}</span>
          </h2>
          <p style={{ color: "rgba(255,255,255,0.45)", fontSize: 16 }}>{t.services.subtitle}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {services.map((s, i) => (
            <div key={s.image} className={`card group reveal reveal-delay-${i + 1}`}>
              <div style={{ position: "relative", height: 240, overflow: "hidden" }}>
                <Image src={s.image} alt={s.title} fill className="object-cover" style={{ transition: "transform 0.6s" }} />
                <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, #111, rgba(17,17,17,0.3), transparent)" }} />
                <span style={{
                  position: "absolute", top: 14,
                  ...(dir === "rtl" ? { right: 14 } : { left: 14 }),
                  padding: "5px 12px", background: "#F6BE00", color: "#000", fontSize: 11, fontWeight: 700, borderRadius: 6,
                  letterSpacing: isAr ? "0" : "0.05em", textTransform: isAr ? "none" : "uppercase" as const,
                }}>{s.tag}</span>
              </div>
              <div style={{ padding: 24 }}>
                <h3 style={{ fontFamily: fontDisplay, color: "#fff", fontSize: 20, fontWeight: 700, marginBottom: 8 }}>{s.title}</h3>
                <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 14, lineHeight: 1.6, marginBottom: 16 }}>{s.desc}</p>
                <div style={{ display: "flex", flexWrap: "wrap" as const, gap: 8 }}>
                  {s.feats.map((f) => (
                    <span key={f} style={{ padding: "5px 12px", fontSize: 11, fontWeight: 500, color: "#F6BE00", border: "1px solid rgba(246,190,0,0.2)", borderRadius: 100, background: "rgba(246,190,0,0.05)", transition: "all 0.3s" }}>{f}</span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
