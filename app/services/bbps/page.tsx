import BBPSHeroSection from "@/component/BBPSHeroSection";
import Header from "@/app/shared/components/layout/Header";
import PremiumFintechFooter from "@/app/shared/components/layout/Footer";
import BBPSInfoSection from "@/component/InfoSection/BBPSInfoSection";
import BBPSBenefitsSection from "@/component/BBPSBenefitsSection";
export default function Page() {
    return <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black">
        <Header />
        <BBPSHeroSection />
        <BBPSInfoSection />
        <BBPSBenefitsSection />
        <PremiumFintechFooter />
    </div>
}