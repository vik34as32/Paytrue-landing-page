import PanCardHeroSection from "@/component/PanCardHeroSection";
import Header from "@/app/shared/components/layout/Header";
import PremiumFintechFooter from "@/app/shared/components/layout/Footer";
import PanCardInfoSection from "@/component/InfoSection/PanCardInfoSection";
import PanCardBenefitsSection from "@/component/PanCardBenefitsSection";


export default function Page() {
  return(
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black">
    <Header/>
    <PanCardHeroSection/>
    <PanCardInfoSection/>
    <PanCardBenefitsSection/>
    <PremiumFintechFooter/>
    </div>
  );
}