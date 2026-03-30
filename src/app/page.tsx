import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import Services from "@/components/Services";
import Booking from "@/components/Booking";
import Footer from "@/components/Footer";
import CursorGlow from "@/components/CursorGlow";
import Marquee from "@/components/Marquee";

const siteUrl = "https://nick-fawn.vercel.app";

export default function Home() {
  return (
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: [
              {
                "@type": "Question",
                name: "How long does PPF installation take?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Full body PPF takes 2-3 business days. Front-only takes 1 day.",
                },
              },
              {
                "@type": "Question",
                name: "What warranty do you offer?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Up to 10 years on PPF, 5 years on ceramic coating, 3 years on thermal insulation.",
                },
              },
              {
                "@type": "Question",
                name: "Can PPF be removed without damaging paint?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Yes, our films are designed for safe removal without harming the original paint.",
                },
              },
              {
                "@type": "Question",
                name: "Do you work with all car brands?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Yes, we service all makes and models from sedans to SUVs and luxury vehicles.",
                },
              },
              {
                "@type": "Question",
                name: "How do I maintain my PPF?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Regular washing is sufficient. Avoid abrasive cleaners. We provide detailed care instructions after installation.",
                },
              },
              {
                "@type": "Question",
                name: "Do you offer mobile/on-site installation?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "All installations are performed at our facility in Riyadh to ensure controlled conditions and best results.",
                },
              },
            ],
          }),
        }}
      />
      <CursorGlow />
      <Navbar />
      <Hero />
      <Marquee />
      <Services />
      <Booking />
      <Footer />
    </main>
  );
}
