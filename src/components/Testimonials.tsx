"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useReveal } from "@/hooks/useReveal";
import { useLanguage } from "@/i18n/LanguageContext";

export default function Testimonials() {
  const { t, locale } = useLanguage();
  const ref = useReveal([locale]);
  const isAr = locale === "ar";
  const fontDisplay = isAr ? "var(--font-ar)" : "var(--font-display)";

  const data = [
    { n: t.testimonials.t1name, q: t.testimonials.t1quote },
    { n: t.testimonials.t2name, q: t.testimonials.t2quote },
    { n: t.testimonials.t3name, q: t.testimonials.t3quote },
    { n: t.testimonials.t4name, q: t.testimonials.t4quote },
  ];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const isPaused = useRef(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const cardsPerView = isMobile ? 1 : 2;
  const totalPages = Math.ceil(data.length / cardsPerView);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Reset index when cardsPerView changes to avoid out-of-bounds
  useEffect(() => {
    setCurrentIndex(0);
  }, [cardsPerView]);

  const goTo = useCallback((index: number) => {
    setCurrentIndex(index);
  }, []);

  const nextSlide = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % totalPages);
  }, [totalPages]);

  // Auto-scroll
  useEffect(() => {
    const start = () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      intervalRef.current = setInterval(() => {
        if (!isPaused.current) nextSlide();
      }, 4000);
    };
    start();
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [nextSlide]);

  const handleMouseEnter = useCallback(() => {
    isPaused.current = true;
  }, []);

  const handleMouseLeave = useCallback(() => {
    isPaused.current = false;
  }, []);

  // Calculate translateX: each page shifts by 100% of the visible container
  // In RTL, we reverse the direction
  const translateX = isAr
    ? currentIndex * 100
    : -(currentIndex * 100);

  // Card width: each card is (100% / cardsPerView) minus gap compensation
  const gap = 20; // px

  return (
    <section ref={ref} style={{ padding: "96px 0", background: "linear-gradient(180deg, #050505, #0a0a0a, #050505)" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px" }}>
        <div className="reveal" style={{ textAlign: "center", marginBottom: 56 }}>
          <span className="section-badge">{t.testimonials.badge}</span>
          <h2 style={{ fontFamily: fontDisplay, fontSize: "clamp(28px, 5vw, 44px)", fontWeight: 700 }}>
            <span style={{ color: "#fff" }}>{t.testimonials.heading1}</span><span className="gold-text">{t.testimonials.heading2}</span>
          </h2>
        </div>

        {/* Carousel container */}
        <div
          className="reveal"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          style={{ overflow: "hidden" }}
        >
          <div
            style={{
              display: "flex",
              gap: gap,
              transition: "transform 0.6s cubic-bezier(0.25, 0.1, 0.25, 1)",
              transform: `translateX(${translateX}%)`,
              direction: isAr ? "rtl" : "ltr",
            }}
          >
            {data.map((item, i) => (
              <div
                key={i}
                style={{
                  flex: `0 0 calc(${100 / cardsPerView}% - ${(gap * (cardsPerView - 1)) / cardsPerView}px)`,
                  minWidth: 0,
                }}
              >
                <div className="card" style={{ padding: 24, height: "100%", direction: isAr ? "rtl" : "ltr" }}>
                  <div style={{ display: "flex", gap: 3, marginBottom: 16 }}>
                    {[...Array(5)].map((_, j) => (
                      <svg key={j} width={15} height={15} fill="#F6BE00" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                    ))}
                  </div>
                  <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 13, lineHeight: 1.7, marginBottom: 20 }}>&ldquo;{item.q}&rdquo;</p>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, paddingTop: 16, borderTop: "1px solid rgba(255,255,255,0.05)" }}>
                    <div style={{ width: 36, height: 36, borderRadius: "50%", background: "rgba(246,190,0,0.08)", border: "1px solid rgba(246,190,0,0.15)", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.3s" }}>
                      <span style={{ color: "#F6BE00", fontWeight: 700, fontSize: 13 }}>{item.n[0]}</span>
                    </div>
                    <div>
                      <div style={{ color: "#fff", fontWeight: 600, fontSize: 13 }}>{item.n}</div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Dot indicators */}
        <div style={{ display: "flex", justifyContent: "center", gap: 10, marginTop: 32 }}>
          {Array.from({ length: totalPages }).map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              aria-label={`Go to slide ${i + 1}`}
              style={{
                width: currentIndex === i ? 28 : 10,
                height: 10,
                borderRadius: 5,
                border: "none",
                background: currentIndex === i ? "#F6BE00" : "rgba(255,255,255,0.15)",
                cursor: "pointer",
                transition: "all 0.3s ease",
                padding: 0,
              }}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
