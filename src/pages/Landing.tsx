import { useEffect } from "react";
import LandingNav from "@/components/landing/LandingNav";
import HeroSection from "@/components/landing/HeroSection";
import TwoAudienceSection from "@/components/landing/TwoAudienceSection";
import ProblemSection from "@/components/landing/ProblemSection";
import SocialProofBar from "@/components/landing/SocialProofBar";
import FeaturesSection from "@/components/landing/FeaturesSection";
import HowItWorks from "@/components/landing/HowItWorks";
import PositioningStatement from "@/components/landing/PositioningStatement";
import TestimonialsSection from "@/components/landing/TestimonialsSection";
import LaunchProgramSection from "@/components/landing/LaunchProgramSection";
import ExperiencedAgentSection from "@/components/landing/ExperiencedAgentSection";
import SocialMediaMasterySection from "@/components/landing/SocialMediaMasterySection";
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
      <TwoAudienceSection />
      <ProblemSection />
      <SocialProofBar />
      <FeaturesSection />
      <HowItWorks />
      <PositioningStatement />
      <TestimonialsSection />
      <LaunchProgramSection />
      <ExperiencedAgentSection />
      <SocialMediaMasterySection />
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
