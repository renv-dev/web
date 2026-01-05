import HeroSection from "@/components/landing/hero-section";
import ProblemsSection from "@/components/landing/problems-section";
import CodeSection from "@/components/landing/code-section";
import HowItWorksSection from "@/components/landing/how-it-works-section";
import FeaturesSection from "@/components/landing/features-section";
import PricingSection from "@/components/landing/pricing-section";
import CTASection from "@/components/landing/cta-section";

export default function Home() {
  return (
    <>
      <HeroSection />
      <ProblemsSection />
      <CodeSection />
      <HowItWorksSection />
      <FeaturesSection />
      <PricingSection />
      <CTASection />
    </>
  );
}
