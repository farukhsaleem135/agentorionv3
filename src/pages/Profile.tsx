import MobileShell from "@/components/MobileShell";
import { motion } from "framer-motion";
import { Settings, CreditCard, Bell, Shield, LogOut, ChevronRight, Crown, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface ProfileData {
  display_name: string | null;
  city: string | null;
  license_state: string | null;
  bio: string | null;
  market_area: string | null;
}

const Profile = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { tier } = useSubscription();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ leads: 0, listings: 0, closings: 0 });

  useEffect(() => {
    if (!user) return;
    const fetchProfile = async () => {
      const { data } = await supabase
        .from("profiles")
        .select("display_name, city, license_state, bio, market_area")
        .eq("user_id", user.id)
        .maybeSingle();
      setProfile(data);

      // Fetch real stats
      const [leadsRes, listingsRes] = await Promise.all([
        supabase.from("funnel_leads").select("id", { count: "exact", head: true }),
        supabase.from("listings").select("id", { count: "exact", head: true }),
      ]);
      setStats({
        leads: leadsRes.count ?? 0,
        listings: listingsRes.count ?? 0,
        closings: 0, // No closings table yet
      });
      setLoading(false);
    };
    fetchProfile();
  }, [user]);

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth", { replace: true });
    toast({ title: "Signed out", description: "You've been signed out successfully." });
  };

  const displayName = profile?.display_name || user?.email?.split("@")[0] || "Agent";
  const initials = displayName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");
  const location = [profile?.city, profile?.license_state].filter(Boolean).join(", ");
  const tierLabel = tier ? tier.charAt(0).toUpperCase() + tier.slice(1) : "Free";

  const menuItems = [
    { icon: CreditCard, label: "Subscription", desc: `${tierLabel} Plan`, path: "/billing" },
    { icon: Bell, label: "Notifications", desc: "Push & SMS enabled", path: undefined },
    { icon: Shield, label: "Privacy & Security", desc: "Data encryption active", path: undefined },
    { icon: Settings, label: "Settings", desc: "App preferences", path: "/settings" },
  ];

  if (loading) {
    return (
      <MobileShell>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 size={28} className="animate-spin text-primary" />
        </div>
      </MobileShell>
    );
  }

  return (
    <MobileShell>
      <div className="px-5 pt-6 pb-4">
        <h1 className="font-display text-xl font-bold text-foreground mb-5">Profile</h1>

        {/* Profile Card */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-card rounded-xl p-5 border border-border shadow-card mb-5"
        >
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-gold flex items-center justify-center text-primary-foreground font-display text-xl font-bold shadow-gold">
              {initials || "A"}
            </div>
            <div>
              <h2 className="font-display text-lg font-bold text-foreground">{displayName}</h2>
              {location && <p className="text-sm text-muted-foreground">Licensed Agent · {location}</p>}
              <div className="flex items-center gap-1 mt-1">
                <Crown size={12} className="text-primary" />
                <span className="text-xs font-semibold text-primary">{tierLabel} Member</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 pt-4 border-t border-border">
            <div className="text-center">
              <p className="font-display text-lg font-bold text-foreground">{stats.leads}</p>
              <p className="text-[10px] text-muted-foreground">Active Leads</p>
            </div>
            <div className="text-center">
              <p className="font-display text-lg font-bold text-foreground">{stats.listings}</p>
              <p className="text-[10px] text-muted-foreground">Listings</p>
            </div>
            <div className="text-center">
              <p className="font-display text-lg font-bold text-foreground">{stats.closings}</p>
              <p className="text-[10px] text-muted-foreground">Closings YTD</p>
            </div>
          </div>
        </motion.div>

        {/* Menu Items */}
        <div className="space-y-2">
          {menuItems.map((item, i) => (
            <motion.button
              key={item.label}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              onClick={() => item.path && navigate(item.path)}
              className="w-full flex items-center gap-4 p-4 rounded-xl bg-card border border-border touch-target active:scale-[0.98] transition-transform"
            >
              <div className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center shrink-0">
                <item.icon size={18} className="text-primary" />
              </div>
              <div className="flex-1 text-left">
                <p className="text-sm font-medium text-foreground">{item.label}</p>
                <p className="text-[11px] text-muted-foreground">{item.desc}</p>
              </div>
              <ChevronRight size={16} className="text-muted-foreground" />
            </motion.button>
          ))}
        </div>

        <button
          onClick={handleSignOut}
          className="w-full flex items-center justify-center gap-2 p-4 mt-6 rounded-xl border border-destructive/20 text-destructive text-sm font-medium touch-target active:scale-[0.98] transition-transform"
        >
          <LogOut size={16} />
          Sign Out
        </button>
      </div>
    </MobileShell>
  );
};

export default Profile;
