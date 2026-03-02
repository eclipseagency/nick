"use client";

import Image from "next/image";
import Link from "next/link";
import { useReveal } from "@/hooks/useReveal";

export default function Contact() {
  const ref = useReveal();

  return (
    <section id="contact" ref={ref} style={{ padding: "96px 0" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px" }}>
        <div className="reveal" style={{ position: "relative", borderRadius: 20, overflow: "hidden" }}>
          <div style={{ position: "absolute", inset: 0 }}>
            <Image src="/images/DSC03261.jpg" alt="NICK team" fill className="object-cover" />
            <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to right, rgba(5,5,5,0.95), rgba(5,5,5,0.75), rgba(5,5,5,0.4))" }} />
          </div>
          <div style={{ position: "relative", zIndex: 1, padding: "clamp(40px, 6vw, 80px)" }}>
            <div style={{ maxWidth: 480 }}>
              <h2 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(28px, 5vw, 44px)", fontWeight: 700, lineHeight: 1.15, marginBottom: 20 }}>
                <span style={{ color: "#fff" }}>Visit Our </span><span className="gold-text">Showroom</span>
              </h2>
              <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 16, lineHeight: 1.7, marginBottom: 32 }}>
                Premium protection with up to 10 years warranty. Come see the NICK difference.
              </p>
              <div style={{ display: "flex", flexWrap: "wrap" as const, gap: 12, marginBottom: 40 }}>
                <Link href="https://nick.sa" target="_blank" className="btn-gold">Online Store</Link>
                <Link href="#booking" className="btn-outline">Book a Service</Link>
              </div>
              <div className="grid grid-cols-3 gap-4" style={{ paddingTop: 24, borderTop: "1px solid rgba(255,255,255,0.1)" }}>
                {[
                  { l: "Location", v: "Riyadh, KSA" },
                  { l: "Website", v: "nick.sa" },
                  { l: "Since", v: "1999" },
                ].map(c => (
                  <div key={c.l}>
                    <div style={{ color: "#F6BE00", fontSize: 11, fontWeight: 600, textTransform: "uppercase" as const, letterSpacing: "0.08em", marginBottom: 4 }}>{c.l}</div>
                    <div style={{ color: "rgba(255,255,255,0.45)", fontSize: 13 }}>{c.v}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
