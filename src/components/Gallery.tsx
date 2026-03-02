"use client";

import Image from "next/image";
import { useReveal } from "@/hooks/useReveal";
import { useLanguage } from "@/i18n/LanguageContext";

export default function Gallery() {
  const { t, locale } = useLanguage();
  const ref = useReveal([locale]);
  const isAr = locale === "ar";
  const fontDisplay = isAr ? "var(--font-ar)" : "var(--font-display)";

  const imgs = [
    { src: "/images/DSC03261.jpg", alt: t.gallery.alt1, cls: "md:col-span-2 md:row-span-2" },
    { src: "/images/DSC03095.jpg", alt: t.gallery.alt2, cls: "" },
    { src: "/images/DSC03292.jpg", alt: t.gallery.alt3, cls: "" },
    { src: "/images/DSC03174.jpg", alt: t.gallery.alt4, cls: "md:row-span-2" },
    { src: "/images/DSC03038.jpg", alt: t.gallery.alt5, cls: "" },
    { src: "/images/0a9b9f31-91ea-4064-bab3-8d3c780e3878.jpg", alt: t.gallery.alt6, cls: "" },
  ];

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
          {imgs.map((img) => (
            <div key={img.src} className={`gallery-item group ${img.cls}`} style={{ position: "relative", borderRadius: 12, overflow: "hidden", cursor: "pointer" }}>
              <Image src={img.src} alt={img.alt} fill className="object-cover" />
              <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0)", transition: "background 0.4s", display: "flex", alignItems: "flex-end", padding: 16 }} className="group-hover:!bg-black/50">
                <span style={{ color: "#fff", fontSize: 13, opacity: 0, transform: "translateY(8px)", transition: "all 0.4s" }} className="group-hover:!opacity-100 group-hover:!translate-y-0">{img.alt}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
