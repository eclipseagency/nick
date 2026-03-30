"use client";

import { useLanguage } from "@/i18n/LanguageContext";

export default function Marquee() {
  const { locale } = useLanguage();
  const isAr = locale === "ar";

  const items = isAr
    ? ["★  +٢٧ سنة تميّز", "★  +١٠ آلاف سيارة محمية", "★  ضمان حتى ١٠ سنوات", "★  وكيل حصري معتمد", "★  صنع لأجواء السعودية", "★  قص الكتروني دقيق"]
    : ["★  27+ YEARS OF EXCELLENCE", "★  10,000+ CARS PROTECTED", "★  UP TO 10 YEAR WARRANTY", "★  CERTIFIED EXCLUSIVE AGENT", "★  MADE FOR SAUDI ARABIA", "★  PRECISION ELECTRONIC CUT"];

  // Double items for seamless loop
  const doubled = [...items, ...items];

  return (
    <div style={{
      padding: "14px 0",
      background: "linear-gradient(90deg, #F6BE00 0%, #FFD54F 50%, #F6BE00 100%)",
      overflow: "hidden",
      whiteSpace: "nowrap",
      position: "relative",
    }}>
      <div style={{
        display: "flex",
        animation: isAr ? "marqueeRtl 40s linear infinite" : "marquee 40s linear infinite",
        gap: 0,
        width: "max-content",
      }}>
        {doubled.map((item, i) => (
          <span key={i} style={{
            color: "#000",
            fontSize: 12,
            fontWeight: 800,
            letterSpacing: isAr ? "0.02em" : "0.15em",
            flexShrink: 0,
            padding: "0 24px",
            fontFamily: isAr ? "var(--font-ar)" : "var(--font-display)",
          }}>
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}
