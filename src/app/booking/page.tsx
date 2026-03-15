"use client";

import Image from "next/image";
import Navbar from "@/components/Navbar";
import Booking from "@/components/Booking";
import Footer from "@/components/Footer";
import { useReveal } from "@/hooks/useReveal";
import { useLanguage } from "@/i18n/LanguageContext";

export default function BookingPage() {
  const { t, locale, dir } = useLanguage();
  const ref = useReveal([locale]);
  const isAr = locale === "ar";
  const fontDisplay = isAr ? "var(--font-ar)" : "var(--font-display)";

  const siteUrl = "https://nick-fawn.vercel.app";
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Book a Service",
    description: "Online booking for automotive protection services. PPF, ceramic coating, thermal insulation.",
    url: `${siteUrl}/booking`,
    mainEntity: { "@id": `${siteUrl}/#business` },
    breadcrumb: {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: siteUrl },
        { "@type": "ListItem", position: 2, name: "Book a Service", item: `${siteUrl}/booking` },
      ],
    },
  };

  return (
    <main ref={ref} dir={dir}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Navbar />

      {/* Hero Banner */}
      <section
        style={{
          position: "relative",
          minHeight: 340,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          overflow: "hidden",
        }}
      >
        <Image
          src="/images/DSC03279.jpg"
          alt="Book NICK services"
          fill
          priority
          className="object-cover"
          style={{ zIndex: 0 }}
        />
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(to bottom, rgba(5,5,5,0.8) 0%, rgba(5,5,5,0.65) 100%)",
            zIndex: 1,
          }}
        />
        <div className="reveal" style={{ position: "relative", zIndex: 2, padding: "120px 24px 64px" }}>
          <span className="section-badge">{t.booking.badge}</span>
          <h1
            style={{
              fontFamily: fontDisplay,
              fontSize: "clamp(32px, 6vw, 56px)",
              fontWeight: 700,
              marginTop: 12,
              lineHeight: 1.15,
            }}
          >
            <span style={{ color: "#fff" }}>{t.booking.heading1}</span>
            <span className="gold-text">{t.booking.heading2}</span>
          </h1>
          <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 18, maxWidth: 560, margin: "16px auto 0" }}>
            {t.booking.subtitle}
          </p>
        </div>
      </section>

      <Booking />
      <Footer />
    </main>
  );
}
