import HeroSection from "@/components/landing-sections/HeroSection";
import IntroSection from "@/components/landing-sections/IntroSection";
import ComparisonSection from "@/components/landing-sections/ComparisonSection";
import WhyBillzzySection from "@/components/landing-sections/WhyBillzzySection";
import GoPaperlessSection from "@/components/landing-sections/GoPaperlessSection";
import UseCasesSection from "@/components/landing-sections/UseCasesSection";
import PricingSection from "@/components/landing-sections/PricingSection";
import FAQSection from "@/components/landing-sections/FAQSection";
import TestimonialsSection from "@/components/landing-sections/TestimonialsSection";
import CTASection from "@/components/landing-sections/CTASection";
import Footer from "@/components/landing-sections/Footer";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      <HeroSection />
      <IntroSection />
      <ComparisonSection />
      <WhyBillzzySection />
      <GoPaperlessSection />
      <UseCasesSection />
      <PricingSection />
      <FAQSection />
      <TestimonialsSection />
      <CTASection />
      <Footer />
    </div>
  );
}