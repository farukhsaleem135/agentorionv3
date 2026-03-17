import { useEffect } from "react";
import LandingNav from "@/components/landing/LandingNav";
import HeroSection from "@/components/landing/HeroSection";
import SocialProofBar from "@/components/landing/SocialProofBar";
import FeaturesSection from "@/components/landing/FeaturesSection";
import HowItWorks from "@/components/landing/HowItWorks";
import ModeShowcase from "@/components/landing/ModeShowcase";
import IntegrationsSection from "@/components/landing/IntegrationsSection";
import PricingSection from "@/components/landing/PricingSection";
import WaitlistSection from "@/components/landing/WaitlistSection";
import CTABanner from "@/components/landing/CTABanner";
import LandingFooter from "@/components/landing/LandingFooter";
import ScrollProgress from "@/components/landing/ScrollProgress";
import MobileCTABar from "@/components/landing/MobileCTABar";

const Landing = () => {
  useEffect(() => {
    document.title = "AgentOrion — AI Real Estate Growth Platform";
  }, []);

  return (
    <div className="bg-bg-base min-h-screen scroll-smooth" style={{ transition: "background-color 350ms ease, color 350ms ease" }}>
      <ScrollProgress />
      <LandingNav />
      <HeroSection />
      <SocialProofBar />
      <FeaturesSection />
      <HowItWorks />
      <ModeShowcase />
      <IntegrationsSection />
      <PricingSection />
      <WaitlistSection />
      <CTABanner />
      <LandingFooter />
      <MobileCTABar />
    </div>
  );
};

export default Landing;
