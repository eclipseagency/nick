"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PageHero from "@/components/PageHero";
import { useReveal } from "@/hooks/useReveal";
import { useLanguage } from "@/i18n/LanguageContext";

export default function ContactPage() {
  const { t, locale, dir } = useLanguage();
  const ref = useReveal([locale]);
  const isAr = locale === "ar";
  const fontDisplay = isAr ? "var(--font-ar)" : "var(--font-display)";
  const gradientDir = dir === "rtl" ? "to left" : "to right";

  const [form, setForm] = useState({ name: "", email: "", phone: "", service: "", message: "" });
  const [submitted, setSubmitted] = useState(false);

  const inputStyle: React.CSSProperties = {
    width: "100%", padding: "14px 18px", borderRadius: 12,
    background: "#111", border: "1px solid rgba(255,255,255,0.08)",
    color: "#fff", fontSize: 15, outline: "none",
    transition: "border-color 0.2s, box-shadow 0.2s",
  };

  const onFocus = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    e.currentTarget.style.borderColor = "#F6BE00";
    e.currentTarget.style.boxShadow = "0 0 0 3px rgba(246,190,0,0.1)";
  };
  const onBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)";
    e.currentTarget.style.boxShadow = "none";
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const msg = `Name: ${form.name}%0AEmail: ${form.email}%0APhone: ${form.phone}%0AService: ${form.service}%0AMessage: ${form.message}`;
    window.open(`https://wa.me/966543000055?text=${msg}`, "_blank");
    setSubmitted(true);
  };

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    name: "Contact NICK",
    description: "Get in touch with NICK for automotive protection services in Riyadh, Saudi Arabia.",
    url: "https://nick.sa/contact",
    mainEntity: { "@id": "https://nick.sa/#business" },
    breadcrumb: {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: "https://nick.sa" },
        { "@type": "ListItem", position: 2, name: "Contact", item: "https://nick.sa/contact" },
      ],
    },
  };

  return (
    <main ref={ref}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Navbar />
      <PageHero
        image="/images/DSC03261.jpg"
        heading1={t.contact.heading1}
        heading2={t.contact.heading2}
        subtitle={t.contact.subtitle}
      />

      {/* ── Contact Info Cards ── */}
      <section style={{ padding: "clamp(48px, 8vw, 80px) 0 0" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 clamp(16px, 4vw, 24px)" }}>
          <div className="reveal" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(260px, 100%), 1fr))", gap: "clamp(16px, 3vw, 24px)" }}>
            {/* Location */}
            <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 16, padding: "clamp(24px, 4vw, 36px) clamp(16px, 3vw, 28px)", textAlign: "center", transition: "border-color 0.3s" }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = "rgba(246,190,0,0.3)")}
              onMouseLeave={e => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)")}>
              <div style={{ width: 56, height: 56, borderRadius: "50%", background: "rgba(246,190,0,0.1)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#F6BE00" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
              </div>
              <div style={{ color: "#F6BE00", fontSize: 11, fontWeight: 600, textTransform: isAr ? "none" : "uppercase" as const, letterSpacing: isAr ? "0" : "0.08em", marginBottom: 8 }}>
                {t.contact.locationLabel}
              </div>
              <div style={{ color: "rgba(255,255,255,0.7)", fontSize: 15 }}>
                {t.contact.addressValue}
              </div>
              <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 13, marginTop: 4 }}>
                {t.contact.locationValue}
              </div>
            </div>

            {/* Phone */}
            <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 16, padding: "clamp(24px, 4vw, 36px) clamp(16px, 3vw, 28px)", textAlign: "center", transition: "border-color 0.3s" }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = "rgba(246,190,0,0.3)")}
              onMouseLeave={e => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)")}>
              <div style={{ width: 56, height: 56, borderRadius: "50%", background: "rgba(246,190,0,0.1)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#F6BE00" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z" />
                </svg>
              </div>
              <div style={{ color: "#F6BE00", fontSize: 11, fontWeight: 600, textTransform: isAr ? "none" : "uppercase" as const, letterSpacing: isAr ? "0" : "0.08em", marginBottom: 8 }}>
                {isAr ? "الهاتف" : "Phone"}
              </div>
              <a href="tel:+966543000055" style={{ color: "rgba(255,255,255,0.7)", fontSize: 15, textDecoration: "none" }} dir="ltr">
                +966 54 300 0055
              </a>
            </div>

            {/* Working Hours */}
            <div style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 16, padding: "clamp(24px, 4vw, 36px) clamp(16px, 3vw, 28px)", textAlign: "center", transition: "border-color 0.3s" }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = "rgba(246,190,0,0.3)")}
              onMouseLeave={e => (e.currentTarget.style.borderColor = "rgba(255,255,255,0.06)")}>
              <div style={{ width: 56, height: 56, borderRadius: "50%", background: "rgba(246,190,0,0.1)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 20px" }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#F6BE00" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
              </div>
              <div style={{ color: "#F6BE00", fontSize: 11, fontWeight: 600, textTransform: isAr ? "none" : "uppercase" as const, letterSpacing: isAr ? "0" : "0.08em", marginBottom: 8 }}>
                {isAr ? "ساعات العمل" : "Working Hours"}
              </div>
              <div style={{ color: "rgba(255,255,255,0.7)", fontSize: 15, lineHeight: 1.8 }}>
                {isAr ? "الأحد - الخميس: ٩ ص - ٩ م" : "Sun - Thu: 9 AM - 9 PM"}<br />
                {isAr ? "الجمعة - السبت: ٢ م - ٩ م" : "Fri - Sat: 2 PM - 9 PM"}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Map Section ── */}
      <section style={{ padding: "clamp(48px, 8vw, 80px) 0" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 clamp(16px, 4vw, 24px)" }}>
          <div className="reveal" style={{ textAlign: "center", marginBottom: 40 }}>
            <span className="section-badge">{isAr ? "موقعنا" : "Our Location"}</span>
            <h2 style={{ fontFamily: fontDisplay, fontSize: "clamp(24px, 4vw, 36px)", fontWeight: 700, color: "#fff", marginTop: 16 }}>
              {isAr ? "تجدنا في " : "Find Us in "}
              <span className="gold-text">{isAr ? "الرياض" : "Riyadh"}</span>
            </h2>
          </div>
          <div className="reveal" style={{ borderRadius: 16, overflow: "hidden", border: "1px solid rgba(246,190,0,0.25)" }}>
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d1810.25!2d46.6846706!3d24.8361322!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3e2efb98afe87757%3A0xff5e5750a8dfbb71!2sNick%20RIYADH!5e0!3m2!1sen!2ssa!4v1709900000000"
              width="100%" height="300" style={{ border: 0, display: "block", maxHeight: "50vh" }}
              allowFullScreen loading="lazy" referrerPolicy="no-referrer-when-downgrade"
              title="NICK Location - Riyadh"
            />
          </div>
        </div>
      </section>

      {/* ── Contact Form ── */}
      <section style={{ padding: "0 0 clamp(48px, 8vw, 80px)" }}>
        <div style={{ maxWidth: 720, margin: "0 auto", padding: "0 clamp(16px, 4vw, 24px)" }}>
          <div className="reveal" style={{ textAlign: "center", marginBottom: 40 }}>
            <span className="section-badge">{isAr ? "تواصل معنا" : "Get in Touch"}</span>
            <h2 style={{ fontFamily: fontDisplay, fontSize: "clamp(24px, 4vw, 36px)", fontWeight: 700, color: "#fff", marginTop: 16 }}>
              {isAr ? "أرسل لنا " : "Send Us a "}
              <span className="gold-text">{isAr ? "رسالة" : "Message"}</span>
            </h2>
          </div>

          <form onSubmit={handleSubmit} className="reveal" style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 20, padding: "clamp(28px, 4vw, 48px)" }}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(220px, 100%), 1fr))", gap: 16, marginBottom: 16 }}>
              <input
                type="text" required value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                placeholder={isAr ? "الاسم الكامل" : "Full Name"}
                onFocus={onFocus} onBlur={onBlur}
                style={inputStyle}
              />
              <input
                type="email" required value={form.email}
                onChange={e => setForm({ ...form, email: e.target.value })}
                placeholder={isAr ? "البريد الإلكتروني" : "Email Address"}
                onFocus={onFocus} onBlur={onBlur}
                style={inputStyle}
              />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(220px, 100%), 1fr))", gap: 16, marginBottom: 16 }}>
              <input
                type="tel" value={form.phone}
                onChange={e => setForm({ ...form, phone: e.target.value })}
                placeholder={isAr ? "رقم الهاتف" : "Phone Number"}
                dir="ltr"
                onFocus={onFocus} onBlur={onBlur}
                style={{ ...inputStyle, textAlign: "left" as const }}
              />
              <select
                value={form.service}
                onChange={e => setForm({ ...form, service: e.target.value })}
                onFocus={onFocus as unknown as React.FocusEventHandler<HTMLSelectElement>}
                onBlur={onBlur as unknown as React.FocusEventHandler<HTMLSelectElement>}
                style={{ ...inputStyle, appearance: "none" as const, cursor: "pointer", color: form.service ? "#fff" : "rgba(255,255,255,0.4)" }}
              >
                <option value="" disabled style={{ background: "#111", color: "rgba(255,255,255,0.4)" }}>
                  {isAr ? "اختر الخدمة" : "Service Interest"}
                </option>
                <option value="ppf" style={{ background: "#111", color: "#fff" }}>
                  {isAr ? "حماية طلاء المركبات (PPF)" : "Paint Protection Film (PPF)"}
                </option>
                <option value="tint" style={{ background: "#111", color: "#fff" }}>
                  {isAr ? "تظليل النوافذ" : "Window Tinting"}
                </option>
                <option value="ceramic" style={{ background: "#111", color: "#fff" }}>
                  {isAr ? "طلاء سيراميك" : "Ceramic Coating"}
                </option>
                <option value="wrapping" style={{ background: "#111", color: "#fff" }}>
                  {isAr ? "تغليف المركبات" : "Vehicle Wrapping"}
                </option>
                <option value="other" style={{ background: "#111", color: "#fff" }}>
                  {isAr ? "أخرى" : "Other"}
                </option>
              </select>
            </div>

            <textarea
              required value={form.message}
              onChange={e => setForm({ ...form, message: e.target.value })}
              placeholder={isAr ? "رسالتك..." : "Your message..."}
              rows={5}
              onFocus={onFocus as unknown as React.FocusEventHandler<HTMLTextAreaElement>}
              onBlur={onBlur as unknown as React.FocusEventHandler<HTMLTextAreaElement>}
              style={{ ...inputStyle, resize: "none" as const, marginBottom: 24 }}
            />

            <button type="submit" className="btn-gold" style={{ width: "100%", padding: "16px 32px", fontSize: 16, fontWeight: 600, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", gap: 10 }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13" />
                <polygon points="22 2 15 22 11 13 2 9 22 2" />
              </svg>
              {isAr ? "إرسال الرسالة" : "Send Message"}
            </button>

            {submitted && (
              <div style={{ marginTop: 20, padding: "16px 20px", borderRadius: 12, background: "rgba(246,190,0,0.08)", border: "1px solid rgba(246,190,0,0.2)", textAlign: "center" }}>
                <span style={{ color: "#F6BE00", fontSize: 14, fontWeight: 500 }}>
                  {isAr ? "شكراً! تم إرسال رسالتك بنجاح." : "Thank you! Your message has been sent successfully."}
                </span>
              </div>
            )}
          </form>
        </div>
      </section>

      {/* ── Social / Quick Links ── */}
      <section style={{ padding: "0 0 clamp(60px, 8vw, 96px)" }}>
        <div style={{ maxWidth: 720, margin: "0 auto", padding: "0 clamp(16px, 4vw, 24px)" }}>
          <div className="reveal" style={{ textAlign: "center" }}>
            <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 14, marginBottom: 24 }}>
              {isAr ? "أو تواصل معنا عبر" : "Or reach us via"}
            </p>
            <div style={{ display: "flex", justifyContent: "center", gap: 16, flexWrap: "wrap" }}>
              {/* WhatsApp */}
              <Link href="https://wa.me/966543000055" target="_blank"
                style={{ width: 56, height: 56, borderRadius: "50%", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.3s", color: "rgba(255,255,255,0.5)" }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = "#25D366"; e.currentTarget.style.color = "#25D366"; e.currentTarget.style.background = "rgba(37,211,102,0.08)"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"; e.currentTarget.style.color = "rgba(255,255,255,0.5)"; e.currentTarget.style.background = "rgba(255,255,255,0.04)"; }}>
                <svg width="22" height="22" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>
              </Link>

              {/* Instagram */}
              <Link href="https://www.instagram.com/nick_saudi" target="_blank"
                style={{ width: 56, height: 56, borderRadius: "50%", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.3s", color: "rgba(255,255,255,0.5)" }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = "#E4405F"; e.currentTarget.style.color = "#E4405F"; e.currentTarget.style.background = "rgba(228,64,95,0.08)"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"; e.currentTarget.style.color = "rgba(255,255,255,0.5)"; e.currentTarget.style.background = "rgba(255,255,255,0.04)"; }}>
                <svg width="22" height="22" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" /></svg>
              </Link>

              {/* X / Twitter */}
              <Link href="https://x.com/nick__saudi" target="_blank"
                style={{ width: 56, height: 56, borderRadius: "50%", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.3s", color: "rgba(255,255,255,0.5)" }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = "#fff"; e.currentTarget.style.color = "#fff"; e.currentTarget.style.background = "rgba(255,255,255,0.08)"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"; e.currentTarget.style.color = "rgba(255,255,255,0.5)"; e.currentTarget.style.background = "rgba(255,255,255,0.04)"; }}>
                <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
              </Link>

              {/* TikTok */}
              <Link href="https://www.tiktok.com/@nick_saudi" target="_blank"
                style={{ width: 56, height: 56, borderRadius: "50%", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.3s", color: "rgba(255,255,255,0.5)" }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = "#00f2ea"; e.currentTarget.style.color = "#00f2ea"; e.currentTarget.style.background = "rgba(0,242,234,0.08)"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"; e.currentTarget.style.color = "rgba(255,255,255,0.5)"; e.currentTarget.style.background = "rgba(255,255,255,0.04)"; }}>
                <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 00-.79-.05A6.34 6.34 0 003.15 15.2a6.34 6.34 0 0010.86 4.46V13a8.28 8.28 0 005.58 2.15v-3.44a4.85 4.85 0 01-1.99-.43 4.83 4.83 0 01-1.79-1.38V6.69h3.78z"/></svg>
              </Link>

              {/* nick.sa Website */}
              <Link href="https://nick.sa" target="_blank"
                style={{ height: 56, borderRadius: 28, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "0 24px", transition: "all 0.3s", color: "rgba(255,255,255,0.5)", fontSize: 14, fontWeight: 600, textDecoration: "none" }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = "#F6BE00"; e.currentTarget.style.color = "#F6BE00"; e.currentTarget.style.background = "rgba(246,190,0,0.06)"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)"; e.currentTarget.style.color = "rgba(255,255,255,0.5)"; e.currentTarget.style.background = "rgba(255,255,255,0.04)"; }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="2" y1="12" x2="22" y2="12" />
                  <path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
                </svg>
                nick.sa
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
