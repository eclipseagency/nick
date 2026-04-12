"use client";

import Navbar from "@/components/Navbar";
import Booking from "@/components/Booking";
import Footer from "@/components/Footer";
import PageHero from "@/components/PageHero";
import { useReveal } from "@/hooks/useReveal";
import { useLanguage } from "@/i18n/LanguageContext";
import { useEffect } from "react";

export default function BookingPage() {
  useEffect(() => {
    if (typeof window !== "undefined" && (window as any).fbq) {
      (window as any).fbq("track", "ViewContent", { content_name: "Booking Page", content_category: "Automotive Protection" });
    }
  }, []);
  const { t, locale, dir } = useLanguage();
  const ref = useReveal([locale]);
  const isAr = locale === "ar";
  const fontDisplay = isAr ? "var(--font-ar)" : "var(--font-display)";

  const siteUrl = "https://nick.sa";
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
      <PageHero
        image="/images/DSC03279.jpg"
        badge={t.booking.badge}
        heading1={t.booking.heading1}
        heading2={t.booking.heading2}
        subtitle={t.booking.subtitle}
      />

      <Booking />
      <Footer />
    </main>
  );
}
