import { useLocation, useNavigate } from "react-router-dom";
import {
  Home, Users, Filter, Radio,
  Rocket, Megaphone, Mail, Zap, BarChart3, Map, PenTool,
  Building2, Mic, UsersRound, FlaskConical, Calendar, Settings
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ScrollArea } from "@/components/ui/scroll-area";

interface NavItem {
  path?: string;
  icon: React.ElementType;
  label: string;
  comingSoon?: boolean;
}

interface NavSection {
  title?: string;
  items: NavItem[];
}

const SECTIONS: NavSection[] = [
  {
    items: [
      { path: "/", icon: Home, label: "Dashboard" },
      { path: "/leads", icon: Users, label: "Leads" },
      { path: "/funnels", icon: Filter, label: "Funnels" },
      { path: "/social-media", icon: Radio, label: "Social Media" },
    ],
  },
  {
    title: "Growth Tools",
    items: [
      { path: "/launch-program", icon: Rocket, label: "Launch Program" },
      { path: "/posting-ads", icon: Megaphone, label: "Posting Ads" },
      { path: "/campaigns", icon: Mail, label: "Campaigns" },
      { path: "/autopilot", icon: Zap, label: "Autopilot" },
    ],
  },
  {
    title: "Intelligence",
    items: [
      { path: "/insights", icon: BarChart3, label: "Insights" },
      { path: "/market-intel", icon: Map, label: "Market Intelligence" },
      { path: "/content", icon: PenTool, label: "Content" },
    ],
  },
  {
    title: "Listings",
    items: [
      { path: "/listings", icon: Building2, label: "Listings" },
    ],
  },
  {
    title: "Coming Soon",
    items: [
      { path: "/voice-agent", icon: Mic, label: "Voice Agent", comingSoon: true },
      { icon: UsersRound, label: "Referral Network", comingSoon: true },
      { icon: FlaskConical, label: "A/B Testing", comingSoon: true },
      { icon: Calendar, label: "Google Calendar", comingSoon: true },
      { icon: Calendar, label: "Outlook Calendar", comingSoon: true },
    ],
  },
  {
    title: "Account",
    items: [
      { path: "/settings", icon: Settings, label: "Settings" },
    ],
  },
];

const DesktopSidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { tier } = useSubscription();
  const [displayName, setDisplayName] = useState("Agent");

  useEffect(() => {
    if (!user) return;
    supabase
      .from("profiles")
      .select("display_name")
      .eq("user_id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (data?.display_name) setDisplayName(data.display_name);
        else if (user.email) setDisplayName(user.email.split("@")[0]);
      });
  }, [user]);

  const isActive = (path: string) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  };

  const tierLabel = tier ? tier.charAt(0).toUpperCase() + tier.slice(1) : "Free";

  return (
    <aside className="hidden lg:flex flex-col w-[240px] shrink-0 h-screen sticky top-0 bg-bg-surface border-r border-border-subtle">
      {/* Logo / brand */}
      <div className="px-5 py-5 flex items-center gap-2">
        <div className="w-8 h-8 rounded-lg bg-orion-blue flex items-center justify-center text-white font-bold text-sm">
          O
        </div>
        <span className="text-text-primary font-bold text-lg tracking-tight">AgentOrion</span>
      </div>

      {/* Nav sections */}
      <ScrollArea className="flex-1 px-3">
        {SECTIONS.map((section, idx) => (
          <div key={section.title ?? idx} className={idx > 0 ? "mt-4" : ""}>
            {section.title && (
              <p className="px-3 pb-1 text-[11px] font-semibold uppercase tracking-wider text-text-tertiary">
                {section.title}
              </p>
            )}
            {section.items.map((item) => {
              const Icon = item.icon;
              const active = item.path ? isActive(item.path) : false;
              return (
                <button
                  key={item.label}
                  disabled={item.comingSoon && !item.path}
                  onClick={() => item.path && navigate(item.path)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] font-medium transition-colors mb-0.5 ${
                    active
                      ? "text-orion-blue bg-orion-blue/10"
                      : "text-text-secondary hover:text-text-primary hover:bg-bg-elevated"
                  } ${item.comingSoon && !item.path ? "opacity-50 cursor-default" : ""}`}
                >
                  <Icon size={16} />
                  <span className="flex-1 text-left truncate">{item.label}</span>
                  {item.comingSoon && (
                    <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground font-semibold leading-tight shrink-0">
                      Soon
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </ScrollArea>

      {/* User profile at bottom */}
      <div className="p-4 border-t border-border-subtle">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-orion-blue/20 flex items-center justify-center text-orion-blue font-bold text-xs">
            {displayName.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-text-primary truncate">{displayName}</p>
            <p className="text-[11px] text-text-tertiary">{tierLabel} Plan</p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default DesktopSidebar;
