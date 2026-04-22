import type { Metadata } from "next";

const siteUrl = "https://nick.sa";

export const metadata: Metadata = {
  title: "Book a Service — PPF, Ceramic, Tinting & Wrapping",
  description:
    "Book your automotive protection service online. Choose from PPF, ceramic coating, thermal insulation tinting, and color wrapping. Instant confirmation.",
  alternates: {
    canonical: `${siteUrl}/booking`,
    languages: { en: `${siteUrl}/booking`, ar: `${siteUrl}/booking?lang=ar`, "x-default": `${siteUrl}/booking` },
  },
  openGraph: {
    title: "Book a Service — NICK Automotive Protection",
    description: "Book PPF, ceramic coating, tinting or wrapping online. Choose your services, pick a date, get instant confirmation.",
    url: `${siteUrl}/booking`,
    siteName: "NICK",
    images: [{ url: `${siteUrl}/images/DSC03279.jpg`, width: 1200, height: 630, alt: "NICK booking — automotive protection services" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Book a Service — NICK Automotive Protection",
    description: "Book PPF, ceramic coating, tinting or wrapping online. Instant confirmation.",
    images: [`${siteUrl}/images/DSC03279.jpg`],
  },
};

export default function BookingLayout({ children }: { children: React.ReactNode }) {
  return children;
}
