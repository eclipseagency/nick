import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import About from "@/components/About";
import Services from "@/components/Services";
import Gallery from "@/components/Gallery";
import Booking from "@/components/Booking";
import WhyNick from "@/components/WhyNick";
import Testimonials from "@/components/Testimonials";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import CursorGlow from "@/components/CursorGlow";
import FloatingButtons from "@/components/FloatingButtons";

export default function Home() {
  return (
    <main>
      <CursorGlow />
      <FloatingButtons />
      <Navbar />
      <Hero />
      <About />
      <Services />
      <Gallery />
      <Booking />
      <WhyNick />
      <Testimonials />
      <Contact />
      <Footer />
    </main>
  );
}
