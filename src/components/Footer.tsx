import Image from "next/image";
import Link from "next/link";

export default function Footer() {
  return (
    <footer style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "48px 24px" }}>
        <div className="grid md:grid-cols-3 gap-10">
          <div>
            <Image src="/images/logo-white.png" alt="NICK" width={120} height={40} style={{ marginBottom: 16 }} />
            <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 13, lineHeight: 1.7, maxWidth: 360 }}>
              High Performance Automotive Film. Protecting vehicles across Saudi Arabia since 1999.
            </p>
          </div>
          <div>
            <h4 style={{ color: "#fff", fontWeight: 700, fontSize: 12, letterSpacing: "0.1em", textTransform: "uppercase" as const, marginBottom: 16 }}>Services</h4>
            {["Paint Protection Film", "Thermal Insulation", "Nano Ceramic", "Color Wrapping"].map(s => (
              <Link key={s} href="#services" style={{ display: "block", color: "rgba(255,255,255,0.3)", fontSize: 13, marginBottom: 8, textDecoration: "none" }}>{s}</Link>
            ))}
          </div>
          <div>
            <h4 style={{ color: "#fff", fontWeight: 700, fontSize: 12, letterSpacing: "0.1em", textTransform: "uppercase" as const, marginBottom: 16 }}>Company</h4>
            {[{ l: "About", h: "#about" }, { l: "Gallery", h: "#gallery" }, { l: "Book Now", h: "#booking" }, { l: "Store", h: "https://nick.sa" }].map(s => (
              <Link key={s.l} href={s.h} style={{ display: "block", color: "rgba(255,255,255,0.3)", fontSize: 13, marginBottom: 8, textDecoration: "none" }}>{s.l}</Link>
            ))}
          </div>
        </div>
        <div style={{ marginTop: 40, paddingTop: 20, borderTop: "1px solid rgba(255,255,255,0.05)", display: "flex", justifyContent: "space-between", flexWrap: "wrap" as const, gap: 8 }}>
          <p style={{ color: "rgba(255,255,255,0.2)", fontSize: 12 }}>&copy; {new Date().getFullYear()} NICK. All rights reserved.</p>
          <p style={{ color: "rgba(255,255,255,0.12)", fontSize: 11 }}>Riyadh, Saudi Arabia</p>
        </div>
      </div>
    </footer>
  );
}
