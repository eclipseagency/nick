import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Booking from "@/components/Booking";
import Footer from "@/components/Footer";

const siteUrl = "https://nick-fawn.vercel.app";

export const metadata: Metadata = {
  title: "Book a Service — PPF, Ceramic & Tinting Packages",
  description:
    "Book your automotive protection service online. Choose from PPF, ceramic coating, and thermal insulation packages. Instant pricing for all car sizes. Pay online or via WhatsApp.",
  alternates: {
    canonical: `${siteUrl}/booking`,
    languages: { en: `${siteUrl}/booking`, ar: `${siteUrl}/booking?lang=ar` },
  },
  openGraph: {
    title: "Book a Service — NICK Automotive Protection",
    description: "Choose your vehicle, pick services, book in under a minute. PPF, ceramic, tinting packages with instant pricing.",
    url: `${siteUrl}/booking`,
    images: [{ url: "/images/DSC03279.jpg", width: 1200, height: 630, alt: "Book NICK services" }],
  },
};

export default function BookingPage() {
  return (
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            name: "Book a Service",
            description: "Online booking for automotive protection services. PPF, ceramic coating, thermal insulation.",
            url: `${siteUrl}/booking`,
            mainEntity: { "@id": `${siteUrl}/#business` },
            breadcrumb: {
              "@type": "BreadcrumbList",
              itemListElement: [
                { "@type": "ListItem", position: 1, name: "Home", item: siteUrl },
                { "@type": "ListItem", position: 2, name: "Book a Service", item: `${siteUrl}/booking` },
              ],
            },
          }),
        }}
      />
      <Navbar />
      <div style={{ paddingTop: 80 }}>
        <Booking />
      </div>
      <Footer />
    </main>
  );
}
