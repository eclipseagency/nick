"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useReveal } from "@/hooks/useReveal";
import { useLanguage } from "@/i18n/LanguageContext";

export default function Services() {
  const { t, locale, dir } = useLanguage();
  const ref = useReveal([locale]);
  const isAr = locale === "ar";
  const fontDisplay = isAr ? "var(--font-ar)" : "var(--font-display)";

  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const services = [
    { title: t.services.s1title, tag: t.services.s1tag, desc: t.services.s1desc, image: "/images/DSC03279.jpg", feats: [t.services.s1f1, t.services.s1f2, t.services.s1f3], warranty: isAr ? "ضمان ١٠ سنوات" : "10-Year Warranty" },
    { title: t.services.s2title, tag: t.services.s2tag, desc: t.services.s2desc, image: "/images/DSC03136.jpg", feats: [t.services.s2f1, t.services.s2f2, t.services.s2f3], warranty: isAr ? "ضمان ١٠ سنوات" : "10-Year Warranty" },
    { title: t.services.s3title, tag: t.services.s3tag, desc: t.services.s3desc, image: "/images/DSC03018.jpg", feats: [t.services.s3f1, t.services.s3f2, t.services.s3f3], warranty: isAr ? "ضمان ٥ سنوات" : "5-Year Warranty" },
    { title: t.services.s4title, tag: t.services.s4tag, desc: t.services.s4desc, image: "/images/DSC03060.jpg", feats: [t.services.s4f1, t.services.s4f2, t.services.s4f3], warranty: isAr ? "ضمان ٣ سنوات" : "3-Year Warranty" },
  ];

  return (
    <section id="services" ref={ref} style={{ padding: isMobile ? "64px 0" : "96px 0", background: "#050505" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px" }}>
        {/* Section header */}
        <div className="reveal" style={{ textAlign: "center", maxWidth: 560, margin: "0 auto 56px" }}>
          <span className="section-badge">{t.services.badge}</span>
          <h2 style={{ fontFamily: fontDisplay, fontSize: "clamp(28px, 5vw, 44px)", fontWeight: 700, marginBottom: 12 }}>
            <span style={{ color: "#fff" }}>{t.services.heading1}</span>
            <span className="gold-text">{t.services.heading2}</span>
          </h2>
          <p style={{ color: "rgba(255,255,255,0.45)", fontSize: 16 }}>{t.services.subtitle}</p>
        </div>

        {/* Big image cards — stacked vertically */}
        <div style={{ display: "flex", flexDirection: "column", gap: isMobile ? 16 : 24 }}>
          {services.map((s, i) => {
            const alignRight = !isMobile && i % 2 !== 0;
            return (
              <div
                key={s.image}
                className={`reveal reveal-delay-${Math.min(i + 1, 4)}`}
                style={{
                  position: "relative",
                  borderRadius: isMobile ? 16 : 24,
                  overflow: "hidden",
                  height: isMobile ? 360 : 480,
                  cursor: "pointer",
                  transition: "transform 0.5s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.5s",
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.transform = "scale(1.01)";
                  e.currentTarget.style.boxShadow = "0 20px 60px rgba(0,0,0,0.5)";
                  const img = e.currentTarget.querySelector("[data-svc-img]") as HTMLElement;
                  if (img) img.style.transform = "scale(1.08)";
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.transform = "scale(1)";
                  e.currentTarget.style.boxShadow = "none";
                  const img = e.currentTarget.querySelector("[data-svc-img]") as HTMLElement;
                  if (img) img.style.transform = "scale(1)";
                }}
              >
                {/* Background image with zoom on hover */}
                <div
                  data-svc-img
                  style={{
                    position: "absolute", inset: 0,
                    transition: "transform 0.8s cubic-bezier(0.4, 0, 0.2, 1)",
                  }}
                >
                  <Image src={s.image} alt={s.title} fill className="object-cover" quality={85} sizes="(max-width: 768px) 100vw, 1200px" />
                </div>

                {/* Gradient overlay — heavier on text side */}
                <div style={{
                  position: "absolute", inset: 0,
                  background: isMobile
                    ? "linear-gradient(to top, rgba(5,5,5,0.95) 0%, rgba(5,5,5,0.6) 40%, rgba(5,5,5,0.15) 100%)"
                    : alignRight
                      ? `linear-gradient(${dir === "rtl" ? "to left" : "to right"}, rgba(5,5,5,0.1) 0%, rgba(5,5,5,0.5) 40%, rgba(5,5,5,0.92) 70%)`
                      : `linear-gradient(${dir === "rtl" ? "to right" : "to left"}, rgba(5,5,5,0.1) 0%, rgba(5,5,5,0.5) 40%, rgba(5,5,5,0.92) 70%)`,
                }} />

                {/* Gold ambient glow on text side */}
                {!isMobile && (
                  <div style={{
                    position: "absolute", inset: 0,
                    background: alignRight
                      ? `radial-gradient(ellipse 40% 60% at ${dir === "rtl" ? "20%" : "80%"} 50%, rgba(246,190,0,0.04) 0%, transparent 70%)`
                      : `radial-gradient(ellipse 40% 60% at ${dir === "rtl" ? "80%" : "20%"} 50%, rgba(246,190,0,0.04) 0%, transparent 70%)`,
                  }} />
                )}

                {/* Tag badge — top corner */}
                <div style={{
                  position: "absolute", top: isMobile ? 16 : 24,
                  ...(alignRight
                    ? (dir === "rtl" ? { left: isMobile ? 16 : 32 } : { right: isMobile ? 16 : 32 })
                    : (dir === "rtl" ? { right: isMobile ? 16 : 32 } : { left: isMobile ? 16 : 32 })),
                  zIndex: 5,
                }}>
                  <span style={{
                    padding: "6px 16px", fontSize: 11, fontWeight: 700, borderRadius: 100,
                    background: "#F6BE00", color: "#000",
                    letterSpacing: isAr ? "0" : "0.06em",
                    textTransform: isAr ? "none" : "uppercase",
                    boxShadow: "0 2px 12px rgba(246,190,0,0.3)",
                  }}>{s.tag}</span>
                </div>

                {/* Content overlay */}
                <div style={{
                  position: "absolute", inset: 0, zIndex: 3,
                  display: "flex", flexDirection: "column",
                  justifyContent: isMobile ? "flex-end" : "center",
                  padding: isMobile ? "24px 20px" : "48px clamp(32px, 5vw, 64px)",
                  ...(isMobile ? {} : alignRight
                    ? { alignItems: dir === "rtl" ? "flex-start" : "flex-end", textAlign: dir === "rtl" ? "left" : "right" }
                    : { alignItems: dir === "rtl" ? "flex-end" : "flex-start", textAlign: dir === "rtl" ? "right" : "left" }),
                  maxWidth: isMobile ? "100%" : "50%",
                  ...(isMobile ? {} : alignRight
                    ? (dir === "rtl" ? { left: 0 } : { right: 0, marginInlineStart: "auto" })
                    : {}),
                }}>
                  {/* Warranty badge */}
                  <div style={{
                    display: "inline-flex", alignItems: "center", gap: 6,
                    padding: "5px 14px", borderRadius: 100, marginBottom: 14,
                    background: "rgba(246,190,0,0.1)", border: "1px solid rgba(246,190,0,0.25)",
                    backdropFilter: "blur(4px)",
                  }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#F6BE00" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                    <span style={{ color: "#F6BE00", fontSize: 11, fontWeight: 700 }}>{s.warranty}</span>
                  </div>

                  {/* Title */}
                  <h3 style={{
                    fontFamily: fontDisplay, color: "#fff",
                    fontSize: isMobile ? "clamp(22px, 6vw, 28px)" : "clamp(28px, 3vw, 40px)",
                    fontWeight: 800, lineHeight: 1.1, marginBottom: 12,
                    letterSpacing: isAr ? "0" : "-0.02em",
                  }}>{s.title}</h3>

                  {/* Description */}
                  <p style={{
                    color: "rgba(255,255,255,0.55)", fontSize: isMobile ? 13 : 15,
                    lineHeight: 1.6, marginBottom: 16,
                    maxWidth: 420,
                    display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical" as const, overflow: "hidden",
                  }}>{s.desc}</p>

                  {/* Feature pills */}
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 20 }}>
                    {s.feats.map((f) => (
                      <span key={f} style={{
                        padding: "5px 12px", fontSize: 11, fontWeight: 500,
                        color: "rgba(255,255,255,0.7)", border: "1px solid rgba(255,255,255,0.12)",
                        borderRadius: 100, background: "rgba(255,255,255,0.04)",
                        backdropFilter: "blur(4px)",
                      }}>{f}</span>
                    ))}
                  </div>

                  {/* CTA */}
                  <Link href="/booking" className="btn-gold" style={{
                    padding: isMobile ? "12px 24px" : "14px 32px",
                    fontSize: isMobile ? 12 : 13,
                    boxShadow: "0 4px 20px rgba(246,190,0,0.2)",
                  }}>
                    {isAr ? "احجز الآن" : "Book Now"}
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ transform: dir === "rtl" ? "scaleX(-1)" : "none" }}><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
                  </Link>
                </div>

                {/* Bottom border accent */}
                <div style={{
                  position: "absolute", bottom: 0, left: "10%", right: "10%", height: 2, zIndex: 5,
                  background: "linear-gradient(90deg, transparent, rgba(246,190,0,0.3), transparent)",
                }} />
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
