"use client";

import { useState, useRef, useCallback } from "react";
import Image from "next/image";
import { useReveal } from "@/hooks/useReveal";
import { useLanguage } from "@/i18n/LanguageContext";

export default function BeforeAfter() {
  const { t, locale } = useLanguage();
  const ref = useReveal([locale]);
  const isAr = locale === "ar";
  const fontDisplay = isAr ? "var(--font-ar)" : "var(--font-display)";
  const [pos, setPos] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  const updatePos = useCallback((clientX: number) => {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = clientX - rect.left;
    const pct = Math.max(5, Math.min(95, (x / rect.width) * 100));
    setPos(pct);
  }, []);

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    dragging.current = true;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    updatePos(e.clientX);
  }, [updatePos]);

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragging.current) return;
    updatePos(e.clientX);
  }, [updatePos]);

  const onPointerUp = useCallback(() => {
    dragging.current = false;
  }, []);

  const beforeLabel = isAr ? "قبل" : "Before";
  const afterLabel = isAr ? "بعد" : "After";
  const heading1 = isAr ? "شاهد " : "See the ";
  const heading2 = isAr ? "الفرق" : "Difference";
  const subtitle = isAr ? "حماية حقيقية تبدأ من أول طبقة." : "Real protection starts with the first layer.";

  return (
    <section ref={ref} style={{ padding: "96px 0", background: "linear-gradient(180deg, #050505, #0a0a0a, #050505)" }}>
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "0 24px" }}>
        <div className="reveal" style={{ textAlign: "center", maxWidth: 560, margin: "0 auto 48px" }}>
          <span className="section-badge">{isAr ? "المقارنة" : "Compare"}</span>
          <h2 style={{ fontFamily: fontDisplay, fontSize: "clamp(28px, 5vw, 44px)", fontWeight: 700, marginBottom: 12 }}>
            <span style={{ color: "#fff" }}>{heading1}</span>
            <span className="gold-text">{heading2}</span>
          </h2>
          <p style={{ color: "rgba(255,255,255,0.45)", fontSize: 16 }}>{subtitle}</p>
        </div>

        <div
          ref={containerRef}
          className="reveal"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          style={{
            position: "relative", borderRadius: 16, overflow: "hidden",
            aspectRatio: "16/9", cursor: "ew-resize", userSelect: "none", touchAction: "none",
            border: "2px solid rgba(246,190,0,0.15)",
          }}
        >
          {/* After image (full width, underneath) */}
          <div style={{ position: "absolute", inset: 0 }}>
            <Image src="/images/DSC03292.jpg" alt={afterLabel} fill className="object-cover" quality={90} />
          </div>

          {/* Before image (clipped) */}
          <div style={{ position: "absolute", inset: 0, clipPath: `inset(0 ${100 - pos}% 0 0)` }}>
            <Image src="/images/DSC03060.jpg" alt={beforeLabel} fill className="object-cover" quality={90} />
          </div>

          {/* Slider line */}
          <div style={{
            position: "absolute", top: 0, bottom: 0,
            left: `${pos}%`, transform: "translateX(-50%)",
            width: 3, background: "#F6BE00",
            boxShadow: "0 0 12px rgba(246,190,0,0.4)",
            zIndex: 10,
          }} />

          {/* Slider handle */}
          <div style={{
            position: "absolute", top: "50%", left: `${pos}%`,
            transform: "translate(-50%, -50%)", zIndex: 11,
            width: 48, height: 48, borderRadius: "50%",
            background: "#F6BE00", border: "3px solid #fff",
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 4px 20px rgba(0,0,0,0.4)",
            transition: dragging.current ? "none" : "box-shadow 0.3s",
          }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M8 6l-4 6 4 6" /><path d="M16 6l4 6-4 6" />
            </svg>
          </div>

          {/* Before label */}
          <div style={{
            position: "absolute", top: 16, ...(isAr ? { right: 16 } : { left: 16 }), zIndex: 5,
            padding: "6px 16px", borderRadius: 100,
            background: "rgba(0,0,0,0.6)", backdropFilter: "blur(8px)",
            color: "#fff", fontSize: 12, fontWeight: 700,
            textTransform: isAr ? "none" : "uppercase" as const,
            letterSpacing: isAr ? "0" : "0.08em",
            opacity: pos > 15 ? 1 : 0, transition: "opacity 0.3s",
          }}>
            {beforeLabel}
          </div>

          {/* After label */}
          <div style={{
            position: "absolute", top: 16, ...(isAr ? { left: 16 } : { right: 16 }), zIndex: 5,
            padding: "6px 16px", borderRadius: 100,
            background: "rgba(246,190,0,0.2)", backdropFilter: "blur(8px)",
            border: "1px solid rgba(246,190,0,0.3)",
            color: "#F6BE00", fontSize: 12, fontWeight: 700,
            textTransform: isAr ? "none" : "uppercase" as const,
            letterSpacing: isAr ? "0" : "0.08em",
            opacity: pos < 85 ? 1 : 0, transition: "opacity 0.3s",
          }}>
            {afterLabel}
          </div>
        </div>
      </div>
    </section>
  );
}
