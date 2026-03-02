"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useReveal } from "@/hooks/useReveal";

type Size = "small" | "medium" | "large" | "suv" | null;

const cars = [
  { id: "small" as const, label: "Small Sedan", ar: "سيارة صغيرة", ex: "Civic, Corolla, Elantra", img: "/images/DSC03060.jpg" },
  { id: "medium" as const, label: "Medium Sedan", ar: "سيارة متوسطة", ex: "Camry, Accord, Sonata", img: "/images/DSC03235.jpg" },
  { id: "large" as const, label: "Large / Luxury", ar: "سيارة كبيرة", ex: "S-Class, 7 Series", img: "/images/IMG_9912.JPG" },
  { id: "suv" as const, label: "SUV / Truck", ar: "جيب / شاحنة", ex: "Tahoe, Land Cruiser", img: "/images/DSC03064.jpg" },
];

const svcs = [
  { id: "ppf-full", name: "Full Body PPF", desc: "Complete paint protection", p: { small: 14000, medium: 16000, large: 18500, suv: 22000 }, w: "10yr", img: "/images/DSC03279.jpg" },
  { id: "ppf-front", name: "Front PPF", desc: "Hood, fenders, bumper, mirrors", p: { small: 5500, medium: 6500, large: 7500, suv: 9000 }, w: "10yr", img: "/images/DSC03292.jpg" },
  { id: "tint-full", name: "Full Tint", desc: "All windows + windshield", p: { small: 2400, medium: 2600, large: 2800, suv: 3200 }, w: "10yr", img: "/images/DSC03136.jpg" },
  { id: "tint-front", name: "Windshield Tint", desc: "Front windshield only", p: { small: 1160, medium: 1200, large: 1300, suv: 1400 }, w: "10yr", img: "/images/DSC03174.jpg" },
  { id: "ceramic", name: "Ceramic Coating", desc: "Exterior hydrophobic shield", p: { small: 1350, medium: 1650, large: 1950, suv: 2400 }, w: "5yr", img: "/images/DSC03018.jpg" },
  { id: "ceramic-int", name: "Interior Ceramic", desc: "Leather & trim protection", p: { small: 2300, medium: 2800, large: 3400, suv: 3800 }, w: "3yr", img: "/images/DSC02995.jpg" },
];

