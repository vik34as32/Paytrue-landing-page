import TravelHeroSection from "@/component/TravelHeroSection";
import TravelBenefitsSection from "@/component/TravelBenefitsSection";
import Header from "@/app/shared/components/layout/Header";
import PremiumFintechFooter from "@/app/shared/components/layout/Footer";

export default function TravelPage() {
  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black">
       <Header/> 
      <TravelHeroSection />
      <TravelBenefitsSection />
      <PremiumFintechFooter/>
      </div>
  );
}