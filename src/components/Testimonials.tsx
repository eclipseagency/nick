"use client";

import { useReveal } from "@/hooks/useReveal";
import { useLanguage } from "@/i18n/LanguageContext";

export default function Testimonials() {
  const ref = useReveal();
  const { t, locale } = useLanguage();
  const isAr = locale === "ar";
  const fontDisplay = isAr ? "var(--font-ar)" : "var(--font-display)";

  const data = [
    { n: t.testimonials.t1name, q: t.testimonials.t1quote },
    { n: t.testimonials.t2name, q: t.testimonials.t2quote },
    { n: t.testimonials.t3name, q: t.testimonials.t3quote },
    { n: t.testimonials.t4name, q: t.testimonials.t4quote },
  ];

  return (
    <section ref={ref} style={{ padding: "96px 0", background: "linear-gradient(180deg, #050505, #0a0a0a, #050505)" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px" }}>
        <div className="reveal" style={{ textAlign: "center", marginBottom: 56 }}>
          <span className="section-badge">{t.testimonials.badge}</span>
          <h2 style={{ fontFamily: fontDisplay, fontSize: "clamp(28px, 5vw, 44px)", fontWeight: 700 }}>
            <span style={{ color: "#fff" }}>{t.testimonials.heading1}</span><span className="gold-text">{t.testimonials.heading2}</span>
          </h2>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
          {data.map((item, i) => (
            <div key={item.n} className={`card reveal reveal-delay-${i + 1}`} style={{ padding: 24 }}>
              <div style={{ display: "flex", gap: 3, marginBottom: 16 }}>
                {[...Array(5)].map((_, j) => (
                  <svg key={j} width={15} height={15} fill="#F6BE00" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                ))}
              </div>
              <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 13, lineHeight: 1.7, marginBottom: 20 }}>&ldquo;{item.q}&rdquo;</p>
              <div style={{ display: "flex", alignItems: "center", gap: 10, paddingTop: 16, borderTop: "1px solid rgba(255,255,255,0.05)" }}>
                <div style={{ width: 36, height: 36, borderRadius: "50%", background: "rgba(246,190,0,0.08)", border: "1px solid rgba(246,190,0,0.15)", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.3s" }}>
                  <span style={{ color: "#F6BE00", fontWeight: 700, fontSize: 13 }}>{item.n[0]}</span>
                </div>
                <div>
                  <div style={{ color: "#fff", fontWeight: 600, fontSize: 13 }}>{item.n}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
