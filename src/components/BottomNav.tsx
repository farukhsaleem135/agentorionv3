import { useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { LayoutGrid, X, ChevronRight } from "lucide-react";
import { useState } from "react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { PRIMARY_TABS, DRAWER_SECTIONS } from "./navigation/NavData";

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
      {/* More drawer */}
      <AnimatePresence>
        {showMore && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[55]"
            style={{ backgroundColor: "rgba(0,0,0,0.6)" }}
            onClick={() => setShowMore(false)}
          >
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", stiffness: 400, damping: 36 }}
              className="absolute bottom-[68px] left-0 right-0 rounded-t-2xl overflow-hidden"
              style={{
                backgroundColor: "#0A0E1A",
                borderTop: "1px solid rgba(45,107,228,0.2)",
                maxHeight: "75vh",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Drawer header */}
              <div
                className="flex items-center justify-between px-5 py-3"
                style={{ borderBottom: "1px solid rgba(45,107,228,0.15)" }}
              >
                <span className="text-white font-bold text-base tracking-tight">AgentOrion</span>
                <button onClick={() => setShowMore(false)} className="p-1 text-text-tertiary hover:text-white">
                  <X size={20} />
                </button>
              </div>

              <ScrollArea className="max-h-[calc(75vh-52px)]">
                <div className="pb-4">
                  {DRAWER_SECTIONS.map((section) => (
                    <div key={section.title}>
                      <p
                        className="px-5 pt-4 pb-1 text-[11px] font-semibold uppercase tracking-[0.1em]"
                        style={{ color: "#6B7280" }}
                      >
                        {section.title}
                      </p>
                      {section.items.map((item) => {
                        const Icon = item.icon;
                        const active = item.path ? isActive(item.path) : false;
                        const disabled = item.comingSoon && !item.path;
                        return (
                          <button
                            key={item.label}
                            disabled={!!disabled}
                            onClick={() => {
                              if (item.path) navigate(item.path);
                              setShowMore(false);
                            }}
                            className="w-full flex items-center gap-3 px-5 min-h-[48px] text-sm font-medium transition-colors"
                            style={{
                              color: active ? "var(--color-orion-blue)" : "#F0F2F8",
                              borderLeft: active ? "3px solid var(--color-orion-blue)" : "3px solid transparent",
                              opacity: disabled ? 0.5 : 1,
                            }}
                          >
                            <Icon size={20} />
                            <span className="flex-1 text-left">{item.label}</span>
                            {item.comingSoon && (
                              <span
                                className="text-[10px] px-2 py-0.5 rounded-full font-semibold text-white shrink-0"
                                style={{ backgroundColor: "#475569" }}
                              >
                                Soon
                              </span>
                            )}
                            {!item.comingSoon && item.path && (
                              <ChevronRight size={16} className="text-text-muted shrink-0" />
                            )}
                          </button>
                        );
                      })}
                      <div className="mx-5 border-t my-1" style={{ borderColor: "rgba(45,107,228,0.1)" }} />
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom nav — exactly 5 items */}
      <nav
        className="fixed bottom-0 left-0 right-0 z-50 lg:hidden"
        style={{
          backgroundColor: "#0A0E1A",
          borderTop: "1px solid rgba(45,107,228,0.2)",
        }}
      >
        <div className="flex items-center justify-around px-2 pt-2 pb-1 max-w-lg mx-auto safe-bottom">
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
                    className="absolute -top-1 w-8 h-0.5 rounded-full"
                    style={{ backgroundColor: "var(--color-orion-blue)" }}
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                <Icon
                  size={20}
                  style={{ color: active ? "var(--color-orion-blue)" : "#475569" }}
                />
                <span
                  className="text-[10px] font-medium"
                  style={{ color: active ? "var(--color-orion-blue)" : "#475569" }}
                >
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
                className="absolute -top-1 w-8 h-0.5 rounded-full"
                style={{ backgroundColor: "var(--color-orion-blue)" }}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}
            {showMore ? (
              <X size={20} style={{ color: "var(--color-orion-blue)" }} />
            ) : (
              <LayoutGrid
                size={20}
                style={{ color: isDrawerActive ? "var(--color-orion-blue)" : "#475569" }}
              />
            )}
            <span
              className="text-[10px] font-medium"
              style={{
                color: showMore || isDrawerActive ? "var(--color-orion-blue)" : "#475569",
              }}
            >
              More
            </span>
          </button>
        </div>
      </nav>
    </>
  );
};

export default BottomNav;
