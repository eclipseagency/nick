import Navbar from "@/components/Navbar";
import Booking from "@/components/Booking";
import Footer from "@/components/Footer";

export default function BookingPage() {
  return (
    <main>
      <Navbar />
      <div style={{ paddingTop: 80 }}>
        <Booking />
      </div>
      <Footer />
    </main>
  );
}
