import { useLocation, useNavigate } from "react-router-dom";
import { Settings } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useSubscription } from "@/contexts/SubscriptionContext";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ScrollArea } from "@/components/ui/scroll-area";
import { SIDEBAR_SECTIONS } from "./navigation/NavData";

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

  const initials = displayName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("");

  const tierLabel = tier ? tier.charAt(0).toUpperCase() + tier.slice(1) : "Free";

  return (
    <aside
      className="hidden lg:flex flex-col w-[240px] shrink-0 h-screen sticky top-0"
      style={{
        backgroundColor: "#0A0E1A",
        borderRight: "1px solid rgba(45,107,228,0.2)",
      }}
    >
      {/* Logo */}
      <div
        className="px-5 py-5 flex items-center gap-2"
        style={{ borderBottom: "1px solid rgba(45,107,228,0.15)" }}
      >
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm"
          style={{ backgroundColor: "var(--color-orion-blue)" }}
        >
          O
        </div>
        <span className="text-white font-bold text-lg tracking-tight">AgentOrion</span>
      </div>

      {/* Nav sections */}
      <ScrollArea className="flex-1 px-3 py-2">
        {SIDEBAR_SECTIONS.map((section, idx) => (
          <div key={section.title ?? idx} className={idx > 0 ? "mt-3" : ""}>
            {section.title && (
              <p
                className="px-3 pb-1 text-[11px] font-semibold uppercase tracking-[0.1em]"
                style={{ color: "#6B7280" }}
              >
                {section.title}
              </p>
            )}
            {section.items.map((item) => {
              const Icon = item.icon;
              const active = item.path ? isActive(item.path) : false;
              const disabled = item.comingSoon && !item.path;
              return (
                <button
                  key={item.label}
                  disabled={!!disabled}
                  onClick={() => item.path && navigate(item.path)}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[13px] font-medium transition-colors mb-0.5"
                  style={{
                    color: active ? "var(--color-orion-blue)" : "#94A3B8",
                    backgroundColor: active ? "rgba(45,107,228,0.1)" : "transparent",
                    borderLeft: active ? "3px solid var(--color-orion-blue)" : "3px solid transparent",
                    opacity: disabled ? 0.5 : 1,
                    cursor: disabled ? "default" : "pointer",
                  }}
                >
                  <Icon size={16} />
                  <span className="flex-1 text-left truncate">{item.label}</span>
                  {item.comingSoon && (
                    <span
                      className="text-[9px] px-1.5 py-0.5 rounded-full font-semibold text-white shrink-0"
                      style={{ backgroundColor: "#475569" }}
                    >
                      Soon
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </ScrollArea>

      {/* Pinned footer */}
      <div
        className="p-4 flex items-center gap-3"
        style={{ borderTop: "1px solid rgba(45,107,228,0.15)" }}
      >
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-xs shrink-0"
          style={{ backgroundColor: "var(--color-orion-blue)" }}
        >
          {initials || "A"}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[13px] font-bold text-white truncate">{displayName}</p>
          <span
            className="inline-block px-1.5 py-0.5 rounded-full text-[10px] font-semibold text-white"
            style={{ backgroundColor: "var(--color-orion-blue)" }}
          >
            {tierLabel}
          </span>
        </div>
        <button
          onClick={() => navigate("/settings")}
          className="p-1.5 rounded-lg transition-colors hover:bg-white/5"
          style={{ color: "#6B7280" }}
        >
          <Settings size={16} />
        </button>
      </div>
    </aside>
  );
};

export default DesktopSidebar;
