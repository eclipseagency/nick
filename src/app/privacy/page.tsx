"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useLanguage } from "@/i18n/LanguageContext";

export default function PrivacyPage() {
  const { locale } = useLanguage();
  const isAr = locale === "ar";
  const dir = isAr ? "rtl" : "ltr";
  const lastUpdated = isAr ? "20 أبريل 2026" : "April 20, 2026";

  const sections = isAr ? [
    { h: "1. المعلومات التي نجمعها", p: "نجمع المعلومات التي تقدمها مباشرة عند الحجز، بما في ذلك: الاسم، رقم الجوال، تفاصيل السيارة (الموديل، السنة، اللون، الحجم)، الموعد المفضل، والملاحظات. كما نجمع معلومات تقنية تلقائيًا مثل عنوان IP، نوع المتصفح، والصفحات التي تزورها." },
    { h: "2. كيف نستخدم معلوماتك", p: "نستخدم معلوماتك لتأكيد ومعالجة حجوزاتك، التواصل معك بخصوص خدماتنا، تحسين تجربتك على موقعنا، إرسال تأكيدات وتذكيرات، ومعالجة المدفوعات عبر بوابة الدفع المعتمدة." },
    { h: "3. مشاركة المعلومات", p: "لا نبيع معلوماتك لأي طرف ثالث. قد نشارك معلومات محدودة مع: مزودي خدمات الدفع (Neoleap، Tabby، Tamara) لمعالجة المدفوعات، ومزودي البنية التحتية (Vercel، Supabase) لتشغيل الموقع." },
    { h: "4. الأمان", p: "نطبق إجراءات أمان مناسبة لحماية معلوماتك. تتم معالجة المدفوعات عبر بوابات دفع مشفرة معتمدة من البنك المركزي السعودي. لا نخزن أي بيانات بطاقات ائتمان على خوادمنا." },
    { h: "5. حقوقك", p: "لديك الحق في: الاطلاع على المعلومات التي نحتفظ بها عنك، طلب تصحيحها أو حذفها، إلغاء الاشتراك من الاتصالات التسويقية. للممارسة هذه الحقوق، تواصل معنا على info@nick.sa." },
    { h: "6. ملفات تعريف الارتباط (Cookies)", p: "نستخدم ملفات تعريف الارتباط لتذكر تفضيلات اللغة وتحسين تجربتك. يمكنك تعطيلها من إعدادات المتصفح، لكن قد يؤثر ذلك على بعض وظائف الموقع." },
    { h: "7. الاحتفاظ بالبيانات", p: "نحتفظ ببيانات الحجز للمدة اللازمة لتقديم الخدمة والامتثال لمتطلبات المحاسبة والقانون في المملكة العربية السعودية." },
    { h: "8. تعديلات السياسة", p: "قد نحدث هذه السياسة من وقت لآخر. سيتم نشر التغييرات على هذه الصفحة مع تاريخ آخر تحديث." },
    { h: "9. تواصل معنا", p: "للاستفسارات حول الخصوصية: البريد: info@nick.sa | الهاتف: +966 54 300 0055 | العنوان: حي النرجس، طريق أنس بن مالك، الرياض." },
  ] : [
    { h: "1. Information We Collect", p: "We collect information you provide directly when making a booking, including: name, phone number, vehicle details (make, year, color, size), preferred date, and notes. We also automatically collect technical information such as IP address, browser type, and pages visited." },
    { h: "2. How We Use Your Information", p: "We use your information to confirm and process bookings, communicate about our services, improve your experience on our site, send confirmations and reminders, and process payments through our payment gateway." },
    { h: "3. Information Sharing", p: "We do not sell your information to third parties. We may share limited information with: payment providers (Neoleap, Tabby, Tamara) to process payments, and infrastructure providers (Vercel, Supabase) to operate the site." },
    { h: "4. Security", p: "We apply appropriate security measures to protect your information. Payments are processed through encrypted gateways approved by the Saudi Central Bank. We do not store any credit card data on our servers." },
    { h: "5. Your Rights", p: "You have the right to: access the information we hold about you, request its correction or deletion, opt out of marketing communications. To exercise these rights, contact us at info@nick.sa." },
    { h: "6. Cookies", p: "We use cookies to remember language preferences and improve your experience. You can disable them in your browser settings, but this may affect some site functionality." },
    { h: "7. Data Retention", p: "We retain booking data for the period necessary to provide the service and comply with accounting and legal requirements in Saudi Arabia." },
    { h: "8. Policy Updates", p: "We may update this policy from time to time. Changes will be posted on this page with the last updated date." },
    { h: "9. Contact Us", p: "For privacy inquiries: Email: info@nick.sa | Phone: +966 54 300 0055 | Address: Al-Nargis District, Anas Ibn Malik Rd, Riyadh." },
  ];

  return (
    <main dir={dir}>
      <Navbar />
      <section style={{ padding: "120px 0 80px", background: "#050505", minHeight: "100vh" }}>
        <div style={{ maxWidth: 760, margin: "0 auto", padding: "0 24px" }}>
          <h1 style={{
            fontFamily: isAr ? "var(--font-ar)" : "var(--font-display)",
            fontSize: "clamp(32px, 6vw, 48px)", fontWeight: 700, color: "#fff",
            marginBottom: 8,
          }}>
            {isAr ? "سياسة الخصوصية" : "Privacy Policy"}
          </h1>
          <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 13, marginBottom: 40 }}>
            {isAr ? "آخر تحديث: " : "Last updated: "}{lastUpdated}
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
            {sections.map((s) => (
              <article key={s.h}>
                <h2 style={{ color: "#F6BE00", fontSize: 18, fontWeight: 700, marginBottom: 8 }}>{s.h}</h2>
                <p style={{ color: "rgba(255,255,255,0.7)", fontSize: 14, lineHeight: 1.8 }}>{s.p}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}
