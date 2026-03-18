import { useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Home, Users, Filter, Radio, LayoutGrid, X,
  Rocket, Megaphone, Mail, Zap, BarChart3, Map, PenTool,
  Building2, Mic, UsersRound, FlaskConical, Calendar, Settings
} from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

/* ── Exactly 5 bottom-nav items — hardcoded, never change ── */
const PRIMARY_TABS = [
  { path: "/", icon: Home, label: "Dashboard" },
  { path: "/leads", icon: Users, label: "Leads" },
  { path: "/funnels", icon: Filter, label: "Funnels" },
  { path: "/social-media", icon: Radio, label: "Social" },
] as const;

/* ── More drawer sections ── */
interface DrawerItem {
  path?: string;
  icon: React.ElementType;
  label: string;
  comingSoon?: boolean;
}

interface DrawerSection {
  title: string;
  items: DrawerItem[];
}

const DRAWER_SECTIONS: DrawerSection[] = [
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

const BottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [showMore, setShowMore] = useState(false);

  const isActive = (path: string) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  };

  const isDrawerActive = DRAWER_SECTIONS.some((s) =>
    s.items.some((i) => i.path && isActive(i.path))
  );

  return (
    <>
      {/* ── More drawer ── */}
      <AnimatePresence>
        {showMore && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[55] bg-background/60 backdrop-blur-sm"
            onClick={() => setShowMore(false)}
          >
            <motion.div
              initial={{ y: 60, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 60, opacity: 0 }}
              transition={{ type: "spring", stiffness: 420, damping: 32 }}
              className="absolute bottom-20 left-4 right-4 bg-bg-elevated border border-border-default rounded-2xl overflow-hidden"
              style={{ boxShadow: "var(--shadow-elevated)", maxHeight: "70vh" }}
              onClick={(e) => e.stopPropagation()}
            >
              <ScrollArea className="max-h-[70vh]">
                <div className="p-2">
                  {DRAWER_SECTIONS.map((section) => (
                    <div key={section.title}>
                      <p className="px-4 pt-3 pb-1 text-[11px] font-semibold uppercase tracking-wider text-text-tertiary">
                        {section.title}
                      </p>
                      {section.items.map((item) => {
                        const Icon = item.icon;
                        const active = item.path ? isActive(item.path) : false;
                        return (
                          <button
                            key={item.label}
                            disabled={item.comingSoon && !item.path}
                            onClick={() => {
                              if (item.path) navigate(item.path);
                              setShowMore(false);
                            }}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                              active
                                ? "text-orion-blue bg-orion-blue/10"
                                : "text-text-primary hover:bg-bg-surface"
                            } ${item.comingSoon && !item.path ? "opacity-50 cursor-default" : ""}`}
                          >
                            <Icon size={18} />
                            <span className="flex-1 text-left">{item.label}</span>
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
                </div>
              </ScrollArea>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Bottom navigation — exactly 5 items ── */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-50 backdrop-blur-xl safe-bottom bg-bg-overlay border-t border-border-subtle"
        style={{ transition: "background-color var(--transition-slow)" }}
      >
        <div className="flex items-center justify-around px-2 pt-2 pb-1 max-w-lg mx-auto">
          {PRIMARY_TABS.map((tab) => {
            const active = isActive(tab.path);
            const Icon = tab.icon;
            return (
              <button
                key={tab.path}
                onClick={() => navigate(tab.path)}
                className="relative flex flex-col items-center gap-0.5 min-h-[44px] min-w-[48px] px-2 py-1"
              >
                {active && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute -top-1 w-8 h-0.5 bg-orion-blue rounded-full"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                <Icon size={20} className={active ? "text-orion-blue" : "text-text-muted"} />
                <span className={`text-[10px] font-medium ${active ? "text-orion-blue" : "text-text-muted"}`}>
                  {tab.label}
                </span>
              </button>
            );
          })}

          {/* 5th item: More */}
          <button
            onClick={() => setShowMore(!showMore)}
            className="relative flex flex-col items-center gap-0.5 min-h-[44px] min-w-[48px] px-2 py-1"
          >
            {isDrawerActive && !showMore && (
              <motion.div
                layoutId="activeTab"
                className="absolute -top-1 w-8 h-0.5 bg-orion-blue rounded-full"
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}
            {showMore ? (
              <X size={20} className="text-orion-blue" />
            ) : (
              <LayoutGrid size={20} className={isDrawerActive ? "text-orion-blue" : "text-text-muted"} />
            )}
            <span className={`text-[10px] font-medium ${showMore || isDrawerActive ? "text-orion-blue" : "text-text-muted"}`}>
              More
            </span>
          </button>
        </div>
      </nav>
    </>
  );
};

export default BottomNav;
