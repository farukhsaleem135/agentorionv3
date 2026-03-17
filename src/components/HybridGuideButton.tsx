import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { useHybridGuide } from "@/contexts/HybridGuideContext";
import { useLocation } from "react-router-dom";
import { getHybridFlow } from "@/data/hybridFlows";

const HybridGuideButton = () => {
  const { resetAndOpen } = useHybridGuide();
  const { pathname } = useLocation();

  const flow = getHybridFlow(pathname);
  if (!flow) return null;

  return (
    <motion.button
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 400, damping: 25, delay: 0.6 }}
      onClick={resetAndOpen}
      className="fixed bottom-[88px] right-4 z-[45] flex items-center gap-2 pl-4 pr-3.5 h-12 rounded-full bg-gradient-cta shadow-glow active:scale-90 transition-transform"
      aria-label="Open guide"
    >
      <span className="text-[13px] font-semibold text-primary-foreground">Guide</span>
      <Sparkles size={18} className="text-primary-foreground" />
    </motion.button>
  );
};

export default HybridGuideButton;
