"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useReveal } from "@/hooks/useReveal";
import { useLanguage } from "@/i18n/LanguageContext";

type Size = "small" | "large" | null;
type Category = "packages" | "ppf" | "tint" | "ceramic";

interface Addon { id: string; name: string; p: { small: number; large: number }; icon: React.ReactNode }
interface Svc {
  id: string; cat: "ppf" | "tint" | "ceramic"; name: string; w: string; img: string;
  p: { small: number; large: number };
  parts: string[];
  addonTier: "low" | "high";
  popular?: boolean;
}

export default function Booking() {
  const [step, setStep] = useState(1);
  const [size, setSize] = useState<Size>(null);
  const [category, setCategory] = useState<Category>("packages");
  const [sel, setSel] = useState<string[]>([]);
  const [detailId, setDetailId] = useState<string | null>(null);
  const [selAddons, setSelAddons] = useState<Record<string, string[]>>({});
  const [form, setForm] = useState({ name: "", phone: "", notes: "" });
  const [orderSent, setOrderSent] = useState(false);
  const [displayTotal, setDisplayTotal] = useState(0);
  const [activePack, setActivePack] = useState<string | null>(null);
  const detailRef = useRef<HTMLDivElement>(null);

  const { t, locale, dir } = useLanguage();
  const ref = useReveal([locale]);
  const isAr = locale === "ar";
  const fontDisplay = isAr ? "var(--font-ar)" : "var(--font-display)";
  const cur = isAr ? "ر.س" : "SAR";

  const catDesc: Record<string, string> = { ppf: t.services.s1desc, tint: t.services.s2desc, ceramic: t.services.s3desc };

  const toggleSvc = (id: string) => {
    if (sel.includes(id)) {
      setSel(p => p.filter(x => x !== id));
      setSelAddons(a => { const n = { ...a }; delete n[id]; return n; });
      if (detailId === id) setDetailId(null);
    } else {
      setSel(p => [...p, id]);
      setDetailId(id);
      setTimeout(() => detailRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" }), 100);
    }
  };

  const toggleAddon = (svcId: string, addonId: string) => {
    setSelAddons(prev => {
      const cur = prev[svcId] || [];
      return { ...prev, [svcId]: cur.includes(addonId) ? cur.filter(x => x !== addonId) : [...cur, addonId] };
    });
  };

  const cars = [
    { id: "small" as const, label: t.booking.carSmall, ex: "Civic, Corolla, Elantra, Camry", img: "/images/DSC03060.jpg" },
    { id: "large" as const, label: t.booking.carLarge, ex: "Tahoe, Land Cruiser, S-Class", img: "/images/IMG_9912.JPG" },
  ];

  const categories: { id: Category; label: string; icon: React.ReactNode }[] = [
    { id: "packages", label: t.booking.packagesTitle, icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg> },
    { id: "ppf", label: t.booking.catPpf, icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg> },
    { id: "tint", label: t.booking.catTint, icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg> },
    { id: "ceramic", label: t.booking.catCeramic, icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/></svg> },
  ];

  const addons: Addon[] = [
    { id: "ozone", name: t.booking.addonOzone, p: { small: 100, large: 150 },
      icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M8 2c0 0-3 4-3 7a3 3 0 0 0 6 0c0-3-3-7-3-7z"/><path d="M16 6c0 0-2 3-2 5a2 2 0 0 0 4 0c0-2-2-5-2-5z"/><path d="M12 14v4"/><path d="M8 18h8"/><path d="M6 22h12"/></svg> },
    { id: "rim-ceramic", name: t.booking.addonRimCeramic, p: { small: 600, large: 700 },
      icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="4"/><line x1="12" y1="2" x2="12" y2="8"/><line x1="12" y1="16" x2="12" y2="22"/><line x1="2" y1="12" x2="8" y2="12"/><line x1="16" y1="12" x2="22" y2="12"/></svg> },
    { id: "engine-clean", name: t.booking.addonEngineClean, p: { small: 150, large: 200 },
      icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg> },
    { id: "remove-tint", name: t.booking.addonRemoveTint, p: { small: 200, large: 300 },
      icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="9" y1="9" x2="15" y2="15"/><line x1="15" y1="9" x2="9" y2="15"/></svg> },
    { id: "remove-partial", name: t.booking.addonRemovePartial, p: { small: 350, large: 450 },
      icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><line x1="8" y1="12" x2="16" y2="12"/></svg> },
    { id: "remove-front", name: t.booking.addonRemoveFront, p: { small: 550, large: 650 },
      icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><line x1="9" y1="9" x2="15" y2="15"/><line x1="15" y1="9" x2="9" y2="15"/></svg> },
    { id: "remove-full", name: t.booking.addonRemoveFull, p: { small: 1250, large: 1450 },
      icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="6" width="22" height="12" rx="3"/><circle cx="7" cy="18" r="2"/><circle cx="17" cy="18" r="2"/><line x1="8" y1="10" x2="16" y2="14"/><line x1="16" y1="10" x2="8" y2="14"/></svg> },
  ];

  const svcs: Svc[] = [
    { id: "ppf-color", cat: "ppf", name: t.booking.svcPpfColor, p: { small: 16500, large: 18500 }, w: "5yr", img: "/images/DSC03279.jpg", addonTier: "high", parts: [t.booking.fullBody] },
    { id: "ppf-clear75", cat: "ppf", name: t.booking.svcPpfClear75, p: { small: 12000, large: 14500 }, w: "10yr", img: "/images/DSC03292.jpg", addonTier: "low", parts: [t.booking.fullBody] },
    { id: "ppf-clear85", cat: "ppf", name: t.booking.svcPpfClear85, p: { small: 14000, large: 15500 }, w: "10yr", img: "/images/DSC03235.jpg", addonTier: "low", parts: [t.booking.fullBody], popular: true },
    { id: "ppf-matte", cat: "ppf", name: t.booking.svcPpfMatte, p: { small: 13450, large: 15450 }, w: "10yr", img: "/images/DSC03064.jpg", addonTier: "low", parts: [t.booking.fullBody] },
    { id: "ppf-front-rear", cat: "ppf", name: t.booking.svcPpfFrontRear, p: { small: 4770, large: 5500 }, w: "10yr", img: "/images/DSC03279.jpg", addonTier: "high",
      parts: [t.booking.fullHood, t.booking.fullFenders, t.booking.frontBumper, t.booking.frontLights, t.booking.sideMirrors, t.booking.frontPillars, t.booking.doorEdges, t.booking.rearBumper] },
    { id: "ppf-front", cat: "ppf", name: t.booking.svcPpfFront, p: { small: 3660, large: 5600 }, w: "10yr", img: "/images/DSC03292.jpg", addonTier: "high",
      parts: [t.booking.fullHood, t.booking.fullFenders, t.booking.frontBumper, t.booking.frontLights, t.booking.sideMirrors, t.booking.frontPillars, t.booking.doorEdges] },
    { id: "ppf-partial-rear", cat: "ppf", name: t.booking.svcPpfPartialRear, p: { small: 2770, large: 4800 }, w: "10yr", img: "/images/DSC03235.jpg", addonTier: "low",
      parts: [t.booking.halfHood, t.booking.halfFenders, t.booking.frontBumper, t.booking.frontLights, t.booking.sideMirrors, t.booking.frontPillars, t.booking.doorEdges, t.booking.rearBumper] },
    { id: "ppf-partial", cat: "ppf", name: t.booking.svcPpfPartial, p: { small: 1850, large: 2900 }, w: "10yr", img: "/images/DSC03064.jpg", addonTier: "low",
      parts: [t.booking.halfHood, t.booking.halfFenders, t.booking.frontBumper, t.booking.frontLights, t.booking.sideMirrors, t.booking.frontPillars, t.booking.doorEdges] },
    { id: "ppf-windshield", cat: "ppf", name: t.booking.svcPpfWindshield, p: { small: 1000, large: 1000 }, w: "10yr", img: "/images/DSC03174.jpg", addonTier: "low", parts: [t.booking.frontWindshield] },
    { id: "tint-full", cat: "tint", name: t.booking.svcTintFull, p: { small: 2400, large: 2800 }, w: "10yr", img: "/images/DSC03136.jpg", addonTier: "low", parts: [t.booking.allGlass], popular: true },
    { id: "tint-front", cat: "tint", name: t.booking.svcTintFront, p: { small: 1160, large: 1300 }, w: "10yr", img: "/images/DSC03174.jpg", addonTier: "high", parts: [t.booking.frontWindshield] },
    { id: "ceramic-int-1", cat: "ceramic", name: t.booking.svcCeramicInt1, p: { small: 2300, large: 2500 }, w: "1yr", img: "/images/DSC02995.jpg", addonTier: "low", parts: [t.booking.interiorSurfaces] },
    { id: "ceramic-int-3", cat: "ceramic", name: t.booking.svcCeramicInt3, p: { small: 2900, large: 3100 }, w: "3yr", img: "/images/DSC02995.jpg", addonTier: "low", parts: [t.booking.interiorSurfaces] },
    { id: "ceramic-int-5", cat: "ceramic", name: t.booking.svcCeramicInt5, p: { small: 3200, large: 3400 }, w: "5yr", img: "/images/DSC02995.jpg", addonTier: "low", parts: [t.booking.interiorSurfaces] },
    { id: "ceramic-ext-1", cat: "ceramic", name: t.booking.svcCeramicExt1, p: { small: 1350, large: 1950 }, w: "1yr", img: "/images/DSC03018.jpg", addonTier: "high", parts: [t.booking.exteriorBody] },
    { id: "ceramic-ext-3", cat: "ceramic", name: t.booking.svcCeramicExt3, p: { small: 2250, large: 2850 }, w: "3yr", img: "/images/DSC03018.jpg", addonTier: "low", parts: [t.booking.exteriorBody], popular: true },
    { id: "ceramic-ext-5", cat: "ceramic", name: t.booking.svcCeramicExt5, p: { small: 3050, large: 3750 }, w: "5yr", img: "/images/DSC03018.jpg", addonTier: "low", parts: [t.booking.exteriorBody] },
  ];

  const filteredSvcs = category === "packages" ? [] : svcs.filter(s => s.cat === category);
  const detailSvc = detailId ? svcs.find(s => s.id === detailId) : null;

  const getAddonPrice = (addon: Addon, tier: "low" | "high") => tier === "high" ? addon.p.large : addon.p.small;

  const svcTotal = sel.reduce((s, id) => { const v = svcs.find(x => x.id === id); return s + (v && size ? v.p[size] : 0); }, 0);
  const addonTotal = Object.entries(selAddons).reduce((s, [svcId, addonIds]) => {
    const svc = svcs.find(x => x.id === svcId);
    if (!svc) return s;
    return s + addonIds.reduce((a, aid) => { const addon = addons.find(x => x.id === aid); return a + (addon ? getAddonPrice(addon, svc.addonTier) : 0); }, 0);
  }, 0);
  const total = svcTotal + addonTotal;

  // Animated total count
  useEffect(() => {
    if (displayTotal === total) return;
    const diff = total - displayTotal;
    const steps = 20;
    const inc = diff / steps;
    let current = displayTotal;
    let step = 0;
    const timer = setInterval(() => {
      step++;
      if (step >= steps) {
        setDisplayTotal(total);
        clearInterval(timer);
      } else {
        current += inc;
        setDisplayTotal(Math.round(current));
      }
    }, 16);
    return () => clearInterval(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [total]);

  // Packages
  interface Pack { id: string; name: string; desc: string; svcIds: string[]; discount: number; tier: "basic" | "premium" | "vip"; warranty: string }
  const packages: Pack[] = [
    {
      id: "basic", name: t.booking.packBasic, desc: t.booking.packBasicDesc,
      svcIds: ["ppf-partial", "tint-front", "ceramic-ext-1"], discount: 5, tier: "basic", warranty: isAr ? "٥ سنوات ضمان" : "5yr Warranty",
    },
    {
      id: "premium", name: t.booking.packPremium, desc: t.booking.packPremiumDesc,
      svcIds: ["ppf-clear75", "tint-full", "ceramic-ext-3"], discount: 8, tier: "premium", warranty: isAr ? "٧ سنوات ضمان" : "7yr Warranty",
    },
    {
      id: "vip", name: t.booking.packVip, desc: t.booking.packVipDesc,
      svcIds: ["ppf-clear85", "tint-full", "ceramic-ext-5"], discount: 12, tier: "vip", warranty: isAr ? "١٠ سنوات ضمان" : "10yr Warranty",
    },
  ];

  const getPackPrice = (pack: Pack) => {
    if (!size) return 0;
    const raw = pack.svcIds.reduce((s, id) => { const v = svcs.find(x => x.id === id); return s + (v ? v.p[size] : 0); }, 0);
    return Math.round(raw * (1 - pack.discount / 100));
  };

  const getPackSaving = (pack: Pack) => {
    if (!size) return 0;
    const raw = pack.svcIds.reduce((s, id) => { const v = svcs.find(x => x.id === id); return s + (v ? v.p[size] : 0); }, 0);
    return raw - getPackPrice(pack);
  };

  const selectPack = (pack: Pack) => {
    if (activePack === pack.id) {
      // Deselect
      setSel(prev => prev.filter(id => !pack.svcIds.includes(id)));
      setActivePack(null);
    } else {
      // Remove previous package services, then add new ones
      const prevPack = packages.find(p => p.id === activePack);
      const prevIds = prevPack ? prevPack.svcIds : [];
      setSel(prev => {
        const cleaned = prev.filter(id => !prevIds.includes(id));
        pack.svcIds.forEach(id => { if (!cleaned.includes(id)) cleaned.push(id); });
        return cleaned;
      });
      // Clean addons from removed services
      if (prevPack) {
        setSelAddons(a => {
          const n = { ...a };
          prevIds.forEach(id => { if (!pack.svcIds.includes(id)) delete n[id]; });
          return n;
        });
      }
      setActivePack(pack.id);
      setDetailId(null);
    }
  };

  const bnplBase: React.CSSProperties = {
    display: "flex", alignItems: "center", justifyContent: "space-between",
    width: "100%", padding: "16px 20px", borderRadius: 12,
    textDecoration: "none", transition: "all 0.3s", border: "none",
  };

  const buildWhatsApp = () => {
    const carLabel = cars.find(c => c.id === size)?.label ?? "";
    const lines = sel.map(id => {
      const s = svcs.find(x => x.id === id)!;
      const svcAddons = (selAddons[id] || []).map(aid => addons.find(a => a.id === aid)?.name).filter(Boolean);
      return s.name + (svcAddons.length ? ` + ${svcAddons.join(", ")}` : "");
    });
    const msg = `${t.booking.waGreeting}\n\n${t.booking.waVehicle}: ${carLabel}\n${t.booking.waServices}:\n${lines.join("\n")}\n${t.booking.waTotal}: ${total.toLocaleString()} ${cur}\n\n${t.booking.waName}: ${form.name}\n${t.booking.waPhone}: ${form.phone}${form.notes ? "\n" + t.booking.waNotes + ": " + form.notes : ""}`;
    return `https://wa.me/966543000055?text=${encodeURIComponent(msg)}`;
  };

  const selCount = (cat: Category) => {
    if (cat === "packages") return activePack ? 1 : 0;
    return sel.filter(id => svcs.find(s => s.id === id)?.cat === cat).length;
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

        {/* Steps — clickable to go back */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 48 }}>
          {[{ n: 1, l: t.booking.step1 }, { n: 2, l: t.booking.step2 }, { n: 3, l: t.booking.step3 }].map((s, i) => (
            <div key={s.n} style={{ display: "flex", alignItems: "center" }}>
              <button onClick={() => { if (step > s.n) setStep(s.n); }} style={{
                display: "flex", flexDirection: "column", alignItems: "center", background: "none", border: "none", padding: 0,
                cursor: step > s.n ? "pointer" : "default",
              }}>
                <div style={{
                  width: 40, height: 40, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 14, fontWeight: 700, transition: "all 0.3s",
                  background: step >= s.n ? "#F6BE00" : "#1a1a1a", color: step >= s.n ? "#000" : "rgba(255,255,255,0.3)",
                  border: step >= s.n ? "none" : "1px solid rgba(255,255,255,0.1)",
                }}>
                  {step > s.n ? "\u2713" : s.n}
                </div>
                <span style={{ fontSize: 11, marginTop: 6, color: step >= s.n ? "#F6BE00" : "rgba(255,255,255,0.25)" }}>{s.l}</span>
              </button>
              {i < 2 && <div style={{ width: 60, height: 2, margin: "0 10px", marginBottom: 20, background: step > s.n ? "#F6BE00" : "rgba(255,255,255,0.08)" }} />}
            </div>
          ))}
        </div>

        {/* STEP 1 */}
        {step === 1 && (
          <div className="step-enter">
            <p style={{ textAlign: "center", color: "rgba(255,255,255,0.4)", fontSize: 14, marginBottom: 32 }}>{t.booking.step1instruction}</p>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 16, maxWidth: 600, margin: "0 auto" }}>
              {cars.map((c) => (
                <button key={c.id} onClick={() => setSize(c.id)} className={size === c.id ? "gold-pulse" : ""} style={{
                  position: "relative", borderRadius: 16, overflow: "hidden", textAlign: dir === "rtl" ? "right" : "left", cursor: "pointer", background: "none", padding: 0,
                  border: size === c.id ? "2px solid #F6BE00" : "2px solid rgba(255,255,255,0.06)",
                  boxShadow: size === c.id ? "0 0 24px rgba(246,190,0,0.15)" : "none",
                  transition: "all 0.3s", transform: size === c.id ? "scale(1.02)" : "scale(1)",
                }}
                  onMouseEnter={e => { if (size !== c.id) e.currentTarget.style.borderColor = "rgba(246,190,0,0.3)"; }}
                  onMouseLeave={e => { if (size !== c.id) e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)"; }}
                >
                  <div style={{ position: "relative", height: 200 }}>
                    <Image src={c.img} alt={c.label} fill className="object-cover" style={{ transition: "transform 0.5s" }} />
                    <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.2) 100%)" }} />
                    {size === c.id && (
                      <div style={{ position: "absolute", top: 10, ...(dir === "rtl" ? { left: 10 } : { right: 10 }), width: 26, height: 26, borderRadius: "50%", background: "#F6BE00", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, color: "#000", fontWeight: 700 }}>&#10003;</div>
                    )}
                  </div>
                  <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: 16 }}>
                    <div style={{ color: size === c.id ? "#F6BE00" : "#fff", fontWeight: 700, fontSize: 16 }}>{c.label}</div>
                    <div style={{ color: "rgba(255,255,255,0.3)", fontSize: 12, marginTop: 4 }}>{c.ex}</div>
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
          <div className="step-enter">
            <p style={{ textAlign: "center", color: "rgba(255,255,255,0.4)", fontSize: 14, marginBottom: 24 }}>
              {t.booking.pricesFor} <strong style={{ color: "#F6BE00" }}>{cars.find(c => c.id === size)?.label}</strong> {t.booking.selectOneOrMore}
            </p>

            {/* Category Tabs */}
            <div style={{ display: "flex", gap: 8, justifyContent: "center", marginBottom: 32, flexWrap: "wrap" }}>
              {categories.map((cat) => {
                const isActive = category === cat.id;
                const count = selCount(cat.id);
                return (
                  <button key={cat.id} onClick={() => setCategory(cat.id)} style={{
                    display: "flex", alignItems: "center", gap: 8, padding: "10px 20px", borderRadius: 100, cursor: "pointer",
                    fontSize: 13, fontWeight: 600, transition: "all 0.3s",
                    background: isActive ? "#F6BE00" : "rgba(255,255,255,0.04)",
                    color: isActive ? "#000" : "rgba(255,255,255,0.5)",
                    border: isActive ? "1.5px solid #F6BE00" : "1.5px solid rgba(255,255,255,0.08)",
                    transform: isActive ? "scale(1.03)" : "scale(1)",
                    boxShadow: isActive ? "0 4px 20px rgba(246,190,0,0.2)" : "none",
                  }}
                    onMouseEnter={e => { if (!isActive) { e.currentTarget.style.borderColor = "rgba(246,190,0,0.3)"; e.currentTarget.style.color = "#F6BE00"; } }}
                    onMouseLeave={e => { if (!isActive) { e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"; e.currentTarget.style.color = "rgba(255,255,255,0.5)"; } }}
                  >
                    {cat.icon}<span>{cat.label}</span>
                    {count > 0 && <span style={{ width: 20, height: 20, borderRadius: "50%", fontSize: 11, fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", background: isActive ? "rgba(0,0,0,0.2)" : "#F6BE00", color: "#000" }}>{count}</span>}
                  </button>
                );
              })}
            </div>

            {/* Packages View */}
            {category === "packages" && (
              <div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {packages.map((pack, i) => {
                    const isActive = activePack === pack.id;
                    const price = getPackPrice(pack);
                    const saving = getPackSaving(pack);
                    const tierColors = { basic: "#64B5F6", premium: "#F6BE00", vip: "#E040FB" };
                    const tierColor = tierColors[pack.tier];
                    return (
                      <button key={pack.id} onClick={() => selectPack(pack)} style={{
                        position: "relative", padding: 0, borderRadius: 16, cursor: "pointer", overflow: "hidden",
                        background: isActive ? `rgba(${pack.tier === "basic" ? "100,181,246" : pack.tier === "premium" ? "246,190,0" : "224,64,251"},0.06)` : "rgba(255,255,255,0.02)",
                        border: isActive ? `2px solid ${tierColor}` : "2px solid rgba(255,255,255,0.06)",
                        transition: "all 0.3s", textAlign: "center",
                        boxShadow: isActive ? `0 0 30px ${tierColor}20` : "none",
                        transform: isActive ? "scale(1.02)" : "scale(1)",
                      }}
                        onMouseEnter={e => { if (!isActive) { e.currentTarget.style.borderColor = `${tierColor}60`; e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = `0 8px 24px rgba(0,0,0,0.4)`; } }}
                        onMouseLeave={e => { if (!isActive) { e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)"; e.currentTarget.style.transform = "scale(1)"; e.currentTarget.style.boxShadow = "none"; } }}
                      >
                        {/* Tier gradient top bar */}
                        <div style={{ height: 4, background: `linear-gradient(90deg, ${tierColor}, ${tierColor}80)` }} />

                        <div style={{ padding: "24px 20px" }}>
                          {/* Popular badge on premium */}
                          {i === 1 && (
                            <div style={{
                              position: "absolute", top: 14, left: "50%", transform: "translateX(-50%)",
                              padding: "3px 14px", borderRadius: 100, fontSize: 10, fontWeight: 700,
                              background: tierColor, color: "#000",
                              textTransform: isAr ? "none" : "uppercase" as const, letterSpacing: isAr ? "0" : "0.05em",
                              whiteSpace: "nowrap",
                            }}>
                              ★ {t.booking.popular}
                            </div>
                          )}

                          {/* Tier name */}
                          <div style={{ color: isActive ? tierColor : "#fff", fontWeight: 800, fontSize: 20, marginBottom: 6, marginTop: i === 1 ? 16 : 0, fontFamily: fontDisplay }}>{pack.name}</div>
                          {/* Description */}
                          <div style={{ color: "rgba(255,255,255,0.35)", fontSize: 12, marginBottom: 10, lineHeight: 1.5 }}>{pack.desc}</div>
                          {/* Warranty badge */}
                          <div style={{
                            display: "inline-flex", alignItems: "center", gap: 5, padding: "4px 12px", borderRadius: 100, fontSize: 11, fontWeight: 700,
                            background: `${tierColor}12`, color: tierColor, border: `1px solid ${tierColor}25`, marginBottom: 16,
                          }}>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                            {pack.warranty}
                          </div>

                          {/* Price */}
                          <div style={{ fontFamily: fontDisplay, fontSize: 28, fontWeight: 700, color: tierColor, marginBottom: 6 }}>
                            {size ? price.toLocaleString() : "—"} <span style={{ fontSize: 14, opacity: 0.7 }}>{cur}</span>
                          </div>

                          {/* Saving */}
                          {size && saving > 0 && (
                            <div style={{
                              display: "inline-flex", alignItems: "center", gap: 4,
                              padding: "4px 12px", borderRadius: 100, fontSize: 11, fontWeight: 700,
                              background: "rgba(76,175,80,0.12)", color: "#4CAF50",
                              border: "1px solid rgba(76,175,80,0.2)",
                            }}>
                              {t.booking.packSave} {saving.toLocaleString()} {cur}
                            </div>
                          )}

                          {/* Service count preview */}
                          <div style={{ marginTop: 16, display: "flex", justifyContent: "center", gap: 6 }}>
                            {pack.svcIds.map(svcId => {
                              const s = svcs.find(x => x.id === svcId);
                              if (!s) return null;
                              const catLabel = s.cat === "ppf" ? "PPF" : s.cat === "tint" ? (isAr ? "تظليل" : "Tint") : (isAr ? "سيراميك" : "Ceramic");
                              return (
                                <span key={svcId} style={{
                                  padding: "3px 10px", fontSize: 9, fontWeight: 700, borderRadius: 100,
                                  background: `${tierColor}15`, color: tierColor, border: `1px solid ${tierColor}30`,
                                  textTransform: isAr ? "none" : "uppercase" as const, letterSpacing: isAr ? "0" : "0.04em",
                                }}>{catLabel}</span>
                              );
                            })}
                          </div>

                          {/* Select indicator */}
                          {isActive && (
                            <div style={{
                              position: "absolute", top: 14, ...(dir === "rtl" ? { left: 12 } : { right: 12 }),
                              width: 24, height: 24, borderRadius: "50%", background: tierColor,
                              display: "flex", alignItems: "center", justifyContent: "center",
                            }}>
                              <svg width="12" height="12" viewBox="0 0 14 14" fill="none"><path d="M3.5 7L5.75 9.25L10.5 4.5" stroke="#000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                            </div>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Expanded package — visual service cards */}
                {activePack && (() => {
                  const pack = packages.find(p => p.id === activePack);
                  if (!pack) return null;
                  const tierColors = { basic: "#64B5F6", premium: "#F6BE00", vip: "#E040FB" };
                  const tierColor = tierColors[pack.tier];
                  const packSvcs = pack.svcIds.map(id => svcs.find(x => x.id === id)).filter(Boolean) as Svc[];
                  return (
                    <div style={{ marginTop: 20, animation: "fadeUp 0.3s ease-out" }}>
                      {/* Header */}
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <span style={{ color: tierColor, fontWeight: 700, fontSize: 14 }}>{t.booking.packIncludes}</span>
                          <span style={{ padding: "3px 12px", borderRadius: 100, fontSize: 11, fontWeight: 700, background: `${tierColor}15`, color: tierColor, border: `1px solid ${tierColor}30` }}>{pack.name}</span>
                        </div>
                        {size && (
                          <div style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "4px 12px", borderRadius: 100, fontSize: 11, fontWeight: 700, background: "rgba(76,175,80,0.12)", color: "#4CAF50" }}>
                            -{pack.discount}%
                          </div>
                        )}
                      </div>

                      {/* Service cards grid — same visual as category cards */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {packSvcs.map((s) => (
                          <div key={s.id} style={{
                            borderRadius: 14, overflow: "hidden",
                            outline: `2px solid ${tierColor}`,
                            outlineOffset: -2,
                            boxShadow: `0 0 20px ${tierColor}15`,
                            textAlign: dir === "rtl" ? "right" : "left",
                          }}>
                            {/* Image */}
                            <div style={{ position: "relative", height: 140 }}>
                              <Image src={s.img} alt={s.name} fill className="object-cover" />
                              <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, #111 0%, rgba(17,17,17,0.3) 50%, transparent 100%)" }} />
                              {/* Category pill */}
                              <span style={{
                                position: "absolute", top: 10, ...(dir === "rtl" ? { right: 10 } : { left: 10 }),
                                padding: "3px 10px", fontSize: 10, fontWeight: 700, borderRadius: 100,
                                background: `${tierColor}20`, color: tierColor, backdropFilter: "blur(8px)",
                                border: `1px solid ${tierColor}30`,
                                textTransform: isAr ? "none" : "uppercase" as const, letterSpacing: isAr ? "0" : "0.05em",
                              }}>
                                {categories.find(c => c.id === s.cat)?.label}
                              </span>
                              {/* Price badge */}
                              <span style={{
                                position: "absolute", bottom: 10, ...(dir === "rtl" ? { left: 10 } : { right: 10 }),
                                padding: "5px 12px", background: tierColor, color: "#000", fontSize: 13, fontWeight: 700, borderRadius: 8,
                              }}>
                                {size ? s.p[size].toLocaleString() : "—"} {cur}
                              </span>
                              {/* Checkmark */}
                              <div style={{
                                position: "absolute", top: 10, ...(dir === "rtl" ? { left: 10 } : { right: 10 }),
                                width: 26, height: 26, borderRadius: "50%", background: tierColor,
                                display: "flex", alignItems: "center", justifyContent: "center",
                              }}>
                                <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M3.5 7L5.75 9.25L10.5 4.5" stroke="#000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                              </div>
                            </div>
                            {/* Info */}
                            <div style={{ padding: "14px 16px", background: "#111" }}>
                              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                                <span style={{ color: tierColor, fontWeight: 700, fontSize: 14 }}>{s.name}</span>
                                <span style={{ fontSize: 10, color: tierColor, border: `1px solid ${tierColor}30`, padding: "2px 8px", borderRadius: 100, flexShrink: 0 }}>{s.w}</span>
                              </div>
                              <p style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", lineHeight: 1.4, marginBottom: 8, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" as const, overflow: "hidden" }}>{catDesc[s.cat]}</p>
                              <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                                {s.parts.slice(0, 4).map(p => (
                                  <span key={p} style={{ padding: "3px 9px", fontSize: 10, borderRadius: 100, background: `${tierColor}08`, color: "rgba(255,255,255,0.4)", border: `1px solid ${tierColor}15` }}>{p}</span>
                                ))}
                                {s.parts.length > 4 && <span style={{ padding: "3px 9px", fontSize: 10, borderRadius: 100, color: `${tierColor}80` }}>+{s.parts.length - 4}</span>}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Total bar */}
                      {size && (
                        <div style={{
                          marginTop: 16, padding: "16px 24px", borderRadius: 14,
                          background: `${tierColor}06`, border: `1px solid ${tierColor}25`,
                          display: "flex", justifyContent: "space-between", alignItems: "center",
                        }}>
                          <span style={{ color: "rgba(255,255,255,0.5)", fontWeight: 600, fontSize: 14 }}>{t.booking.totalLabel}</span>
                          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <span style={{ color: "rgba(255,255,255,0.25)", fontSize: 13, textDecoration: "line-through" }}>
                              {pack.svcIds.reduce((s, id) => { const v = svcs.find(x => x.id === id); return s + (v ? v.p[size] : 0); }, 0).toLocaleString()} {cur}
                            </span>
                            <span style={{ color: tierColor, fontWeight: 700, fontSize: 20, fontFamily: fontDisplay }}>{getPackPrice(pack).toLocaleString()} {cur}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })()}

                {/* Divider to individual services */}
                <div style={{ textAlign: "center", marginTop: 24 }}>
                  <span style={{ color: "rgba(255,255,255,0.2)", fontSize: 12 }}>— {t.booking.orPickIndividual} —</span>
                </div>
              </div>
            )}

            {/* Service Cards — 3 column grid */}
            {category !== "packages" && <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredSvcs.map((s) => {
                const isSelected = sel.includes(s.id);
                const svcAddons = selAddons[s.id] || [];
                return (
                  <button key={s.id} onClick={() => toggleSvc(s.id)} style={{
                    width: "100%", padding: 0, cursor: "pointer", background: "none", border: "none",
                    borderRadius: 14, overflow: "hidden", transition: "all 0.3s",
                    outline: isSelected ? "2px solid #F6BE00" : "2px solid rgba(255,255,255,0.06)",
                    outlineOffset: -2,
                    boxShadow: isSelected ? "0 0 20px rgba(246,190,0,0.1)" : "none",
                    textAlign: dir === "rtl" ? "right" : "left",
                  }}
                    onMouseEnter={e => { if (!isSelected) { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.4)"; e.currentTarget.style.outlineColor = "rgba(246,190,0,0.3)"; } }}
                    onMouseLeave={e => { if (!isSelected) { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.outlineColor = "rgba(255,255,255,0.06)"; } }}
                  >
                    {/* Image */}
                    <div style={{ position: "relative", height: 140 }}>
                      <Image src={s.img} alt={s.name} fill className="object-cover" />
                      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, #111 0%, rgba(17,17,17,0.3) 50%, transparent 100%)" }} />
                      {/* Popular badge */}
                      {s.popular && (
                        <span style={{
                          position: "absolute", top: 10, ...(dir === "rtl" ? { right: 10 } : { left: 10 }),
                          padding: "4px 12px", fontSize: 10, fontWeight: 700, borderRadius: 100,
                          background: "#F6BE00", color: "#000", zIndex: 2,
                          textTransform: isAr ? "none" : "uppercase" as const, letterSpacing: isAr ? "0" : "0.05em",
                          boxShadow: "0 2px 8px rgba(246,190,0,0.3)",
                        }}>
                          ★ {t.booking.popular}
                        </span>
                      )}
                      {/* Category pill — only if not popular (to avoid overlap) */}
                      {!s.popular && (
                        <span style={{
                          position: "absolute", top: 10, ...(dir === "rtl" ? { right: 10 } : { left: 10 }),
                          padding: "3px 10px", fontSize: 10, fontWeight: 700, borderRadius: 100,
                          background: "rgba(246,190,0,0.15)", color: "#F6BE00", backdropFilter: "blur(8px)",
                          border: "1px solid rgba(246,190,0,0.2)",
                          textTransform: isAr ? "none" : "uppercase" as const, letterSpacing: isAr ? "0" : "0.05em",
                        }}>
                          {categories.find(c => c.id === s.cat)?.label}
                        </span>
                      )}
                      {/* Price badge */}
                      <span style={{
                        position: "absolute", bottom: 10, ...(dir === "rtl" ? { left: 10 } : { right: 10 }),
                        padding: "5px 12px", background: "#F6BE00", color: "#000", fontSize: 13, fontWeight: 700, borderRadius: 8,
                      }}>
                        {size ? s.p[size].toLocaleString() : "—"} {cur}
                      </span>
                      {/* Checkmark */}
                      {isSelected && (
                        <div style={{
                          position: "absolute", top: 10, ...(dir === "rtl" ? { left: 10 } : { right: 10 }),
                          width: 26, height: 26, borderRadius: "50%", background: "#F6BE00",
                          display: "flex", alignItems: "center", justifyContent: "center",
                        }}>
                          <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M3.5 7L5.75 9.25L10.5 4.5" stroke="#000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                        </div>
                      )}
                    </div>
                    {/* Info */}
                    <div style={{ padding: "14px 16px", background: "#111" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                        <span style={{ color: isSelected ? "#F6BE00" : "#fff", fontWeight: 700, fontSize: 14 }}>{s.name}</span>
                        <span style={{ fontSize: 10, color: "#F6BE00", border: "1px solid rgba(246,190,0,0.2)", padding: "2px 8px", borderRadius: 100, flexShrink: 0 }}>{s.w}</span>
                      </div>
                      <p style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", lineHeight: 1.4, marginBottom: 8, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" as const, overflow: "hidden" }}>{catDesc[s.cat]}</p>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                        {s.parts.slice(0, 4).map(p => (
                          <span key={p} style={{ padding: "3px 9px", fontSize: 10, borderRadius: 100, background: "rgba(255,255,255,0.04)", color: "rgba(255,255,255,0.4)", border: "1px solid rgba(255,255,255,0.06)" }}>{p}</span>
                        ))}
                        {s.parts.length > 4 && <span style={{ padding: "3px 9px", fontSize: 10, borderRadius: 100, color: "rgba(246,190,0,0.5)" }}>+{s.parts.length - 4}</span>}
                      </div>
                      {/* Selected addons count badge */}
                      {isSelected && svcAddons.length > 0 && (
                        <div style={{ marginTop: 8, display: "flex", alignItems: "center", gap: 6 }}>
                          <span style={{ fontSize: 10, color: "rgba(246,190,0,0.7)" }}>+{svcAddons.length} {t.booking.additionalServices.toLowerCase()}</span>
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>}

            {/* Detail panel — rendered below grid for the expanded service */}
            {detailSvc && sel.includes(detailSvc.id) && (() => {
              const s = detailSvc;
              const svcAddons = selAddons[s.id] || [];
              return (
                <div ref={detailRef} style={{
                  marginTop: 16, background: "#0d0d0d", borderRadius: 14,
                  border: "2px solid #F6BE00",
                  padding: 24, animation: "fadeUp 0.3s ease-out",
                }}>
                  {/* Header */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <span style={{ color: "#F6BE00", fontWeight: 700, fontSize: 16 }}>{s.name}</span>
                      <span style={{ fontSize: 11, color: "#F6BE00", border: "1px solid rgba(246,190,0,0.2)", padding: "2px 10px", borderRadius: 100 }}>{s.w}</span>
                    </div>
                    <button onClick={() => setDetailId(null)} style={{
                      width: 32, height: 32, borderRadius: "50%", cursor: "pointer",
                      background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)",
                      color: "rgba(255,255,255,0.4)", fontSize: 16, display: "flex", alignItems: "center", justifyContent: "center",
                    }}>✕</button>
                  </div>

                  {/* Coverage areas */}
                  {s.parts.length > 1 && (
                    <div style={{ marginBottom: 20 }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: "#F6BE00", marginBottom: 10, textTransform: isAr ? "none" : "uppercase" as const, letterSpacing: isAr ? "0" : "0.08em" }}>
                        {t.booking.coverageAreas}
                      </div>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                        {s.parts.map(p => (
                          <span key={p} style={{
                            display: "flex", alignItems: "center", gap: 6, padding: "7px 14px", borderRadius: 10,
                            background: "rgba(246,190,0,0.06)", border: "1px solid rgba(246,190,0,0.15)",
                            color: "rgba(255,255,255,0.7)", fontSize: 12,
                          }}>
                            <svg width="10" height="10" viewBox="0 0 12 12" fill="none"><path d="M3.5 6L5.25 7.75L8.5 4.5" stroke="#F6BE00" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                            {p}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Additional services — visual grid */}
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: "#F6BE00", marginBottom: 12, textTransform: isAr ? "none" : "uppercase" as const, letterSpacing: isAr ? "0" : "0.08em" }}>
                      {t.booking.additionalServices}
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 10 }}>
                      {addons.map(addon => {
                        const price = getAddonPrice(addon, s.addonTier);
                        const isChecked = svcAddons.includes(addon.id);
                        return (
                          <button key={addon.id}
                            onClick={(e) => { e.stopPropagation(); toggleAddon(s.id, addon.id); }}
                            style={{
                              display: "flex", flexDirection: "column", alignItems: "center", gap: 8,
                              padding: "16px 12px", borderRadius: 12, cursor: "pointer",
                              background: isChecked ? "rgba(246,190,0,0.1)" : "rgba(255,255,255,0.02)",
                              border: isChecked ? "1.5px solid rgba(246,190,0,0.4)" : "1.5px solid rgba(255,255,255,0.06)",
                              transition: "all 0.25s", textAlign: "center", position: "relative",
                            }}
                            onMouseEnter={e => { if (!isChecked) e.currentTarget.style.borderColor = "rgba(246,190,0,0.2)"; }}
                            onMouseLeave={e => { if (!isChecked) e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)"; }}
                          >
                            {isChecked && (
                              <div style={{ position: "absolute", top: 6, ...(dir === "rtl" ? { left: 6 } : { right: 6 }), width: 18, height: 18, borderRadius: "50%", background: "#F6BE00", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                <svg width="10" height="10" viewBox="0 0 12 12" fill="none"><path d="M3 6L5 8L9 4" stroke="#000" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
                              </div>
                            )}
                            <div style={{
                              width: 44, height: 44, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center",
                              background: isChecked ? "rgba(246,190,0,0.15)" : "rgba(255,255,255,0.04)",
                              color: isChecked ? "#F6BE00" : "rgba(255,255,255,0.3)",
                              transition: "all 0.25s",
                            }}>
                              {addon.icon}
                            </div>
                            <span style={{ color: isChecked ? "#fff" : "rgba(255,255,255,0.45)", fontSize: 11, lineHeight: 1.3 }}>{addon.name}</span>
                            <span style={{ color: "#F6BE00", fontSize: 12, fontWeight: 700 }}>+{price} {cur}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Sticky floating total bar */}
            {sel.length > 0 && (
              <div style={{
                position: "sticky", bottom: 16, zIndex: 20, marginTop: 24,
                padding: "16px 24px", borderRadius: 16,
                background: "rgba(17,17,17,0.95)", backdropFilter: "blur(12px)",
                border: "1px solid rgba(246,190,0,0.25)",
                boxShadow: "0 -4px 24px rgba(0,0,0,0.5)",
                display: "flex", justifyContent: "space-between", alignItems: "center",
              }}>
                <div>
                  <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 12 }}>{t.booking.estimatedTotal}</div>
                  <div className="gold-text" style={{ fontFamily: fontDisplay, fontSize: 24, fontWeight: 700, transition: "all 0.3s" }}>{displayTotal.toLocaleString()} {cur}</div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                  <span style={{ color: "rgba(255,255,255,0.25)", fontSize: 13 }}>{sel.length} {sel.length > 1 ? t.booking.servicesCount : t.booking.serviceCount}</span>
                  <button onClick={() => setStep(3)} className="btn-gold" style={{ margin: 0, padding: "10px 28px" }}>{t.booking.continue}</button>
                </div>
              </div>
            )}

            {/* Back button — only show when no services selected (sticky bar handles Continue) */}
            <div style={{ marginTop: 40, display: "flex", justifyContent: sel.length > 0 ? "center" : "space-between" }}>
              <button onClick={() => setStep(1)} className="btn-outline">{t.booking.back}</button>
            </div>
          </div>
        )}

        {/* STEP 3 */}
        {step === 3 && (
          <div className="step-enter" style={{ maxWidth: 600, margin: "0 auto" }}>
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
                {(["ppf", "tint", "ceramic"] as const).map(cat => {
                  const catSvcs = sel.filter(id => svcs.find(s => s.id === id)?.cat === cat);
                  if (catSvcs.length === 0) return null;
                  return (
                    <div key={cat} style={{ marginBottom: 10 }}>
                      <div style={{ fontSize: 10, fontWeight: 700, color: "#F6BE00", opacity: 0.6, textTransform: isAr ? "none" : "uppercase" as const, letterSpacing: isAr ? "0" : "0.08em", marginBottom: 4 }}>
                        {categories.find(c => c.id === cat)?.label}
                      </div>
                      {catSvcs.map(id => {
                        const s = svcs.find(x => x.id === id)!;
                        const svcAddonList = selAddons[id] || [];
                        return (
                          <div key={id}>
                            <div style={{ display: "flex", justifyContent: "space-between", padding: "5px 0", fontSize: 14 }}>
                              <span style={{ color: "rgba(255,255,255,0.65)" }}>{s.name}</span>
                              <span style={{ color: "#F6BE00", fontWeight: 600 }}>{size ? s.p[size].toLocaleString() : 0} {cur}</span>
                            </div>
                            {svcAddonList.map(aid => {
                              const addon = addons.find(a => a.id === aid)!;
                              const price = getAddonPrice(addon, s.addonTier);
                              return (
                                <div key={aid} style={{ display: "flex", justifyContent: "space-between", padding: "2px 0 2px 16px", fontSize: 12 }}>
                                  <span style={{ color: "rgba(255,255,255,0.35)" }}>+ {addon.name}</span>
                                  <span style={{ color: "rgba(246,190,0,0.6)" }}>{price} {cur}</span>
                                </div>
                              );
                            })}
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
              <div style={{ padding: 20, background: "rgba(246,190,0,0.04)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ color: "#fff", fontWeight: 700, fontSize: 16 }}>{t.booking.totalLabel}</span>
                <span className="gold-text" style={{ fontFamily: fontDisplay, fontSize: 22, fontWeight: 700 }}>{displayTotal.toLocaleString()} {cur}</span>
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column" as const, gap: 14, marginBottom: 32 }}>
              {[
                { k: "name" as const, ph: t.booking.namePh, tp: "text" },
                { k: "phone" as const, ph: t.booking.phonePh, tp: "tel" },
              ].map(f => (
                <input key={f.k} type={f.tp} value={form[f.k]} onChange={e => setForm({...form, [f.k]: e.target.value})}
                  placeholder={f.ph} dir={f.k === "phone" ? "ltr" : undefined}
                  onFocus={e => { e.currentTarget.style.borderColor = "#F6BE00"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(246,190,0,0.1)"; }}
                  onBlur={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"; e.currentTarget.style.boxShadow = "none"; }}
                  style={{ width: "100%", padding: "14px 18px", borderRadius: 12, background: "#111", border: "1px solid rgba(255,255,255,0.08)", color: "#fff", fontSize: 15, outline: "none", transition: "border-color 0.2s, box-shadow 0.2s", textAlign: f.k === "phone" ? ("left" as const) : undefined }} />
              ))}
              <textarea value={form.notes} onChange={e => setForm({...form, notes: e.target.value})}
                placeholder={t.booking.notesPh} rows={3}
                onFocus={e => { e.currentTarget.style.borderColor = "#F6BE00"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(246,190,0,0.1)"; }}
                onBlur={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"; e.currentTarget.style.boxShadow = "none"; }}
                style={{ width: "100%", padding: "14px 18px", borderRadius: 12, background: "#111", border: "1px solid rgba(255,255,255,0.08)", color: "#fff", fontSize: 15, outline: "none", resize: "none" as const, transition: "border-color 0.2s, box-shadow 0.2s" }} />
            </div>

            <div style={{ marginBottom: 24 }}>
              <div style={{ color: "rgba(255,255,255,0.35)", fontSize: 12, textTransform: isAr ? "none" : "uppercase" as const, letterSpacing: isAr ? "0" : "0.08em", marginBottom: 16 }}>{t.booking.paymentMethod}</div>
              <div style={{ display: "flex", flexDirection: "column" as const, gap: 10 }}>
                <Link href={`https://nick.sa/checkout?amount=${total}&name=${encodeURIComponent(form.name)}&phone=${encodeURIComponent(form.phone)}`} target="_blank" className="btn-gold"
                  onClick={() => setTimeout(() => setOrderSent(true), 500)}
                  style={(!form.name || !form.phone) ? { opacity: 0.3, pointerEvents: "none", width: "100%", justifyContent: "center" } : { width: "100%", justifyContent: "center" }}>
                  <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><rect x="1" y="4" width="22" height="16" rx="2" /><line x1="1" y1="10" x2="23" y2="10" /></svg>
                  {t.booking.payOnline} &mdash; {displayTotal.toLocaleString()} {cur}
                </Link>
                <Link href={`https://nick.sa/checkout?method=tabby&amount=${total}&name=${encodeURIComponent(form.name)}&phone=${encodeURIComponent(form.phone)}`} target="_blank"
                  style={(!form.name || !form.phone) ? { ...bnplBase, background: "#003227", opacity: 0.3, pointerEvents: "none" } : { ...bnplBase, background: "#003227" }}>
                  <span><svg width="60" height="20" viewBox="0 0 60 20" fill="none"><text x="0" y="16" fontFamily="system-ui, sans-serif" fontWeight="800" fontSize="18" letterSpacing="-0.5" fill="#3bff9d">tabby</text></svg></span>
                  <span style={{ display: "flex", flexDirection: "column" as const, alignItems: dir === "rtl" ? "flex-start" : "flex-end" }}>
                    <span style={{ color: "#fff", fontSize: 13, fontWeight: 700 }}>{Math.ceil(total / 4).toLocaleString()} {cur}<span style={{ fontWeight: 400, opacity: 0.6 }}>{t.booking.perMonth}</span></span>
                    <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 11 }}>{t.booking.splitIn4}</span>
                  </span>
                </Link>
                <Link href={`https://nick.sa/checkout?method=tamara&amount=${total}&name=${encodeURIComponent(form.name)}&phone=${encodeURIComponent(form.phone)}`} target="_blank"
                  style={(!form.name || !form.phone) ? { ...bnplBase, background: "#250155", opacity: 0.3, pointerEvents: "none" } : { ...bnplBase, background: "#250155" }}>
                  <span><svg width="72" height="20" viewBox="0 0 72 20" fill="none"><text x="0" y="16" fontFamily="system-ui, sans-serif" fontWeight="800" fontSize="18" letterSpacing="-0.5" fill="#c77dff">tamara</text></svg></span>
                  <span style={{ display: "flex", flexDirection: "column" as const, alignItems: dir === "rtl" ? "flex-start" : "flex-end" }}>
                    <span style={{ color: "#fff", fontSize: 13, fontWeight: 700 }}>{Math.ceil(total / 3).toLocaleString()} {cur}<span style={{ fontWeight: 400, opacity: 0.6 }}>{t.booking.perMonth}</span></span>
                    <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 11 }}>{t.booking.splitIn3}</span>
                  </span>
                </Link>
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 20 }}>
              <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.08)" }} />
              <span style={{ color: "rgba(255,255,255,0.2)", fontSize: 12 }}>{t.booking.or}</span>
              <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.08)" }} />
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
              <button onClick={() => setStep(2)} className="btn-outline">{t.booking.back}</button>
              <Link href={buildWhatsApp()} target="_blank" className="btn-gold"
                onClick={() => setTimeout(() => setOrderSent(true), 500)}
                style={(!form.name || !form.phone) ? { opacity: 0.3, pointerEvents: "none" } : {}}>
                <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                {t.booking.confirmWhatsapp}
              </Link>
            </div>

            {/* Success overlay */}
            {orderSent && (
              <div style={{
                position: "fixed", inset: 0, zIndex: 100,
                background: "rgba(5,5,5,0.9)", backdropFilter: "blur(8px)",
                display: "flex", alignItems: "center", justifyContent: "center",
                animation: "fadeUp 0.4s ease-out",
              }}>
                <div style={{ textAlign: "center", maxWidth: 400, padding: 40 }}>
                  <div style={{
                    width: 80, height: 80, borderRadius: "50%", background: "#F6BE00",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    margin: "0 auto 24px", animation: "fadeUp 0.5s ease-out 0.1s both",
                  }}>
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12l5 5L20 7" /></svg>
                  </div>
                  <h3 style={{ fontFamily: fontDisplay, fontSize: 28, fontWeight: 700, color: "#F6BE00", marginBottom: 12, animation: "fadeUp 0.5s ease-out 0.2s both" }}>{t.booking.orderSent}</h3>
                  <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 15, lineHeight: 1.6, animation: "fadeUp 0.5s ease-out 0.3s both" }}>{t.booking.orderSentSub}</p>
                  <button onClick={() => { setOrderSent(false); setStep(1); setSel([]); setSelAddons({}); setForm({ name: "", phone: "", notes: "" }); }} className="btn-outline" style={{ marginTop: 32, animation: "fadeUp 0.5s ease-out 0.4s both" }}>
                    {t.booking.back}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
