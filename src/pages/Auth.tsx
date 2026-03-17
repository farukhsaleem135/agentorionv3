import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2, Mail, Lock, User, ArrowRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useCheckout } from "@/hooks/useCheckout";

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [loading, setLoading] = useState(false);
  const [showForgot, setShowForgot] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user } = useAuth();
  const { toast } = useToast();
  const { startCheckout } = useCheckout();

  const pendingPlan = searchParams.get("plan");

  useEffect(() => {
    if (user) {
      if (pendingPlan && ["growth", "pro", "team", "brokerage"].includes(pendingPlan)) {
        // User just signed in with a plan intent — trigger checkout
        startCheckout(pendingPlan);
      } else {
        navigate("/", { replace: true });
      }
    }
  }, [user, navigate, pendingPlan, startCheckout]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        // Navigation is handled by the useEffect watching `user` state
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: window.location.origin,
            data: { display_name: displayName },
          },
        });
        if (error) throw error;
        toast({
          title: "Check your email",
          description: "We've sent you a confirmation link to verify your account.",
        });
      }
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message || "Something went wrong",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-surface flex items-start justify-center px-6 py-8 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm"
      >
        <div className="text-center mb-8">
          <h1 className="wordmark wordmark-splash mb-2 justify-center">
            <span className="wordmark-agent">AGENT</span>
            <span className="wordmark-orion">ORION</span>
          </h1>
          <p className="text-sm text-muted-foreground">
            {isLogin ? "Welcome back" : "Create your account"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          {!isLogin && (
            <div className="relative">
              <User size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Display name"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                required={!isLogin}
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-secondary text-foreground text-sm placeholder:text-muted-foreground border border-border focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
          )}
          <div className="relative">
            <Mail size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-secondary text-foreground text-sm placeholder:text-muted-foreground border border-border focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
          <div className="relative">
            <Lock size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-secondary text-foreground text-sm placeholder:text-muted-foreground border border-border focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-gradient-cta text-primary-foreground text-sm font-semibold shadow-glow active:scale-[0.98] transition-transform disabled:opacity-50"
          >
            {loading ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <>
                {isLogin ? "Sign In" : "Create Account"}
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        {isLogin && (
          <button
            type="button"
            onClick={() => setShowForgot(true)}
            className="block mx-auto text-xs text-muted-foreground hover:text-primary mt-4 transition-colors"
          >
            Forgot your password?
          </button>
        )}

        <p className="text-center text-xs text-muted-foreground mt-4">
          {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-primary font-semibold hover:underline"
          >
            {isLogin ? "Sign Up" : "Sign In"}
          </button>
        </p>

        {/* Forgot Password Modal */}
        {showForgot && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 p-4 rounded-xl bg-card border border-border"
          >
            <h3 className="text-sm font-semibold text-foreground mb-2">Reset Password</h3>
            <p className="text-xs text-muted-foreground mb-3">Enter your email and we'll send a reset link.</p>
            <form onSubmit={async (e) => {
              e.preventDefault();
              setLoading(true);
              try {
                const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
                  redirectTo: `${window.location.origin}/reset-password`,
                });
                if (error) throw error;
                toast({ title: "Check your email", description: "We've sent you a password reset link." });
                setShowForgot(false);
              } catch (err: any) {
                toast({ title: "Error", description: err.message, variant: "destructive" });
              } finally {
                setLoading(false);
              }
            }}>
              <div className="relative mb-3">
                <Mail size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="email"
                  placeholder="Email address"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  required
                  className="w-full pl-10 pr-4 py-3 rounded-xl bg-secondary text-foreground text-sm placeholder:text-muted-foreground border border-border focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
              <div className="flex gap-2">
                <button type="button" onClick={() => setShowForgot(false)} className="flex-1 py-2.5 rounded-xl border border-border text-sm text-muted-foreground">Cancel</button>
                <button type="submit" disabled={loading} className="flex-1 py-2.5 rounded-xl bg-gradient-cta text-primary-foreground text-sm font-semibold disabled:opacity-50">
                  {loading ? <Loader2 size={14} className="animate-spin mx-auto" /> : "Send Link"}
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default Auth;
