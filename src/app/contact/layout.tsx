import type { Metadata } from "next";

const siteUrl = "https://nick-fawn.vercel.app";

export const metadata: Metadata = {
  title: "Contact Us — Visit Our Showroom in Riyadh",
  description:
    "Contact NICK for automotive protection services. Visit our showroom in Al-Nargis District, Riyadh. Call +966 54 300 0055. Open Sun-Thu 9AM-9PM, Fri-Sat 2PM-9PM.",
  alternates: {
    canonical: `${siteUrl}/contact`,
    languages: { en: `${siteUrl}/contact`, ar: `${siteUrl}/contact?lang=ar` },
  },
  openGraph: {
    title: "Contact NICK — Riyadh Showroom",
    description: "Visit our showroom in Al-Nargis District, Riyadh. Call +966 54 300 0055 or WhatsApp us.",
    url: `${siteUrl}/contact`,
    images: [{ url: "/images/DSC03261.jpg", width: 1200, height: 630, alt: "NICK showroom" }],
  },
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children;
}
