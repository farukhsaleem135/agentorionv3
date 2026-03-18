import { useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Home, Users, Zap, BarChart3, Menu, Building2, PlayCircle, Settings, X, UsersRound, BookOpen, Megaphone, Home as HomeIcon, Link2, Bot, Rocket, Radio, Mic, Globe } from "lucide-react";
import { useState } from "react";

const primaryTabs = [
  { path: "/", icon: Home, label: "Home" },
  { path: "/leads", icon: Users, label: "Leads" },
  { path: "/funnels", icon: Zap, label: "Funnels" },
  { path: "/insights", icon: BarChart3, label: "Insights" },
];

const secondaryTabs = [
  { path: "/launch-program", icon: Rocket, label: "Launch Program" },
  { path: "/social-media", icon: Radio, label: "Social Media" },
  { path: "/posting-ads", icon: Megaphone, label: "Posting Ads" },
  { path: "/market-intel", icon: Globe, label: "Market Intel" },
  { path: "/autopilot", icon: Bot, label: "Autopilot" },
  { path: "/voice-agent", icon: Mic, label: "Voice Agent", comingSoon: true },
  { path: "/campaigns", icon: Megaphone, label: "Campaigns" },
  { path: "/seller", icon: HomeIcon, label: "Seller Suite" },
  { path: "/listings", icon: Building2, label: "Listings" },
  { path: "/content", icon: PlayCircle, label: "Content" },
  { path: "/integrations", icon: Link2, label: "Integrations" },
  { path: "/team", icon: UsersRound, label: "Team" },
  { path: "/brand", icon: BookOpen, label: "Brand" },
  { path: "/settings", icon: Settings, label: "Settings" },
];

const BottomNav = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [showMore, setShowMore] = useState(false);

  const isActive = (path: string) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  };

  const isSecondaryActive = secondaryTabs.some(t => isActive(t.path));

  return (
    <>
      <AnimatePresence>
        {showMore && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[55] bg-background/50 backdrop-blur-sm"
            onClick={() => setShowMore(false)}
          >
            <motion.div
              initial={{ y: 40, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 40, opacity: 0 }}
              transition={{ type: "spring", stiffness: 500, damping: 35 }}
              className="absolute bottom-20 right-4 bg-bg-elevated border border-border-default rounded-2xl p-2 min-w-[160px]"
              style={{ boxShadow: 'var(--shadow-elevated)' }}
              onClick={(e) => e.stopPropagation()}
            >
              {secondaryTabs.map((tab) => {
                const Icon = tab.icon;
                const active = isActive(tab.path);
                return (
                  <button
                    key={tab.path}
                    onClick={() => { navigate(tab.path); setShowMore(false); }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                      active ? "text-orion-blue bg-orion-blue/10" : "text-text-primary hover:bg-bg-surface"
                    }`}
                  >
                    <Icon size={18} />
                    <span className="flex-1 text-left">{tab.label}</span>
                    {'comingSoon' in tab && tab.comingSoon && (
                      <span className="text-[8px] px-1.5 py-0.5 rounded-full bg-muted text-muted-foreground border border-border leading-tight font-medium">Soon</span>
                    )}
                  </button>
                );
              })}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <nav
        className="fixed bottom-0 left-0 right-0 z-50 backdrop-blur-xl safe-bottom bg-bg-overlay border-t border-border-subtle"
        style={{ transition: 'background-color var(--transition-slow)' }}
      >
        <div className="flex items-center justify-around px-2 pt-2 pb-1 max-w-lg mx-auto">
          {primaryTabs.map((tab) => {
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
          <button
            onClick={() => setShowMore(!showMore)}
            className="relative flex flex-col items-center gap-0.5 min-h-[44px] min-w-[48px] px-2 py-1"
          >
            {isSecondaryActive && !showMore && (
              <motion.div
                layoutId="activeTab"
                className="absolute -top-1 w-8 h-0.5 bg-orion-blue rounded-full"
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}
            {showMore ? (
              <X size={20} className="text-orion-blue" />
            ) : (
              <Menu size={20} className={isSecondaryActive ? "text-orion-blue" : "text-text-muted"} />
            )}
            <span className={`text-[10px] font-medium ${showMore || isSecondaryActive ? "text-orion-blue" : "text-text-muted"}`}>
              More
            </span>
          </button>
        </div>
      </nav>
    </>
  );
};

export default BottomNav;
