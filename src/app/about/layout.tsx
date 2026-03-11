import type { Metadata } from "next";

const siteUrl = "https://nick-fawn.vercel.app";

export const metadata: Metadata = {
  title: "About Us — 27 Years of Automotive Protection Excellence",
  description:
    "Learn about NICK's 27-year journey in automotive protection. Own manufacturing facility in Riyadh, Saudi Arabia. From raw materials to finished product — PPF, ceramic coating, thermal insulation.",
  alternates: {
    canonical: `${siteUrl}/about`,
    languages: { en: `${siteUrl}/about`, ar: `${siteUrl}/about?lang=ar` },
  },
  openGraph: {
    title: "About NICK — 27 Years of Automotive Protection",
    description: "Own manufacturing, 50,000+ cars protected, up to 10-year warranty. Discover the NICK story.",
    url: `${siteUrl}/about`,
    images: [{ url: "/images/DSC03261.jpg", width: 1200, height: 630, alt: "NICK workshop and team" }],
  },
};

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return children;
}
