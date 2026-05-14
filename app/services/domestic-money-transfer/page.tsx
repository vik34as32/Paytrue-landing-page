import DomesticMoneyTransferHero from "@/component/DomesticMoneyTransferHero";
import Header from "@/app/shared/components/layout/Header";
import PremiumFintechFooter from "@/app/shared/components/layout/Footer";
import DomesticMoneyTransferInfoSection from "@/component/InfoSection/DomesticMoneyTransferInfoSection";
import DomesticMoneyTransferBenefitsSection from "@/component/DomesticMoneyTransferBenefitsSection";


export default function Page() {
    return (
        <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black">
            <Header />
            <DomesticMoneyTransferHero />
            <DomesticMoneyTransferInfoSection />
            <DomesticMoneyTransferBenefitsSection />
            <PremiumFintechFooter />
        </div>
    );
}