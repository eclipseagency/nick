"use client";

import Image from "next/image";
import { useReveal } from "@/hooks/useReveal";

const services = [
  { title: "Paint Protection Film", tag: "PPF", desc: "Invisible self-healing armor against rock chips, scratches, and UV damage.", image: "/images/DSC03279.jpg", feats: ["Self-Healing", "Glossy & Matte", "10yr Warranty"] },
  { title: "Thermal Insulation", tag: "Tint", desc: "Nano-ceramic window films blocking 99% UV rays and reducing cabin heat.", image: "/images/DSC03136.jpg", feats: ["99% UV Block", "Heat Rejection", "Clear Visibility"] },
  { title: "Nano Ceramic Coating", tag: "Ceramic", desc: "Permanent hydrophobic shield with enhanced gloss and easy maintenance.", image: "/images/DSC03018.jpg", feats: ["Hydrophobic", "Enhanced Gloss", "5yr Protection"] },
  { title: "Color Wrapping", tag: "Wrap", desc: "Premium color-change wraps that protect your original paint.", image: "/images/DSC03060.jpg", feats: ["Full Color Change", "Reversible", "Paint Safe"] },
];

export default function Services() {
  const ref = useReveal();

  return (
    <section id="services" ref={ref} style={{ padding: "96px 0", background: "linear-gradient(180deg, #050505, #0a0a0a, #050505)" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px" }}>
        <div className="reveal" style={{ textAlign: "center", maxWidth: 560, margin: "0 auto 56px" }}>
          <span className="section-badge">What We Offer</span>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(28px, 5vw, 44px)", fontWeight: 700, marginBottom: 12 }}>
            <span style={{ color: "#fff" }}>Professional </span>
            <span className="gold-text">Services</span>
          </h2>
          <p style={{ color: "rgba(255,255,255,0.45)", fontSize: 16 }}>Comprehensive automotive protection backed by decades of expertise.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {services.map((s, i) => (
            <div key={s.title} className={`card group reveal reveal-delay-${i + 1}`}>
              <div style={{ position: "relative", height: 240, overflow: "hidden" }}>
                <Image src={s.image} alt={s.title} fill className="object-cover" style={{ transition: "transform 0.6s" }} />
                <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, #111, rgba(17,17,17,0.3), transparent)" }} />
                <span style={{ position: "absolute", top: 14, left: 14, padding: "5px 12px", background: "#F6BE00", color: "#000", fontSize: 11, fontWeight: 700, borderRadius: 6, letterSpacing: "0.05em", textTransform: "uppercase" as const }}>{s.tag}</span>
              </div>
              <div style={{ padding: 24 }}>
                <h3 style={{ fontFamily: "var(--font-display)", color: "#fff", fontSize: 20, fontWeight: 700, marginBottom: 8 }}>{s.title}</h3>
                <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 14, lineHeight: 1.6, marginBottom: 16 }}>{s.desc}</p>
                <div style={{ display: "flex", flexWrap: "wrap" as const, gap: 8 }}>
                  {s.feats.map((f) => (
                    <span key={f} style={{ padding: "5px 12px", fontSize: 11, fontWeight: 500, color: "#F6BE00", border: "1px solid rgba(246,190,0,0.2)", borderRadius: 100, background: "rgba(246,190,0,0.05)", transition: "all 0.3s" }}>{f}</span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
