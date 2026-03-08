"use client";

import { useState } from "react";
import { useReveal } from "@/hooks/useReveal";
import { useLanguage } from "@/i18n/LanguageContext";

export default function FAQ() {
  const { t, locale } = useLanguage();
  const ref = useReveal([locale]);
  const isAr = locale === "ar";
  const fontDisplay = isAr ? "var(--font-ar)" : "var(--font-display)";
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const items = [
    { q: t.faq.q1, a: t.faq.a1 },
    { q: t.faq.q2, a: t.faq.a2 },
    { q: t.faq.q3, a: t.faq.a3 },
    { q: t.faq.q4, a: t.faq.a4 },
    { q: t.faq.q5, a: t.faq.a5 },
    { q: t.faq.q6, a: t.faq.a6 },
  ];

  const toggle = (i: number) => {
    setOpenIndex(openIndex === i ? null : i);
  };

  return (
    <section ref={ref} id="faq" style={{ padding: "96px 0", background: "#050505" }}>
      <div style={{ maxWidth: 800, margin: "0 auto", padding: "0 24px" }}>
        <div className="reveal" style={{ textAlign: "center", marginBottom: 48 }}>
          <span className="section-badge">{t.faq.badge}</span>
          <h2
            style={{
              fontFamily: fontDisplay,
              fontSize: "clamp(28px, 5vw, 44px)",
              fontWeight: 700,
              lineHeight: 1.15,
              marginBottom: 20,
            }}
          >
            <span style={{ color: "#fff" }}>{t.faq.heading1}</span>
            <span className="gold-text">{t.faq.heading2}</span>
          </h2>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {items.map((item, i) => {
            const isOpen = openIndex === i;
            return (
              <div
                key={i}
                className={`card reveal reveal-delay-${Math.min(i + 1, 4)}`}
                style={{
                  borderColor: isOpen ? "rgba(246,190,0,0.3)" : undefined,
                  transition: "border-color 0.3s",
                }}
              >
                <button
                  onClick={() => toggle(i)}
                  style={{
                    width: "100%",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: 16,
                    padding: "20px 24px",
                    textAlign: isAr ? "right" : "left",
                    direction: isAr ? "rtl" : "ltr",
                  }}
                >
                  <span
                    style={{
                      color: isOpen ? "#F6BE00" : "#fff",
                      fontFamily: fontDisplay,
                      fontWeight: 600,
                      fontSize: 15,
                      lineHeight: 1.5,
                      transition: "color 0.3s",
                      flex: 1,
                    }}
                  >
                    {item.q}
                  </span>
                  <span
                    style={{
                      flexShrink: 0,
                      width: 28,
                      height: 28,
                      borderRadius: 8,
                      background: isOpen
                        ? "rgba(246,190,0,0.12)"
                        : "rgba(255,255,255,0.05)",
                      border: `1px solid ${
                        isOpen
                          ? "rgba(246,190,0,0.25)"
                          : "rgba(255,255,255,0.08)"
                      }`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      transition: "all 0.3s",
                      transform: isOpen ? "rotate(45deg)" : "rotate(0deg)",
                    }}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width={14}
                      height={14}
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke={isOpen ? "#F6BE00" : "rgba(255,255,255,0.5)"}
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <line x1="12" y1="5" x2="12" y2="19" />
                      <line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                  </span>
                </button>
                <div
                  style={{
                    maxHeight: isOpen ? 200 : 0,
                    overflow: "hidden",
                    transition: "max-height 0.35s ease",
                  }}
                >
                  <p
                    style={{
                      color: "rgba(255,255,255,0.45)",
                      fontSize: 14,
                      lineHeight: 1.7,
                      padding: "0 24px 20px",
                      margin: 0,
                      textAlign: isAr ? "right" : "left",
                      direction: isAr ? "rtl" : "ltr",
                    }}
                  >
                    {item.a}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
