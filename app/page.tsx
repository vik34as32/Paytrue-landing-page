import Header from "@/app/shared/components/layout/Header";
import Footer from "@/app/shared/components/layout/Footer";
import HeroSection from "@/component/HeroSection";
import ServicesSection from "@/component/ServicesSection";
import AboutPaytrueSection from "@/component/AboutPaytrueSection";
import PremiumServicesSection from "@/component/PremiumServicesSection";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-[#f4f6fb]">
      <Header />
      <HeroSection />
      <ServicesSection />
      <AboutPaytrueSection />
      <PremiumServicesSection />
      <Footer />
    </div>
  );
}
