"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { useLanguage } from "@/i18n/LanguageContext";

export default function Hero() {
  const { t, locale } = useLanguage();
  const isAr = locale === "ar";
  const fontDisplay = isAr ? "var(--font-ar)" : "var(--font-display)";
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const slides = [
    "/images/hero-rhino-new.jpg",
    isAr ? "/images/hero-slide2.webp" : "/images/hero-slide2-en.webp",
  ];

  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const [textKey, setTextKey] = useState(0); // forces re-mount for text animation
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // Parallax — desktop only
  useEffect(() => {
    if (isMobile) return;
    const handleScroll = () => setScrollY(window.scrollY);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [isMobile]);

  const next = useCallback(() => {
    setCurrent(prev => (prev + 1) % slides.length);
    setTextKey(k => k + 1);
  }, [slides.length]);

  useEffect(() => {
    if (paused) return;
    timerRef.current = setInterval(next, 7000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [next, paused]);

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

  // Stats
  const stats = [
    { n: "27+", l: isAr ? "سنة خبرة" : "Years" },
    { n: "10K+", l: isAr ? "سيارة محمية" : "Cars Protected" },
    { n: "10", l: isAr ? "سنوات ضمان" : "Yr Warranty" },
    { n: "4.9★", l: isAr ? "تقييم العملاء" : "Rating" },
  ];

  // Slide-specific text
  const headings = [
    {
      line1: isAr ? "حماية بقوة" : "Protection with",
      line2: isAr ? "وحيد القرن" : "Rhino Strength",
      sub: isAr ? "أفلام حماية عالية الأداء مصممة للبيئة السعودية" : "High-performance protection films engineered for Saudi roads",
    },
    {
      line1: isAr ? "لمعان أعمق..." : "Deeper Shine...",
      line2: isAr ? "وحماية أطول" : "Longer Protection",
      sub: isAr ? "نانو سيراميك وعزل حراري بأحدث التقنيات" : "Nano ceramic coating & thermal insulation with cutting-edge technology",
    },
  ];
  const h = headings[current];

  const parallaxY = isMobile ? 0 : scrollY * 0.35;
  const heroOpacity = Math.max(0, 1 - scrollY / 800);

  return (
    <section
      id="hero"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      style={{
        position: "relative",
        width: "100%",
        height: "100dvh",
        minHeight: isMobile ? 580 : 650,
        overflow: "hidden",
        background: "#050505",
      }}
    >
      {/* Gold dust particles — desktop only */}
      {!isMobile && (
        <canvas ref={canvasRef} style={{ position: "absolute", inset: 0, zIndex: 4, pointerEvents: "none" }} />
      )}

      {/* Background slides with Ken Burns */}
      {slides.map((src, i) => (
        <div
          key={`slide-${i}`}
          style={{
            position: "absolute", inset: 0,
            opacity: i === current ? 1 : 0,
            transition: "opacity 1.4s ease-in-out",
          }}
        >
          <div style={{
            position: "absolute", inset: isMobile ? "-4%" : "-8%",
            animation: i === current ? `kenBurns${(i % 2) + 1} 8s ease-in-out forwards` : "none",
            transform: `translateY(${parallaxY}px)`,
          }}>
            <Image
              src={src}
              alt={`NICK slide ${i + 1}`}
              fill
              style={{ objectFit: "cover", objectPosition: isMobile ? "center 30%" : "center 40%" }}
              priority={i === 0}
              quality={90}
              sizes="100vw"
            />
          </div>

          {/* Cinematic gradient overlays */}
          <div style={{
            position: "absolute", inset: 0,
            background: "linear-gradient(180deg, rgba(5,5,5,0.75) 0%, rgba(5,5,5,0.2) 35%, rgba(5,5,5,0.35) 60%, rgba(5,5,5,0.97) 100%)",
          }} />
          {/* Side vignette */}
          <div style={{
            position: "absolute", inset: 0,
            background: "radial-gradient(ellipse 80% 70% at 50% 45%, transparent 30%, rgba(5,5,5,0.6) 100%)",
          }} />
          {/* Gold ambient glow */}
          <div style={{
            position: "absolute", inset: 0,
            background: "radial-gradient(ellipse 50% 50% at 50% 50%, rgba(246,190,0,0.05) 0%, transparent 70%)",
          }} />
        </div>
      ))}

      {/* Content — always centered */}
      <div style={{
        position: "relative", zIndex: 5,
        height: "100%", display: "flex", flexDirection: "column",
        justifyContent: isMobile ? "flex-end" : "center", alignItems: "center",
        textAlign: "center", padding: isMobile ? "0 20px 60px" : "0 24px",
        maxWidth: 950, margin: "0 auto",
        opacity: heroOpacity,
        transform: isMobile ? undefined : `translateY(${scrollY * 0.1}px)`,
        transition: "opacity 0.1s linear",
      }}>
        {/* Badge */}
        <div className="hero-reveal-1" style={{
          display: "inline-flex", alignItems: "center", gap: 8,
          padding: "8px 20px", borderRadius: 100, marginBottom: isMobile ? 20 : 28,
          background: "rgba(246,190,0,0.06)", border: "1px solid rgba(246,190,0,0.18)",
          backdropFilter: "blur(8px)",
        }}>
          <div style={{
            width: 6, height: 6, borderRadius: "50%", background: "#F6BE00",
            boxShadow: "0 0 8px rgba(246,190,0,0.6)",
            animation: "goldPulse 2s infinite",
          }} />
          <span style={{
            color: "#F6BE00", fontSize: 11, fontWeight: 600,
            letterSpacing: isAr ? "0" : "0.12em",
            textTransform: isAr ? "none" : "uppercase",
          }}>
            {isAr ? "منذ ١٩٩٩ — الرياض" : "Est. 1999 — Riyadh"}
          </span>
        </div>

        {/* Main heading — re-mounts on slide change for animation */}
        <div key={textKey}>
          <h1 className="hero-reveal-2" style={{
            fontFamily: fontDisplay,
            fontSize: isMobile ? "clamp(34px, 11vw, 50px)" : "clamp(52px, 7vw, 84px)",
            fontWeight: 900, lineHeight: 1.05, margin: "0 0 16px",
            letterSpacing: isAr ? "0" : "-0.025em",
          }}>
            <span style={{ color: "#fff", display: "block" }}>{h.line1}</span>
            <span className="gold-text" style={{ display: "block" }}>{h.line2}</span>
          </h1>

          {/* Gold divider line */}
          <div className="hero-reveal-3" style={{
            width: 60, height: 3, borderRadius: 2, margin: "0 auto 18px",
            background: "linear-gradient(90deg, transparent, #F6BE00, transparent)",
          }} />

          {/* Subtitle */}
          <p className="hero-reveal-3" style={{
            fontSize: isMobile ? 14 : 18,
            color: "rgba(255,255,255,0.55)",
            maxWidth: 520, lineHeight: 1.7, margin: "0 auto 28px",
            fontWeight: 400,
          }}>
            {h.sub}
          </p>
        </div>

        {/* CTAs */}
        <div className="hero-reveal-4" style={{
          display: "flex", gap: 12, flexWrap: "wrap", justifyContent: "center",
          marginBottom: isMobile ? 28 : 40,
        }}>
          <Link href="/booking" className="btn-gold" style={{
            padding: isMobile ? "14px 28px" : "16px 44px",
            fontSize: isMobile ? 13 : 15,
            boxShadow: "0 4px 24px rgba(246,190,0,0.25)",
          }}>
            {t.hero.cta1}
          </Link>
          <Link href="#services" className="btn-outline" style={{
            padding: isMobile ? "14px 28px" : "16px 44px",
            fontSize: isMobile ? 13 : 15,
            backdropFilter: "blur(8px)",
          }}>
            {t.hero.cta2}
          </Link>
        </div>

        {/* Stats row */}
        <div className="hero-reveal-5" style={{
          display: "grid",
          gridTemplateColumns: isMobile ? "repeat(4, 1fr)" : "repeat(4, auto)",
          gap: isMobile ? 12 : 48,
          paddingTop: 20,
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

      {/* Slider dots */}
      <div style={{
        position: "absolute", bottom: isMobile ? 16 : 28,
        left: "50%", transform: "translateX(-50%)",
        zIndex: 10, display: "flex", gap: 10, alignItems: "center",
      }}>
        {slides.map((_, i) => (
          <button
            key={i}
            aria-label={`Slide ${i + 1}`}
            onClick={() => { setCurrent(i); setTextKey(k => k + 1); }}
            style={{
              width: i === current ? 32 : 10,
              height: 10,
              borderRadius: 5,
              border: "none",
              cursor: "pointer",
              background: i === current ? "#F6BE00" : "rgba(255,255,255,0.2)",
              transition: "all 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
              padding: 0,
              boxShadow: i === current ? "0 0 14px rgba(246,190,0,0.5)" : "none",
            }}
          />
        ))}
      </div>

      {/* Scroll indicator — fades out on scroll */}
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

      {/* Bottom fade to page background */}
      <div style={{
        position: "absolute", bottom: 0, left: 0, right: 0, height: 120, zIndex: 6,
        background: "linear-gradient(to bottom, transparent, #050505)",
        pointerEvents: "none",
      }} />
    </section>
  );
}
