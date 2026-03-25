import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import React, { Suspense } from "react";
import { AuthProvider } from "@/contexts/AuthContext";
import { ModeProvider } from "@/contexts/ModeContext";
import { SubscriptionProvider } from "@/contexts/SubscriptionContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { HybridGuideProvider } from "@/contexts/HybridGuideContext";
import UpgradeModal from "@/components/UpgradeModal";
import ProtectedRoute from "@/components/ProtectedRoute";
import { LeadNotificationProvider } from "@/components/LeadNotificationProvider";
import PageLoader from "@/components/PageLoader";

// Lazy-loaded page components
const Index = React.lazy(() => import("./pages/Index"));
const Leads = React.lazy(() => import("./pages/Leads"));
const Listings = React.lazy(() => import("./pages/Listings"));
const Content = React.lazy(() => import("./pages/Content"));
const Insights = React.lazy(() => import("./pages/Insights"));
const Settings = React.lazy(() => import("./pages/Settings"));
const Funnels = React.lazy(() => import("./pages/Funnels"));
const FunnelPublic = React.lazy(() => import("./pages/FunnelPublic"));
const Auth = React.lazy(() => import("./pages/Auth"));
const ContentPortfolio = React.lazy(() => import("./pages/ContentPortfolio"));
const Onboarding = React.lazy(() => import("./pages/Onboarding"));
const NotFound = React.lazy(() => import("./pages/NotFound"));
const LeadDetail = React.lazy(() => import("./pages/LeadDetail"));
const Team = React.lazy(() => import("./pages/Team"));
const BrandBible = React.lazy(() => import("./pages/BrandBible"));
const Campaigns = React.lazy(() => import("./pages/Campaigns"));
const SellerSuite = React.lazy(() => import("./pages/SellerSuite"));
const Integrations = React.lazy(() => import("./pages/Integrations"));
const ResetPassword = React.lazy(() => import("./pages/ResetPassword"));
const Admin = React.lazy(() => import("./pages/Admin"));
const Autopilot = React.lazy(() => import("./pages/Autopilot"));
const FeaturesDoc = React.lazy(() => import("./pages/FeaturesDoc"));
const MarketIntel = React.lazy(() => import("./pages/MarketIntel"));
const MarketPublic = React.lazy(() => import("./pages/MarketPublic"));
const ProductionReport = React.lazy(() => import("./pages/ProductionReport"));
const TeamReport = React.lazy(() => import("./pages/TeamReport"));
const CRMReport = React.lazy(() => import("./pages/CRMReport"));
const Landing = React.lazy(() => import("./pages/Landing"));
const LaunchProgram = React.lazy(() => import("./pages/LaunchProgram"));
const SocialMedia = React.lazy(() => import("./pages/SocialMedia"));
const TeamSetup = React.lazy(() => import("./pages/TeamSetup"));
const VoiceAgentPage = React.lazy(() => import("./pages/VoiceAgentPage"));
const PostingAds = React.lazy(() => import("./pages/PostingAds"));
const Billing = React.lazy(() => import("./pages/Billing"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
    <AuthProvider>
      <ModeProvider>
        <SubscriptionProvider>
        <TooltipProvider>
          <UpgradeModal />
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <LeadNotificationProvider>
            <HybridGuideProvider>
            <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/auth" element={<Auth />} />
              <Route path="/landing" element={<Landing />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="/f/:agentSlug/:funnelSlug" element={<FunnelPublic />} />
              <Route path="/f/:slug" element={<FunnelPublic />} />
              <Route path="/portfolio/:userId" element={<ContentPortfolio />} />
              <Route path="/onboarding" element={<Onboarding />} />
              <Route path="/features-doc" element={<FeaturesDoc />} />
              <Route path="/market/:slug" element={<MarketPublic />} />
              <Route path="/production-report" element={<ProductionReport />} />
              <Route path="/team-report" element={<TeamReport />} />
              <Route path="/crm-report" element={<CRMReport />} />
              <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
              <Route path="/leads" element={<ProtectedRoute><Leads /></ProtectedRoute>} />
              <Route path="/leads/:id" element={<ProtectedRoute><LeadDetail /></ProtectedRoute>} />
              <Route path="/listings" element={<ProtectedRoute><Listings /></ProtectedRoute>} />
              <Route path="/funnels" element={<ProtectedRoute><Funnels /></ProtectedRoute>} />
              <Route path="/content" element={<ProtectedRoute><Content /></ProtectedRoute>} />
              <Route path="/insights" element={<ProtectedRoute><Insights /></ProtectedRoute>} />
              <Route path="/team" element={<ProtectedRoute><Team /></ProtectedRoute>} />
              <Route path="/brand" element={<ProtectedRoute><BrandBible /></ProtectedRoute>} />
              <Route path="/campaigns" element={<ProtectedRoute><Campaigns /></ProtectedRoute>} />
              <Route path="/seller" element={<ProtectedRoute><SellerSuite /></ProtectedRoute>} />
              <Route path="/integrations" element={<ProtectedRoute><Integrations /></ProtectedRoute>} />
              <Route path="/admin" element={<ProtectedRoute><Admin /></ProtectedRoute>} />
              <Route path="/autopilot" element={<ProtectedRoute><Autopilot /></ProtectedRoute>} />
              <Route path="/market-intel" element={<ProtectedRoute><MarketIntel /></ProtectedRoute>} />
              <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
              <Route path="/launch-program" element={<ProtectedRoute><LaunchProgram /></ProtectedRoute>} />
              <Route path="/social-media" element={<ProtectedRoute><SocialMedia /></ProtectedRoute>} />
              <Route path="/team-setup" element={<ProtectedRoute><TeamSetup /></ProtectedRoute>} />
              <Route path="/voice-agent" element={<ProtectedRoute><VoiceAgentPage /></ProtectedRoute>} />
              <Route path="/posting-ads" element={<ProtectedRoute><PostingAds /></ProtectedRoute>} />
              <Route path="/billing" element={<ProtectedRoute><Billing /></ProtectedRoute>} />
              <Route path="/profile" element={<ProtectedRoute><React.lazy(() => import("./pages/Profile")) /></ProtectedRoute>} />
              <Route path="*" element={<NotFound />} />
            </Routes>
            </Suspense>
            </HybridGuideProvider>
            </LeadNotificationProvider>
          </BrowserRouter>
        </TooltipProvider>
        </SubscriptionProvider>
      </ModeProvider>
    </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
