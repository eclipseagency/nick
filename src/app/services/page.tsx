"use client";

import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useReveal } from "@/hooks/useReveal";
import { useLanguage } from "@/i18n/LanguageContext";

export default function ServicesPage() {
  const { t, locale, dir } = useLanguage();
  const ref = useReveal([locale]);
  const isAr = locale === "ar";
  const fontDisplay = isAr ? "var(--font-ar)" : "var(--font-display)";

  const services = [
    {
      title: t.services.s1title,
      tag: t.services.s1tag,
      desc: t.services.s1desc,
      image: "/images/DSC03279.jpg",
      feats: [t.services.s1f1, t.services.s1f2, t.services.s1f3],
      warranty: isAr ? "ضمان 10 سنوات" : "10-Year Warranty",
      steps: isAr
        ? ["تحضير السطح", "قص دقيق", "التطبيق", "فحص الجودة"]
        : ["Surface Prep", "Precision Cut", "Application", "Quality Check"],
    },
    {
      title: t.services.s2title,
      tag: t.services.s2tag,
      desc: t.services.s2desc,
      image: "/images/DSC03136.jpg",
      feats: [t.services.s2f1, t.services.s2f2, t.services.s2f3],
      warranty: isAr ? "ضمان 10 سنوات" : "10-Year Warranty",
      steps: isAr
        ? ["تنظيف الزجاج", "قياس وقص", "تركيب الفيلم", "فحص نهائي"]
        : ["Glass Cleaning", "Measure & Cut", "Film Install", "Final Inspection"],
    },
    {
      title: t.services.s3title,
      tag: t.services.s3tag,
      desc: t.services.s3desc,
      image: "/images/DSC03018.jpg",
      feats: [t.services.s3f1, t.services.s3f2, t.services.s3f3],
      warranty: isAr ? "ضمان حتى 5 سنوات" : "Up to 5-Year Warranty",
      steps: isAr
        ? ["غسل وتطهير", "تصحيح الطلاء", "طبقات السيراميك", "معالجة حرارية"]
        : ["Wash & Decon", "Paint Correction", "Ceramic Layers", "Heat Cure"],
    },
    {
      title: t.services.s4title,
      tag: t.services.s4tag,
      desc: t.services.s4desc,
      image: "/images/DSC03060.jpg",
      feats: [t.services.s4f1, t.services.s4f2, t.services.s4f3],
      warranty: isAr ? "ضمان 3 سنوات" : "3-Year Warranty",
      steps: isAr
        ? ["اختيار اللون", "تحضير السطح", "لف الفينيل", "تشذيب وتسخين"]
        : ["Color Selection", "Surface Prep", "Vinyl Wrap", "Trim & Heat"],
    },
  ];

  const siteUrl = "https://nick-fawn.vercel.app";
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Service", name: "Paint Protection Film (PPF)",
        description: "Invisible self-healing armor against rock chips, scratches, and UV damage. Up to 10-year warranty.",
        provider: { "@id": `${siteUrl}/#business` }, areaServed: { "@type": "Country", name: "Saudi Arabia" },
        hasOfferCatalog: { "@type": "OfferCatalog", name: "PPF Options", itemListElement: [
          { "@type": "Offer", itemOffered: { "@type": "Service", name: "Full Body Clear PPF 8.5mm" }, priceSpecification: { "@type": "PriceSpecification", priceCurrency: "SAR", minPrice: "14000", maxPrice: "15500" } },
          { "@type": "Offer", itemOffered: { "@type": "Service", name: "Full Body Clear PPF 7.5mm" }, priceSpecification: { "@type": "PriceSpecification", priceCurrency: "SAR", minPrice: "12000", maxPrice: "14500" } },
          { "@type": "Offer", itemOffered: { "@type": "Service", name: "Full Front Protection" }, priceSpecification: { "@type": "PriceSpecification", priceCurrency: "SAR", minPrice: "3660", maxPrice: "5600" } },
        ]},
      },
      {
        "@type": "Service", name: "Thermal Insulation (Window Tinting)",
        description: "Nano-ceramic window films blocking 99% UV rays and reducing cabin heat. 10-year warranty.",
        provider: { "@id": `${siteUrl}/#business` }, areaServed: { "@type": "Country", name: "Saudi Arabia" },
      },
      {
        "@type": "Service", name: "Nano Ceramic Coating",
        description: "Permanent hydrophobic shield with enhanced gloss and easy maintenance. Up to 5-year warranty.",
        provider: { "@id": `${siteUrl}/#business` }, areaServed: { "@type": "Country", name: "Saudi Arabia" },
      },
      {
        "@type": "Service", name: "Color Wrapping",
        description: "Premium color-change wraps that protect your original paint. Fully reversible.",
        provider: { "@id": `${siteUrl}/#business` }, areaServed: { "@type": "Country", name: "Saudi Arabia" },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Home", item: siteUrl },
          { "@type": "ListItem", position: 2, name: "Services", item: `${siteUrl}/services` },
        ],
      },
    ],
  };

  return (
    <main ref={ref} dir={dir}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Navbar />

      {/* ── Hero Banner ── */}
      <section
        style={{
          position: "relative",
          height: "60vh",
          minHeight: 400,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
        }}
      >
        <Image
          src="/images/DSC03279.jpg"
          alt="NICK Services"
          fill
          priority
          className="object-cover"
          style={{ zIndex: 0 }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(to bottom, rgba(5,5,5,0.7), rgba(5,5,5,0.85))",
            zIndex: 1,
          }}
        />
        <div className="reveal" style={{ position: "relative", zIndex: 2, textAlign: "center", padding: "0 24px" }}>
          <span className="section-badge" style={{ marginBottom: 16, display: "inline-block" }}>
            {t.services.badge}
          </span>
          <h1
            style={{
              fontFamily: fontDisplay,
              fontSize: "clamp(32px, 6vw, 56px)",
              fontWeight: 700,
              marginBottom: 16,
              lineHeight: 1.15,
            }}
          >
            <span style={{ color: "#fff" }}>{t.services.heading1}</span>
            <span className="gold-text">{t.services.heading2}</span>
          </h1>
          <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 18, maxWidth: 560, margin: "0 auto" }}>
            {t.services.subtitle}
          </p>
        </div>
      </section>

      {/* ── Service Sections ── */}
      {services.map((s, i) => {
        const imageFirst = i % 2 === 0;
        return (
          <section
            key={s.image}
            style={{
              padding: "80px 0",
              background: i % 2 === 0 ? "#050505" : "#0a0a0a",
            }}
          >
            <div
              style={{
                maxWidth: 1200,
                margin: "0 auto",
                padding: "0 24px",
                display: "flex",
                flexDirection: "column",
                gap: 48,
              }}
            >
              {/* two-column grid */}
              <div
                className="reveal"
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr",
                  gap: 40,
                  alignItems: "center",
                }}
              >
                {/* Use CSS media query via style for responsive two-col */}
                <style>{`
                  @media (min-width: 768px) {
                    .svc-grid-${i} {
                      grid-template-columns: 1fr 1fr !important;
                    }
                  }
                `}</style>
                <div
                  className={`svc-grid-${i}`}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "1fr",
                    gap: 40,
                    alignItems: "center",
                  }}
                >
                  {/* Image */}
                  <div
                    style={{
                      position: "relative",
                      height: 400,
                      borderRadius: 16,
                      overflow: "hidden",
                      order: imageFirst ? 0 : 1,
                    }}
                  >
                    <Image
                      src={s.image}
                      alt={s.title}
                      fill
                      className="object-cover"
                      style={{ transition: "transform 0.6s" }}
                    />
                    <div
                      style={{
                        position: "absolute",
                        inset: 0,
                        background: "linear-gradient(to top, rgba(5,5,5,0.4), transparent)",
                      }}
                    />
                  </div>

                  {/* Content */}
                  <div style={{ order: imageFirst ? 1 : 0 }}>
                    {/* Tag badge */}
                    <span
                      style={{
                        display: "inline-block",
                        padding: "5px 14px",
                        background: "#F6BE00",
                        color: "#000",
                        fontSize: 11,
                        fontWeight: 700,
                        borderRadius: 6,
                        letterSpacing: isAr ? "0" : "0.05em",
                        textTransform: isAr ? "none" : ("uppercase" as const),
                        marginBottom: 16,
                      }}
                    >
                      {s.tag}
                    </span>

                    {/* Title */}
                    <h2
                      style={{
                        fontFamily: fontDisplay,
                        fontSize: "clamp(26px, 4vw, 38px)",
                        fontWeight: 700,
                        color: "#fff",
                        marginBottom: 16,
                        lineHeight: 1.2,
                      }}
                    >
                      {s.title}
                    </h2>

                    {/* Description */}
                    <p
                      style={{
                        color: "rgba(255,255,255,0.5)",
                        fontSize: 16,
                        lineHeight: 1.7,
                        marginBottom: 24,
                      }}
                    >
                      {s.desc}
                    </p>

                    {/* Feature pills */}
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 24 }}>
                      {s.feats.map((f) => (
                        <span
                          key={f}
                          style={{
                            padding: "6px 14px",
                            fontSize: 12,
                            fontWeight: 500,
                            color: "#F6BE00",
                            border: "1px solid rgba(246,190,0,0.2)",
                            borderRadius: 100,
                            background: "rgba(246,190,0,0.05)",
                          }}
                        >
                          {f}
                        </span>
                      ))}
                    </div>

                    {/* Process steps */}
                    <div
                      style={{
                        display: "flex",
                        flexWrap: "wrap",
                        alignItems: "center",
                        gap: 8,
                        marginBottom: 24,
                        direction: dir,
                      }}
                    >
                      {s.steps.map((step, si) => (
                        <span key={step} style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                          <span
                            style={{
                              display: "inline-flex",
                              alignItems: "center",
                              justifyContent: "center",
                              width: 24,
                              height: 24,
                              borderRadius: "50%",
                              background: "rgba(246,190,0,0.15)",
                              color: "#F6BE00",
                              fontSize: 11,
                              fontWeight: 700,
                              flexShrink: 0,
                            }}
                          >
                            {si + 1}
                          </span>
                          <span style={{ color: "rgba(255,255,255,0.6)", fontSize: 13, fontWeight: 500 }}>
                            {step}
                          </span>
                          {si < s.steps.length - 1 && (
                            <span style={{ color: "rgba(246,190,0,0.3)", fontSize: 14, margin: "0 2px" }}>
                              {isAr ? "\u2190" : "\u2192"}
                            </span>
                          )}
                        </span>
                      ))}
                    </div>

                    {/* Warranty badge */}
                    <div
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: 10,
                        padding: "10px 20px",
                        background: "rgba(246,190,0,0.08)",
                        border: "1px solid rgba(246,190,0,0.2)",
                        borderRadius: 10,
                      }}
                    >
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#F6BE00"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                      </svg>
                      <span style={{ color: "#F6BE00", fontSize: 14, fontWeight: 600 }}>{s.warranty}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        );
      })}

      {/* ── CTA Section ── */}
      <section
        style={{
          padding: "80px 0",
          background: "linear-gradient(180deg, #0a0a0a, #050505)",
          textAlign: "center",
        }}
      >
        <div className="reveal" style={{ maxWidth: 600, margin: "0 auto", padding: "0 24px" }}>
          <h2
            style={{
              fontFamily: fontDisplay,
              fontSize: "clamp(26px, 5vw, 40px)",
              fontWeight: 700,
              color: "#fff",
              marginBottom: 16,
            }}
          >
            {isAr ? "احجز خدمتك اليوم" : "Book Your Service Today"}
          </h2>
          <p
            style={{
              color: "rgba(255,255,255,0.45)",
              fontSize: 16,
              lineHeight: 1.7,
              marginBottom: 32,
            }}
          >
            {isAr
              ? "فريقنا جاهز لحماية سيارتك بأعلى معايير الجودة. احجز موعدك الآن واحصل على استشارة مجانية."
              : "Our team is ready to protect your vehicle with the highest quality standards. Book your appointment now and get a free consultation."}
          </p>
          <Link
            href="/booking"
            className="btn-gold"
            style={{
              display: "inline-block",
              padding: "14px 40px",
              fontSize: 15,
              fontWeight: 600,
              borderRadius: 10,
              textDecoration: "none",
            }}
          >
            {isAr ? "احجز الآن" : "Book Now"}
          </Link>
        </div>
      </section>

      <Footer />
    </main>
  );
}
