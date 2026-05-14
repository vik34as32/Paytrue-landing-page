import Header from "../shared/components/layout/Header"
import PremiumFintechFooter from "../shared/components/layout/Footer"
import AboutHeroSection from "@/component/AboutHeroSection"
import AboutPaytrueSection from "@/component/AboutPaytrueSection"
export default function About() {
    return (
        <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black">
            <Header />
            <AboutHeroSection />
            <AboutPaytrueSection />

            <PremiumFintechFooter />

        </div>

    )
}