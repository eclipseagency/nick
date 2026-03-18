"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useLanguage } from "@/i18n/LanguageContext";

export default function Hero() {
  const { t, locale } = useLanguage();
  const isAr = locale === "ar";

  // Desktop slides (1920x1000)
  const desktopSlides = [
    isAr ? "/images/hero-rhino.png" : "/images/hero-rhino-en.png",
    isAr ? "/images/hero-slide2.png" : "/images/hero-slide2-en.png",
  ];

  // Mobile slides (1080x1200) — fallback to desktop until provided
  const mobileSlides = [
    isAr ? "/images/hero-rhino-mobile.png" : "/images/hero-rhino-mobile-en.png",
    isAr ? "/images/hero-slide2-mobile.png" : "/images/hero-slide2-mobile-en.png",
  ];

  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Detect mobile
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const slides = isMobile ? mobileSlides : desktopSlides;

  const next = useCallback(() => {
    setCurrent(prev => (prev + 1) % slides.length);
  }, [slides.length]);

  useEffect(() => {
    if (paused) return;
    timerRef.current = setInterval(next, 5000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [next, paused]);

  return (
    <section
      id="hero"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      style={{
        position: "relative",
        width: "100%",
        marginTop: 80,
        background: "#050505",
      }}
    >
      {/* Image container — responsive aspect ratio */}
      <div style={{ position: "relative", width: "100%", aspectRatio: isMobile ? "1080 / 1200" : "1920 / 1000" }}>
        {/* Desktop slides */}
        {desktopSlides.map((src, i) => (
          <div
            key={`desktop-${i}`}
            style={{
              position: "absolute", inset: 0,
              opacity: !isMobile && i === current ? 1 : 0,
              transition: "opacity 1s ease-in-out",
            }}
          >
            <Image
              src={src}
              alt={`NICK slide ${i + 1}`}
              fill
              style={{ objectFit: "cover", objectPosition: "center" }}
              priority={i === 0}
              quality={90}
            />
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, #050505 0%, transparent 20%)" }} />
          </div>
        ))}

        {/* Mobile slides — uses desktop as fallback via onError */}
        {mobileSlides.map((src, i) => (
          <div
            key={`mobile-${i}`}
            style={{
              position: "absolute", inset: 0,
              opacity: isMobile && i === current ? 1 : 0,
              transition: "opacity 1s ease-in-out",
            }}
          >
            <Image
              src={src}
              alt={`NICK slide ${i + 1} mobile`}
              fill
              style={{ objectFit: "cover", objectPosition: "center" }}
              quality={90}
              onError={(e) => {
                // Fallback to desktop version if mobile image doesn't exist
                (e.target as HTMLImageElement).src = desktopSlides[i];
              }}
            />
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, #050505 0%, transparent 20%)" }} />
          </div>
        ))}

        {/* CTA buttons */}
        <div style={{
          position: "absolute", bottom: isMobile ? 60 : "clamp(40px, 8vw, 80px)", left: "50%", transform: "translateX(-50%)",
          zIndex: 10, display: "flex", gap: 12,
        }}>
          <Link href="/booking" className="btn-gold" style={{ padding: isMobile ? "10px 24px" : "12px 32px", fontSize: isMobile ? 13 : 15 }}>{t.hero.cta1}</Link>
          <Link href="#services" className="btn-outline" style={{ padding: isMobile ? "10px 24px" : "12px 32px", fontSize: isMobile ? 13 : 15 }}>{t.hero.cta2}</Link>
        </div>

        {/* Slider dots */}
        <div style={{
          position: "absolute", bottom: 16, left: "50%", transform: "translateX(-50%)",
          zIndex: 20, display: "flex", gap: 10, alignItems: "center",
        }}>
          {slides.map((_, i) => (
            <button
              key={i}
              aria-label={`Slide ${i + 1}`}
              onClick={() => setCurrent(i)}
              style={{
                width: i === current ? 28 : 10,
                height: 10,
                borderRadius: 5,
                border: "none",
                cursor: "pointer",
                background: i === current ? "#F6BE00" : "rgba(255,255,255,0.3)",
                transition: "all 0.4s ease",
                padding: 0,
              }}
            />
          ))}
        </div>

        {/* Prev/Next arrows — hidden on mobile */}
        {!isMobile && (
          <>
            <button
              aria-label={isAr ? "الشريحة السابقة" : "Previous slide"}
              onClick={() => setCurrent(prev => prev === 0 ? slides.length - 1 : prev - 1)}
              style={{
                position: "absolute", left: 16, top: "50%", transform: "translateY(-50%)",
                zIndex: 20, width: 40, height: 40, borderRadius: "50%", cursor: "pointer",
                background: "rgba(0,0,0,0.4)", border: "1px solid rgba(255,255,255,0.15)",
                color: "#fff", display: "flex", alignItems: "center", justifyContent: "center",
                transition: "all 0.3s", backdropFilter: "blur(4px)",
              }}
              onMouseEnter={e => { e.currentTarget.style.background = "rgba(246,190,0,0.2)"; e.currentTarget.style.borderColor = "rgba(246,190,0,0.4)"; e.currentTarget.style.color = "#F6BE00"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "rgba(0,0,0,0.4)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.15)"; e.currentTarget.style.color = "#fff"; }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
            </button>
            <button
              aria-label={isAr ? "الشريحة التالية" : "Next slide"}
              onClick={() => next()}
              style={{
                position: "absolute", right: 16, top: "50%", transform: "translateY(-50%)",
                zIndex: 20, width: 40, height: 40, borderRadius: "50%", cursor: "pointer",
                background: "rgba(0,0,0,0.4)", border: "1px solid rgba(255,255,255,0.15)",
                color: "#fff", display: "flex", alignItems: "center", justifyContent: "center",
                transition: "all 0.3s", backdropFilter: "blur(4px)",
              }}
              onMouseEnter={e => { e.currentTarget.style.background = "rgba(246,190,0,0.2)"; e.currentTarget.style.borderColor = "rgba(246,190,0,0.4)"; e.currentTarget.style.color = "#F6BE00"; }}
              onMouseLeave={e => { e.currentTarget.style.background = "rgba(0,0,0,0.4)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.15)"; e.currentTarget.style.color = "#fff"; }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6"/></svg>
            </button>
          </>
        )}
      </div>
    </section>
  );
}
