import AEPSHeroSection from "@/component/AEPSHeroSection";
import Header from "@/app/shared/components/layout/Header";
import PremiumFintechFooter from "@/app/shared/components/layout/Footer";
import AEPSInfoSection from "@/component/InfoSection/AEPSInfoSection";
import AEPSBenefitsSection from "@/component/AEPSBenefitsSection";

export default function Page() {
    return <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black">
        <Header />
        <AEPSHeroSection />
        <AEPSInfoSection />
        <AEPSBenefitsSection />
        <PremiumFintechFooter />
    </div>
}