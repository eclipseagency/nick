"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useLanguage } from "@/i18n/LanguageContext";

interface Props {
  image: string;
  badge?: string;
  heading1: string;
  heading2: string;
  subtitle?: string;
}

export default function PageHero({ image, badge, heading1, heading2, subtitle }: Props) {
  const { locale } = useLanguage();
  const isAr = locale === "ar";
  const fontDisplay = isAr ? "var(--font-ar)" : "var(--font-display)";
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // Gold dust particles — desktop only
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || isMobile) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      const rect = canvas.parentElement?.getBoundingClientRect();
      canvas.width = rect?.width || window.innerWidth;
      canvas.height = rect?.height || 420;
    };
    resize();
    window.addEventListener("resize", resize);

    interface P { x: number; y: number; vx: number; vy: number; size: number; alpha: number; }
    const particles: P[] = [];
    for (let i = 0; i < 30; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.2,
        vy: -Math.random() * 0.3 - 0.05,
        size: Math.random() * 1.5 + 0.3,
        alpha: Math.random() * 0.35 + 0.05,
      });
    }

    let animId: number;
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        p.alpha -= 0.0008;
        if (p.alpha <= 0 || p.y < -10) {
          p.x = Math.random() * canvas.width;
          p.y = canvas.height + 5;
          p.alpha = Math.random() * 0.35 + 0.05;
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

  return (
    <section style={{
      position: "relative",
      minHeight: isMobile ? 320 : "clamp(380px, 50vh, 480px)",
      display: "flex", alignItems: "center", justifyContent: "center",
      overflow: "hidden",
    }}>
      {/* Background image with Ken Burns */}
      <div style={{
        position: "absolute", inset: "-6%",
        animation: "kenBurns1 12s ease-in-out forwards",
      }}>
        <Image src={image} alt="" fill className="object-cover" style={{ objectPosition: "center 40%" }} priority />
      </div>

      {/* Cinematic overlays */}
      <div style={{
        position: "absolute", inset: 0,
        background: "linear-gradient(180deg, rgba(5,5,5,0.8) 0%, rgba(5,5,5,0.4) 40%, rgba(5,5,5,0.6) 70%, rgba(5,5,5,0.97) 100%)",
      }} />
      <div style={{
        position: "absolute", inset: 0,
        background: "radial-gradient(ellipse 60% 60% at 50% 50%, rgba(246,190,0,0.04) 0%, transparent 70%)",
      }} />

      {/* Particles canvas */}
      {!isMobile && (
        <canvas ref={canvasRef} style={{ position: "absolute", inset: 0, zIndex: 3, pointerEvents: "none" }} />
      )}

      {/* Content */}
      <div style={{
        position: "relative", zIndex: 5, textAlign: "center",
        padding: isMobile
          ? "100px 20px 48px"
          : "clamp(120px, 18vw, 160px) clamp(16px, 4vw, 24px) clamp(56px, 10vw, 96px)",
        maxWidth: 700, margin: "0 auto",
      }}>
        {badge && (
          <div className="hero-reveal-1" style={{
            display: "inline-flex", alignItems: "center", gap: 8,
            padding: "7px 18px", borderRadius: 100, marginBottom: 20,
            background: "rgba(246,190,0,0.06)", border: "1px solid rgba(246,190,0,0.18)",
            backdropFilter: "blur(8px)",
          }}>
            <div style={{
              width: 5, height: 5, borderRadius: "50%", background: "#F6BE00",
              boxShadow: "0 0 6px rgba(246,190,0,0.5)",
            }} />
            <span style={{
              color: "#F6BE00", fontSize: 11, fontWeight: 600,
              letterSpacing: isAr ? "0" : "0.1em",
              textTransform: isAr ? "none" : "uppercase",
            }}>{badge}</span>
          </div>
        )}

        <h1 className="hero-reveal-2" style={{
          fontFamily: fontDisplay,
          fontSize: isMobile ? "clamp(28px, 9vw, 42px)" : "clamp(40px, 6vw, 56px)",
          fontWeight: 800, lineHeight: 1.1, marginBottom: 14,
          letterSpacing: isAr ? "0" : "-0.02em",
        }}>
          <span style={{ color: "#fff" }}>{heading1}</span>
          <span className="gold-text">{heading2}</span>
        </h1>

        <div className="hero-reveal-3 section-divider" />

        {subtitle && (
          <p className="hero-reveal-3" style={{
            color: "rgba(255,255,255,0.5)",
            fontSize: isMobile ? 14 : "clamp(15px, 2.5vw, 18px)",
            lineHeight: 1.7, maxWidth: 520, margin: "0 auto",
          }}>
            {subtitle}
          </p>
        )}
      </div>

      {/* Bottom fade */}
      <div style={{
        position: "absolute", bottom: 0, left: 0, right: 0, height: 80, zIndex: 6,
        background: "linear-gradient(to bottom, transparent, #050505)",
        pointerEvents: "none",
      }} />
    </section>
  );
}
