import CMSHeroSection from "@/component/CMSHeroSection";
import Header from "@/app/shared/components/layout/Header";
import PremiumFintechFooter from "@/app/shared/components/layout/Footer";
import CashManagementInfoSection from "@/component/InfoSection/CashManagementInfoSection";
import CashManagementBenefitsSection from "@/component/cashManagementBenefits";

export default function Page() {
    return <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black">
        <Header />
        <CMSHeroSection />
        <CashManagementInfoSection />
        <CashManagementBenefitsSection />
        <PremiumFintechFooter />
    </div>
}