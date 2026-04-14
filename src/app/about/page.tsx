"use client";

import Image from "next/image";
import Link from "next/link";
import { useReveal } from "@/hooks/useReveal";
import { useLanguage } from "@/i18n/LanguageContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PageHero from "@/components/PageHero";

export default function AboutPage() {
  const { t, locale, dir } = useLanguage();
  const ref = useReveal([locale]);
  const isAr = locale === "ar";
  const fontDisplay = isAr ? "var(--font-ar)" : "var(--font-display)";

  const features = [
    { t: t.about.feat1t, d: t.about.feat1d },
    { t: t.about.feat2t, d: t.about.feat2d },
    { t: t.about.feat3t, d: t.about.feat3d },
    { t: t.about.feat4t, d: t.about.feat4d },
  ];

  const timeline = [
    {
      year: "1999",
      title: isAr ? "تأسيس الشركة" : "Company Founded",
      desc: isAr
        ? "تأسست NICK كشركة رائدة في صناعة أفلام حماية السيارات"
        : "NICK was established as a pioneering company in automotive protection film manufacturing",
      image: "/images/story/1999.jpg",
    },
    {
      year: "2000",
      title: isAr ? "الانطلاق وبداية التصنيع" : "Launch & Manufacturing Begins",
      desc: isAr
        ? "تم الانطلاق وبداية التصنيع بأحدث خطوط الإنتاج"
        : "Officially launched and started manufacturing with state-of-the-art production lines",
      image: "/images/story/2000.jpg",
    },
    {
      year: "2005",
      title: isAr ? "ظهور العلامة التجارية بقوة" : "Brand Emergence in Manufacturing",
      desc: isAr
        ? "ظهور العلامة التجارية بشكل قوي في عالم التصنيع"
        : "The brand emerged strongly in the manufacturing world with growing recognition",
      image: "/images/story/2005.jpg",
    },
    {
      year: "2010",
      title: isAr ? "انتشار عالمي" : "Global Expansion",
      desc: isAr
        ? "انتشار عالمي وظهور العلامة التجارية بشكل قوي في السوق العالمي"
        : "Global expansion with strong brand presence in the international market",
      image: "/images/story/2010.jpg",
    },
    {
      year: "2015",
      title: isAr ? "خط إنتاج العوازل الحرارية" : "Thermal Insulation Production Line",
      desc: isAr
        ? "انطلاق خط إنتاج تصنيع العوازل الحرارية"
        : "Launched the thermal insulation manufacturing production line",
      image: "/images/story/2015.jpg",
    },
    {
      year: "2019",
      title: isAr ? "٢٠٠,٠٠٠ سيارة حول العالم" : "200,000 Cars Worldwide",
      desc: isAr
        ? "تجاوزنا حماية 200,000 سيارة حول العالم وامتدت خدماتنا لتشمل التغليف بالألوان والعازل الحراري"
        : "Surpassed 200,000 cars protected worldwide, expanding services to include color wrapping and thermal insulation",
      image: "/images/story/2019.jpg",
    },
    {
      year: "2022",
      title: isAr ? "جميع خدمات العناية بالسيارات" : "Full Car Care Services",
      desc: isAr
        ? "انطلاق العلامة التجارية بشكل كامل لجميع خدمات العناية بالسيارات"
        : "Full brand launch covering all automotive care services",
      image: "/images/story/2022.jpg",
    },
    {
      year: "2025",
      title: isAr ? "أول وكيل بالشرق الأوسط" : "First Middle East Dealer",
      desc: isAr
        ? "تم افتتاح أول وكيل للشركة بالشرق الأوسط بعد أن وصلنا إلى تحقيق رقم قياسي في خدمة 20 مليون عميل حول العالم"
        : "Opened the first authorized dealer in the Middle East after reaching a record 20 million customers worldwide",
      image: "/images/story/2025.jpg",
    },
  ];

  const values = [
    {
      icon: "M9 12.75L11.25 15 15 9.75M21 12c0 4.97-4.03 9-9 9s-9-4.03-9-9 4.03-9 9-9 9 4.03 9 9z",
      title: isAr ? "الجودة" : "Quality",
      desc: isAr
        ? "نعتمد على مواد أمريكية أصلية من نوع TPU، مدعومة بتقنيات معالجة يابانية متطورة، لنقدّم حماية فائقة تدوم لسنوات"
        : "We rely on original American TPU materials, backed by advanced Japanese processing technologies, to deliver superior protection that lasts for years",
    },
    {
      icon: "M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z",
      title: isAr ? "الابتكار" : "Innovation",
      desc: isAr
        ? "نستثمر باستمرار في أحدث التقنيات والأبحاث لتطوير منتجات حماية متفوقة"
        : "We continuously invest in the latest technologies and research to develop superior protection products",
    },
    {
      icon: "M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285Z",
      title: isAr ? "الثقة" : "Trust",
      desc: isAr
        ? "أكثر من 20 مليون عميل مالك سيارة على مستوى العالم وثقوا بنا"
        : "Over 20 million car owners worldwide have trusted us",
    },
    {
      icon: "M11.42 15.17l-5.66-5.66L7.17 8.1l4.24 4.24 8.49-8.49 1.41 1.41-9.89 9.91zM20 12c0 4.42-3.58 8-8 8s-8-3.58-8-8h2c0 3.31 2.69 6 6 6s6-2.69 6-6h2z",
      title: isAr ? "الخدمة" : "Service",
      desc: isAr
        ? "فريق محترف مدرب على أعلى مستوى يقدم خدمة استثنائية من الاستشارة حتى التسليم"
        : "A professionally trained team delivers exceptional service from consultation through to delivery",
    },
  ];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    name: "About NICK",
    description: "27 years of automotive protection excellence in Saudi Arabia. Manufacturer and installer since 1999.",
    url: "https://nick.sa/about",
    mainEntity: { "@id": "https://nick.sa/#business" },
    breadcrumb: {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: "https://nick.sa" },
        { "@type": "ListItem", position: 2, name: "About", item: "https://nick.sa/about" },
      ],
    },
  };

  return (
    <main ref={ref}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Navbar />
      <PageHero
        image="/images/DSC03261.jpg"
        badge={isAr ? "من نحن" : "Our Story"}
        heading1={isAr ? "عن " : "About "}
        heading2="NICK"
        subtitle={isAr
          ? "أكثر من 27 عامًا من التميز في حماية السيارات. من العالمية إلى المملكة العربية السعودية، نحمي سيارتك بأعلى المعايير."
          : "Over 27 years of excellence in automotive protection. From Riyadh to the world, we protect your car to the highest standards."}
      />

      {/* ── Company Story ── */}
      <section style={{ padding: "clamp(48px, 8vw, 96px) 0", overflow: "hidden" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px" }}>
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            {/* Image */}
            <div className="reveal" style={{ position: "relative" }}>
              <div style={{ position: "relative", aspectRatio: "4/5", borderRadius: 16, overflow: "hidden", boxShadow: "0 0 40px rgba(246,190,0,0.08)" }}>
                <Image src="/images/DSC02995.jpg" alt="NICK team" fill className="object-cover" style={{ transition: "transform 0.8s ease" }} />
                <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(5,5,5,0.5), transparent)" }} />
              </div>
{/* 1999 badge removed per client request */}
            </div>

            {/* Text */}
            <div className="reveal reveal-delay-2">
              <span className="section-badge">{t.about.badge}</span>
              <h2 style={{ fontFamily: fontDisplay, fontSize: "clamp(28px, 5vw, 44px)", fontWeight: 700, lineHeight: 1.15, marginBottom: 24 }}>
                <span style={{ color: "#fff" }}>{t.about.heading1}</span>
                <span className="gold-text">{t.about.heading2}</span>
              </h2>
              <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 17, lineHeight: 1.7, marginBottom: 20 }}>
                {t.about.p1}
              </p>
              <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 15, lineHeight: 1.7, marginBottom: 16 }}>
                {t.about.p2}
              </p>
              <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 15, lineHeight: 1.7, marginBottom: 36 }}>
                {isAr
                  ? "نحن لا نقدم مجرد خدمة حماية، بل نقدم تجربة متكاملة تبدأ من الاستشارة المتخصصة وتنتهي بضمان طويل الأمد. فريقنا المدرب على أعلى المستويات يستخدم أحدث التقنيات لضمان نتائج مثالية في كل مرة."
                  : "We don't just offer a protection service — we deliver a complete experience that starts with expert consultation and ends with a long-term warranty. Our highly trained team uses the latest techniques to ensure flawless results every time."}
              </p>

              <div className="grid grid-cols-2 gap-5">
                {features.map((i, idx) => (
                  <div key={idx} style={{ display: "flex", gap: 12 }}>
                    <div style={{ width: 3, borderRadius: 2, background: "rgba(246,190,0,0.3)", flexShrink: 0, transition: "background 0.3s" }} />
                    <div>
                      <div style={{ color: "#fff", fontWeight: 600, fontSize: 14 }}>{i.t}</div>
                      <div style={{ color: "rgba(255,255,255,0.35)", fontSize: 13 }}>{i.d}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Timeline ── */}
      <section style={{ padding: "clamp(48px, 8vw, 96px) 0", background: "linear-gradient(180deg, transparent 0%, rgba(246,190,0,0.02) 50%, transparent 100%)" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", padding: "0 24px" }}>
          <div className="reveal" style={{ textAlign: "center", marginBottom: 64 }}>
            <span className="section-badge">{isAr ? "مسيرتنا" : "Our Journey"}</span>
            <h2 style={{ fontFamily: fontDisplay, fontSize: "clamp(28px, 5vw, 44px)", fontWeight: 700, lineHeight: 1.15 }}>
              <span style={{ color: "#fff" }}>{isAr ? "محطات " : "Key "}</span>
              <span className="gold-text">{isAr ? "بارزة" : "Milestones"}</span>
            </h2>
          </div>

          <div style={{ position: "relative" }}>
            {/* Vertical line — behind cards */}
            <div style={{
              position: "absolute",
              top: 0,
              bottom: 0,
              width: 2,
              background: "linear-gradient(to bottom, transparent, rgba(246,190,0,0.3), transparent)",
              zIndex: 0,
              ...(dir === "rtl" ? { right: 20 } : { left: 20 }),
            }} />

            {timeline.map((item, idx) => (
              <div
                key={item.year}
                className={`reveal reveal-delay-${Math.min(idx + 1, 4)}`}
                style={{
                  display: "flex",
                  gap: "clamp(16px, 4vw, 32px)",
                  marginBottom: idx < timeline.length - 1 ? "clamp(28px, 5vw, 48px)" : 0,
                  alignItems: "flex-start",
                  flexDirection: dir === "rtl" ? "row-reverse" : "row",
                }}
              >
                {/* Dot */}
                <div style={{ position: "relative", flexShrink: 0, width: 42, display: "flex", justifyContent: "center" }}>
                  <div style={{
                    width: 14,
                    height: 14,
                    borderRadius: "50%",
                    background: "#F6BE00",
                    boxShadow: "0 0 16px rgba(246,190,0,0.4)",
                    marginTop: 6,
                  }} />
                </div>

                {/* Content card with image */}
                <div style={{
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.06)",
                  borderRadius: 16,
                  overflow: "hidden",
                  flex: 1,
                  position: "relative",
                  zIndex: 1,
                  transition: "border-color 0.3s, background 0.3s",
                }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(246,190,0,0.2)"; e.currentTarget.style.background = "rgba(246,190,0,0.03)"; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)"; e.currentTarget.style.background = "rgba(255,255,255,0.03)"; }}
                >
                  {/* Image */}
                  {item.image && (
                    <div style={{ position: "relative", width: "100%", aspectRatio: "16/9", overflow: "hidden" }}>
                      <Image src={item.image} alt={`NICK ${item.year}`} fill className="object-cover" />
                      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(17,17,17,0.6) 0%, transparent 50%)" }} />
                      {/* Year overlay on image */}
                      <div style={{
                        position: "absolute", bottom: 12,
                        ...(dir === "rtl" ? { right: 16 } : { left: 16 }),
                        padding: "4px 14px", borderRadius: 8,
                        background: "rgba(246,190,0,0.9)", color: "#000",
                        fontFamily: fontDisplay, fontWeight: 800, fontSize: 18,
                      }}>{item.year}</div>
                    </div>
                  )}
                  {/* Text */}
                  <div style={{ padding: "clamp(14px, 3vw, 20px) clamp(16px, 3vw, 24px)" }}>
                    <div style={{ color: "#fff", fontWeight: 700, fontSize: 17, marginBottom: 6 }}>{item.title}</div>
                    <p style={{ color: "rgba(255,255,255,0.45)", fontSize: 14, lineHeight: 1.6, margin: 0 }}>{item.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Manufacturing Section ── */}
      <section style={{ padding: "clamp(48px, 8vw, 96px) 0", overflow: "hidden" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px" }}>
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            {/* Text first on this one */}
            <div className={`reveal ${dir === "rtl" ? "lg:order-2" : ""}`}>
              <span className="section-badge">{isAr ? "التصنيع" : "Manufacturing"}</span>
              <h2 style={{ fontFamily: fontDisplay, fontSize: "clamp(28px, 5vw, 44px)", fontWeight: 700, lineHeight: 1.15, marginBottom: 24 }}>
                <span style={{ color: "#fff" }}>{isAr ? "من المواد الخام " : "From Raw Materials "}</span>
                <span className="gold-text">{isAr ? "إلى المنتج النهائي" : "to Finished Product"}</span>
              </h2>
              <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 17, lineHeight: 1.7, marginBottom: 20 }}>
                {isAr
                  ? "ما يميز NICK عن غيرها هو امتلاكنا لمصنعنا الخاص. نتحكم في كل مرحلة من مراحل الإنتاج — من اختيار المواد الخام الأولية وحتى المنتج النهائي الذي يُركّب على سيارتك."
                  : "What sets NICK apart is owning our own factory. We control every stage of production — from selecting raw materials to the finished product that is installed on your car."}
              </p>
              <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 15, lineHeight: 1.7, marginBottom: 28 }}>
                {isAr
                  ? "مرافق التصنيع لدينا مجهزة بأحدث التقنيات وتعمل وفق معايير جودة صارمة. كل لفة فيلم تخضع لفحوصات متعددة لضمان الأداء المثالي والمتانة والشفافية. هذا التحكم الكامل يمنحنا القدرة على تقديم ضمانات لا يمكن لأي موزع منافسة مثلها."
                  : "Our manufacturing facilities are equipped with cutting-edge technology and operate under strict quality standards. Every roll of film undergoes multiple inspections to ensure optimal performance, durability, and clarity. This complete control allows us to offer warranties no distributor can match."}
              </p>

              <div style={{ display: "flex", flexWrap: "wrap" as const, gap: 16 }}>
                {[
                  { n: isAr ? "رقابة جودة شاملة" : "Full Quality Control", v: "100%" },
                  { n: isAr ? "أمريكية 🇺🇸 يابانية 🇯🇵" : "American 🇺🇸 Japanese 🇯🇵", v: isAr ? "مواد خام" : "Raw Materials" },
                  { n: isAr ? "اختبارات ما قبل التسليم" : "Pre-Delivery Tests", v: isAr ? "متعددة" : "Multiple" },
                ].map((stat) => (
                  <div key={stat.n} style={{ background: "rgba(246,190,0,0.05)", border: "1px solid rgba(246,190,0,0.12)", borderRadius: 10, padding: "14px 20px", flex: "1 1 140px" }}>
                    <div className="gold-text" style={{ fontFamily: fontDisplay, fontSize: 20, fontWeight: 700 }}>{stat.v}</div>
                    <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 12, marginTop: 2 }}>{stat.n}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Image */}
            <div className={`reveal reveal-delay-2 ${dir === "rtl" ? "lg:order-1" : ""}`} style={{ position: "relative" }}>
              <div style={{ position: "relative", aspectRatio: "4/5", borderRadius: 16, overflow: "hidden", boxShadow: "0 0 40px rgba(246,190,0,0.08)" }}>
                <Image
                  src="/images/0a9b9f31-91ea-4064-bab3-8d3c780e3878.jpg"
                  alt={isAr ? "مصنع NICK" : "NICK manufacturing facility"}
                  fill
                  className="object-cover"
                  style={{ transition: "transform 0.8s ease" }}
                />
                <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(5,5,5,0.5), transparent)" }} />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Values Grid ── */}
      <section style={{ padding: "clamp(48px, 8vw, 96px) 0", background: "linear-gradient(180deg, transparent 0%, rgba(246,190,0,0.02) 50%, transparent 100%)" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px" }}>
          <div className="reveal" style={{ textAlign: "center", marginBottom: 64 }}>
            <span className="section-badge">{isAr ? "قيمنا" : "Our Values"}</span>
            <h2 style={{ fontFamily: fontDisplay, fontSize: "clamp(28px, 5vw, 44px)", fontWeight: 700, lineHeight: 1.15 }}>
              <span style={{ color: "#fff" }}>{isAr ? "ما " : "What We "}</span>
              <span className="gold-text">{isAr ? "نؤمن به" : "Believe In"}</span>
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((val, idx) => (
              <div
                key={val.title}
                className={`reveal reveal-delay-${Math.min(idx + 1, 4)}`}
                style={{
                  background: "rgba(255,255,255,0.02)",
                  border: "1px solid rgba(255,255,255,0.06)",
                  borderRadius: 16,
                  padding: "32px 24px",
                  textAlign: "center",
                  transition: "border-color 0.3s, background 0.3s, transform 0.3s",
                  cursor: "default",
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = "rgba(246,190,0,0.25)";
                  e.currentTarget.style.background = "rgba(246,190,0,0.04)";
                  e.currentTarget.style.transform = "translateY(-4px)";
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)";
                  e.currentTarget.style.background = "rgba(255,255,255,0.02)";
                  e.currentTarget.style.transform = "translateY(0)";
                }}
              >
                <div style={{
                  width: 56,
                  height: 56,
                  borderRadius: 14,
                  background: "rgba(246,190,0,0.08)",
                  border: "1px solid rgba(246,190,0,0.15)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  margin: "0 auto 20px",
                }}>
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="#F6BE00" width={24} height={24}>
                    <path strokeLinecap="round" strokeLinejoin="round" d={val.icon} />
                  </svg>
                </div>
                <div style={{ color: "#fff", fontFamily: fontDisplay, fontWeight: 700, fontSize: 18, marginBottom: 8 }}>{val.title}</div>
                <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 13, lineHeight: 1.65 }}>{val.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Certificates ── */}
      <section style={{ padding: "clamp(48px, 8vw, 96px) 0", overflow: "hidden" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 24px" }}>
          <div className="reveal" style={{ textAlign: "center", marginBottom: 64 }}>
            <span className="section-badge">{isAr ? "الشهادات" : "Certifications"}</span>
            <h2 style={{ fontFamily: fontDisplay, fontSize: "clamp(28px, 5vw, 44px)", fontWeight: 700, lineHeight: 1.15 }}>
              <span style={{ color: "#fff" }}>{isAr ? "معتمدون " : "Certified "}</span>
              <span className="gold-text">{isAr ? "دولياً" : "Globally"}</span>
            </h2>
            <p style={{ color: "rgba(255,255,255,0.45)", fontSize: 16, lineHeight: 1.7, maxWidth: 560, margin: "16px auto 0" }}>
              {isAr
                ? "منتجات NICK حاصلة على شهادات الجودة والمطابقة الدولية من جهات معتمدة عالمياً"
                : "NICK products hold international quality and conformity certificates from globally recognized bodies"}
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 reveal">
            {Array.from({ length: 10 }, (_, i) => (
              <div
                key={i}
                style={{
                  position: "relative",
                  aspectRatio: "3/4",
                  borderRadius: 12,
                  overflow: "hidden",
                  background: "#fff",
                  border: "1px solid rgba(255,255,255,0.1)",
                  cursor: "pointer",
                  transition: "transform 0.3s, box-shadow 0.3s",
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "0 8px 24px rgba(246,190,0,0.15)"; }}
                onMouseLeave={e => { e.currentTarget.style.transform = ""; e.currentTarget.style.boxShadow = ""; }}
                onClick={() => window.open(`/images/certs/cert-${i + 1}.jpg`, "_blank")}
              >
                <Image
                  src={`/images/certs/cert-${i + 1}.jpg`}
                  alt={`${isAr ? "شهادة" : "Certificate"} ${i + 1}`}
                  fill
                  className="object-contain"
                  style={{ padding: 4 }}
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 20vw"
                />
              </div>
            ))}
          </div>

          {/* Trust badges */}
          <div className="reveal" style={{ display: "flex", flexWrap: "wrap" as const, justifyContent: "center", gap: 24, marginTop: 48 }}>
            {["CE", "REACH", "RoHS", "LUCID"].map(badge => (
              <div key={badge} style={{
                padding: "10px 24px", borderRadius: 10,
                background: "rgba(246,190,0,0.06)", border: "1px solid rgba(246,190,0,0.15)",
                color: "#F6BE00", fontSize: 14, fontWeight: 700, letterSpacing: "0.05em",
              }}>
                {badge}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Section ── */}
      <section style={{ padding: "clamp(48px, 8vw, 96px) 0" }}>
        <div style={{ maxWidth: 800, margin: "0 auto", padding: "0 24px", textAlign: "center" }}>
          <div className="reveal" style={{
            background: "linear-gradient(135deg, rgba(246,190,0,0.06) 0%, rgba(246,190,0,0.02) 100%)",
            border: "1px solid rgba(246,190,0,0.15)",
            borderRadius: 20,
            padding: "clamp(36px, 6vw, 64px) clamp(20px, 5vw, 40px)",
          }}>
            <h2 style={{ fontFamily: fontDisplay, fontSize: "clamp(28px, 5vw, 40px)", fontWeight: 700, lineHeight: 1.15, marginBottom: 16 }}>
              <span style={{ color: "#fff" }}>{isAr ? "جاهز " : "Ready to "}</span>
              <span className="gold-text">{isAr ? "لحماية سيارتك؟" : "Protect Your Car?"}</span>
            </h2>
            <p style={{ color: "rgba(255,255,255,0.5)", fontSize: 16, lineHeight: 1.7, maxWidth: 480, margin: "0 auto 32px" }}>
              {isAr
                ? "احجز موعدك اليوم واحصل على استشارة مجانية من خبرائنا. سيارتك تستحق أفضل حماية."
                : "Book your appointment today and get a free consultation from our experts. Your car deserves the best protection."}
            </p>
            <div style={{ display: "flex", flexWrap: "wrap" as const, gap: 12, justifyContent: "center" }}>
              <Link href="/booking" className="btn-gold">
                {isAr ? "احجز الآن" : "Book Now"}
              </Link>
              <Link href="/contact" className="btn-outline">
                {isAr ? "تواصل معنا" : "Contact Us"}
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}