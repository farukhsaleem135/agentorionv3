import MobileShell from "@/components/MobileShell";
import { motion } from "framer-motion";
import { Settings, CreditCard, Bell, Shield, LogOut, ChevronRight, Crown } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

const Profile = () => {
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth", { replace: true });
    toast({ title: "Signed out", description: "You've been signed out successfully." });
  };
  const menuItems = [
    { icon: CreditCard, label: "Subscription", desc: "Pro Plan · $29/mo", action: true },
    { icon: Bell, label: "Notifications", desc: "Push & SMS enabled", action: true },
    { icon: Shield, label: "Privacy & Security", desc: "Data encryption active", action: true },
    { icon: Settings, label: "Settings", desc: "App preferences", action: true },
  ];

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
              AR
            </div>
            <div>
              <h2 className="font-display text-lg font-bold text-foreground">Alex Rivera</h2>
              <p className="text-sm text-muted-foreground">Licensed Agent · Austin, TX</p>
              <div className="flex items-center gap-1 mt-1">
                <Crown size={12} className="text-primary" />
                <span className="text-xs font-semibold text-primary">Pro Member</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 pt-4 border-t border-border">
            <div className="text-center">
              <p className="font-display text-lg font-bold text-foreground">47</p>
              <p className="text-[10px] text-muted-foreground">Active Leads</p>
            </div>
            <div className="text-center">
              <p className="font-display text-lg font-bold text-foreground">8</p>
              <p className="text-[10px] text-muted-foreground">Listings</p>
            </div>
            <div className="text-center">
              <p className="font-display text-lg font-bold text-foreground">12</p>
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
