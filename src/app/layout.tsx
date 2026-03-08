import type { Metadata } from "next";
import { Inter, Space_Grotesk, Tajawal } from "next/font/google";
import { LanguageProvider } from "@/i18n/LanguageContext";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

const tajawal = Tajawal({
  variable: "--font-tajawal",
  subsets: ["arabic"],
  weight: ["400", "500", "700", "800"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://nick-fawn.vercel.app"),
  title: "NICK | High Performance Automotive Film",
  description:
    "Premium automotive protection films, nano ceramic coating, thermal insulation, and color wrapping. 27 years of excellence in Saudi Arabia.",
  keywords:
    "PPF, paint protection film, ceramic coating, thermal insulation, car wrapping, Saudi Arabia, automotive protection",
  openGraph: {
    title: "NICK | High Performance Automotive Film",
    description: "Premium automotive protection films, nano ceramic coating, thermal insulation, and color wrapping. 27 years of excellence in Saudi Arabia.",
    url: "https://nick-fawn.vercel.app",
    siteName: "NICK",
    images: [{ url: "/images/DSC03279.jpg", width: 1200, height: 630, alt: "NICK Automotive Protection" }],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "NICK | High Performance Automotive Film",
    description: "Premium automotive protection films. 27 years of excellence in Saudi Arabia.",
    images: ["/images/DSC03279.jpg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" dir="ltr" className="scroll-smooth" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var p=new URLSearchParams(location.search).get("lang");var l=p==="ar"||p==="en"?p:localStorage.getItem("nick-lang");if(l==="ar"){document.documentElement.lang="ar";document.documentElement.dir="rtl"}}catch(e){}})();`,
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@graph": [
                {
                  "@type": "AutoRepair",
                  name: "NICK",
                  description:
                    "High performance automotive protection films. PPF, ceramic coating, thermal insulation, and color wrapping.",
                  url: "https://nick-fawn.vercel.app",
                  image: "https://nick-fawn.vercel.app/images/DSC03279.jpg",
                  telephone: "+966543000055",
                  email: "info@nick.sa",
                  address: {
                    "@type": "PostalAddress",
                    streetAddress: "Anas Ibn Malik Road, Al-Nargis District",
                    addressLocality: "Riyadh",
                    addressCountry: "SA",
                  },
                  geo: {
                    "@type": "GeoCoordinates",
                    latitude: 24.7136,
                    longitude: 46.6753,
                  },
                  foundingDate: "1999",
                  priceRange: "$$$$",
                  openingHoursSpecification: {
                    "@type": "OpeningHoursSpecification",
                    dayOfWeek: [
                      "Sunday",
                      "Monday",
                      "Tuesday",
                      "Wednesday",
                      "Thursday",
                    ],
                    opens: "09:00",
                    closes: "21:00",
                  },
                  aggregateRating: {
                    "@type": "AggregateRating",
                    ratingValue: "4.9",
                    reviewCount: "500",
                  },
                },
                {
                  "@type": "WebSite",
                  name: "NICK",
                  url: "https://nick-fawn.vercel.app",
                },
                {
                  "@type": "Service",
                  name: "Paint Protection Film (PPF)",
                  provider: {
                    "@type": "AutoRepair",
                    name: "NICK",
                  },
                  areaServed: "Saudi Arabia",
                },
                {
                  "@type": "Service",
                  name: "Thermal Insulation (Tint)",
                  provider: {
                    "@type": "AutoRepair",
                    name: "NICK",
                  },
                  areaServed: "Saudi Arabia",
                },
                {
                  "@type": "Service",
                  name: "Nano Ceramic Coating",
                  provider: {
                    "@type": "AutoRepair",
                    name: "NICK",
                  },
                  areaServed: "Saudi Arabia",
                },
                {
                  "@type": "Service",
                  name: "Color Wrapping",
                  provider: {
                    "@type": "AutoRepair",
                    name: "NICK",
                  },
                  areaServed: "Saudi Arabia",
                },
              ],
            }),
          }}
        />
      </head>
      <body
        className={`${inter.variable} ${spaceGrotesk.variable} ${tajawal.variable} antialiased`}
      >
        <LanguageProvider>{children}</LanguageProvider>
      </body>
    </html>
  );
}
