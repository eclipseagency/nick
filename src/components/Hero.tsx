"use client";

import Image from "next/image";
import Link from "next/link";

export default function Hero() {
  return (
    <section id="hero" style={{ position: "relative", minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
      {/* Background */}
      <div style={{ position: "absolute", inset: 0 }}>
        <Image
          src="/images/DSC03064.jpg"
          alt="NICK - Jetour in studio"
          fill
          style={{ objectFit: "cover", objectPosition: "center" }}
          priority
          quality={90}
        />
        <div style={{ position: "absolute", inset: 0, background: "rgba(5,5,5,0.65)" }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(5,5,5,1) 0%, transparent 35%, transparent 80%, rgba(5,5,5,0.5) 100%)" }} />
      </div>

      {/* Content — fully centered */}
      <div style={{ position: "relative", zIndex: 10, width: "100%", maxWidth: 700, margin: "0 auto", padding: "140px 24px 100px", textAlign: "center" }}>
        {/* Badge */}
        <div className="anim-1" style={{ display: "inline-flex", alignItems: "center", gap: 10, marginBottom: 32 }}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#F6BE00" }} />
          <span style={{ color: "#F6BE00", fontSize: 13, fontWeight: 600, letterSpacing: "0.1em", textTransform: "uppercase" as const }}>
            27 Years of Excellence
          </span>
        </div>

        {/* Heading */}
        <h1 className="anim-2" style={{ fontFamily: "var(--font-display)", fontSize: "clamp(52px, 12vw, 100px)", fontWeight: 800, lineHeight: 0.92, letterSpacing: "-0.03em", marginBottom: 28 }}>
          <span style={{ color: "#fff" }}>Rhino</span><br />
          <span className="gold-text">Tough</span><br />
          <span style={{ color: "#fff" }}>Protection</span>
        </h1>

        {/* Subtitle */}
        <p className="anim-3" style={{ color: "rgba(255,255,255,0.55)", fontSize: 17, lineHeight: 1.75, maxWidth: 480, margin: "0 auto 40px" }}>
          High performance automotive films engineered to shield your vehicle.
          Any road. Any weather. Since 1999.
        </p>

        {/* Buttons */}
        <div className="anim-4" style={{ display: "flex", flexWrap: "wrap" as const, gap: 12, justifyContent: "center", marginBottom: 56 }}>
          <Link href="#booking" className="btn-gold">Book Now</Link>
          <Link href="#services" className="btn-outline">Explore Services</Link>
        </div>

        {/* Stats */}
        <div className="anim-4" style={{ display: "flex", justifyContent: "center", gap: 40, paddingTop: 32, borderTop: "1px solid rgba(255,255,255,0.1)" }}>
          {[
            { n: "27+", l: "Years" },
            { n: "50K+", l: "Cars Protected" },
            { n: "10yr", l: "Warranty" },
          ].map((s) => (
            <div key={s.l} style={{ textAlign: "center" }}>
              <div className="gold-text" style={{ fontFamily: "var(--font-display)", fontSize: 26, fontWeight: 700 }}>{s.n}</div>
              <div style={{ color: "rgba(255,255,255,0.35)", fontSize: 12, marginTop: 4 }}>{s.l}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
