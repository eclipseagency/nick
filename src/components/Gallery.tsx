"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { useReveal } from "@/hooks/useReveal";
import { useLanguage } from "@/i18n/LanguageContext";

export default function Gallery() {
  const { t, locale } = useLanguage();
  const ref = useReveal([locale]);
  const isAr = locale === "ar";
  const fontDisplay = isAr ? "var(--font-ar)" : "var(--font-display)";
  const [lightbox, setLightbox] = useState<number | null>(null);

  const imgs = [
    { src: "/images/DSC03261.jpg", alt: t.gallery.alt1, cls: "md:col-span-2 md:row-span-2" },
    { src: "/images/DSC03095.jpg", alt: t.gallery.alt2, cls: "" },
    { src: "/images/DSC03292.jpg", alt: t.gallery.alt3, cls: "" },
    { src: "/images/DSC03174.jpg", alt: t.gallery.alt4, cls: "md:row-span-2" },
    { src: "/images/DSC03038.jpg", alt: t.gallery.alt5, cls: "" },
    { src: "/images/0a9b9f31-91ea-4064-bab3-8d3c780e3878.jpg", alt: t.gallery.alt6, cls: "" },
  ];

  const navigate = useCallback((dir: number) => {
    setLightbox(prev => {
      if (prev === null) return null;
      const next = prev + dir;
      if (next < 0) return imgs.length - 1;
      if (next >= imgs.length) return 0;
      return next;
    });
  }, [imgs.length]);

  useEffect(() => {
    if (lightbox === null) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightbox(null);
      if (e.key === "ArrowRight") navigate(isAr ? -1 : 1);
      if (e.key === "ArrowLeft") navigate(isAr ? 1 : -1);
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handler);
    return () => { document.body.style.overflow = ""; window.removeEventListener("keydown", handler); };
  }, [lightbox, navigate, isAr]);

  return (
    <section id="gallery" ref={ref} style={{ padding: "96px 0" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px" }}>
        <div className="reveal" style={{ textAlign: "center", maxWidth: 560, margin: "0 auto 56px" }}>
          <span className="section-badge">{t.gallery.badge}</span>
          <h2 style={{ fontFamily: fontDisplay, fontSize: "clamp(28px, 5vw, 44px)", fontWeight: 700, marginBottom: 12 }}>
            <span style={{ color: "#fff" }}>{t.gallery.heading1}</span>
            <span className="gold-text">{t.gallery.heading2}</span>
          </h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 reveal" style={{ gridAutoRows: "clamp(160px, 20vw, 220px)" }}>
          {imgs.map((img, i) => (
            <div key={img.src} className={`gallery-item group ${img.cls}`}
              onClick={() => setLightbox(i)}
              style={{ position: "relative", borderRadius: 12, overflow: "hidden", cursor: "pointer" }}>
              <Image src={img.src} alt={img.alt} fill className="object-cover" />
              <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0)", transition: "background 0.4s", display: "flex", alignItems: "flex-end", justifyContent: "space-between", padding: 16 }} className="group-hover:!bg-black/50">
                <span style={{ color: "#fff", fontSize: 13, opacity: 0, transform: "translateY(8px)", transition: "all 0.4s" }} className="group-hover:!opacity-100 group-hover:!translate-y-0">{img.alt}</span>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgba(246,190,0,0.8)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
                  style={{ opacity: 0, transition: "opacity 0.4s" }} className="group-hover:!opacity-100">
                  <path d="M15 3h6v6"/><path d="M9 21H3v-6"/><path d="M21 3l-7 7"/><path d="M3 21l7-7"/>
                </svg>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Lightbox overlay */}
      {lightbox !== null && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={imgs[lightbox].alt}
          onClick={() => setLightbox(null)}
          style={{
            position: "fixed", inset: 0, zIndex: 100,
            background: "rgba(0,0,0,0.95)", backdropFilter: "blur(10px)",
            display: "flex", alignItems: "center", justifyContent: "center",
            animation: "fadeUp 0.3s ease-out",
          }}
        >
          {/* Close button */}
          <button aria-label="Close lightbox" onClick={() => setLightbox(null)} style={{
            position: "absolute", top: 20, right: 20, zIndex: 10,
            width: 44, height: 44, borderRadius: "50%", cursor: "pointer",
            background: "rgba(255,255,255,0.1)", border: "1px solid rgba(255,255,255,0.2)",
            color: "#fff", fontSize: 20, display: "flex", alignItems: "center", justifyContent: "center",
          }}>✕</button>

          {/* Prev arrow */}
          <button
            aria-label="Previous image"
            onClick={(e) => { e.stopPropagation(); navigate(isAr ? 1 : -1); }}
            style={{
              position: "absolute", left: 20, top: "50%", transform: "translateY(-50%)", zIndex: 10,
              width: 48, height: 48, borderRadius: "50%", cursor: "pointer",
              background: "rgba(246,190,0,0.15)", border: "1px solid rgba(246,190,0,0.3)",
              color: "#F6BE00", fontSize: 24, display: "flex", alignItems: "center", justifyContent: "center",
              transition: "background 0.3s",
            }}
            onMouseEnter={e => { e.currentTarget.style.background = "rgba(246,190,0,0.3)"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "rgba(246,190,0,0.15)"; }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
          </button>

          {/* Image */}
          <div onClick={(e) => e.stopPropagation()} style={{ position: "relative", width: "85vw", height: "80vh", maxWidth: 1200 }}>
            <Image
              src={imgs[lightbox].src}
              alt={imgs[lightbox].alt}
              fill
              className="object-contain"
              sizes="85vw"
              quality={95}
            />
          </div>

          {/* Next arrow */}
          <button
            aria-label="Next image"
            onClick={(e) => { e.stopPropagation(); navigate(isAr ? -1 : 1); }}
            style={{
              position: "absolute", right: 20, top: "50%", transform: "translateY(-50%)", zIndex: 10,
              width: 48, height: 48, borderRadius: "50%", cursor: "pointer",
              background: "rgba(246,190,0,0.15)", border: "1px solid rgba(246,190,0,0.3)",
              color: "#F6BE00", fontSize: 24, display: "flex", alignItems: "center", justifyContent: "center",
              transition: "background 0.3s",
            }}
            onMouseEnter={e => { e.currentTarget.style.background = "rgba(246,190,0,0.3)"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "rgba(246,190,0,0.15)"; }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18l6-6-6-6"/></svg>
          </button>

          {/* Counter + caption */}
          <div style={{ position: "absolute", bottom: 24, left: "50%", transform: "translateX(-50%)", textAlign: "center" }}>
            <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 13, marginBottom: 4 }}>{lightbox + 1} / {imgs.length}</div>
            <div style={{ color: "#F6BE00", fontSize: 14, fontWeight: 600 }}>{imgs[lightbox].alt}</div>
          </div>
        </div>
      )}
    </section>
  );
}
