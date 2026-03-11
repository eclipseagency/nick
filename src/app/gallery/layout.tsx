import type { Metadata } from "next";

const siteUrl = "https://nick-fawn.vercel.app";

export const metadata: Metadata = {
  title: "Gallery — Our Work in PPF, Tinting & Ceramic",
  description:
    "Browse NICK's portfolio of automotive protection work. PPF installations, ceramic coatings, window tinting, and our manufacturing facility in Riyadh.",
  alternates: {
    canonical: `${siteUrl}/gallery`,
    languages: { en: `${siteUrl}/gallery`, ar: `${siteUrl}/gallery?lang=ar` },
  },
  openGraph: {
    title: "NICK Gallery — From Factory to Finish",
    description: "See our work: PPF, ceramic coating, tinting, and color wrapping on luxury and everyday vehicles.",
    url: `${siteUrl}/gallery`,
    images: [
      { url: "/images/DSC03292.jpg", width: 1200, height: 630, alt: "NICK PPF installation work" },
      { url: "/images/DSC03018.jpg", width: 1200, height: 630, alt: "NICK ceramic coating" },
    ],
  },
};

export default function GalleryLayout({ children }: { children: React.ReactNode }) {
  return children;
}
