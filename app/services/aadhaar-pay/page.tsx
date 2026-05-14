import AadhaarPayHeroSection from "@/component/AadhaarPayHeroSection";
import Header from "@/app/shared/components/layout/Header";
import PremiumFintechFooter from "@/app/shared/components/layout/Footer";
import AadhaarPayInfoSection from "@/component/InfoSection/AadhaarPayInfoSection";
import AadhaarPayBenefitsSection from "@/component/AadhaarPayBenefitsSection"

export default function Page() {
    return <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black">
        <Header />
        <AadhaarPayHeroSection />
        <AadhaarPayInfoSection />
        <AadhaarPayBenefitsSection />
        <PremiumFintechFooter />
    </div>
}