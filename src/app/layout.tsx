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
      </head>
      <body
        className={`${inter.variable} ${spaceGrotesk.variable} ${tajawal.variable} antialiased`}
      >
        <LanguageProvider>{children}</LanguageProvider>
      </body>
    </html>
  );
}
