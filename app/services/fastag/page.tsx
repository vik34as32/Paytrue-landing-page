import FastagHeroSection from "@/component/FastagHeroSection";
import Header from "@/app/shared/components/layout/Header";
import PremiumFintechFooter from "@/app/shared/components/layout/Footer";
import FastagInfoSection from "@/component/InfoSection/FastagInfoSection";
import FastagBenefitsSection from "@/component/FastagBenefitsSection";

export default function Page() {
  return <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black">
    <Header/>
    <FastagHeroSection/>
    <FastagInfoSection/>
    <FastagBenefitsSection/>
    <PremiumFintechFooter/>
    </div>
}