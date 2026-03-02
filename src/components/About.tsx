"use client";

import Image from "next/image";
import { useReveal } from "@/hooks/useReveal";

export default function About() {
  const ref = useReveal();

  return (
    <section id="about" ref={ref} style={{ padding: "96px 0", overflow: "hidden" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px" }}>
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Image */}
          <div className="reveal" style={{ position: "relative" }}>
            <div style={{ position: "relative", aspectRatio: "4/5", borderRadius: 16, overflow: "hidden", boxShadow: "0 0 40px rgba(246,190,0,0.08)" }}>
              <Image src="/images/DSC02995.jpg" alt="NICK team" fill className="object-cover" style={{ transition: "transform 0.8s ease" }} />
              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(5,5,5,0.5), transparent)" }} />
            </div>
            <div style={{ position: "absolute", bottom: -20, right: -20, background: "#111", border: "1px solid rgba(246,190,0,0.2)", borderRadius: 14, padding: "20px 24px", boxShadow: "0 0 20px rgba(246,190,0,0.08)" }}>
              <div className="gold-text" style={{ fontFamily: "var(--font-display)", fontSize: 32, fontWeight: 700 }}>1999</div>
              <div style={{ color: "rgba(255,255,255,0.45)", fontSize: 13, marginTop: 2 }}>Established</div>
            </div>
          </div>

          {/* Text */}
          <div className="reveal reveal-delay-2">
            <span className="section-badge">Our Story</span>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(28px, 5vw, 44px)", fontWeight: 700, lineHeight: 1.15, marginBottom: 24 }}>
              <span style={{ color: "#fff" }}>Each Service Begins With </span>
              <span className="gold-text">Confidence</span>
            </h2>
            <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 17, lineHeight: 1.7, marginBottom: 20 }}>
              For over 27 years, NICK has been at the forefront of automotive protection. As both a manufacturer and installer, we control every step — from factory floor to your vehicle.
            </p>
            <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 15, lineHeight: 1.7, marginBottom: 36 }}>
              Our rhino emblem represents the strength built into every film we produce. Based in Saudi Arabia, we serve enthusiasts who demand the best.
            </p>

            <div className="grid grid-cols-2 gap-5">
              {[
                { t: "Own Manufacturing", d: "Full production control" },
                { t: "Premium Materials", d: "International standards" },
                { t: "Expert Installation", d: "Trained professionals" },
                { t: "Real Warranties", d: "Up to 10 years" },
              ].map((i) => (
                <div key={i.t} style={{ display: "flex", gap: 12 }}>
                  <div style={{ width: 3, borderRadius: 2, background: "rgba(246,190,0,0.3)", flexShrink: 0, transition: "background 0.3s" }} />
                  <div>
                    <div style={{ color: "#fff", fontWeight: 600, fontSize: 14 }}>{i.t}</div>
                    <div style={{ color: "rgba(255,255,255,0.35)", fontSize: 13 }}>{i.d}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
