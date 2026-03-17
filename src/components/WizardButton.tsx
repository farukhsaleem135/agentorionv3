import { motion } from "framer-motion";
import { HelpCircle } from "lucide-react";
import { useWizard } from "@/contexts/WizardContext";
import { useLocation } from "react-router-dom";
import { getWizardFlow } from "@/data/wizardContent";
import { getHybridFlow } from "@/data/hybridFlows";

const WizardButton = () => {
  const { resetAndOpen } = useWizard();
  const { pathname } = useLocation();

  const flow = getWizardFlow(pathname);
  const hybridFlow = getHybridFlow(pathname);

  // Hide if no wizard flow, or if HybridGuide already covers this route
  if (!flow || hybridFlow) return null;

  return (
    <motion.button
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 400, damping: 25, delay: 0.6 }}
      onClick={resetAndOpen}
      className="fixed bottom-[88px] right-4 z-[45] w-12 h-12 rounded-full bg-gradient-cta shadow-glow flex items-center justify-center active:scale-90 transition-transform"
      aria-label="Open guide"
    >
      <HelpCircle size={22} className="text-primary-foreground" />
    </motion.button>
  );
};

export default WizardButton;
