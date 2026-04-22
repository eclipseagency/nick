"use client";

import { useReveal } from "@/hooks/useReveal";
import { useLanguage } from "@/i18n/LanguageContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PageHero from "@/components/PageHero";

export default function WarrantyPage() {
  const { t, locale } = useLanguage();
  const ref = useReveal([locale]);
  const isAr = locale === "ar";
  const fontDisplay = isAr ? "var(--font-ar)" : "var(--font-display)";
  const d = (ar: string, en: string) => (isAr ? ar : en);

  const gold = "#F6BE00";
  const cellBg = "rgba(10,15,30,0.85)";
  const headerBg = "linear-gradient(135deg, #F6BE00, #D4A300)";

  const services = [
    {
      group: d("النانو سيراميك", "Nano Ceramic"),
      items: [
        { name: d("نانو سيراميك داخلي", "Interior Nano Ceramic"), warranty: d("سنة واحدة", "1 year") },
        { name: d("نانو سيراميك خارجي", "Exterior Nano Ceramic"), warranty: d("١ سنة، ٣ سنوات، ٥ سنوات", "1, 3, or 5 years") },
        { name: d("نانو سيراميك زجاج كامل", "Full Glass Nano Ceramic"), warranty: d("سنة واحدة", "1 year") },
      ],
      maintenance: d(
        "كل 6 شهور على حسب فاتورة المستهلك",
        "Every 6 months based on the consumer invoice"
      ),
      conditions: [
        d("لا يسري هذا الضمان على التلف الناتج عن الحوادث أو سوء الاستخدام.", "This warranty does not cover damage caused by accidents or misuse."),
        d("تلف الغسيل الذي يسبب الخدوش بسبب عدم استخدام فوط المايكروفايبر أو عدم نظافتها.", "Wash damage causing scratches due to not using microfiber towels or using dirty ones."),
        d("أضرار الغبار أثناء السفر (السافي) أو أثار الأحجار المتطايرة في الطريق.", "Dust damage during travel (sandstorms) or flying stone impacts on the road."),
        d("استخدام مواد كيميائية تسبب تلف المنتج وعدم الإلتزام بالصيانة الدورية.", "Using chemicals that damage the product and not adhering to periodic maintenance."),
      ],
      qualityTips: [
        d("عدم غسيل السيارة لمدة لا تقل عن 7 أيام من التركيب.", "Do not wash the car for at least 7 days after installation."),
        d("إزالة فضلات الطيور في فترة لا تتجاوز 4 ساعات.", "Remove bird droppings within 4 hours."),
      ],
    },
    {
      group: d("أفلام الحماية", "Protection Films (PPF)"),
      items: [
        { name: d("أفلام حماية N-75 SPRINT", "N-75 SPRINT Protection Film"), warranty: d("١٠ سنوات", "10 years") },
        { name: d("أفلام حماية N-86 TURBO", "N-86 TURBO Protection Film"), warranty: d("١٠ سنوات", "10 years") },
        { name: d("أفلام حماية N-95 ULTRA DRIVE", "N-95 ULTRA DRIVE Protection Film"), warranty: d("١٠ سنوات", "10 years") },
        { name: d("أفلام حماية طلاء مطفي", "Matte Paint Protection Film"), warranty: d("١٠ سنوات", "10 years") },
        { name: d("أفلام حماية الديكورات الداخلية", "Interior Decoration Protection Film"), warranty: d("١٠ سنوات", "10 years") },
        { name: d("أفلام حماية الزجاج الأمامي", "Windshield Protection Film"), warranty: d("سنتين", "2 years") },
      ],
      maintenance: d(
        "تم تصنيع فلم الحماية بتقنية المعالجة الذاتية لذلك لا يتطلب صيانة دورية ويمكن الصيانة عند الحاجة والأفضل الصيانة نصف سنوي.",
        "The protection film is manufactured with self-healing technology, so it does not require periodic maintenance. Maintenance is available upon request, with semi-annual servicing being preferred."
      ),
      conditions: [
        d("لا يسري هذا الضمان على التلف الناتج عن حطام الطريق أو الرمال المتطايرة أو المركبات الأخرى.", "This warranty does not cover damage from road debris, other vehicles, or flying sand."),
        d("لا يسري هذا الضمان على التلف الناتج عن الحوادث أو سوء الاستخدام و انفصال الطبقات أو الفقاعات الناتجة عن الغسيل.", "This warranty does not cover damage from accidents, misuse, layer separation, or bubbles resulting from washing."),
        d("تضمن NICK عدم حدوث أي ضرر للطلاء عند تركيب أو إزالة أفلام حماية NICK، ويستثنى من ذلك الأجزاء المعاد طلائها.", "NICK guarantees no damage to the paint upon installation or removal of NICK protection films, excluding repainted parts."),
        d("يسري الضمان حصراً في حال التركيب في مراكز NICK المعتمدة للعناية بالسيارات وفقاً لإجراءات التركيب الموصي بها . ويمكن التنازل عن هذا الضمان. شريطة أن يمتلك المالك مستندات الضمان الأصلية.", "The warranty applies exclusively when installation is performed at NICK authorized care centers following recommended installation procedures. The warranty is transferable, provided the owner possesses the original warranty documents."),
        d("ضمان أفلام الحماية لمدة 10 سنوات أو حتى 300,000 كم أيهما أسبق.", "Protection film warranty for 10 years or up to 300,000 km, whichever comes first."),
        d("عدم غسيل السيارة بعد التركيب لمدة لا تقل عن 7 أيام من التركيب.", "Do not wash the car for at least 7 days after installation."),
        d("الفلم يخضع للمعالجة الذاتية في فترة 15 يوم على الأقل.", "The film undergoes self-healing within a period of at least 15 days."),
      ],
      qualityTips: [
        d("يرجى عدم السفر بالسيارة مباشرة بعد التركيب.", "Please do not travel with the car immediately after installation."),
        d("عدم غسيل السيارة لمدة لا تقل عن 7 أيام من التركيب.", "Do not wash the car for at least 7 days after installation."),
        d("الابتعاد أثناء الغسيل بالضغط العالي عن أطراف فيلم الحماية المحيطة بالأربع كفرات (عجلات المركبة).", "Keep distance during high-pressure washing from the edges of the protection film surrounding the four wheel arches."),
      ],
    },
    {
      group: d("العازل الحراري", "Thermal Tint"),
      items: [
        { name: d("عازل حراري Plus", "Thermal Tint Plus"), warranty: d("١٠ سنوات", "10 years") },
        { name: d("عازل حراري Flex", "Thermal Tint Flex"), warranty: d("٨ سنوات", "8 years") },
        { name: d("عازل حراري Lite", "Thermal Tint Lite"), warranty: d("٥ سنوات", "5 years") },
        { name: d("عازل حراري أمامي Max", "Front Thermal Tint Max"), warranty: d("١٠ سنوات", "10 years") },
        { name: d("عازل حراري أمامي Pro", "Front Thermal Tint Pro"), warranty: d("١٠ سنوات", "10 years") },
      ],
      maintenance: d(
        "لا يتطلب صيانة دورية\nويمكن طلب الصيانة عند الحاجة",
        "No periodic maintenance required\nMaintenance available upon request"
      ),
      conditions: [
        d("تضمن شركة NICK أفلام العازل الحراري لنوافذ السيارات ما يلي:", "NICK guarantees the following for automotive thermal tint films:"),
        d("الاحتفاظ بخواص انعكاس أشعة الشمس دون حدوث تشققات أو تصدعات بالفلم.", "Maintaining sun reflection properties without cracks or fractures in the film."),
        d("الحفاظ على الالتصاق دون فقاعات أو الانفصال عن الزجاج.", "Maintaining adhesion without bubbles or separation from the glass."),
        d("ثبات لون العازل الحراري.", "Color stability of the thermal tint."),
        d("يعتبر الضمان لاغي في حالة خضوع المنتج لسوء الاستخدام أو العناية الغير صحيحة.", "The warranty is void if the product is subjected to misuse or improper care."),
        d("إذا ظهر ضبابي بعد التركيب، فهو مؤقت بسبب الرطوبة، ويختفي بعد جفافها.", "If haze appears after installation, it is temporary due to moisture and disappears after drying."),
        d("ضمان حماية أفلام زجاج أمامي لمدة سنتين أو حتى 60,000 كم أيهما أسبق.", "Windshield film protection warranty for 2 years or up to 60,000 km, whichever comes first."),
        d("إدارة المرور هي المسؤولة عن تحديد نسب التظليل المسموحة، وشركة NICK لا تتحمل أي مسؤولية قانونية، ويجب على المستهلكين الاطلاع على القوانين المحلية.", "The traffic department is responsible for determining permitted tint percentages. NICK bears no legal responsibility, and consumers must review local laws."),
      ],
      qualityTips: [
        d("يرجى عدم فتح النوافذ خلال 48 ساعة من تركيب الفلم.", "Please do not open windows for 48 hours after film installation."),
        d("عدم تنظيف الزجاج لمدة لا تقل عن 7 أيام من التركيب، وعدم لمس أطراف الفلم.", "Do not clean the glass for at least 7 days after installation, and do not touch the film edges."),
      ],
    },
  ];

  return (
    <main ref={ref}>
      <Navbar />
      <PageHero
        image="/images/DSC03261.jpg"
        badge={t.warranty.badge}
        heading1={t.warranty.heading1}
        heading2={t.warranty.heading2}
        subtitle={t.warranty.subtitle}
      />

      {/* Intro Section */}
      <section style={{ padding: "clamp(48px, 8vw, 80px) 0 32px", background: "#050505" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "0 24px", textAlign: "center" }} className="reveal">
          <div style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 12,
            background: "rgba(246,190,0,0.06)",
            border: "1px solid rgba(246,190,0,0.15)",
            borderRadius: 50,
            padding: "8px 24px",
            marginBottom: 24,
          }}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={gold} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              <path d="M9 12l2 2 4-4" />
            </svg>
            <span style={{ color: gold, fontSize: 13, fontWeight: 600, fontFamily: fontDisplay }}>{t.warranty.badge}</span>
          </div>

          <p style={{
            fontSize: "clamp(16px, 2.5vw, 20px)",
            color: "rgba(255,255,255,0.7)",
            lineHeight: 1.8,
            maxWidth: 800,
            margin: "0 auto 8px",
            fontFamily: fontDisplay,
          }}>
            {d(
              "شكراً لثقتكم في NICK المطورة وفق أفضل التقنيات العالمية.",
              "Thank you for trusting NICK, developed with the best global technologies."
            )}
          </p>
          <p style={{
            fontSize: "clamp(14px, 2vw, 17px)",
            color: "rgba(255,255,255,0.5)",
            lineHeight: 1.8,
            maxWidth: 800,
            margin: "0 auto 8px",
          }}>
            {d(
              "تضمن NICK تقديم منتج خالي من عيوب التصنيع والتركيب ليصل إلى العميل بجودة عالية.",
              "NICK guarantees a product free from manufacturing and installation defects, delivering the highest quality to our customers."
            )}
          </p>
          <p style={{
            fontSize: "clamp(14px, 2vw, 16px)",
            color: gold,
            fontWeight: 600,
            fontFamily: fontDisplay,
          }}>
            {d("يسري هذا الضمان وفق الآتي:", "This warranty applies as follows:")}
          </p>
        </div>
      </section>

      {/* Warranty Cards Section */}
      <section style={{ padding: "24px 0 clamp(48px, 8vw, 80px)", background: "#050505" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 16px", direction: isAr ? "rtl" : "ltr" }} className="reveal">
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            {services.map((group, gi) => (
              <div key={gi} style={{
                background: cellBg,
                border: "1px solid rgba(246,190,0,0.2)",
                borderRadius: 16,
                overflow: "hidden",
              }}>
                {/* Group Header */}
                <div style={{
                  background: headerBg,
                  padding: "14px 20px",
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0a0a0a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  </svg>
                  <span style={{ color: "#0a0a0a", fontWeight: 700, fontSize: "clamp(15px, 3vw, 18px)", fontFamily: fontDisplay }}>
                    {group.group}
                  </span>
                </div>

                <div style={{ padding: "16px 20px" }}>
                  {/* Services List */}
                  <div style={{ marginBottom: 20 }}>
                    {group.items.map((item, ii) => (
                      <div key={ii} style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: "10px 0",
                        borderBottom: ii < group.items.length - 1 ? "1px solid rgba(255,255,255,0.06)" : "none",
                        gap: 12,
                      }}>
                        <span style={{ color: "#fff", fontWeight: 600, fontSize: "clamp(13px, 2.5vw, 14px)" }}>{item.name}</span>
                        <span style={{
                          color: gold,
                          fontWeight: 700,
                          fontSize: "clamp(12px, 2.5vw, 14px)",
                          fontFamily: fontDisplay,
                          whiteSpace: "nowrap",
                          background: "rgba(246,190,0,0.08)",
                          padding: "4px 10px",
                          borderRadius: 20,
                          border: "1px solid rgba(246,190,0,0.15)",
                          flexShrink: 0,
                        }}>
                          {item.warranty}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Maintenance */}
                  <div style={{
                    background: "rgba(246,190,0,0.04)",
                    border: "1px solid rgba(246,190,0,0.12)",
                    borderRadius: 12,
                    padding: "14px 16px",
                    marginBottom: 16,
                  }}>
                    <p style={{ color: gold, fontWeight: 700, fontSize: 13, marginBottom: 8, fontFamily: fontDisplay }}>
                      {d("الصيانة", "Maintenance")}
                    </p>
                    {group.maintenance.split("\n").map((line, i) => (
                      <p key={i} style={{ color: "rgba(255,255,255,0.7)", fontSize: 13, lineHeight: 1.7, margin: i > 0 ? "6px 0 0" : 0 }}>{line}</p>
                    ))}
                  </div>

                  {/* Conditions */}
                  <div style={{ marginBottom: group.qualityTips.length > 0 ? 16 : 0 }}>
                    <p style={{ color: gold, fontWeight: 700, fontSize: 13, marginBottom: 10, fontFamily: fontDisplay }}>
                      {d("الشروط والأحكام", "Terms & Conditions")}
                    </p>
                    {/* First condition as standalone line */}
                    {group.conditions.length > 0 && (
                      <p style={{ color: "rgba(255,255,255,0.65)", fontSize: 13, lineHeight: 1.7, marginBottom: 8 }}>
                        {group.conditions[0]}
                      </p>
                    )}
                    {/* Remaining conditions as bullet points */}
                    {group.conditions.slice(1).map((c, i) => (
                      <p key={i} style={{ color: "rgba(255,255,255,0.65)", fontSize: 13, lineHeight: 1.7, margin: i > 0 ? "8px 0 0" : 0, display: "flex", gap: 8 }}>
                        <span style={{ color: gold, flexShrink: 0 }}>&#x2022;</span>
                        <span>{c}</span>
                      </p>
                    ))}
                  </div>

                  {/* Quality Tips */}
                  {group.qualityTips.length > 0 && (
                    <div style={{
                      background: "rgba(246,190,0,0.04)",
                      border: "1px solid rgba(246,190,0,0.12)",
                      borderRadius: 12,
                      padding: "14px 16px",
                    }}>
                      <p style={{ color: gold, fontWeight: 700, fontSize: 13, marginBottom: 8, fontFamily: fontDisplay }}>
                        {d("لضمان جودة المنتج :", "To ensure product quality:")}
                      </p>
                      {group.qualityTips.map((tip, i) => (
                        <p key={i} style={{ color: "rgba(255,255,255,0.7)", fontSize: 13, lineHeight: 1.7, margin: i > 0 ? "6px 0 0" : 0, display: "flex", gap: 8 }}>
                          <span style={{ color: gold, flexShrink: 0 }}>&#x2022;</span>
                          <span>{tip}</span>
                        </p>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Footer notes */}
          <div style={{ marginTop: 20, padding: "0 8px" }}>
            <p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", lineHeight: 1.8, marginBottom: 6 }}>
              <span style={{ color: gold }}>*</span>{" "}
              {d(
                "يجب على العميل الالتزام بجدول الصيانة كما هو محدد في الضمان. سيؤدي عدم إكمال الصيانة اللازمة إلى تحمل العميل المسؤولية عن التكلفة الكاملة للإصلاح وإعادة الخدمات.",
                "The customer must adhere to the maintenance schedule as specified in the warranty. Failure to complete the required maintenance will result in the customer being responsible for the full cost of repairs and service restoration."
              )}
            </p>
            <p style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", lineHeight: 1.8 }}>
              <span style={{ color: gold }}>**</span>{" "}
              {d(
                "قد يتطلب دفع رسوم لإكمال الصيانة وفقاً لتقاسيمنا.",
                "Maintenance completion fees may apply based on our assessment."
              )}
            </p>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
