import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";
import { Crown, Users, Plus, X, Loader2, ArrowRight, Building2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const TeamSetup = () => {
  const { user } = useAuth();
  const { tier, refreshSubscription } = useSubscription();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [teamName, setTeamName] = useState("");
  const [emails, setEmails] = useState<string[]>([""]);
  const [loading, setLoading] = useState(false);

  const isBrokerage = tier === "brokerage";
  const maxInvites = isBrokerage ? 19 : 4;
  const planLabel = isBrokerage ? "Brokerage" : "Team";

  // If they're not on a team/brokerage plan, redirect
  useEffect(() => {
    if (tier && tier !== "team" && tier !== "brokerage") {
      // Allow a brief grace period for subscription to update
      const timeout = setTimeout(() => {
        if (tier !== "team" && tier !== "brokerage") {
          navigate("/");
        }
      }, 3000);
      return () => clearTimeout(timeout);
    }
  }, [tier, navigate]);

  const addEmailField = () => {
    if (emails.length < maxInvites) {
      setEmails([...emails, ""]);
    }
  };

  const removeEmailField = (index: number) => {
    setEmails(emails.filter((_, i) => i !== index));
  };

  const updateEmail = (index: number, value: string) => {
    const updated = [...emails];
    updated[index] = value;
    setEmails(updated);
  };

  const handleLaunch = async () => {
    if (!user) return;
    setLoading(true);

    try {
      // Save team name to profile
      if (teamName.trim()) {
        await supabase
          .from("profiles")
          .update({ company_name: teamName.trim() })
          .eq("user_id", user.id);
      }

      // Get subscription ID for linking
      const { data: sub } = await supabase
        .from("subscriptions")
        .select("id")
        .eq("user_id", user.id)
        .eq("status", "active")
        .maybeSingle();

      // Invite valid emails
      const validEmails = emails
        .map(e => e.trim().toLowerCase())
        .filter(e => e && e.includes("@") && e !== user.email);

      if (validEmails.length > 0) {
        const invites = validEmails.map(email => ({
          team_owner_id: user.id,
          email,
          role: "agent",
          status: "pending",
          team_subscription_id: sub?.id || null,
        }));

        const { error } = await supabase.from("team_members").insert(invites);
        if (error) {
          console.error("Invite error:", error);
          toast({
            title: "Some invites failed",
            description: error.message,
            variant: "destructive",
          });
        } else {
          toast({
            title: `${validEmails.length} invite${validEmails.length > 1 ? "s" : ""} sent!`,
            description: "Team members will get Pro access when they sign up.",
          });
        }
      }

      await refreshSubscription();
      navigate("/");
    } catch (err) {
      console.error("Team setup error:", err);
      toast({ title: "Setup failed", description: "Please try again.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-lg"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 mb-4">
            {isBrokerage ? (
              <Building2 size={32} className="text-primary" />
            ) : (
              <Crown size={32} className="text-primary" />
            )}
          </div>
          <h1 className="font-display text-2xl font-bold text-foreground mb-2">
            Welcome, {planLabel} Leader! 🎉
          </h1>
          <p className="text-muted-foreground text-sm">
            You're the {planLabel} Leader. Set up your team and invite members to give them Pro-level access.
          </p>
        </div>

        {/* Card */}
        <div className="bg-card border border-border rounded-2xl p-6 shadow-lg">
          {/* Team Leader Badge */}
          <div className="flex items-center gap-3 p-3 rounded-xl bg-primary/5 border border-primary/20 mb-6">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <Sparkles size={18} className="text-primary" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">{planLabel} Leader</p>
              <p className="text-xs text-muted-foreground">{user?.email}</p>
            </div>
          </div>

          {/* Team Name */}
          <div className="mb-6">
            <label className="text-sm font-medium text-foreground mb-2 block">
              {isBrokerage ? "Brokerage Name" : "Team Name"} (optional)
            </label>
            <Input
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              placeholder={isBrokerage ? "e.g. Keller Williams Downtown" : "e.g. Johnson Team"}
              className="bg-secondary"
            />
          </div>

          {/* Invite Members */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-foreground">
                Invite Members
              </label>
              <span className="text-xs text-muted-foreground">
                Up to {maxInvites} members
              </span>
            </div>
            <div className="space-y-2">
              {emails.map((email, i) => (
                <div key={i} className="flex gap-2">
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => updateEmail(i, e.target.value)}
                    placeholder="agent@example.com"
                    className="bg-secondary flex-1"
                  />
                  {emails.length > 1 && (
                    <button
                      onClick={() => removeEmailField(i)}
                      className="p-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                    >
                      <X size={16} />
                    </button>
                  )}
                </div>
              ))}
            </div>
            {emails.length < maxInvites && (
              <button
                onClick={addEmailField}
                className="flex items-center gap-1.5 text-sm text-primary font-medium mt-2 hover:underline"
              >
                <Plus size={14} />
                Add another
              </button>
            )}
            <p className="text-xs text-muted-foreground mt-2">
              Members will receive Pro-level access when they sign up with these emails.
            </p>
          </div>

          {/* Launch Button */}
          <Button
            onClick={handleLaunch}
            disabled={loading}
            className="w-full h-12 text-base font-semibold"
          >
            {loading ? (
              <Loader2 className="animate-spin mr-2" size={18} />
            ) : (
              <ArrowRight className="mr-2" size={18} />
            )}
            {loading ? "Setting up..." : `Launch Your ${planLabel}`}
          </Button>

          <button
            onClick={() => navigate("/")}
            className="w-full text-center text-sm text-muted-foreground mt-3 hover:text-foreground transition-colors"
          >
            Skip for now — I'll invite later
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default TeamSetup;
