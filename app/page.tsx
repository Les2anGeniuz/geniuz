import Image from "next/image";
import Navbar from "./components/navbar";
import HeroSection from "./components/heroSection";
import FeatureSection from "./components/featureSection";
import Promo from "./components/promo";
import Events from "./components/event";
import CTA from "./components/cta";
import Footer from "./components/footer"

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
