import type { Metadata } from "next";
import Script from "next/script";
import { Inter, Space_Grotesk, Tajawal } from "next/font/google";
import { LanguageProvider } from "@/i18n/LanguageContext";
import FloatingButtons from "@/components/FloatingButtons";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";
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

const siteUrl = "https://nick.sa";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "NICK | High Performance Automotive Film",
    template: "%s | NICK",
  },
  description:
    "Premium automotive protection films, nano ceramic coating, thermal insulation, and color wrapping. 27 years of excellence in Saudi Arabia.",
  keywords:
    "PPF, paint protection film, ceramic coating, thermal insulation, car wrapping, Saudi Arabia, automotive protection, Riyadh, نيك, حماية السيارات, أفلام حماية, سيراميك, عزل حراري",
  alternates: {
    canonical: siteUrl,
    languages: { "en": siteUrl, "ar": `${siteUrl}?lang=ar` },
  },
  openGraph: {
    title: "NICK | High Performance Automotive Film",
    description: "Premium automotive protection films, nano ceramic coating, thermal insulation, and color wrapping. 27 years of excellence in Saudi Arabia.",
    url: siteUrl,
    siteName: "NICK",
    images: [{ url: "https://nick.sa/images/DSC03279.jpg", width: 1200, height: 630, alt: "NICK Automotive Protection" }],
    locale: "en_US",
    alternateLocale: "ar_SA",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    site: "@nick__saudi",
    title: "NICK | High Performance Automotive Film",
    description: "Premium automotive protection films. 27 years of excellence in Saudi Arabia.",
    images: ["https://nick.sa/images/DSC03279.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 },
  },
  verification: {
    other: {
      "facebook-domain-verification": "5q1b8gmt7dc27631jq9lsyvoc7mp9y",
    },
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
                  "@id": `${siteUrl}/#business`,
                  name: "NICK",
                  alternateName: "NICK High Performance Automotive Film",
                  description: "High performance automotive protection films. PPF, ceramic coating, thermal insulation, and color wrapping. Manufacturer and installer since 1999.",
                  url: siteUrl,
                  logo: `${siteUrl}/images/nick-logo.png`,
                  image: `${siteUrl}/images/DSC03279.jpg`,
                  telephone: "+966543000055",
                  email: "info@nick.sa",
                  address: {
                    "@type": "PostalAddress",
                    streetAddress: "Anas Ibn Malik Road, Al-Nargis District",
                    addressLocality: "Riyadh",
                    addressRegion: "Riyadh",
                    postalCode: "13327",
                    addressCountry: "SA",
                  },
                  geo: {
                    "@type": "GeoCoordinates",
                    latitude: 24.7136,
                    longitude: 46.6753,
                  },
                  foundingDate: "1999",
                  priceRange: "$$$$",
                  currenciesAccepted: "SAR",
                  paymentAccepted: "Cash, Credit Card, Tabby, Tamara",
                  areaServed: {
                    "@type": "Country",
                    name: "Saudi Arabia",
                  },
                  sameAs: [
                    "https://www.instagram.com/nick_saudi",
                    "https://x.com/nick__saudi",
                    "https://www.tiktok.com/@nick_saudi",
                    "https://nick.sa",
                  ],
                  openingHoursSpecification: [
                    {
                      "@type": "OpeningHoursSpecification",
                      dayOfWeek: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday"],
                      opens: "09:00",
                      closes: "21:00",
                    },
                    {
                      "@type": "OpeningHoursSpecification",
                      dayOfWeek: ["Friday", "Saturday"],
                      opens: "14:00",
                      closes: "21:00",
                    },
                  ],
                  aggregateRating: {
                    "@type": "AggregateRating",
                    ratingValue: "4.9",
                    bestRating: "5",
                    worstRating: "1",
                    reviewCount: "500",
                  },
                  hasOfferCatalog: {
                    "@type": "OfferCatalog",
                    name: "Automotive Protection Services",
                    itemListElement: [
                      {
                        "@type": "OfferCatalog",
                        name: "Paint Protection Film (PPF)",
                        itemListElement: [
                          { "@type": "Offer", itemOffered: { "@type": "Service", name: "Full Body Clear PPF 8.5mm" }, priceSpecification: { "@type": "PriceSpecification", priceCurrency: "SAR", minPrice: "14000", maxPrice: "15500" } },
                          { "@type": "Offer", itemOffered: { "@type": "Service", name: "Full Body Clear PPF 7.5mm" }, priceSpecification: { "@type": "PriceSpecification", priceCurrency: "SAR", minPrice: "12000", maxPrice: "14500" } },
                          { "@type": "Offer", itemOffered: { "@type": "Service", name: "Full Front Protection" }, priceSpecification: { "@type": "PriceSpecification", priceCurrency: "SAR", minPrice: "3660", maxPrice: "5600" } },
                        ],
                      },
                      {
                        "@type": "OfferCatalog",
                        name: "Thermal Insulation (Tint)",
                        itemListElement: [
                          { "@type": "Offer", itemOffered: { "@type": "Service", name: "Full Thermal Insulation" }, priceSpecification: { "@type": "PriceSpecification", priceCurrency: "SAR", minPrice: "2400", maxPrice: "2800" } },
                        ],
                      },
                      {
                        "@type": "OfferCatalog",
                        name: "Nano Ceramic Coating",
                        itemListElement: [
                          { "@type": "Offer", itemOffered: { "@type": "Service", name: "Exterior Ceramic 2 Layers — 3yr" }, priceSpecification: { "@type": "PriceSpecification", priceCurrency: "SAR", minPrice: "2250", maxPrice: "2850" } },
                        ],
                      },
                    ],
                  },
                },
                {
                  "@type": "WebSite",
                  "@id": `${siteUrl}/#website`,
                  name: "NICK",
                  url: siteUrl,
                  publisher: { "@id": `${siteUrl}/#business` },
                  inLanguage: ["en", "ar"],
                },
              ],
            }),
          }}
        />
      </head>
      <body
        className={`${inter.variable} ${spaceGrotesk.variable} ${tajawal.variable} antialiased`}
      >
        <LanguageProvider>
          {children}
          <FloatingButtons />
        </LanguageProvider>
        <Analytics />
        <SpeedInsights />
        <Script id="meta-pixel" strategy="afterInteractive">
          {`!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','1507067291067879');fbq('track','PageView');`}
        </Script>
        <noscript>
          <img
            height="1"
            width="1"
            style={{ display: "none" }}
            src="https://www.facebook.com/tr?id=1507067291067879&ev=PageView&noscript=1"
            alt=""
          />
        </noscript>
      </body>
    </html>
  );
}
