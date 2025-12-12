import Image from "next/image";
import Navbar from "./components/layouts/navbar";
import HeroSection from "./components/landings/heroSection";
import FeatureSection from "./components/landings/featureSection";
import Promo from "./components/landings/promo";
import Events from "./components/landings/event";
import CTA from "./components/landings/cta";
import Footer from "./components/layouts/footer"

export default function Page() {
  return (
    <>
      <Navbar />
      <HeroSection />
      <FeatureSection />
      <Promo />
      <Events />
      <CTA />
      <Footer />

    </>
  );
}
