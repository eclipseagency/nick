"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import Image from "next/image";
import { useReveal } from "@/hooks/useReveal";
import { useLanguage } from "@/i18n/LanguageContext";

interface ApiService {
  id: string; category: string; name_en: string; name_ar: string;
  price_small: number; price_large: number; warranty: string | null;
  image: string | null; image_small: string | null; image_large: string | null;
  popular: boolean; active: boolean; sort_order: number;
}

type Size = "small" | "large" | null;
type Category = "ppf" | "tint" | "ceramic";

interface Addon { id: string; name: string; p: { small: number; large: number }; icon: React.ReactNode; imgSmall?: string; imgLarge?: string }
interface Svc {
  id: string; cat: "ppf" | "tint" | "ceramic"; name: string; w: string; img: string;
  imgSmall?: string; imgLarge?: string;
  p: { small: number; large: number };
  pBefore?: { small: number; large: number };
  parts: string[];
  details: string[];
  addonTier: "low" | "high";
  popular?: boolean;
  tier?: string;
}

export default function Booking() {
  const [size, setSize] = useState<Size>(null);
  const [category, setCategory] = useState<Category>("ppf");
  const [sel, setSel] = useState<string[]>([]);
  const [detailId, setDetailId] = useState<string | null>(null);
  const [detailsOpenId, setDetailsOpenId] = useState<string | null>(null);
  const [selAddons, setSelAddons] = useState<Record<string, string[]>>({});
  const [form, setForm] = useState({ name: "", phone: "", notes: "", carMake: "", preferredDate: "" });
  const [unavailableDates, setUnavailableDates] = useState<string[]>([]);
  const [orderSent, setOrderSent] = useState(false);
  const [bookingError, setBookingError] = useState("");
  const [confirmationNumber, setConfirmationNumber] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [displayTotal, setDisplayTotal] = useState(0);
  const [apiServices, setApiServices] = useState<ApiService[]>([]);
  const detailRef = useRef<HTMLDivElement>(null);

  // Section refs for scroll-to anchors
  const step1Ref = useRef<HTMLDivElement>(null);
  const step2Ref = useRef<HTMLDivElement>(null);
  const step3Ref = useRef<HTMLDivElement>(null);

  const { t, locale, dir } = useLanguage();
  const ref = useReveal([locale]);
  const isAr = locale === "ar";
  const fontDisplay = isAr ? "var(--font-ar)" : "var(--font-display)";
  const cur = isAr ? "ر.س" : "SAR";

  const catDesc: Record<string, string> = { ppf: t.services.s1desc, tint: t.services.s2desc, ceramic: t.services.s3desc };

  const sectionRef = useRef<HTMLElement>(null);

  // Scroll to a section smoothly
  const scrollToSection = (ref: React.RefObject<HTMLDivElement | null>) => {
    setTimeout(() => ref.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
  };

  // Mutually exclusive groups — selecting one auto-removes others in same group
  const exclusiveGroups: string[][] = [
    ["ppf-color", "ppf-clear75", "ppf-clear85", "ppf-matte", "wrapping"], // full body PPF — pick one
    ["tint-plus", "tint-flex", "tint-lite"], // full car tint — pick one
    ["tint-front-max", "tint-front-pro", "tint-front-plus", "tint-front-flex", "tint-front-lite"], // front windshield tint — pick one
    ["ceramic-int-1"], // interior ceramic — only one tier
    ["ceramic-ext-1", "ceramic-ext-3", "ceramic-ext-5"], // exterior ceramic — pick one tier
  ];

  const toggleSvc = (id: string) => {
    if (sel.includes(id)) {
      setSel(p => p.filter(x => x !== id));
      setSelAddons(a => { const n = { ...a }; delete n[id]; return n; });
      if (detailId === id) setDetailId(null);
    } else {
      // Remove conflicting services from the same exclusive group
      const group = exclusiveGroups.find(g => g.includes(id));
      const conflicting = group ? group.filter(gid => gid !== id && sel.includes(gid)) : [];
      setSel(p => {
        const cleaned = conflicting.length > 0 ? p.filter(x => !conflicting.includes(x)) : p;
        return [...cleaned, id];
      });
      if (conflicting.length > 0) {
        setSelAddons(a => { const n = { ...a }; conflicting.forEach(cid => delete n[cid]); return n; });
      }
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
    { id: "small" as const, label: t.booking.carSmall, ex: "Civic, Corolla, Elantra, Camry", img: "/images/small-car-active.png", imgHover: "/images/small-car-hover.png" },
    { id: "large" as const, label: t.booking.carLarge, ex: "Tahoe, Land Cruiser, S-Class", img: "/images/big-car-active.png", imgHover: "/images/big-car-hover.png" },
  ];

  const categories: { id: Category; label: string; icon: React.ReactNode }[] = [
    { id: "ppf", label: t.booking.catPpf, icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg> },
    { id: "tint", label: t.booking.catTint, icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg> },
    { id: "ceramic", label: t.booking.catCeramic, icon: <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/></svg> },
  ];

  const addons: Addon[] = [
    { id: "ozone", name: t.booking.addonOzone, p: { small: 100, large: 150 }, imgSmall: "/images/addon-ozone-small.png", imgLarge: "/images/addon-ozone-large.png",
      icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M8 2c0 0-3 4-3 7a3 3 0 0 0 6 0c0-3-3-7-3-7z"/><path d="M16 6c0 0-2 3-2 5a2 2 0 0 0 4 0c0-2-2-5-2-5z"/><path d="M12 14v4"/><path d="M8 18h8"/><path d="M6 22h12"/></svg> },
    { id: "rim-ceramic", name: t.booking.addonRimCeramic, p: { small: 400, large: 400 }, imgSmall: "/images/addon-rim-small.png", imgLarge: "/images/addon-rim-large.png",
      icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><circle cx="12" cy="12" r="4"/><line x1="12" y1="2" x2="12" y2="8"/><line x1="12" y1="16" x2="12" y2="22"/><line x1="2" y1="12" x2="8" y2="12"/><line x1="16" y1="12" x2="22" y2="12"/></svg> },
    { id: "engine-clean", name: t.booking.addonEngineClean, p: { small: 100, large: 150 }, imgSmall: "/images/addon-engine-small.png", imgLarge: "/images/addon-engine-large.png",
      icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg> },
    { id: "remove-tint", name: t.booking.addonRemoveTint, p: { small: 200, large: 300 }, imgSmall: "/images/addon-remove-tint-small.png", imgLarge: "/images/addon-remove-tint-large.png",
      icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="9" y1="9" x2="15" y2="15"/><line x1="15" y1="9" x2="9" y2="15"/></svg> },
    { id: "remove-partial", name: t.booking.addonRemovePartial, p: { small: 250, large: 350 },
      icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><line x1="8" y1="12" x2="16" y2="12"/></svg> },
    { id: "remove-front", name: t.booking.addonRemoveFront, p: { small: 400, large: 500 }, imgSmall: "/images/addon-remove-front-small.png", imgLarge: "/images/addon-remove-front-large.png",
      icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><line x1="9" y1="9" x2="15" y2="15"/><line x1="15" y1="9" x2="9" y2="15"/></svg> },
    { id: "remove-full", name: t.booking.addonRemoveFull, p: { small: 1200, large: 1400 },
      icon: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="6" width="22" height="12" rx="3"/><circle cx="7" cy="18" r="2"/><circle cx="17" cy="18" r="2"/><line x1="8" y1="10" x2="16" y2="14"/><line x1="16" y1="10" x2="8" y2="14"/></svg> },
  ];

  // Build price override map from API data
  const priceMap = useMemo(() => {
    const m: Record<string, { small: number; large: number }> = {};
    apiServices.forEach(s => { m[s.id] = { small: s.price_small, large: s.price_large }; });
    return m;
  }, [apiServices]);

  // Use API prices when available, fallback to hardcoded
  const sp = (id: string, fallback: { small: number; large: number }) => priceMap[id] || fallback;

  // Bilingual product details
  const d = (ar: string, en: string) => isAr ? ar : en;
  const ppfBase = [d("قص الكتروني", "Electronic precision cutting"), d("معالجة ذاتية", "Self-healing technology"), d("مصمم ليكون مقاومًا للغبار", "Designed to be dust-resistant"), d("مصمم خصيصًا لأجواء المملكة العربية السعودية", "Designed for Saudi Arabia's climate")];
  const tintSideDesc = [d("عازل بتقنية النانو سيراميك المتطورة", "Advanced nano ceramic insulation technology"), d("العازل يشمل الزجاج الجانبي والخلفي فقط", "Covers side and rear windows only")];

  const svcs: Svc[] = [
    { id: "ppf-color", cat: "ppf", name: t.booking.svcPpfColor, p: sp("ppf-color", { small: 11880, large: 14480 }), pBefore: { small: 14500, large: 17500 }, w: "5yr", img: "/images/DSC03279.jpg", imgSmall: "/images/ppf-color-small.png", imgLarge: "/images/ppf-color-large.png", addonTier: "high", parts: [t.booking.fullBody], details: [d("معالجة ذاتية", "Self-healing technology"), d("سماكة فلم الحماية 8.5", "Film thickness 8.5mm"), d("تغيير لون السيارة مع حماية الطلاء في نفس الوقت", "Change car color with paint protection at the same time"), d("مصمم ليكون مقاومًا للغبار", "Designed to be dust-resistant"), d("مصمم خصيصًا لأجواء المملكة العربية السعودية", "Designed for Saudi Arabia's climate")] },
    { id: "ppf-clear75", cat: "ppf", name: t.booking.svcPpfClear75, p: sp("ppf-clear75", { small: 9780, large: 11380 }), pBefore: { small: 12000, large: 14000 }, w: "10yr", tier: "SPRINT", img: "/images/DSC03292.jpg", imgSmall: "/images/ppf-fullbody-small.png", imgLarge: "/images/ppf-fullbody-large.png", addonTier: "low", parts: [t.booking.fullBody], details: [d("سماكة فلم الحماية +7.5", "Film thickness 7.5mm+"), ...ppfBase] },
    { id: "ppf-clear85", cat: "ppf", name: t.booking.svcPpfClear85, p: sp("ppf-clear85", { small: 10780, large: 12180 }), pBefore: { small: 13000, large: 15000 }, w: "10yr", tier: "TURBO", img: "/images/DSC03235.jpg", imgSmall: "/images/ppf-fullbody-small.png", imgLarge: "/images/ppf-fullbody-large.png", addonTier: "low", parts: [t.booking.fullBody], details: [d("سماكة فلم الحماية +8.5", "Film thickness 8.5mm+"), ...ppfBase], popular: true },
    { id: "ppf-matte", cat: "ppf", name: t.booking.svcPpfMatte, p: sp("ppf-matte", { small: 11380, large: 12980 }), pBefore: { small: 14000, large: 16000 }, w: "10yr", img: "/images/DSC03064.jpg", imgSmall: "/images/ppf-matte-small.png", imgLarge: "/images/ppf-matte-large.png", addonTier: "low", parts: [t.booking.fullBody], details: [d("سماكة فلم الحماية +8.5", "Film thickness 8.5mm+"), ...ppfBase] },
    { id: "wrapping", cat: "ppf", name: t.booking.svcWrapping, p: sp("wrapping", { small: 8780, large: 10780 }), pBefore: { small: 11000, large: 13000 }, w: "3yr", img: "", addonTier: "low", parts: [t.booking.fullBody], details: [d("تغيير لون السيارة بدون رش", "Color change without paint spray"), d("متوفر بألوان متعددة (مطفي – لامع – ساتان - كاربون)", "Available in multiple finishes (matte, gloss, satin, carbon)"), d("قابل للإزالة دون التأثير على الطلاء", "Removable without affecting original paint"), d("تركيب احترافي بدقة عالية", "Professional high-precision installation")] },
    { id: "ppf-front", cat: "ppf", name: t.booking.svcPpfFront, p: sp("ppf-front", { small: 2980, large: 4780 }), pBefore: { small: 3660, large: 5660 }, w: "10yr", img: "/images/DSC03292.jpg", imgSmall: "/images/ppf-front-small.png", imgLarge: "/images/ppf-front-large.png", addonTier: "high",
      parts: [t.booking.fullHood, t.booking.fullFenders, t.booking.frontBumper, t.booking.frontLights, t.booking.sideMirrors, t.booking.frontPillars, t.booking.doorEdges], details: [d("سماكة فلم الحماية +7.5", "Film thickness 7.5mm+"), ...ppfBase] },
    { id: "ppf-partial", cat: "ppf", name: t.booking.svcPpfPartial, p: sp("ppf-partial", { small: 1680, large: 2680 }), pBefore: { small: 2000, large: 3200 }, w: "10yr", img: "/images/DSC03064.jpg", imgSmall: "/images/ppf-partial-small.png", imgLarge: "/images/ppf-partial-large.png", addonTier: "low",
      parts: [t.booking.halfHood, t.booking.halfFenders, t.booking.frontBumper, t.booking.frontLights, t.booking.sideMirrors, t.booking.frontPillars, t.booking.doorEdges], details: [d("سماكة فلم الحماية +7.5", "Film thickness 7.5mm+"), ...ppfBase] },
    { id: "ppf-interior", cat: "ppf", name: t.booking.svcPpfInterior, p: sp("ppf-interior", { small: 1180, large: 1580 }), pBefore: { small: 1400, large: 1950 }, w: "10yr", img: "", imgSmall: "/images/ppf-interior-small.png", imgLarge: "/images/ppf-interior-large.png", addonTier: "low", parts: [t.booking.interiorSurfaces], details: [d("سهولة التنظيف دون التأثير على جودة الأسطح الحساسة", "Easy cleaning without affecting sensitive surfaces"), d("حماية الشاشات والبيانو بلاك والكاربون فايبر من الخدوش", "Protects screens, piano black, and carbon fiber from scratches")] },
    { id: "tint-plus", cat: "tint", tier: "Plus", name: t.booking.svcTintPlus, p: sp("tint-plus", { small: 1380, large: 1580 }), pBefore: { small: 1600, large: 1800 }, w: "10yr", img: "", imgSmall: "/images/tint-full-small.png", imgLarge: "/images/tint-full-large.png", addonTier: "low", parts: [t.booking.allGlass], details: [d("عازل بتقنية النانو سيراميك المتطورة", "Advanced nano ceramic insulation technology"), d("العازل يشمل الزجاج الجانبي والخلفي فقط", "Covers side and rear windows only")], popular: true },
    { id: "tint-flex", cat: "tint", tier: "Flex", name: t.booking.svcTintFlex, p: sp("tint-flex", { small: 1180, large: 1380 }), pBefore: { small: 1300, large: 1500 }, w: "8yr", img: "", imgSmall: "/images/tint-full-small.png", imgLarge: "/images/tint-full-large.png", addonTier: "low", parts: [t.booking.allGlass], details: [...tintSideDesc] },
    { id: "tint-lite", cat: "tint", tier: "Lite", name: t.booking.svcTintLite, p: sp("tint-lite", { small: 900, large: 1080 }), pBefore: { small: 1000, large: 1200 }, w: "5yr", img: "", imgSmall: "/images/tint-full-small.png", imgLarge: "/images/tint-full-large.png", addonTier: "low", parts: [t.booking.allGlass], details: [...tintSideDesc] },
    { id: "tint-front-max", cat: "tint", tier: "Max", name: t.booking.svcTintFrontMax, p: sp("tint-front-max", { small: 780, large: 880 }), w: "10yr", img: "", imgSmall: "/images/tint-windshield-small.png", imgLarge: "/images/tint-windshield-large.png", addonTier: "high", parts: [t.booking.frontWindshield], details: [d("وضوح عالي", "High clarity"), d("قوة في العزل", "Strong insulation"), d("يدعم رؤية القيادة الليلية", "Supports night driving visibility"), d("يقلل من توهج حرارة الشمس", "Reduces sun heat glare"), d("يظهر باللون الأرجواني الفريد كزجاج سيارة رولزرويس", "Unique purple tint like Rolls-Royce windshield"), d("مدعوم بتقنية الرش المغناطيسي المزدوج", "Dual magnetic sputtering technology")] },
    { id: "tint-front-pro", cat: "tint", tier: "Pro", name: t.booking.svcTintFrontPro, p: sp("tint-front-pro", { small: 660, large: 760 }), w: "10yr", img: "", imgSmall: "/images/tint-windshield-small.png", imgLarge: "/images/tint-windshield-large.png", addonTier: "high", parts: [t.booking.frontWindshield], details: [d("وضوح عالي", "High clarity"), d("قوة في العزل", "Strong insulation"), d("يدعم رؤية القيادة الليلية", "Supports night driving visibility"), d("يقلل من توهج حرارة الشمس", "Reduces sun heat glare"), d("مدعوم بتقنية الرش المغناطيسي المزدوج", "Dual magnetic sputtering technology")] },
    { id: "tint-front-plus", cat: "tint", tier: "Plus", name: t.booking.svcTintFrontPlus, p: sp("tint-front-plus", { small: 375, large: 475 }), w: "10yr", img: "", imgSmall: "/images/tint-windshield-small.png", imgLarge: "/images/tint-windshield-large.png", addonTier: "high", parts: [t.booking.frontWindshield], details: [d("وضوح عالي", "High clarity"), d("عازل بتقنية النانو سيراميك المتطورة", "Advanced nano ceramic insulation")] },
    { id: "tint-front-flex", cat: "tint", tier: "Flex", name: t.booking.svcTintFrontFlex, p: sp("tint-front-flex", { small: 225, large: 325 }), w: "8yr", img: "", imgSmall: "/images/tint-windshield-small.png", imgLarge: "/images/tint-windshield-large.png", addonTier: "high", parts: [t.booking.frontWindshield], details: [d("وضوح عالي", "High clarity"), d("عازل حراري بتقنية النانو سيراميك", "Nano ceramic thermal insulation")] },
    { id: "tint-front-lite", cat: "tint", tier: "Lite", name: t.booking.svcTintFrontLite, p: sp("tint-front-lite", { small: 185, large: 285 }), w: "5yr", img: "", imgSmall: "/images/tint-windshield-small.png", imgLarge: "/images/tint-windshield-large.png", addonTier: "high", parts: [t.booking.frontWindshield], details: [d("وضوح عالي", "High clarity"), d("عازل حراري بتقنية النانو سيراميك", "Nano ceramic thermal insulation")] },
    { id: "ceramic-int-1", cat: "ceramic", name: t.booking.svcCeramicInt1, p: sp("ceramic-int-1", { small: 1880, large: 2180 }), pBefore: { small: 2350, large: 2750 }, w: "1yr", img: "", imgSmall: "/images/ceramic-int-small.png", imgLarge: "/images/ceramic-int-large.png", addonTier: "low", parts: [t.booking.interiorSurfaces], details: [d("سهولة التنظيف", "Easy to clean"), d("مقاومة تسرب المواد السائلة داخل المراتب", "Liquid spill resistance for seats")] },
    { id: "ceramic-ext-1", cat: "ceramic", name: t.booking.svcCeramicExt1, p: sp("ceramic-ext-1", { small: 1180, large: 1280 }), pBefore: { small: 1550, large: 1750 }, w: "1yr", img: "", imgSmall: "/images/ceramic-ext1-small.png", imgLarge: "/images/ceramic-ext1-large.png", addonTier: "high", parts: [t.booking.exteriorBody], details: [d("تلميع ساطع", "Brilliant shine"), d("4 طبقات خلال فترة الضمان", "4 layers during warranty period")] },
    { id: "ceramic-ext-3", cat: "ceramic", name: t.booking.svcCeramicExt3, p: sp("ceramic-ext-3", { small: 1480, large: 1780 }), pBefore: { small: 2550, large: 2750 }, w: "3yr", img: "", imgSmall: "/images/ceramic-ext3-small.png", imgLarge: "/images/ceramic-ext3-large.png", addonTier: "low", parts: [t.booking.exteriorBody], details: [d("تلميع ساطع", "Brilliant shine"), d("10 طبقات خلال فترة الضمان", "10 layers during warranty period")], popular: true },
    { id: "ceramic-ext-5", cat: "ceramic", name: t.booking.svcCeramicExt5, p: sp("ceramic-ext-5", { small: 1780, large: 1980 }), pBefore: { small: 2950, large: 3250 }, w: "5yr", img: "", imgSmall: "/images/ceramic-ext5-small.png", imgLarge: "/images/ceramic-ext5-large.png", addonTier: "low", parts: [t.booking.exteriorBody], details: [d("تلميع ساطع", "Brilliant shine"), d("12 طبقة خلال فترة الضمان", "12 layers during warranty period")] },
  ];

  const filteredSvcs = svcs.filter(s => s.cat === category);
  const detailSvc = detailId ? svcs.find(s => s.id === detailId) : null;
  const svcImg = (s: Svc) => {
    if (size === "large" && s.imgLarge) return s.imgLarge;
    if (size === "small" && s.imgSmall) return s.imgSmall;
    return s.img;
  };
  const hasCoverageImg = (s: Svc) => (size === "large" && !!s.imgLarge) || (size === "small" && !!s.imgSmall);
  const hasAnyImg = (s: Svc) => hasCoverageImg(s) || !!s.img;

  const getAddonPrice = (addon: Addon, tier: "low" | "high") => tier === "high" ? addon.p.large : addon.p.small;

  const svcTotal = sel.reduce((s, id) => { const v = svcs.find(x => x.id === id); return s + (v && size ? v.p[size] : 0); }, 0);
  const addonTotal = Object.entries(selAddons).reduce((s, [svcId, addonIds]) => {
    const svc = svcs.find(x => x.id === svcId);
    if (!svc) return s;
    return s + addonIds.reduce((a, aid) => { const addon = addons.find(x => x.id === aid); return a + (addon ? getAddonPrice(addon, svc.addonTier) : 0); }, 0);
  }, 0);

  const total = svcTotal + addonTotal;
  const totalBefore = sel.reduce((s, id) => { const v = svcs.find(x => x.id === id); return s + (v && size ? (v.pBefore ? v.pBefore[size] : v.p[size]) : 0); }, 0) + addonTotal;
  const totalSaved = totalBefore - total;

  // Animated total count
  useEffect(() => {
    if (displayTotal === total) return;
    const diff = total - displayTotal;
    const steps = 20;
    const inc = diff / steps;
    let current = displayTotal;
    let frame = 0;
    const timer = setInterval(() => {
      frame++;
      if (frame >= steps) {
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

  // Fetch unavailable dates for the date picker
  useEffect(() => {
    fetch("/api/availability")
      .then(r => r.json())
      .then(d => { if (d.unavailable) setUnavailableDates(d.unavailable); })
      .catch(() => {});
  }, []);

  // Fetch dynamic services from API
  useEffect(() => {
    fetch("/api/services").then(r => r.json()).then((d: ApiService[]) => { if (Array.isArray(d)) setApiServices(d); }).catch(() => {});
  }, []);

  // Auto-advance after car selection
  const handleCarSelect = (carId: "small" | "large") => {
    setSize(carId);
    setTimeout(() => scrollToSection(step2Ref), 600);
  };

  // Save booking to database
  const saveBooking = async (paymentMethod: "online" | "tabby" | "tamara" | "cash") => {
    if (submitting) return;
    setSubmitting(true);
    setBookingError("");
    try {
      const res = await fetch("/api/booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer_name: form.name,
          customer_phone: form.phone,
          customer_notes: form.notes || null,
          car_make: form.carMake,
          preferred_date: form.preferredDate,
          car_size: size,
          package_id: null,
          service_ids: sel,
          addon_ids: selAddons,
          subtotal: svcTotal + addonTotal,
          discount: 0,
          total,
          payment_method: paymentMethod,
          locale,
        }),
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => null);
        setBookingError(errData?.error || `Booking failed (${res.status})`);
        setSubmitting(false);
        return;
      }
      const data = await res.json();
      if (data.confirmation_number) {
        setConfirmationNumber(data.confirmation_number);
      }
      setOrderSent(true);
    } catch (e) {
      console.error("Failed to save booking:", e);
      setBookingError(isAr ? "حدث خطأ أثناء إرسال الحجز. حاول مرة أخرى." : "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const bnplBase: React.CSSProperties = {
    display: "flex", alignItems: "center", justifyContent: "space-between",
    width: "100%", padding: "16px 20px", borderRadius: 12,
    textDecoration: "none", transition: "all 0.3s", border: "none",
  };

  // Basic phone validation — accepts Saudi mobile formats
  const isValidPhone = (phone: string) => {
    const cleaned = phone.replace(/[\s\-()]/g, "");
    return /^(\+966|966|05|5)\d{8}$/.test(cleaned);
  };
  const formValid = form.name.trim().length >= 2 && isValidPhone(form.phone) && form.carMake.trim().length >= 2 && form.preferredDate.length > 0;
  const formMissing = !formValid ? [
    ...(form.name.trim().length < 2 ? [isAr ? "الاسم" : "Name"] : []),
    ...(!isValidPhone(form.phone) ? [isAr ? "رقم الجوال (مثال: 05xxxxxxxx)" : "Phone (e.g. 05xxxxxxxx)"] : []),
    ...(form.carMake.trim().length < 2 ? [isAr ? "نوع السيارة" : "Car Make"] : []),
    ...(form.preferredDate.length === 0 ? [isAr ? "التاريخ" : "Date"] : []),
  ] : [];

  const selCount = (cat: Category) => {
    return sel.filter(id => svcs.find(s => s.id === id)?.cat === cat).length;
  };

  // Determine which "step" is currently active based on scroll (simplified: use state)
  // For the step indicators, we derive from user progress
  const step1Done = !!size;
  const step2Done = sel.length > 0;

  return (
    <section id="booking" ref={(el) => { (ref as React.MutableRefObject<HTMLElement | null>).current = el; sectionRef.current = el; }} style={{ padding: "96px 0", position: "relative", overflow: "hidden" }}>
      {/* Epic background */}
      <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse 80% 50% at 50% 0%, rgba(246,190,0,0.06) 0%, transparent 60%), linear-gradient(180deg, #050505 0%, #0a0a0a 50%, #050505 100%)", pointerEvents: "none" }} />
      <div style={{ position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)", width: 600, height: 1, background: "linear-gradient(90deg, transparent, rgba(246,190,0,0.3), transparent)", pointerEvents: "none" }} />

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px", position: "relative" }}>
        <div className="reveal" style={{ textAlign: "center", maxWidth: 600, margin: "0 auto 48px" }}>
          <span className="section-badge">{t.booking.badge}</span>
          <h2 style={{ fontFamily: fontDisplay, fontSize: "clamp(32px, 6vw, 52px)", fontWeight: 800, marginBottom: 16, lineHeight: 1.1 }}>
            <span style={{ color: "#fff" }}>{t.booking.heading1}</span><span className="gold-text">{t.booking.heading2}</span>
          </h2>
          <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 17, lineHeight: 1.6 }}>{t.booking.subtitle}</p>
        </div>

        {/* Discount Badge — floating banner */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{
            display: "inline-flex", alignItems: "center", gap: 12,
            padding: "14px 32px", borderRadius: 16,
            background: "linear-gradient(135deg, rgba(246,190,0,0.12), rgba(246,190,0,0.04))",
            border: "1px solid rgba(246,190,0,0.3)",
            animation: "goldPulse 2s ease-in-out infinite",
            boxShadow: "0 0 24px rgba(246,190,0,0.1)",
          }}>
            <span style={{ fontSize: 24 }}>&#9770;</span>
            <div style={{ display: "flex", flexDirection: "column", alignItems: dir === "rtl" ? "flex-end" : "flex-start" }}>
              <span style={{ color: "#F6BE00", fontWeight: 800, fontSize: 18, fontFamily: fontDisplay }}>
                {isAr ? "خصم يصل إلى ٤٠٪" : "Up to 40% Off"}
              </span>
              <span style={{ color: "rgba(255,255,255,0.5)", fontSize: 12, fontWeight: 500 }}>
                {isAr ? "بمناسبة شهر رمضان الكريم" : "Ramadan Special Offer"}
              </span>
            </div>
            <span style={{ fontSize: 24 }}>&#9770;</span>
          </div>
        </div>

        {/* Steps — scroll-to anchors */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 48 }}>
          {[{ n: 1, l: t.booking.step1, ref: step1Ref, done: step1Done }, { n: 2, l: t.booking.step2, ref: step2Ref, done: step2Done }, { n: 3, l: t.booking.step3, ref: step3Ref, done: false }].map((s, i) => (
            <div key={s.n} style={{ display: "flex", alignItems: "center" }}>
              <button onClick={() => scrollToSection(s.ref)} style={{
                display: "flex", flexDirection: "column", alignItems: "center", background: "none", border: "none", padding: 0,
                cursor: "pointer",
              }}>
                <div style={{
                  width: 44, height: 44, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 15, fontWeight: 700, transition: "all 0.3s",
                  background: s.done || s.n === 1 ? "#F6BE00" : "rgba(255,255,255,0.04)", color: s.done || s.n === 1 ? "#000" : "rgba(255,255,255,0.3)",
                  border: s.done || s.n === 1 ? "none" : "1px solid rgba(255,255,255,0.1)",
                  boxShadow: s.done || s.n === 1 ? "0 0 20px rgba(246,190,0,0.25)" : "none",
                }}>
                  {s.done ? "\u2713" : s.n}
                </div>
                <span style={{ fontSize: 11, marginTop: 8, color: s.done || s.n === 1 ? "#F6BE00" : "rgba(255,255,255,0.25)", fontWeight: s.done || s.n === 1 ? 600 : 400 }}>{s.l}</span>
              </button>
              {i < 2 && <div style={{ width: 70, height: 2, margin: "0 12px", marginBottom: 22, background: s.done ? "linear-gradient(90deg, #F6BE00, rgba(246,190,0,0.3))" : "rgba(255,255,255,0.06)", borderRadius: 1 }} />}
            </div>
          ))}
        </div>

        {/* ==================== STEP 1 — Car Selection ==================== */}
        <div ref={step1Ref} style={{ scrollMarginTop: 100 }}>
          <p style={{ textAlign: "center", color: "rgba(255,255,255,0.45)", fontSize: 15, marginBottom: 40, fontWeight: 500 }}>{t.booking.step1instruction}</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 24, maxWidth: 760, margin: "0 auto" }}>
            {cars.map((c) => {
              const active = size === c.id;
              return (
              <button key={c.id} onClick={() => handleCarSelect(c.id)} className={active ? "gold-pulse" : "booking-car-card"} style={{
                position: "relative", borderRadius: 24, overflow: "hidden", textAlign: "center", cursor: "pointer", background: "#080808", padding: 0,
                border: active ? "2px solid #F6BE00" : "2px solid rgba(255,255,255,0.06)",
                boxShadow: active ? "0 0 40px rgba(246,190,0,0.25), inset 0 0 30px rgba(246,190,0,0.05)" : "0 4px 30px rgba(0,0,0,0.5)",
                transition: "all 0.5s cubic-bezier(0.4, 0, 0.2, 1)", transform: active ? "scale(1.03)" : "scale(1)",
              }}
                onMouseEnter={e => {
                  if (!active) { e.currentTarget.style.borderColor = "rgba(246,190,0,0.4)"; e.currentTarget.style.transform = "scale(1.02)"; e.currentTarget.style.boxShadow = "0 8px 40px rgba(246,190,0,0.15), 0 4px 30px rgba(0,0,0,0.5)"; }
                  const hover = e.currentTarget.querySelector("[data-hover]") as HTMLElement;
                  const active2 = e.currentTarget.querySelector("[data-active]") as HTMLElement;
                  if (hover) hover.style.opacity = "1";
                  if (active2) active2.style.opacity = "0";
                }}
                onMouseLeave={e => {
                  if (!active) { e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)"; e.currentTarget.style.transform = "scale(1)"; e.currentTarget.style.boxShadow = "0 4px 30px rgba(0,0,0,0.5)"; }
                  const hover = e.currentTarget.querySelector("[data-hover]") as HTMLElement;
                  const active2 = e.currentTarget.querySelector("[data-active]") as HTMLElement;
                  if (hover) hover.style.opacity = "0";
                  if (active2) active2.style.opacity = "1";
                }}
              >
                <div style={{ position: "relative", height: 320 }}>
                  <Image data-active="true" src={c.img} alt={c.label} fill className="object-cover" style={{ transition: "opacity 0.6s ease", objectPosition: "center 30%" }} />
                  <Image data-hover="true" src={c.imgHover} alt={c.label + " hover"} fill className="object-cover" style={{ transition: "opacity 0.6s ease", opacity: 0, objectPosition: "center 30%" }} />
                  {/* Cinematic gradient overlays */}
                  <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(5,5,5,0.9) 0%, rgba(5,5,5,0) 35%, rgba(5,5,5,0) 65%, rgba(5,5,5,0.85) 100%)" }} />
                  {active && <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(246,190,0,0.08), transparent 50%)", pointerEvents: "none" }} />}
                  {active && (
                    <div style={{ position: "absolute", top: 16, ...(dir === "rtl" ? { left: 16 } : { right: 16 }), width: 32, height: 32, borderRadius: "50%", background: "#F6BE00", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, color: "#000", fontWeight: 700, boxShadow: "0 4px 15px rgba(246,190,0,0.5)", animation: "fadeUp 0.3s ease-out" }}>&#10003;</div>
                  )}
                </div>
                {/* Text at top */}
                <div style={{ position: "absolute", top: 0, left: 0, right: 0, padding: "24px 20px" }}>
                  <div style={{ color: active ? "#F6BE00" : "#fff", fontWeight: 800, fontSize: 22, marginBottom: 6, fontFamily: fontDisplay, transition: "color 0.3s" }}>{c.label}</div>
                  <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 12, fontWeight: 500 }}>{c.ex}</div>
                </div>
                {/* Bottom gradient label */}
                <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, padding: "20px", textAlign: "center" }}>
                  <div style={{
                    display: "inline-flex", alignItems: "center", gap: 8, padding: "10px 24px", borderRadius: 100,
                    background: active ? "rgba(246,190,0,0.15)" : "rgba(255,255,255,0.06)",
                    border: `1px solid ${active ? "rgba(246,190,0,0.3)" : "rgba(255,255,255,0.08)"}`,
                    color: active ? "#F6BE00" : "rgba(255,255,255,0.5)",
                    fontSize: 13, fontWeight: 600, transition: "all 0.3s",
                  }}>
                    {active ? "\u2713" : ""} {active ? (isAr ? "تم الاختيار" : "Selected") : (isAr ? "اختر" : "Select")}
                  </div>
                </div>
              </button>
              );
            })}
          </div>
          {/* Continue button */}
          <div style={{ textAlign: "center", marginTop: 48 }}>
            <button onClick={() => size && scrollToSection(step2Ref)} disabled={!size} className="btn-gold" style={{
              opacity: size ? 1 : 0.3, transition: "all 0.4s", padding: "16px 48px", fontSize: 16, fontWeight: 700,
              boxShadow: size ? "0 0 30px rgba(246,190,0,0.2)" : "none",
            }}>{t.booking.chooseServices}</button>
          </div>
        </div>

        {/* ==================== STEP 2 — Services ==================== */}
        <div ref={step2Ref} style={{ marginTop: 80, scrollMarginTop: 80 }}>
          <p style={{ textAlign: "center", color: "rgba(255,255,255,0.4)", fontSize: 14, marginBottom: 24 }}>
            {t.booking.pricesFor} <strong style={{ color: "#F6BE00" }}>{cars.find(c => c.id === size)?.label || "—"}</strong> {t.booking.selectOneOrMore}
          </p>

          {/* Category Tabs */}
          <div role="tablist" aria-label={isAr ? "فئات الخدمات" : "Service categories"} className="booking-tabs-scroll" style={{
            display: "flex", gap: 8, justifyContent: "center", marginBottom: 32, flexWrap: "nowrap",
            overflowX: "auto", WebkitOverflowScrolling: "touch", paddingBottom: 4,
            scrollbarWidth: "none",
          }}>
            {categories.map((cat) => {
              const isActive = category === cat.id;
              const count = selCount(cat.id);
              return (
                <button key={cat.id} role="tab" aria-selected={isActive} onClick={() => setCategory(cat.id)} style={{
                  display: "flex", alignItems: "center", gap: 8, padding: "10px 20px", borderRadius: 100, cursor: "pointer",
                  fontSize: 13, fontWeight: 600, transition: "all 0.3s", whiteSpace: "nowrap", flexShrink: 0,
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

          {/* Service Cards — 3 column grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredSvcs.map((s) => {
              const isSelected = sel.includes(s.id);
              const svcAddons = selAddons[s.id] || [];
              const isDetailsOpen = detailsOpenId === s.id;
              return (
                <div key={s.id} style={{ display: "flex", flexDirection: "column" }}>
                  <button onClick={() => toggleSvc(s.id)} style={{
                    position: "relative",
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
                    <div style={{ position: "relative", height: hasCoverageImg(s) ? "auto" : 140, aspectRatio: hasCoverageImg(s) ? "1" : undefined, background: "#0a0a0a" }}>
                      {hasAnyImg(s) && <Image src={svcImg(s)} alt={s.name} fill className={hasCoverageImg(s) ? "object-contain" : "object-cover"} />}
                      <div style={{ position: "absolute", inset: 0, background: hasCoverageImg(s) ? "linear-gradient(to top, #111 0%, transparent 40%)" : "linear-gradient(to top, #111 0%, rgba(17,17,17,0.3) 50%, transparent 100%)" }} />
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
                      {/* Tier badge — top right with unique colors */}
                      {s.tier && (() => {
                        const tierColors: Record<string, { bg: string; color: string; shadow: string }> = {
                          SPRINT: { bg: "#2196F3", color: "#fff", shadow: "rgba(33,150,243,0.4)" },
                          TURBO: { bg: "#F44336", color: "#fff", shadow: "rgba(244,67,54,0.4)" },
                          Max: { bg: "#9C27B0", color: "#fff", shadow: "rgba(156,39,176,0.4)" },
                          Pro: { bg: "#FF5722", color: "#fff", shadow: "rgba(255,87,34,0.4)" },
                          Plus: { bg: "#4CAF50", color: "#fff", shadow: "rgba(76,175,80,0.4)" },
                          Flex: { bg: "#FF9800", color: "#000", shadow: "rgba(255,152,0,0.4)" },
                          Lite: { bg: "#607D8B", color: "#fff", shadow: "rgba(96,125,139,0.4)" },
                        };
                        const tc = tierColors[s.tier] || { bg: "#F6BE00", color: "#000", shadow: "rgba(246,190,0,0.4)" };
                        return (
                          <span style={{
                            position: "absolute", top: 10, ...(dir === "rtl" ? { left: 10 } : { right: 10 }),
                            padding: "4px 14px", fontSize: 11, fontWeight: 800, borderRadius: 8, zIndex: 3,
                            background: tc.bg, color: tc.color,
                            letterSpacing: "0.08em", textTransform: "uppercase",
                            boxShadow: `0 2px 10px ${tc.shadow}`,
                          }}>
                            {s.tier}
                          </span>
                        );
                      })()}
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
                        display: "flex", alignItems: "center", gap: 6,
                      }}>
                        {size && s.pBefore && <span style={{ textDecoration: "line-through", opacity: 0.5, fontSize: 11, color: "rgba(255,0,0,0.7)" }}>{s.pBefore[size].toLocaleString()}</span>}
                        {size ? s.p[size].toLocaleString() : "—"} {cur}
                      </span>
                      {/* Checkmark */}
                      {isSelected && (
                        <div style={{
                          position: "absolute", top: s.tier ? 38 : 10, ...(dir === "rtl" ? { left: 10 } : { right: 10 }),
                          width: 26, height: 26, borderRadius: "50%", background: "#F6BE00", zIndex: 4,
                          display: "flex", alignItems: "center", justifyContent: "center",
                        }}>
                          <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M3.5 7L5.75 9.25L10.5 4.5" stroke="#000" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                        </div>
                      )}
                      {/* Details overlay — shows on top of image when open */}
                      {isDetailsOpen && (
                        <div
                          onClick={(e) => { e.stopPropagation(); setDetailsOpenId(null); }}
                          style={{
                            position: "absolute", inset: 0, zIndex: 5,
                            background: "rgba(0,0,0,0.88)", backdropFilter: "blur(6px)",
                            display: "flex", flexDirection: "column", justifyContent: "center",
                            padding: 16, borderRadius: 14,
                            animation: "fadeUp 0.2s ease-out",
                          }}
                        >
                          <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                            {s.details.map((dt, di) => (
                              <li key={di} style={{
                                display: "flex", alignItems: "flex-start", gap: 8,
                                padding: "4px 0", fontSize: 12, color: "rgba(255,255,255,0.85)", lineHeight: 1.5,
                              }}>
                                <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ marginTop: 3, flexShrink: 0 }}><path d="M3.5 6L5.25 7.75L8.5 4.5" stroke="#F6BE00" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                                {dt}
                              </li>
                            ))}
                          </ul>
                          {s.parts.length > 1 && (
                            <div style={{ marginTop: 10, paddingTop: 10, borderTop: "1px solid rgba(255,255,255,0.1)" }}>
                              <div style={{ fontSize: 10, color: "#F6BE00", fontWeight: 700, marginBottom: 6, textTransform: isAr ? "none" : "uppercase" as const, letterSpacing: isAr ? "0" : "0.06em" }}>{t.booking.coverageAreas}</div>
                              <div style={{ display: "flex", flexWrap: "wrap", gap: 4 }}>
                                {s.parts.map(p => (
                                  <span key={p} style={{ padding: "2px 8px", fontSize: 10, borderRadius: 100, background: "rgba(246,190,0,0.1)", color: "rgba(255,255,255,0.7)", border: "1px solid rgba(246,190,0,0.2)" }}>{p}</span>
                                ))}
                              </div>
                            </div>
                          )}
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
                      {/* More Details button — yellow */}
                      <button
                        onClick={(e) => { e.stopPropagation(); setDetailsOpenId(isDetailsOpen ? null : s.id); }}
                        style={{
                          display: "inline-flex", alignItems: "center", gap: 6,
                          padding: "6px 16px", borderRadius: 100, cursor: "pointer",
                          background: "#F6BE00", border: "none", color: "#000",
                          fontSize: 11, fontWeight: 700, transition: "all 0.25s",
                        }}
                      >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/>
                        </svg>
                        {t.booking.moreDetails}
                      </button>
                      {isSelected && svcAddons.length > 0 && (
                        <div style={{ marginTop: 8, display: "flex", alignItems: "center", gap: 6 }}>
                          <span style={{ fontSize: 10, color: "rgba(246,190,0,0.7)" }}>{svcAddons.length} {t.booking.additionalServices.toLowerCase()}</span>
                        </div>
                      )}
                    </div>
                  </button>
                </div>
              );
            })}
          </div>

          {/* Detail panel — inline expanded below the service card */}
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
                  }}>&#10005;</button>
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
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 12 }}>
                    {addons.map(addon => {
                      const price = getAddonPrice(addon, s.addonTier);
                      const isChecked = svcAddons.includes(addon.id);
                      const hasImg = (size === "small" && addon.imgSmall) || (size === "large" && addon.imgLarge);
                      return (
                        <button key={addon.id}
                          onClick={(e) => { e.stopPropagation(); toggleAddon(s.id, addon.id); }}
                          style={{
                            display: "flex", flexDirection: "column", padding: 0, borderRadius: 14, cursor: "pointer", overflow: "hidden",
                            background: isChecked ? "rgba(246,190,0,0.06)" : "rgba(255,255,255,0.02)",
                            border: isChecked ? "2px solid rgba(246,190,0,0.4)" : "2px solid rgba(255,255,255,0.06)",
                            transition: "all 0.25s", textAlign: "center", position: "relative",
                          }}
                          onMouseEnter={e => { if (!isChecked) e.currentTarget.style.borderColor = "rgba(246,190,0,0.2)"; }}
                          onMouseLeave={e => { if (!isChecked) e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)"; }}
                        >
                          {isChecked && (
                            <div style={{ position: "absolute", top: 8, ...(dir === "rtl" ? { left: 8 } : { right: 8 }), width: 22, height: 22, borderRadius: "50%", background: "#F6BE00", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 2 }}>
                              <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M3 6L5 8L9 4" stroke="#000" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>
                            </div>
                          )}
                          <div style={{
                            width: "100%", aspectRatio: "1", position: "relative",
                            background: "#0a0a0a",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            color: isChecked ? "#F6BE00" : "rgba(255,255,255,0.3)",
                          }}>
                            {hasImg ? (
                              <Image src={size === "large" ? addon.imgLarge! : addon.imgSmall!} alt={addon.name} fill className="object-cover" />
                            ) : (
                              <div style={{ transform: "scale(1.8)" }}>{addon.icon}</div>
                            )}
                          </div>
                          <div style={{ padding: "10px 8px", background: "#111", width: "100%" }}>
                            <span style={{ color: isChecked ? "#fff" : "rgba(255,255,255,0.5)", fontSize: 11, lineHeight: 1.3, display: "block", marginBottom: 4 }}>{addon.name}</span>
                            <span style={{ color: "#F6BE00", fontSize: 13, fontWeight: 700 }}>{price} {cur}</span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })()}

          {/* Sticky floating total bar */}
          <div style={{
            position: "sticky", bottom: 16, zIndex: 20, marginTop: 24,
            padding: "16px 24px", borderRadius: 16,
            background: "rgba(17,17,17,0.95)", backdropFilter: "blur(12px)",
            border: sel.length > 0 ? "1px solid rgba(246,190,0,0.25)" : "1px solid rgba(255,255,255,0.08)",
            boxShadow: "0 -4px 24px rgba(0,0,0,0.5)",
            display: "flex", justifyContent: "space-between", alignItems: "center",
            transition: "all 0.3s",
          }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
                <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 12 }}>{t.booking.estimatedTotal}</span>
                {/* Car type tag */}
                {size && <span style={{
                  padding: "2px 8px", borderRadius: 100, fontSize: 10, fontWeight: 600,
                  background: "rgba(246,190,0,0.1)", color: "#F6BE00", border: "1px solid rgba(246,190,0,0.2)",
                }}>{cars.find(c => c.id === size)?.label}</span>}
              </div>
              <div className="gold-text" style={{ fontFamily: fontDisplay, fontSize: 24, fontWeight: 700, transition: "all 0.3s" }}>{displayTotal.toLocaleString()} {cur}</div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <span style={{ color: "rgba(255,255,255,0.25)", fontSize: 13 }}>{sel.length} {sel.length > 1 ? t.booking.servicesCount : t.booking.serviceCount}</span>
              <button onClick={() => sel.length > 0 && scrollToSection(step3Ref)} className="btn-gold" style={{ margin: 0, padding: "10px 28px", opacity: sel.length > 0 ? 1 : 0.3, pointerEvents: sel.length > 0 ? "auto" : "none", transition: "opacity 0.3s" }}>{t.booking.continue}</button>
            </div>
          </div>
        </div>

        {/* ==================== STEP 3 — Confirm & Book ==================== */}
        <div ref={step3Ref} style={{ marginTop: 80, scrollMarginTop: 80, maxWidth: 600, margin: "80px auto 0" }}>
          {/* Vehicle header */}
          {size && (
            <div style={{ borderRadius: 14, background: "#111", border: "1px solid rgba(255,255,255,0.08)", overflow: "hidden", marginBottom: 20 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 14, padding: 16 }}>
                <div style={{ position: "relative", width: 56, height: 56, borderRadius: 12, overflow: "hidden", flexShrink: 0, background: "#0a0a0a" }}>
                  <Image src={cars.find(c => c.id === size)?.img || ""} alt="" fill className="object-cover" />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ color: "rgba(255,255,255,0.35)", fontSize: 10, textTransform: isAr ? "none" : "uppercase" as const, letterSpacing: isAr ? "0" : "0.08em" }}>{t.booking.vehicleLabel}</div>
                  <div style={{ color: "#fff", fontWeight: 700, fontSize: 15, marginTop: 2 }}>{cars.find(c => c.id === size)?.label}</div>
                </div>
                <button onClick={() => scrollToSection(step1Ref)} style={{ color: "#F6BE00", fontSize: 12, background: "none", cursor: "pointer", padding: "6px 12px", borderRadius: 8, border: "1px solid rgba(246,190,0,0.2)" }}>{t.booking.change}</button>
              </div>
            </div>
          )}

          {/* Selected services — visual cards */}
          {sel.length > 0 && (
            <>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <span style={{ color: "rgba(255,255,255,0.35)", fontSize: 11, textTransform: isAr ? "none" : "uppercase" as const, letterSpacing: isAr ? "0" : "0.08em" }}>{t.booking.servicesLabel}</span>
                <button onClick={() => scrollToSection(step2Ref)} style={{ color: "#F6BE00", fontSize: 12, background: "none", cursor: "pointer", padding: "6px 12px", borderRadius: 8, border: "1px solid rgba(246,190,0,0.2)" }}>{t.booking.change}</button>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 16 }}>
                {sel.map(id => {
                  const s = svcs.find(x => x.id === id)!;
                  const svcAddonList = selAddons[id] || [];
                  return (
                    <div key={id} style={{
                      borderRadius: 14, background: "#111", border: "1px solid rgba(255,255,255,0.08)", overflow: "hidden",
                    }}>
                      <div style={{ display: "flex", alignItems: "stretch" }}>
                        {/* Service image */}
                        <div style={{ position: "relative", width: 90, minHeight: 80, flexShrink: 0, background: "#0a0a0a" }}>
                          {hasAnyImg(s) && <Image src={svcImg(s)} alt={s.name} fill className={hasCoverageImg(s) ? "object-contain" : "object-cover"} />}
                          <div style={{ position: "absolute", inset: 0, background: dir === "rtl" ? "linear-gradient(to left, transparent 60%, #111 100%)" : "linear-gradient(to right, transparent 60%, #111 100%)" }} />
                        </div>
                        {/* Service info */}
                        <div style={{ flex: 1, padding: "12px 14px", display: "flex", flexDirection: "column", justifyContent: "center" }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
                            <div>
                              <div style={{ color: "#fff", fontWeight: 700, fontSize: 13, marginBottom: 3 }}>{s.name}</div>
                              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                <span style={{
                                  padding: "2px 8px", fontSize: 9, fontWeight: 700, borderRadius: 100,
                                  background: "rgba(246,190,0,0.1)", color: "#F6BE00", border: "1px solid rgba(246,190,0,0.2)",
                                  textTransform: isAr ? "none" : "uppercase" as const, letterSpacing: isAr ? "0" : "0.04em",
                                }}>{categories.find(c => c.id === s.cat)?.label}</span>
                                <span style={{ fontSize: 10, color: "rgba(246,190,0,0.6)", border: "1px solid rgba(246,190,0,0.15)", padding: "1px 6px", borderRadius: 100 }}>{s.w}</span>
                              </div>
                            </div>
                            <div style={{ display: "flex", flexDirection: "column", alignItems: dir === "rtl" ? "flex-start" : "flex-end", whiteSpace: "nowrap" }}>
                              {size && s.pBefore && <span style={{ color: "rgba(255,80,80,0.6)", fontSize: 11, textDecoration: "line-through" }}>{s.pBefore[size].toLocaleString()} {cur}</span>}
                              <span style={{ color: "#F6BE00", fontWeight: 700, fontSize: 14 }}>{size ? s.p[size].toLocaleString() : 0} {cur}</span>
                            </div>
                          </div>
                          {/* Add-ons under service */}
                          {svcAddonList.length > 0 && (
                            <div style={{ marginTop: 8, paddingTop: 8, borderTop: "1px solid rgba(255,255,255,0.04)" }}>
                              {svcAddonList.map(aid => {
                                const addon = addons.find(a => a.id === aid)!;
                                const price = getAddonPrice(addon, s.addonTier);
                                return (
                                  <div key={aid} style={{ display: "flex", justifyContent: "space-between", padding: "2px 0", fontSize: 11 }}>
                                    <span style={{ color: "rgba(255,255,255,0.35)" }}>+ {addon.name}</span>
                                    <span style={{ color: "rgba(246,190,0,0.5)" }}>{price} {cur}</span>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Additional services summary */}
              {(() => {
                const allAddons = Object.entries(selAddons).flatMap(([svcId, addonIds]) => {
                  const svc = svcs.find(x => x.id === svcId);
                  if (!svc) return [];
                  return addonIds.map(aid => {
                    const addon = addons.find(a => a.id === aid);
                    if (!addon) return null;
                    return { addon, price: getAddonPrice(addon, svc.addonTier) };
                  }).filter(Boolean) as { addon: typeof addons[0]; price: number }[];
                });
                if (allAddons.length === 0) return null;
                return (
                  <div style={{
                    borderRadius: 14, background: "#111", border: "1px solid rgba(246,190,0,0.12)",
                    padding: "14px 18px", marginBottom: 16,
                  }}>
                    <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", textTransform: isAr ? "none" : "uppercase" as const, letterSpacing: isAr ? "0" : "0.08em", marginBottom: 10 }}>
                      {t.booking.additionalServices}
                    </div>
                    {allAddons.map(({ addon, price }) => (
                      <div key={addon.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "6px 0", borderBottom: "1px solid rgba(255,255,255,0.03)" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <div style={{ width: 28, height: 28, borderRadius: 8, background: "rgba(246,190,0,0.08)", color: "#F6BE00", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                            {addon.icon}
                          </div>
                          <span style={{ color: "rgba(255,255,255,0.6)", fontSize: 13 }}>{addon.name}</span>
                        </div>
                        <span style={{ color: "#F6BE00", fontWeight: 600, fontSize: 13 }}>{price.toLocaleString()} {cur}</span>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </>
          )}

          {/* Total bar */}
          <div style={{
            borderRadius: 14, overflow: "hidden", marginBottom: 32,
            background: "#111", border: "1px solid rgba(246,190,0,0.15)",
          }}>
            {totalSaved > 0 && (
              <div style={{ padding: "10px 20px", borderBottom: "1px solid rgba(255,255,255,0.05)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ color: "#4CAF50", fontSize: 13, fontWeight: 600 }}>{isAr ? "وفّرت" : "You saved"}</span>
                <span style={{ color: "#4CAF50", fontSize: 14, fontWeight: 700 }}>{totalSaved.toLocaleString()} {cur}</span>
              </div>
            )}
            <div style={{ padding: "16px 20px", background: "rgba(246,190,0,0.04)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ color: "#fff", fontWeight: 700, fontSize: 16 }}>{t.booking.totalLabel}</span>
              <span className="gold-text" style={{ fontFamily: fontDisplay, fontSize: 24, fontWeight: 700 }}>{displayTotal.toLocaleString()} {cur}</span>
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column" as const, gap: 14, marginBottom: 32 }}>
            <input id="booking-name" type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})}
              placeholder={t.booking.namePh} aria-label={t.booking.namePh} autoComplete="name"
              onFocus={e => { e.currentTarget.style.borderColor = "#F6BE00"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(246,190,0,0.1)"; }}
              onBlur={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"; e.currentTarget.style.boxShadow = "none"; }}
              style={{ width: "100%", padding: "14px 18px", borderRadius: 12, background: "#111", border: "1px solid rgba(255,255,255,0.08)", color: "#fff", fontSize: 15, outline: "none", transition: "border-color 0.2s, box-shadow 0.2s" }} />
            <div>
              <input id="booking-phone" type="tel" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})}
                placeholder={isAr ? "05xxxxxxxx :رقم الجوال" : "Phone: 05xxxxxxxx"} aria-label={t.booking.phonePh} autoComplete="tel" dir="ltr"
                onFocus={e => { e.currentTarget.style.borderColor = "#F6BE00"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(246,190,0,0.1)"; }}
                onBlur={e => { e.currentTarget.style.borderColor = form.phone && !isValidPhone(form.phone) ? "#f44336" : "rgba(255,255,255,0.08)"; e.currentTarget.style.boxShadow = "none"; }}
                style={{ width: "100%", padding: "14px 18px", borderRadius: 12, background: "#111", border: `1px solid ${form.phone && !isValidPhone(form.phone) ? "rgba(244,67,54,0.5)" : "rgba(255,255,255,0.08)"}`, color: "#fff", fontSize: 15, outline: "none", transition: "border-color 0.2s, box-shadow 0.2s", textAlign: "left" as const }} />
              {form.phone && !isValidPhone(form.phone) && (
                <p style={{ fontSize: 11, color: "#f44336", marginTop: 4 }}>
                  {isAr ? "صيغة مقبولة: 05xxxxxxxx أو +966xxxxxxxxx" : "Accepted: 05xxxxxxxx or +966xxxxxxxxx"}
                </p>
              )}
            </div>
            <input id="booking-carMake" type="text" value={form.carMake} onChange={e => setForm({...form, carMake: e.target.value})}
              placeholder={t.booking.carMakePh} aria-label={t.booking.carMakePh}
              onFocus={e => { e.currentTarget.style.borderColor = "#F6BE00"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(246,190,0,0.1)"; }}
              onBlur={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"; e.currentTarget.style.boxShadow = "none"; }}
              style={{ width: "100%", padding: "14px 18px", borderRadius: 12, background: "#111", border: "1px solid rgba(255,255,255,0.08)", color: "#fff", fontSize: 15, outline: "none", transition: "border-color 0.2s, box-shadow 0.2s" }} />
            {/* Preferred date picker */}
            <div>
              <label style={{ display: "block", color: "rgba(255,255,255,0.5)", fontSize: 12, marginBottom: 6 }}>{t.booking.preferredDateLabel}</label>
              <input type="date" id="booking-date" aria-label={t.booking.preferredDateLabel} value={form.preferredDate}
                min={new Date().toISOString().slice(0, 10)}
                onChange={e => {
                  const val = e.target.value;
                  if (unavailableDates.includes(val)) return;
                  setForm({...form, preferredDate: val});
                }}
                onFocus={e => { e.currentTarget.style.borderColor = "#F6BE00"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(246,190,0,0.1)"; }}
                onBlur={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"; e.currentTarget.style.boxShadow = "none"; }}
                style={{ width: "100%", padding: "14px 18px", borderRadius: 12, background: "#111", border: "1px solid rgba(255,255,255,0.08)", color: form.preferredDate ? "#fff" : "rgba(255,255,255,0.35)", fontSize: 15, outline: "none", transition: "border-color 0.2s, box-shadow 0.2s", colorScheme: "dark" }} />
              {unavailableDates.length > 0 && (
                <p style={{ fontSize: 11, color: "rgba(255,255,255,0.25)", marginTop: 4 }}>
                  {isAr ? "بعض التواريخ محجوزة بالكامل" : "Some dates are fully booked"}
                </p>
              )}
            </div>
            <textarea id="booking-notes" aria-label={t.booking.notesPh} value={form.notes} onChange={e => setForm({...form, notes: e.target.value})}
              placeholder={t.booking.notesPh} rows={3}
              onFocus={e => { e.currentTarget.style.borderColor = "#F6BE00"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(246,190,0,0.1)"; }}
              onBlur={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"; e.currentTarget.style.boxShadow = "none"; }}
              style={{ width: "100%", padding: "14px 18px", borderRadius: 12, background: "#111", border: "1px solid rgba(255,255,255,0.08)", color: "#fff", fontSize: 15, outline: "none", resize: "none" as const, transition: "border-color 0.2s, box-shadow 0.2s" }} />
          </div>

          <div style={{ marginBottom: 24 }}>
            <div style={{ color: "rgba(255,255,255,0.35)", fontSize: 12, textTransform: isAr ? "none" : "uppercase" as const, letterSpacing: isAr ? "0" : "0.08em", marginBottom: 16 }}>{t.booking.paymentMethod}</div>

            {/* Missing fields hint */}
            {formMissing.length > 0 && (
              <div style={{
                marginBottom: 14, padding: "10px 16px", borderRadius: 12,
                background: "rgba(246,190,0,0.06)", border: "1px solid rgba(246,190,0,0.15)",
                color: "rgba(246,190,0,0.8)", fontSize: 12, lineHeight: 1.5,
                display: "flex", alignItems: "center", gap: 8,
              }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                <span>{isAr ? "يرجى إكمال:" : "Please complete:"} {formMissing.join(", ")}</span>
              </div>
            )}

            {/* Error banner */}
            {bookingError && (
              <div style={{
                marginBottom: 14, padding: "12px 16px", borderRadius: 12,
                background: "rgba(244,67,54,0.1)", border: "1px solid rgba(244,67,54,0.3)",
                color: "#f44336", fontSize: 13, lineHeight: 1.5,
                display: "flex", alignItems: "center", gap: 10,
              }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
                <span>{bookingError}</span>
              </div>
            )}

            <div style={{ display: "flex", flexDirection: "column" as const, gap: 10 }}>
              {/* Pay at Shop — primary CTA */}
              <button
                onClick={() => { saveBooking("cash"); }}
                disabled={!formValid || submitting}
                style={{
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
                  width: "100%", padding: "16px 20px", borderRadius: 12, cursor: "pointer",
                  background: (!formValid || submitting) ? "rgba(246,190,0,0.3)" : "#F6BE00",
                  border: "none", color: "#000", fontSize: 15, fontWeight: 700,
                  transition: "all 0.3s",
                  opacity: (!formValid || submitting) ? 0.4 : 1,
                }}
              >
                <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
                </svg>
                {submitting && <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" style={{ animation: "spin 1s linear infinite" }}><path d="M12 2a10 10 0 0 1 10 10" /></svg>}
                {submitting ? (isAr ? "جاري المعالجة..." : "Processing...") : (isAr ? `احجز وادفع في المحل — ${displayTotal.toLocaleString()} ${cur}` : `Book & Pay at Shop — ${displayTotal.toLocaleString()} ${cur}`)}
              </button>

              <div style={{ display: "flex", alignItems: "center", gap: 14, margin: "6px 0" }}>
                <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.08)" }} />
                <span style={{ color: "rgba(255,255,255,0.2)", fontSize: 11 }}>{isAr ? "أو قسّط" : "or split payments"}</span>
                <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.08)" }} />
              </div>

              {/* Tabby */}
              <button
                onClick={() => { saveBooking("tabby"); }}
                disabled={!formValid || submitting}
                style={(!formValid || submitting) ? { ...bnplBase, background: "#003227", opacity: 0.3, cursor: "not-allowed" } : { ...bnplBase, background: "#003227", cursor: "pointer" }}>
                <span><svg width="60" height="20" viewBox="0 0 60 20" fill="none"><text x="0" y="16" fontFamily="system-ui, sans-serif" fontWeight="800" fontSize="18" letterSpacing="-0.5" fill="#3bff9d">tabby</text></svg></span>
                <span style={{ display: "flex", flexDirection: "column" as const, alignItems: dir === "rtl" ? "flex-start" : "flex-end" }}>
                  {submitting ? <span style={{ color: "#fff", fontSize: 13, fontWeight: 700 }}>{isAr ? "جاري المعالجة..." : "Processing..."}</span> : <>
                  <span style={{ color: "#fff", fontSize: 13, fontWeight: 700 }}>{Math.ceil(total / 4).toLocaleString()} {cur}<span style={{ fontWeight: 400, opacity: 0.6 }}>{t.booking.perMonth}</span></span>
                  <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 11 }}>{t.booking.splitIn4}</span>
                  </>}
                </span>
              </button>

              {/* Tamara */}
              <button
                onClick={() => { saveBooking("tamara"); }}
                disabled={!formValid || submitting}
                style={(!formValid || submitting) ? { ...bnplBase, background: "#250155", opacity: 0.3, cursor: "not-allowed" } : { ...bnplBase, background: "#250155", cursor: "pointer" }}>
                <span><svg width="72" height="20" viewBox="0 0 72 20" fill="none"><text x="0" y="16" fontFamily="system-ui, sans-serif" fontWeight="800" fontSize="18" letterSpacing="-0.5" fill="#c77dff">tamara</text></svg></span>
                <span style={{ display: "flex", flexDirection: "column" as const, alignItems: dir === "rtl" ? "flex-start" : "flex-end" }}>
                  {submitting ? <span style={{ color: "#fff", fontSize: 13, fontWeight: 700 }}>{isAr ? "جاري المعالجة..." : "Processing..."}</span> : <>
                  <span style={{ color: "#fff", fontSize: 13, fontWeight: 700 }}>{Math.ceil(total / 3).toLocaleString()} {cur}<span style={{ fontWeight: 400, opacity: 0.6 }}>{t.booking.perMonth}</span></span>
                  <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 11 }}>{t.booking.splitIn3}</span>
                  </>}
                </span>
              </button>
            </div>
          </div>

          {/* Success overlay with confetti */}
          {orderSent && (
            <div style={{
              position: "fixed", inset: 0, zIndex: 100,
              background: "rgba(5,5,5,0.92)", backdropFilter: "blur(12px)",
              display: "flex", alignItems: "center", justifyContent: "center",
              animation: "fadeUp 0.4s ease-out",
              overflowY: "auto",
            }}>
              {/* Confetti particles */}
              {Array.from({ length: 40 }).map((_, i) => (
                <div key={i} className="confetti-piece" style={{
                  left: `${Math.random() * 100}%`,
                  width: `${6 + Math.random() * 8}px`,
                  height: `${6 + Math.random() * 8}px`,
                  background: ["#F6BE00", "#FFD54F", "#D4A300", "#fff", "#F6BE00", "#8B6914"][i % 6],
                  borderRadius: i % 3 === 0 ? "50%" : i % 3 === 1 ? "2px" : "0",
                  animationDelay: `${Math.random() * 1.5}s`,
                  animationDuration: `${2 + Math.random() * 2}s`,
                  opacity: 0.9,
                }} />
              ))}

              <div style={{ textAlign: "center", maxWidth: 440, padding: "40px 24px", position: "relative" }}>
                {/* Animated check with pulse ring */}
                <div style={{ position: "relative", width: 90, height: 90, margin: "0 auto 28px" }}>
                  <div style={{
                    position: "absolute", inset: 0, borderRadius: "50%",
                    border: "2px solid rgba(246,190,0,0.3)",
                    animation: "successRing 1.5s ease-out 0.3s both",
                  }} />
                  <div style={{
                    position: "absolute", inset: 0, borderRadius: "50%",
                    border: "2px solid rgba(246,190,0,0.2)",
                    animation: "successRing 1.5s ease-out 0.6s both",
                  }} />
                  <div style={{
                    width: 90, height: 90, borderRadius: "50%",
                    background: "linear-gradient(135deg, #F6BE00, #D4A300)",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    animation: "confettiPop 0.5s ease-out 0.1s both",
                    boxShadow: "0 0 40px rgba(246,190,0,0.4), 0 0 80px rgba(246,190,0,0.15)",
                  }}>
                    <svg width="42" height="42" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M5 12l5 5L20 7" style={{ strokeDasharray: 24, animation: "checkDraw 0.6s ease-out 0.4s both" }} />
                    </svg>
                  </div>
                </div>

                <h3 style={{ fontFamily: fontDisplay, fontSize: 30, fontWeight: 700, color: "#F6BE00", marginBottom: 8, animation: "fadeUp 0.5s ease-out 0.2s both" }}>
                  {isAr ? "تم تأكيد الحجز!" : "Booking Confirmed!"}
                </h3>
                <p style={{ color: "rgba(255,255,255,0.45)", fontSize: 14, marginBottom: 24, animation: "fadeUp 0.5s ease-out 0.25s both" }}>
                  {t.booking.orderSentSub}
                </p>

                {/* Confirmation number */}
                {confirmationNumber && (
                  <div style={{ animation: "fadeUp 0.5s ease-out 0.3s both", marginBottom: 24 }}>
                    <div style={{
                      fontFamily: fontDisplay, fontSize: 28, fontWeight: 700, color: "#F6BE00",
                      letterSpacing: "0.08em", padding: "14px 28px", borderRadius: 14,
                      background: "linear-gradient(135deg, rgba(246,190,0,0.1), rgba(246,190,0,0.04))",
                      border: "1px solid rgba(246,190,0,0.25)",
                      display: "inline-block",
                      boxShadow: "0 4px 20px rgba(246,190,0,0.1)",
                    }}>
                      #{confirmationNumber}
                    </div>
                    <p style={{ color: "rgba(255,255,255,0.3)", fontSize: 11, marginTop: 8, letterSpacing: "0.03em" }}>
                      {isAr ? "احفظ هذا الرقم للمراجعة" : "Save this number for reference"}
                    </p>
                  </div>
                )}

                {/* Booking summary receipt */}
                <div style={{
                  animation: "fadeUp 0.5s ease-out 0.35s both",
                  background: "rgba(255,255,255,0.03)", borderRadius: 16,
                  border: "1px solid rgba(255,255,255,0.06)",
                  padding: "20px", textAlign: dir === "rtl" ? "right" : "left",
                  marginBottom: 24,
                }}>
                  <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 14, textAlign: "center" }}>
                    {isAr ? "ملخص الحجز" : "Booking Summary"}
                  </div>

                  {/* Vehicle */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                    <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 12 }}>{isAr ? "نوع السيارة" : "Vehicle"}</span>
                    <span style={{ color: "#fff", fontSize: 13, fontWeight: 600 }}>{cars.find(c => c.id === size)?.label}</span>
                  </div>

                  {/* Customer */}
                  {form.name && (
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                      <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 12 }}>{isAr ? "العميل" : "Customer"}</span>
                      <span style={{ color: "#fff", fontSize: 13, fontWeight: 600 }}>{form.name}</span>
                    </div>
                  )}

                  {/* Car details */}
                  {form.carMake && (
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                      <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 12 }}>{isAr ? "السيارة" : "Car"}</span>
                      <span style={{ color: "#fff", fontSize: 13, fontWeight: 600 }}>{form.carMake}</span>
                    </div>
                  )}

                  {/* Services */}
                  <div style={{ padding: "10px 0", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                    <span style={{ color: "rgba(255,255,255,0.4)", fontSize: 12, display: "block", marginBottom: 6 }}>
                      {isAr ? "الخدمات" : "Services"} ({sel.length})
                    </span>
                    {sel.map(id => {
                      const s = svcs.find(x => x.id === id);
                      return s ? (
                        <div key={id} style={{ display: "flex", justifyContent: "space-between", padding: "3px 0" }}>
                          <span style={{ color: "rgba(255,255,255,0.6)", fontSize: 12 }}>{s.name}</span>
                          <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                            {size && s.pBefore && <span style={{ color: "rgba(255,80,80,0.5)", fontSize: 11, textDecoration: "line-through" }}>{s.pBefore[size].toLocaleString()}</span>}
                            <span style={{ color: "rgba(246,190,0,0.7)", fontSize: 12 }}>{size ? s.p[size].toLocaleString() : 0} {cur}</span>
                          </span>
                        </div>
                      ) : null;
                    })}
                  </div>

                  {/* Savings */}
                  {totalSaved > 0 && (
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                      <span style={{ display: "flex", alignItems: "center", gap: 6, color: "#4CAF50", fontSize: 12, fontWeight: 600 }}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>
                        {isAr ? "وفّرت" : "You saved"}
                      </span>
                      <span style={{ color: "#4CAF50", fontSize: 14, fontWeight: 700 }}>{totalSaved.toLocaleString()} {cur}</span>
                    </div>
                  )}
                  {/* Total */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 0 4px" }}>
                    <span style={{ color: "#fff", fontSize: 14, fontWeight: 700 }}>{isAr ? "الإجمالي" : "Total"}</span>
                    <span className="gold-text" style={{ fontFamily: fontDisplay, fontSize: 20, fontWeight: 700 }}>{total.toLocaleString()} {cur}</span>
                  </div>
                </div>

                {/* Preferred date */}
                {form.preferredDate && (
                  <div style={{ animation: "fadeUp 0.5s ease-out 0.38s both", marginBottom: 20 }}>
                    <div style={{
                      display: "inline-flex", alignItems: "center", gap: 8,
                      padding: "8px 18px", borderRadius: 10,
                      background: "rgba(246,190,0,0.06)", border: "1px solid rgba(246,190,0,0.15)",
                      color: "rgba(255,255,255,0.5)", fontSize: 13,
                    }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#F6BE00" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
                      {form.preferredDate}
                    </div>
                  </div>
                )}

                <button onClick={() => { setOrderSent(false); setConfirmationNumber(""); setBookingError(""); setSel([]); setSelAddons({}); setForm({ name: "", phone: "", notes: "", carMake: "", preferredDate: "" }); setSize(null); scrollToSection(step1Ref); }} className="btn-gold" style={{ marginTop: 8, animation: "fadeUp 0.5s ease-out 0.4s both", padding: "14px 40px" }}>
                  {isAr ? "حجز جديد" : "New Booking"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
