import type { Metadata } from "next";

const siteUrl = "https://nick.sa";

export const metadata: Metadata = {
  title: "Services — PPF, Ceramic Coating, Tinting & Wrapping",
  description:
    "Professional automotive protection services: Paint Protection Film (PPF) with 10-year warranty, nano ceramic coating, thermal insulation tinting, and color wrapping. Expert installation in Riyadh.",
  alternates: {
    canonical: `${siteUrl}/services`,
    languages: { en: `${siteUrl}/services`, ar: `${siteUrl}/services?lang=ar`, "x-default": `${siteUrl}/services` },
  },
  openGraph: {
    title: "NICK Services — Complete Automotive Protection",
    description: "PPF, ceramic coating, thermal insulation, color wrapping. Up to 10-year warranty. Professional installation.",
    url: `${siteUrl}/services`,
    siteName: "NICK",
    images: [{ url: `${siteUrl}/images/DSC03279.jpg`, width: 1200, height: 630, alt: "NICK PPF installation" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "NICK Services — Complete Automotive Protection",
    description: "PPF, ceramic coating, thermal insulation, color wrapping. Up to 10-year warranty.",
    images: [`${siteUrl}/images/DSC03279.jpg`],
  },
};

export default function ServicesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
