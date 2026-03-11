"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import Image from "next/image";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useReveal } from "@/hooks/useReveal";
import { useLanguage } from "@/i18n/LanguageContext";

type Category = "all" | "ppf" | "tinting" | "ceramic" | "factory";

interface GalleryImage {
  src: string;
  alt: string;
  category: Category;
}

export default function GalleryPage() {
  const { t, locale } = useLanguage();
  const ref = useReveal([locale]);
  const isAr = locale === "ar";
  const fontDisplay = isAr ? "var(--font-ar)" : "var(--font-display)";

  const [activeFilter, setActiveFilter] = useState<Category>("all");
  const [lightbox, setLightbox] = useState<number | null>(null);

  const allImages: GalleryImage[] = useMemo(() => [
    // PPF
    { src: "/images/DSC03279.jpg", alt: isAr ? "حماية طلاء PPF" : "PPF Paint Protection", category: "ppf" as Category },
    { src: "/images/DSC03292.jpg", alt: isAr ? "تركيب فيلم حماية" : "Protection Film Install", category: "ppf" as Category },
    { src: "/images/DSC03235.jpg", alt: isAr ? "حماية كامل الجسم" : "Full Body Protection", category: "ppf" as Category },
    { src: "/images/DSC03064.jpg", alt: isAr ? "تطبيق PPF احترافي" : "Professional PPF Application", category: "ppf" as Category },
    // Tinting
    { src: "/images/DSC03136.jpg", alt: isAr ? "عزل حراري للنوافذ" : "Window Thermal Insulation", category: "tinting" as Category },
    { src: "/images/DSC03174.jpg", alt: isAr ? "تظليل نانو سيراميك" : "Nano Ceramic Tinting", category: "tinting" as Category },
    { src: "/images/DSC03095.jpg", alt: isAr ? "تركيب عازل حراري" : "Tint Installation", category: "tinting" as Category },
    // Ceramic
    { src: "/images/DSC02995.jpg", alt: isAr ? "طلاء سيراميك" : "Ceramic Coating", category: "ceramic" as Category },
    { src: "/images/DSC03018.jpg", alt: isAr ? "لمعان سيراميك" : "Ceramic Shine", category: "ceramic" as Category },
    { src: "/images/DSC03038.jpg", alt: isAr ? "حماية نانو سيراميك" : "Nano Ceramic Protection", category: "ceramic" as Category },
    // Factory
    { src: "/images/0a9b9f31-91ea-4064-bab3-8d3c780e3878.jpg", alt: isAr ? "مصنع NICK" : "NICK Factory", category: "factory" as Category },
    { src: "/images/DSC03261.jpg", alt: isAr ? "الفريق مع أودي" : "Team with Audi", category: "factory" as Category },
    { src: "/images/DSC03060.jpg", alt: isAr ? "ورشة العمل" : "Workshop", category: "factory" as Category },
    { src: "/images/IMG_9912.JPG", alt: isAr ? "بيئة العمل" : "Work Environment", category: "factory" as Category },
    { src: "/images/IMG_9536.PNG", alt: isAr ? "فريق NICK" : "NICK Team", category: "factory" as Category },
  ], [isAr]);

  const filtered = useMemo(() =>
    activeFilter === "all" ? allImages : allImages.filter(img => img.category === activeFilter),
    [activeFilter, allImages]
  );

  const filters: { key: Category; en: string; ar: string }[] = [
    { key: "all", en: "All", ar: "الكل" },
    { key: "ppf", en: "PPF", ar: "حماية الطلاء" },
    { key: "tinting", en: "Tinting", ar: "عزل حراري" },
    { key: "ceramic", en: "Ceramic", ar: "سيراميك" },
    { key: "factory", en: "Factory", ar: "المصنع" },
  ];

  const navigate = useCallback((dir: number) => {
    setLightbox(prev => {
      if (prev === null) return null;
      const next = prev + dir;
      if (next < 0) return filtered.length - 1;
      if (next >= filtered.length) return 0;
      return next;
    });
  }, [filtered.length]);

  useEffect(() => {
    if (lightbox === null) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightbox(null);
      if (e.key === "ArrowRight") navigate(isAr ? -1 : 1);
      if (e.key === "ArrowLeft") navigate(isAr ? 1 : -1);
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handler);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handler);
    };
  }, [lightbox, navigate, isAr]);

  // Close lightbox when filter changes
  useEffect(() => {
    setLightbox(null);
  }, [activeFilter]);

  const categoryLabels: Record<Category, { en: string; ar: string }> = {
    all: { en: "All", ar: "الكل" },
    ppf: { en: "PPF", ar: "PPF" },
    tinting: { en: "Tint", ar: "تظليل" },
    ceramic: { en: "Ceramic", ar: "سيراميك" },
    factory: { en: "Factory", ar: "المصنع" },
  };

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ImageGallery",
    name: "NICK Work Gallery",
    description: "Portfolio of automotive protection work including PPF, ceramic coating, window tinting, and color wrapping.",
    url: "https://nick-fawn.vercel.app/gallery",
    publisher: { "@id": "https://nick-fawn.vercel.app/#business" },
    breadcrumb: {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: "https://nick-fawn.vercel.app" },
        { "@type": "ListItem", position: 2, name: "Gallery", item: "https://nick-fawn.vercel.app/gallery" },
      ],
    },
  };

  return (
    <main>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Navbar />

      {/* Hero Banner */}
      <section
        style={{
          position: "relative",
          minHeight: 340,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          overflow: "hidden",
        }}
      >
        <Image
          src="/images/DSC03261.jpg"
          alt="Gallery hero"
          fill
          className="object-cover"
          priority
          style={{ zIndex: 0 }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(to bottom, rgba(5,5,5,0.8) 0%, rgba(5,5,5,0.65) 100%)",
            zIndex: 1,
          }}
        />
        <div style={{ position: "relative", zIndex: 2, padding: "120px 24px 64px" }}>
          <span className="section-badge">{t.gallery.badge}</span>
          <h1
            style={{
              fontFamily: fontDisplay,
              fontSize: "clamp(32px, 6vw, 56px)",
              fontWeight: 700,
              marginTop: 12,
            }}
          >
            <span style={{ color: "#fff" }}>{t.gallery.heading1}</span>
            <span className="gold-text">{t.gallery.heading2}</span>
          </h1>
        </div>
      </section>

      {/* Gallery Section */}
      <section ref={ref} style={{ padding: "64px 0 96px", background: "#050505" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px" }}>

          {/* Filter Tabs */}
          <div
            className="reveal"
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: 10,
              justifyContent: "center",
              marginBottom: 48,
            }}
          >
            {filters.map((f) => {
              const active = activeFilter === f.key;
              return (
                <button
                  key={f.key}
                  onClick={() => setActiveFilter(f.key)}
                  style={{
                    padding: "10px 24px",
                    borderRadius: 999,
                    border: active ? "1px solid #F6BE00" : "1px solid rgba(255,255,255,0.15)",
                    background: active ? "rgba(246,190,0,0.15)" : "rgba(255,255,255,0.04)",
                    color: active ? "#F6BE00" : "rgba(255,255,255,0.6)",
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: "pointer",
                    transition: "all 0.3s",
                    fontFamily: isAr ? "var(--font-ar)" : "inherit",
                  }}
                  onMouseEnter={(e) => {
                    if (!active) {
                      e.currentTarget.style.borderColor = "rgba(246,190,0,0.4)";
                      e.currentTarget.style.color = "#F6BE00";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!active) {
                      e.currentTarget.style.borderColor = "rgba(255,255,255,0.15)";
                      e.currentTarget.style.color = "rgba(255,255,255,0.6)";
                    }
                  }}
                >
                  {isAr ? f.ar : f.en}
                </button>
              );
            })}
          </div>

          {/* Gallery Grid */}
          <div
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 reveal"
            style={{ gridAutoRows: "clamp(180px, 22vw, 260px)" }}
          >
            {filtered.map((img, i) => (
              <div
                key={img.src}
                className="gallery-item group"
                onClick={() => setLightbox(i)}
                style={{
                  position: "relative",
                  borderRadius: 12,
                  overflow: "hidden",
                  cursor: "pointer",
                }}
              >
                <Image src={img.src} alt={img.alt} fill className="object-cover" sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw" />

                {/* Category tag */}
                <span
                  style={{
                    position: "absolute",
                    top: 10,
                    [isAr ? "right" : "left"]: 10,
                    padding: "4px 10px",
                    borderRadius: 6,
                    background: "rgba(246,190,0,0.2)",
                    border: "1px solid rgba(246,190,0,0.3)",
                    color: "#F6BE00",
                    fontSize: 11,
                    fontWeight: 600,
                    zIndex: 2,
                    backdropFilter: "blur(8px)",
                    letterSpacing: "0.03em",
                  }}
                >
                  {isAr ? categoryLabels[img.category].ar : categoryLabels[img.category].en}
                </span>

                {/* Hover overlay */}
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    background: "rgba(0,0,0,0)",
                    transition: "background 0.4s",
                    display: "flex",
                    alignItems: "flex-end",
                    justifyContent: "space-between",
                    padding: 16,
                  }}
                  className="group-hover:!bg-black/50"
                >
                  <span
                    style={{
                      color: "#fff",
                      fontSize: 13,
                      opacity: 0,
                      transform: "translateY(8px)",
                      transition: "all 0.4s",
                    }}
                    className="group-hover:!opacity-100 group-hover:!translate-y-0"
                  >
                    {img.alt}
                  </span>
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="rgba(246,190,0,0.8)"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    style={{ opacity: 0, transition: "opacity 0.4s" }}
                    className="group-hover:!opacity-100"
                  >
                    <path d="M15 3h6v6" />
                    <path d="M9 21H3v-6" />
                    <path d="M21 3l-7 7" />
                    <path d="M3 21l7-7" />
                  </svg>
                </div>
              </div>
            ))}
          </div>

          {/* Image count */}
          <div className="reveal" style={{ textAlign: "center", marginTop: 32, color: "rgba(255,255,255,0.35)", fontSize: 13 }}>
            {filtered.length} {isAr ? "صورة" : filtered.length === 1 ? "image" : "images"}
          </div>
        </div>
      </section>

      {/* Lightbox */}
      {lightbox !== null && (
        <div
          onClick={() => setLightbox(null)}
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 100,
            background: "rgba(0,0,0,0.95)",
            backdropFilter: "blur(10px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            animation: "fadeUp 0.3s ease-out",
          }}
        >
          {/* Close button */}
          <button
            onClick={() => setLightbox(null)}
            style={{
              position: "absolute",
              top: 20,
              right: 20,
              zIndex: 10,
              width: 44,
              height: 44,
              borderRadius: "50%",
              cursor: "pointer",
              background: "rgba(255,255,255,0.1)",
              border: "1px solid rgba(255,255,255,0.2)",
              color: "#fff",
              fontSize: 20,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            &#10005;
          </button>

          {/* Prev arrow */}
          <button
            onClick={(e) => { e.stopPropagation(); navigate(isAr ? 1 : -1); }}
            style={{
              position: "absolute",
              left: 20,
              top: "50%",
              transform: "translateY(-50%)",
              zIndex: 10,
              width: 48,
              height: 48,
              borderRadius: "50%",
              cursor: "pointer",
              background: "rgba(246,190,0,0.15)",
              border: "1px solid rgba(246,190,0,0.3)",
              color: "#F6BE00",
              fontSize: 24,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "background 0.3s",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(246,190,0,0.3)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(246,190,0,0.15)"; }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>

          {/* Image */}
          <div onClick={(e) => e.stopPropagation()} style={{ position: "relative", width: "85vw", height: "80vh", maxWidth: 1200 }}>
            <Image
              src={filtered[lightbox].src}
              alt={filtered[lightbox].alt}
              fill
              className="object-contain"
              sizes="85vw"
              quality={95}
            />
          </div>

          {/* Next arrow */}
          <button
            onClick={(e) => { e.stopPropagation(); navigate(isAr ? -1 : 1); }}
            style={{
              position: "absolute",
              right: 20,
              top: "50%",
              transform: "translateY(-50%)",
              zIndex: 10,
              width: 48,
              height: 48,
              borderRadius: "50%",
              cursor: "pointer",
              background: "rgba(246,190,0,0.15)",
              border: "1px solid rgba(246,190,0,0.3)",
              color: "#F6BE00",
              fontSize: 24,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "background 0.3s",
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(246,190,0,0.3)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(246,190,0,0.15)"; }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>

          {/* Counter + caption */}
          <div style={{ position: "absolute", bottom: 24, left: "50%", transform: "translateX(-50%)", textAlign: "center" }}>
            <div style={{ color: "rgba(255,255,255,0.5)", fontSize: 13, marginBottom: 4 }}>
              {lightbox + 1} / {filtered.length}
            </div>
            <div style={{ color: "#F6BE00", fontSize: 14, fontWeight: 600 }}>
              {filtered[lightbox].alt}
            </div>
          </div>
        </div>
      )}

      <Footer />
    </main>
  );
}
