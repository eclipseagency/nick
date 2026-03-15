"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { useLanguage } from "@/i18n/LanguageContext";

function AnimatedStat({ end, suffix, label, fontDisplay }: { end: number; suffix: string; label: string; fontDisplay: string }) {
  const [count, setCount] = useState(0);
  const [started, setStarted] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) { setStarted(true); obs.disconnect(); } },
      { threshold: 0.5 }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!started) return;
    const duration = 2000;
    const steps = 60;
    const inc = end / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += inc;
      if (current >= end) { setCount(end); clearInterval(timer); }
      else setCount(Math.floor(current));
    }, duration / steps);
    return () => clearInterval(timer);
  }, [started, end]);

  return (
    <div ref={ref} style={{ textAlign: "center" }}>
      <div className="gold-text" style={{ fontFamily: fontDisplay, fontSize: 26, fontWeight: 700 }}>
        {started ? count.toLocaleString() : "0"}{suffix}
      </div>
      <div style={{ color: "rgba(255,255,255,0.35)", fontSize: 12, marginTop: 4 }}>{label}</div>
    </div>
  );
}

interface Slide {
  img: string;
  hasText: boolean;
}

export default function Hero() {
  const { t, locale } = useLanguage();
  const isAr = locale === "ar";
  const fontDisplay = isAr ? "var(--font-ar)" : "var(--font-display)";

  const slides: Slide[] = [
    { img: "/images/hero-rhino.png", hasText: false },
    { img: "/images/DSC03064.jpg", hasText: true },
    { img: "/images/DSC03279.jpg", hasText: true },
  ];

  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const goTo = useCallback((idx: number) => {
    setCurrent(idx);
  }, []);

  const next = useCallback(() => {
    setCurrent(prev => (prev + 1) % slides.length);
  }, [slides.length]);

  // Auto-advance every 5s
  useEffect(() => {
    if (paused) return;
    timerRef.current = setInterval(next, 5000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [next, paused]);

  const slide = slides[current];

  return (
    <section
      id="hero"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      style={{ position: "relative", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}
    >
      {/* Slide backgrounds — all rendered, only current visible */}
      {slides.map((s, i) => (
        <div
          key={s.img}
          style={{
            position: "absolute", inset: 0,
            opacity: i === current ? 1 : 0,
            transition: "opacity 1s ease-in-out",
            zIndex: 0,
          }}
        >
          <Image
            src={s.img}
            alt={`NICK slide ${i + 1}`}
            fill
            style={{
              objectFit: "cover",
              objectPosition: s.hasText ? "center" : "center 30%",
            }}
            priority={i === 0}
            quality={90}
          />
          {/* Overlay — lighter on image-only slides, darker on text slides */}
          {s.hasText ? (
            <>
              <div style={{ position: "absolute", inset: 0, background: "rgba(5,5,5,0.65)" }} />
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(5,5,5,1) 0%, transparent 35%, transparent 80%, rgba(5,5,5,0.5) 100%)" }} />
            </>
          ) : (
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(5,5,5,0.95) 0%, rgba(5,5,5,0.1) 40%, rgba(5,5,5,0.2) 80%, rgba(5,5,5,0.6) 100%)" }} />
          )}
        </div>
      ))}

      {/* Content — only visible on text slides, fades with slide */}
      <div
        style={{
          position: "relative", zIndex: 10, width: "100%", maxWidth: 700,
          margin: "0 auto", padding: "140px 24px 100px", textAlign: "center",
          opacity: slide.hasText ? 1 : 0,
          transition: "opacity 0.6s ease",
          pointerEvents: slide.hasText ? "auto" : "none",
        }}
      >
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
        <div className="anim-4 hero-stats">
          <AnimatedStat end={27} suffix="+" label={t.hero.stat1l} fontDisplay={fontDisplay} />
          <AnimatedStat end={20} suffix="M+" label={t.hero.stat2l} fontDisplay={fontDisplay} />
          <AnimatedStat end={300} suffix="+" label={t.hero.stat3l} fontDisplay={fontDisplay} />
          <AnimatedStat end={10} suffix={isAr ? " سنوات" : "yr"} label={t.hero.stat4l} fontDisplay={fontDisplay} />
        </div>
      </div>

      {/* CTA buttons visible on image-only slides */}
      {!slide.hasText && (
        <div style={{
          position: "absolute", bottom: 120, left: "50%", transform: "translateX(-50%)",
          zIndex: 10, display: "flex", gap: 12,
          animation: "fadeUp 0.5s ease-out both",
        }}>
          <Link href="#booking" className="btn-gold">{t.hero.cta1}</Link>
          <Link href="#services" className="btn-outline">{t.hero.cta2}</Link>
        </div>
      )}

      {/* Slider dots */}
      <div style={{
        position: "absolute", bottom: 32, left: "50%", transform: "translateX(-50%)",
        zIndex: 20, display: "flex", gap: 10, alignItems: "center",
      }}>
        {slides.map((_, i) => (
          <button
            key={i}
            aria-label={`Slide ${i + 1}`}
            onClick={() => goTo(i)}
            style={{
              width: i === current ? 32 : 10,
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

      {/* Prev/Next arrows */}
      <button
        aria-label="Previous slide"
        onClick={() => setCurrent(prev => prev === 0 ? slides.length - 1 : prev - 1)}
        style={{
          position: "absolute", left: 20, top: "50%", transform: "translateY(-50%)",
          zIndex: 20, width: 44, height: 44, borderRadius: "50%", cursor: "pointer",
          background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)",
          color: "rgba(255,255,255,0.6)", display: "flex", alignItems: "center", justifyContent: "center",
          transition: "all 0.3s", backdropFilter: "blur(4px)",
        }}
        onMouseEnter={e => { e.currentTarget.style.background = "rgba(246,190,0,0.15)"; e.currentTarget.style.borderColor = "rgba(246,190,0,0.3)"; e.currentTarget.style.color = "#F6BE00"; }}
        onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.06)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)"; e.currentTarget.style.color = "rgba(255,255,255,0.6)"; }}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
      </button>
      <button
        aria-label="Next slide"
        onClick={() => next()}
        style={{
          position: "absolute", right: 20, top: "50%", transform: "translateY(-50%)",
          zIndex: 20, width: 44, height: 44, borderRadius: "50%", cursor: "pointer",
          background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)",
          color: "rgba(255,255,255,0.6)", display: "flex", alignItems: "center", justifyContent: "center",
          transition: "all 0.3s", backdropFilter: "blur(4px)",
        }}
        onMouseEnter={e => { e.currentTarget.style.background = "rgba(246,190,0,0.15)"; e.currentTarget.style.borderColor = "rgba(246,190,0,0.3)"; e.currentTarget.style.color = "#F6BE00"; }}
        onMouseLeave={e => { e.currentTarget.style.background = "rgba(255,255,255,0.06)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)"; e.currentTarget.style.color = "rgba(255,255,255,0.6)"; }}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6"/></svg>
      </button>
    </section>
  );
}
