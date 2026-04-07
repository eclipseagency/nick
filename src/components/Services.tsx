"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useReveal } from "@/hooks/useReveal";
import { useLanguage } from "@/i18n/LanguageContext";

interface CardItem {
  title: string;
  subtitle: string;
  image: string;
  href: string;
  span?: "full" | "1" | "2";
  tall?: boolean;
  overlay?: string;
  pos?: string;
}

export default function Services() {
  const { t, locale, dir } = useLanguage();
  const ref = useReveal([locale]);
  const isAr = locale === "ar";
  const fontDisplay = isAr ? "var(--font-ar)" : "var(--font-display)";

  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  // Row 1: About Us — full-width
  const aboutCard: CardItem = {
    title: isAr ? "تعرف علينا" : "About Us",
    subtitle: isAr ? "+٢٧ سنة من التميز في حماية السيارات" : "27+ years of automotive protection excellence",
    image: "/images/DSC02995.jpg",
    href: "/about",
    span: "full",
  };

  // Row 2: Services + Book Now — 2 cards
  const row2: CardItem[] = [
    {
      title: isAr ? "خدماتنا" : "Services",
      subtitle: isAr ? "أفلام حماية، عازل حراري، نانو سيراميك، تغيير ألوان" : "PPF, thermal insulation, nano ceramic, color wrapping",
      image: "/images/DSC03279.jpg",
      href: "/services",
      tall: true,
      pos: "center 40%",
    },
    {
      title: isAr ? "احجز الآن" : "Book Now",
      subtitle: isAr ? "ابدأ رحلة العناية بسيارتك" : "Start your car care journey",
      image: "/images/DSC03292.jpg",
      href: "/booking",
      tall: true,
      overlay: "rgba(246,190,0,0.12)",
    },
  ];

  // Row 3: Gallery/Portfolio — full-width
  const galleryCard: CardItem = {
    title: isAr ? "معرض أعمالنا" : "Our Gallery",
    subtitle: isAr ? "شاهد أعمالنا على أفخم السيارات" : "See our work on the finest vehicles",
    image: "/images/DSC03261.jpg",
    href: "/gallery",
    span: "full",
    pos: "center 30%",
  };

  // Row 4: Contact Us — full-width
  const contactCard: CardItem = {
    title: isAr ? "تواصل معنا" : "Contact Us",
    subtitle: isAr ? "زورونا في فرعنا بالرياض — حي النرجس، طريق أنس بن مالك" : "Visit our showroom in Riyadh — Al-Narjis, Anas Ibn Malik Road",
    image: "/images/DSC03095.jpg",
    href: "/contact",
    span: "full",
  };

  const renderCard = (card: CardItem, idx: number, height: number) => (
    <Link
      key={`${card.href}-${idx}`}
      href={card.href}
      className={`reveal reveal-delay-${Math.min(idx + 1, 4)}`}
      style={{
        position: "relative",
        borderRadius: isMobile ? 16 : 20,
        overflow: "hidden",
        height: card.span === "full" ? (isMobile ? 280 : 380) : height,
        display: "block",
        textDecoration: "none",
        transition: "transform 0.5s cubic-bezier(0.4,0,0.2,1), box-shadow 0.5s",
        gridColumn: card.span === "full" ? "1 / -1" : card.span === "2" ? "span 2" : undefined,
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = "scale(1.015)";
        e.currentTarget.style.boxShadow = "0 16px 48px rgba(0,0,0,0.5)";
        const img = e.currentTarget.querySelector("[data-card-img]") as HTMLElement;
        if (img) img.style.transform = "scale(1.08)";
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = "scale(1)";
        e.currentTarget.style.boxShadow = "none";
        const img = e.currentTarget.querySelector("[data-card-img]") as HTMLElement;
        if (img) img.style.transform = "scale(1)";
      }}
    >
      {/* Background image */}
      <div data-card-img style={{
        position: "absolute", inset: 0,
        transition: "transform 0.7s cubic-bezier(0.4,0,0.2,1)",
      }}>
        <Image src={card.image} alt={card.title} fill className="object-cover" quality={80} sizes={card.span === "full" ? "100vw" : "(max-width:768px) 100vw, 33vw"} style={{ objectPosition: card.pos || "center" }} />
      </div>

      {/* Dark overlay */}
      <div style={{
        position: "absolute", inset: 0,
        background: "linear-gradient(to top, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.3) 50%, rgba(0,0,0,0.15) 100%)",
      }} />

      {/* Gold tint overlay */}
      {card.overlay && <div style={{ position: "absolute", inset: 0, background: card.overlay }} />}

      {/* Content at bottom */}
      <div style={{
        position: "absolute", bottom: 0, left: 0, right: 0, zIndex: 3,
        padding: isMobile ? "20px 18px" : (card.span === "full" ? "36px 40px" : "28px 24px"),
        textAlign: dir === "rtl" ? "right" : "left",
      }}>
        <h3 style={{
          fontFamily: fontDisplay, color: "#fff",
          fontSize: card.span === "full" ? (isMobile ? 24 : 36) : (isMobile ? 20 : 24),
          fontWeight: 800, lineHeight: 1.15, marginBottom: 6,
        }}>{card.title}</h3>
        <p style={{
          color: "rgba(255,255,255,0.55)",
          fontSize: card.span === "full" ? (isMobile ? 13 : 16) : (isMobile ? 12 : 14),
          lineHeight: 1.5, margin: 0,
        }}>{card.subtitle}</p>
      </div>

      {/* Arrow icon */}
      <div style={{
        position: "absolute", top: isMobile ? 14 : 20,
        ...(dir === "rtl" ? { left: isMobile ? 14 : 20 } : { right: isMobile ? 14 : 20 }),
        zIndex: 3, width: 36, height: 36, borderRadius: "50%",
        background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.12)",
        backdropFilter: "blur(4px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        transition: "all 0.3s",
      }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transform: dir === "rtl" ? "scaleX(-1)" : "none" }}>
          <path d="M7 17l9.2-9.2M17 17V7H7" />
        </svg>
      </div>

      {/* Bottom gold accent */}
      <div style={{
        position: "absolute", bottom: 0, left: "15%", right: "15%", height: 2, zIndex: 5,
        background: "linear-gradient(90deg, transparent, rgba(246,190,0,0.25), transparent)",
        opacity: 0, transition: "opacity 0.4s",
      }}
        className="card-accent"
      />
    </Link>
  );

  return (
    <section id="services" ref={ref} style={{ padding: isMobile ? "48px 0" : "80px 0", background: "#050505" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 16px" }}>

        {/* Row 1: About Us — full-width */}
        <div style={{ marginBottom: isMobile ? 14 : 18 }}>
          {renderCard(aboutCard, 0, isMobile ? 300 : 380)}
        </div>

        {/* Row 2: Services + Book Now */}
        <div style={{
          display: "grid",
          gridTemplateColumns: isMobile ? "1fr" : "repeat(2, 1fr)",
          gap: isMobile ? 14 : 18,
          marginBottom: isMobile ? 14 : 18,
        }}>
          {row2.map((card, i) => renderCard(card, i, isMobile ? 340 : 440))}
        </div>

        {/* Row 3: Gallery/Portfolio — full-width */}
        <div style={{ marginBottom: isMobile ? 14 : 18 }}>
          {renderCard(galleryCard, 0, isMobile ? 280 : 380)}
        </div>

        {/* Row 4: Contact Us — full-width */}
        {renderCard(contactCard, 0, isMobile ? 280 : 380)}
      </div>
    </section>
  );
}
