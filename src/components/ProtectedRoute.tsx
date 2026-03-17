import { useAuth } from "@/contexts/AuthContext";
import { Navigate, useLocation } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface ProfileCheck {
  onboarding_complete: boolean | null;
  agent_type: string | null;
}

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, loading } = useAuth();
  const location = useLocation();
  const [checkingOnboarding, setCheckingOnboarding] = useState(true);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);
  const [needsAgentType, setNeedsAgentType] = useState(false);

  useEffect(() => {
    if (!user) { setCheckingOnboarding(false); return; }
    supabase
      .from("profiles")
      .select("onboarding_complete, agent_type")
      .eq("user_id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        const profile = data as ProfileCheck | null;
        const onboardingDone = !!profile?.onboarding_complete;
        const hasAgentType = !!profile?.agent_type;
        
        setNeedsOnboarding(!onboardingDone);
        setNeedsAgentType(!hasAgentType);
        setCheckingOnboarding(false);
      });
  }, [user]);

  if (loading || checkingOnboarding) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 size={28} className="animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/landing" replace />;
  }

  if (needsOnboarding) {
    return <Navigate to="/onboarding" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;

// Export a hook for checking agent type selection need
export const useNeedsAgentType = () => {
  const { user } = useAuth();
  const [needsAgentType, setNeedsAgentType] = useState(false);
  const [agentType, setAgentType] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    supabase
      .from("profiles")
      .select("agent_type")
      .eq("user_id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        const at = (data as any)?.agent_type ?? null;
        setAgentType(at);
        setNeedsAgentType(!at);
        setLoading(false);
      });
  }, [user]);

  return { needsAgentType, agentType, loading };
};
