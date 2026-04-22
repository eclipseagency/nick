"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useLanguage } from "@/i18n/LanguageContext";

export default function TermsPage() {
  const { locale } = useLanguage();
  const isAr = locale === "ar";
  const dir = isAr ? "rtl" : "ltr";
  const lastUpdated = isAr ? "20 أبريل 2026" : "April 20, 2026";

  const sections = isAr ? [
    { h: "1. قبول الشروط", p: "باستخدامك لموقع nick.sa أو حجز خدمة، فإنك توافق على هذه الشروط والأحكام. إذا لم توافق، يرجى عدم استخدام خدماتنا." },
    { h: "2. الخدمات", p: "نقدم خدمات حماية السيارات بما في ذلك أفلام حماية الطلاء (PPF)، طلاء النانو سيراميك، العزل الحراري، وتغليف الألوان. جميع الخدمات تتم في معرضنا في الرياض وفقًا لمواعيد الحجز." },
    { h: "3. الحجز والإلغاء", p: "يمكنك حجز موعد عبر الموقع. يمكن تعديل الموعد أو إلغاؤه مجانًا قبل 24 ساعة على الأقل من الموعد المحدد. الحجوزات المؤكدة بدفع مسبق تخضع لسياسة الاسترداد المذكورة أدناه." },
    { h: "4. الأسعار والدفع", p: "جميع الأسعار بالريال السعودي وتشمل ضريبة القيمة المضافة. الدفع متاح نقدًا في المعرض، بالبطاقة عبر Neoleap، أو بالتقسيط عبر Tabby و Tamara. الأسعار قابلة للتغيير دون إشعار مسبق، لكن سعر الحجز المؤكد لا يتغير." },
    { h: "5. الضمان", p: "نقدم ضمانات تتراوح من سنة إلى 10 سنوات حسب الخدمة. الضمان يغطي عيوب التصنيع والتركيب فقط، ولا يشمل الأضرار الناتجة عن سوء الاستخدام، الحوادث، أو الظروف الخارجية. تفاصيل الضمان الكاملة تتوفر مع كل خدمة." },
    { h: "6. الاسترداد", p: "للحجوزات المدفوعة مسبقًا والتي تم إلغاؤها قبل 48 ساعة من الموعد، يتم استرداد كامل المبلغ. الإلغاء خلال 24-48 ساعة يستحق استرداد 50%. الإلغاء أقل من 24 ساعة لا يحق له الاسترداد." },
    { h: "7. مسؤولية العميل", p: "العميل مسؤول عن: تقديم معلومات صحيحة عند الحجز، الحضور في الموعد المحدد، تسليم سيارة نظيفة وجاهزة للعمل عليها، إبلاغنا بأي عيوب موجودة مسبقًا في الطلاء." },
    { h: "8. حدود المسؤولية", p: "مسؤوليتنا محدودة بقيمة الخدمة المقدمة. نحن غير مسؤولين عن: عيوب موجودة مسبقًا في الطلاء، أضرار ناتجة عن استخدام مواد غير معتمدة، التأخير الناتج عن ظروف خارجة عن إرادتنا." },
    { h: "9. القانون المعمول به", p: "تخضع هذه الشروط لقوانين المملكة العربية السعودية. أي نزاع يتم حله عبر المحاكم المختصة في الرياض." },
    { h: "10. تواصل", p: "لأي استفسارات حول هذه الشروط: info@nick.sa | +966 54 300 0055" },
  ] : [
    { h: "1. Acceptance of Terms", p: "By using nick.sa or booking a service, you agree to these terms and conditions. If you do not agree, please do not use our services." },
    { h: "2. Services", p: "We provide automotive protection services including paint protection film (PPF), nano ceramic coating, thermal insulation tinting, and color wrapping. All services are performed at our showroom in Riyadh by appointment." },
    { h: "3. Booking and Cancellation", p: "You may book an appointment through our website. Appointments can be rescheduled or cancelled free of charge at least 24 hours before the scheduled time. Prepaid confirmed bookings are subject to the refund policy below." },
    { h: "4. Pricing and Payment", p: "All prices are in Saudi Riyal and include VAT. Payment is available via cash at the shop, card through Neoleap, or installments through Tabby and Tamara. Prices may change without prior notice, but the price of a confirmed booking is locked." },
    { h: "5. Warranty", p: "We provide warranties ranging from 1 to 10 years depending on the service. Warranty covers manufacturing and installation defects only, and does not include damage from misuse, accidents, or external conditions. Full warranty details are provided with each service." },
    { h: "6. Refunds", p: "For prepaid bookings cancelled at least 48 hours before the appointment, a full refund is issued. Cancellation within 24-48 hours qualifies for a 50% refund. Cancellations less than 24 hours before are non-refundable." },
    { h: "7. Customer Responsibility", p: "The customer is responsible for: providing accurate information when booking, arriving at the scheduled time, delivering a clean and ready vehicle, notifying us of any pre-existing paint defects." },
    { h: "8. Limitation of Liability", p: "Our liability is limited to the value of the service provided. We are not responsible for: pre-existing paint defects, damage caused by use of unapproved materials, delays caused by circumstances outside our control." },
    { h: "9. Governing Law", p: "These terms are governed by the laws of the Kingdom of Saudi Arabia. Any dispute is resolved through the competent courts in Riyadh." },
    { h: "10. Contact", p: "For any questions about these terms: info@nick.sa | +966 54 300 0055" },
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
            {isAr ? "الشروط والأحكام" : "Terms & Conditions"}
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
