"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useReveal } from "@/hooks/useReveal";
import { useLanguage } from "@/i18n/LanguageContext";

type Size = "small" | "medium" | "large" | "suv" | null;

export default function Booking() {
  const [step, setStep] = useState(1);
  const [size, setSize] = useState<Size>(null);
  const [sel, setSel] = useState<string[]>([]);
  const [form, setForm] = useState({ name: "", phone: "", notes: "" });

  const { t, locale, dir } = useLanguage();
  const ref = useReveal([locale]);
  const isAr = locale === "ar";
  const fontDisplay = isAr ? "var(--font-ar)" : "var(--font-display)";

  const toggle = (id: string) => setSel(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]);

  const cars = [
    { id: "small" as const, label: t.booking.carSmall, ex: "Civic, Corolla, Elantra", img: "/images/DSC03060.jpg" },
    { id: "medium" as const, label: t.booking.carMedium, ex: "Camry, Accord, Sonata", img: "/images/DSC03235.jpg" },
    { id: "large" as const, label: t.booking.carLarge, ex: "S-Class, 7 Series", img: "/images/IMG_9912.JPG" },
    { id: "suv" as const, label: t.booking.carSuv, ex: "Tahoe, Land Cruiser", img: "/images/DSC03064.jpg" },
  ];

  const svcs = [
    { id: "ppf-full", name: t.booking.svcPpfFull, desc: t.booking.svcPpfFullDesc, p: { small: 14000, medium: 16000, large: 18500, suv: 22000 }, w: "10yr", img: "/images/DSC03279.jpg",
      benefits: [t.booking.b_selfHealing, t.booking.b_rockChip, t.booking.b_uvYellowing, t.booking.b_resaleValue] },
    { id: "ppf-front", name: t.booking.svcPpfFront, desc: t.booking.svcPpfFrontDesc, p: { small: 5500, medium: 6500, large: 7500, suv: 9000 }, w: "10yr", img: "/images/DSC03292.jpg",
      benefits: [t.booking.b_highImpact, t.booking.b_invisibleFilm, t.booking.b_selfHealTech, t.booking.b_factoryPaint] },
    { id: "tint-full", name: t.booking.svcTintFull, desc: t.booking.svcTintFullDesc, p: { small: 2400, medium: 2600, large: 2800, suv: 3200 }, w: "10yr", img: "/images/DSC03136.jpg",
      benefits: [t.booking.b_uvRejection, t.booking.b_heatReduction, t.booking.b_glareFree, t.booking.b_fadeProtection] },
    { id: "tint-front", name: t.booking.svcTintFront, desc: t.booking.svcTintFrontDesc, p: { small: 1160, medium: 1200, large: 1300, suv: 1400 }, w: "10yr", img: "/images/DSC03174.jpg",
      benefits: [t.booking.b_dashboardHeat, t.booking.b_antiGlare, t.booking.b_uvProtection99, t.booking.b_crystalClear] },
    { id: "ceramic", name: t.booking.svcCeramic, desc: t.booking.svcCeramicDesc, p: { small: 1350, medium: 1650, large: 1950, suv: 2400 }, w: "5yr", img: "/images/DSC03018.jpg",
      benefits: [t.booking.b_hydrophobic, t.booking.b_mirrorGloss, t.booking.b_dustRepellent, t.booking.b_easyWash] },
    { id: "ceramic-int", name: t.booking.svcCeramicInt, desc: t.booking.svcCeramicIntDesc, p: { small: 2300, medium: 2800, large: 3400, suv: 3800 }, w: "3yr", img: "/images/DSC02995.jpg",
      benefits: [t.booking.b_leatherStain, t.booking.b_dashboardUv, t.booking.b_spillRepellent, t.booking.b_interiorNew] },
  ];

  const bnplBase: React.CSSProperties = {
    display: "flex", alignItems: "center", justifyContent: "space-between",
    width: "100%", padding: "16px 20px", borderRadius: 12,
    textDecoration: "none", transition: "all 0.3s", border: "none",
  };
  const tabbyStyle: React.CSSProperties = { ...bnplBase, background: "#003227" };
  const tamaraStyle: React.CSSProperties = { ...bnplBase, background: "#250155" };
  const total = sel.reduce((s, id) => { const v = svcs.find(x => x.id === id); return s + (v && size ? v.p[size] : 0); }, 0);

  const buildWhatsApp = () => {
    const carLabel = cars.find(c => c.id === size)?.label ?? "";
    const svcNames = sel.map(id => svcs.find(s => s.id === id)?.name).join(", ");
    const msg = `${t.booking.waGreeting}\n\n${t.booking.waVehicle}: ${carLabel}\n${t.booking.waServices}: ${svcNames}\n${t.booking.waTotal}: ${total.toLocaleString()} SAR\n\n${t.booking.waName}: ${form.name}\n${t.booking.waPhone}: ${form.phone}${form.notes ? "\n" + t.booking.waNotes + ": " + form.notes : ""}`;
    return `https://wa.me/966?text=${encodeURIComponent(msg)}`;
  };

  return (
    <section id="booking" ref={ref} style={{ padding: "96px 0", background: "linear-gradient(180deg, #050505, #0a0a0a, #050505)" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px" }}>
        <div className="reveal" style={{ textAlign: "center", maxWidth: 560, margin: "0 auto 40px" }}>
          <span className="section-badge">{t.booking.badge}</span>
          <h2 style={{ fontFamily: fontDisplay, fontSize: "clamp(28px, 5vw, 44px)", fontWeight: 700, marginBottom: 12 }}>
            <span style={{ color: "#fff" }}>{t.booking.heading1}</span><span className="gold-text">{t.booking.heading2}</span>
          </h2>
          <p style={{ color: "rgba(255,255,255,0.45)", fontSize: 16 }}>{t.booking.subtitle}</p>
        </div>

        {/* Steps */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 48 }}>
          {[{ n: 1, l: t.booking.step1 }, { n: 2, l: t.booking.step2 }, { n: 3, l: t.booking.step3 }].map((s, i) => (
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
            <p style={{ textAlign: "center", color: "rgba(255,255,255,0.4)", fontSize: 14, marginBottom: 32 }}>{t.booking.step1instruction}</p>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {cars.map((c) => (
                <button key={c.id} onClick={() => setSize(c.id)} className={size === c.id ? "gold-pulse" : ""} style={{
                  position: "relative", borderRadius: 16, overflow: "hidden", textAlign: dir === "rtl" ? "right" : "left", cursor: "pointer", background: "none", padding: 0,
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
                      <div style={{
                        position: "absolute", top: 10,
                        ...(dir === "rtl" ? { left: 10 } : { right: 10 }),
                        width: 26, height: 26, borderRadius: "50%", background: "#F6BE00", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, color: "#000", fontWeight: 700,
                      }}>&#10003;</div>
                    )}
                  </div>
                  <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: 14 }}>
                    <div style={{ color: size === c.id ? "#F6BE00" : "#fff", fontWeight: 700, fontSize: 14 }}>{c.label}</div>
                    <div style={{ color: "rgba(255,255,255,0.25)", fontSize: 11, marginTop: 4 }}>{c.ex}</div>
                  </div>
                </button>
              ))}
            </div>
            <div style={{ textAlign: "center", marginTop: 40 }}>
              <button onClick={() => size && setStep(2)} disabled={!size} className="btn-gold">{t.booking.chooseServices}</button>
            </div>
          </div>
        )}

        {/* STEP 2 */}
        {step === 2 && (
          <div>
            <p style={{ textAlign: "center", color: "rgba(255,255,255,0.4)", fontSize: 14, marginBottom: 32 }}>
              {t.booking.pricesFor} <strong style={{ color: "#F6BE00" }}>{cars.find(c => c.id === size)?.label}</strong> {t.booking.selectOneOrMore}
            </p>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {svcs.map((s) => (
                <button key={s.id} onClick={() => toggle(s.id)} style={{
                  position: "relative", borderRadius: 14, overflow: "hidden", textAlign: dir === "rtl" ? "right" : "left", cursor: "pointer", background: "none", padding: 0,
                  border: sel.includes(s.id) ? "2px solid #F6BE00" : "2px solid rgba(255,255,255,0.06)",
                  boxShadow: sel.includes(s.id) ? "0 0 16px rgba(246,190,0,0.12)" : "none",
                  transition: "all 0.3s",
                }}>
                  <div style={{ position: "relative", height: 130 }}>
                    <Image src={s.img} alt={s.name} fill className="object-cover" />
                    <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, #111, rgba(17,17,17,0.4), transparent)" }} />
                    <span style={{
                      position: "absolute", bottom: 10,
                      ...(dir === "rtl" ? { left: 10 } : { right: 10 }),
                      padding: "4px 10px", background: "#F6BE00", color: "#000", fontSize: 12, fontWeight: 700, borderRadius: 6,
                    }}>
                      {size ? s.p[size].toLocaleString() : "—"} SAR
                    </span>
                    {sel.includes(s.id) && (
                      <div style={{
                        position: "absolute", top: 10,
                        ...(dir === "rtl" ? { left: 10 } : { right: 10 }),
                        width: 24, height: 24, borderRadius: "50%", background: "#F6BE00", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, color: "#000", fontWeight: 700,
                      }}>&#10003;</div>
                    )}
                  </div>
                  <div style={{ padding: "14px 16px", background: "#111" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                      <span style={{ color: "#fff", fontWeight: 700, fontSize: 14 }}>{s.name}</span>
                      <span style={{ fontSize: 10, color: "#F6BE00", border: "1px solid rgba(246,190,0,0.2)", padding: "2px 8px", borderRadius: 100 }}>{s.w}</span>
                    </div>
                    <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 12, marginBottom: 10 }}>{s.desc}</p>
                    <div style={{ display: "flex", flexDirection: "column" as const, gap: 5 }}>
                      {s.benefits.map(b => (
                        <div key={b} style={{ display: "flex", alignItems: "center", gap: 7 }}>
                          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ flexShrink: 0 }}>
                            <circle cx="6" cy="6" r="5.5" stroke="rgba(246,190,0,0.3)" strokeWidth="1" />
                            <path d="M3.5 6L5.25 7.75L8.5 4.5" stroke="#F6BE00" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                          <span style={{ color: "rgba(255,255,255,0.5)", fontSize: 11, lineHeight: 1.3 }}>{b}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {sel.length > 0 && (
              <div style={{ marginTop: 24, padding: 20, borderRadius: 14, background: "#111", border: "1px solid rgba(246,190,0,0.2)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 12 }}>{t.booking.estimatedTotal}</div>
                  <div className="gold-text" style={{ fontFamily: fontDisplay, fontSize: 26, fontWeight: 700 }}>{total.toLocaleString()} SAR</div>
                </div>
                <span style={{ color: "rgba(255,255,255,0.25)", fontSize: 13 }}>{sel.length} {sel.length > 1 ? t.booking.servicesCount : t.booking.serviceCount}</span>
              </div>
            )}

            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 40 }}>
              <button onClick={() => setStep(1)} className="btn-outline">{t.booking.back}</button>
              <button onClick={() => sel.length > 0 && setStep(3)} disabled={!sel.length} className="btn-gold">{t.booking.continue}</button>
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
                  <div style={{ color: "rgba(255,255,255,0.35)", fontSize: 11, textTransform: isAr ? "none" : "uppercase" as const, letterSpacing: isAr ? "0" : "0.08em" }}>{t.booking.vehicleLabel}</div>
                  <div style={{ color: "#fff", fontWeight: 700, marginTop: 2 }}>{cars.find(c => c.id === size)?.label}</div>
                </div>
                <button onClick={() => setStep(1)} style={{ color: "#F6BE00", fontSize: 12, background: "none", border: "none", cursor: "pointer" }}>{t.booking.change}</button>
              </div>
              <div style={{ padding: 20, borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
                  <span style={{ color: "rgba(255,255,255,0.35)", fontSize: 11, textTransform: isAr ? "none" : "uppercase" as const, letterSpacing: isAr ? "0" : "0.08em" }}>{t.booking.servicesLabel}</span>
                  <button onClick={() => setStep(2)} style={{ color: "#F6BE00", fontSize: 12, background: "none", border: "none", cursor: "pointer" }}>{t.booking.change}</button>
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
                <span style={{ color: "#fff", fontWeight: 700, fontSize: 16 }}>{t.booking.totalLabel}</span>
                <span className="gold-text" style={{ fontFamily: fontDisplay, fontSize: 22, fontWeight: 700 }}>{total.toLocaleString()} SAR</span>
              </div>
            </div>

            {/* Form */}
            <div style={{ display: "flex", flexDirection: "column" as const, gap: 14, marginBottom: 32 }}>
              {[
                { k: "name" as const, ph: t.booking.namePh, tp: "text" },
                { k: "phone" as const, ph: t.booking.phonePh, tp: "tel" },
              ].map(f => (
                <input key={f.k} type={f.tp} value={form[f.k]} onChange={e => setForm({...form, [f.k]: e.target.value})}
                  placeholder={f.ph} dir={f.k === "phone" ? "ltr" : undefined}
                  style={{ width: "100%", padding: "14px 18px", borderRadius: 12, background: "#111", border: "1px solid rgba(255,255,255,0.08)", color: "#fff", fontSize: 15, outline: "none", textAlign: f.k === "phone" ? ("left" as const) : undefined }} />
              ))}
              <textarea value={form.notes} onChange={e => setForm({...form, notes: e.target.value})}
                placeholder={t.booking.notesPh} rows={3} style={{ width: "100%", padding: "14px 18px", borderRadius: 12, background: "#111", border: "1px solid rgba(255,255,255,0.08)", color: "#fff", fontSize: 15, outline: "none", resize: "none" as const }} />
            </div>

            {/* Payment options */}
            <div style={{ marginBottom: 24 }}>
              <div style={{ color: "rgba(255,255,255,0.35)", fontSize: 12, textTransform: isAr ? "none" : "uppercase" as const, letterSpacing: isAr ? "0" : "0.08em", marginBottom: 16 }}>{t.booking.paymentMethod}</div>
              <div style={{ display: "flex", flexDirection: "column" as const, gap: 10 }}>
                {/* Pay Online */}
                <Link
                  href={`https://nick.sa/checkout?amount=${total}&name=${encodeURIComponent(form.name)}&phone=${encodeURIComponent(form.phone)}`}
                  target="_blank"
                  className="btn-gold"
                  style={(!form.name || !form.phone)
                    ? { opacity: 0.3, pointerEvents: "none", width: "100%", justifyContent: "center" }
                    : { width: "100%", justifyContent: "center" }}
                >
                  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><rect x="1" y="4" width="22" height="16" rx="2" /><line x1="1" y1="10" x2="23" y2="10" /></svg>
                  {t.booking.payOnline} &mdash; {total.toLocaleString()} SAR
                </Link>

                {/* Tabby */}
                <Link
                  href={`https://nick.sa/checkout?method=tabby&amount=${total}&name=${encodeURIComponent(form.name)}&phone=${encodeURIComponent(form.phone)}`}
                  target="_blank"
                  style={(!form.name || !form.phone)
                    ? { ...tabbyStyle, opacity: 0.3, pointerEvents: "none" }
                    : tabbyStyle}
                >
                  <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <svg width="60" height="20" viewBox="0 0 60 20" fill="none">
                      <text x="0" y="16" fontFamily="system-ui, sans-serif" fontWeight="800" fontSize="18" letterSpacing="-0.5" fill="#3bff9d">tabby</text>
                    </svg>
                  </span>
                  <span style={{ display: "flex", flexDirection: "column" as const, alignItems: dir === "rtl" ? "flex-start" : "flex-end" }}>
                    <span style={{ color: "#fff", fontSize: 13, fontWeight: 700 }}>{Math.ceil(total / 4).toLocaleString()} SAR<span style={{ fontWeight: 400, opacity: 0.6 }}>{t.booking.perMonth}</span></span>
                    <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 11 }}>{t.booking.splitIn4}</span>
                  </span>
                </Link>

                {/* Tamara */}
                <Link
                  href={`https://nick.sa/checkout?method=tamara&amount=${total}&name=${encodeURIComponent(form.name)}&phone=${encodeURIComponent(form.phone)}`}
                  target="_blank"
                  style={(!form.name || !form.phone)
                    ? { ...tamaraStyle, opacity: 0.3, pointerEvents: "none" }
                    : tamaraStyle}
                >
                  <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <svg width="72" height="20" viewBox="0 0 72 20" fill="none">
                      <text x="0" y="16" fontFamily="system-ui, sans-serif" fontWeight="800" fontSize="18" letterSpacing="-0.5" fill="#c77dff">tamara</text>
                    </svg>
                  </span>
                  <span style={{ display: "flex", flexDirection: "column" as const, alignItems: dir === "rtl" ? "flex-start" : "flex-end" }}>
                    <span style={{ color: "#fff", fontSize: 13, fontWeight: 700 }}>{Math.ceil(total / 3).toLocaleString()} SAR<span style={{ fontWeight: 400, opacity: 0.6 }}>{t.booking.perMonth}</span></span>
                    <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 11 }}>{t.booking.splitIn3}</span>
                  </span>
                </Link>
              </div>
            </div>

            {/* Divider */}
            <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 20 }}>
              <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.08)" }} />
              <span style={{ color: "rgba(255,255,255,0.2)", fontSize: 12 }}>{t.booking.or}</span>
              <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.08)" }} />
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
              <button onClick={() => setStep(2)} className="btn-outline">{t.booking.back}</button>
              <Link
                href={buildWhatsApp()}
                target="_blank"
                className="btn-gold"
                style={(!form.name || !form.phone) ? { opacity: 0.3, pointerEvents: "none" } : {}}
              >
                <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                {t.booking.confirmWhatsapp}
              </Link>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
