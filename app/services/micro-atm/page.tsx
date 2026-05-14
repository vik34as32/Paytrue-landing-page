import MicroATMHeroSection from "@/component/MicroATMHeroSection";
import Header from "@/app/shared/components/layout/Header";
import PremiumFintechFooter from "@/app/shared/components/layout/Footer";
import MicroAtmInfoBenefitsSection from "@/component/MicroAtmInfoBenefitsSection";


export default function Page() {
  return(
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black">
    <Header/>
    <MicroATMHeroSection/>
    <MicroAtmInfoBenefitsSection/>
    <PremiumFintechFooter/>
    </div>
  );
}