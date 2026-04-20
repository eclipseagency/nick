"use client";

import Image from "next/image";
import { useReveal } from "@/hooks/useReveal";
import { useLanguage } from "@/i18n/LanguageContext";

export default function WhyNick() {
  const { t, locale, dir } = useLanguage();
  const ref = useReveal([locale]);
  const isAr = locale === "ar";
  const fontDisplay = isAr ? "var(--font-ar)" : "var(--font-display)";

  const items = [
    { t: t.whynick.f1t, d: t.whynick.f1d, i: "M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09Z" },
    { t: t.whynick.f2t, d: t.whynick.f2d, i: "M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z" },
    { t: t.whynick.f3t, d: t.whynick.f3d, i: "M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" },
    { t: t.whynick.f4t, d: t.whynick.f4d, i: "M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" },
  ];

  return (
    <section ref={ref} style={{ padding: "96px 0" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px" }}>
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          <div>
            <div className="reveal">
              <span className="section-badge">{t.whynick.badge}</span>
              <h2 style={{ fontFamily: fontDisplay, fontSize: "clamp(28px, 5vw, 44px)", fontWeight: 700, lineHeight: 1.15, marginBottom: 20 }}>
                <span style={{ color: "#fff" }}>{t.whynick.heading1}</span><span className="gold-text">{t.whynick.heading2}</span>
              </h2>
              <p style={{ color: "rgba(255,255,255,0.45)", fontSize: 16, lineHeight: 1.7, marginBottom: 40 }}>
                {t.whynick.subtitle}
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              {items.map((r, i) => (
                <div key={i} className={`reveal reveal-delay-${i + 1}`} style={{ cursor: "default" }}>
                  <div style={{ width: 42, height: 42, borderRadius: 10, background: "rgba(246,190,0,0.08)", border: "1px solid rgba(246,190,0,0.15)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 12, transition: "all 0.3s" }}
                    onMouseEnter={e => { e.currentTarget.style.background = "rgba(246,190,0,0.15)"; e.currentTarget.style.transform = "scale(1.1)"; }}
                    onMouseLeave={e => { e.currentTarget.style.background = "rgba(246,190,0,0.08)"; e.currentTarget.style.transform = "scale(1)"; }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="#F6BE00" width={20} height={20}><path strokeLinecap="round" strokeLinejoin="round" d={r.i} /></svg>
                  </div>
                  <div style={{ color: "#fff", fontWeight: 600, fontSize: 14, marginBottom: 4 }}>{r.t}</div>
                  <p style={{ color: "rgba(255,255,255,0.35)", fontSize: 13, lineHeight: 1.6 }}>{r.d}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="hidden lg:block reveal reveal-delay-2" style={{ position: "relative" }}>
            <div className="gallery-item" style={{ position: "relative", aspectRatio: "3/4", borderRadius: 16, overflow: "hidden", boxShadow: "0 0 30px rgba(246,190,0,0.08)" }}>
              <Image src="/images/IMG_9536.webp" alt="NICK store" fill className="object-cover" />
            </div>
            <div className="gallery-item" style={{
              position: "absolute", bottom: -20,
              ...(dir === "rtl" ? { right: -20 } : { left: -20 }),
              width: "65%", aspectRatio: "16/10", borderRadius: 12, overflow: "hidden", border: "4px solid #050505", boxShadow: "0 0 20px rgba(246,190,0,0.08)",
            }}>
              <Image src="/images/DSC03095.jpg" alt="Technician" fill className="object-cover" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
