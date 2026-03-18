import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { User, CreditCard, HelpCircle, LogOut } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { supabase } from "@/integrations/supabase/client";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const ProfileAvatarDropdown = () => {
  const { user, signOut } = useAuth();
  const { tier } = useSubscription();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [showLogout, setShowLogout] = useState(false);
  const [displayName, setDisplayName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("profiles")
      .select("display_name, avatar_url")
      .eq("user_id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (data?.display_name) setDisplayName(data.display_name);
        else if (user.email) setDisplayName(user.email.split("@")[0]);
        if (data?.avatar_url) setAvatarUrl(data.avatar_url);
      });
  }, [user]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    if (open) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const initials = displayName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");

  const tierLabel = tier ? tier.charAt(0).toUpperCase() + tier.slice(1) : "Free";

  const handleLogout = async () => {
    await signOut();
    navigate("/landing");
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-xs shrink-0 overflow-hidden"
        style={{ backgroundColor: "var(--color-orion-blue)" }}
      >
        {avatarUrl ? (
          <img src={avatarUrl} alt={displayName} className="w-full h-full object-cover" />
        ) : (
          initials || "A"
        )}
      </button>

      {open && (
        <div
          className="absolute right-0 top-full mt-2 min-w-[220px] rounded-xl border overflow-hidden z-[100]"
          style={{
            backgroundColor: "#141B2D",
            borderColor: "rgba(45,107,228,0.2)",
            boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
          }}
        >
          {/* Identity block */}
          <div className="px-4 py-3 border-b" style={{ borderColor: "rgba(45,107,228,0.15)" }}>
            <p className="text-white font-bold text-sm truncate">{displayName}</p>
            <p className="text-xs truncate" style={{ color: "#6B7280" }}>
              {user?.email}
            </p>
            <span
              className="inline-block mt-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold text-white"
              style={{ backgroundColor: "var(--color-orion-blue)" }}
            >
              {tierLabel} Plan
            </span>
          </div>

          {/* Menu items */}
          <div className="py-1">
            <DropdownItem icon={User} label="Edit Profile" onClick={() => { setOpen(false); navigate("/settings"); }} />
            <DropdownItem icon={CreditCard} label="Billing & Plan" onClick={() => { setOpen(false); navigate("/settings"); }} />
            <DropdownItem
              icon={HelpCircle}
              label="Help & Support"
              onClick={() => { setOpen(false); window.open("mailto:support@agentorion.ai", "_blank"); }}
            />
            <div className="mx-3 my-1 border-t" style={{ borderColor: "rgba(45,107,228,0.15)" }} />
            <button
              onClick={() => { setOpen(false); setShowLogout(true); }}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-colors hover:bg-white/5"
              style={{ color: "#EF4444" }}
            >
              <LogOut size={18} />
              Log Out
            </button>
          </div>
        </div>
      )}

      <AlertDialog open={showLogout} onOpenChange={setShowLogout}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Log Out of AgentOrion?</AlertDialogTitle>
            <AlertDialogDescription>
              You will be redirected to the home page. Your data and progress are saved.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleLogout}
              className="bg-[#EF4444] hover:bg-[#DC2626] text-white"
            >
              Log Out
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

const DropdownItem = ({ icon: Icon, label, onClick }: { icon: React.ElementType; label: string; onClick: () => void }) => (
  <button
    onClick={onClick}
    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-white/90 transition-colors hover:bg-white/5"
  >
    <Icon size={18} className="text-text-tertiary" />
    {label}
  </button>
);

export default ProfileAvatarDropdown;
