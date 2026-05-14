import RechargeHeroSection from "@/component/RechargeHeroSection";
import Header from "@/app/shared/components/layout/Header";
import PremiumFintechFooter from "@/app/shared/components/layout/Footer";
import RechargeInfoSection from "@/component/InfoSection/RechargeInfoSection";
import PrepaidRechargeBenefitsSection from "@/component/PrepaidRechargeBenefitsSection";

export default function Page() {
  return <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black">
    <Header/>
    <RechargeHeroSection/>
    <RechargeInfoSection/>
    <PrepaidRechargeBenefitsSection/>
    <PremiumFintechFooter/>
    </div>
}