export default function Booking() {
  const [step, setStep] = useState(1);
  const [size, setSize] = useState<Size>(null);
  const [sel, setSel] = useState<string[]>([]);
  const [form, setForm] = useState({ name: "", phone: "", notes: "" });

  const ref = useReveal();
  const toggle = (id: string) => setSel(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]);
  const total = sel.reduce((s, id) => { const v = svcs.find(x => x.id === id); return s + (v && size ? v.p[size] : 0); }, 0);

  return (
    <section id="booking" ref={ref} style={{ padding: "96px 0", background: "linear-gradient(180deg, #050505, #0a0a0a, #050505)" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px" }}>
        <div className="reveal" style={{ textAlign: "center", maxWidth: 560, margin: "0 auto 40px" }}>
          <span className="section-badge">Book a Service</span>
          <h2 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(28px, 5vw, 44px)", fontWeight: 700, marginBottom: 12 }}>
            <span style={{ color: "#fff" }}>Get Your </span><span className="gold-text">Protection</span>
          </h2>
          <p style={{ color: "rgba(255,255,255,0.45)", fontSize: 16 }}>Choose your vehicle, pick services, book in under a minute.</p>
        </div>

        {/* Steps */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 48 }}>
          {[{ n: 1, l: "Vehicle" }, { n: 2, l: "Services" }, { n: 3, l: "Confirm" }].map((s, i) => (
            <div key={s.n} style={{ display: "flex", alignItems: "center" }}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                <div style={{
                  width: 40, height: 40, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 14, fontWeight: 700, transition: "all 0.3s",
                  background: step >= s.n ? "#F6BE00" : "#1a1a1a", color: step >= s.n ? "#000" : "rgba(255,255,255,0.3)",
                  border: step >= s.n ? "none" : "1px solid rgba(255,255,255,0.1)",
                }}>
                  {step > s.n ? "\u2713" : s.n}
                </div>
                <span style={{ fontSize: 11, marginTop: 6, color: step >= s.n ? "#F6BE00" : "rgba(255,255,255,0.25)" }}>{s.l}</span>
              </div>
              {i < 2 && <div style={{ width: 60, height: 2, margin: "0 10px", marginBottom: 20, background: step > s.n ? "#F6BE00" : "rgba(255,255,255,0.08)" }} />}
            </div>
          ))}
        </div>

        {/* STEP 1 */}
        {step === 1 && (
          <div>
            <p style={{ textAlign: "center", color: "rgba(255,255,255,0.4)", fontSize: 14, marginBottom: 32 }}>Select the category that matches your car</p>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {cars.map((c) => (
                <button key={c.id} onClick={() => setSize(c.id)} className={size === c.id ? "gold-pulse" : ""} style={{
                  position: "relative", borderRadius: 16, overflow: "hidden", textAlign: "left", cursor: "pointer", background: "none", padding: 0,
                  border: size === c.id ? "2px solid #F6BE00" : "2px solid rgba(255,255,255,0.06)",
                  boxShadow: size === c.id ? "0 0 24px rgba(246,190,0,0.15)" : "none",
                  transition: "all 0.3s",
                  transform: size === c.id ? "scale(1.02)" : "scale(1)",
                }}
                  onMouseEnter={e => { if (size !== c.id) e.currentTarget.style.borderColor = "rgba(246,190,0,0.3)"; }}
                  onMouseLeave={e => { if (size !== c.id) e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)"; }}
                >
                  <div style={{ position: "relative", height: 180 }}>
                    <Image src={c.img} alt={c.label} fill className="object-cover" style={{ transition: "transform 0.5s" }} />
                    <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.2) 100%)" }} />
                    {size === c.id && (
                      <div style={{ position: "absolute", top: 10, right: 10, width: 26, height: 26, borderRadius: "50%", background: "#F6BE00", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, color: "#000", fontWeight: 700 }}>&#10003;</div>
                    )}
                  </div>
                  <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: 14 }}>
                    <div style={{ color: size === c.id ? "#F6BE00" : "#fff", fontWeight: 700, fontSize: 14 }}>{c.label}</div>
                    <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 12 }}>{c.ar}</div>
                    <div style={{ color: "rgba(255,255,255,0.25)", fontSize: 11, marginTop: 4 }}>{c.ex}</div>
                  </div>
                </button>
              ))}
            </div>
            <div style={{ textAlign: "center", marginTop: 40 }}>
              <button onClick={() => size && setStep(2)} disabled={!size} className="btn-gold">Choose Services</button>
            </div>
          </div>
        )}

        {/* STEP 2 */}
        {step === 2 && (
          <div>
            <p style={{ textAlign: "center", color: "rgba(255,255,255,0.4)", fontSize: 14, marginBottom: 32 }}>
              Prices for <strong style={{ color: "#F6BE00" }}>{cars.find(c => c.id === size)?.label}</strong> — select one or more
            </p>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {svcs.map((s) => (
                <button key={s.id} onClick={() => toggle(s.id)} style={{
                  position: "relative", borderRadius: 14, overflow: "hidden", textAlign: "left", cursor: "pointer", background: "none", padding: 0,
                  border: sel.includes(s.id) ? "2px solid #F6BE00" : "2px solid rgba(255,255,255,0.06)",
                  boxShadow: sel.includes(s.id) ? "0 0 16px rgba(246,190,0,0.12)" : "none",
                  transition: "all 0.3s",
                }}>
                  <div style={{ position: "relative", height: 130 }}>
                    <Image src={s.img} alt={s.name} fill className="object-cover" />
                    <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, #111, rgba(17,17,17,0.4), transparent)" }} />
                    <span style={{ position: "absolute", bottom: 10, right: 10, padding: "4px 10px", background: "#F6BE00", color: "#000", fontSize: 12, fontWeight: 700, borderRadius: 6 }}>
                      {size ? s.p[size].toLocaleString() : "—"} SAR
                    </span>
                    {sel.includes(s.id) && (
                      <div style={{ position: "absolute", top: 10, right: 10, width: 24, height: 24, borderRadius: "50%", background: "#F6BE00", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, color: "#000", fontWeight: 700 }}>&#10003;</div>
                    )}
                  </div>
                  <div style={{ padding: "14px 16px", background: "#111" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                      <span style={{ color: "#fff", fontWeight: 700, fontSize: 14 }}>{s.name}</span>
                      <span style={{ fontSize: 10, color: "#F6BE00", border: "1px solid rgba(246,190,0,0.2)", padding: "2px 8px", borderRadius: 100 }}>{s.w}</span>
                    </div>
                    <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 12 }}>{s.desc}</p>
                  </div>
                </button>
              ))}
            </div>

            {sel.length > 0 && (
              <div style={{ marginTop: 24, padding: 20, borderRadius: 14, background: "#111", border: "1px solid rgba(246,190,0,0.2)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 12 }}>Estimated Total</div>
                  <div className="gold-text" style={{ fontFamily: "var(--font-display)", fontSize: 26, fontWeight: 700 }}>{total.toLocaleString()} SAR</div>
                </div>
                <span style={{ color: "rgba(255,255,255,0.25)", fontSize: 13 }}>{sel.length} service{sel.length > 1 ? "s" : ""}</span>
              </div>
            )}

            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 40 }}>
              <button onClick={() => setStep(1)} className="btn-outline">Back</button>
              <button onClick={() => sel.length > 0 && setStep(3)} disabled={!sel.length} className="btn-gold">Continue</button>
            </div>
          </div>
        )}

        {/* STEP 3 */}
        {step === 3 && (
          <div style={{ maxWidth: 600, margin: "0 auto" }}>
            {/* Summary */}
            <div style={{ borderRadius: 14, background: "#111", border: "1px solid rgba(255,255,255,0.08)", overflow: "hidden", marginBottom: 32 }}>
              <div style={{ padding: 20, borderBottom: "1px solid rgba(255,255,255,0.05)", display: "flex", justifyContent: "space-between" }}>
                <div>
                  <div style={{ color: "rgba(255,255,255,0.35)", fontSize: 11, textTransform: "uppercase" as const, letterSpacing: "0.08em" }}>Vehicle</div>
                  <div style={{ color: "#fff", fontWeight: 700, marginTop: 2 }}>{cars.find(c => c.id === size)?.label}</div>
                </div>
                <button onClick={() => setStep(1)} style={{ color: "#F6BE00", fontSize: 12, background: "none", border: "none", cursor: "pointer" }}>Change</button>
              </div>
              <div style={{ padding: 20, borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
                  <span style={{ color: "rgba(255,255,255,0.35)", fontSize: 11, textTransform: "uppercase" as const, letterSpacing: "0.08em" }}>Services</span>
                  <button onClick={() => setStep(2)} style={{ color: "#F6BE00", fontSize: 12, background: "none", border: "none", cursor: "pointer" }}>Change</button>
                </div>
                {sel.map(id => {
                  const s = svcs.find(x => x.id === id)!;
                  return (
                    <div key={id} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", fontSize: 14 }}>
                      <span style={{ color: "rgba(255,255,255,0.65)" }}>{s.name}</span>
                      <span style={{ color: "#F6BE00", fontWeight: 600 }}>{size ? s.p[size].toLocaleString() : 0} SAR</span>
                    </div>
                  );
                })}
              </div>
              <div style={{ padding: 20, background: "rgba(246,190,0,0.04)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ color: "#fff", fontWeight: 700, fontSize: 16 }}>Total</span>
                <span className="gold-text" style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 700 }}>{total.toLocaleString()} SAR</span>
              </div>
            </div>

            {/* Form */}
            <div style={{ display: "flex", flexDirection: "column" as const, gap: 14, marginBottom: 32 }}>
              {[
                { k: "name" as const, ph: "Your Name *", t: "text" },
                { k: "phone" as const, ph: "Phone (+966...) *", t: "tel" },
              ].map(f => (
                <input key={f.k} type={f.t} value={form[f.k]} onChange={e => setForm({...form, [f.k]: e.target.value})}
                  placeholder={f.ph} style={{ width: "100%", padding: "14px 18px", borderRadius: 12, background: "#111", border: "1px solid rgba(255,255,255,0.08)", color: "#fff", fontSize: 15, outline: "none" }} />
              ))}
              <textarea value={form.notes} onChange={e => setForm({...form, notes: e.target.value})}
                placeholder="Car model, date, notes..." rows={3} style={{ width: "100%", padding: "14px 18px", borderRadius: 12, background: "#111", border: "1px solid rgba(255,255,255,0.08)", color: "#fff", fontSize: 15, outline: "none", resize: "none" as const }} />
            </div>

            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <button onClick={() => setStep(2)} className="btn-outline">Back</button>
              <Link
                href={`https://wa.me/966?text=${encodeURIComponent(`Hi NICK!\n\nVehicle: ${cars.find(c => c.id === size)?.label}\nServices: ${sel.map(id => svcs.find(s => s.id === id)?.name).join(", ")}\nTotal: ${total.toLocaleString()} SAR\n\nName: ${form.name}\nPhone: ${form.phone}${form.notes ? "\nNotes: " + form.notes : ""}`)}`}
                target="_blank"
                className={`btn-gold ${(!form.name || !form.phone) ? "disabled:opacity-30 pointer-events-none opacity-30" : ""}`}
                style={(!form.name || !form.phone) ? { opacity: 0.3, pointerEvents: "none" } : {}}
              >
                <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                Confirm via WhatsApp
              </Link>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
