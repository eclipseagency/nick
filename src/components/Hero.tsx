"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useLanguage } from "@/i18n/LanguageContext";

export default function Hero() {
  const { t, locale } = useLanguage();
  const isAr = locale === "ar";
  const fontDisplay = isAr ? "var(--font-ar)" : "var(--font-display)";
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const [isMobile, setIsMobile] = useState(false);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // Ensure video plays on mobile (touch/click to unlock autoplay)
  useEffect(() => {
    const tryPlay = () => {
      const vid = videoRef.current;
      if (vid && vid.paused) vid.play().catch(() => {});
    };
    tryPlay();
    document.addEventListener("touchstart", tryPlay, { once: true });
    document.addEventListener("click", tryPlay, { once: true });
    return () => {
      document.removeEventListener("touchstart", tryPlay);
      document.removeEventListener("click", tryPlay);
    };
  }, []);

  // Parallax — desktop only
  useEffect(() => {
    if (isMobile) return;
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isMobile]);

  // ---- Gold dust particles (desktop only) ----
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || isMobile) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    resize();
    window.addEventListener("resize", resize);

    interface P { x: number; y: number; vx: number; vy: number; size: number; alpha: number; }
    const particles: P[] = [];
    for (let i = 0; i < 50; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.25,
        vy: -Math.random() * 0.4 - 0.05,
        size: Math.random() * 1.8 + 0.4,
        alpha: Math.random() * 0.4 + 0.05,
      });
    }

    let animId: number;
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        p.alpha -= 0.001;
        if (p.alpha <= 0 || p.y < -10 || p.x < -10 || p.x > canvas.width + 10) {
          p.x = Math.random() * canvas.width;
          p.y = canvas.height + 10;
          p.alpha = Math.random() * 0.4 + 0.05;
        }
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(246,190,0,${p.alpha})`;
        ctx.fill();
      }
      animId = requestAnimationFrame(animate);
    };
    animate();

    return () => { cancelAnimationFrame(animId); window.removeEventListener("resize", resize); };
  }, [isMobile]);

  const stats = [
    { n: "27+", l: isAr ? "سنة خبرة" : "Years" },
    { n: "20M+", l: isAr ? "مالك سيارة" : "Car Owners" },
    { n: "10", l: isAr ? "سنوات ضمان" : "Yr Warranty" },
    { n: "4000+", l: isAr ? "فرع حول العالم" : "Branches Worldwide" },
  ];

  const heading = {
    line1: isAr ? "حماية بقوة" : "Protection with",
    line2: isAr ? "وحيد القرن" : "Rhino Strength",
    sub: isAr ? "أفلام حماية عالية الأداء مصممة للبيئة السعودية" : "High-performance protection films engineered for Saudi roads",
  };

  const heroOpacity = Math.max(0, 1 - scrollY / 800);

  return (
    <section
      id="hero"
      style={{
        position: "relative",
        width: "100%",
        height: isMobile ? "75dvh" : "100dvh",
        minHeight: isMobile ? 500 : 650,
        maxHeight: isMobile ? 650 : undefined,
        overflow: "hidden",
        background: "#050505",
      }}
    >
      {/* Gold dust particles — desktop only */}
      {!isMobile && (
        <canvas ref={canvasRef} style={{ position: "absolute", inset: 0, zIndex: 4, pointerEvents: "none" }} />
      )}

      {/* Video background */}
      <div style={{ position: "absolute", inset: 0 }}>
        <div style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}>
          <video
            ref={videoRef}
            src="/images/hero-video.mp4"
            autoPlay
            muted
            loop
            playsInline
            webkit-playsinline="true"
            preload="auto"
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
              objectPosition: isMobile ? "center center" : "center 40%",
            }}
          />
        </div>

        {/* Cinematic gradient overlays */}
        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(180deg, rgba(5,5,5,0.75) 0%, rgba(5,5,5,0.2) 35%, rgba(5,5,5,0.35) 60%, rgba(5,5,5,0.97) 100%)",
        }} />
        <div style={{
          position: "absolute", inset: 0,
          background: "radial-gradient(ellipse 80% 70% at 50% 45%, transparent 30%, rgba(5,5,5,0.6) 100%)",
        }} />
        <div style={{
          position: "absolute", inset: 0,
          background: "radial-gradient(ellipse 50% 50% at 50% 50%, rgba(246,190,0,0.05) 0%, transparent 70%)",
        }} />
      </div>

      {/* Content */}
      <div style={{
        position: "relative", zIndex: 5,
        height: "100%", display: "flex", flexDirection: "column",
        justifyContent: "flex-end",
        alignItems: "center",
        textAlign: "center",
        padding: isMobile ? "0 20px 100px" : "0 24px 140px",
        maxWidth: 950, margin: "0 auto",
        opacity: heroOpacity,
        transform: isMobile ? undefined : `translateY(${scrollY * 0.1}px)`,
        transition: "opacity 0.1s linear",
      }}>
        <div>
          <h1 className="hero-reveal-2" style={{
            fontFamily: fontDisplay,
            fontSize: isMobile ? "clamp(24px, 8vw, 36px)" : "clamp(36px, 5vw, 56px)",
            fontWeight: 900, lineHeight: 1.05, margin: "0 0 12px",
            letterSpacing: isAr ? "0" : "-0.025em",
          }}>
            <span style={{ color: "#fff", display: "block" }}>{heading.line1}</span>
            <span className="gold-text" style={{ display: "block" }}>{heading.line2}</span>
          </h1>

          <p className="hero-reveal-3" style={{
            fontSize: isMobile ? 12 : 14,
            color: "rgba(255,255,255,0.55)",
            maxWidth: 520, lineHeight: 1.7, margin: "0 auto 20px",
            fontWeight: 400,
          }}>
            {heading.sub}
          </p>
        </div>

        <div className="hero-reveal-4" style={{
          display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center",
          marginBottom: 16,
        }}>
          <Link href="/booking" className="btn-gold" style={{
            padding: isMobile ? "10px 22px" : "12px 32px",
            fontSize: isMobile ? 11 : 13,
            boxShadow: "0 4px 24px rgba(246,190,0,0.25)",
          }}>
            {t.hero.cta1}
          </Link>
          <Link href="#services" className="btn-outline" style={{
            padding: isMobile ? "10px 22px" : "12px 32px",
            fontSize: isMobile ? 11 : 13,
            backdropFilter: "blur(8px)",
          }}>
            {t.hero.cta2}
          </Link>
        </div>

        {/* Stats row */}
        <div className="hero-reveal-5" style={{
          display: "grid",
          gridTemplateColumns: isMobile ? "repeat(4, 1fr)" : "repeat(4, auto)",
          gap: isMobile ? 8 : 48,
          paddingTop: isMobile ? 12 : 20,
          borderTop: "1px solid rgba(255,255,255,0.07)",
          width: "100%", maxWidth: 600,
        }}>
          {stats.map((s, i) => (
            <div key={i} style={{ textAlign: "center" }}>
              <div className="gold-text" style={{
                fontFamily: fontDisplay,
                fontSize: isMobile ? 18 : 28,
                fontWeight: 800,
                lineHeight: 1.2,
              }}>{s.n}</div>
              <div style={{
                color: "rgba(255,255,255,0.3)",
                fontSize: isMobile ? 9 : 11,
                fontWeight: 500, marginTop: 2,
                letterSpacing: isAr ? "0" : "0.04em",
                textTransform: isAr ? "none" : "uppercase",
              }}>{s.l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Scroll indicator */}
      <div style={{
        position: "absolute", bottom: isMobile ? 44 : 70,
        left: "50%",
        zIndex: 10, display: "flex", flexDirection: "column", alignItems: "center",
        animation: "float 3s ease-in-out infinite",
        opacity: scrollY > 40 ? 0 : 0.45,
        transition: "opacity 0.5s",
        pointerEvents: "none",
      }}>
        <div style={{
          width: 22, height: 36, borderRadius: 11,
          border: "2px solid rgba(255,255,255,0.2)",
          display: "flex", justifyContent: "center", paddingTop: 7,
        }}>
          <div style={{
            width: 3, height: 8, borderRadius: 2,
            background: "#F6BE00",
            animation: "scrollDot 1.8s ease-in-out infinite",
          }} />
        </div>
      </div>

      {/* Bottom fade */}
      <div style={{
        position: "absolute", bottom: 0, left: 0, right: 0, height: 120, zIndex: 6,
        background: "linear-gradient(to bottom, transparent, #050505)",
        pointerEvents: "none",
      }} />
    </section>
  );
}
